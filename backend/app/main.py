import os
import uuid
import asyncio
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

from app.services.audit_engine import run_audit

load_dotenv()

# In-memory store for MVP (swap for DB later)
audits: dict[str, dict] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Install playwright browsers on startup if needed
    yield


app = FastAPI(title="LaunchReady API", version="0.1.0", lifespan=lifespan)

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3001,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AuditRequest(BaseModel):
    url: HttpUrl


class AuditResponse(BaseModel):
    id: str


@app.post("/api/audits", response_model=AuditResponse)
async def create_audit(req: AuditRequest):
    audit_id = str(uuid.uuid4())
    url = str(req.url)

    audits[audit_id] = {
        "id": audit_id,
        "url": url,
        "status": "pending",
        "overall_score": 0,
        "checks": [],
        "pages_crawled": 0,
        "lighthouse": None,
        "created_at": "",
        "error": None,
    }

    # Run audit in background
    asyncio.create_task(_run_audit_background(audit_id, url))

    return {"id": audit_id}


async def _run_audit_background(audit_id: str, url: str):
    audits[audit_id]["status"] = "running"
    try:
        result = await run_audit(url)
        audits[audit_id].update(result)
        audits[audit_id]["status"] = "complete"
    except Exception as e:
        audits[audit_id]["status"] = "error"
        audits[audit_id]["error"] = str(e)


@app.get("/api/audits/{audit_id}")
async def get_audit(audit_id: str):
    if audit_id not in audits:
        raise HTTPException(status_code=404, detail="Audit not found")
    return audits[audit_id]


@app.get("/api/health")
async def health():
    return {"status": "ok"}
