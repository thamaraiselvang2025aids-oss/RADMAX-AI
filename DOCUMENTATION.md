# MedVision AI: Enterprise AI Medical Imaging & Radiology Platform
## System Architecture, Design Specification & Interactive Blueprint
**Version:** 1.0.0-PROD  
**Author:** Elite Software Architect, UI/UX Principal Designer & AI Clinical Systems Engineer  

---

## 1. Complete Software Architecture

MedVision AI is designed as a highly available, fault-tolerant, and secure full-stack enterprise clinical workflow and medical imaging platform. It adheres to HIPAA security requirements, DICOM standards, and clinical integration frameworks (HL7/FHIR).

The architecture is split into five key decoupling layers:
1. **Client Tier (Presentation Layer):** Responsive SPA built with React, Tailwind CSS, Framer Motion, and HTML5 Canvas (simulating professional PACS viewing features and diagnostics controls).
2. **Gateway Tier (Access Control):** Express Reverse Proxy, JWT validation, SSL termination, and rate limiting.
3. **Application Tier (Business Logic):** Enterprise REST APIs, case collaboration engine, emergency queuing algorithms, and notification microservices.
4. **AI Core Engine (Inference Layer):** Integrating state-of-the-art vision models (PyTorch, MONAI, OpenCV) via a high-performance model server, augmented by server-side Gemini 3.5 AI for clinical draft report synthesis and interactive reasoning.
5. **Storage Tier (Persistence & PACS System):** PostgreSQL database for clinical records, audit logs, and diagnostic files, coupled with S3/MinIO for secure DICOM file storage.

---

## 2. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                              1. PRESENTATION LAYER                                |
|   +---------------------+   +---------------------+   +-----------------------+   |
|   |  Radiologist Screen |   | Patient Portal UI   |   | Super-Admin Control  |   |
|   +----------+----------+   +----------+----------+   +-----------+-----------+   |
+--------------|-------------------------|--------------------------|---------------+
               v                         v                          v
+-----------------------------------------------------------------------------------+
|                              2. ACCESS CONTROL GATEWAY                            |
|       [ SSL/TLS Ingress ] -> [ JWT Auth Gate ] -> [ Rate Limiting Proxy ]          |
+------------------------------------+----------------------------------------------+
                                     |
                                     v
+-----------------------------------------------------------------------------------+
|                              3. APPLICATION SERVERS                               |
|   +---------------------+   +---------------------+   +-----------------------+   |
|   | PACS / DICOM Ingest |   | Emergency Queue Mgr |   | Collaboration Board   |   |
|   +----------+----------+   +----------+----------+   +-----------+-----------+   |
+--------------|-------------------------|--------------------------|---------------+
               |                         |                          |
               +----------+--------------+--------------------------+
                          |
                          v
+-----------------------------------------------------------------------------------+
|                              4. AI ENGINE INFERENCE                               |
|   +---------------------+   +---------------------+   +-----------------------+   |
|   | OpenCV Pre-processor|   | MONAI Segmenter/Det |   | Gemini Server Agent   |   |
|   | (CLAHE, Normalizer) |   | (U-Net, DenseNet)   |   | (Draft Synthesis)     |   |
|   +---------------------+   +---------------------+   +-----------------------+   |
+------------------------------------+----------------------------------------------+
                                     |
                                     v
+-----------------------------------------------------------------------------------+
|                              5. STORAGE & INFRASTRUCTURE                          |
|   +---------------------+   +---------------------+   +-----------------------+   |
|   | PostgreSQL Schema   |   | S3 Object Storage   |   | HL7/FHIR Adapter      |   |
|   | (Audit Logs, Cases) |   | (Encrypted DICOM)   |   | (EMR Interop)         |   |
|   +---------------------+   +---------------------+   +-----------------------+   |
+-----------------------------------------------------------------------------------+
```

---

## 3. Database Schema (Normalized SQL)

Below is the production-grade PostgreSQL schema with indexing, foreign keys, constraints, and audit log mapping.

```sql
-- Role Enumeration
CREATE TYPE user_role_enum AS ENUM (
  'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'RADIOLOGIST', 'DOCTOR', 'LAB_TECHNICIAN', 'RECEPTIONIST', 'PATIENT', 'RESEARCHER'
);

