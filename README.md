# MedVision AI Diagnostics Platform 🏥🧠

**MedVision AI** is an enterprise-grade Medical Artificial Intelligence platform designed for radiologists and medical professionals. It utilizes a state-of-the-art **FastAPI Python backend** powered by **PyTorch & Scikit-Learn** and a **Native Electron Desktop Client** (React/Vite) for secure, offline, high-performance clinical analysis.

The platform goes beyond simple classification by implementing **Explainable AI (XAI)** via Grad-CAM (Gradient-weighted Class Activation Mapping) and a Clinical Rule Engine to physically highlight structural anomalies on scans and generate professional radiology reports.

---

## 🌟 Core Features

- **Explainable AI (Grad-CAM):** Generates thermal heatmaps directly over MRI/CT scans to show the exact neural gradients responsible for the diagnosis.
- **Clinical Rule Engine:** Automatically drafts human-readable radiological findings based on the AI's mathematical confidence scores.
- **Native Desktop Client:** An Electron-wrapped React app providing offline, secure file-system access (essential for strict hospital HIPAA/Intranet requirements).
- **Multi-Modal Support:** Handles both high-resolution computer vision (MRI/CT Images) and structured tabular patient vitals (CSV).

---

## 📂 Project Directory Structure

```text
ct_mri/
├── ai_service/                 # 🐍 Python / FastAPI Backend Engine
│   ├── data/                   # Raw & processed datasets
│   │   ├── brain_tumor_dataset/
│   │   ├── ct_scan_dataset/
│   │   ├── tabular_pregnancy/
│   │   └── tabular_stroke/
│   ├── models/                 # Compiled .pth and .pkl AI weights
│   ├── main.py                 # FastAPI Application Server
│   ├── pipeline.py             # Inference router & data processor
│   ├── xai_analyzer.py         # Grad-CAM PyTorch gradients & Rule Engine
│   └── train_*.py              # Training scripts for each respective model
└── frontend/                   # 🖥️ Electron / React Desktop App
    ├── electron/               # Electron Native Window Configuration
    │   └── main.cjs
    ├── src/                    # React UI & Vite Configuration
    │   ├── App.jsx             # Main Dashboard & API Logic
    │   ├── index.css           # Premium Dark-Mode Glassmorphism styling
    │   └── main.jsx
    └── package.json
```

---

## 🤖 Deployed AI Models & Datasets

### 1. Brain Tumor MRI Scanner (Computer Vision)
- **Dataset:** `masoudnickparvar/brain-tumor-mri-dataset` (7,000+ MRI scans)
- **Architecture:** PyTorch `ResNet18` (Transfer Learning)
- **Classes:** Glioma, Meningioma, Pituitary Adenoma, No Tumor
- **Test Accuracy:** `94.50%`
- **Key Metric:** `100% Recall` on Healthy Brains (Zero False Negatives for healthy patients).

### 2. Lung COVID-19 CT Scanner (Computer Vision)
- **Dataset:** `plameneduardo/sarscov2-ctscan-dataset` (2,481 CT scans)
- **Architecture:** PyTorch `DenseNet121` (Transfer Learning)
- **Classes:** COVID-19, Non-COVID (Healthy/Other Pneumonia)
- **Test Accuracy:** `98.23%`
- **Key Metric:** `99% Precision` for COVID detection.

### 3. Fetal Health Predictor (Tabular Vitals)
- **Dataset:** `andrewmvd/fetal-health-classification` (2,126 records)
- **Architecture:** Scikit-Learn `RandomForestClassifier` (Class-Weighted)
- **Data Source:** Cardiotocography (CTG) exam data (21 features)
- **Test Accuracy:** `93.19%`
- **Key Metric:** `91% Recall` for Pathological (High-Risk) pregnancies.

### 4. Stroke Risk Predictor (Tabular Vitals)
- **Dataset:** `fedesoriano/stroke-prediction-dataset` (5,110 records)
- **Architecture:** Scikit-Learn `RandomForestClassifier` with **SMOTE** oversampling.
- **Data Source:** Patient Vitals (BMI, Glucose, Hypertension, Smoking Status)
- **Test Accuracy:** `93.88%`
- **Key Metric:** `97% Recall` for patients at risk of strokes.

### 5. (Bonus) Brain Tumor Tabular Predictor
- **Dataset:** `jakeshbohaju/brain-tumor` (3,762 MRI statistical records)
- **Architecture:** Scikit-Learn `RandomForestClassifier`
- **Data Source:** First-order statistical features (Mean, Variance, Skewness, Kurtosis)
- **Test Accuracy:** `99.34%`
- **Key Metric:** `99.5% F1-Score` across the board.

---

## 🛠️ Technology Stack

**Backend / AI Engine:**
- `Python 3.10+`
- `PyTorch` & `Torchvision` (Deep Learning)
- `Scikit-Learn` & `Imbalanced-Learn` (Machine Learning)
- `FastAPI` & `Uvicorn` (REST API & Microservice Architecture)
- `OpenCV` (CV2) & `NumPy` (Image Processing & XAI Heatmaps)

**Frontend / Desktop App:**
- `React 19`
- `Vite` (Lightning-fast HMR Build Tool)
- `Electron.js` (Native Desktop Client Wrapper)
- Pure Vanilla CSS (Premium Dark-Mode Glassmorphism)

---

## 🚀 Installation & Setup Instructions

Because this is a decoupled architecture, you must run both the Python AI Engine and the Electron Frontend.

### 1. Start the AI Backend (FastAPI)
Open a terminal in the root directory:
```bash
cd ai_service
pip install -r requirements.txt
python main.py
```
*The backend will boot up on `http://localhost:8001`. You can view the API documentation at `http://localhost:8001/docs`.*

### 2. Start the Desktop Client (Electron/React)
Open a second terminal in the root directory:
```bash
cd frontend
npm install
npm run electron:dev
```
*Vite will compile the React app, and Electron will spawn a native desktop window titled "MedVision AI Diagnostics".*

---

## 📡 API Documentation

### `POST /api/v1/inference`
Primary endpoint for the UI to upload DICOM/Image files for XAI evaluation.

**Request Form Data:**
- `file`: The binary image payload (.jpg, .png, .dcm)
- `modality`: String (`MRI` or `CT`)
- `bodyPart`: String (`Brain` or `Lung`)

**Response Payload (JSON):**
```json
{
  "success": true,
  "confidenceScore": 99.4,
  "emergencyPriority": "HIGH",
  "diseasesDetected": [
    {
      "disease": "Glioma",
      "confidence": 99.4
    }
  ],
  "aiFindings": "XAI Clinical Output: The AI has isolated a region of irregular, heterogenous hyperintensity...",
  "heatmapOverlayUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

---
*Disclaimer: This software is an Artificial Intelligence prototype built for educational and research purposes. It is not FDA-approved and should not be used as a primary diagnostic tool in a clinical setting without physician oversight.*
