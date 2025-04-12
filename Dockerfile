FROM ubuntu:22.04

# Set noninteractive installation to avoid prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies and utilities
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    ca-certificates \
    perl \
    fontconfig \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -ms /bin/bash appuser
USER appuser
WORKDIR /home/appuser

# Install nvm, Node.js and npm
ENV NVM_DIR=/home/appuser/.nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash \
    && . "$NVM_DIR/nvm.sh" \
    && nvm install 22.13.1 \
    && nvm alias default 22.13.1 \
    && nvm use default

# Add nvm to path for subsequent commands
ENV PATH="/home/appuser/.nvm/versions/node/v22.13.1/bin:${PATH}"

# Verify Node.js and npm installation
RUN node -v && npm -v

# Switch back to root for TeXLive installation
USER root

# Install TeXLive using the installer script instead of apt
# This avoids the hanging issue with apt's texlive-full
WORKDIR /tmp
RUN wget https://mirror.ctan.org/systems/texlive/tlnet/install-tl-unx.tar.gz \
    && tar -xzf install-tl-unx.tar.gz \
    && cd install-tl-* \
    && echo "selected_scheme scheme-full" > texlive.profile \
    && echo "option_doc 0" >> texlive.profile \
    && echo "option_src 0" >> texlive.profile \
    && ./install-tl --profile=texlive.profile \
    && cd .. \
    && rm -rf install-tl-*

# Add TeXLive binaries to PATH
ENV PATH="/usr/local/texlive/2023/bin/x86_64-linux:${PATH}"

# Switch back to appuser for container execution
USER appuser
WORKDIR /home/appuser

# Setup shell to properly load nvm
RUN echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc \
    && echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc

CMD ["/bin/bash"]