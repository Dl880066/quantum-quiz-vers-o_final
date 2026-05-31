import React, { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * FillBlankQuestion — o aluno digita a resposta para preencher a lacuna.
 * O campo "correct_answer" contém a resposta esperada (string).
 * A comparação é feita sem distinção de maiúsculas/minúsculas e sem acentos.
 */
export default function FillBlankQuestion({ question, onAnswer }) {
  const [typed, setTyped] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Texto com lacuna: substitui ___ por um placeholder visual
  const renderText = (text) => {
    if (!text) return null;
    const parts = text.split('___');
    return parts.map((part, i) => (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: part }} />
        {i < parts.length - 1 && (
          <span className="inline-block min-w-[120px] border-b-2 border-cyan-400 mx-1 pb-0.5 text-center text-cyan-300 font-mono text-sm">
            {submitted ? typed : '________'}
          </span>
        )}
      </span>
    ));
  };

  const handleSubmit = () => {
    if (!typed.trim()) return;
    setSubmitted(true);
    setTimeout(() => onAnswer(typed.trim()), 600);
  };

  return (
    <div className="space-y-6">
      {/* Presentation text */}
      {question.presentation_text && (
        <div
          className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white/80 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: question.presentation_text }}
        />
      )}

      {/* Question / frase com lacuna */}
      <div className="text-white font-medium text-base leading-relaxed">
        {question.question.includes('___')
          ? renderText(question.question)
          : <span dangerouslySetInnerHTML={{ __html: question.question }} />}
      </div>

      {/* Input */}
      {!submitted ? (
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={typed}
            onChange={e => setTyped(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="flex-1 bg-black/50 border border-cyan-400/40 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400 text-sm"
            placeholder="Digite sua resposta aqui..."
            autoFocus
          />
          <Button
            onClick={handleSubmit}
            disabled={!typed.trim()}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold px-5 py-3 h-auto flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Confirmar
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-400/40 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <span className="text-green-300 text-sm">Resposta registrada!</span>
        </div>
      )}

      <p className="text-white/30 text-xs">Pressione Enter ou clique em "Confirmar" para avançar.</p>
    </div>
  );
}
