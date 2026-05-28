import React, { useState } from 'react';
import { User, Mail, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StudentInfoForm({ onSubmit, isChecking, quizTitle }) {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().split(' ').length < 2) {
      newErrors.name = 'Digite seu nome completo';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      await onSubmit(formData);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-black" />
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/50 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Form Card */}
      <div className="relative max-w-md w-full">
        <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-3xl p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(0,212,255,0.2)]">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl border border-cyan-400/50 mb-4">
              <Rocket className="w-10 h-10 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Identificação
            </h2>
            <p className="text-cyan-300/70 text-sm">
              {quizTitle || 'Preencha seus dados para iniciar'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-cyan-300 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome Completo *
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-black/50 border-cyan-400/30 text-white placeholder:text-white/30 focus:border-cyan-400 focus:ring-cyan-400/20 h-12"
                placeholder="Digite seu nome completo"
              />
              {errors.name && (
                <p className="text-pink-400 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-pink-400 rounded-full" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-cyan-300 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                E-mail Institucional *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-black/50 border-cyan-400/30 text-white placeholder:text-white/30 focus:border-cyan-400 focus:ring-cyan-400/20 h-12"
                placeholder="seu.email@instituicao.edu.br"
              />
              {errors.email && (
                <p className="text-pink-400 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-pink-400 rounded-full" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold text-lg border border-cyan-400/50 shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] transition-all duration-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Verificando...' : 'Continuar para o Tutorial'}
            </Button>
          </form>

          {/* Footer Note */}
          <p className="text-center text-white/40 text-xs mt-6">
            * Campos obrigatórios
          </p>
        </div>

        {/* Corner Decorations */}
        <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-400/50" />
        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-purple-400/50" />
      </div>
    </div>
  );
}