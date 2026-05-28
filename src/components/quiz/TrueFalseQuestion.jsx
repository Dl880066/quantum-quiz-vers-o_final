import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TrueFalseQuestion({ question, onAnswer, currentAnswer }) {
  const [selected, setSelected] = useState(null);

  // Reset selection when question changes
  useEffect(() => {
    setSelected(null);
  }, [question.id]);

  const handleSelect = (value) => {
    setSelected(value);
  };

  const handleConfirm = () => {
    if (selected !== null) {
      onAnswer(selected);
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div className="text-white text-lg md:text-xl font-semibold leading-relaxed mb-6">
        {question.question}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* True Button */}
        <button
          onClick={() => handleSelect('Verdadeiro')}
          className={`group p-8 rounded-2xl border-2 transition-all duration-300 ${
            selected === 'Verdadeiro'
              ? 'border-green-400 bg-gradient-to-br from-green-500/20 to-cyan-500/20 shadow-[0_0_25px_rgba(34,197,94,0.4)]'
              : 'border-white/20 bg-white/5 hover:border-green-400/50 hover:bg-white/10'
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full transition-all duration-300 ${
              selected === 'Verdadeiro'
                ? 'bg-green-400/30 scale-110'
                : 'bg-green-400/10 group-hover:bg-green-400/20'
            }`}>
              <Check className={`w-12 h-12 ${
                selected === 'Verdadeiro' ? 'text-green-400' : 'text-green-400/60'
              }`} />
            </div>
            <span className={`text-2xl font-bold ${
              selected === 'Verdadeiro' ? 'text-green-400' : 'text-white/70'
            }`}>
              VERDADEIRO
            </span>
          </div>
        </button>

        {/* False Button */}
        <button
          onClick={() => handleSelect('Falso')}
          className={`group p-8 rounded-2xl border-2 transition-all duration-300 ${
            selected === 'Falso'
              ? 'border-red-400 bg-gradient-to-br from-red-500/20 to-pink-500/20 shadow-[0_0_25px_rgba(239,68,68,0.4)]'
              : 'border-white/20 bg-white/5 hover:border-red-400/50 hover:bg-white/10'
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full transition-all duration-300 ${
              selected === 'Falso'
                ? 'bg-red-400/30 scale-110'
                : 'bg-red-400/10 group-hover:bg-red-400/20'
            }`}>
              <X className={`w-12 h-12 ${
                selected === 'Falso' ? 'text-red-400' : 'text-red-400/60'
              }`} />
            </div>
            <span className={`text-2xl font-bold ${
              selected === 'Falso' ? 'text-red-400' : 'text-white/70'
            }`}>
              FALSO
            </span>
          </div>
        </button>
      </div>

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        disabled={selected === null}
        className="w-full h-14 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold text-lg border border-cyan-400/50 disabled:border-gray-600 shadow-[0_0_20px_rgba(0,212,255,0.3)] disabled:shadow-none transition-all duration-300"
      >
        {selected !== null ? 'Confirmar Resposta' : 'Selecione Verdadeiro ou Falso'}
      </Button>
    </div>
  );
}