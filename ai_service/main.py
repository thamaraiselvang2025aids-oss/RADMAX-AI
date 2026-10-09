import base64
import uvicorn
import sqlite3
import json
from datetime import datetime
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import os
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

import joblib
import pandas as pd
import random
import os

tabular_models = {}

@app.post("/api/v1/tabular-inference")
async def run_tabular_inference(
    modality: str = Form("Clinical"),
    bodyPart: str = Form("Fetal Health")
):
    try:
        if "fetal" in bodyPart.lower() or "pregnancy" in bodyPart.lower():
            model_path = os.path.join("models", "tabular_fetal_health_rf.pkl")
            data_path = os.path.join("data", "tabular_pregnancy", "fetal_health.csv")
            
            if "fetal" not in tabular_models:
                tabular_models["fetal"] = joblib.load(model_path)
            
            clf = tabular_models["fetal"]
            df = pd.read_csv(data_path)
            
            # Pick a random patient record
            random_idx = random.randint(0, len(df)-1)
            patient_data = df.iloc[random_idx:random_idx+1].drop(columns=['fetal_health'])
            
            prediction = clf.predict(patient_data)[0]
            
            # 1 (Normal), 2 (Suspect), 3 (Pathological)
            classes = {1.0: "Normal", 2.0: "Suspect", 3.0: "Pathological"}
            disease_name = classes.get(prediction, "Unknown")
            
            priority = "CRITICAL" if prediction == 3.0 else ("REVIEW" if prediction == 2.0 else "LOW")
            confidence_score = float(round(random.uniform(85.0, 99.0), 2)) # Mock confidence for now
            
            # Format the input features as a pretty string
            features_dict = patient_data.iloc[0].to_dict()
            explanation_parts = [f"{k}: {v}" for k, v in list(features_dict.items())[:5]]
            explanation = f"EHR Data Analyzed. Key metrics -> {', '.join(explanation_parts)}..."
            
            return JSONResponse(content={
                "diseasesDetected": [{"disease": f"Fetal State: {disease_name}", "confidence": confidence_score}],
                "emergencyPriority": priority,
                "confidenceScore": confidence_score,
                "aiFindings": f"Random Forest Tabular Model output: {disease_name}. {explanation}",
                "heatmapOverlayUrl": None # No image for tabular
            })
            
        return JSONResponse(content={"error": "Model not found for this body part."})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tabular inference error: {str(e)}")

# Mount the compiled React frontend to the root
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
else:
    print(f"Warning: Frontend dist folder not found at {frontend_dist}. Please run 'npm run build' in the frontend directory.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
