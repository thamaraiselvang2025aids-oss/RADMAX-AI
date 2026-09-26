export enum UserRole {
  RADIOLOGIST = 'RADIOLOGIST',
  PATIENT = 'PATIENT',
}

export enum PriorityLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export type ScanModality = 'X-Ray' | 'MRI' | 'CT Scan' | 'Ultrasound' | 'PET Scan' | 'Mammography';
export type StudyStatus = 'UPLOADED' | 'PROCESSING' | 'AI_READY' | 'REVIEW' | 'DRAFT' | 'FINALIZED';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  patientId?: string; // If user is a patient
  hospitalName?: string;
  department?: string;
  signature?: string;
  avatarUrl?: string;
}

export interface Patient {
  id: string; // matches DB id
  patientId: string; // Public patient ID (e.g. MRN)
  name: string;
  dateOfBirth: string;
  sex: string;
  phone?: string;
  email?: string;
  medicalHistory: string;
  createdAt: string;
  updatedAt: string;
}

export interface Study {
  id: string;
  studyId: string; // DICOM Study Instance UID or custom
  patientId: string;
  modality: ScanModality;
  bodyPart: string;
  studyDate: string;
  accessionNumber?: string;
  fileReference: string; // URL or path to DICOM/image
  numberOfImages: number;
  metadata?: any;
  status: StudyStatus;
  priority: PriorityLevel;
  uploadedAt: string;
  analyzedAt?: string;
  
  // Relations
  patientName?: string;
  patientAge?: number;
  patientSex?: string;
}

export interface AIAnalysis {
  id: string;
  studyId: string;
  modelName: string;
  modelVersion: string;
  findings: string;
  abnormalRegions: Array<{
    label: string;
    confidence: number;
    bbox?: [number, number, number, number]; // x, y, width, height
  }>;
  confidence: number;
  imageQualityScore: number;
  uncertainty: number;
  processingStatus: string;
  createdAt: string;
  heatmapOverlay?: string;
}

export interface Report {
  id: string;
  reportId: string;
  patientId: string;
  studyId: string;
  findings: string;
  impression: string;
  recommendations: string;
  radiologistId: string;
  radiologistName?: string;
  radiologistSignature?: string;
  status: 'DRAFT' | 'FINALIZED';
  createdAt: string;
  signedAt?: string;
}

export interface AuditEvent {
  id: string;
  userId: string;
  username: string;
  role: UserRole;
  action: string;
  studyId?: string;
  timestamp: string;
  details: string;
}

export interface ImageAnnotation {
  id: string;
  type: 'rectangle' | 'circle' | 'caliper';
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface HospitalStats {
  totalPatients: number;
  todayScans: number;
  pendingReports: number;
  criticalCases: number;
  aiAnalysesCount: number;
  avgAiAccuracy: number;
  storageUsedGB: number;
  maxStorageGB: number;
  scansByMonth: Array<{ month: string; count: number; aiAgreed: number }>;
  diseaseDistribution: Array<{ disease: string; count: number; priority: PriorityLevel }>;
}
