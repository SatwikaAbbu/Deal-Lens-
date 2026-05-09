from dotenv import load_dotenv
load_dotenv()  # Must be first — loads .env before any service module reads os.getenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from routers.analyse import router
from routers.dashboard import router as dashboard_router
import os

app = FastAPI(title="DealLens API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for ngrok testing
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(dashboard_router)

@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}

# Mount the built frontend static files
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.isdir(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Serve the specific file if it exists (e.g. favicon)
        requested_file = os.path.join(frontend_dist, full_path)
        if os.path.isfile(requested_file):
            return FileResponse(requested_file)
        # Otherwise, fall back to index.html for React Router
        return FileResponse(os.path.join(frontend_dist, "index.html"))
