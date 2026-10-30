# MedVision AI Diagnostics Platform 🏥🧠

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/thamaraiselvang2025aids-oss/RADMAX-AI/blob/main/RADMAX_AI_Colab.ipynb)

**MedVision AI** is an enterprise-grade Medical Artificial Intelligence platform designed for radiologists and medical professionals. It utilizes a state-of-the-art **FastAPI Python backend** powered by **PyTorch & Scikit-Learn** and a **Native Electron Desktop Client** (React/Vite) for secure, offline, high-performance clinical analysis.

The platform goes beyond simple classification by implementing **Explainable AI (XAI)** via Grad-CAM (Gradient-weighted Class Activation Mapping) and a Clinical Rule Engine to physically highlight structural anomalies on scans and generate professional radiology reports.

---

## 🌟 Core Applications & Clinical Use Cases

MedVision AI is designed specifically for integration into a hospital's radiology and diagnostic workflows:

1. **Patient Directory & Study Management:** A centralized digital workstation where doctors can register patients, track vital signs, and manage historical medical imaging studies.
2. **Automated Triage (Emergency Room):** Instantly analyzes uploaded CT/MRI scans and flags critical abnormalities (like COVID-19 or Brain Tumors) as **HIGH PRIORITY**, allowing radiologists to review life-threatening cases first.
3. **Explainable AI (XAI) Diagnostics:** Instead of a "black box" prediction, the AI overlays a Grad-CAM heatmap directly on the uploaded scan, visually proving to the doctor exactly *where* the neural network detected the anomaly.
4. **Radiologist Report Generation:** Dynamically pulls patient data and AI findings into a clean, editable, clinical Radiology Report. Doctors can review the AI's explanation, modify the clinical observations, and print/export a finalized PDF report for the patient.
5. **Predictive Vitals Analysis:** Uses tabular Machine Learning models to predict patient risk for Stroke and Fetal Health complications based on standard clinical metrics.

---

## 🏗️ Architecture & How It Works

1. **Data Ingestion:** The radiologist selects a patient and uploads a medical scan (MRI or CT) via the Electron Desktop App.
2. **REST API Transmission:** The React frontend securely transmits the image binary and patient metadata to the local FastAPI Python backend.
3. **Deep Learning Inference:** The Python pipeline routes the image to the correct PyTorch model (e.g., `ResNet18` for Brain MRI, `DenseNet121` for Lung CT).
4. **Explainability Generation:** Once a diagnosis is made, `xai_analyzer.py` intercepts the final convolutional layer of the model, calculates the gradients, and generates a visual heatmap (Grad-CAM).
5. **Rule Engine Interpretation:** The backend generates a natural-language clinical explanation based on the AI's confidence and detected location.
6. **Clinical Review:** The frontend renders the XAI report. The radiologist reviews the heatmap, edits the report, and finalizes the diagnosis. Data is persisted to the local SQLite database.

---

## 📂 Project Directory Structure

```text
RADMAX-AI/
├── ai_service/                      # 🐍 Python 3.10+ / FastAPI Deep Learning & XAI Engine
│   ├── data/                        # Datasets (Brain MRI, Lung CT, Ultrasound, Tabular Vitals)
│   ├── models/                      # Trained PyTorch (.pth) & Scikit-Learn (.pkl) model weights
│   ├── main.py                      # FastAPI REST API Server & Unified Static Workstation mount
│   ├── pipeline.py                  # PyTorch inference router (Brain MRI, Lung CT, Breast/Thyroid/Pregnancy US)
│   ├── xai_analyzer.py              # Grad-CAM visual explainability engine & Clinical Rule Engine
│   ├── medvision_clinical.db        # SQLite clinical database (Patients, Studies, Vitals, Reports)
│   ├── train_medical_models.py      # PyTorch CNN training pipelines (ResNet18, DenseNet121)
│   ├── train_extra_vision_models.py # Transfer learning pipelines for ultrasound imaging
│   ├── train_tabular_*.py           # Scikit-Learn RandomForest models (Stroke risk, Fetal health)
│   ├── evaluate_ct.py / evaluate_mri.py # Model validation & metric reporting scripts
│   └── requirements.txt             # Python backend dependencies
│
├── frontend/                        # 🖥️ Clinical Workstation & Native Electron Client
│   ├── dist/                        # Pre-compiled production bundle (served directly by FastAPI)
│   ├── electron/                    # Native Desktop window configuration
│   │   └── main.cjs                 # Electron main process wrapper
│   ├── src/                         # React 19 UI source code
│   │   ├── App.jsx                  # Clinical workstation, EHR intake, XAI dossier, 4-tab settings
│   │   ├── index.css                # Glassmorphism dark mode & clinical contrast white theme CSS
│   │   └── main.jsx                 # React root mount
│   ├── package.json                 # Desktop client dependencies & scripts
│   └── vite.config.js               # Vite bundler configuration
│
├── src/                             # 🌐 Enterprise PACS & Hospital Management Platform (React / TS)
│   ├── components/                  # Clinical modules & viewer components
│   │   ├── AIChatBot.tsx            # Copilot diagnostic reasoning assistant
│   │   ├── AIReportBuilder.tsx      # Radiologist structured report composer
│   │   ├── AuditLogs.tsx            # HIPAA compliance access & study audit trail
│   │   ├── DiseaseProgress.tsx      # Longitudinal scan & lesion tracking
│   │   ├── PACSViewer.tsx           # Multi-frame DICOM viewing canvas with WW/WL controls
│   │   ├── Sidebar.tsx              # Role-based clinical navigation
│   │   └── modules/                 # Hospital department modules:
│   │       ├── AiModelsModule.tsx   # Model registry, inference metrics, & status
│   │       ├── AnalyticsModule.tsx  # Hospital diagnostic throughput analytics
│   │       ├── AppointmentsModule.tsx # Patient imaging scheduling & queue
│   │       ├── DepartmentsModule.tsx# Radiology, Oncology, & Neurology department manager
│   │       ├── HospitalsModule.tsx  # Multi-facility clinical network manager
│   │       ├── NotificationsModule.tsx # Urgent triage & critical scan alerts
│   │       ├── RadiologistsModule.tsx # Attending physician rosters & licensing
│   │       └── ResearchModule.tsx   # Clinical trials & dataset cohort builder
│   ├── views/                       # Full-page application views (LoginView.tsx, etc.)
│   ├── services/                    # Client services (dicom.ts - DICOM parsing & PACS integration)
│   ├── middleware/                  # Client-side security (auth.ts - JWT verification & RBAC)
│   ├── db/                          # Database connection layer (db.ts - PostgreSQL integration)
│   ├── types.ts                     # TypeScript interfaces for patients, scans, and reports
│   └── App.tsx                      # Root application layout for enterprise PACS portal
│
├── server.ts                        # ⚡ Node.js / Express API Gateway (Auth, DICOM Ingest, Reverse Proxy)
├── start_medvision.bat              # 🚀 1-Click launcher: boots AI backend & opens unified workstation
├── start_localtunnel.bat            # 🌐 1-Click launcher: exposes unified platform to secure public URL
├── Dockerfile / docker-compose.yml  # 🐳 Multi-container orchestration (FastAPI + Node + PostgreSQL)
├── RADMAX_AI_Colab.ipynb            # ☁️ Google Colab end-to-end cloud training & evaluation notebook
└── DOCUMENTATION.md                 # 📘 Enterprise system architecture & interactive design blueprint
```