-- Priority Levels for Emergency Engine
CREATE TYPE priority_level_enum AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- Patient Information Table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(15) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  allergies TEXT DEFAULT '',
  medications TEXT DEFAULT '',
  medical_history TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users & Authentications Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'DOCTOR',
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hospitals Table
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scans Table (PACS / DICOM Records)
CREATE TABLE medical_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  modality VARCHAR(15) NOT NULL, -- 'XRAY', 'MRI', 'CT', 'ULTRASOUND', 'PET', 'MAMMOGRAPHY'
  body_part VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  file_size_mb NUMERIC(6, 2) NOT NULL,
  emergency_priority priority_level_enum NOT NULL DEFAULT 'LOW',
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Inference Results Table
CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES medical_scans(id) ON DELETE CASCADE,
  quality_score NUMERIC(5, 2) NOT NULL, -- Percentage quality assessment
  detected_diseases JSONB NOT NULL, -- List of objects with disease and probability
  segmentation_mask_url TEXT,
  heatmap_url TEXT,
  confidence_score NUMERIC(5, 2) NOT NULL,
  growth_percentage NUMERIC(6, 2) DEFAULT NULL, -- Growth from historical scan if applicable
  ai_draft_findings TEXT NOT NULL,
  ai_draft_impression TEXT NOT NULL,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Doctor Clinical Reports Table
CREATE TABLE clinical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES medical_scans(id) ON DELETE CASCADE,
  radiologist_id UUID REFERENCES users(id),
  ai_analysis_id UUID REFERENCES ai_analyses(id) ON DELETE SET NULL,
  findings TEXT NOT NULL,
  impression TEXT NOT NULL,
  recommendations TEXT NOT NULL,
  doctor_signature_url TEXT,
  is_finalized BOOLEAN DEFAULT FALSE,
  finalized_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Discussion Board & Second Opinion Table
CREATE TABLE discussion_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES medical_scans(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id),
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logging & Security Table
CREATE TABLE security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  resource_accessed VARCHAR(255) NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indices
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_medical_scans_patient ON medical_scans(patient_id);
CREATE INDEX idx_medical_scans_priority ON medical_scans(emergency_priority);
CREATE INDEX idx_ai_analyses_scan ON ai_analyses(scan_id);
CREATE INDEX idx_clinical_reports_scan ON clinical_reports(scan_id);
```

---

## 4. Entity-Relationship Diagram (ERD) Text Notation

```
    +-----------------+             +-----------------+
    |    PATIENTS     |1           *|      USERS      |
    |-----------------|-------------|-----------------|
    | id (PK)         |             | id (PK)         |
    | first_name      |             | username        |
    | date_of_birth   |             | password_hash   |
    | email (Unique)  |             | role (Enum)     |
    +--------+--------+             | patient_id (FK) |
             |                      +---+----+--------+
             |                          |    |
             |1                         |1   |1
             v *                        |    v *
    +-----------------+                 |  +-------------------+
    |  MEDICAL_SCANS  |                 |  | AUDIT_LOGS        |
    |-----------------|                 |  |-------------------|
    | id (PK)         |                 |  | id (PK)           |
    | patient_id (FK) |<----------------+  | user_id (FK)      |
    | modality        |                    | action            |
    | priority (Enum) |                    +-------------------+
    +---+--------+----+
        |        |
        |1       |1
        v *      v *
