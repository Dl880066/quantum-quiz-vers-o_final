import React, { useState, useEffect, useRef } from 'react';
import { QuizAttempt, Quiz, Question, Config } from '@/api/entities';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import RobotTutorial from '../components/quiz/RobotTutorial';
import RobotTransition from '../components/quiz/RobotTransition';
import StudentInfoForm from '../components/quiz/StudentInfoForm';
import MultipleChoiceQuestion from '../components/quiz/MultipleChoiceQuestion';
import DragDropQuestion from '../components/quiz/DragDropQuestion';
import TrueFalseQuestion from '../components/quiz/TrueFalseQuestion';

// ---------- Quiz padrão embutido (PIBID) ----------
const DEFAULT_QUIZ = {
  id: 'default',
  title: 'Funções da Linguagem - PIBID',
  randomize: true,
  questions_to_show: 10,
  time_per_question: false,
  time_limit: null,
};

const DEFAULT_QUESTIONS = [
  { id:'q1',type:'multiple_choice',order:0,presentation_text:'1) (Unifesp-2002)<br><br><strong>Texto II:</strong><br><em>Tu choraste em presença da morte?<br>Na presença de estranhos choraste?<br>Não descende o cobarde do forte;<br>Pois choraste, meu filho não és!</em><br>(Gonçalves Dias)<br><br><strong>Texto V:</strong><br><em>Meu Deus! Meu Deus! Mas que bandeira é esta...<br>Silêncio! ...Musa! Chora, chora tanto<br>Que o pavilhão se lave no teu pranto...</em><br>(Castro Alves)',question:'Dois dos cinco textos expressam sentimentos de incontida revolta. Esses dois textos são:',options:['I e V','II e III','II e V','III e V','IV e V'],correct_answer:'II e V' },
  { id:'q2',type:'multiple_choice',order:1,presentation_text:'2) (Enem-2014)<br><em>O telefone tocou. — Alô? Quem fala? — Como? Com quem deseja falar?...</em>',question:'Pela insistência em manter o contato entre emissor e receptor, predomina no texto a função:',options:['metalinguística','fática','referencial','emotiva','conativa'],correct_answer:'fática' },
  { id:'q3',type:'multiple_choice',order:2,presentation_text:'3) (Enem-2010)<br><em>A biosfera, que reúne todos os ambientes onde se desenvolvem os seres vivos, se divide em unidades menores chamadas ecossistemas...</em>',question:'Predomina no texto a função da linguagem:',options:['emotiva, porque o autor expressa seu sentimento','fática, porque o texto testa o canal','poética, porque chama atenção para a linguagem','conativa, porque procura orientar comportamentos','referencial, porque trata de noções conceituais'],correct_answer:'referencial, porque trata de noções conceituais' },
  { id:'q4',type:'drag_drop',order:3,presentation_text:'4) Relacione os textos com a função da linguagem (Parte 1):',question:'Associe cada texto à sua função:',alternatives:['a) O vento varria as folhas... (Manuel Bandeira)','b) — Alô! — Bom dia! — Quero falar com o João...','c) Eu fico pensando em nós dois... (Rita Lee)'],options:['Poética','Fática','Emotiva'],correct_answer:['Poética','Fática','Emotiva'] },
  { id:'q5',type:'drag_drop',order:4,presentation_text:'5) Relacione os textos com a função da linguagem (Parte 2):',question:'Associe cada texto à sua função:',alternatives:['d) Não deixe para depois. Compre já seu carro novo!','e) "A maior parte dos ministros do STF rejeita..." (Revista Veja)','f) O sujeito das orações pode ser classificado em simples ou composto.'],options:['Conativa','Referencial','Metalinguística'],correct_answer:['Conativa','Referencial','Metalinguística'] },
  { id:'q6',type:'multiple_choice',order:5,presentation_text:'6) <em>"Mesmo quando tudo parece desabar, cabe a mim decidir entre rir ou chorar..."</em> — Cora Coralina',question:'A função emotiva da linguagem pode ser identificada porque:',options:['há objetividade da informação transmitida.','há emprego de formas verbais no pretérito.','evidencia o código reproduzido por ele próprio.','mensagem centrada no emissor, com seus anseios e percepções.','presença de marcas de interlocução.'],correct_answer:'mensagem centrada no emissor, com seus anseios e percepções.' },
  { id:'q7',type:'multiple_choice',order:6,presentation_text:'7) Carlos Drummond de Andrade — <em>Diálogo de todo dia</em>: <em>— Alô, quem fala? — Ninguém. Quem fala é você...</em>',question:'A confusão na crônica é desencadeada por um trecho em que predomina a função:',options:['conativa, pois o emissor se direciona ao receptor.','poética, por construir narrativa humorística.','fática, pois a pergunta abre o canal de comunicação.','fática, por marcas de oralidade como "engraçadinho".','emotiva, por linguagem figurativa.'],correct_answer:'fática, pois a pergunta abre o canal de comunicação.' },
  { id:'q8',type:'multiple_choice',order:7,presentation_text:'8) (Enem 2015) <em>Perder a tramontana — É perder o norte, desorientar-se...</em>',question:'Utilizando a função referencial, o autor busca:',options:['apresentar seus indícios subjetivos.','convencer o leitor a utilizá-la.','expor dados reais de seu emprego.','explorar sua dimensão estética.','criticar sua origem conceitual.'],correct_answer:'expor dados reais de seu emprego.' },
  { id:'q9',type:'multiple_choice',order:8,presentation_text:'9) <em>Ou isto ou aquilo — Ou se tem chuva e não se tem sol, / ou se tem sol e não se tem chuva!</em> (Cecília Meireles)',question:'A função da linguagem predominante no poema é:',options:['Referencial','Emotiva','Poética','Conativa','Fática'],correct_answer:'Poética' },
  { id:'q10',type:'multiple_choice',order:9,presentation_text:'10) <em>"Venha para a nossa instituição e torne-se um dos maiores pensadores do país!"</em>',question:'A função conativa pode ser identificada porque:',options:['transmite informações objetivas.','há preocupação estética com a forma.','centra-se no receptor, com verbos no imperativo.','o emissor expressa sentimentos pessoais.','há explicação sobre o código linguístico.'],correct_answer:'centra-se no receptor, com verbos no imperativo.' },
  { id:'q11',type:'multiple_choice',order:10,presentation_text:'11) <em>A mão que escreve este poema / não sabe o que está escrevendo...</em> (Drummond)',question:'A função da linguagem quando o código é o próprio assunto é:',options:['Emotiva','Referencial','Poética','Metalinguística','Fática'],correct_answer:'Metalinguística' },
  { id:'q12',type:'multiple_choice',order:11,presentation_text:'12) A função fática centra-se no contato, com expressões como "veja bem", "entende?", "você está me ouvindo?".',question:'Qual das alternativas exemplifica a função fática?',options:['"A água ferve a 100°C ao nível do mar."','"Que saudade que eu sinto da minha terra!"','"Alô? Alô, você está me ouvindo?"','"Compre agora e ganhe um brinde exclusivo!"','"Poesia é quando a palavra vira verso."'],correct_answer:'"Alô? Alô, você está me ouvindo?"' },
  { id:'q13',type:'true_false',order:12,presentation_text:'13) Segundo Jakobson, para a comunicação são necessários: remetente, mensagem, destinatário, contexto, código e canal.',question:'A função referencial centra-se no contexto e transmite a mensagem objetivamente, sendo predominante em notícias e artigos científicos.',options:['Verdadeiro','Falso'],correct_answer:'Verdadeiro' },
  { id:'q14',type:'true_false',order:13,presentation_text:'14) A função metalinguística ocorre quando o código é o centro do enunciado (metalinguagem).',question:'A função metalinguística está presente somente em dicionários e gramáticas, não podendo aparecer em poemas.',options:['Verdadeiro','Falso'],correct_answer:'Falso' },
];

