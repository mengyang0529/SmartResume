#!/bin/bash

# LaTeX compilation script with security restrictions
# Usage: ./compile.sh <input.tex> <output.pdf>

set -e

INPUT_FILE="$1"
OUTPUT_FILE="$2"
WORK_DIR="/tmp/latex_compile_$$"
TIMEOUT="${MAX_COMPILE_TIME:-30}"

# Create temporary working directory
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

# Copy input file to working directory
cp "$INPUT_FILE" ./input.tex

# Security: Check for potentially dangerous commands
DANGEROUS_PATTERNS=("\\write18" "\\input{|" "\\include{|" "\\openin" "\\openout" "\\read" "\\write")
for pattern in "${DANGEROUS_PATTERNS[@]}"; do
    if grep -q "$pattern" ./input.tex; then
        echo "ERROR: Potentially dangerous LaTeX command found: $pattern" >&2
        exit 1
    fi
done

# Run xelatex with security restrictions
timeout "$TIMEOUT" xelatex \
    -interaction=nonstopmode \
    -halt-on-error \
    -no-shell-escape \
    -file-line-error \
    ./input.tex > compile.log 2>&1

# Check if compilation succeeded
if [ $? -eq 0 ] && [ -f "input.pdf" ]; then
    # Move output to desired location
    mv input.pdf "$OUTPUT_FILE"

    # Clean up intermediate files (optional)
    rm -f input.aux input.log input.out input.toc input.lof input.lot

    echo "SUCCESS: PDF generated at $OUTPUT_FILE"
    exit 0
else
    # Log compilation errors
    echo "ERROR: LaTeX compilation failed" >&2
    cat compile.log >&2
    exit 1
fi

# Cleanup
cd /
rm -rf "$WORK_DIR"