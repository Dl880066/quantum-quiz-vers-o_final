// ============================================================
// localStore.js — Armazenamento local completo (v3)
// Gerencia: QuizAttempt, Quiz, Question, Config, SecurityLog
// ============================================================

const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
const readKey = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
const writeKey = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch {} };

// ---------- QuizAttempt ----------
export const QuizAttempt = {
  create: async (data) => {
    const all = readKey('qz_attempts');
    const record = { id: generateId(), created_date: new Date().toISOString(), ...data };
    all.push(record);
    writeKey('qz_attempts', all);
    return record;
  },
  list: async () => [...readKey('qz_attempts')].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)),
  filter: async (filters) => readKey('qz_attempts').filter(r => Object.entries(filters).every(([k, v]) => r[k] === v)),
  countByStudent: async (quiz_id, student_email) => readKey('qz_attempts').filter(r => r.quiz_id === quiz_id && r.student_email === student_email).length,
  delete: async (id) => writeKey('qz_attempts', readKey('qz_attempts').filter(r => r.id !== id)),
  update: async (id, data) => {
    const all = readKey('qz_attempts').map(r => r.id === id ? { ...r, ...data } : r);
    writeKey('qz_attempts', all);
    return all.find(r => r.id === id);
  },
};

// ---------- Quiz ----------
export const Quiz = {
  create: async (data) => {
    const all = readKey('qz_quizzes');
    const record = { id: generateId(), created_date: new Date().toISOString(), active: true, ...data };
    all.push(record);
    writeKey('qz_quizzes', all);
    return record;
  },
  list: async () => [...readKey('qz_quizzes')].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)),
  get: async (id) => readKey('qz_quizzes').find(r => r.id === id) || null,
  update: async (id, data) => {
    const all = readKey('qz_quizzes').map(r => r.id === id ? { ...r, ...data } : r);
    writeKey('qz_quizzes', all);
    return all.find(r => r.id === id);
  },
  delete: async (id) => {
    writeKey('qz_quizzes', readKey('qz_quizzes').filter(r => r.id !== id));
    writeKey('qz_questions', readKey('qz_questions').filter(r => r.quiz_id !== id));
    writeKey('qz_security_log', readKey('qz_security_log').filter(r => r.quiz_id !== id));
  },
};

// ---------- Question ----------
export const Question = {
  create: async (data) => {
    const all = readKey('qz_questions');
    const record = { id: generateId(), created_date: new Date().toISOString(), ...data };
    all.push(record);
    writeKey('qz_questions', all);
    return record;
  },
  listByQuiz: async (quiz_id) => readKey('qz_questions').filter(r => r.quiz_id === quiz_id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  update: async (id, data) => {
    const all = readKey('qz_questions').map(r => r.id === id ? { ...r, ...data } : r);
    writeKey('qz_questions', all);
    return all.find(r => r.id === id);
  },
  delete: async (id) => writeKey('qz_questions', readKey('qz_questions').filter(r => r.id !== id)),
};

// ---------- SecurityLog — registra ocorrências de troca de aba / saída de foco ----------
export const SecurityLog = {
  add: async (data) => {
    const all = readKey('qz_security_log');
    const record = { id: generateId(), timestamp: new Date().toISOString(), ...data };
    all.push(record);
    writeKey('qz_security_log', all);
    return record;
  },
  listByAttempt: async (attempt_id) => readKey('qz_security_log').filter(r => r.attempt_id === attempt_id),
  listByQuiz: async (quiz_id) => readKey('qz_security_log').filter(r => r.quiz_id === quiz_id),
  listAll: async () => [...readKey('qz_security_log')],
};

// ---------- Config ----------
export const Config = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(`qz_config_${key}`) ?? 'null'); } catch { return null; } },
  set: (key, value) => { try { localStorage.setItem(`qz_config_${key}`, JSON.stringify(value)); } catch {} },
};
