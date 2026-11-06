import React, { useState, useEffect, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { 
  Camera, 
  BookOpen, 
  Plus, 
  X, 
  Loader2, 
  Library,
  Trash2,
  ChevronDown,
  Key,
  FileText,
  CheckCircle2,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  LogOut,
  Pencil,
  RefreshCw,
  Wand2,
  AlertCircle,
  Info,
  Globe2,
  Sparkles,
  Clock,
  Image as ImageIcon,
  RotateCcw,
  RotateCw,
  Crop
} from 'lucide-react';

// --- HKDSE SYLLABUS DATA STRUCTURE ---
const HKDSE_SYLLABUS = {
  "biology": {
    name: "Biology",
    topics: [
      "Topic 1 Cell and membrane transport", "Topic 2 Enzymes", "Topic 3 Nutrition in humans", 
      "Topic 4 Gas exchange in humans", "Topic 5 Transport in humans", "Topic 6 Nutrition and gas exchange in plants", 
      "Topic 7 Transpiration, transport and support in plants", "Topic 8 Cell division and reproduction", 
      "Topic 9 Growth and development", "Topic 10 Growth responses of plants", "Topic 11 Coordination in humans", 
      "Topic 12 Movement in humans", "Topic 13 Homeostasis", "Topic 14 Biodiversity", "Topic 15 Ecosystems", 
      "Topic 16 Photosynthesis", "Topic 17 Respiration", "Topic 18 Health and diseases", 
      "Topic 19 Basic genetics, Molecular and applied genetics", "Topic 20 Evolution", 
      "Elective 1 Human Physiology", "Elective 2 Applied Ecology", "Elective 3 Biotechnology"
    ]
  },
  "chemistry": {
    name: "Chemistry",
    topics: [
      "Topic 1 Laboratory Safety and Precautions", "Topic 2 Planet Earth", "Topic 3 Microscopic World", 
      "Topic 4 Metals", "Topic 5 Acid and Bases", "Topic 6 Fossil fuels and Carbon Compounds", 
      "Topic 7 Microscopic World II", "Topic 8 Redox Reactions, Chemical Cells and Electrolysis", 
      "Topic 9 Chemical Reactions and Energy", "Topic 10 Rate of Reaction", "Topic 11 Chemical Equilibrium", 
      "Topic 12 Chemistry of Carbon Compounds", "Topic 13 Patterns in the Chemical World", 
      "E1 Industrial Chemistry", "E2 Analytical Chemistry"
    ]
  },
  "economics": {
    name: "Economics",
    topics: [
      "Topic 1 Basic Concept", "Topic 2 Production", "Topic 3 Input-Output Relationship", 
      "Topic 4 Ownership And Expansion Of Firms", "Topic 5 Market Structure", "Topic 6 Demand And Supply I", 
      "Topic 7 Demand And Supply II", "Topic 8 Market Intervention", "Topic 9 Roles Of Government", 
      "Topic 10 National Income", "Topic 11 Macroeconomics Problems", "Topic 12 The Budget And Fiscal Policy", 
      "Topic 13 Money And Banking I", "Topic 14 Money And Banking II", "Topic 15 Aggregate Demand And Aggregate Supply", 
      "Topic 16 International Trade", "Topic 17 International Finance", "Elective 2: Extension of Trade Theory And Economic Development"
    ]
  },
  "m1": {
    name: "M1",
    topics: [
      "Topic 1 Binomial Expansion", "Topic 2 Exponential and Logarithmic Functions", 
      "Topic 3 Derivatives and Differentiation of Functions", "Topic 4 Applications of Differentiation", 
      "Topic 5 Indefinite Integrals", "Topic 6 Definite Integrals", "Topic 7 Further Probability", 
      "Topic 8 Discrete Random Variables", "Topic 9 Binomial, Geometric and Poisson Distributions", 
      "Topic 10 Normal Distribution", "Topic 11 Point and Interval Estimation"
    ]
  },
  "m2": {
    name: "M2",
    topics: [
      "Topic 1 Mathematical Induction", "Topic 2 Binomial Theorem", "Topic 3 More about Trigonometric Functions", 
      "Topic 4 Limits and Derivatives", "Topic 5 Differentiation", "Topic 6 Applications of differentiation", 
      "Topic 7 Indefinite Integrals", "Topic 8 Definite Integrals", "Topic 9 Applications of Definite Integrals", 
      "Topic 10 Matrices and Determinants", "Topic 11 System of Linear Equations", "Topic 12 Vectors", "Topic 13 Product of Vectors"
    ]
  },
  "math compulsory": {
    name: "Math Compulsory",
    topics: [
      "Topic 1 Estimation", "Topic 2 Percentages", "Topic 3 Indices and Logarithms", "Topic 4 Polynomials", 
      "Topic 5 Formulas", "Topic 6 Identities, Equations and the Number System", "Topic 7 Functions and Graphs", 
      "Topic 8 Rate, Ratio and Variation", "Topic 9 Arithmetic and Geometric Sequences", "Topic 10 Inequalities and Linear Programming", 
      "Topic 11 Geometry of Rectilinear Figure", "Topic 12 Geometry of Circles", "Topic 13 Basic Trigonometry", 
      "Topic 14 Applications of Trigonometry", "Topic 15 Mensuration", "Topic 16 Coordinate Geometry", 
      "Topic 17 Counting Principles and Probability", "Topic 18 Statistics"
    ]
  },
  "physics": {
    name: "Physics",
    topics: [
      "Topic 1 Temperature, Heat and Internal energy", "Topic 2 Transfer Processes", "Topic 3 Change of State", 
      "Topic 4 General Gas Law", "Topic 5 Kinetic Theory", "Topic 6 Position and Movement", "Topic 7 Newton's Laws", 
      "Topic 8 Moment of Force", "Topic 9 Work, Energy and Power", "Topic 10 Momentum", "Topic 11 Projectile Motion", 
      "Topic 12 Circular Motion", "Topic 13 Gravitation", "Topic 14 Wave Propagation", "Topic 15 Wave Phenomena", 
      "Topic 16 Reflection and Refraction of Light", "Topic 17 Lenses", "Topic 18 Wave Nature of Light", "Topic 19 Sound", 
      "Topic 20 Electrostatics", "Topic 21 Electric Circuits", "Topic 22 Domestic Electricity", "Topic 23 Magnetic Field", 
      "Topic 24 Electromagnetic Induction", "Topic 25 Alternating Current", "Topic 26 Radiation and Radioactivity", 
      "Topic 27 Atomic Model", "Topic 28 Nuclear Energy", "Elective 1 Astronomy and Space Science", 
      "Elective 2 Atomic World", "Elective 3 Energy and Use of Energy"
    ]
  }
};

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyAu97M1DGExntXKVLdlZtX2DXIGs2zsnVA",
  authDomain: "hkdse-app-4a594.firebaseapp.com",
  projectId: "hkdse-app-4a594",
  storageBucket: "hkdse-app-4a594.firebasestorage.app",
  messagingSenderId: "14854715570",
  appId: "1:14854715570:web:70fe20509bf6574ae9b1ab",
  measurementId: "G-5QRG5JR0WB"
};

