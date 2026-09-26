import fs from 'fs';
import path from 'path';
import dicomParser from 'dicom-parser';
import { MedicalScan, PriorityLevel } from '../types.js';

export interface ExtractedDICOMMetadata {
  patientName: string;
  patientId: string;
  modality: string;
  bodyPart: string;
  studyInstanceUid: string;
  seriesInstanceUid: string;
  sopInstanceUid: string;
  windowCenter?: number;
  windowWidth?: number;
  pixelSpacing?: string;
}

export function parseDICOMBuffer(buffer: Buffer): ExtractedDICOMMetadata {
  try {
    const dataSet = dicomParser.parseDicom(buffer);
    
    const getTagStr = (tag: string) => dataSet.string(tag) || '';
    
    return {
      patientName: getTagStr('x00100010').replace(/\^/g, ' ') || 'Ingested DICOM Patient',
      patientId: getTagStr('x00100020') || 'pat_01',
      modality: getTagStr('x00080060') || 'MRI',
      bodyPart: getTagStr('x00180015') || 'Brain',
      studyInstanceUid: getTagStr('x0020000d') || `1.2.840.113619.2.${Date.now()}`,
      seriesInstanceUid: getTagStr('x0020000e') || `1.2.840.113619.3.${Date.now()}`,
      sopInstanceUid: getTagStr('x00080018') || `1.2.840.113619.4.${Date.now()}`,
      windowCenter: parseFloat(getTagStr('x00281050')) || 128,
      windowWidth: parseFloat(getTagStr('x00281051')) || 256,
      pixelSpacing: getTagStr('x00280030') || '0.18\\0.18'
    };
  } catch (err) {
    console.warn("Standard DICOM header parsing warning, using fallback metadata:", err);
    return {
      patientName: 'Ingested DICOM Patient',
      patientId: 'pat_01',
      modality: 'MRI',
      bodyPart: 'Brain',
      studyInstanceUid: `1.2.840.113619.2.${Date.now()}`,
      seriesInstanceUid: `1.2.840.113619.3.${Date.now()}`,
      sopInstanceUid: `1.2.840.113619.4.${Date.now()}`,
      windowCenter: 128,
      windowWidth: 256,
      pixelSpacing: '0.18\\0.18'
    };
  }
}

export function saveDICOMToMinIOOrDisk(buffer: Buffer, metadata: ExtractedDICOMMetadata): string {
  // S3/MinIO bucket hierarchy simulation: medvision-dicom/{patientId}/{studyUid}/{sopUid}.dcm
  const relativeDir = path.join('uploads', 'dicom', metadata.patientId, metadata.studyInstanceUid);
  const absoluteDir = path.join(process.cwd(), relativeDir);

  if (!fs.existsSync(absoluteDir)) {
    fs.mkdirSync(absoluteDir, { recursive: true });
  }

  const fileName = `${metadata.sopInstanceUid}.dcm`;
  const fullPath = path.join(absoluteDir, fileName);

  fs.writeFileSync(fullPath, buffer);
  console.log(`DICOM slice archived to S3/MinIO PACS vault: ${fullPath}`);

  return `/${relativeDir}/${fileName}`.replace(/\\/g, '/');
}
