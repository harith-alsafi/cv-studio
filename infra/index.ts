import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as fs from "fs";
import * as path from "path";

// Configuration
const config = new pulumi.Config();
const instanceType = config.get("instanceType") || "t3.medium";
const keyName = config.get("keyName") || "cv-studio.pem"; // Your key pair name
const region = aws.config.region || "us-east-1";
const projectName = config.get("projectName") || "cvstudio";
const domainName = config.get("domainName") || "cvstudio.ai";
const repositoryUrl = config.get("repositoryUrl") || "https://github.com/harith-alsafi/cv-studio";
const emailAddress = config.get("emailAddress") || "harithsami01@gmail.com";
const mongoDbPort = 27017;
const sshPort = 22;
const httpPort = 80;
const httpsPort = 443;
const appPort = 3000; // The port your NextJS app will run on

// Determine the project root directory (assumes your Pulumi code is in a subfolder)
const projectRootDir = path.join(__dirname, "..");

// Load package.json to get dependency information (used if no repository URL is provided)
const packageJsonPath = path.join(projectRootDir, "package.json");
let packageJsonData;
try {
    packageJsonData = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    console.log("Successfully loaded package.json from:", packageJsonPath);
} catch (error) {
    console.warn(`Could not find package.json file at ${packageJsonPath}. Using default setup script.`);
    packageJsonData = { dependencies: {}, devDependencies: {} };
}

// Update the path to point to the SSH directory for the public key
const sshDirectory = "C:\\Users\\Harit\\.ssh";  // Adjust to your actual SSH directory
const publicKeyPath = path.join(sshDirectory, keyName.replace(".pem", "") + ".pub"); // Adjust this path to your SSH key

let publicKey: string;
try {
    publicKey = fs.readFileSync(publicKeyPath, "utf8");
    console.log("Successfully loaded public key from:", publicKeyPath);
} catch (error) {
    console.warn(`Could not find public key file at ${publicKeyPath}. Make sure it exists.`);
    throw new Error(`Public key file not found at ${publicKeyPath}`);
}

// Create a new key pair
const keyPair = new aws.ec2.KeyPair(`${projectName}-keypair`, {
    keyName: keyName.replace(".pem", ""),
    publicKey: publicKey,
    tags: {
        Name: `${projectName}-keypair`,
    },
});

// Get default VPC and subnets information
const vpc = aws.ec2.getVpcOutput({ default: true });
const subnets = vpc.id.apply(vpcId => 
    aws.ec2.getSubnetsOutput({
        filters: [
            {
                name: "vpc-id",
                values: [vpcId],
            },
        ],
    })
);

// Create a security group for the ALB
const albSecurityGroup = new aws.ec2.SecurityGroup(`${projectName}-alb-sg`, {
    description: "Security group for the Application Load Balancer",
    ingress: [
        // HTTP access
        {
            protocol: "tcp",
            fromPort: httpPort,
            toPort: httpPort,
            cidrBlocks: ["0.0.0.0/0"],
        },
        // HTTPS access
        {
            protocol: "tcp",
            fromPort: httpsPort,
            toPort: httpsPort,
            cidrBlocks: ["0.0.0.0/0"],
        },
    ],
    egress: [
        // Allow all outbound traffic
        {
            protocol: "-1",
            fromPort: 0,
            toPort: 0,
            cidrBlocks: ["0.0.0.0/0"],
        },
    ],
    tags: {
        Name: `${projectName}-alb-security-group`,
    },
});

// Create a security group for the EC2 instance
const instanceSecurityGroup = new aws.ec2.SecurityGroup(`${projectName}-instance-sg`, {
    description: "Security group for NextJS application with MongoDB",
    ingress: [
        // SSH access
        {
            protocol: "tcp",
            fromPort: sshPort,
            toPort: sshPort,
            cidrBlocks: ["0.0.0.0/0"], // Consider restricting this to your IP for better security
        },
        // Allow traffic from ALB to the application port
        {
            protocol: "tcp",
            fromPort: appPort,
            toPort: appPort,
            securityGroups: [albSecurityGroup.id],
        },
    ],
    egress: [
        // Allow all outbound traffic
        {
            protocol: "-1",
            fromPort: 0,
            toPort: 0,
            cidrBlocks: ["0.0.0.0/0"],
        },
    ],
    tags: {
        Name: `${projectName}-instance-security-group`,
    },
});

// Create an IAM role for the EC2 instance
const role = new aws.iam.Role(`${projectName}-role`, {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Principal: {
                Service: "ec2.amazonaws.com",
            },
            Effect: "Allow",
            Sid: "",
        }],
    }),
});