+-------+-----+  +-----+-----------+
| AI_ANALYSES |  |CLINICAL_REPORTS |
|-------------|  |-----------------|
| id (PK)     |  | id (PK)         |
| scan_id (FK)|  | scan_id (FK)    |
| quality_sc  |  | radiologist(FK) |
| findings    |  | findings        |
+-------------+  +-----------------+
```

---

## 5. Directory & Folder Structure (Enterprise Standard)

```
medvision-ai/
├── .env.example
├── .gitignore
├── metadata.json
├── package.json
├── server.ts                  # Production Custom Express + Vite Server Entry point
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx               # Client main bootstrapper
│   ├── App.tsx                # Client core entry route switcher
│   ├── index.css              # Custom Tailwind configuration import
│   ├── types.ts               # Strict TypeScript Shared interfaces
│   ├── data.ts                # Master static clinical files, patients, and DICOM series data
│   ├── components/            # Reusable UI Custom Components (Glassmorphic & Rounded)
│   │   ├── Sidebar.tsx        # Responsive navigation rail supporting 18 destinations
│   │   ├── PACSViewer.tsx     # Professional HTML5 Canvas DICOM simulator (filters, scales)
│   │   ├── AIReportBuilder.tsx# Draft reports editor, human verification digital signature
│   │   ├── AIChatBot.tsx      # Multi-turn server-side clinical conversational bot
│   │   ├── AuditLogs.tsx      # Real-time enterprise access controls logs
│   │   ├── Timeline.tsx       # Historical patient timelines
│   │   └── DiseaseProgress.tsx# Scan comparison with slider and metrics highlights
│   └── views/                 # Top-level Dashboard layout variations by Role
│       ├── LoginView.tsx      # Fully animated login with mock MFA otp triggers
│       ├── SuperAdminView.tsx # Comprehensive telemetry, storage quotas, performance metrics
│       ├── RadiologistView.tsx# Hot emergency queue, side-by-side DICOM annotations
│       ├── DoctorView.tsx     # Medication panels, referrals, patient boards, sharing
│       └── PatientView.tsx    # Simplified clinical timeline, layperson AI translator
```

---

## 6. Full Feature List
*   **Unified Multi-Role Dashboard Grid:** Adaptive UI customized for 5 primary roles (Radiologist, Doctor, Patient, Super Admin, and Researcher) using the same credential ecosystem.
*   **DICOM Canvas Workstation:** High-fidelity clinical workspace supporting dynamic Zoom, Pan, Rotation, Contrast (CLAHE), Brightness, Spatial calipers, Angle calipers, Free-drawing annotators, and visual Segmentation Overlays.
*   **Emergency Worklist Sorter:** Priority dispatch engine sorting medical scans using a multi-parameter risk algorithm (Modality, Organ system, Quality check, Clinical notes) with visual flashing strobe alerts.
*   **Explainable AI (XAI) Suite:** Saliency map rendering (GradCAM simulator) coupled with a complete, structured clinical finding draft.
*   **Disease Growth Progressor:** Temporal alignment tool comparing previous and current scans, tracking tumor volume progression percentages over calendar days.
*   **Google Gemini-Powered Co-Pilot:** Interactive chat window directly wired to backend servers, capable of drafting radiology report components, querying clinical codes, and clarifying results.
*   **HIPAA Compliant Audit Vault:** Non-repudiation logging ledger logging logins, record access, modifications, file uploads, and diagnostic confirmations.

---

## 7. UI Screen List
1.  **MFA Shield Login Screen:** Glassmorphism card, role selector, credentials input, sliding verification sliders.
2.  **Radiologist Workspace Dashboard:** Left: Patient medical history timeline. Center: Professional PACS Canvas, overlay controls. Right: Automated AI analysis draft findings and growth index.
3.  **Emergency Command Hub:** Prioritized live list of pending scans with live status counters, color-coded urgency rows, and direct "Launch Diagnostic Viewer" triggers.
4.  **Doctor Collaboration Forum:** Threaded case discussion boards, document sharing modals, and second-opinion requests.
5.  **Patient Health Portal:** Simplified terminology dashboard translating complex reports ("Pleural Effusion" -> "Fluid retention near the lungs") using server-side Generative AI.
6.  **Super Admin Telemetry Panel:** Cluster performance metrics, average AI classification accuracy, total disk space utilization, and user auditing.

---

## 8. API Architecture Specification

| Endpoint | Method | Role | Request Schema | Response Schema | Status Codes |
|---|---|---|---|---|---|
| `/api/auth/login` | POST | Public | `{ username, password, mfaCode }` | `{ token, role, userProfile }` | 200 OK, 401 Unauthorized, 429 Rate Limited |
| `/api/scans/emergency-queue` | GET | Clinical | None | `Array<{ scanId, priority, bodyPart, scannedAt }>` | 200 OK, 403 Forbidden |
| `/api/scans/:id/ai-analyze` | POST | Radiologist | `{ generateGradCam: boolean }` | `{ findings, confidence, segmentationData }` | 200 OK, 404 Scan Not Found |
| `/api/scans/:id/progression` | GET | Clinical | None | `{ currentScan, previousScan, growthPercent }` | 200 OK, 404 Scan Not Found |
| `/api/chat/clinical-copilot` | POST | Clinical | `{ prompt, scanId, chatHistory }` | `{ textResponse, clinicalCitations }` | 200 OK, 500 API Error |

---

## 9. AI Engine Workflow Execution Pipeline

```
[ Upload DICOM file (.dcm) ]
             │
             ▼
