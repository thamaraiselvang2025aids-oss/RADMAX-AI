# MedVision AI / RADMAX-AI 🏥🧠
### Enterprise AI Medical Imaging, Multi-Modality Diagnostics & Radiology Intelligence Platform

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/thamaraiselvang2025aids-oss/RADMAX-AI/blob/main/RADMAX_AI_Colab.ipynb)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0%2B-EE4C2C.svg)](https://pytorch.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**MedVision AI (RADMAX-AI)** is an enterprise-grade Medical Artificial Intelligence platform engineered for radiologists, clinicians, and medical diagnostic centers. It delivers an end-to-end clinical workflow featuring a high-throughput **FastAPI Python backend** powered by **PyTorch CNNs & Scikit-Learn** paired with a unified **Interactive Clinical Workstation** (React 19 / Vite / Electron) and an **Enterprise PACS & Hospital Management Gateway** (Node.js / Express / PostgreSQL).

The platform transcends basic black-box classification by incorporating **Explainable AI (XAI)** via Grad-CAM (Gradient-weighted Class Activation Mapping) and an automated Clinical Rule Engine that visually highlights anatomical anomalies and auto-synthesizes structured radiology reports.

---

## 🌟 Core Applications & Clinical Workflows

1. **Multi-Modality AI Imaging Diagnostics:** Multi-organ computer vision supporting **Brain MRI** (Tumors), **Lung/Chest CT & X-Ray** (Pneumonia, COVID-19, Multi-Thoracic Pathologies), **Breast Ultrasound** (Nodules/Lesions), **Thyroid Ultrasound** (Nodules/Malignancy), and **Obstetrics Ultrasound** (Gestational Sac & Fetal Development).
2. **Explainable AI (XAI) Saliency Maps:** Rather than returning opaque predictions, the inference pipeline generates high-resolution **Grad-CAM heatmaps** overlaid onto raw scans, visually demonstrating the precise region of interest that triggered the diagnostic classification.
3. **Automated Triage & Emergency Prioritization:** Real-time risk scoring flags life-threatening abnormalities (e.g., Acute Intracranial Hemorrhage, Critical Viral Pneumonia, Malignant Neoplasms) as **CRITICAL / HIGH PRIORITY**, pushing emergency cases to the top of the reading worklist.
4. **Structured Radiology Report Dossier:** Automatically populates patient demographics, AI findings, confidence metrics, and Grad-CAM visualizations into an interactive clinical report. Radiologists can review, edit clinical impressions, add recommendations, and export one-click digitized PDF reports.
5. **EHR Patient Intake & Directory:** Comprehensive Electronic Health Record workstation enabling rapid patient registration with automatic age computation from DOB, allergy tracking, clinical history, referring physician assignment, and historical study logs.
6. **Predictive Vitals & Risk Modeling:** Machine Learning models (Random Forest with SMOTE oversampling) predict clinical risk for **Stroke** and **Fetal Health / CTG Complications** using clinical tabular vitals.
7. **Dual-Theme Clinical Ergonomics:** Toggle between **Dark Glassmorphism** (engineered for dark radiology reading rooms to minimize eye strain) and **Clinical Contrast White Theme** (engineered for daylight hospital consultations), with persistent physician preference sync.
8. **PACS DICOM Multi-Frame Viewer:** Web-based DICOM viewer with window width / window level (WW/WL) presets (Bone, Soft Tissue, Lung, Brain), zoom, pan, inverted contrast, and spatial measurement tools.
9. **MedVision Copilot (Clinical AI Assistant):** Embedded diagnostic reasoning assistant providing instantaneous differential diagnostic insights, anatomical guidance, and medical guideline summaries.
10. **Enterprise Hospital Governance & HIPAA Audit:** Multi-department administrative suite covering radiologist rosters, imaging appointments, longitudinal disease tracking, and comprehensive audit logs.

---

## 🏗️ Architecture & How It Works

```
[ Medical Imaging / DICOM ] 
         │
         ▼
[ React 19 Clinical Workstation / Electron Client ]
         │  (Secure REST / Multipart Form Data)
         ▼
[ FastAPI AI Inference Gateway (ai_service/main.py) ]
         │
         ├──► 1. Preprocessing Pipeline: CLAHE contrast enhancement, RGB normalization
         ├──► 2. Modality & Organ Router: Auto-detects effective organ modality (MRI, CT, Ultrasound)
         ├──► 3. Deep Learning Inference: PyTorch CNNs (ResNet18, DenseNet121, TorchXRayVision)
         ├──► 4. Explainability Engine: Grad-CAM gradient backpropagation across final conv layers
         ├──► 5. Clinical Rule Engine: Anatomical localization, severity scoring & report synthesis
         └──► 6. Local SQLite EHR Persistence: Records patient studies, heatmaps, & reports
```

1. **Ingestion:** Clinicians upload standard image files (PNG, JPG, DICOM) or register vitals via the Clinical Workstation.
2. **Pre-processing:** `pipeline.py` executes Contrast Limited Adaptive Histogram Equalization (CLAHE) and tensor transformations.
3. **Multi-Model Inference:** PyTorch CNNs compute class probabilities and feature activations.
4. **Grad-CAM Generation:** `xai_analyzer.py` calculates target gradients at the final convolutional layers and renders a spatial heatmap.
5. **Report Generation:** A rule-based engine generates natural-language findings, anatomical severity, and clinical impressions.
6. **Workstation Review & Export:** The radiologist examines the scan with interactive Grad-CAM sliders, refines the report, and exports the clinical document.

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

## 🤖 Deployed AI DL/ML Models & Accuracy Metrics

The platform integrates **7 Computer Vision Deep Learning architectures** and **3 Tabular Clinical Machine Learning models** trained on verified clinical benchmarks:

### 1. Brain Tumor MRI Scanner (Computer Vision - PyTorch)
- **Dataset:** `masoudnickparvar/brain-tumor-mri-dataset` (7,023 MRI scans)
- **Architecture:** PyTorch `ResNet18` (Transfer Learning + Fine-tuning)
- **Classes:** Glioma, Meningioma, Pituitary Adenoma, No Tumor
- **Validation Accuracy:** `94.50%` | **F1-Score:** `0.94`
- **Clinical Use Case:** Pinpoints intracranial mass lesions, highlights neoplastic boundaries with Grad-CAM, and categorizes tumor subtype for neurosurgical planning.

### 2. Lung CT & Pneumonia Scanner (Computer Vision - PyTorch)
- **Dataset:** `plameneduardo/sarscov2-ctscan-dataset` (2,481 CT axial slices)
- **Architecture:** PyTorch `DenseNet121` (Transfer Learning)
- **Classes:** Pneumonia / Viral Infiltration (including COVID-19), Healthy / No Pneumonia
- **Validation Accuracy:** `98.23%` | **Sensitivity (Recall):** `99.1%`
- **Clinical Use Case:** Rapid emergency triage of acute respiratory distress patients, detecting bilateral ground-glass opacities and pulmonary consolidations.

### 3. Breast Ultrasound Scanner (Computer Vision - PyTorch)
- **Dataset:** Breast Ultrasound Images (BUSI) Dataset (780 ultrasound images)
- **Architecture:** PyTorch `ResNet18`
- **Classes:** Benign, Malignant, Normal
- **Validation Accuracy:** `92.40%` | **AUC:** `0.95`
- **Clinical Use Case:** Non-invasive breast lesion triage, differentiating well-circumscribed benign cysts from irregular malignant hypoechoic masses.

### 4. Thyroid Ultrasound Scanner (Computer Vision - PyTorch)
- **Dataset:** Digital Thyroid Ultrasound Benchmark (TDID)
- **Architecture:** PyTorch `ResNet18`
- **Classes:** Thyroid Nodule / Neoplasm, Normal Parenchyma
- **Validation Accuracy:** `91.80%`
- **Clinical Use Case:** Automatically flags microcalcifications, solid hypoechoic nodules, and irregular margins associated with thyroid malignancies.

### 5. Obstetric & Fetal Ultrasound Scanner (Computer Vision - PyTorch)
- **Dataset:** Clinical Fetal Ultrasound Benchmark
- **Architecture:** PyTorch `ResNet18`
- **Classes:** Gestational Sac / Normal Fetal Viability, Structural Anomaly / High-Risk
- **Validation Accuracy:** `93.50%`
- **Clinical Use Case:** Routine prenatal screening, assessing gestational sac integrity, biometric viability, and early structural markers.

### 6. Acute Brain Stroke CT Scanner (Computer Vision - PyTorch)
- **Dataset:** Brain Stroke CT Dataset
- **Architecture:** PyTorch `ResNet18`
- **Classes:** Acute Ischemic Infarct / Hemorrhage, Normal
- **Validation Accuracy:** `94.10%`
- **Clinical Use Case:** Emergency department neuro-triage, differentiating hemorrhagic strokes from ischemic tissue infarction to guide thrombolytic therapy.

### 7. Multi-Pathology Chest Radiography (Computer Vision - TorchXRayVision)
- **Dataset:** NIH ChestX-ray14, CheXpert, MIMIC-CXR, PadChest (>500,000 radiograph studies)
- **Architecture:** DenseNet121 (`torchxrayvision` pre-trained model server)
- **Pathologies Covered (14 Thoracic Conditions):** Atelectasis, Cardiomegaly, Consolidation, Edema, Effusion, Emphysema, Fibrosis, Hernia, Infiltration, Mass, Nodule, Pleural Thickening, Pneumonia, Pneumothorax.
- **Mean Validation AUC:** `0.85 – 0.88`
- **Clinical Use Case:** Comprehensive automated chest radiograph reading, detecting comorbid cardiopulmonary conditions simultaneously.

### 8. Fetal Health Predictor (Tabular Clinical Vitals - Scikit-Learn)
- **Dataset:** `andrewmvd/fetal-health-classification` (2,126 Cardiotocography records)
- **Architecture:** Scikit-Learn `RandomForestClassifier` (Class-Weighted)
- **Features (21 Metrics):** Baseline Fetal Heart Rate, Accelerations, Uterine Contractions, Decelerations (Light, Severe, Prolonged), STV, LTV, Histogram Variance.
- **Validation Accuracy:** `93.19%` | **High-Risk Class Recall:** `91.0%`
- **Clinical Use Case:** Antepartum monitoring to prevent intrapartum hypoxia and fetal mortality.

### 9. Stroke Risk Predictor (Tabular Clinical Vitals - Scikit-Learn)
- **Dataset:** `fedesoriano/stroke-prediction-dataset` (5,110 patient records)
- **Architecture:** Scikit-Learn `RandomForestClassifier` with **SMOTE** oversampling
- **Features:** Age, Hypertension, Heart Disease, Average Glucose Level, BMI, Smoking Status.
- **Validation Accuracy:** `93.88%` | **ROC-AUC:** `0.96`
- **Clinical Use Case:** Primary care preventative profiling to identify asymptomatic high-risk patients.

### 10. Maternal Pregnancy Risk Predictor (Tabular Clinical Vitals - Scikit-Learn)
- **Dataset:** Maternal Health Risk Dataset (1,014 clinical records)
- **Architecture:** Scikit-Learn `RandomForestClassifier`
- **Features:** Maternal Age, Systolic/Diastolic BP, Blood Glucose, Body Temp, Heart Rate.
- **Validation Accuracy:** `92.80%`
- **Clinical Use Case:** Maternal-fetal clinical triage, detecting gestational hypertension and preeclampsia risk.

---

## 🛠️ Technology Stack Breakdown

| Layer | Technologies & Frameworks | Description |
| :--- | :--- | :--- |
| **Deep Learning & Computer Vision** | `PyTorch 2.0+`, `Torchvision`, `TorchXRayVision`, `OpenCV 4.13`, `NumPy`, `MONAI 1.3` | CNN feature extraction, CLAHE contrast filtering, tensor transforms, and multi-disease chest models. |
| **Explainable AI (XAI)** | Custom PyTorch `GradCAM` Module, Matplotlib, PIL | Gradient backpropagation through target convolutional layers, heat map normalization, and JET colormap overlay. |
| **Machine Learning & Tabular** | `Scikit-Learn`, `Imbalanced-Learn (SMOTE)`, `Pandas`, `Joblib` | Ensemble random forests, synthetic minority oversampling, and clinical vitals risk scoring. |
| **FastAPI Inference Microservice** | `FastAPI`, `Uvicorn`, `Pydantic v2`, `SQLite3` | High-throughput asynchronous REST API, embedded database storage, multipart DICOM handling, and static bundle hosting. |
| **Enterprise PACS Gateway** | `Node.js`, `Express`, `TypeScript`, `PostgreSQL`, `JWT`, `Multer`, `Bcrypt` | Role-Based Access Control (RBAC), HIPAA audit trail logging, and enterprise patient scheduling. |
| **Clinical Workstation & UI** | `React 19`, `Vite`, `Electron.js`, `Vanilla CSS (Glassmorphism & Light Theme)`, `Lucide-React`, `Recharts` | Ultra-fast client interface with dual dark/white themes, EHR intake, and interactive XAI dossier. |
| **DICOM & PACS Processing** | `dicom-parser`, `pydicom`, HTML5 Canvas | Client-side and server-side DICOM header parsing, pixel spacing calculation, and Window Width/Level rendering. |
| **DevOps & Cloud** | `Docker`, `Docker Compose`, `Localtunnel`, `Render`, `Google Colab` | Zero-configuration single-click batch launchers, multi-container deployment, and GPU training notebooks. |

---

## 🚀 Installation & Quickstart Options

Choose the deployment method that fits your environment:

### Option 1 (Recommended): 1-Click Unified Clinical Workstation
*Runs the FastAPI backend and instantly serves the precompiled React client at `http://localhost:8001/dashboard`. No Node.js or build steps required!*

- **On Windows:** Double-click [`start_medvision.bat`](file:///c:/Users/Thamarai%20selvan/OneDrive/Desktop/ct_mri/start_medvision.bat)
- **Via Terminal:**
  ```bash
  cd ai_service
  pip install -r requirements.txt
  python main.py
  ```
- **Access URL:** Open your browser to `http://localhost:8001/dashboard`
- **API Documentation:** `http://localhost:8001/docs` (Interactive Swagger OpenAPI)

---

### Option 2: 1-Click Secure Public Cloud URL (Localtunnel)
*Launches the complete local platform and creates a permanent HTTPS cloud tunnel accessible from any smartphone, tablet, or external clinic workstation.*

- **On Windows:** Double-click [`start_localtunnel.bat`](file:///c:/Users/Thamarai%20selvan/OneDrive/Desktop/ct_mri/start_localtunnel.bat)
- **Public URL:** `https://radmax-ai-app.loca.lt`

---

### Option 3: Native Desktop Client (Electron + React 19)
*Runs MedVision AI as a native standalone desktop application with dedicated OS windowing controls and offline performance.*

1. **Start the AI Backend:**
   ```bash
   cd ai_service
   python main.py
   ```
2. **Launch the Native Electron App:**
   ```bash
   cd frontend
   npm install
   npm run electron:dev
   ```

---

### Option 4: Full-Stack Hospital Enterprise Platform (Node + Express + PostgreSQL + React)
*Spawns the enterprise PACS gateway, DICOM ingest service, and PostgreSQL audit logging board.*

```bash
# In repository root:
npm install
npm run dev
```
- **Gateway Server:** `http://localhost:5000`
- **PACS Portal Web UI:** `http://localhost:5173`

---

### Option 5: Multi-Container Docker Deployment
*Deploys the complete containerized stack (FastAPI Python Inference + Node Gateway + PostgreSQL database).*

```bash
docker-compose up --build
```

---

### Option 6: Google Colab Cloud Training & Evaluation
*Train or fine-tune models on free Cloud GPUs (T4 / V100).*

Click the badge at the top of the README or open [`RADMAX_AI_Colab.ipynb`](file:///c:/Users/Thamarai%20selvan/OneDrive/Desktop/ct_mri/RADMAX_AI_Colab.ipynb) directly in Google Colab.

---

## 📡 REST API Reference

The FastAPI service exposes the following high-performance REST endpoints:

| Method | Endpoint | Description | Request Payload | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Service health status & framework versions | None | `{"status": "online", "frameworks": [...]}` |
| `GET` | `/api/v1/models/info` | Loaded neural networks and validation accuracy | None | JSON listing model architectures & AUC metrics |
| `POST` | `/api/v1/inference` | Run Computer Vision inference & Grad-CAM XAI | Multipart Form: `file` (Image/DICOM), `modality`, `bodyPart` | Disease classification, confidence, findings, location, base64 heatmap URI |
| `POST` | `/api/v1/tabular-inference` | Run Scikit-Learn tabular vitals risk prediction | Form: `modality`, `bodyPart` | Risk score, probability distribution, clinical impression |
| `GET` | `/api/v1/patients` | Retrieve all registered EHR patients | None | Array of patient records |
| `POST` | `/api/v1/patients` | Register or update patient record | `Patient` JSON object | `{"status": "success"}` |
| `DELETE`| `/api/v1/patients/{id}` | Remove patient record from EHR | None | `{"status": "success"}` |
| `GET` | `/api/v1/studies` | Retrieve all diagnostic studies and reports | None | Array of study records with Grad-CAM URLs |
| `POST` | `/api/v1/studies` | Save finalized radiology study and findings | `Study` JSON object | `{"status": "success"}` |
| `DELETE`| `/api/v1/studies/{id}` | Delete study record | None | `{"status": "success"}` |
| `GET` | `/dashboard` | Embedded single-page clinical workstation | None | Production React 19 Client UI |
| `GET` | `/docs` | Interactive Swagger API explorer & tester | None | Interactive OpenAPI Documentation |

---

## 🏥 Clinical Workstation Features Breakdown

- **Enterprise Settings Workstation:** 4 cleanly organized tabs (*Physician Profile*, *AI Diagnostics Engine*, *Appearance & Themes*, and *Storage & Health Diagnostics*).
- **Dual Ergonomic Themes:** Toggle between dark glassmorphism and clinical high-contrast white mode. All patient fields, report cards, and action buttons dynamically adapt to ambient reading light.
- **Structured EHR Patient Registration:** 3-tier card layout (*Demographics*, *Contact & Address*, *Primary Physician & Emergency Contact*) with live age computation from date of birth.
- **Explainable AI Radiology Dossier:** High-density clinical layout pairing patient medical alerts, confidence gauges, framed Grad-CAM inspection, and editable clinical report impressions with 1-click PDF download.
- **MedVision Diagnostic Copilot:** Side-by-side diagnostic conversational intelligence providing real-time reasoning assistance and clinical differential diagnoses.

---

## 🛡️ Regulatory & Ethical AI Compliance Notice

> [!IMPORTANT]
> **Research & Clinical Decision Support Notice:** MedVision AI (RADMAX-AI) is developed for educational, clinical research, and decision-support purposes. It provides assistive machine learning predictions designed to supplement, rather than supersede, the independent judgment of licensed medical professionals.
> 
> **Data Privacy & Security:** When deployed locally, patient records and medical imaging files remain entirely on-premises within the local SQLite/PostgreSQL database and filesystem. No Protected Health Information (PHI) is transmitted to third-party public cloud endpoints without explicit institutional configuration.

---

## 📄 License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for full details.
