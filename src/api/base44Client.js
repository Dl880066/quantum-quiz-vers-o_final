// base44Client.js — stub vazio (Base44 removido)
// Mantido apenas para evitar erros de importação legados.
import { QuizAttempt } from './localStore.js';

export const base44 = {
  entities: {
    QuizAttempt,
  },
  auth: {
    me: async () => null,
    logout: () => {},
    redirectToLogin: () => {},
  },
};
