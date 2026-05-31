import React, { useState } from 'react';
import { QuizAttempt, Quiz, SecurityLog } from '@/api/entities';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Users, Download, Trash2, Lock, Eye, EyeOff, Clock, Award,
  AlertTriangle, TrendingUp, Printer, Settings, BarChart2,
  Filter, RefreshCw, ShieldAlert, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const CORRECT_PASSWORD = 'professor123';

export default function QuizProfessor() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try { return sessionStorage.getItem('qz_prof_auth') === '1'; } catch { return false; }
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState('all');
  const [activeTab, setActiveTab] = useState('resultados'); // 'resultados' | 'seguranca'

  const { data: quizzes = [] } = useQuery({
    queryKey: ['quizzes-list'],
    queryFn: () => Quiz.list(),
    enabled: isAuthenticated,
  });

  const { data: attempts = [], isLoading, refetch } = useQuery({
    queryKey: ['quiz-attempts', selectedQuiz],
    queryFn: async () => {
      const all = await QuizAttempt.list();
      return selectedQuiz === 'all' ? all : all.filter(a => a.quiz_id === selectedQuiz);
    },
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });

  const { data: secLogs = [] } = useQuery({
    queryKey: ['security-logs', selectedQuiz],
    queryFn: async () => {
      const all = selectedQuiz === 'all'
        ? await SecurityLog.listAll()
        : await SecurityLog.listByQuiz(selectedQuiz);
      return all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) { setIsAuthenticated(true); setError(''); try { sessionStorage.setItem('qz_prof_auth', '1'); } catch {} }
    else setError('Senha incorreta!');
  };

  const handleExportCSV = () => {
    const headers = ['Avaliação', 'Nome', 'E-mail', 'Pontuação', 'Máx.', 'Tentativa', 'Duração (min)', 'Saídas de Foco', 'Data/Hora'];
    const rows = attempts.map(a => [
      a.quiz_title || '-', a.student_name, a.student_email,
      a.score?.toFixed(2) ?? '0.00', a.max_score ?? 10,
      a.attempt_number ?? 1,
      a.duration_minutes?.toFixed(2) ?? '0.00',
      a.tab_switches ?? 0,
      format(new Date(a.created_date), 'dd/MM/yyyy HH:mm'),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.download = `avaliacoes_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`; link.click();
  };

  const handleClearData = async () => {
    if (!window.confirm('⚠️ Apagar TODOS os resultados? Esta ação não pode ser desfeita!')) return;
    for (const a of attempts) await QuizAttempt.delete(a.id);
    refetch();
  };

  const handlePrintReport = () => {
    const pw = window.open('', '_blank');
    const avg = attempts.length > 0 ? (attempts.reduce((s, a) => s + (a.score || 0), 0) / attempts.length).toFixed(2) : '0.00';
    pw.document.write(`<!DOCTYPE html><html><head><title>Relatório de Avaliações</title>
    <style>body{font-family:Arial;padding:20px}h1{color:#6b21a8}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px}th{background:#6b21a8;color:white}.hi{color:#16a34a;font-weight:bold}.mid{color:#ca8a04;font-weight:bold}.lo{color:#dc2626;font-weight:bold}</style></head>
    <body><h1>📊 Relatório — ${selectedQuiz === 'all' ? 'Todas as Avaliações' : (quizzes.find(q => q.id === selectedQuiz)?.title || 'Avaliação')}</h1>
    <p>Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
    <p><strong>Total:</strong> ${attempts.length} | <strong>Média:</strong> ${avg} / ${attempts[0]?.max_score ?? 10} | <strong>Com ocorrências:</strong> ${attempts.filter(a => a.tab_switches > 0).length}</p>
    <table><thead><tr><th>#</th><th>Avaliação</th><th>Nome</th><th>E-mail</th><th>Nota</th><th>Duração</th><th>Ocorrências</th><th>Data</th></tr></thead>
    <tbody>${attempts.map((a, i) => `<tr><td>${i + 1}</td><td>${a.quiz_title || '-'}</td><td>${a.student_name}</td><td>${a.student_email}</td>
    <td class="${(a.score || 0) >= (a.max_score ?? 10) * 0.7 ? 'hi' : (a.score || 0) >= (a.max_score ?? 10) * 0.5 ? 'mid' : 'lo'}">${(a.score || 0).toFixed(2)}</td>
    <td>${(a.duration_minutes || 0).toFixed(1)} min</td>
    <td style="color:${(a.tab_switches || 0) > 0 ? '#dc2626' : '#16a34a'}">${a.tab_switches || 0}x</td>
    <td>${format(new Date(a.created_date), 'dd/MM/yyyy HH:mm')}</td></tr>`).join('')}
    </tbody></table></body></html>`);
    pw.document.close(); pw.onload = () => pw.print();
  };

  const totalStudents = attempts.length;
  const avgScore = attempts.length > 0 ? (attempts.reduce((s, a) => s + (a.score || 0), 0) / attempts.length).toFixed(2) : '0.00';
  const maxScore = attempts[0]?.max_score ?? 10;
  const totalWithViolations = attempts.filter(a => (a.tab_switches || 0) > 0).length;

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-black" />
      <div className="relative max-w-md w-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-3xl p-8 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/20 rounded-2xl border border-purple-400/50 mb-4">
            <Lock className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold text-purple-400 mb-2">Dashboard Professor</h2>
          <p className="text-purple-300/70 text-sm">Digite a senha para acessar</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              className="bg-black/50 border-purple-400/30 text-white placeholder:text-white/30 h-12 pr-12" placeholder="Senha" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-purple-400">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {error && <p className="text-pink-400 text-sm">{error}</p>}
          <Button type="submit" className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg">Entrar</Button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-900/10 to-black" />
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-purple-400/30 bg-black/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Dashboard Professor</h1>
              <p className="text-purple-300/60 text-sm mt-0.5">Quantum Quiz</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate('/GerenciarQuiz')} className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white flex items-center gap-2">
                <Settings className="w-4 h-4" /> Gerenciar Avaliações
              </Button>
              <Button onClick={() => { setIsAuthenticated(false); try { sessionStorage.removeItem('qz_prof_auth'); } catch {} }} variant="outline" className="border-purple-400/30 text-purple-300 hover:bg-purple-500/10">Sair</Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-400/30 rounded-2xl p-5 flex items-center justify-between">
              <div><p className="text-cyan-300/70 text-xs mb-1">Respostas</p><p className="text-3xl font-bold text-cyan-400">{totalStudents}</p></div>
              <Users className="w-10 h-10 text-cyan-400/30" />
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-400/30 rounded-2xl p-5 flex items-center justify-between">
              <div><p className="text-purple-300/70 text-xs mb-1">Média Geral</p><p className="text-3xl font-bold text-purple-400">{avgScore} / {maxScore}</p></div>
              <Award className="w-10 h-10 text-purple-400/30" />
            </div>
            <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-400/30 rounded-2xl p-5 flex items-center justify-between">
              <div><p className="text-pink-300/70 text-xs mb-1">Com Ocorrências</p><p className="text-3xl font-bold text-pink-400">{totalWithViolations}</p></div>
              <AlertTriangle className="w-10 h-10 text-pink-400/30" />
            </div>
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-400/30 rounded-2xl p-5 flex items-center justify-between">
              <div><p className="text-orange-300/70 text-xs mb-1">Logs de Segurança</p><p className="text-3xl font-bold text-orange-400">{secLogs.length}</p></div>
              <ShieldAlert className="w-10 h-10 text-orange-400/30" />
            </div>
          </div>

          {/* Filtros + Ações */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <Filter className="w-4 h-4 text-white/40" />
              <select value={selectedQuiz} onChange={e => setSelectedQuiz(e.target.value)}
                className="bg-transparent text-white/70 text-sm focus:outline-none">
                <option value="all">Todas as avaliações</option>
                {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
              </select>
            </div>
            <Button onClick={handleExportCSV} disabled={!attempts.length} className="bg-gradient-to-r from-cyan-500 to-purple-500 border border-cyan-400/50">
              <Download className="w-4 h-4 mr-2" /> Exportar CSV
            </Button>
            <Button onClick={handlePrintReport} disabled={!attempts.length} className="bg-gradient-to-r from-purple-500 to-pink-500 border border-purple-400/50">
              <Printer className="w-4 h-4 mr-2" /> Imprimir
            </Button>
            <Button onClick={handleClearData} disabled={!attempts.length} variant="outline" className="border-red-400/30 text-red-400 hover:bg-red-500/10">
              <Trash2 className="w-4 h-4 mr-2" /> Limpar Resultados
            </Button>
            <Button onClick={() => refetch()} variant="outline" className="border-purple-400/30 text-purple-300 hover:bg-purple-500/10">
              <TrendingUp className="w-4 h-4 mr-2" /> Atualizar
            </Button>
          </div>

          {/* Abas */}
          <div className="flex gap-2 border-b border-white/10 pb-0">
            {[
              { key: 'resultados', label: 'Resultados', icon: BarChart2 },
              { key: 'seguranca', label: 'Log de Segurança', icon: ShieldAlert },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px ${activeTab === key ? 'border-purple-400 text-purple-400' : 'border-transparent text-white/40 hover:text-white/60'}`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          {/* Tabela de Resultados */}
          {activeTab === 'resultados' && (
            <div className="bg-white/3 border border-cyan-400/30 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-cyan-400/30 bg-black/30">
                      {['Avaliação', 'Nome', 'E-mail', 'Nota', 'Tentativa', 'Duração', 'Ocorrências', 'Data/Hora'].map(h => (
                        <TableHead key={h} className="text-cyan-300">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-12 text-white/50">Carregando...</TableCell></TableRow>
                    ) : attempts.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-12 text-white/50">Nenhuma avaliação ainda</TableCell></TableRow>
                    ) : attempts.map(a => (
                      <TableRow key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="text-white/50 text-sm">{a.quiz_title || '-'}</TableCell>
                        <TableCell className="text-white font-medium">{a.student_name}</TableCell>
                        <TableCell className="text-white/60">{a.student_email}</TableCell>
                        <TableCell>
                          <span className={`font-bold ${(a.score || 0) >= (a.max_score ?? 10) * 0.7 ? 'text-green-400' : (a.score || 0) >= (a.max_score ?? 10) * 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {(a.score || 0).toFixed(2)}
                          </span>
                          <span className="text-white/40 text-xs ml-1">/ {a.max_score ?? 10}</span>
                        </TableCell>
                        <TableCell className="text-white/60 text-center">{a.attempt_number ?? 1}ª</TableCell>
                        <TableCell className="text-white/60">
                          <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{(a.duration_minutes || 0).toFixed(1)} min</div>
                        </TableCell>
                        <TableCell>
                          {(a.tab_switches || 0) > 0
                            ? <span className="flex items-center gap-1 text-red-400"><AlertTriangle className="w-4 h-4" />{a.tab_switches}x</span>
                            : <span className="flex items-center gap-1 text-green-400"><CheckCircle2 className="w-4 h-4" />0</span>}
                        </TableCell>
                        <TableCell className="text-white/60 text-sm">{format(new Date(a.created_date), 'dd/MM/yyyy HH:mm')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Tabela de Segurança */}
          {activeTab === 'seguranca' && (
            <div className="bg-white/3 border border-red-400/20 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-red-400/20 bg-black/30">
                      {['Data/Hora', 'Avaliação', 'Aluno', 'E-mail', 'Evento', 'Questão'].map(h => (
                        <TableHead key={h} className="text-red-300">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {secLogs.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-12 text-white/50">Nenhuma ocorrência registrada</TableCell></TableRow>
                    ) : secLogs.map(log => (
                      <TableRow key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="text-white/60 text-sm">{format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}</TableCell>
                        <TableCell className="text-white/50 text-sm">{quizzes.find(q => q.id === log.quiz_id)?.title || log.quiz_id || '-'}</TableCell>
                        <TableCell className="text-white font-medium">{log.student_name || '-'}</TableCell>
                        <TableCell className="text-white/60">{log.student_email || '-'}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${log.event === 'tab_switch' ? 'bg-red-500/20 text-red-300 border-red-400/30' : 'bg-orange-500/20 text-orange-300 border-orange-400/30'}`}>
                            {log.event === 'tab_switch' ? '🔁 Troca de aba' : '🖥️ Saiu da tela cheia'}
                          </span>
                        </TableCell>
                        <TableCell className="text-white/60">Q{(log.question_index ?? 0) + 1}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
