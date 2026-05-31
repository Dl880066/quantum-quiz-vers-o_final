import React, { useState, useEffect, useRef } from 'react';
import { QuizAttempt, Quiz, Question, Config, SecurityLog } from '@/api/entities';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import RobotTutorial from '../components/quiz/RobotTutorial';
import RobotTransition from '../components/quiz/RobotTransition';
import StudentInfoForm from '../components/quiz/StudentInfoForm';
import MultipleChoiceQuestion from '../components/quiz/MultipleChoiceQuestion';
import DragDropQuestion from '../components/quiz/DragDropQuestion';
import TrueFalseQuestion from '../components/quiz/TrueFalseQuestion';
import FillBlankQuestion from '../components/quiz/FillBlankQuestion';
import OrderingQuestion from '../components/quiz/OrderingQuestion';

const shuffleArray = (arr) => {
  const s = [...arr];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
};

// Salva progresso no localStorage de forma segura
const saveProgress = (data) => {
  try { localStorage.setItem('qz_progress', JSON.stringify(data)); } catch {}
};
const clearProgress = () => { try { localStorage.removeItem('qz_progress'); } catch {} };
const loadProgress = () => {
  try {
    const raw = localStorage.getItem('qz_progress');
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p?.studentInfo && p?.answers && Object.keys(p.answers).length > 0) return p;
  } catch {}
  return null;
};

