import React, { useState, useEffect } from 'react';
import { GripVertical, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * OrderingQuestion — o aluno arrasta/reordena os itens na sequência correta.
 * A resposta correta é o array question.options na ordem original.
 */
export default function OrderingQuestion({ question, onAnswer }) {
  const [items, setItems] = useState([]);
  const [dragIdx, setDragIdx] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    // Embaralha os itens para o aluno
    const shuffled = [...question.options].sort(() => Math.random() - 0.5);
    setItems(shuffled);
  }, [question.id]);

  const handleDragStart = (idx) => setDragIdx(idx);

  const handleDragEnter = (idx) => {
    if (dragIdx === null || dragIdx === idx) return;
    const reordered = [...items];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    setItems(reordered);
    setDragIdx(idx);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => onAnswer(items), 600);
  };

  return (
    <div className="space-y-6">
      {question.presentation_text && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white/80 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: question.presentation_text }} />
      )}

      <div className="text-white font-semibold text-lg leading-relaxed"
        dangerouslySetInnerHTML={{ __html: question.question }} />

      <p className="text-white/40 text-sm">Arraste os itens para colocá-los na ordem correta:</p>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={item}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragEnter={() => handleDragEnter(idx)}
            onDragOver={e => e.preventDefault()}
            onDragEnd={() => setDragIdx(null)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-all select-none
              ${dragIdx === idx ? 'border-purple-400 bg-purple-500/20 scale-[1.02]' : 'border-white/20 bg-white/5 hover:border-cyan-400/40'}`}
          >
            <GripVertical className="w-5 h-5 text-white/30 shrink-0" />
            <span className="w-7 h-7 bg-purple-500/20 text-purple-400 rounded-full text-sm font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
            <span className="text-white/90 text-sm flex-1">{item}</span>
          </div>
        ))}
      </div>

      {confirmed ? (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-400/40 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <span className="text-green-300 text-sm">Ordem registrada!</span>
        </div>
      ) : (
        <Button onClick={handleConfirm}
          className="w-full h-14 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg border border-cyan-400/50 shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all duration-300">
          Confirmar Ordem
        </Button>
      )}

      <p className="text-white/30 text-xs text-center">Arraste os itens antes de confirmar.</p>
    </div>
  );
}
