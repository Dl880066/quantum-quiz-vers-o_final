import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MultipleChoiceQuestion({ question, onAnswer }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => { setSelected(null); }, [question.id]);

  return (
    <div className="space-y-6">
      {question.presentation_text && (
        <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-cyan-400/30 rounded-xl p-6 text-white/90 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: question.presentation_text }} />
      )}
      {question.question && (
        <div className="text-white text-lg md:text-xl font-semibold leading-relaxed"
          dangerouslySetInnerHTML={{ __html: question.question }} />
      )}
      <div className="space-y-3">
        {question.options.map((option, idx) => {
          const isSelected = selected === option;
          return (
            <button key={idx} onClick={() => setSelected(option)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-300 ${isSelected ? 'border-cyan-400 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 shadow-[0_0_20px_rgba(0,212,255,0.3)]' : 'border-white/20 bg-white/5 hover:border-cyan-400/50 hover:bg-white/10'}`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  {isSelected ? <CheckCircle2 className="w-6 h-6 text-cyan-400" /> : <Circle className="w-6 h-6 text-white/40" />}
                </div>
                <div className={`text-base md:text-lg ${isSelected ? 'text-cyan-300 font-medium' : 'text-white/90'}`}>{option}</div>
              </div>
            </button>
          );
        })}
      </div>
      <Button onClick={() => selected && onAnswer(selected)} disabled={!selected}
        className="w-full h-14 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold text-lg border border-cyan-400/50 disabled:border-gray-600 shadow-[0_0_20px_rgba(0,212,255,0.3)] disabled:shadow-none transition-all duration-300">
        {selected ? 'Confirmar Resposta' : 'Selecione uma opção'}
      </Button>
    </div>
  );
}
