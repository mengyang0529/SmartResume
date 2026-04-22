FROM texlive/texlive:latest

# Install required fonts (Roboto, Source Sans Pro, Font Awesome)
RUN apt-get update && apt-get install -y \
    wget \
    fontconfig \
    unzip \
    curl \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install required fonts
RUN apt-get update && apt-get install -y \
    fonts-roboto \
    fonts-font-awesome \
    && rm -rf /var/lib/apt/lists/*

# Manually install Source Sans 3 from GitHub
RUN wget -q -O /tmp/source-sans-3.zip https://github.com/adobe-fonts/source-sans/releases/download/3.052R/TTF-source-sans-3.052R.zip \
    && unzip -q /tmp/source-sans-3.zip -d /tmp/source-sans-3 \
    && mkdir -p /usr/local/share/fonts/truetype/adobe/source-sans-3 \
    && find /tmp/source-sans-3 -type f -name "*.ttf" -exec cp {} /usr/local/share/fonts/truetype/adobe/source-sans-3/ \; \
    && rm -rf /tmp/source-sans-3 /tmp/source-sans-3.zip

# Update font cache
RUN fc-cache -fv

# Install Python dependencies for the compilation service
RUN python3 -m pip install --upgrade pip setuptools wheel --break-system-packages \
    && python3 -m pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple \
    && python3 -m pip install --timeout=100 --break-system-packages flask flask-cors waitress

# Create working directories
RUN mkdir -p /app /templates /cache /output
WORKDIR /app

# Copy LaTeX templates
COPY templates/ /templates/

# Copy LaTeX compilation scripts
COPY compile.sh /app/
COPY server.py /app/

# Make scripts executable
RUN chmod +x /app/compile.sh

# Expose port
EXPOSE 5050

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5050/health || exit 1

# Run the LaTeX compilation server
CMD ["python3", "server.py"]