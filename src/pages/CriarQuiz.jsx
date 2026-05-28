import React, { useState, useEffect, useRef } from 'react';
import { Quiz, Question } from '@/api/entities';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, GripVertical, Save, ChevronDown, ChevronUp,
  Clock, CheckCircle2, List, ToggleLeft, MoveVertical, Loader2, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Múltipla escolha', icon: List },
  { value: 'true_false',      label: 'Verdadeiro / Falso', icon: ToggleLeft },
  { value: 'drag_drop',       label: 'Associar / Arrastar', icon: MoveVertical },
];

const emptyQuestion = (order) => ({
  tempId: `tmp_${Date.now()}_${order}`,
  type: 'multiple_choice',
  presentation_text: '',
  question: '',
  options: ['', '', '', ''],
  correct_answer: '',
  alternatives: ['', '', ''],
  order,
});

export default function CriarQuiz() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const isEditing = Boolean(editId);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  // Quiz metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [timePerQuestion, setTimePerQuestion] = useState(false);
  const [randomize, setRandomize] = useState(true);
  const [questionsToShow, setQuestionsToShow] = useState('');

  // Questions
  const [questions, setQuestions] = useState([emptyQuestion(0)]);
  const [expandedId, setExpandedId] = useState(questions[0].tempId);
  const [dragOver, setDragOver] = useState(null);
  const dragItem = useRef(null);

  useEffect(() => {
    if (isEditing) loadQuiz();
  }, [editId]);

  const loadQuiz = async () => {
    setLoading(true);
    const quiz = await Quiz.get(editId);
    if (!quiz) { navigate('/GerenciarQuiz'); return; }
    setTitle(quiz.title || '');
    setDescription(quiz.description || '');
    setTimeLimit(quiz.time_limit ? String(quiz.time_limit) : '');
    setTimePerQuestion(quiz.time_per_question || false);
    setRandomize(quiz.randomize !== false);
    setQuestionsToShow(quiz.questions_to_show ? String(quiz.questions_to_show) : '');

    const qs = await Question.listByQuiz(editId);
    if (qs.length > 0) {
      setQuestions(qs.map(q => ({
        ...q,
        tempId: q.id,
        options: q.options || ['', '', '', ''],
        alternatives: q.alternatives || ['', '', ''],
      })));
      setExpandedId(qs[0].id);
    }
    setLoading(false);
  };

  // ---- Question helpers ----
  const addQuestion = () => {
    const q = emptyQuestion(questions.length);
    setQuestions(prev => [...prev, q]);
    setExpandedId(q.tempId);
  };

  const removeQuestion = (tempId) => {
    if (questions.length === 1) return;
    setQuestions(prev => prev.filter(q => q.tempId !== tempId).map((q, i) => ({ ...q, order: i })));
  };

  const updateQuestion = (tempId, field, value) => {
    setQuestions(prev => prev.map(q => q.tempId === tempId ? { ...q, [field]: value } : q));
  };

  const updateOption = (tempId, idx, value) => {
    setQuestions(prev => prev.map(q => {
      if (q.tempId !== tempId) return q;
      const opts = [...q.options];
      opts[idx] = value;
      return { ...q, options: opts };
    }));
  };

  const addOption = (tempId) => {
    setQuestions(prev => prev.map(q => {
      if (q.tempId !== tempId) return q;
      return { ...q, options: [...q.options, ''] };
    }));
  };

  const removeOption = (tempId, idx) => {
    setQuestions(prev => prev.map(q => {
      if (q.tempId !== tempId) return q;
      if (q.options.length <= 2) return q;
      const opts = q.options.filter((_, i) => i !== idx);
      return { ...q, options: opts, correct_answer: q.correct_answer === q.options[idx] ? '' : q.correct_answer };
    }));
  };

  const updateAlternative = (tempId, idx, value) => {
    setQuestions(prev => prev.map(q => {
      if (q.tempId !== tempId) return q;
      const alts = [...q.alternatives];
      alts[idx] = value;
      return { ...q, alternatives: alts };
    }));
  };

  // ---- Drag reorder ----
  const handleDragStart = (idx) => { dragItem.current = idx; };
  const handleDragEnter = (idx) => setDragOver(idx);
  const handleDragEnd = () => {
    const from = dragItem.current;
    const to = dragOver;
    if (from === null || to === null || from === to) { setDragOver(null); return; }
    const reordered = [...questions];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setQuestions(reordered.map((q, i) => ({ ...q, order: i })));
    dragItem.current = null;
    setDragOver(null);
  };

  // ---- Save ----
  const handleSave = async () => {
    if (!title.trim()) { alert('Digite o título do quiz.'); return; }
    const validQs = questions.filter(q => q.question.trim());
    if (validQs.length === 0) { alert('Adicione pelo menos uma questão com enunciado.'); return; }

    setSaving(true);
    const quizData = {
      title: title.trim(),
      description: description.trim(),
      time_limit: timeLimit ? Number(timeLimit) : null,
      time_per_question: timePerQuestion,
      randomize,
      questions_to_show: questionsToShow ? Number(questionsToShow) : null,
      question_count: validQs.length,
    };

    let quizId = editId;
    if (isEditing) {
      await Quiz.update(editId, quizData);
      // Delete old questions
      const oldQs = await Question.listByQuiz(editId);
      for (const oq of oldQs) await Question.delete(oq.id);
    } else {
      const quiz = await Quiz.create(quizData);
      quizId = quiz.id;
    }

    for (let i = 0; i < validQs.length; i++) {
      const q = validQs[i];
      const { tempId, id, ...qData } = q;
      await Question.create({ ...qData, quiz_id: quizId, order: i });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate('/GerenciarQuiz'); }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-900/10 to-black" />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/GerenciarQuiz')} className="text-purple-400 hover:text-purple-300">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-purple-400 flex-1">
            {isEditing ? 'Editar Quiz' : 'Novo Quiz'}
          </h1>
          <Button
            onClick={handleSave}
            disabled={saving || saved}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold flex items-center gap-2 min-w-[110px]"
          >
            {saved ? <><Check className="w-4 h-4" /> Salvo!</> :
             saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> :
             <><Save className="w-4 h-4" /> Salvar</>}
          </Button>
        </div>

        {/* Quiz Settings */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 space-y-4">
          <h2 className="text-white font-semibold text-base mb-4">Configurações do Quiz</h2>

          <div>
            <label className="text-white/60 text-sm mb-1 block">Título *</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-black/50 border-white/20 text-white placeholder:text-white/25"
              placeholder="Ex: Funções da Linguagem - Turma A"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-1 block">Descrição (opcional)</label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="bg-black/50 border-white/20 text-white placeholder:text-white/25"
              placeholder="Instruções ou tema do quiz"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-sm mb-1 block flex items-center gap-2">
                <Clock className="w-4 h-4" /> Tempo limite
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  value={timeLimit}
                  onChange={e => setTimeLimit(e.target.value)}
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/25 flex-1"
                  placeholder={timePerQuestion ? 'Seg / questão' : 'Minutos total'}
                />
              </div>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={timePerQuestion}
                  onChange={e => setTimePerQuestion(e.target.checked)}
                  className="accent-purple-500"
                />
                <span className="text-white/50 text-sm">Tempo por questão</span>
              </label>
            </div>

            <div>
              <label className="text-white/60 text-sm mb-1 block">Questões a exibir</label>
              <Input
                type="number"
                min="1"
                value={questionsToShow}
                onChange={e => setQuestionsToShow(e.target.value)}
                className="bg-black/50 border-white/20 text-white placeholder:text-white/25"
                placeholder="Todas (padrão)"
              />
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={randomize}
                  onChange={e => setRandomize(e.target.checked)}
                  className="accent-purple-500"
                />
                <span className="text-white/50 text-sm">Randomizar ordem</span>
              </label>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">{questions.length} Questão(ões)</h2>
            <span className="text-white/30 text-xs">Arraste o ≡ para reordenar</span>
          </div>

          {questions.map((q, idx) => (
            <div
              key={q.tempId}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragEnter={() => handleDragEnter(idx)}
              onDragEnd={handleDragEnd}
              onDragOver={e => e.preventDefault()}
              className={`border rounded-2xl transition-all ${dragOver === idx ? 'border-purple-400 bg-purple-500/10' : 'border-white/10 bg-white/3'}`}
            >
              {/* Question header */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === q.tempId ? null : q.tempId)}
              >
                <div className="cursor-grab text-white/30 hover:text-white/60" onClick={e => e.stopPropagation()}>
                  <GripVertical className="w-5 h-5" />
                </div>
                <span className="w-7 h-7 bg-purple-500/20 text-purple-400 rounded-full text-sm font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-white/70 text-sm flex-1 truncate">
                  {q.question || <span className="italic text-white/30">Enunciado vazio</span>}
                </span>
                <span className="text-white/30 text-xs hidden sm:block">
                  {QUESTION_TYPES.find(t => t.value === q.type)?.label}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); removeQuestion(q.tempId); }}
                  className="text-red-400/50 hover:text-red-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {expandedId === q.tempId ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
              </div>

              {/* Question body */}
              {expandedId === q.tempId && (
                <div className="px-4 pb-5 space-y-4 border-t border-white/10 pt-4">

                  {/* Type selector */}
                  <div>
                    <label className="text-white/50 text-xs mb-2 block">Tipo de questão</label>
                    <div className="flex flex-wrap gap-2">
                      {QUESTION_TYPES.map(t => (
                        <button
                          key={t.value}
                          onClick={() => updateQuestion(q.tempId, 'type', t.value)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                            q.type === t.value
                              ? 'bg-purple-500/20 border-purple-400/60 text-purple-300'
                              : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                          }`}
                        >
                          <t.icon className="w-3.5 h-3.5" />
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Presentation text */}
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">Texto de apresentação (contexto, poema, trecho — opcional)</label>
                    <textarea
                      value={q.presentation_text}
                      onChange={e => updateQuestion(q.tempId, 'presentation_text', e.target.value)}
                      rows={3}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-purple-400/50 resize-none"
                      placeholder="Cole aqui o texto, poema ou contexto que o aluno deve ler antes da pergunta..."
                    />
                  </div>

                  {/* Question text */}
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">Enunciado da questão *</label>
                    <textarea
                      value={q.question}
                      onChange={e => updateQuestion(q.tempId, 'question', e.target.value)}
                      rows={2}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-purple-400/50 resize-none"
                      placeholder="Qual função da linguagem predomina no texto?"
                    />
                  </div>

                  {/* Options — Multiple choice */}
                  {q.type === 'multiple_choice' && (
                    <div>
                      <label className="text-white/50 text-xs mb-2 block">Alternativas (clique no círculo para marcar a correta)</label>
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuestion(q.tempId, 'correct_answer', opt)}
                              className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                                q.correct_answer === opt && opt !== ''
                                  ? 'border-green-400 bg-green-500/20'
                                  : 'border-white/20 hover:border-white/40'
                              }`}
                            >
                              {q.correct_answer === opt && opt !== '' && <div className="w-2.5 h-2.5 bg-green-400 rounded-full" />}
                            </button>
                            <Input
                              value={opt}
                              onChange={e => updateOption(q.tempId, oi, e.target.value)}
                              className="bg-black/40 border-white/15 text-white placeholder:text-white/20 text-sm h-9 flex-1"
                              placeholder={`Alternativa ${String.fromCharCode(65 + oi)}`}
                            />
                            {q.options.length > 2 && (
                              <button onClick={() => removeOption(q.tempId, oi)} className="text-red-400/40 hover:text-red-400">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {q.options.length < 6 && (
                        <button onClick={() => addOption(q.tempId)} className="mt-2 text-cyan-400/60 hover:text-cyan-400 text-sm flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> Adicionar alternativa
                        </button>
                      )}
                    </div>
                  )}

                  {/* True / False */}
                  {q.type === 'true_false' && (
                    <div>
                      <label className="text-white/50 text-xs mb-2 block">Resposta correta</label>
                      <div className="flex gap-3">
                        {['Verdadeiro', 'Falso'].map(val => (
                          <button
                            key={val}
                            onClick={() => updateQuestion(q.tempId, 'correct_answer', val)}
                            className={`flex-1 py-2 rounded-xl font-medium text-sm border transition-all ${
                              q.correct_answer === val
                                ? val === 'Verdadeiro'
                                  ? 'bg-green-500/20 border-green-400/60 text-green-300'
                                  : 'bg-red-500/20 border-red-400/60 text-red-300'
                                : 'bg-white/5 border-white/15 text-white/50 hover:border-white/30'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drag & Drop / Associar */}
                  {q.type === 'drag_drop' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-white/50 text-xs mb-2 block">Itens para associar (textos/frases)</label>
                        <div className="space-y-2">
                          {q.alternatives.map((alt, ai) => (
                            <div key={ai} className="flex items-center gap-2">
                              <span className="text-white/30 text-sm w-5">{String.fromCharCode(97 + ai)})</span>
                              <Input
                                value={alt}
                                onChange={e => updateAlternative(q.tempId, ai, e.target.value)}
                                className="bg-black/40 border-white/15 text-white placeholder:text-white/20 text-sm h-9 flex-1"
                                placeholder={`Item ${ai + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                        {q.alternatives.length < 6 && (
                          <button
                            onClick={() => setQuestions(prev => prev.map(pq => pq.tempId !== q.tempId ? pq : { ...pq, alternatives: [...pq.alternatives, ''] }))}
                            className="mt-2 text-cyan-400/60 hover:text-cyan-400 text-sm flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Adicionar item
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="text-white/50 text-xs mb-2 block">Categorias / rótulos (na mesma ordem dos itens acima)</label>
                        <div className="space-y-2">
                          {q.alternatives.map((_, ai) => (
                            <div key={ai} className="flex items-center gap-2">
                              <span className="text-white/30 text-sm w-5">{ai + 1}.</span>
                              <Input
                                value={(Array.isArray(q.correct_answer) ? q.correct_answer[ai] : '') || ''}
                                onChange={e => {
                                  const arr = Array.isArray(q.correct_answer) ? [...q.correct_answer] : q.alternatives.map(() => '');
                                  arr[ai] = e.target.value;
                                  updateQuestion(q.tempId, 'correct_answer', arr);
                                }}
                                className="bg-black/40 border-white/15 text-white placeholder:text-white/20 text-sm h-9 flex-1"
                                placeholder={`Categoria do item ${ai + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className="text-white/50 text-xs mt-3 mb-2 block">Opções de arrastar (categorias disponíveis para o aluno)</label>
                          <div className="space-y-2">
                            {q.options.map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2">
                                <Input
                                  value={opt}
                                  onChange={e => updateOption(q.tempId, oi, e.target.value)}
                                  className="bg-black/40 border-white/15 text-white placeholder:text-white/20 text-sm h-9 flex-1"
                                  placeholder={`Opção ${oi + 1}`}
                                />
                                {q.options.length > 2 && (
                                  <button onClick={() => removeOption(q.tempId, oi)} className="text-red-400/40 hover:text-red-400">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          {q.options.length < 6 && (
                            <button onClick={() => addOption(q.tempId)} className="mt-2 text-cyan-400/60 hover:text-cyan-400 text-sm flex items-center gap-1">
                              <Plus className="w-3.5 h-3.5" /> Adicionar opção
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add question button */}
        <button
          onClick={addQuestion}
          className="w-full py-4 border-2 border-dashed border-purple-400/30 rounded-2xl text-purple-400/60 hover:border-purple-400/60 hover:text-purple-400 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" /> Adicionar questão
        </button>

        <div className="h-16" />
      </div>
    </div>
  );
}
