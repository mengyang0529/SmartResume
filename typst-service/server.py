#!/usr/bin/env python3
"""
Typst Compilation Service
Exposes a REST API for compiling Typst documents to PDF
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
CACHE_DIR = Path(os.getenv("CACHE_DIR", "/tmp/typst-cache"))
CACHE_ENABLED = os.getenv("CACHE_ENABLED", "true").lower() == "true"
MAX_COMPILE_TIME = int(os.getenv("MAX_COMPILE_TIME", "30"))

# Ensure cache directory exists
if CACHE_ENABLED:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)


def get_cache_key(typst_content):
    """Generate cache key from Typst content"""
    return hashlib.sha256(typst_content.encode()).hexdigest()


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


def log(msg):
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}", flush=True)


import requests
from pathlib import Path

def compile_typst(typst_content, cache_key=None):
    """
    Compile Typst content to PDF
    Returns path to generated PDF file
    """
    log(f"Compiling Typst content (length: {len(typst_content)})")
    # Create temporary directory
    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir_path = Path(tmpdir)

        # 1. Scan for image URLs and download them
        # Pattern: image("http...") or image('http...')
        image_urls = re.findall(r'image\s*\(\s*["\'](https?://[^"\']+)["\']', typst_content)
        
        local_image_map = {}
        for i, url in enumerate(image_urls):
            try:
                log(f"Downloading image: {url}")
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    # Determine extension
                    ext = ".png"
                    if "image/jpeg" in response.headers.get("Content-Type", ""):
                        ext = ".jpg"
                    elif "image/svg+xml" in response.headers.get("Content-Type", ""):
                        ext = ".svg"
                    
                    local_img_path = tmpdir_path / f"img_{i}{ext}"
                    local_img_path.write_bytes(response.content)
                    local_image_map[url] = str(local_img_path)
                    log(f"Image downloaded to: {local_img_path}")
            except Exception as e:
                log(f"Failed to download image {url}: {e}")

        # 2. Replace URLs with local paths in Typst content
        for url, local_path in local_image_map.items():
            typst_content = typst_content.replace(url, local_path)

        # Write Typst content to file
        typ_file = tmpdir_path / "document.typ"
        typ_file.write_text(typst_content)

        # Output PDF path
        pdf_file = tmpdir_path / "document.pdf"

        # Prepare compile command
        compile_script = Path(__file__).parent / "compile.sh"
        cmd = [str(compile_script), str(typ_file), str(pdf_file)]

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
            log(f"Compilation finished in {compile_time:.2f}s (Exit Code: {result.returncode})")

            if result.returncode == 0 and pdf_file.exists():
                # Cache the result immediately while the temp file still exists
                if cache_key:
                    cache_pdf(cache_key, pdf_file)
                return True, compile_time, None
            else:
                error_msg = result.stderr or result.stdout or "Unknown compilation error"
                log(f"Compilation FAILED: {error_msg[:200]}...")
                return False, compile_time, error_msg

        except subprocess.TimeoutExpired:
            log(f"Compilation TIMEOUT after {MAX_COMPILE_TIME}s")
            return False, MAX_COMPILE_TIME, f"Compilation timed out after {MAX_COMPILE_TIME} seconds"
        except Exception as e:
            log(f"Compilation ERROR: {str(e)}")
            return False, 0, f"Compilation failed: {str(e)}"


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "typst"}), 200


@app.route('/compile', methods=['POST'])
def compile_endpoint():
    """Compile Typst to PDF"""
    try:
        data = request.get_json()
        if not data or 'typst' not in data:
            return jsonify({"error": "Missing 'typst' field in request body"}), 400

        typst_content = data['typst']
        log(f"Received /compile request")

        # Validate input
        if not typst_content.strip():
            return jsonify({"error": "Empty Typst content"}), 400

        # Check cache first
        cache_key = get_cache_key(typst_content)
        log(f"Generated cache_key: {cache_key}")
        cached_pdf = get_cached_pdf(cache_key)

        if cached_pdf:
            log(f"Cache HIT for key: {cache_key}")
            return jsonify({
                "status": "success",
                "message": "PDF retrieved from cache",
                "cache_hit": True,
                "cache_key": cache_key
            }), 200

        log(f"Cache MISS for key: {cache_key}. Starting compilation...")

        # Compile Typst (cache_pdf is now called inside compile_typst)
        success, compile_time, error = compile_typst(typst_content, cache_key)

        if not success:
            return jsonify({
                "status": "error",
                "message": "Compilation failed",
                "error": error,
                "compile_time": compile_time
            }), 500

        return jsonify({
            "status": "success",
            "message": "PDF generated successfully",
            "cache_hit": False,
            "cache_key": cache_key,
            "compile_time": compile_time
        }), 200

    except Exception as e:
        log(f"INTERNAL SERVER ERROR: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Internal server error",
            "error": str(e)
        }), 500


@app.route('/download/<cache_key>', methods=['GET'])
def download_pdf(cache_key):
    """Download cached PDF"""
    log(f"Received /download request for key: {cache_key}")
    if not CACHE_ENABLED:
        log(f"Download FAILED: Cache not enabled")
        return jsonify({"error": "Cache not enabled"}), 404

    # Validate cache key format
    if not re.match(r'^[a-f0-9]{64}$', cache_key):
        log(f"Download FAILED: Invalid cache key format: {cache_key}")
        return jsonify({"error": "Invalid cache key format"}), 400

    cache_file = CACHE_DIR / f"{cache_key}.pdf"
    if not cache_file.exists():
        log(f"Download FAILED: PDF NOT FOUND for key: {cache_key}")
        return jsonify({"error": "PDF not found in cache"}), 404

    log(f"Download SUCCESS for key: {cache_key}")
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
    print(f"Starting Typst compilation service on port 5050")
    print(f"Cache enabled: {CACHE_ENABLED}")
    print(f"Max compile time: {MAX_COMPILE_TIME}s")

    serve(app, host='0.0.0.0', port=5050)
