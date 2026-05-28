// ============================================================
// localStore.js — Armazenamento local completo (v2)
// Gerencia: QuizAttempt, Quiz (criados pelo professor), Questions
// ============================================================

const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const readKey = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
};
const writeKey = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// ---------- QuizAttempt (respostas dos alunos) ----------
export const QuizAttempt = {
  create: async (data) => {
    const all = readKey('qz_attempts');
    const record = { id: generateId(), created_date: new Date().toISOString(), ...data };
    all.push(record);
    writeKey('qz_attempts', all);
    return record;
  },
  list: async () => {
    return [...readKey('qz_attempts')].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  },
  filter: async (filters) => {
    return readKey('qz_attempts').filter(r => Object.entries(filters).every(([k, v]) => r[k] === v));
  },
  delete: async (id) => {
    writeKey('qz_attempts', readKey('qz_attempts').filter(r => r.id !== id));
  },
};

// ---------- Quiz (criados pelo professor) ----------
export const Quiz = {
  create: async (data) => {
    const all = readKey('qz_quizzes');
    const record = { id: generateId(), created_date: new Date().toISOString(), active: true, ...data };
    all.push(record);
    writeKey('qz_quizzes', all);
    return record;
  },
  list: async () => {
    return [...readKey('qz_quizzes')].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  },
  get: async (id) => {
    return readKey('qz_quizzes').find(r => r.id === id) || null;
  },
  update: async (id, data) => {
    const all = readKey('qz_quizzes').map(r => r.id === id ? { ...r, ...data } : r);
    writeKey('qz_quizzes', all);
    return all.find(r => r.id === id);
  },
  delete: async (id) => {
    writeKey('qz_quizzes', readKey('qz_quizzes').filter(r => r.id !== id));
    // Remove questões associadas
    writeKey('qz_questions', readKey('qz_questions').filter(r => r.quiz_id !== id));
  },
};

// ---------- Question (questões de cada quiz) ----------
export const Question = {
  create: async (data) => {
    const all = readKey('qz_questions');
    const record = { id: generateId(), created_date: new Date().toISOString(), ...data };
    all.push(record);
    writeKey('qz_questions', all);
    return record;
  },
  listByQuiz: async (quiz_id) => {
    return readKey('qz_questions')
      .filter(r => r.quiz_id === quiz_id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
  update: async (id, data) => {
    const all = readKey('qz_questions').map(r => r.id === id ? { ...r, ...data } : r);
    writeKey('qz_questions', all);
    return all.find(r => r.id === id);
  },
  delete: async (id) => {
    writeKey('qz_questions', readKey('qz_questions').filter(r => r.id !== id));
  },
  reorder: async (quiz_id, orderedIds) => {
    const all = readKey('qz_questions').map(r => {
      if (r.quiz_id !== quiz_id) return r;
      const idx = orderedIds.indexOf(r.id);
      return idx >= 0 ? { ...r, order: idx } : r;
    });
    writeKey('qz_questions', all);
  },
};

// ---------- Configuração global (quiz principal, etc.) ----------
export const Config = {
  get: (key) => {
    try { return JSON.parse(localStorage.getItem(`qz_config_${key}`) ?? 'null'); } catch { return null; }
  },
  set: (key, value) => {
    localStorage.setItem(`qz_config_${key}`, JSON.stringify(value));
  },
};
