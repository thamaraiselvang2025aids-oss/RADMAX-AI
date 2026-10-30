// Vercel Serverless API: /api/v1/studies
import fs from 'fs';
import path from 'path';

let cachedStudies = null;

function getStudies() {
  if (cachedStudies) return cachedStudies;
  try {
    const seedPath = path.join(process.cwd(), 'api_seed.json');
    if (fs.existsSync(seedPath)) {
      const data = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
      cachedStudies = data.studies || [];
      return cachedStudies;
    }
  } catch (e) {
    console.warn("Could not load api_seed.json from process.cwd, trying fallback:", e);
  }
  
  // Fallback initial studies if seed file not resolved
  cachedStudies = [
    {
      id: "ST-15904",
      patientId: "PT-27443",
      patientName: "SIVA",
      age: "20",
      gender: "Male",
      modality: "MRI",
      bodyPart: "Brain",
      clinicalHistory: "Uploaded manually via Workstation",
      time: "09:46",
      date: "Saturday, 24 October 2026",
      aiType: "finding",
      aiLabel: "Pituitary Adenoma",
      aiFindingTitle: "Pituitary Adenoma",
      aiLocation: "Sellar / Fronto-Temporal ROI",
      aiConfidence: "99.99%",
      aiSeverity: "HIGH",
      aiExplanation: "XAI Clinical Output: The focal heat map isolates the sellar region. The expansion and asymmetric enhancement identified here are highly consistent with a Pituitary adenoma. (Confidence: 99.99%)",
      heatmapUrl: null
    }
  ];
  return cachedStudies;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;
  const studies = getStudies();

  if (req.method === 'GET') {
    return res.status(200).json(studies);
  }

  if (req.method === 'POST') {
    const newStudy = req.body || {};
    if (!newStudy.id) {
      newStudy.id = `ST-${Math.floor(Math.random() * 90000) + 10000}`;
    }
    const idx = studies.findIndex(s => s.id === newStudy.id);
    if (idx >= 0) {
      studies[idx] = { ...studies[idx], ...newStudy };
    } else {
      studies.unshift(newStudy);
    }
    return res.status(200).json({ status: "success", study: newStudy });
  }

  if (req.method === 'DELETE') {
    if (id) {
      const filtered = studies.filter(s => s.id !== id);
      cachedStudies = filtered;
    }
    return res.status(200).json({ status: "success" });
  }

  res.status(405).json({ error: "Method not allowed" });
}
