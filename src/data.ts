import { Patient, Study, AuditEvent, Report, HospitalStats, PriorityLevel, UserRole } from './types';

// We keep a single radiologist and a single test patient user ONLY for login purposes.
// All clinical mock data has been removed per requirements.
export const DEMO_USERS = [
  {
    id: 'usr_rad_01',
    username: 'dr_radiologist',
    email: 'radiologist@medvision.org',
    role: UserRole.RADIOLOGIST,
    department: 'Radiology',
    hospitalName: 'MedVision Imaging Center',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150',
    signature: 'Dr. Radiologist, MD'
  },
  {
    id: 'usr_pat_01',
    username: 'patient_demo',
    email: 'patient@medvision.org',
    role: UserRole.PATIENT,
    patientId: 'pat_demo_1', // Must match a real created patient to see reports
    department: 'Outpatient Care',
    hospitalName: 'MedVision Imaging Center',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
  }
];

export const DEMO_PATIENTS: Patient[] = [];
export const DEMO_STUDIES: Study[] = [];
export const DEMO_REPORTS: Report[] = [];
export const DEMO_AUDIT_LOGS: AuditEvent[] = [];

export const INITIAL_STATS: HospitalStats = {
  totalPatients: 0,
  todayScans: 0,
  pendingReports: 0,
  criticalCases: 0,
  aiAnalysesCount: 0,
  avgAiAccuracy: 0,
  storageUsedGB: 0,
  maxStorageGB: 1024,
  scansByMonth: [],
  diseaseDistribution: []
};
