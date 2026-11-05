import React, { useState, useEffect, useRef } from 'react';
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
  Eye,
  EyeOff,
  LogOut,
  User,
  Pencil,
  RefreshCw,
  Wand2
} from 'lucide-react';

// --- HKDSE SYLLABUS DATA STRUCTURE ---
const HKDSE_SYLLABUS = {
  "physics": {
    name: "Physics",
    topics: [
      "Topic 1 Temperature, Heat and Internal energy",
      "Topic 2 Transfer Processes",
      "Topic 3 Change of State",
      "Topic 4 General Gas Law",
      "Topic 5 Kinetic Theory",
      "Topic 6 Position and Movement",
      "Topic 7 Newton's Laws",
      "Topic 8 Moment of Force",
      "Topic 9 Work, Energy and Power",
      "Topic 10 Momentum",
      "Topic 11 Projectile Motion",
      "Topic 12 Circular Motion",
      "Topic 13 Gravitation",
      "Topic 14 Wave Propagation",
      "Topic 15 Wave Phenomena",
      "Topic 16 Reflection and Refraction of Light",
      "Topic 17 Lenses",
      "Topic 18 Wave Nature of Light",
      "Topic 19 Sound",
      "Topic 20 Electrostatics",
      "Topic 21 Electric Circuits",
      "Topic 22 Domestic Electricity",
      "Topic 23 Magnetic Field",
      "Topic 24 Electromagnetic Induction",
      "Topic 25 Alternating Current",
      "Topic 26 Radiation and Radioactivity",
      "Topic 27 Atomic Model",
      "Topic 28 Nuclear Energy",
      "Elective 1 Astronomy and Space Science",
      "Elective 2 Atomic World",
      "Elective 3 Energy and Use of Energy"
    ]
  },
  "chemistry": {
    name: "Chemistry",
    topics: [
      "Topic 1 Laboratory Safety and Precautions",
      "Topic 2 Planet Earth",
      "Topic 3 Microscopic World",
      "Topic 4 Metals",
      "Topic 5 Acid and Bases",
      "Topic 6 Fossil fuels and Carbon Compounds",
      "Topic 7 Microscopic World II",
      "Topic 8 Redox Reactions, Chemical Cells and Electrolysis",
      "Topic 9 Chemical Reactions and Energy",
      "Topic 10 Rate of Reaction",
      "Topic 11 Chemical Equilibrium",
      "Topic 12 Chemistry of Carbon Compounds",
      "Topic 13 Patterns in the Chemical World",
      "E1 Industrial Chemistry",
      "E2 Analytical Chemistry"
    ]
  },
  "economics": {
    name: "Economics",
    topics: [
      "Topic 1 Basic Concept",
      "Topic 2 Production",
      "Topic 3 Input-Output Relationship",
      "Topic 4 Ownership And Expansion Of Firms",
      "Topic 5 Market Structure",
      "Topic 6 Demand And Supply I",
      "Topic 7 Demand And Supply II",
      "Topic 8 Market Intervention",
      "Topic 9 Roles Of Government",
      "Topic 10 National Income",
      "Topic 11 Macroeconomics Problems",
      "Topic 12 The Budget And Fiscal Policy",
      "Topic 13 Money And Banking I",
      "Topic 14 Money And Banking II",
      "Topic 15 Aggregate Demand And Aggregate Supply",
      "Topic 16 International Trade",
      "Topic 17 International Finance",
      "Elective 2: Extension of Trade Theory And Economic Development"
    ]
  },
  "math compulsory": {
    name: "Math Compulsory",
    topics: [
      "Topic 1 Estimation",
      "Topic 2 Percentages",
      "Topic 3 Indices and Logarithms",
      "Topic 4 Polynomials",
      "Topic 5 Formulas",
      "Topic 6 Identities, Equations and the Number System",
      "Topic 7 Functions and Graphs",
      "Topic 8 Rate, Ratio and Variation",
      "Topic 9 Arithmetic and Geometric Sequences",
      "Topic 10 Inequalities and Linear Programming",
      "Topic 11 Geometry of Rectilinear Figure",
      "Topic 12 Geometry of Circles",
      "Topic 13 Basic Trigonometry",
      "Topic 14 Applications of Trigonometry",
      "Topic 15 Mensuration",
      "Topic 16 Coordinate Geometry",
      "Topic 17 Counting Principles and Probability",
      "Topic 18 Statistics"
    ]
  },
  "m2": {
    name: "M2",
    topics: [
      "Topic 1 Mathematical Induction",
      "Topic 2 Binomial Theorem",
      "Topic 3 More about Trigonometric Functions",
      "Topic 4 Limits and Derivatives",
      "Topic 5 Differentiation",
      "Topic 6 Applications of differentiation",
      "Topic 7 Indefinite Integrals",
      "Topic 8 Definite Integrals",
      "Topic 9 Applications of Definite Integrals",
      "Topic 10 Matrices and Determinants",
      "Topic 11 System of Linear Equations",
      "Topic 12 Vectors",
      "Topic 13 Product of Vectors"
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

// Regex Option Extractor Fallback
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
      if (['A', 'B', 'C', 'D'].includes(letter)) {
        extractedOptions[letter] = content;
      }
    });

    const firstOptIdx = text.search(/(?:^|\n|\s)\(?[A-D][\.\)]\s*/i);
    const cleanQuestion = firstOptIdx !== -1 ? text.substring(0, firstOptIdx).trim() : text;

    return { cleanQuestion, options: extractedOptions };
  }

  return { cleanQuestion: text, options: null };
};

