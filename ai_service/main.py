import base64
import uvicorn
import sqlite3
import json
from datetime import datetime
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from pipeline import pipeline

# --- DATABASE SETUP ---
DB_FILE = "medvision_clinical.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS patients (
                    id TEXT PRIMARY KEY, name TEXT, dob TEXT, age TEXT, gender TEXT, 
                    phone TEXT, email TEXT, address TEXT, history TEXT, 
                    allergies TEXT, doctor TEXT, notes TEXT, studies INTEGER, 
                    lastStudy TEXT, status TEXT)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS studies (
                    id TEXT PRIMARY KEY, patientId TEXT, patientName TEXT, 
                    age TEXT, gender TEXT, modality TEXT, bodyPart TEXT, 
                    clinicalHistory TEXT, time TEXT, date TEXT, 
                    aiType TEXT, aiLabel TEXT, aiFindingTitle TEXT, 
                    aiLocation TEXT, aiConfidence TEXT, aiSeverity TEXT, 
                    aiExplanation TEXT, heatmapUrl TEXT)''')
    conn.commit()
    conn.close()

init_db()

# Pydantic models for API
class Patient(BaseModel):
    id: str
    name: str
    dob: str
    age: str
    gender: str
    phone: str
    email: str
    address: str
    history: str
    allergies: str
    doctor: str
    notes: str
    studies: int
    lastStudy: str
    status: str

class Study(BaseModel):
    id: str
    patientId: str
    patientName: str
    age: str
    gender: str
    modality: str
    bodyPart: str
    clinicalHistory: str
    time: str
    date: str
    aiType: str
    aiLabel: str
    aiFindingTitle: str
    aiLocation: str
    aiConfidence: str
    aiSeverity: str
    aiExplanation: str
    heatmapUrl: str


app = FastAPI(
    title="MedVision AI MONAI/PyTorch Computer Vision Microservice",
    description="Enterprise Deep Learning Inference Engine for Medical DICOM & Imaging Analysis",
    version="2.4.0"
)

# Enable CORS for local backend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "MedVision MONAI/PyTorch AI Engine",
        "frameworks": ["PyTorch 2.0", "MONAI 1.3", "OpenCV 4.13"],
        "pipeline": "CLAHE -> Preprocessing -> MONAI Segmentation -> Grad-CAM Saliency"
    }

@app.get("/api/v1/models/info")
def get_models_accuracy():
    """
    Returns the loaded pre-trained models and their documented validation accuracies.
    """
    return {
        "models": [
            {
                "modality": "Chest X-Ray",
                "architecture": "DenseNet121",
                "source": "TorchXRayVision",
                "accuracy_metrics": {
                    "Average_AUC": "0.83 - 0.88",
                    "validation_dataset": "NIH, MIMIC, CheXpert, PadChest"
                },
                "status": "Loaded"
            },
            {
                "modality": "Brain MRI",
                "architecture": "ResNet18",
                "source": "PyTorch / ImageNet Weights",
                "accuracy_metrics": {
                    "Top_1_Accuracy": "69.76%",
                    "Top_5_Accuracy": "89.08%"
                },
                "status": "Loaded"
            },
            {
                "modality": "CT Scan",
                "architecture": "DenseNet121",
                "source": "PyTorch / ImageNet Weights",
                "accuracy_metrics": {
                    "Top_1_Accuracy": "74.43%",
                    "Top_5_Accuracy": "91.97%"
                },
                "status": "Loaded"
            }
        ]
    }

# --- CRUD ENDPOINTS ---

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/api/v1/patients")
def get_patients():
    conn = get_db()
    pts = conn.execute("SELECT * FROM patients").fetchall()
    conn.close()
    return [dict(p) for p in pts]

@app.post("/api/v1/patients")
def save_patient(p: Patient):
    conn = get_db()
    conn.execute('''INSERT OR REPLACE INTO patients 
                    (id, name, dob, age, gender, phone, email, address, history, allergies, doctor, notes, studies, lastStudy, status) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                 (p.id, p.name, p.dob, p.age, p.gender, p.phone, p.email, p.address, p.history, p.allergies, p.doctor, p.notes, p.studies, p.lastStudy, p.status))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.delete("/api/v1/patients/{patient_id}")
def delete_patient(patient_id: str):
    conn = get_db()
    conn.execute("DELETE FROM patients WHERE id=?", (patient_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.get("/api/v1/studies")
def get_studies():
    conn = get_db()
    st = conn.execute("SELECT * FROM studies ORDER BY date DESC, time DESC").fetchall()
    conn.close()
    return [dict(s) for s in st]

@app.post("/api/v1/studies")
def save_study(s: Study):
    conn = get_db()
    conn.execute('''INSERT OR REPLACE INTO studies 
                    (id, patientId, patientName, age, gender, modality, bodyPart, clinicalHistory, time, date, aiType, aiLabel, aiFindingTitle, aiLocation, aiConfidence, aiSeverity, aiExplanation, heatmapUrl) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                 (s.id, s.patientId, s.patientName, s.age, s.gender, s.modality, s.bodyPart, s.clinicalHistory, s.time, s.date, s.aiType, s.aiLabel, s.aiFindingTitle, s.aiLocation, s.aiConfidence, s.aiSeverity, s.aiExplanation, s.heatmapUrl))
    
    # Update patient study count & last study
    conn.execute("UPDATE patients SET studies = studies + 1, lastStudy = ? WHERE id = ?", (s.date, s.patientId))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.delete("/api/v1/studies/{study_id}")
def delete_study(study_id: str):
    conn = get_db()
    conn.execute("DELETE FROM studies WHERE id=?", (study_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/v1/inference")
async def run_ai_inference(
    file: UploadFile = File(None),
    modality: str = Form("MRI"),
    bodyPart: str = Form("Brain")
):
    try:
        if file is not None:
            contents = await file.read()
        else:
            # Fallback dummy binary pattern if no file sent
            contents = b'\x00' * 1024

        result = pipeline.run_inference(contents, modality=modality, body_part=bodyPart)
        
        # Convert raw heatmap bytes to base64 data URI for instant rendering
        heatmap_b64 = base64.b64encode(result["heatmapRawBytes"]).decode('utf-8')
        result["heatmapOverlayUrl"] = f"data:image/png;base64,{heatmap_b64}"
        del result["heatmapRawBytes"] # Remove raw bytes from JSON output

        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference pipeline execution error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