const shuffleArray = (arr) => {
  const s = [...arr];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
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
  const hasSetupAntiCheat = useRef(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [showTransition, setShowTransition] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => { loadQuiz(); }, [quizIdParam]);

  const loadQuiz = async () => {
    // Prioridade: 1) param da URL, 2) quiz principal definido pelo professor, 3) PIBID padrão
    const targetId = quizIdParam || Config.get('main_quiz_id');

    if (targetId) {
      const quiz = await Quiz.get(targetId);
      if (quiz && quiz.active) {
        const qs = await Question.listByQuiz(targetId);
        setQuizMeta({ ...quiz, questionsData: qs });
        setStep('info');
        return;
      }
    }
    setQuizMeta({ ...DEFAULT_QUIZ, questionsData: DEFAULT_QUESTIONS });
    setStep('info');
  };

  // Timer logic
  useEffect(() => {
    if (step !== 'quiz' || !quizMeta?.time_limit) return;
    if (quizMeta.time_per_question) {
      setTimeLeft(quizMeta.time_limit);
    } else {
      setTimeLeft(quizMeta.time_limit * 60);
    }
  }, [step, currentQuestion, quizMeta]);

  useEffect(() => {
    if (timeLeft === null || step !== 'quiz') return;
    if (timeLeft <= 0) {
      if (quizMeta?.time_per_question) {
        handleAnswer(null);
      } else {
        submitQuiz(answers, true);
      }
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, step]);

  // Anti-Cheat
  useEffect(() => {
    if (step !== 'quiz' || hasSetupAntiCheat.current) return;
    const handle = () => {
      if (document.hidden) setTabSwitches(prev => {
        const n = prev + 1;
        if (n >= 3) setStep('blocked');
        return n;
      });
    };
    document.addEventListener('visibilitychange', handle);
    hasSetupAntiCheat.current = true;
    return () => document.removeEventListener('visibilitychange', handle);
  }, [step]);

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
      if (existing.length > 0) {
        alert('❌ Este e-mail já realizou esta avaliação.');
        setIsCheckingEmail(false);
        return;
      }
    } catch (e) { console.error(e); }
    setStudentInfo(info);
    setStep('tutorial');
    setIsCheckingEmail(false);
  };

  const handleTutorialComplete = () => {
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

  const calculateScore = (finalAnswers) => {
    let correct = 0;
    shuffledQuestions.forEach(q => {
      const ua = finalAnswers[q.id];
      if (q.type === 'drag_drop') {
        if (Array.isArray(q.correct_answer) && Array.isArray(ua)) {
          if (ua.every((v, i) => v === q.correct_answer[i])) correct++;
        }
      } else {
        if (ua === q.correct_answer) correct++;
      }
    });
    const perQ = 3.0 / shuffledQuestions.length;
    return Math.round(correct * perQ * 100) / 100;
  };

  const submitQuiz = async (finalAnswers, timedOut = false) => {
    setIsSubmitting(true);
    const endTime = new Date();
    const duration = ((endTime - (startTime || endTime)) / 1000 / 60);
    const score = calculateScore(finalAnswers);

    try {
      await QuizAttempt.create({
        quiz_id: quizMeta.id,
        quiz_title: quizMeta.title,
        student_name: studentInfo.name,
        student_email: studentInfo.email,
        score,
        answers: finalAnswers,
        start_time: (startTime || endTime).toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: Math.round(duration * 100) / 100,
        tab_switches: tabSwitches,
        blocked: false,
        timed_out: timedOut,
      });
    } catch (e) { console.error(e); }

    setStep('completed');
    setIsSubmitting(false);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  if (step === 'loading') return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
    </div>
  );
  if (step === 'info') return <StudentInfoForm onSubmit={handleInfoSubmit} isChecking={isCheckingEmail} quizTitle={quizMeta?.title} />;
  if (step === 'tutorial') return <RobotTutorial onComplete={handleTutorialComplete} hasTimer={!!quizMeta?.time_limit} />;

  if (step === 'blocked') return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-400 rounded-3xl p-8 text-center">
        <AlertTriangle className="w-20 h-20 text-red-400 mx-auto mb-6 animate-pulse" />
        <h2 className="text-3xl font-bold text-red-400 mb-4">Quiz Bloqueado</h2>
        <p className="text-white/90 mb-4">Você tentou trocar de aba 3 vezes.</p>
        <p className="text-white/60 text-sm">Entre em contato com seu professor.</p>
      </div>
    </div>
  );

  if (step === 'completed') return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-green-500/20 to-cyan-500/20 border border-green-400 rounded-3xl p-8 text-center">
        <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-6 animate-pulse" />
        <h2 className="text-3xl font-bold text-green-400 mb-4">Quiz Concluído!</h2>
        <p className="text-white/90 mb-2">Parabéns, {studentInfo.name}!</p>
        <p className="text-cyan-300 text-sm">Sua avaliação foi salva com sucesso.</p>
      </div>
    </div>
  );

  const question = shuffledQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / shuffledQuestions.length) * 100;
  if (!question) return null;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {showTransition && (
        <RobotTransition questionNumber={currentQuestion + 2} totalQuestions={shuffledQuestions.length} onComplete={handleTransitionComplete} />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-black" />

      {tabSwitches > 0 && tabSwitches < 3 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 border border-red-400 rounded-xl px-6 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-white" />
            <p className="text-white font-bold">Aviso: Não troque de aba! ({tabSwitches}/3)</p>
          </div>
        </div>
      )}

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
              <span className="text-purple-300 text-sm">{studentInfo.name.split(' ')[0]}</span>
            </div>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

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
              {question.type === 'drag_drop' && <DragDropQuestion key={question.id} question={question} onAnswer={handleAnswer} />}
              {question.type === 'true_false' && <TrueFalseQuestion key={question.id} question={question} onAnswer={handleAnswer} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