---

## 🤖 Deployed AI DL/ML Models & Accuracy

### 1. Brain Tumor MRI Scanner (Computer Vision - PyTorch)
- **Dataset:** `masoudnickparvar/brain-tumor-mri-dataset` (7,000+ MRI scans)
- **Architecture:** PyTorch `ResNet18` (Transfer Learning)
- **Classes:** Glioma, Meningioma, Pituitary Adenoma, No Tumor
- **Test Accuracy:** `94.50%`
- **Use Case:** Automates the detection and classification of brain tumors, highlighting the exact mass location for neurosurgeons.

### 2. Lung COVID-19 CT Scanner (Computer Vision - PyTorch)
- **Dataset:** `plameneduardo/sarscov2-ctscan-dataset` (2,481 CT scans)
- **Architecture:** PyTorch `DenseNet121` (Transfer Learning)
- **Classes:** COVID-19, Non-COVID (Healthy/Other Pneumonia)
- **Test Accuracy:** `98.23%`
- **Use Case:** Rapid triage of respiratory patients in emergency settings, identifying viral pneumonia patterns with 99% precision.

### 3. Fetal Health Predictor (Tabular Vitals - Scikit-Learn)
- **Dataset:** `andrewmvd/fetal-health-classification` (2,126 records)
- **Architecture:** Scikit-Learn `RandomForestClassifier` (Class-Weighted)
- **Data Source:** Cardiotocography (CTG) exam data (21 features)
- **Test Accuracy:** `93.19%`
- **Use Case:** Assesses fetal well-being during pregnancy to prevent infant mortality, achieving 91% recall for high-risk pregnancies.

### 4. Stroke Risk Predictor (Tabular Vitals - Scikit-Learn)
- **Dataset:** `fedesoriano/stroke-prediction-dataset` (5,110 records)
- **Architecture:** Scikit-Learn `RandomForestClassifier` with **SMOTE** oversampling.
- **Data Source:** Patient Vitals (BMI, Glucose, Hypertension, Smoking Status)
- **Test Accuracy:** `93.88%`
- **Use Case:** Preventative care profiling, identifying patients at high risk of impending strokes.

---

## 🛠️ Technology Stack

**Backend / AI Engine:**
- `Python 3.10+`
- `PyTorch` & `Torchvision` (Deep Learning & CNNs)
- `Scikit-Learn` & `Imbalanced-Learn` (Machine Learning & Tabular Data)
- `FastAPI` & `Uvicorn` (High-Performance REST API)
- `SQLite3` (Relational Database)
- `OpenCV` (CV2) & `NumPy` (Image Processing & XAI Heatmaps)

**Frontend / Desktop App:**
- `React 19`
- `Vite` (Lightning-fast HMR Build Tool)
- `Electron.js` (Native Desktop Client Wrapper)
- `Tailwind CSS` / Vanilla CSS (Premium Dark-Mode Glassmorphism)
- `Lucide-React` (Clinical Iconography)

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
*Disclaimer: This software is an Artificial Intelligence prototype built for educational and research purposes. It is not FDA-approved and should not be used as a primary diagnostic tool in a clinical setting without physician oversight.*