[ PACS Receiver (Ingests & anonymizes metadata tags) ]
             │
             ▼
[ Pre-Processing Pipeline (Denoising, CLAHE enhancement, Windowing, Slicing) ]
             │
             ▼
[ OpenCV Quality Assessment (checks blur, artifacts, resolution) ]
             │
             ├──────────────────────────┐
      (Quality >= 85%)           (Quality < 85%)
             │                          │
             ▼                          ▼
[ PyTorch MONAI Neural Network ] [ Flag scan to PACS for re-acquisition ]
  - U-Net Segmentation Masks
  - ResNet-50 Disease Classifier
             │
             ▼
[ GradCAM Generation (Extract gradients to yield heatmap coordinates) ]
             │
             ▼
[ Server-Side Gemini API Structuring (Findings, Impression, ICD-10 Code suggestions) ]
             │
             ▼
[ Emergency Engine Sorter (Prioritize queue if risk threshold exceeds 75%) ]
             │
             ▼
[ Clinical Workstation (Interactive review, manual adjustments, digital signature) ]
```

---

## 10. Development Roadmap & Milestones
*   **Phase 1 (Week 1-2):** Repository structuring, full-stack environment setup, Express backend APIs, role-based JWT system implementation.
*   **Phase 2 (Week 3-4):** Client layout design, responsive sidebar navigation, interactive DICOM canvas workstation with mouse overlays.
*   **Phase 3 (Week 5-6):** PyTorch/MONAI inference pipeline integration, Google Gemini server co-pilot development, and layperson medical report translations.
*   **Phase 4 (Week 7-8):** Enterprise HIPAA security checklist, non-repudiation audit logs, system performance testing, and production deployment on Kubernetes/Cloud Run.

---

## 11. Recommended Datasets & Repositories
*   **LUNA16 Dataset:** For lung nodule detection and localization.
*   **Brain Tumor Segmentation (BraTS) Challenge:** Multi-modal MRI scans of glioblastomas.
*   **MIMIC-CXR-JPG:** 370k+ chest radiographs with clinical findings and radiology reports.
*   **RSNA Bone Age Dataset:** Hand radiographs for metabolic bone age estimation.

---

## 12. Security Specification (HIPAA Compliance Checklist)
*   **Data at Rest Encryption:** AES-256 for all local storage files and databases.
*   **Data in Transit Encryption:** TLS 1.3 enforced for all API routes and websocket gateways.
*   **Anonymization Layer:** Auto-strip DICOM headers (Patient Name, DOB, Address, Social) on server ingest.
*   **Access Tracking:** Every clinical record view triggers a immutable entry into the `security_audit_logs` table.
*   **Strict Session Expiry:** Auto logout after 15 minutes of user inactivity.

---

*This specification represents the highest standard of enterprise clinical system design, mirroring architecture from world-leading healthcare organizations.*