// Attach policies to the IAM role
const rolePolicyAttachment = new aws.iam.RolePolicyAttachment(`${projectName}-policy-attachment`, {
    role: role.name,
    policyArn: aws.iam.ManagedPolicy.AmazonSSMManagedInstanceCore,
});

const s3PolicyAttachment = new aws.iam.RolePolicyAttachment(`${projectName}-s3-policy-attachment`, {
    role: role.name,
    policyArn: aws.iam.ManagedPolicy.AmazonS3ReadOnlyAccess,
});

const cloudWatchPolicyAttachment = new aws.iam.RolePolicyAttachment(`${projectName}-cloudwatch-policy-attachment`, {
    role: role.name,
    policyArn: aws.iam.ManagedPolicy.CloudWatchAgentServerPolicy,
});

// Create an instance profile for the EC2 instance
const instanceProfile = new aws.iam.InstanceProfile(`${projectName}-instance-profile`, {
    role: role.name,
});

// Create ACM certificate for the domain
const certificate = new aws.acm.Certificate(`${projectName}-certificate`, {
    domainName: domainName,
    validationMethod: "DNS",
    subjectAlternativeNames: [`www.${domainName}`],
    tags: {
        Name: `${projectName}-certificate`,
    },
});

// Export the certificate validation details (for manual DNS validation)
const certificateValidationDomains = certificate.domainValidationOptions.apply(
    options => options.map(option => ({
        name: option.resourceRecordName,
        type: option.resourceRecordType,
        value: option.resourceRecordValue,
    }))
);

// Create a user data script for instance setup without Nginx or Certbot
const userData = pulumi.interpolate `#!/bin/bash
# Update packages
apt-get update
apt-get upgrade -y

# Install Node.js and npm
curl -sL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# Install git
apt-get install -y git

# Create app directory
mkdir -p /opt/${projectName}

# Clone the repository if provided, otherwise create package.json
if [ -n "${repositoryUrl}" ]; then
    echo "Cloning repository: ${repositoryUrl}"
    git clone ${repositoryUrl} /opt/${projectName}
    cd /opt/${projectName}
else
    cd /opt/${projectName}
    # Setup for application deployment without repository
    echo "No repository URL provided. Creating package.json from template."
    cat > /opt/${projectName}/package.json << 'EOL'
${JSON.stringify(packageJsonData, null, 2)}
EOL
fi

# Install dependencies
cd /opt/${projectName}
npm install

# Install PM2 globally
npm install -g pm2

# Setup a simple deployment script
cat > /opt/${projectName}/deploy.sh << 'EOL'
#!/bin/bash
cd /opt/${projectName}
git pull
npm install
npm run build
pm2 restart ${projectName} || pm2 start npm --name "${projectName}" -- start
EOL

chmod +x /opt/${projectName}/deploy.sh

# Setup systemd service for MongoDB (if not created by the package)
cat > /etc/systemd/system/mongod.service << 'EOL'
[Unit]
Description=MongoDB Database Server
After=network.target

[Service]
User=mongodb
Group=mongodb
ExecStart=/usr/bin/mongod --config /etc/mongod.conf
PIDFile=/var/run/mongodb/mongod.pid
Type=forking

[Install]
WantedBy=multi-user.target
EOL

systemctl daemon-reload
systemctl restart mongod
systemctl enable mongod

# Run the application for the first time
cd /opt/${projectName}
npm run build
pm2 start npm --name "${projectName}" -- start
`;

// Launch the EC2 instance
const ami = pulumi.output(aws.ec2.getAmi({
    filters: [
        {
            name: "name",
            values: ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"],
        },
        {
            name: "virtualization-type",
            values: ["hvm"],
        },
    ],
    mostRecent: true,
    owners: ["099720109477"], // Canonical
}));

// Look up existing instance by tag
const instanceTag = `${projectName}-instance`;
const existingInstances = pulumi.output(aws.ec2.getInstances({
    filters: [
        {
            name: "tag:Name",
            values: [instanceTag],
        },
        {
            name: "instance-state-name",
            values: ["running", "stopped", "pending", "stopping"],
        },
    ],
}));

