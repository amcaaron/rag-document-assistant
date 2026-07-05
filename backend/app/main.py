from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes.upload_routes import router as upload_router
from app.routes.chat_routes import router as chat_router

from app.routes.intelligence_routes import router as intelligence_router

from app.routes.quiz_routes import router as quiz_router

app = FastAPI(title="DocuMind AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://rag-document-assistant-henna.vercel.app",
        "https://documind-ai-assistant.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(upload_router)
app.include_router(chat_router)
app.include_router(intelligence_router)
app.include_router(quiz_router)

@app.get("/")
def home():
    return {"message": "DocuMind AI backend is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}