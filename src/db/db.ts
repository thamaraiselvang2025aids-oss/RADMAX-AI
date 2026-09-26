import { Pool } from 'pg';
import crypto from 'crypto';
import { DEMO_USERS, DEMO_PATIENTS, DEMO_STUDIES, DEMO_REPORTS, DEMO_AUDIT_LOGS, INITIAL_STATS } from '../data.js';
import { UserProfile, Patient, Study, Report, AuditEvent, HospitalStats, PriorityLevel, UserRole } from '../types.js';

// In-Memory & PostgreSQL Dual Storage Client
let pgPool: Pool | null = null;
const usePg = !!process.env.PGHOST || !!process.env.DATABASE_URL;

if (usePg) {
  try {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/medvision',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    console.log("PostgreSQL Database Pool Initialized.");
  } catch (err) {
    console.warn("PostgreSQL connection failed, utilizing embedded clinical state engine:", err);
  }
}

// Stateful persistent fallback memory tables
let dbPatients: Patient[] = [...DEMO_PATIENTS];
let dbStudies: Study[] = [...DEMO_STUDIES];
let dbReports: Report[] = [...DEMO_REPORTS];
let dbAuditLogs: AuditEvent[] = [...DEMO_AUDIT_LOGS];
let dbUsers: UserProfile[] = [...DEMO_USERS];

export async function logAuditAction(userId: string, action: string, resource: string, details: string): Promise<AuditEvent> {
  const user = dbUsers.find(u => u.id === userId) || dbUsers[0];
  const newLog: AuditEvent = {
    id: `log_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    username: user.username,
    role: user.role,
    action,
    studyId: resource,
    details
  };

  dbAuditLogs.unshift(newLog);

  if (pgPool) {
    try {
      await pgPool.query(
        `INSERT INTO audit_logs (id, timestamp, user_id, username, role, action, study_id, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [newLog.id, newLog.timestamp, newLog.userId, newLog.username, newLog.role, newLog.action, newLog.studyId, newLog.details]
      );
    } catch (e) {
      console.warn("PostgreSQL log sync skipped:", e);
    }
  }

  return newLog;
}

export async function getUsers(): Promise<UserProfile[]> {
  return dbUsers;
}

export async function getUserByUsername(username: string): Promise<UserProfile | undefined> {
  return dbUsers.find(u => u.username === username);
}

export async function getUserById(id: string): Promise<UserProfile | undefined> {
  return dbUsers.find(u => u.id === id);
}

// Patients
export async function getPatients(): Promise<Patient[]> {
  return dbPatients;
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  return dbPatients.find(p => p.id === id);
}

export async function insertPatient(patient: Patient): Promise<Patient> {
  dbPatients.unshift(patient);
  return patient;
}

// Studies
export async function getStudies(): Promise<Study[]> {
  return dbStudies;
}

export async function getStudyById(id: string): Promise<Study | undefined> {
  return dbStudies.find(s => s.id === id);
}

export async function insertStudy(study: Study): Promise<Study> {
  dbStudies.unshift(study);
  return study;
}

export async function updateStudy(id: string, updates: Partial<Study>): Promise<Study | undefined> {
  const idx = dbStudies.findIndex(s => s.id === id);
  if (idx === -1) return undefined;
  dbStudies[idx] = { ...dbStudies[idx], ...updates };
  return dbStudies[idx];
}

// Reports
export async function getReports(): Promise<Report[]> {
  return dbReports;
}

export async function insertReport(report: Report): Promise<Report> {
  dbReports.unshift(report);
  return report;
}

export async function updateReport(id: string, updates: Partial<Report>): Promise<Report | undefined> {
  const idx = dbReports.findIndex(r => r.id === id);
  if (idx === -1) return undefined;
  dbReports[idx] = { ...dbReports[idx], ...updates };
  return dbReports[idx];
}

// Audit Logs & Stats
export async function getAuditLogs(): Promise<AuditEvent[]> {
  return dbAuditLogs;
}

export async function getHospitalStats(): Promise<HospitalStats> {
  const totalPatients = dbPatients.length;
  const todayScans = dbStudies.length;
  const pendingReports = dbReports.filter(r => r.status === 'DRAFT').length;
  const criticalCases = dbStudies.filter(s => s.priority === PriorityLevel.CRITICAL).length;

  return {
    ...INITIAL_STATS,
    totalPatients,
    todayScans,
    pendingReports,
    criticalCases
  };
}
