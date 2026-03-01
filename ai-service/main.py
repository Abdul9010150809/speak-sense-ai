from fastapi import FastAPI, WebSocket
from pydantic import BaseModel
import random
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class AnalyzeRequest(BaseModel):
    transcript: str


@app.get("/config-status")
def config_status():
    return {
        "openaiConfigured": bool(OPENAI_API_KEY),
        "geminiConfigured": bool(GEMINI_API_KEY)
    }

@app.post("/analyze")
def analyze(data: AnalyzeRequest):
    sentiment = random.randint(60, 90)
    eye = random.randint(50, 100)
    posture = random.randint(50, 100)
    gesture = random.randint(50, 100)
    speech = random.randint(50, 100)

    final = (
        0.25 * eye +
        0.20 * posture +
        0.20 * gesture +
        0.20 * speech +
        0.15 * sentiment
    )

    return {
        "eyeContact": eye,
        "posture": posture,
        "gesture": gesture,
        "speechClarity": speech,
        "confidence": sentiment,
        "finalScore": round(final, 2)
    }

@app.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text("Real-time metrics placeholder")