// Image Compression
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let scaleSize = 1;
        if (img.width > MAX_WIDTH) {
          scaleSize = MAX_WIDTH / img.width;
        }
        canvas.width = img.width * scaleSize;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
    };
    reader.onerror = error => reject(error);
  });
};

// Tesseract Local OCR
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

// Gemini 3.1 Flash Lite OCR Recognition Function
const runGeminiAIOCR = async (base64Image, mimeType, questionType, apiKey, preExtractedText = '') => {
  const effectiveKey = apiKey || '';
  if (!effectiveKey) {
    throw new Error('API key is missing. Please enter your Gemini API key in the setting input.');
  }

  // Enforce gemini-3.1-flash-lite endpoint
  const primaryEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${effectiveKey}`;

  const prompt = `You are an expert HKDSE exam question analyzer. 
Analyze the question image and pre-extracted OCR text below:
${preExtractedText ? `RAW OCR TEXT:\n"${preExtractedText}"\n` : ''}

CRITICAL RULES:
1. "subject": Auto-detect subject ("Physics", "Chemistry", "Economics", "Math Compulsory", or "M2").
2. "question": Extract ONLY the main question body text. DO NOT include choice options A, B, C, D in the question string.
3. "options": Map the exact text for choices A, B, C, and D into their respective keys.
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
        properties: {
          A: { type: "STRING" },
          B: { type: "STRING" },
          C: { type: "STRING" },
          D: { type: "STRING" }
        }
      },
      answer: { type: "STRING" }
    }
  };

  const requestBody = JSON.stringify({
    contents: [{ role: 'user', parts: parts }],
    generationConfig: { 
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.1
    }
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
  
  if (!rawText) {
    throw new Error("AI returned an empty response.");
  }

  try {
    const cleanJson = rawText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    throw new Error("Failed to parse AI output into structured format.");
  }
};

// --- AUTHENTICATION VIEW ---
function AuthView({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-2xl border border-slate-700">
         <div className="text-center mb-6">
            <div className="bg-blue-600 p-3.5 rounded-2xl inline-block mb-4 shadow-lg shadow-blue-600/30">
               <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">HKDSE Revision Hub</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Login to access and sync your question bank across devices.
            </p>
         </div>
         
         {error && (
           <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-sm mb-5 border border-red-200 font-medium">
             {error}
           </div>
         )}

         <div className="space-y-4">
            <div>
               <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Username</label>
               <input 
                 type="text" 
                 value={username}
                 onChange={e => setUsername(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition"
                 placeholder="e.g. jason_dse2025"
               />
            </div>
            <div>
               <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Password</label>
               <input 
                 type="password" 
                 value={password}
                 onChange={e => setPassword(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition"
                 placeholder="Minimum 6 characters"
               />
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-3">
               <button 
                 onClick={() => handleAuth(true)}
                 disabled={loading}
                 className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center shadow-md shadow-blue-600/20"
               >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
               </button>
               <button 
                 onClick={() => handleAuth(false)}
                 disabled={loading}
                 className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center shadow-md shadow-slate-900/20"
               >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
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
      } catch (err) {
        console.warn("Anon Auth Notice:", err);
      }
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
          } catch (e) {
            console.warn("Profile fetch error:", e);
          }
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
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
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
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">HKDSE Revision Hub</h1>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block animate-pulse bg-emerald-400"></span>
                User: {displayUsername}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <button
              onClick={() => setView('library')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                view === 'library' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Library className="w-4 h-4" />
              Library ({questions.length})
            </button>
            <button
              onClick={() => { setView('add'); setEditingQuestion(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                view === 'add' ? 'bg-blue-600 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 py-6">
        {view === 'library' ? (
          <LibraryView 
            questions={questions} 
            user={activeUser} 
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

// --- LIBRARY VIEW COMPONENT ---
function LibraryView({ questions, user, onEdit }) {
  const [selectedSubjectKey, setSelectedSubjectKey] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleAnswers, setVisibleAnswers] = useState({});

  const toggleAnswer = (id) => {
    setVisibleAnswers(prev => ({ ...prev, [id]: !prev[id] }));
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
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-4 rounded-2xl border border-blue-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="font-bold text-xs flex items-center gap-1.5 text-blue-200">
            <User className="w-4 h-4 text-emerald-400" /> Account Cloud Sync Active
          </h3>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Your saved HKDSE questions sync automatically across devices.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Subject</label>
            <div className="relative">
              <select
                value={selectedSubjectKey}
                onChange={(e) => {
                  setSelectedSubjectKey(e.target.value);
                  setSelectedTopic('all');
                }}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl py-2 pl-3 pr-8 appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Subjects</option>
                {subjectKeys.map(k => (
                  <option key={k} value={k}>{HKDSE_SYLLABUS[k].name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Sub-topic</label>
            <div className="relative">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                disabled={selectedSubjectKey === 'all'}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl py-2 pl-3 pr-8 appearance-none focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
              >
                <option value="all">All Sub-topics</option>
                {activeTopics.map((t, idx) => (
                  <option key={idx} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Search Keywords</label>
            <input
              type="text"
              placeholder="e.g. projectile, 2023 Q4..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700 text-sm mb-1">No questions match your filter</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting your filters or scan a new question.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => (
            <div key={q.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800">
                    {q.subject || 'HKDSE'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800">
                    {q.type === 'MC' ? 'Multiple Choice (MC)' : 'Long Question (LQ)'}
                  </span>
                  {q.source && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-200 text-slate-700">
                      Source: {q.source}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(q)}
                    className="text-slate-400 hover:text-blue-600 transition p-1"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="text-slate-400 hover:text-red-600 transition p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {q.topic && (
                <div className="px-4 pt-3 text-[11px] font-medium text-slate-500">
                  <span className="font-bold text-slate-700">Sub-topic:</span> {q.topic}
                </div>
              )}

              {q.attachedImage && (
                <div className="px-4 pt-3">
                  <img src={q.attachedImage} alt="Diagram" className="max-h-64 rounded-xl border border-slate-200 object-contain bg-slate-50" />
                </div>
              )}

              <div className="p-4 space-y-3">
                <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-1 text-xs">Question:</span>
                  {typeof q.questionText === 'object' ? JSON.stringify(q.questionText) : String(q.questionText || '')}
                </div>

                {q.type === 'MC' && q.options && typeof q.options === 'object' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {['A', 'B', 'C', 'D'].map(letter => {
                      const optVal = q.options[letter];
                      if (!optVal) return null;
                      return (
                        <div key={letter} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs flex items-start gap-2">
                          <span className="font-bold text-blue-600">{letter}.</span>
                          <span className="text-slate-800 flex-1">{String(optVal)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.answerText && (
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => toggleAnswer(q.id)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
                    >
                      {visibleAnswers[q.id] ? (
                        <><EyeOff className="w-3.5 h-3.5" /> Hide Solution</>
                      ) : (
                        <><Eye className="w-3.5 h-3.5" /> Reveal Solution</>
                      )}
                    </button>

                    {visibleAnswers[q.id] && (
                      <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 whitespace-pre-wrap font-mono">
                        <span className="font-bold font-sans block mb-1 text-emerald-900">Marking Scheme / Answer:</span>
                        {typeof q.answerText === 'object' ? JSON.stringify(q.answerText, null, 2) : String(q.answerText)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- ADD & EDIT QUESTION VIEW COMPONENT ---
function AddQuestionView({ user, userApiKey, setUserApiKey, editData, onSaved, onCancel }) {
  const fileInputRef = useRef(null);

  const [ocrEngine, setOcrEngine] = useState('ai');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorText, setErrorText] = useState('');

  const [subjectKey, setSubjectKey] = useState('physics');
  const [topic, setTopic] = useState(HKDSE_SYLLABUS['physics'].topics[0]);
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

  const handleFilePicked = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorText('Please choose an image file.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrorText('');

    try {
      const compressedDataUrl = await compressImage(file);
      setAttachedImage(compressedDataUrl);
      setIncludeImage(true);
    } catch (compErr) {
      console.warn("Could not compress image:", compErr);
    }
  };

  const handleRunOCR = async () => {
    if (!attachedImage && !imageFile) {
      setErrorText('Please attach an image first.');
      return;
    }
    
    setStatus('scanning');
    setErrorText('');

    try {
      if (ocrEngine === 'local') {
        const localExtractedText = await runLocalOCR(attachedImage || imageFile);
        const { cleanQuestion, options: parsedOpts } = extractOptionsFromText(localExtractedText);
        setQuestionText(cleanQuestion);
        if (parsedOpts) setOptions(parsedOpts);
        setStatus('idle');
      } else {
        const [localExtractedText, imagePayload] = await Promise.all([
          runLocalOCR(attachedImage || imageFile),
          (async () => {
            let base64Data = '';
            let mime = 'image/jpeg';
            if (attachedImage) {
              base64Data = attachedImage.split(',')[1];
            } else if (imageFile) {
              base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(imageFile);
                reader.onload = () => {
                  const resultStr = reader.result.toString();
                  resolve(resultStr.split(',')[1] || resultStr);
                };
                reader.onerror = reject;
              });
              mime = imageFile.type;
            }
            return { base64Data, mime };
          })()
        ]);

        try {
          // Pass pre-extracted text + image payload to Gemini 3.1 Flash Lite
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
              A: String(aiData.options.A || ''),
              B: String(aiData.options.B || ''),
              C: String(aiData.options.C || ''),
              D: String(aiData.options.D || '')
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
      setErrorText('Question text cannot be empty.');
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
      };

      if (editData && editData.id) {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'questions', editData.id);
        await updateDoc(docRef, {
          ...questionData,
          updatedAt: new Date().toISOString()
        });
      } else {
        const qRef = collection(db, 'artifacts', appId, 'users', user.uid, 'questions');
        await addDoc(qRef, {
          ...questionData,
          createdAt: new Date().toISOString()
        });
      }

      onSaved();
    } catch (err) {
      console.error("Save Error:", err);
      setErrorText('Could not save question to cloud database. Check your network.');
      setStatus('idle');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
        <h2 className="font-bold text-sm flex items-center gap-2">
          {editData ? <Pencil className="w-4 h-4 text-amber-400" /> : <Camera className="w-4 h-4 text-emerald-400" />} 
          {editData ? 'Edit Question' : 'Snap & Store Question'}
        </h2>
        {editData && (
          <button onClick={onCancel} className="text-slate-300 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        {errorText && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs">
            {errorText}
          </div>
        )}

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">OCR Engine</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOcrEngine('ai')}
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                ocrEngine === 'ai' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-300 text-slate-700'
              }`}
            >
              <Key className="w-4 h-4" /> Gemini 3.1 Flash Lite AI
            </button>

            <button
              type="button"
              onClick={() => setOcrEngine('local')}
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                ocrEngine === 'local' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-300 text-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" /> Local Browser OCR
            </button>
          </div>

          {ocrEngine === 'ai' && (
            <div className="pt-2">
              <input
                type="password"
                placeholder="Enter your Gemini API Key..."
                value={userApiKey}
                onChange={(e) => setUserApiKey(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex gap-4 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">Question Format:</span>
            <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
              <input
                type="radio"
                name="qtype"
                value="MC"
                checked={questionType === 'MC'}
                onChange={() => setQuestionType('MC')}
                className="text-blue-600"
              />
              Multiple Choice (MC)
            </label>
            <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
              <input
                type="radio"
                name="qtype"
                value="LQ"
                checked={questionType === 'LQ'}
                onChange={() => setQuestionType('LQ')}
                className="text-blue-600"
              />
              Long Question (LQ)
            </label>
          </div>

          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center"
            >
              <div className="p-3 bg-white rounded-full shadow-sm mb-2">
                <Camera className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Take Photo / Upload Image</h3>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-slate-900 h-44 border border-slate-200">
              <img src={imagePreview} alt="Target" className="w-full h-full object-contain" />
              <button
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  setAttachedImage(null);
                }}
                className="absolute top-2 right-2 bg-slate-900/80 text-white p-1 rounded-full hover:bg-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {imagePreview && status !== 'scanning' && (
             <button
                onClick={handleRunOCR}
                className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <RefreshCw className="w-4 h-4" /> Extract Text from Image (Gemini 3.1 Flash Lite)
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
          <div className="flex flex-col items-center justify-center p-6 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-xs text-slate-600 font-medium">Extracting & Categorizing via Gemini 3.1 Flash Lite...</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Subject</label>
                <select
                  value={subjectKey}
                  onChange={handleSubjectChange}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {Object.keys(HKDSE_SYLLABUS).map(k => (
                    <option key={k} value={k}>{HKDSE_SYLLABUS[k].name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Sub-topic</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {HKDSE_SYLLABUS[subjectKey].topics.map((t, i) => (
                    <option key={i} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Question Source</label>
              <input
                type="text"
                placeholder="e.g. 2022 DSE Paper 1 Q14"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Question Body</label>
                {questionType === 'MC' && questionText && (
                  <button
                    type="button"
                    onClick={handleAutoSplitOptions}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Auto-Split A/B/C/D Options
                  </button>
                )}
              </div>
              <textarea
                rows={4}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {questionType === 'MC' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {['A', 'B', 'C', 'D'].map(l => (
                  <div key={l} className="flex items-center gap-2">
                    <span className="font-bold text-xs text-blue-600 w-3">{l}</span>
                    <input
                      type="text"
                      placeholder={`Option ${l}`}
                      value={options[l] || ''}
                      onChange={(e) => setOptions({ ...options, [l]: e.target.value })}
                      className="flex-1 bg-white border border-slate-300 text-slate-800 text-xs rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Answer / Solution</label>
              <textarea
                rows={2}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={handleSaveQuestion}
              disabled={status === 'saving' || !questionText.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              {status === 'saving' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving Question...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Save Question</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