let app, auth, db, appId;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  appId = firebaseConfig.projectId || 'hkdse-app';
} catch (e) {
  console.warn("Firebase Setup Warning:", e);
}

// Option Extraction
const extractOptionsFromText = (rawText) => {
  if (!rawText) return { cleanQuestion: '', options: null };
  const text = rawText.trim();
  const optionRegex = /(?:^|\n|\s)(?:\(?([A-D])[\.\)]\s*)([\s\S]*?)(?=(?:^|\n|\s)\(?[A-D][\.\)]\s*|$)/gi;
  const matches = [...text.matchAll(optionRegex)];

  if (matches.length >= 2) {
    const extractedOptions = { A: '', B: '', C: '', D: '' };
    matches.forEach(m => {
      const letter = m[1].toUpperCase();
      const content = m[2].trim();
      if (['A', 'B', 'C', 'D'].includes(letter)) extractedOptions[letter] = content;
    });
    const firstOptIdx = text.search(/(?:^|\n|\s)\(?[A-D][\.\)]\s*/i);
    const cleanQuestion = firstOptIdx !== -1 ? text.substring(0, firstOptIdx).trim() : text;
    return { cleanQuestion, options: extractedOptions };
  }
  return { cleanQuestion: text, options: null };
};

// Image Utilities
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
});

const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);
  ctx.drawImage(image, safeArea / 2 - image.width / 2, safeArea / 2 - image.height / 2);

  const data = ctx.getImageData(
    safeArea / 2 - image.width / 2 + pixelCrop.x,
    safeArea / 2 - image.height / 2 + pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  const finalCanvas = document.createElement('canvas');
  const MAX_WIDTH = 1000;
  let scale = 1;
  if (pixelCrop.width > MAX_WIDTH) scale = MAX_WIDTH / pixelCrop.width;
  
  finalCanvas.width = pixelCrop.width * scale;
  finalCanvas.height = pixelCrop.height * scale;
  
  const intermediateCanvas = document.createElement('canvas');
  intermediateCanvas.width = pixelCrop.width;
  intermediateCanvas.height = pixelCrop.height;
  intermediateCanvas.getContext('2d').putImageData(data, 0, 0);

  finalCanvas.getContext('2d').drawImage(intermediateCanvas, 0, 0, finalCanvas.width, finalCanvas.height);

  return finalCanvas.toDataURL('image/jpeg', 0.85);
};

const rotateBase64Image = (base64, direction = 'cw') => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      
      if (direction === 'cw') {
        ctx.translate(canvas.width, 0);
        ctx.rotate(90 * Math.PI / 180);
      } else {
        ctx.translate(0, canvas.height);
        ctx.rotate(-90 * Math.PI / 180);
      }
      
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = base64;
  });
};

// OCR Engines
const runLocalOCR = async (imageFile) => {
  if (!window.Tesseract) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Could not load browser OCR engine script.'));
      document.head.appendChild(script);
    });
  }
  const worker = await window.Tesseract.createWorker('eng');
  const result = await worker.recognize(imageFile);
  await worker.terminate();
  return result?.data?.text || '';
};

