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

# Set TEXINPUTS to include the templates directory
export TEXINPUTS=".:/templates:"

# Security: Check for potentially dangerous commands
DANGEROUS_PATTERNS=("\\write18" "\\input{|" "\\include{|" "\\openin" "\\openout" "\\read" "\\write")
for pattern in "${DANGEROUS_PATTERNS[@]}"; do
    if grep -q "$pattern" ./input.tex; then
        echo "ERROR: Potentially dangerous LaTeX command found: $pattern" >&2
        exit 1
    fi
done

# Run xelatex with security restrictions
set +e
timeout "$TIMEOUT" xelatex \
    -interaction=nonstopmode \
    -halt-on-error \
    -no-shell-escape \
    -file-line-error \
    ./input.tex > compile.log 2>&1
EXIT_CODE=$?
set -e

# Check if compilation succeeded
if [ $EXIT_CODE -eq 0 ] && [ -f "input.pdf" ]; then
    # Move output to desired location
    mv input.pdf "$OUTPUT_FILE"

    # Clean up intermediate files
    rm -f input.aux input.log input.out input.toc input.lof input.lot

    echo "SUCCESS: PDF generated at $OUTPUT_FILE"
    # Cleanup working directory
    cd /
    rm -rf "$WORK_DIR"
    exit 0
else
    # Log compilation errors
    echo "ERROR: LaTeX compilation failed (Exit Code: $EXIT_CODE)" >&2
    if [ -f "compile.log" ]; then
        cat compile.log >&2
    else
        echo "ERROR: compile.log not found" >&2
    fi
    # Don't cleanup on failure to allow investigation if needed (optional)
    # but here we should probably cleanup eventually to avoid disk full
    cd /
    rm -rf "$WORK_DIR"
    exit 1
fi