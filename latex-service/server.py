#!/usr/bin/env python3
"""
LaTeX Compilation Service
Exposes a REST API for compiling LaTeX documents to PDF
"""

import os
import re
import tempfile
import hashlib
import json
import subprocess
import time
from pathlib import Path
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from waitress import serve

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
CACHE_DIR = Path(os.getenv("CACHE_DIR", "/cache"))
CACHE_ENABLED = os.getenv("CACHE_ENABLED", "true").lower() == "true"
MAX_COMPILE_TIME = int(os.getenv("MAX_COMPILE_TIME", "30"))

# Ensure cache directory exists
if CACHE_ENABLED:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

def get_cache_key(latex_content):
    """Generate cache key from LaTeX content"""
    return hashlib.sha256(latex_content.encode()).hexdigest()

def get_cached_pdf(cache_key):
    """Check if PDF is cached and return path if exists"""
    if not CACHE_ENABLED:
        return None

    cache_file = CACHE_DIR / f"{cache_key}.pdf"
    if cache_file.exists():
        # Update access time for LRU cache management
        cache_file.touch()
        return cache_file
    return None

def cache_pdf(cache_key, pdf_path):
    """Cache compiled PDF"""
    if not CACHE_ENABLED:
        return

    cache_file = CACHE_DIR / f"{cache_key}.pdf"
    if pdf_path.exists():
        # Copy to cache
        import shutil
        shutil.copy2(pdf_path, cache_file)

def compile_latex(latex_content):
    """
    Compile LaTeX content to PDF
    Returns path to generated PDF file
    """
    # Create temporary directory
    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir_path = Path(tmpdir)

        # Write LaTeX content to file
        tex_file = tmpdir_path / "document.tex"
        tex_file.write_text(latex_content)

        # Output PDF path
        pdf_file = tmpdir_path / "document.pdf"

        # Prepare compile command
        compile_script = Path("/app/compile.sh")
        cmd = [str(compile_script), str(tex_file), str(pdf_file)]

        # Set environment for security
        env = os.environ.copy()
        env["MAX_COMPILE_TIME"] = str(MAX_COMPILE_TIME)

        # Run compilation
        start_time = time.time()
        try:
            result = subprocess.run(
                cmd,
                env=env,
                cwd=tmpdir,
                capture_output=True,
                text=True,
                timeout=MAX_COMPILE_TIME + 5  # Add buffer
            )
            compile_time = time.time() - start_time

            if result.returncode == 0 and pdf_file.exists():
                return pdf_file, compile_time, None
            else:
                error_msg = result.stderr or "Unknown compilation error"
                return None, compile_time, error_msg

        except subprocess.TimeoutExpired:
            return None, MAX_COMPILE_TIME, f"Compilation timed out after {MAX_COMPILE_TIME} seconds"
        except Exception as e:
            return None, 0, f"Compilation failed: {str(e)}"

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "latex-compilation",
        "cache_enabled": CACHE_ENABLED,
        "cache_size": len(list(CACHE_DIR.glob("*.pdf"))) if CACHE_ENABLED else 0
    })

@app.route('/compile', methods=['POST'])
def compile_endpoint():
    """Compile LaTeX to PDF"""
    try:
        data = request.get_json()
        if not data or 'latex' not in data:
            return jsonify({"error": "Missing 'latex' field in request body"}), 400

        latex_content = data['latex']

        # Validate input
        if not latex_content.strip():
            return jsonify({"error": "Empty LaTeX content"}), 400

        if len(latex_content) > 1000000:  # 1MB limit
            return jsonify({"error": "LaTeX content too large (max 1MB)"}), 400

        # Check cache first
        cache_key = get_cache_key(latex_content)
        cached_pdf = get_cached_pdf(cache_key)

        if cached_pdf:
            return jsonify({
                "status": "success",
                "message": "PDF retrieved from cache",
                "cache_hit": True,
                "cache_key": cache_key
            }), 200

        # Compile LaTeX
        pdf_file, compile_time, error = compile_latex(latex_content)

        if error:
            return jsonify({
                "status": "error",
                "message": "Compilation failed",
                "error": error,
                "compile_time": compile_time
            }), 500

        # Cache the result
        cache_pdf(cache_key, pdf_file)

        return jsonify({
            "status": "success",
            "message": "PDF generated successfully",
            "cache_hit": False,
            "cache_key": cache_key,
            "compile_time": compile_time
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Internal server error",
            "error": str(e)
        }), 500

@app.route('/download/<cache_key>', methods=['GET'])
def download_pdf(cache_key):
    """Download cached PDF"""
    if not CACHE_ENABLED:
        return jsonify({"error": "Cache not enabled"}), 404

    # Validate cache key format
    if not re.match(r'^[a-f0-9]{64}$', cache_key):
        return jsonify({"error": "Invalid cache key format"}), 400

    cache_file = CACHE_DIR / f"{cache_key}.pdf"
    if not cache_file.exists():
        return jsonify({"error": "PDF not found in cache"}), 404

    return send_file(
        cache_file,
        as_attachment=True,
        download_name=f"resume_{cache_key[:8]}.pdf",
        mimetype='application/pdf'
    )

@app.route('/cache/info', methods=['GET'])
def cache_info():
    """Get cache information"""
    if not CACHE_ENABLED:
        return jsonify({"cache_enabled": False})

    cache_files = list(CACHE_DIR.glob("*.pdf"))
    total_size = sum(f.stat().st_size for f in cache_files)

    return jsonify({
        "cache_enabled": True,
        "file_count": len(cache_files),
        "total_size_bytes": total_size,
        "total_size_mb": round(total_size / (1024 * 1024), 2)
    })

@app.route('/cache/clear', methods=['POST'])
def clear_cache():
    """Clear all cached PDFs (admin endpoint)"""
    if not CACHE_ENABLED:
        return jsonify({"error": "Cache not enabled"}), 400

    cache_files = list(CACHE_DIR.glob("*.pdf"))
    files_deleted = 0
    total_freed = 0

    for cache_file in cache_files:
        try:
            file_size = cache_file.stat().st_size
            cache_file.unlink()
            files_deleted += 1
            total_freed += file_size
        except Exception as e:
            app.logger.error(f"Failed to delete cache file {cache_file}: {e}")

    return jsonify({
        "status": "success",
        "message": f"Cleared {files_deleted} files",
        "files_deleted": files_deleted,
        "space_freed_bytes": total_freed,
        "space_freed_mb": round(total_freed / (1024 * 1024), 2)
    })

if __name__ == '__main__':
    # Production server
    print(f"Starting LaTeX compilation service on port 5050")
    print(f"Cache enabled: {CACHE_ENABLED}")
    print(f"Max compile time: {MAX_COMPILE_TIME}s")

    serve(app, host='0.0.0.0', port=5050)