const runGeminiAIOCR = async (base64Image, mimeType, questionType, apiKey, preExtractedText = '') => {
  const effectiveKey = apiKey || '';
  if (!effectiveKey) throw new Error('API key is missing. Please enter your Gemini API key in the setting input.');

  const primaryEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${effectiveKey}`;

  const prompt = `You are an expert HKDSE exam question analyzer. 
Analyze the question image and pre-extracted OCR text below:
${preExtractedText ? `RAW OCR TEXT:\n"${preExtractedText}"\n` : ''}

CRITICAL RULES:
1. "subject": Auto-detect subject ("Biology", "Chemistry", "Economics", "M1", "M2", "Math Compulsory", or "Physics").
2. "question": Extract ONLY the main question body text. INTELLIGENTLY separate this from the options. Clean up any OCR artifacts. DO NOT include the multiple choice options (A, B, C, D) or their corrupted OCR equivalents in this string. 
3. "options": Intelligently identify and map the 4 multiple choice options into keys A, B, C, and D.
4. "answer": Extract correct option letter (A, B, C, or D) or handwritten solution logic.`;

  const parts = [{ text: prompt }];
  if (base64Image) {
    parts.push({ inlineData: { mimeType: mimeType || 'image/jpeg', data: base64Image } });
  }

  const responseSchema = {
    type: "OBJECT",
    properties: {
      subject: { type: "STRING" },
      question: { type: "STRING" },
      options: {
        type: "OBJECT",
        properties: { A: { type: "STRING" }, B: { type: "STRING" }, C: { type: "STRING" }, D: { type: "STRING" } }
      },
      answer: { type: "STRING" }
    }
  };

  const requestBody = JSON.stringify({
    contents: [{ role: 'user', parts: parts }],
    generationConfig: { responseMimeType: 'application/json', responseSchema: responseSchema, temperature: 0.1 }
  });

  const response = await fetch(primaryEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: requestBody
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Request Failed (${response.status}): ${errText}`);
  }

  const jsonRes = await response.json();
  const rawText = jsonRes?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!rawText) throw new Error("AI returned an empty response.");

  try {
    const cleanJson = rawText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    throw new Error("Failed to parse AI output into structured format.");
  }
};

