// Vercel Serverless API: /api/v1/patients
let patients = [
  {
    id: "PT-27443",
    name: "SIVA",
    dob: "2006-05-08",
    age: "20",
    gender: "Male",
    phone: "+91 9345254528",
    email: "siva@gmail.com",
    address: "COIMBATORE",
    history: "NIL",
    allergies: "DUST",
    doctor: "SMITH",
    notes: "",
    studies: 1,
    lastStudy: "Saturday, 24 October 2026",
    status: "New"
  },
  {
    id: "PT-39458",
    name: "SACHINN",
    dob: "2002-08-05",
    age: "24",
    gender: "Male",
    phone: "+91 9123458697",
    email: "sachinn@gmail.com",
    address: "CHENNAI",
    history: "NIL",
    allergies: "DARK PLACE",
    doctor: "VEERA",
    notes: "",
    studies: 1,
    lastStudy: "Saturday, 24 October 2026",
    status: "New"
  },
  {
    id: "PT-24593",
    name: "VIKRAM",
    dob: "2001-07-05",
    age: "25",
    gender: "Male",
    phone: "+91 9123456789",
    email: "vikram@gmail.com",
    address: "dharmapuri",
    history: "nil",
    allergies: "nil",
    doctor: "VISHAL",
    notes: "",
    studies: 2,
    lastStudy: "Saturday, 24 October 2026",
    status: "New"
  },
  {
    id: "PT-38347",
    name: "Tharun",
    dob: "1998-12-06",
    age: "27",
    gender: "Male",
    phone: "+91 9784653218",
    email: "tharun@gmail.com",
    address: "Erode",
    history: "nil",
    allergies: "dust",
    doctor: "Shanmuga Priya",
    notes: "",
    studies: 2,
    lastStudy: "Saturday, 24 October 2026",
    status: "New"
  },
  {
    id: "PT-89483",
    name: "G. Thamarai Selvan",
    dob: "2004-04-06",
    age: "22",
    gender: "Male",
    phone: "+91 93216549872",
    email: "tthamaraiselvan298@gmail.com",
    address: "dharmapuri",
    history: "nil",
    allergies: "nil",
    doctor: "jithvan",
    notes: "",
    studies: 2,
    lastStudy: "Saturday, 24 October 2026",
    status: "New"
  },
  {
    id: "PT-88440",
    name: "G. Thamarai Selvan",
    dob: "2005-05-06",
    age: "21",
    gender: "Male",
    phone: "+91 9345054448",
    email: "tthamaraiselvan298@gmail.com",
    address: "cbe",
    history: "nil",
    allergies: "dust",
    doctor: "jith",
    notes: "",
    studies: 1,
    lastStudy: "Saturday, 24 October 2026",
    status: "New"
  }
];

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    return res.status(200).json(patients);
  }

  if (req.method === 'POST') {
    const newPt = req.body || {};
    if (!newPt.id) {
      newPt.id = `PT-${Math.floor(Math.random() * 90000) + 10000}`;
    }
    const idx = patients.findIndex(p => p.id === newPt.id);
    if (idx >= 0) {
      patients[idx] = { ...patients[idx], ...newPt };
    } else {
      patients.unshift(newPt);
    }
    return res.status(200).json({ status: "success", patient: newPt });
  }

  if (req.method === 'DELETE') {
    if (id) {
      patients = patients.filter(p => p.id !== id);
    }
    return res.status(200).json({ status: "success" });
  }

  res.status(405).json({ error: "Method not allowed" });
}
