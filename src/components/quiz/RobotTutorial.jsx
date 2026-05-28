import React, { useState } from 'react';
import { Bot, ArrowRight, Shield, Clock, Award, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RobotTutorial({ onComplete }) {
  const [step, setStep] = useState(0);

  const tutorialSteps = [
    {
      icon: Bot,
      title: "Olá! Eu sou o Jakobson-X! 🤖",
      message: "Seja bem-vindo ao Quiz Futurista! Vou explicar rapidinho como tudo funciona.",
      color: "cyan"
    },
    {
      icon: Clock,
      title: "Como Funciona",
      message: "Você responderá 10 questões sobre Funções da Linguagem. Cada questão tem peso na nota final de 0 a 3 pontos.",
      color: "purple"
    },
    {
      icon: Shield,
      title: "⚠️ Regra Importante: Anti-Cheat",
      message: "NÃO troque de aba durante o quiz! Cada tentativa será registrada. Após 3 tentativas, o sistema bloqueia automaticamente.",
      color: "pink"
    },
    {
      icon: AlertTriangle,
      title: "Atenção Especial",
      message: "Você NÃO verá se acertou ou errou durante o quiz. Apenas siga em frente com confiança! 💪",
      color: "cyan"
    },
    {
      icon: Award,
      title: "Sua Nota é Privada",
      message: "Ao terminar, apenas seu professor terá acesso à pontuação. Você não verá sua nota aqui.",
      color: "purple"
    }
  ];

  const currentStep = tutorialSteps[step];
  const Icon = currentStep.icon;
  
  const colorMap = {
    cyan: {
      gradient: "from-cyan-500/20 to-cyan-600/20",
      border: "border-cyan-400/50",
      text: "text-cyan-400",
      glow: "shadow-[0_0_30px_rgba(0,212,255,0.3)]"
    },
    purple: {
      gradient: "from-purple-500/20 to-purple-600/20",
      border: "border-purple-400/50",
      text: "text-purple-400",
      glow: "shadow-[0_0_30px_rgba(176,38,255,0.3)]"
    },
    pink: {
      gradient: "from-pink-500/20 to-pink-600/20",
      border: "border-pink-400/50",
      text: "text-pink-400",
      glow: "shadow-[0_0_30px_rgba(255,0,110,0.3)]"
    }
  };

  const colors = colorMap[currentStep.color];

  const handleNext = () => {
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Tutorial Card */}
      <div className="relative max-w-2xl w-full">
        <div className={`bg-gradient-to-br ${colors.gradient} border ${colors.border} rounded-3xl p-8 md:p-12 backdrop-blur-xl ${colors.glow} transition-all duration-500`}>
          
          {/* Robot Icon */}
          <div className="flex justify-center mb-8">
            <div className={`relative p-6 bg-gradient-to-br ${colors.gradient} rounded-2xl border ${colors.border} animate-float`}>
              <Icon className={`w-16 h-16 md:w-20 md:h-20 ${colors.text}`} />
              <div className={`absolute -top-2 -right-2 w-4 h-4 ${colors.text} rounded-full animate-ping`} />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2 className={`text-2xl md:text-3xl font-bold ${colors.text} mb-4`}>
              {currentStep.title}
            </h2>
            {step === 0 && (
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 rounded-full text-cyan-300 font-bold text-sm tracking-wider">
                  JAKOBSON-X v2.0
                </span>
              </div>
            )}
            <p className="text-white/90 text-base md:text-lg leading-relaxed">
              {currentStep.message}
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {tutorialSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === step 
                    ? `w-8 ${colors.text.replace('text-', 'bg-')}` 
                    : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* Button */}
          <Button
            onClick={handleNext}
            className={`w-full py-6 text-lg font-bold bg-gradient-to-r ${colors.gradient} border ${colors.border} hover:${colors.glow} text-white transition-all duration-300 hover:scale-105`}
          >
            {step < tutorialSteps.length - 1 ? (
              <>
                Próximo <ArrowRight className="ml-2 w-5 h-5" />
              </>
            ) : (
              <>
                Começar Quiz! 🚀
              </>
            )}
          </Button>

          {/* Step Counter */}
          <p className="text-center text-white/50 text-sm mt-4">
            Passo {step + 1} de {tutorialSteps.length}
          </p>
        </div>

        {/* Corner Decorations */}
        <div className={`absolute -top-4 -left-4 w-8 h-8 border-t-4 border-l-4 ${colors.border} rounded-tl-2xl`} />
        <div className={`absolute -bottom-4 -right-4 w-8 h-8 border-b-4 border-r-4 ${colors.border} rounded-br-2xl`} />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}