// Auth Component
function AuthView({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleAuth = async (isLogin) => {
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    setLoading(true);
    setError('');
    const email = `${username.trim().toLowerCase()}@dsehub.local`;
    
    try {
      if (auth) {
        if (isLogin) {
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          await createUserWithEmailAndPassword(auth, email, password);
        }
        onLoginSuccess(null);
      } else {
        const fallbackUid = 'usr_' + btoa(username.trim().toLowerCase()).replace(/=/g, '');
        onLoginSuccess({ uid: fallbackUid, email: email, displayName: username.trim() });
      }
    } catch (err) {
      let msg = err.message || '';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password')) {
        setError('Invalid username or password.');
      } else if (msg.includes('auth/email-already-in-use')) {
        setError('This username is already registered! Click "Log In" instead.');
      } else {
        const fallbackUid = 'usr_' + btoa(username.trim().toLowerCase()).replace(/=/g, '');
        onLoginSuccess({ uid: fallbackUid, email: email, displayName: username.trim() });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="max-w-4xl w-full flex flex-col md:flex-row gap-6 items-start justify-center">
        
        <div className="bg-white/95 backdrop-blur-sm w-full md:w-[420px] rounded-3xl p-8 shadow-2xl border border-white/10 shrink-0">
           <div className="text-center mb-8">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-4 rounded-2xl inline-block mb-5 shadow-lg shadow-blue-600/30">
                 <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">HKDSE Hub</h2>
              <p className="text-sm text-slate-500 mt-2 font-medium">Your intelligent exam revision bank.</p>
           </div>
           
           {error && (
             <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6 border border-red-100 font-medium flex items-start gap-2">
               <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
               {error}
             </div>
           )}

           <div className="space-y-5">
              <div>
                 <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Username</label>
                 <input 
                   type="text" 
                   value={username}
                   onChange={e => setUsername(e.target.value)}
                   className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
                   placeholder="e.g. jason_dse2025"
                 />
              </div>
              <div>
                 <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Password</label>
                 <input 
                   type="password" 
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
                   placeholder="Minimum 6 characters"
                 />
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-4">
                 <button 
                   onClick={() => handleAuth(true)}
                   disabled={loading}
                   className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                 >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
                 </button>
                 <button 
                   onClick={() => handleAuth(false)}
                   disabled={loading}
                   className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-slate-900/20 active:scale-[0.98]"
                 >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
                 </button>
              </div>

              <div className="pt-4 md:hidden">
                 <button 
                   onClick={() => setShowGuide(!showGuide)}
                   className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl"
                 >
                   <Info className="w-4 h-4" /> {showGuide ? 'Hide Guide' : 'Read Usage Guide'}
                 </button>
              </div>
           </div>
        </div>

        <div className={`w-full md:w-[480px] bg-slate-800/60 backdrop-blur-md rounded-3xl p-8 border border-white/10 text-white shadow-2xl transition-all duration-300 ${showGuide ? 'block' : 'hidden md:block'}`}>
           <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-300">
             <Sparkles className="w-6 h-6" /> Welcome to the Hub
           </h3>
           <div className="space-y-6 text-sm text-slate-300">
             <div>
               <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                 <BookOpen className="w-4 h-4 text-emerald-400" /> 1. Core Functions
               </h4>
               <ul className="space-y-2 pl-6 list-disc marker:text-slate-500">
                 <li><strong>Snap & Store:</strong> Take photos of DSE past papers.</li>
                 <li><strong>AI Separation:</strong> Auto extracts questions, options, and topics.</li>
                 <li><strong>Progress Tracking:</strong> Tag questions with Tick or Cross to manage review.</li>
               </ul>
             </div>
             <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700">
               <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                 <Key className="w-4 h-4 text-amber-400" /> 2. Gemini AI Key Setup
               </h4>
               <p className="text-xs text-slate-300">Get your key for free from Google AI Studio and enter it into app settings.</p>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}

// Main App
export default function App() {
  const [user, setUser] = useState(null);
  const [localAccount, setLocalAccount] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [hasPassedAuthScreen, setHasPassedAuthScreen] = useState(false);
  
  const [view, setView] = useState('library');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userApiKey, setUserApiKey] = useState('');

  const activeUser = user || localAccount;

  useEffect(() => {
    if (userApiKey && activeUser && db && hasPassedAuthScreen) {
      const userRef = doc(db, 'artifacts', appId, 'users', activeUser.uid, 'settings', 'profile');
      setDoc(userRef, { apiKey: userApiKey }, { merge: true }).catch(err => 
        console.warn("Cloud profile save error:", err)
      );
    }
  }, [userApiKey, activeUser, hasPassedAuthScreen]);

  useEffect(() => {
    if (!auth) {
      setLoadingAuth(false);
      return;
    }
    const initAnon = async () => {
      try {
        if (!auth.currentUser) await signInAnonymously(auth);
      } catch (err) {}
    };
    initAnon();

    const unsub = onAuthStateChanged(auth, async (usr) => {
      setUser(usr);
      setLoadingAuth(false);
      if (usr) {
        setHasPassedAuthScreen(true);
        setLocalAccount(null);
        if (db) {
          try {
            const userRef = doc(db, 'artifacts', appId, 'users', usr.uid, 'settings', 'profile');
            const snap = await getDoc(userRef);
            if (snap.exists() && snap.data().apiKey) {
              setUserApiKey(snap.data().apiKey);
            }
          } catch (e) {}
        }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!activeUser || !db || !hasPassedAuthScreen) return;
    const qRef = collection(db, 'artifacts', appId, 'users', activeUser.uid, 'questions');
    const unsub = onSnapshot(qRef, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setQuestions(data);
    }, (err) => {
      console.error("Cloud Database listener error:", err);
    });
    return () => unsub();
  }, [activeUser, hasPassedAuthScreen]);

  const handleLogout = async () => {
    if (auth) await signOut(auth);
    setLocalAccount(null);
    setUser(null);
    setHasPassedAuthScreen(false);
    setUserApiKey('');
    setQuestions([]);
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <span className="text-indigo-200 text-sm font-medium">Loading Workspace...</span>
        </div>
      </div>
    );
  }

  if (!hasPassedAuthScreen) {
    return (
      <AuthView 
        onLoginSuccess={(fallbackUser) => {
          if (fallbackUser) setLocalAccount(fallbackUser);
          setHasPassedAuthScreen(true);
        }} 
      />
    );
  }

  const displayUsername = activeUser?.email?.endsWith('@dsehub.local') 
    ? activeUser.email.replace('@dsehub.local', '') 
    : 'Platform User';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-xl shadow-md shadow-indigo-200">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-[15px] leading-tight text-slate-900">HKDSE Revision Hub</h1>
              <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block animate-pulse bg-emerald-500"></span>
                {displayUsername}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
            <button
              onClick={() => setView('library')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                view === 'library' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Library className="w-4 h-4" />
              <span className="hidden sm:inline">Library</span>
            </button>
            <button
              onClick={() => setView('review')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                view === 'review' ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-700'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Review</span>
            </button>
            <button
              onClick={() => setView('mastered')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                view === 'mastered' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Mastered</span>
            </button>
            <button
              onClick={() => { setView('add'); setEditingQuestion(null); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                view === 'add' ? 'bg-slate-900 text-white shadow-md shadow-slate-400' : 'bg-slate-800 text-white hover:bg-slate-700 shadow-sm'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
            
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 py-8">
        {view === 'library' || view === 'review' || view === 'mastered' ? (
          <LibraryView 
            questions={view === 'review' ? questions.filter(q => q.status === 'review') : view === 'mastered' ? questions.filter(q => q.status === 'mastered') : questions} 
            user={activeUser} 
            currentView={view}
            onEdit={(q) => {
              setEditingQuestion(q);
              setView('add');
            }}
          />
        ) : (
          <AddQuestionView 
            user={activeUser} 
            userApiKey={userApiKey} 
            setUserApiKey={setUserApiKey}
            editData={editingQuestion}
            onSaved={() => { setView('library'); setEditingQuestion(null); }}
            onCancel={() => { setView('library'); setEditingQuestion(null); }}
          />
        )}
      </main>
    </div>
  );
}

// Library View
function LibraryView({ questions, user, currentView, onEdit }) {
  const [selectedSubjectKey, setSelectedSubjectKey] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleAnswers, setVisibleAnswers] = useState({});
  const [localImages, setLocalImages] = useState({});

  const toggleAnswer = (id) => {
    setVisibleAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRotateView = async (id, base64, direction) => {
    try {
      const rotated = await rotateBase64Image(localImages[id] || base64, direction);
      setLocalImages(prev => ({ ...prev, [id]: rotated }));
    } catch (err) {
      console.error("Rotate error", err);
    }
  };

  const toggleStatus = async (id, newStatus) => {
    if (!user || !db) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'questions', id);
      await updateDoc(docRef, { status: newStatus });
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!user || !db) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'questions', id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const subjectKeys = Object.keys(HKDSE_SYLLABUS);
  const activeTopics = selectedSubjectKey !== 'all' ? HKDSE_SYLLABUS[selectedSubjectKey].topics : [];

  const filteredQuestions = questions.filter(q => {
    if (selectedSubjectKey !== 'all') {
      const subjectObj = HKDSE_SYLLABUS[selectedSubjectKey];
      if (q.subject !== subjectObj.name) return false;
    }
    if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchText = (q.questionText || '').toLowerCase();
      const matchSource = (q.source || '').toLowerCase();
      const matchTopic = (q.topic || '').toLowerCase();
      if (!matchText.includes(query) && !matchSource.includes(query) && !matchTopic.includes(query)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {currentView === 'review' && (
        <div className="bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 text-rose-900 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="bg-rose-100 p-2.5 rounded-xl">
            <XCircle className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h2 className="font-extrabold text-base">Needs Review</h2>
            <p className="text-sm font-medium text-rose-700/80">Questions marked with Cross for revision.</p>
          </div>
        </div>
      )}

      {currentView === 'mastered' && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 text-emerald-900 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="bg-emerald-100 p-2.5 rounded-xl">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="font-extrabold text-base">Mastered Questions</h2>
            <p className="text-sm font-medium text-emerald-700/80">Questions marked as fully understood.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Subject</label>
            <div className="relative">
              <select
                value={selectedSubjectKey}
                onChange={(e) => {
                  setSelectedSubjectKey(e.target.value);
                  setSelectedTopic('all');
                }}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl py-2.5 pl-3 pr-8 appearance-none focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
              >
                <option value="all">All Subjects</option>
                {subjectKeys.map(k => (
                  <option key={k} value={k}>{HKDSE_SYLLABUS[k].name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Sub-topic</label>
            <div className="relative">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                disabled={selectedSubjectKey === 'all'}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl py-2.5 pl-3 pr-8 appearance-none focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none disabled:opacity-50 transition-all"
              >
                <option value="all">All Sub-topics</option>
                {activeTopics.map((t, idx) => (
                  <option key={idx} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Search Keywords</label>
            <input
              type="text"
              placeholder="e.g. projectile, 2023..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
            />
          </div>
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center shadow-sm">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
             <BookOpen className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="font-extrabold text-slate-700 text-lg mb-2">No questions found</h3>
          <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto">Try resetting your filters or add a new question to your bank.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredQuestions.map((q) => (
            <div key={q.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col relative group/card">
              
              <div className="bg-slate-50/80 px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {q.subject || 'HKDSE'}
                  </span>
                  <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                    {q.type === 'MC' ? 'MC' : 'LQ'}
                  </span>
                  {q.source && (
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-600 border border-slate-200 shadow-sm">
                      {q.source}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 shadow-sm p-1">
                  <button
                    onClick={() => toggleStatus(q.id, q.status === 'mastered' ? 'unmarked' : 'mastered')}
                    className={`p-1.5 rounded-lg transition-colors ${q.status === 'mastered' ? 'text-emerald-600 bg-emerald-100' : 'text-slate-300 hover:text-emerald-500 hover:bg-slate-50'}`}
                    title="Mark as Mastered (Tick)"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleStatus(q.id, q.status === 'review' ? 'unmarked' : 'review')}
                    className={`p-1.5 rounded-lg transition-colors ${q.status === 'review' ? 'text-rose-600 bg-rose-100' : 'text-slate-300 hover:text-rose-500 hover:bg-slate-50'}`}
                    title="Needs Review (Cross)"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
                  <button onClick={() => onEdit(q)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {q.topic && (
                <div className="px-5 pt-4 text-xs font-semibold text-slate-500 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">Topic</span>
                    <span className="leading-tight">{q.topic}</span>
                  </div>
                  
                  {q.createdAt && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-0.5 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      <Clock className="w-3 h-3" />
                      {new Date(q.createdAt).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                    </div>
                  )}
                </div>
              )}

              {q.attachedImage && (
                <div className="px-5 pt-4">
                  <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/50 flex flex-col items-center justify-center p-2 group/img">
                    <img 
                      src={localImages[q.id] || q.attachedImage} 
                      alt="Diagram" 
                      className="max-h-56 object-contain rounded-xl mix-blend-multiply transition-all" 
                    />
                    
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleRotateView(q.id, q.attachedImage, 'ccw')}
                        className="p-1.5 bg-white/90 backdrop-blur shadow-sm rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
                        title="Rotate Left 90°"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRotateView(q.id, q.attachedImage, 'cw')}
                        className="p-1.5 bg-white/90 backdrop-blur shadow-sm rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
                        title="Rotate Right 90°"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-5 space-y-4 flex-1">
                <div className="text-sm font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
                  <span className="font-extrabold text-slate-900 block mb-2 text-xs uppercase tracking-wider">Question</span>
                  {typeof q.questionText === 'object' ? JSON.stringify(q.questionText) : String(q.questionText || '')}
                </div>

                {q.type === 'MC' && q.options && typeof q.options === 'object' && (
                  <div className="grid grid-cols-1 gap-2.5 pt-3">
                    {['A', 'B', 'C', 'D'].map(letter => {
                      const optVal = q.options[letter];
                      if (!optVal) return null;
                      return (
                        <div key={letter} className="bg-white hover:bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm flex items-start gap-3 transition-colors shadow-sm">
                          <span className="font-extrabold text-indigo-600 bg-indigo-50 w-6 h-6 rounded-md flex items-center justify-center shrink-0">{letter}</span>
                          <span className="text-slate-700 font-medium pt-0.5">{String(optVal)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {(q.answerText || q.remarks) && (
                <div className="px-5 pb-5 mt-auto">
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => toggleAnswer(q.id)}
                      className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center justify-center gap-2 transition-all"
                    >
                      {visibleAnswers[q.id] ? (
                        <><EyeOff className="w-4 h-4" /> Hide Solution</>
                      ) : (
                        <><Eye className="w-4 h-4" /> Reveal Solution & Remarks</>
                      )}
                    </button>

                    {visibleAnswers[q.id] && (
                      <div className="mt-3 space-y-3">
                        {q.answerText && (
                          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-sm text-emerald-900 whitespace-pre-wrap font-medium">
                            <span className="font-extrabold font-sans block mb-2 text-emerald-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                               <CheckCircle2 className="w-4 h-4" /> Marking Scheme / Answer
                            </span>
                            {typeof q.answerText === 'object' ? JSON.stringify(q.answerText, null, 2) : String(q.answerText)}
                          </div>
                        )}
                        {q.remarks && (
                          <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-2xl text-sm text-indigo-900 whitespace-pre-wrap font-medium">
                            <span className="font-extrabold font-sans block mb-2 text-indigo-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                               <Info className="w-4 h-4" /> Remarks / Notes
                            </span>
                            {q.remarks}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Add/Edit Question View
function AddQuestionView({ user, userApiKey, setUserApiKey, editData, onSaved, onCancel }) {
  const fileInputRef = useRef(null);

  const [ocrEngine, setOcrEngine] = useState('ai');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorText, setErrorText] = useState('');

  // Cropper & Free Rotation States
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [subjectKey, setSubjectKey] = useState('biology');
  const [topic, setTopic] = useState(HKDSE_SYLLABUS['biology'].topics[0]);
  const [questionType, setQuestionType] = useState('MC');
  const [source, setSource] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [options, setOptions] = useState({ A: '', B: '', C: '', D: '' });
  const [remarks, setRemarks] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const [includeImage, setIncludeImage] = useState(true);

  const handleSubjectChange = (e) => {
    const newSubject = e.target.value;
    setSubjectKey(newSubject);
    if (HKDSE_SYLLABUS[newSubject] && HKDSE_SYLLABUS[newSubject].topics) {
      setTopic(HKDSE_SYLLABUS[newSubject].topics[0]);
    }
  };

  useEffect(() => {
    if (editData) {
      const foundSubjectKey = Object.keys(HKDSE_SYLLABUS).find(
        key => HKDSE_SYLLABUS[key].name === editData.subject
      );
      if (foundSubjectKey) setSubjectKey(foundSubjectKey);
      setTopic(editData.topic || '');
      setQuestionType(editData.type || 'MC');
      setSource(editData.source || '');
      setQuestionText(editData.questionText || '');
      setAnswerText(editData.answerText || '');
      setOptions(editData.options || { A: '', B: '', C: '', D: '' });
      setRemarks(editData.remarks || '');
      if (editData.attachedImage) {
        setAttachedImage(editData.attachedImage);
        setImagePreview(editData.attachedImage);
        setRawImageSrc(editData.attachedImage);
        setIncludeImage(true);
      }
    }
  }, [editData]);

  const handleAutoSplitOptions = () => {
    if (!questionText) return;
    const { cleanQuestion, options: parsedOpts } = extractOptionsFromText(questionText);
    if (parsedOpts) {
      setQuestionText(cleanQuestion);
      setOptions(prev => ({ ...prev, ...parsedOpts }));
    }
  };

  const handleFilePicked = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorText('Please choose an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result);
      setIsCropping(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setErrorText('');
    };
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  const openRecropModal = () => {
    if (attachedImage || rawImageSrc) {
      setRawImageSrc(attachedImage || rawImageSrc);
      setIsCropping(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    }
  };

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const saveCrop = async () => {
    try {
      const croppedImageBase64 = await getCroppedImg(rawImageSrc, croppedAreaPixels, rotation);
      setAttachedImage(croppedImageBase64);
      setImagePreview(croppedImageBase64);
      setIncludeImage(true);
      setIsCropping(false);
    } catch (e) {
      setErrorText('Failed to process and crop image.');
    }
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    if (!attachedImage && fileInputRef.current) {
      fileInputRef.current.value = ''; 
    }
  };

  const handleResetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleRotatePreview = async (direction) => {
    if (!imagePreview) return;
    try {
      const rotated = await rotateBase64Image(imagePreview, direction);
      setImagePreview(rotated);
      setAttachedImage(rotated);
      setRawImageSrc(rotated);
    } catch (err) {
      setErrorText('Failed to rotate image.');
    }
  };

  const handleRunOCR = async () => {
    if (!attachedImage) {
      setErrorText('Please attach an image first.');
      return;
    }
    
    setStatus('scanning');
    setErrorText('');

    try {
      if (ocrEngine === 'local') {
        const localExtractedText = await runLocalOCR(attachedImage);
        const { cleanQuestion, options: parsedOpts } = extractOptionsFromText(localExtractedText);
        setQuestionText(cleanQuestion);
        if (parsedOpts) setOptions(parsedOpts);
        setStatus('idle');
      } else {
        const [localExtractedText, imagePayload] = await Promise.all([
          runLocalOCR(attachedImage),
          (async () => {
            return { base64Data: attachedImage.split(',')[1], mime: 'image/jpeg' };
          })()
        ]);

        try {
          const aiData = await runGeminiAIOCR(imagePayload.base64Data, imagePayload.mime, questionType, userApiKey, localExtractedText);
          
          if (aiData.subject) {
            const detectedSub = String(aiData.subject).toLowerCase();
            const matchingKey = Object.keys(HKDSE_SYLLABUS).find(k => 
              k.toLowerCase() === detectedSub || HKDSE_SYLLABUS[k].name.toLowerCase() === detectedSub
            );
            if (matchingKey) {
              setSubjectKey(matchingKey);
              setTopic(HKDSE_SYLLABUS[matchingKey].topics[0]);
            }
          }

          if (aiData.question) setQuestionText(typeof aiData.question === 'object' ? JSON.stringify(aiData.question) : String(aiData.question));
          if (aiData.answer) setAnswerText(typeof aiData.answer === 'object' ? JSON.stringify(aiData.answer) : String(aiData.answer));
          if (aiData.options && typeof aiData.options === 'object') {
            setOptions({
              A: String(aiData.options.A || ''), B: String(aiData.options.B || ''),
              C: String(aiData.options.C || ''), D: String(aiData.options.D || '')
            });
          } else {
            const { cleanQuestion, options: parsedOpts } = extractOptionsFromText(aiData.question || localExtractedText);
            setQuestionText(cleanQuestion);
            if (parsedOpts) setOptions(parsedOpts);
          }
          setStatus('idle');
        } catch (aiErr) {
          console.warn("AI Structure Analysis failed, falling back to raw local text:", aiErr);
          const { cleanQuestion, options: parsedOpts } = extractOptionsFromText(localExtractedText);
          setQuestionText(cleanQuestion || (prev => (prev ? prev + '\n' : '') + (localExtractedText || '')));
          if (parsedOpts) setOptions(parsedOpts);
          setErrorText(`AI API Error: ${aiErr.message}. Used Free Local OCR text instead.`);
          setStatus('idle');
        }
      }
    } catch (err) {
      console.error("Scanning Error:", err);
      setErrorText(err.message || 'Image scan failed. You can manually type the question details.');
      setStatus('idle');
    }
  };

  const handleSaveQuestion = async () => {
    if (!questionText.trim()) {
      setErrorText('Question Body cannot be empty.');
      return;
    }
    if (!user || !db) {
      setErrorText('Cloud connection or user session not found.');
      return;
    }

    setStatus('saving');
    setErrorText('');

    try {
      const questionData = {
        subject: HKDSE_SYLLABUS[subjectKey].name,
        topic: topic || 'General',
        type: questionType,
        source: source.trim(),
        questionText: questionText.trim(),
        answerText: answerText.trim(),
        options: questionType === 'MC' ? options : null,
        remarks: remarks.trim(),
        attachedImage: includeImage ? attachedImage : null,
        status: editData ? editData.status || 'unmarked' : 'unmarked' 
      };

      if (editData && editData.id) {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'questions', editData.id);
        await updateDoc(docRef, { ...questionData, updatedAt: new Date().toISOString() });
      } else {
        const qRef = collection(db, 'artifacts', appId, 'users', user.uid, 'questions');
        await addDoc(qRef, { ...questionData, createdAt: new Date().toISOString() });
      }

      onSaved();
    } catch (err) {
      console.error("Save Error:", err);
      setErrorText('Could not save question to cloud database. Check your network.');
      setStatus('idle');
    }
  };

  // Full-featured Cropper UI matching screenshot (4 corner handles + top bar + grid dark canvas)
  if (isCropping) {
    return (
      <div className="fixed inset-0 z-50 bg-[#121214] flex flex-col font-sans select-none">
        <style>{`
          .customCropperArea {
            box-shadow: 0 0 0 9999em rgba(0, 0, 0, 0.65) !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            position: relative;
            background: 
              linear-gradient(to right, #ffffff 22px, transparent 22px) top left / 100% 5px no-repeat,
              linear-gradient(to bottom, #ffffff 22px, transparent 22px) top left / 5px 100% no-repeat,
              linear-gradient(to left, #ffffff 22px, transparent 22px) top right / 100% 5px no-repeat,
              linear-gradient(to bottom, #ffffff 22px, transparent 22px) top right / 5px 100% no-repeat,
              linear-gradient(to right, #ffffff 22px, transparent 22px) bottom left / 100% 5px no-repeat,
              linear-gradient(to top, #ffffff 22px, transparent 22px) bottom left / 5px 100% no-repeat,
              linear-gradient(to left, #ffffff 22px, transparent 22px) bottom right / 100% 5px no-repeat,
              linear-gradient(to top, #ffffff 22px, transparent 22px) bottom right / 5px 100% no-repeat !important;
          }
        `}</style>

        {/* Top Header Bar */}
        <div className="bg-[#18181b] border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-20 shrink-0">
          <h2 className="text-base font-extrabold text-white tracking-wide">Crop and Resize</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancelCrop}
              className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleResetCrop}
              className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={saveCrop}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-lg transition-all shadow-md active:scale-95"
            >
              Done
            </button>
          </div>
        </div>

        {/* Dark Canvas with Background Grid */}
        <div className="flex-1 relative bg-[#09090b] bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]">
          <Cropper
            image={rawImageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={undefined}
            showGrid={true}
            classes={{ cropAreaClassName: 'customCropperArea' }}
            onCropChange={setCrop}
            onRotationChange={setRotation}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {/* Rotation & Angle Slider Controls */}
        <div className="bg-[#18181b] border-t border-zinc-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-20 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRotation(r => (r - 90 + 360) % 360)}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> -90°
            </button>
            <button
              type="button"
              onClick={() => setRotation(r => (r + 90) % 360)}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" /> +90°
            </button>
          </div>

          <div className="flex-1 flex items-center gap-3 w-full sm:max-w-md">
            <span className="text-xs font-semibold text-zinc-400 shrink-0">Angle:</span>
            <input
              type="range"
              min={0}
              max={360}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono font-extrabold text-amber-400 shrink-0 w-10 text-right">{Math.round(rotation)}°</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex justify-between items-center border-b border-slate-700">
        <h2 className="font-extrabold text-base flex items-center gap-2.5">
          {editData ? <Pencil className="w-5 h-5 text-amber-400" /> : <Camera className="w-5 h-5 text-emerald-400" />} 
          {editData ? 'Edit Question' : 'Snap & Store Question'}
        </h2>
        {editData && (
          <button onClick={onCancel} className="text-slate-400 hover:text-white bg-slate-700/50 p-1.5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {errorText && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-start gap-2 shadow-sm">
             <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
            {errorText}
          </div>
        )}

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
          <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">1. Extraction Engine Settings</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setOcrEngine('ai')}
              className={`p-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                ocrEngine === 'ai' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Key className="w-4 h-4" /> Gemini 3.1 AI
            </button>

            <button
              type="button"
              onClick={() => setOcrEngine('local')}
              className={`p-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                ocrEngine === 'local' ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" /> Local OCR (Fallback)
            </button>
          </div>

          {ocrEngine === 'ai' && (
            <div className="pt-2 space-y-3">
              <input
                type="password"
                placeholder="Paste your Gemini API Key here..."
                value={userApiKey}
                onChange={(e) => setUserApiKey(e.target.value)}
                className="w-full text-sm font-medium bg-white border border-slate-300 rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all"
              />
              <div className="text-xs text-rose-800 bg-rose-50/80 p-3 rounded-xl border border-rose-200 flex items-start gap-2 shadow-sm">
                <Globe2 className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <p className="leading-relaxed"><strong>VPN Required:</strong> Google Gemini AI is restricted in HK. Connect a VPN (outside HK) or the AI request will fail and fall back to local OCR.</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">2. Question Capture</label>
          <div className="flex gap-4 items-center bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm w-fit">
            <button
              type="button"
              onClick={() => setQuestionType('MC')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${questionType === 'MC' ? 'bg-indigo-100 text-indigo-800' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Multiple Choice (MC)
            </button>
            <button
              type="button"
              onClick={() => setQuestionType('LQ')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${questionType === 'LQ' ? 'bg-purple-100 text-purple-800' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Long Question (LQ)
            </button>
          </div>

          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 rounded-3xl p-10 text-center cursor-pointer transition-all flex flex-col items-center group"
            >
              <div className="p-4 bg-white rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="font-extrabold text-indigo-900 text-sm">Take Photo / Upload Image</h3>
              <p className="text-xs text-indigo-500 mt-2 font-medium">Capture the question block clearly.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 h-64 border border-slate-200 shadow-inner group flex items-center justify-center">
                <img src={imagePreview} alt="Target" className="max-w-full max-h-full object-contain" />
                
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur p-1 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleRotatePreview('ccw')}
                    className="p-2 text-white hover:text-indigo-400 transition-colors"
                    title="Rotate Left 90°"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRotatePreview('cw')}
                    className="p-2 text-white hover:text-indigo-400 transition-colors"
                    title="Rotate Right 90°"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-slate-700 mx-0.5"></div>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      setAttachedImage(null);
                      setRawImageSrc(null);
                      setIncludeImage(true);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={openRecropModal}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200 transition-all"
              >
                <Crop className="w-4 h-4 text-indigo-600" /> Recrop & Straighten Image
              </button>
            </div>
          )}
          
          {imagePreview && status !== 'scanning' && (
             <button
                onClick={handleRunOCR}
                className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-[0.99]"
              >
                <RefreshCw className="w-4 h-4" /> Run Intelligent Extraction
              </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFilePicked}
            accept="image/*"
            className="hidden"
          />
        </div>

        {status === 'scanning' ? (
          <div className="flex flex-col items-center justify-center p-10 space-y-4 bg-slate-50 rounded-3xl border border-slate-100">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm text-slate-600 font-bold">Extracting & Analyzing Content...</p>
          </div>
        ) : (
          <div className="space-y-6 pt-6 border-t border-slate-200">
            <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">3. Review & Save</label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Subject</label>
                <select
                  value={subjectKey}
                  onChange={handleSubjectChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                >
                  {Object.keys(HKDSE_SYLLABUS).map(k => (
                    <option key={k} value={k}>{HKDSE_SYLLABUS[k].name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Sub-topic</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                >
                  {HKDSE_SYLLABUS[subjectKey].topics.map((t, i) => (
                    <option key={i} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Question Source</label>
              <input
                type="text"
                placeholder="e.g. 2022 DSE Paper 1 Q14"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Question Body <span className="text-rose-500 text-sm">*</span>
                </label>
                {questionType === 'MC' && questionText && (
                  <button
                    type="button"
                    onClick={handleAutoSplitOptions}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Auto-Split Options
                  </button>
                )}
              </div>
              <textarea
                rows={5}
                value={questionText}
                required
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-y"
              />
            </div>

            {questionType === 'MC' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                {['A', 'B', 'C', 'D'].map(l => (
                  <div key={l} className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-indigo-600 bg-white shadow-sm border border-indigo-100 w-8 h-8 flex items-center justify-center rounded-lg">{l}</span>
                    <input
                      type="text"
                      placeholder={`Option ${l}`}
                      value={options[l] || ''}
                      onChange={(e) => setOptions({ ...options, [l]: e.target.value })}
                      className="flex-1 bg-white border border-slate-200 text-slate-800 text-sm font-medium rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Marking Scheme / Answer</label>
              <textarea
                rows={3}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                className="w-full bg-emerald-50/50 border border-emerald-200 text-emerald-900 text-sm font-medium rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-y"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Remarks / Notes</label>
              <textarea
                rows={2}
                placeholder="e.g. Remember to check units, use formula X..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full bg-amber-50/50 border border-amber-200 text-amber-900 text-sm font-medium rounded-xl p-4 outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all resize-y"
              />
            </div>

            {attachedImage && (
              <div className="flex items-center gap-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mt-2">
                 <input
                   type="checkbox"
                   id="includeImageCheck"
                   checked={includeImage}
                   onChange={(e) => setIncludeImage(e.target.checked)}
                   className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                 />
                 <label htmlFor="includeImageCheck" className="text-sm font-bold text-indigo-900 flex-1 cursor-pointer select-none">
                   Save original image to database (Recommended for Diagrams)
                 </label>
                 <ImageIcon className="w-5 h-5 text-indigo-400" />
              </div>
            )}

            <button
              onClick={handleSaveQuestion}
              disabled={status === 'saving' || !questionText.trim()}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-[0.99]"
            >
              {status === 'saving' ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Saving Question...</>
              ) : (
                <><CheckCircle2 className="w-5 h-5" /> Save to Revision Hub</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
