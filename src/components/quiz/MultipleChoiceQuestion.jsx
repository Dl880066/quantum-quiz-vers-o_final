import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MultipleChoiceQuestion({ question, onAnswer, currentAnswer }) {
  const [selected, setSelected] = useState(null);

  // Reset selection when question changes
  useEffect(() => {
    setSelected(null);
  }, [question.id]);

  const handleSelect = (option) => {
    setSelected(option);
  };

  const handleConfirm = () => {
    if (selected) {
      onAnswer(selected);
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Text */}
      {question.presentation_mode && question.presentation_text && (
        <div 
          className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-cyan-400/30 rounded-xl p-6 backdrop-blur-sm mb-6 text-white/95"
          style={{ 
            color: '#e5e7eb',
            lineHeight: '1.8'
          }}
          dangerouslySetInnerHTML={{ __html: question.presentation_text }}
        />
      )}
      
      {question.question && (
        <div className="text-white text-lg md:text-xl font-semibold leading-relaxed mb-6">
          {question.question}
        </div>
      )}

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, idx) => {
          const isSelected = selected === option;
          
          return (
            <button
              key={idx}
              onClick={() => handleSelect(option)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-300 ${
                isSelected
                  ? 'border-cyan-400 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 shadow-[0_0_20px_rgba(0,212,255,0.3)]'
                  : 'border-white/20 bg-white/5 hover:border-cyan-400/50 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  {isSelected ? (
                    <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                  ) : (
                    <Circle className="w-6 h-6 text-white/40" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`text-base md:text-lg ${isSelected ? 'text-cyan-300 font-medium' : 'text-white/90'}`}>
                    {option}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        disabled={!selected}
        className="w-full h-14 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold text-lg border border-cyan-400/50 disabled:border-gray-600 shadow-[0_0_20px_rgba(0,212,255,0.3)] disabled:shadow-none transition-all duration-300"
      >
        {selected ? 'Confirmar Resposta' : 'Selecione uma opção'}
      </Button>
    </div>
  );
}