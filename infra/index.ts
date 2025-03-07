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

// Create a new security group for the instance
const securityGroup = new aws.ec2.SecurityGroup(`${projectName}-sg`, {
    description: "Security group for NextJS application with MongoDB",
    ingress: [
        // SSH access
        {
            protocol: "tcp",
            fromPort: sshPort,
            toPort: sshPort,
            cidrBlocks: ["0.0.0.0/0"], // Consider restricting this to your IP for better security
        },
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
        Name: `${projectName}-security-group`,
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

// Create a user data script for instance setup with domain support
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

# Setup Nginx as reverse proxy with domain support
apt-get install -y nginx

# Install Certbot for SSL
apt-get install -y certbot python3-certbot-nginx

# Configure Nginx for the domain
cat > /etc/nginx/sites-available/default << 'EOL'
server {
    listen 80;
    server_name ${domainName} www.${domainName};

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

systemctl restart nginx

# Run the application for the first time
cd /opt/${projectName}
npm run build
pm2 start npm --name "${projectName}" -- start

# Automatically run certbot after instance is up (no longer commented out)
certbot --nginx -d ${domainName} -d www.${domainName} --non-interactive --agree-tos --email ${emailAddress}
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

const instance = new aws.ec2.Instance(`${projectName}-instance`, {
    ami: ami.id,
    instanceType: instanceType,
    keyName: keyPair.keyName, // Use the key pair name directly from the resource
    vpcSecurityGroupIds: [securityGroup.id],
    iamInstanceProfile: instanceProfile.name,
    userData: userData,
    tags: {
        Name: `${projectName}-instance`,
    },
    rootBlockDevice: {
        volumeSize: 30, // GB
        volumeType: "gp3",
    },
});

// Create an Elastic IP for the instance (recommended for production domains)
const eip = new aws.ec2.Eip(`${projectName}-eip`, {
    instance: instance.id,
    tags: {
        Name: `${projectName}-eip`,
    },
});

// Export the instance's public IP and DNS name
export const instancePublicIp = eip.publicIp;
export const instancePublicDns = instance.publicDns;
export const elasticIp = eip.publicIp;
export const domainSetupInstructions = pulumi.interpolate`
# Domain Setup Instructions:
1. Create an A record for ${domainName} pointing to ${eip.publicIp}
2. Create another A record for www.${domainName} pointing to ${eip.publicIp}
3. SSL certificate will be automatically set up. If it fails, SSH into your instance and run:
   certbot --nginx -d ${domainName} -d www.${domainName} --non-interactive --agree-tos --email ${emailAddress}
`;

// SSH commands for Windows
export const sshCommand = pulumi.interpolate`ssh -i C:\\Users\\Harit\\.ssh\\${keyName} ubuntu@${eip.publicIp}`;
export const deployCommand = pulumi.interpolate`ssh -i C:\\Users\\Harit\\.ssh\\${keyName} ubuntu@${eip.publicIp} 'cd /opt/${projectName} && ./deploy.sh'`;