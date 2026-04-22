## Development Log (April 22, 2026)

### 1. Fixed PDF Generation and Download Errors

**Issue:** PDF export was failing with "PDF not found" (404) on download, despite a "success" response during generation.

**Key Actions:**
*   **LatexService Fix:** Replaced non-standard LaTeX commands (`\cvexperience`, `\cveducation`, etc.) in `backend/src/services/latex.service.ts` with standard `Awesome-CV` commands (`\cventry`) and proper environments (`cventries`, `cvskills`).
*   **Race Condition in `latex-service`:** Fixed a critical bug in `server.py` where the temporary directory was deleted before the PDF could be copied to the cache. Moved the caching logic inside the `TemporaryDirectory` scope.
*   **Improved Logging:** Enhanced `compile.sh` and `server.py` to capture and return full `xelatex` error logs to the backend for easier debugging.
*   **Health Check Correction:** Fixed the backend `Dockerfile.dev` health check port (5000 -> 5001).

**Result:** PDF generation and caching now work reliably. Documents are successfully compiled and served via the download API.

### 2. Chinese Character (CJK) Support

**Issue:** Hanzi (Chinese characters) were rendering as squares/crosses (missing glyphs).

**Key Actions:**
*   **`xeCJK` Integration:** Modified `classic-professional.cls` (both in backend and latex-service) to include the `xeCJK` package.
*   **Font Selection:** Configured **LXGW Neo XiHei (霞鹜新晰黑)** as the primary CJK font. It provides a clean, modern aesthetic that matches the original Awesome-CV design much better than standard Ming/Song fonts.
*   **Fake Bold Support:** Enabled `AutoFakeBold` in `xeCJK` settings to ensure bold Chinese characters render correctly.
*   **Cache Management:** Implemented a `/cache/clear` endpoint to force re-compilation when template settings or fonts are updated.

**Result:** Full Chinese support is now functional. Chinese resumes render with high-quality, modern typography.

### 3. Current System Status

*   **Frontend:** React application running on port 3000.
*   **Backend:** Node.js API running on port 5001 (Healthy).
*   **LaTeX Service:** Python compilation service running on port 5050.
*   **Infrastructure:** Fully dockerized with persistence for database and LaTeX cache.
