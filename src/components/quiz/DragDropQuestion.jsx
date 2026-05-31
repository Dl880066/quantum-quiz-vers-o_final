import React, { useState, useEffect } from 'react';
import { GripVertical, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DragDropQuestion({ question, onAnswer, currentAnswer }) {
  const [matches, setMatches] = useState({});
  const [availableOptions, setAvailableOptions] = useState([...question.options]);

  // Reset when question changes
  useEffect(() => {
    setMatches({});
    setAvailableOptions([...question.options]);
  }, [question.id]);

  useEffect(() => {
    // Remove already matched options from available pool
    const matched = Object.values(matches);
    setAvailableOptions(question.options.filter(opt => !matched.includes(opt)));
  }, [matches, question.options]);

  const handleDragStart = (e, option) => {
    e.dataTransfer.setData('option', option);
  };

  const handleDrop = (e, alternative, index) => {
    e.preventDefault();
    const option = e.dataTransfer.getData('option');
    
    // Remove previous match for this alternative if exists
    const newMatches = { ...matches };
    delete newMatches[alternative];
    
    // Add new match
    newMatches[alternative] = option;
    setMatches(newMatches);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemoveMatch = (alternative) => {
    const newMatches = { ...matches };
    delete newMatches[alternative];
    setMatches(newMatches);
  };

  const handleConfirm = () => {
    if (Object.keys(matches).length === question.alternatives.length) {
      onAnswer(matches);
    }
  };

  const allMatched = Object.keys(matches).length === question.alternatives.length;

  return (
    <div className="space-y-6">
      {/* Question Text */}
      {question.presentation_text && (
        <div className="text-white text-lg md:text-xl font-semibold leading-relaxed mb-4">
          {question.presentation_text}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-4 backdrop-blur-sm">
        <p className="text-cyan-300 text-sm">
          🎯 Arraste as opções da direita para os trechos correspondentes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alternatives (Drop Zones) */}
        <div className="space-y-3">
          <h3 className="text-cyan-400 font-semibold mb-3 text-sm uppercase tracking-wide">
            Trechos
          </h3>
          {question.alternatives.map((alternative, idx) => {
            const matched = matches[alternative];
            
            return (
              <div
                key={idx}
                onDrop={(e) => handleDrop(e, alternative, idx)}
                onDragOver={handleDragOver}
                className={`min-h-[80px] p-4 rounded-xl border-2 border-dashed transition-all duration-300 ${
                  matched
                    ? 'border-cyan-400 bg-gradient-to-r from-cyan-500/20 to-purple-500/20'
                    : 'border-white/20 bg-white/5 hover:border-cyan-400/50'
                }`}
              >
                <div className="text-white text-base font-medium mb-2">
                  {alternative}
                </div>
                {matched && (
                  <div className="flex items-center justify-between mt-2 p-2 bg-cyan-400/20 rounded-lg border border-cyan-400/30">
                    <div className="flex items-center gap-2 flex-1">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="text-cyan-300 text-sm font-medium">
                        {matched}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveMatch(alternative)}
                      className="text-pink-400 hover:text-pink-300 text-xs ml-2"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Options (Draggable) */}
        <div className="space-y-3">
          <h3 className="text-purple-400 font-semibold mb-3 text-sm uppercase tracking-wide">
            Opções disponíveis
          </h3>
          <div className="space-y-2">
            {availableOptions.map((option, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={(e) => handleDragStart(e, option)}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl cursor-move hover:border-purple-400 hover:shadow-[0_0_15px_rgba(176,38,255,0.3)] transition-all duration-300"
              >
                <GripVertical className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">{option}</span>
              </div>
            ))}
            {availableOptions.length === 0 && (
              <div className="text-center py-8 text-white/40 text-sm">
                Todas as opções foram usadas ✓
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        disabled={!allMatched}
        className="w-full h-14 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold text-lg border border-cyan-400/50 disabled:border-gray-600 shadow-[0_0_20px_rgba(0,212,255,0.3)] disabled:shadow-none transition-all duration-300"
      >
        {allMatched ? 'Confirmar Respostas' : `Faltam ${question.alternatives.length - Object.keys(matches).length} correspondências`}
      </Button>
    </div>
  );
}