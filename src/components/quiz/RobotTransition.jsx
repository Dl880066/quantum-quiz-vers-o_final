import React, { useEffect } from 'react';
import { Bot } from 'lucide-react';

const encouragements = [
  "Muito bem! Continue assim! 🚀",
  "Você está indo muito bem! 💪",
  "Excelente! Próxima questão! ⚡",
  "Isso aí! Mantenha o foco! 🎯",
  "Boa! Vamos para a próxima! 🌟",
  "Você consegue! Avante! 🔥",
  "Perfeito! Seguindo em frente! ✨"
];

export default function RobotTransition({ questionNumber, totalQuestions, onComplete }) {
  const message = encouragements[Math.floor(Math.random() * encouragements.length)];

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center">
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>

      {/* Robot Card */}
      <div className="relative animate-bounce-in">
        <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 rounded-3xl p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(0,212,255,0.4)] text-center">
          
          {/* Robot Icon */}
          <div className="relative inline-block mb-4">
            <div className="p-5 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-2xl border border-cyan-400/50 animate-float">
              <Bot className="w-16 h-16 text-cyan-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full animate-ping" />
          </div>

          {/* Message */}
          <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">
            {message}
          </p>

          {/* Progress */}
          <p className="text-cyan-300/70 text-sm">
            Questão {questionNumber} de {totalQuestions}
          </p>

          {/* Progress dots */}
          <div className="flex justify-center gap-1 mt-4">
            {[...Array(Math.min(totalQuestions, 15))].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < questionNumber 
                    ? 'bg-cyan-400' 
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-purple-400 rounded-br-lg" />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-float {
          animation: float 1s ease-in-out infinite;
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}