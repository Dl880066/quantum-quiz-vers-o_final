import React, { useState, useEffect } from 'react';
import { Quiz, QuizAttempt, Config } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Play, BarChart2, ArrowLeft,
  Clock, FileQuestion, CheckCircle, Eye, EyeOff, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CORRECT_PASSWORD = 'professor123';

export default function GerenciarQuiz() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [attemptCounts, setAttemptCounts] = useState({});
  const [mainQuizId, setMainQuizId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (authed) loadData();
  }, [authed]);

  const loadData = async () => {
    const list = await Quiz.list();
    setQuizzes(list);
    const counts = {};
    for (const q of list) {
      const attempts = await QuizAttempt.filter({ quiz_id: q.id });
      counts[q.id] = attempts.length;
    }
    setAttemptCounts(counts);
    setMainQuizId(Config.get('main_quiz_id'));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (pwd === CORRECT_PASSWORD) { setAuthed(true); setPwdError(''); }
    else setPwdError('Senha incorreta!');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apagar este quiz e todas as suas questões?')) return;
    await Quiz.delete(id);
    loadData();
  };

  const handleToggleActive = async (quiz) => {
    await Quiz.update(quiz.id, { active: !quiz.active });
    loadData();
  };

  const handleSetMain = (id) => {
    const newMain = mainQuizId === id ? null : id;
    Config.set('main_quiz_id', newMain);
    setMainQuizId(newMain);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-black" />
        <div className="relative max-w-md w-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-3xl p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(176,38,255,0.3)]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-2xl border border-purple-400/50 mb-4">
              <FileQuestion className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-purple-400">Gerenciar Quizzes</h2>
            <p className="text-purple-300/60 text-sm mt-1">Acesso restrito ao professor</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Input
                type={showPwd ? 'text' : 'password'}
                value={pwd}
                onChange={e => setPwd(e.target.value)}
                className="bg-black/50 border-purple-400/30 text-white placeholder:text-white/30 h-12 pr-12"
                placeholder="Senha do professor"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-3.5 text-purple-400">
                {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {pwdError && <p className="text-pink-400 text-sm">{pwdError}</p>}
            <Button type="submit" className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
              Entrar
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-900/10 to-black" />
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-purple-400 hover:text-purple-300">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-purple-400">Meus Quizzes</h1>
              <p className="text-purple-300/60 text-sm">{quizzes.length} quiz(zes) criado(s)</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/CriarQuiz')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Novo Quiz
          </Button>
        </div>

        {/* Quiz list */}
        {quizzes.length === 0 ? (
          <div className="text-center py-24">
            <FileQuestion className="w-16 h-16 text-purple-400/30 mx-auto mb-4" />
            <p className="text-white/40 text-lg">Nenhum quiz criado ainda</p>
            <p className="text-white/25 text-sm mt-2">Clique em "Novo Quiz" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map(quiz => (
              <div key={quiz.id} className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl p-5 hover:border-purple-400/30 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-semibold text-lg truncate">{quiz.title}</h3>
                      {mainQuizId === quiz.id && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1 shrink-0">
                          <Star className="w-3 h-3 fill-yellow-400" /> Principal
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${quiz.active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-white/40 border border-white/20'}`}>
                        {quiz.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    {quiz.description && (
                      <p className="text-white/50 text-sm mb-3 line-clamp-2">{quiz.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-white/40">
                      <span className="flex items-center gap-1">
                        <FileQuestion className="w-4 h-4" />
                        {quiz.question_count ?? 0} questões
                      </span>
                      {quiz.time_limit && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {quiz.time_per_question ? `${quiz.time_limit}s por questão` : `${quiz.time_limit} min total`}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <BarChart2 className="w-4 h-4" />
                        {attemptCounts[quiz.id] ?? 0} respostas
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleSetMain(quiz.id)}
                      title={mainQuizId === quiz.id ? 'Remover como principal' : 'Definir como quiz principal'}
                      className={`p-2 rounded-lg border transition-all ${
                        mainQuizId === quiz.id
                          ? 'border-yellow-400/60 text-yellow-400 bg-yellow-500/10'
                          : 'border-white/20 text-white/30 hover:border-yellow-400/40 hover:text-yellow-400/60'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${mainQuizId === quiz.id ? 'fill-yellow-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(quiz)}
                      title={quiz.active ? 'Desativar' : 'Ativar'}
                      className={`p-2 rounded-lg border transition-all ${quiz.active ? 'border-green-400/30 text-green-400 hover:bg-green-500/10' : 'border-white/20 text-white/40 hover:bg-white/5'}`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/CriarQuiz?id=${quiz.id}`)}
                      title="Editar"
                      className="p-2 rounded-lg border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/10 transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/QuizAluno?quiz_id=${quiz.id}`)}
                      title="Visualizar como aluno"
                      className="p-2 rounded-lg border border-purple-400/30 text-purple-400 hover:bg-purple-500/10 transition-all"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(quiz.id)}
                      title="Excluir"
                      className="p-2 rounded-lg border border-red-400/30 text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