export default function QuizAluno() {
  const [searchParams] = useSearchParams();
  const quizIdParam = searchParams.get('quiz_id');

  const [step, setStep] = useState('loading');
  const [quizMeta, setQuizMeta] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [tabSwitches, setTabSwitches] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [showTransition, setShowTransition] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);
  const [fullscreenMsg, setFullscreenMsg] = useState(false);
  const [recoveryData, setRecoveryData] = useState(null);
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const attemptIdRef = useRef(null); // ID da tentativa em andamento (para log de segurança)
  // Refs para leitura sempre atualizada em timers e listeners
  const answersRef = useRef(answers);
  const currentQuestionRef = useRef(currentQuestion);
  const studentInfoRef = useRef(studentInfo);
  const hasSubmittedRef = useRef(false);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { currentQuestionRef.current = currentQuestion; }, [currentQuestion]);
  useEffect(() => { studentInfoRef.current = studentInfo; }, [studentInfo]);

  useEffect(() => {
    loadQuiz();
  }, [quizIdParam]);

  const loadQuiz = async () => {
    const targetId = quizIdParam || Config.get('main_quiz_id');
    if (targetId) {
      const quiz = await Quiz.get(targetId);
      if (quiz && quiz.active) {
        const qs = await Question.listByQuiz(targetId);
        setQuizMeta({ ...quiz, questionsData: qs });
        // Recuperação: só oferece se o progresso for desta mesma avaliação
        const saved = loadProgress();
        if (saved && saved.quizId === quiz.id) setRecoveryData(saved);
        else if (saved && saved.quizId !== quiz.id) clearProgress();
        setStep('info');
        return;
      }
    }
    // Sem quiz configurado: tela de aviso genérica
    setQuizMeta(null);
    setStep('no_quiz');
  };

  // Timer
  useEffect(() => {
    if (step !== 'quiz' || !quizMeta?.time_limit) return;
    setTimeLeft(quizMeta.time_per_question ? quizMeta.time_limit : quizMeta.time_limit * 60);
  }, [step, currentQuestion, quizMeta]);

  useEffect(() => {
    if (timeLeft === null || step !== 'quiz') return;
    if (timeLeft <= 0) {
      if (quizMeta?.time_per_question) handleAnswer(null);
      else submitQuiz(answersRef.current, true);
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, step]);

  // Anti-cheat
  useEffect(() => {
    if (step !== 'quiz') return;
    const maxWarnings = quizMeta?.max_tab_warnings ?? 3;
    const action = quizMeta?.security_action ?? 'block';

    const handle = async () => {
      if (!document.hidden) return;
      await SecurityLog.add({
        quiz_id: quizMeta?.id,
        attempt_id: attemptIdRef.current,
        student_email: studentInfoRef.current?.email,
        student_name: studentInfoRef.current?.name,
        event: 'tab_switch',
        question_index: currentQuestionRef.current,
      });

      setTabSwitches(prev => {
        const n = prev + 1;
        if (n >= maxWarnings) {
          if (action === 'block') setStep('blocked');
          else if (action === 'finish') submitQuiz(answersRef.current);
        }
        return n;
      });
    };

    const handleFs = async () => {
      if (!document.fullscreenElement && quizMeta?.monitor_fullscreen) {
        await SecurityLog.add({
          quiz_id: quizMeta?.id,
          attempt_id: attemptIdRef.current,
          student_email: studentInfoRef.current?.email,
          student_name: studentInfoRef.current?.name,
          event: 'fullscreen_exit',
          question_index: currentQuestionRef.current,
        });
      }
    };

    document.addEventListener('visibilitychange', handle);
    document.addEventListener('fullscreenchange', handleFs);
    return () => {
      document.removeEventListener('visibilitychange', handle);
      document.removeEventListener('fullscreenchange', handleFs);
    };
  }, [step, quizMeta]);

  useEffect(() => {
    const prevent = () => window.history.pushState(null, '', window.location.href);
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', prevent);
    return () => window.removeEventListener('popstate', prevent);
  }, []);

  const handleInfoSubmit = async (info) => {
    setIsCheckingEmail(true);
    try {
      const existing = await QuizAttempt.filter({ student_email: info.email, quiz_id: quizMeta.id });
      const maxAtt = quizMeta?.max_attempts ?? 1;
      // 0 = ilimitado
      if (maxAtt !== 0 && existing.length >= maxAtt) {
        setIsCheckingEmail(false);
        setStudentInfo(info);
        setAttemptsLeft(0);
        return;
      }
      setAttemptsLeft(maxAtt === 0 ? null : maxAtt - existing.length - 1);
    } catch (e) { console.error(e); }
    setStudentInfo(info);
    setStep('tutorial');
    setIsCheckingEmail(false);
  };

  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setFullscreenMsg(false);
      } else setFullscreenMsg(true);
    } catch { setFullscreenMsg(true); }
  };

  const handleTutorialComplete = () => {
    enterFullscreen();
    setStartTime(new Date());
    const qs = quizMeta.questionsData || [];
    const toShow = quizMeta.questions_to_show ? Number(quizMeta.questions_to_show) : qs.length;
    const final = quizMeta.randomize !== false ? shuffleArray(qs).slice(0, toShow) : qs.slice(0, toShow);
    setShuffledQuestions(final);
    setStep('quiz');
  };

  const handleAnswer = (answer) => {
    const question = shuffledQuestions[currentQuestion];
    const updatedAnswers = { ...answers, [question.id]: answer };
    setAnswers(updatedAnswers);
    clearTimeout(timerRef.current);

    saveProgress({
      quizId: quizMeta?.id,
      studentInfo,
      answers: updatedAnswers,
      currentQuestion: currentQuestion + 1,
      startTime: startTime?.toISOString(),
      questionOrder: shuffledQuestions.map(q => q.id),
    });

    if (currentQuestion < shuffledQuestions.length - 1) {
      setShowTransition(true);
    } else {
      submitQuiz(updatedAnswers);
    }
  };

  const handleTransitionComplete = () => {
    setShowTransition(false);
    setCurrentQuestion(c => c + 1);
  };

  const normalize = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  const arraysEqual = (a, b) =>
    Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]);

  const calculateScore = (finalAnswers) => {
    let correct = 0;
    shuffledQuestions.forEach(q => {
      const ua = finalAnswers[q.id];
      if (q.type === 'drag_drop') {
        // ua é um objeto { textoAlternativa: opçãoEscolhida }
        // q.correct_answer é um array alinhado a q.alternatives
        if (ua && typeof ua === 'object' && Array.isArray(q.correct_answer) && Array.isArray(q.alternatives)) {
          const allRight = q.alternatives.every((alt, i) => ua[alt] === q.correct_answer[i]);
          if (allRight && Object.keys(ua).length === q.alternatives.length) correct++;
        }
      } else if (q.type === 'ordering') {
        if (arraysEqual(ua, q.options)) correct++;
      } else if (q.type === 'fill_blank') {
        if (ua && normalize(ua) === normalize(q.correct_answer)) correct++;
      } else {
        if (ua === q.correct_answer) correct++;
      }
    });
    const perQ = shuffledQuestions.length > 0 ? 10.0 / shuffledQuestions.length : 0;
    return Math.round(correct * perQ * 100) / 100;
  };

  const submitQuiz = async (finalAnswers, timedOut = false) => {
    if (hasSubmittedRef.current) return; // evita dupla submissão
    hasSubmittedRef.current = true;
    setIsSubmitting(true);
    const endTime = new Date();
    const duration = ((endTime - (startTime || endTime)) / 1000 / 60);
    const score = calculateScore(finalAnswers);

    try {
      // Número desta tentativa = nº de tentativas anteriores + 1
      const previousCount = await QuizAttempt.countByStudent(quizMeta.id, studentInfo.email);
      const attempt = await QuizAttempt.create({
        quiz_id: quizMeta.id,
        quiz_title: quizMeta.title,
        student_name: studentInfo.name,
        student_email: studentInfo.email,
        score,
        max_score: 10,
        answers: finalAnswers,
        start_time: (startTime || endTime).toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: Math.round(duration * 100) / 100,
        tab_switches: tabSwitches,
        blocked: false,
        timed_out: timedOut,
        attempt_number: previousCount + 1,
      });
      attemptIdRef.current = attempt.id;
    } catch (e) { console.error('Erro ao salvar tentativa:', e); hasSubmittedRef.current = false; }

    clearProgress();
    setStep('completed');
    setIsSubmitting(false);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  // ── Sem quiz disponível ──
  if (step === 'no_quiz') return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-xl font-bold text-white/60 mb-3">Nenhuma avaliação disponível</h3>
        <p className="text-white/40 text-sm">Aguarde seu professor disponibilizar uma avaliação.</p>
      </div>
    </div>
  );

  // ── Recuperação de progresso ──
  if (recoveryData && step === 'info') return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/50 rounded-3xl p-8 text-center">
        <div className="text-4xl mb-4">🔄</div>
        <h3 className="text-xl font-bold text-yellow-400 mb-3">Progresso Encontrado</h3>
        <p className="text-white/70 text-sm mb-2">Avaliação incompleta de <strong className="text-white">{recoveryData.studentInfo?.name}</strong>.</p>
        <p className="text-white/50 text-xs mb-6">{Object.keys(recoveryData.answers || {}).length} questão(ões) respondida(s)</p>
        <button
          onClick={() => {
            setStudentInfo(recoveryData.studentInfo);
            setAnswers(recoveryData.answers || {});
            setCurrentQuestion(recoveryData.currentQuestion || 0);
            setStartTime(recoveryData.startTime ? new Date(recoveryData.startTime) : new Date());
            setRecoveryData(null);
            const qs = quizMeta?.questionsData || [];
            // Restaura a mesma ordem de questões da sessão original (se persistida)
            let session;
            if (Array.isArray(recoveryData.questionOrder) && recoveryData.questionOrder.length) {
              session = recoveryData.questionOrder
                .map(id => qs.find(q => q.id === id))
                .filter(Boolean);
            } else {
              const toShow = quizMeta?.questions_to_show ? Number(quizMeta.questions_to_show) : qs.length;
              session = qs.slice(0, toShow);
            }
            setShuffledQuestions(session);
            setStep('quiz');
          }}
          className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl mb-3">
          Continuar de onde parei
        </button>
        <button onClick={() => { clearProgress(); setRecoveryData(null); }} className="w-full py-2 text-white/40 hover:text-white/60 text-sm">
          Iniciar do zero
        </button>
      </div>
    </div>
  );

  if (step === 'loading') return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>;

  if (step === 'info') {
    const maxAtt = quizMeta?.max_attempts ?? 1;
    return (
      <StudentInfoForm
        onSubmit={handleInfoSubmit}
        isChecking={isCheckingEmail}
        quizTitle={quizMeta?.title}
        attemptsLeft={attemptsLeft}
        maxAttempts={maxAtt === 0 ? null : maxAtt}
      />
    );
  }

  if (step === 'tutorial') return <RobotTutorial onComplete={handleTutorialComplete} hasTimer={!!quizMeta?.time_limit} />;

  if (step === 'blocked') return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-400 rounded-3xl p-8 text-center">
        <AlertTriangle className="w-20 h-20 text-red-400 mx-auto mb-6 animate-pulse" />
        <h2 className="text-3xl font-bold text-red-400 mb-4">Avaliação Bloqueada</h2>
        <p className="text-white/90 mb-2">Você atingiu o limite de {quizMeta?.max_tab_warnings ?? 3} saída(s) de foco detectada(s).</p>
        <p className="text-white/60 text-sm mt-4">Entre em contato com seu professor.</p>
      </div>
    </div>
  );

  if (step === 'completed') return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-green-500/20 to-cyan-500/20 border border-green-400 rounded-3xl p-8 text-center">
        <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-6 animate-pulse" />
        <h2 className="text-3xl font-bold text-green-400 mb-4">Avaliação Concluída!</h2>
        <p className="text-white/90 mb-2">Parabéns, {studentInfo?.name?.split(' ')[0]}!</p>
        <p className="text-cyan-300 text-sm">Suas respostas foram salvas com sucesso.</p>
      </div>
    </div>
  );

  const question = shuffledQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / shuffledQuestions.length) * 100;
  // Índice fora de faixa na recuperação: todas já respondidas → finalizar
  if (step === 'quiz' && shuffledQuestions.length > 0 && currentQuestion >= shuffledQuestions.length && !isSubmitting) {
    submitQuiz(answers);
    return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>;
  }
  if (!question) return null;
  const maxWarnings = quizMeta?.max_tab_warnings ?? 3;
  const action = quizMeta?.security_action ?? 'block';

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">

      {/* Modal Tela Cheia */}
      {fullscreenMsg && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6">
          <div className="max-w-sm w-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 rounded-3xl p-8 text-center shadow-[0_0_40px_rgba(0,212,255,0.3)]">
            <div className="text-4xl mb-4">🖥️</div>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">Tela Cheia Recomendada</h3>
            <p className="text-white/70 text-sm mb-6">Para maior segurança durante a avaliação, ative o modo tela cheia antes de continuar.</p>
            <button onClick={async () => { try { await document.documentElement.requestFullscreen(); } catch {} setFullscreenMsg(false); }}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl mb-3">
              Ativar Tela Cheia
            </button>
            <button onClick={() => setFullscreenMsg(false)} className="w-full py-2 text-white/40 hover:text-white/60 text-sm">
              Continuar sem tela cheia
            </button>
          </div>
        </div>
      )}

      {showTransition && <RobotTransition questionNumber={currentQuestion + 2} totalQuestions={shuffledQuestions.length} onComplete={handleTransitionComplete} />}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-black" />

      {/* Aviso de troca de aba */}
      {tabSwitches > 0 && tabSwitches < maxWarnings && (action === 'warn' || action === 'block' || action === 'finish') && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 border border-red-400 rounded-xl px-6 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-white" />
            <p className="text-white font-bold">Atenção: saída de foco detectada! ({tabSwitches}/{maxWarnings})</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 border-b border-cyan-400/30 bg-black/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-300 font-medium">Questão {currentQuestion + 1} de {shuffledQuestions.length}</span>
            </div>
            <div className="flex items-center gap-4">
              {timeLeft !== null && (
                <span className={`font-mono font-bold text-sm ${timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
                  {formatTime(timeLeft)}
                </span>
              )}
              <span className="text-purple-300 text-sm">{studentInfo?.name?.split(' ')[0]}</span>
            </div>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Questão */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
          {isSubmitting ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
              <p className="text-white text-lg">Salvando suas respostas...</p>
            </div>
          ) : (
            <>
              {question.type === 'multiple_choice' && <MultipleChoiceQuestion key={question.id} question={question} onAnswer={handleAnswer} />}
              {question.type === 'drag_drop'       && <DragDropQuestion       key={question.id} question={question} onAnswer={handleAnswer} />}
              {question.type === 'true_false'      && <TrueFalseQuestion      key={question.id} question={question} onAnswer={handleAnswer} />}
              {question.type === 'fill_blank'      && <FillBlankQuestion      key={question.id} question={question} onAnswer={handleAnswer} />}
              {question.type === 'ordering'        && <OrderingQuestion       key={question.id} question={question} onAnswer={handleAnswer} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
