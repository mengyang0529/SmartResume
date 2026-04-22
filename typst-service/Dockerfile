FROM ubuntu:24.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    git \
    unzip \
    xz-utils \
    fontconfig \
    python3 \
    python3-pip \
    python3-flask \
    python3-flask-cors \
    python3-requests \
    fonts-roboto \
    fonts-font-awesome \
    && rm -rf /var/lib/apt/lists/*

# Install Typst CLI (v0.14.2)
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
        TYPST_ARCH="x86_64-unknown-linux-musl"; \
    elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then \
        TYPST_ARCH="aarch64-unknown-linux-musl"; \
    else \
        echo "Unsupported architecture: $ARCH"; exit 1; \
    fi && \
    wget -q -O /tmp/typst.tar.xz \
    https://github.com/typst/typst/releases/download/v0.14.2/typst-${TYPST_ARCH}.tar.xz \
    && tar -xJf /tmp/typst.tar.xz -C /tmp \
    && mv /tmp/typst-${TYPST_ARCH}/typst /usr/local/bin/typst \
    && chmod +x /usr/local/bin/typst \
    && rm -rf /tmp/typst.tar.xz /tmp/typst-${TYPST_ARCH}

# Verify typst installation
RUN typst --version

# Install Source Sans Pro from Adobe
RUN wget -q -O /tmp/source-sans-pro.zip \
    https://github.com/adobe-fonts/source-sans/releases/download/2.040R-ro/1.090R-it/source-sans-pro-2.040R-ro-1.090R-it.zip \
    && unzip -q /tmp/source-sans-pro.zip -d /tmp/source-sans-pro \
    && mkdir -p /usr/local/share/fonts/truetype/adobe/source-sans-pro \
    && find /tmp/source-sans-pro -type f -name "*.otf" -exec cp {} /usr/local/share/fonts/truetype/adobe/source-sans-pro/ \; \
    && rm -rf /tmp/source-sans-pro /tmp/source-sans-pro.zip

# Install Source Sans 3 from Adobe
RUN wget -q -O /tmp/source-sans-3.zip \
    https://github.com/adobe-fonts/source-sans/releases/download/3.052R/TTF-source-sans-3.052R.zip \
    && unzip -q /tmp/source-sans-3.zip -d /tmp/source-sans-3 \
    && mkdir -p /usr/local/share/fonts/truetype/adobe/source-sans-3 \
    && find /tmp/source-sans-3 -type f -name "*.ttf" -exec cp {} /usr/local/share/fonts/truetype/adobe/source-sans-3/ \; \
    && rm -rf /tmp/source-sans-3 /tmp/source-sans-3.zip

# Install LXGW Neo XiHei (CJK font)
RUN wget -q -O /tmp/LXGWNeoXiHei.ttf \
    https://github.com/lxgw/LxgwNeoXiHei/releases/download/v1.242/LXGWNeoXiHei.ttf \
    && mkdir -p /usr/local/share/fonts/truetype/lxgw \
    && cp /tmp/LXGWNeoXiHei.ttf /usr/local/share/fonts/truetype/lxgw/ \
    && rm -f /tmp/LXGWNeoXiHei.ttf

# Update font cache
RUN fc-cache -fv

# Install Python dependencies
RUN python3 -m pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple \
    && python3 -m pip install --timeout=100 --break-system-packages waitress

# Pre-download Typst packages to avoid runtime network requests
RUN git clone --depth 1 https://github.com/typst/packages.git /tmp/typst-packages \
    && mkdir -p /root/.local/share/typst/packages/preview/fontawesome \
    && cp -r /tmp/typst-packages/packages/preview/fontawesome/0.6.0 \
       /root/.local/share/typst/packages/preview/fontawesome/0.6.0 \
    && mkdir -p /root/.local/share/typst/packages/preview/linguify \
    && cp -r /tmp/typst-packages/packages/preview/linguify/0.5.0 \
       /root/.local/share/typst/packages/preview/linguify/0.5.0 \
    && rm -rf /tmp/typst-packages

# Create working directories
RUN mkdir -p /app /templates/awesome-cv /cache /output
WORKDIR /app

# Copy templates
COPY templates/ /app/templates/

# Copy compilation service files
COPY compile.sh /app/
COPY server.py /app/

# Make scripts executable
RUN chmod +x /app/compile.sh

# Expose port
EXPOSE 5050

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5050/health || exit 1

# Run the Typst compilation server
CMD ["python3", "server.py"]