// Create or reuse instance based on lookup results
const instance = existingInstances.apply(instances => {
    if (instances.ids.length > 0) {
        // Reuse existing instance
        console.log(`Reusing existing instance: ${instances.ids[0]}`);
        return new aws.ec2.Instance(instanceTag, {
            ami: ami.id,
            instanceType: instanceType,
            keyName: keyPair.keyName,
            vpcSecurityGroupIds: [instanceSecurityGroup.id],
            iamInstanceProfile: instanceProfile.name,
            tags: {
                Name: instanceTag,
            },
            rootBlockDevice: {
                volumeSize: 30, // GB
                volumeType: "gp3",
            },
        }, { 
            import: instances.ids[0] 
        });
    } else {
        // Create new instance
        console.log("Creating new instance");
        return new aws.ec2.Instance(instanceTag, {
            ami: ami.id,
            instanceType: instanceType,
            keyName: keyPair.keyName,
            vpcSecurityGroupIds: [instanceSecurityGroup.id],
            iamInstanceProfile: instanceProfile.name,
            userData: userData,
            tags: {
                Name: instanceTag,
            },
            rootBlockDevice: {
                volumeSize: 30, // GB
                volumeType: "gp3",
            },
        });
    }
});

// Create a target group for the ALB
const targetGroup = new aws.lb.TargetGroup(`${projectName}-target-group`, {
    port: appPort,
    protocol: "HTTP",
    vpcId: vpc.id,
    targetType: "instance",
    healthCheck: {
        enabled: true,
        path: "/",
        port: appPort.toString(),
        protocol: "HTTP",
        healthyThreshold: 3,
        unhealthyThreshold: 3,
        timeout: 5,
        interval: 30,
        matcher: "200-299",
    },
    tags: {
        Name: `${projectName}-target-group`,
    },
});

// Attach the instance to the target group
const targetGroupAttachment = new aws.lb.TargetGroupAttachment(`${projectName}-tg-attachment`, {
    targetGroupArn: targetGroup.arn,
    targetId: instance.id,
    port: appPort,
});

// Create the ALB
const loadBalancer = new aws.lb.LoadBalancer(`${projectName}-alb`, {
    internal: false,
    loadBalancerType: "application",
    securityGroups: [albSecurityGroup.id],
    subnets: subnets.ids,
    enableDeletionProtection: false, // Set to true for production
    tags: {
        Name: `${projectName}-alb`,
    },
});

// Create HTTP listener (for redirect to HTTPS)
const httpListener = new aws.lb.Listener(`${projectName}-http-listener`, {
    loadBalancerArn: loadBalancer.arn,
    port: httpPort,
    protocol: "HTTP",
    defaultActions: [{
        type: "redirect",
        redirect: {
            port: httpsPort.toString(),
            protocol: "HTTPS",
            statusCode: "HTTP_301",
        },
    }],
});

// Create HTTPS listener (with ACM certificate)
const httpsListener = new aws.lb.Listener(`${projectName}-https-listener`, {
    loadBalancerArn: loadBalancer.arn,
    port: httpsPort,
    protocol: "HTTPS",
    sslPolicy: "ELBSecurityPolicy-2016-08",
    certificateArn: certificate.arn,
    defaultActions: [{
        type: "forward",
        targetGroupArn: targetGroup.arn,
    }],
});

// Helper function to update existing instance
const updateInstance = async () => {
    if (instance) {
        console.log("Executing deployment script on existing instance");
        // You could add remote-exec functionality here if needed
    }
};

// Export important information
export const instanceId = instance.id;
export const instancePrivateIp = instance.privateIp;
export const loadBalancerDnsName = loadBalancer.dnsName;
export const certificateArn = certificate.arn;
export const certificateValidation = certificateValidationDomains;

// Domain setup instructions
export const domainSetupInstructions = pulumi.interpolate`
# Domain Setup Instructions:
1. Create a CNAME record for ${domainName} pointing to ${loadBalancer.dnsName}
2. Create another CNAME record for www.${domainName} pointing to ${loadBalancer.dnsName}
3. To validate your ACM certificate, create the following DNS records:
${certificateValidationDomains.apply(domains => 
    domains.map(domain => 
        `   - ${domain.name} (CNAME) -> ${domain.value}`
    ).join('\n')
)}

# Once your certificate is validated (this can take up to 30 minutes), your site will be available at:
https://${domainName}
https://www.${domainName}
`;

// SSH commands for Windows
export const sshCommand = pulumi.interpolate`ssh -i C:\\Users\\Harit\\.ssh\\${keyName} ubuntu@${instance.privateIp}`;
export const deployCommand = pulumi.interpolate`ssh -i C:\\Users\\Harit\\.ssh\\${keyName} ubuntu@${instance.privateIp} 'cd /opt/${projectName} && ./deploy.sh'`;