import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, UserCog, Sparkles, Plus, BarChart2, Star } from 'lucide-react';
import { Config, Quiz } from '@/api/entities';

export default function Home() {
  const navigate = useNavigate();
  const [mainQuizTitle, setMainQuizTitle] = useState(null);

  useEffect(() => {
    const id = Config.get('main_quiz_id');
    if (id) {
      Quiz.get(id).then(q => setMainQuizTitle(q?.title || null));
    }
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-black" />
      {[...Array(30)].map((_, i) => (
        <div key={i} className="absolute w-1 h-1 bg-purple-400/40 rounded-full animate-pulse"
          style={{ top:`${Math.random()*100}%`, left:`${Math.random()*100}%`, animationDelay:`${Math.random()*3}s` }} />
      ))}

      <div className="relative z-10 max-w-2xl w-full text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-400/30 rounded-full px-4 py-2 mb-6">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-purple-300 text-sm font-medium">PIBID 2026</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Quantum Quiz
        </h1>
        <p className="text-white/50 text-lg mb-12">Sistema de Avaliação Interativa</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Aluno */}
          <button
            onClick={() => navigate('/QuizAluno')}
            className="group bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-400/30 rounded-2xl p-6 text-left hover:border-cyan-400/60 hover:shadow-[0_0_30px_rgba(0,212,255,0.2)] transition-all"
          >
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-cyan-500/30 transition-all">
              <GraduationCap className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-cyan-400 mb-1">Sou Aluno</h2>
            <p className="text-white/40 text-sm">
              {mainQuizTitle
                ? <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{mainQuizTitle}</span>
                : 'Acessar o quiz de Funções da Linguagem'}
            </p>
          </button>

          {/* Professor - Dashboard */}
          <button
            onClick={() => navigate('/QuizProfessor')}
            className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-2xl p-6 text-left hover:border-purple-400/60 hover:shadow-[0_0_30px_rgba(176,38,255,0.2)] transition-all"
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-all">
              <BarChart2 className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-purple-400 mb-1">Dashboard</h2>
            <p className="text-white/40 text-sm">Ver resultados e relatórios da turma</p>
          </button>
        </div>

        {/* Gerenciar Quizzes — destaque */}
        <button
          onClick={() => navigate('/GerenciarQuiz')}
          className="group w-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 border border-white/10 rounded-2xl p-5 text-left hover:border-purple-400/40 hover:shadow-[0_0_30px_rgba(176,38,255,0.15)] transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-pink-400 mb-0.5 flex items-center gap-2">
              Criar & Gerenciar Quizzes
            </h2>
            <p className="text-white/40 text-sm">Crie questões, defina tempo e gerencie seus quizzes</p>
          </div>
        </button>
      </div>
    </div>
  );
}
