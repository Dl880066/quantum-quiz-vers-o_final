// NavigationTracker.jsx — versão local (sem Base44)
// Apenas rastreia mudanças de rota para fins de debug local se necessário.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function NavigationTracker() {
  const location = useLocation();
  useEffect(() => {
    // Você pode adicionar lógica de rastreamento local aqui se desejar
    document.title = 'Quantum Quiz 2026';
  }, [location]);
  return null;
}
