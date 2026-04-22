#!/bin/bash

# Typst compilation script
# Usage: ./compile.sh <input.typ> <output.pdf>

set -e

INPUT_FILE="$1"
OUTPUT_FILE="$2"
WORK_DIR="/tmp/typst_compile_$$"
TIMEOUT="${MAX_COMPILE_TIME:-30}"

# Create temporary working directory
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

# Copy input file to working directory
cp "$INPUT_FILE" ./input.typ

# Run typst compile with timeout
set +e
timeout "$TIMEOUT" typst compile \
    --font-path /usr/local/share/fonts \
    ./input.typ "$OUTPUT_FILE" > compile.log 2>&1
EXIT_CODE=$?
set -e

# Check if compilation succeeded
if [ $EXIT_CODE -eq 0 ] && [ -f "$OUTPUT_FILE" ]; then
    echo "SUCCESS: PDF generated at $OUTPUT_FILE"
    # Cleanup working directory
    cd /
    rm -rf "$WORK_DIR"
    exit 0
else
    # Log compilation errors
    echo "ERROR: Typst compilation failed (Exit Code: $EXIT_CODE)" >&2
    if [ -f "compile.log" ]; then
        cat compile.log >&2
    else
        echo "ERROR: compile.log not found" >&2
    fi
    # Cleanup working directory
    cd /
    rm -rf "$WORK_DIR"
    exit 1
fi
