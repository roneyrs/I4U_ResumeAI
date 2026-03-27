'use client';

import React from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  Zap,
  ExternalLink,
  Download,
  Share2,
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'motion/react';
import { Candidate } from './CandidateList';

interface CandidateProfileProps {
  candidate: Candidate;
  onClose: () => void;
}

export default function CandidateProfile({ candidate, onClose }: CandidateProfileProps) {
  // Mock scores for the evaluation core
  const evaluationScores = [
    { label: 'Proficiência Técnica', score: 10.0 },
    { label: 'Design de Sistemas', score: 9.5 },
    { label: 'Habilidades de Liderança', score: 9.0 },
    { label: 'Fit Cultural', score: 9.0 },
  ];

  const skills = [
    'Kubernetes & Docker', 'Go / Golang', 'Kafka / RabbitMQ', 
    'AWS (Solutions Arch)', 'Microservices Pattern'
  ];

  return (
    <div className="bg-slate-50 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col h-full"
      >
        {/* Header Bar */}
        <div className="px-6 sm:px-10 py-4 sm:py-6 flex items-center justify-between bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary fill-current" />
            </div>
            <span className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-widest">Perfil do Candidato</span>
          </div>
          <button 
            onClick={onClose}
            className="flex items-center gap-2 p-2 sm:p-3 hover:bg-slate-100 rounded-full sm:rounded-xl transition-all text-slate-400 hover:text-slate-900 group"
          >
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest group-hover:text-slate-900">Fechar</span>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 sm:p-10 flex flex-col lg:flex-row gap-6 sm:gap-10">
          {/* Left Column: Main Info */}
          <div className="flex-1 space-y-6 sm:space-y-8">
            {/* Profile Card */}
            <div className="bg-white p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[24px] sm:rounded-[32px] overflow-hidden border-4 border-white shadow-xl">
                  <img 
                    src={`https://picsum.photos/seed/${candidate.id}/200/200`} 
                    alt={candidate.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-primary text-white rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm border-4 border-white shadow-lg">
                  {candidate.score.toFixed(1)}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-2">
                  <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">{candidate.name}</h2>
                  <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-widest rounded-lg">Especialista Verificada</span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 sm:gap-6 text-primary font-bold mb-4 sm:mb-6 text-sm sm:text-base">
                  <span>{candidate.role || 'Arquiteta de Software Sênior'}</span>
                  <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                  <span className="hidden sm:inline">12+ Anos de Experiência</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100">
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-slate-600 truncate">{candidate.email || 'adriana.m@example.com'}</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-slate-600">{candidate.phone || '+55 (11) 98877-6655'}</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-slate-600">São Paulo, BR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                      <FileText className="w-4 h-4" />
                      Ver PDF
                    </button>
                    <button className="p-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-slate-400 hover:text-primary transition-all">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <button className="w-full md:w-auto px-6 sm:px-8 py-4 sm:py-5 bg-primary text-white rounded-2xl sm:rounded-3xl font-bold shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3">
                <UserCheck className="w-5 h-5" />
                Contratar
              </button>
            </div>

            {/* Executive Summary */}
            <div className="bg-white p-6 sm:p-10 rounded-[24px] sm:rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12"></div>
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">Resumo Executivo</h3>
                  <p className="text-[8px] sm:text-[10px] font-bold text-primary uppercase tracking-widest">Perfil Gerado por IA</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm sm:text-lg leading-relaxed italic font-medium">
                &quot;{candidate.analysis || 'Candidata altamente qualificada com foco em sistemas distribuídos de alta escalabilidade. Demonstra uma transição sólida de cargos técnicos para liderança estratégica, mantendo um perfil hands-on. Sua experiência com arquiteturas orientadas a eventos e modernização de legados em larga escala a torna uma candidata excepcional.'}&quot;
              </p>
            </div>

            {/* Competencies Analysis */}
            <div className="bg-white p-6 sm:p-10 rounded-[24px] sm:rounded-[40px] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 text-white rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Análise de Competências</h3>
              </div>
              
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 sm:mb-4">Mapa de Especialidades</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <span key={skill} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-50 border border-slate-100 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold text-slate-600">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-4 sm:p-6 bg-green-50/50 rounded-2xl sm:rounded-3xl border border-green-100">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4 text-green-600 font-bold text-[10px] uppercase tracking-widest">
                      <CheckCircle2 className="w-4 h-4" />
                      Pontos Fortes
                    </div>
                    <ul className="space-y-2 sm:space-y-3">
                      <li className="text-xs sm:text-sm text-slate-600 flex gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                        Capacidade comprovada de liderar migrações de cloud complexas.
                      </li>
                      <li className="text-xs sm:text-sm text-slate-600 flex gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                        Forte viés de mentoria e desenvolvimento de times técnicos.
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 sm:p-6 bg-amber-50/50 rounded-2xl sm:rounded-3xl border border-amber-100">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4 text-amber-600 font-bold text-[10px] uppercase tracking-widest">
                      <AlertCircle className="w-4 h-4" />
                      Áreas de Atenção
                    </div>
                    <ul className="space-y-2 sm:space-y-3">
                      <li className="text-xs sm:text-sm text-slate-600 flex gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                        Expectativa salarial no limite superior da faixa orçamentária.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Evaluation & Status */}
          <div className="w-full lg:w-80 space-y-6 sm:space-y-8">
            {/* Evaluation Core */}
            <div className="bg-white p-6 sm:p-8 rounded-[24px] sm:rounded-[40px] border border-slate-100 shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 sm:mb-8">Núcleo de Avaliação</h3>
              <div className="space-y-6 sm:space-y-8">
                {evaluationScores.map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between items-end mb-2 sm:mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-[140px]">{item.label}</span>
                      <span className="text-base sm:text-lg font-bold text-primary">{item.score.toFixed(1)}/10</span>
                    </div>
                    <div className="h-1.5 sm:h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score * 10}%` }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Allocation Status */}
            <div className="bg-slate-900 p-6 sm:p-8 rounded-[24px] sm:rounded-[40px] shadow-xl">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-6 sm:mb-8">Alocação no Fluxo</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl hover:bg-white/10 transition-all group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-all">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-widest">Top Talent</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl hover:bg-white/10 transition-all group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-700 flex items-center justify-center text-white group-hover:scale-110 transition-all">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-widest">Potencial</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl hover:bg-white/10 transition-all group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-700 flex items-center justify-center text-white group-hover:scale-110 transition-all">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-widest">Follow Up</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl hover:bg-white/10 transition-all group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-700 flex items-center justify-center text-white group-hover:scale-110 transition-all">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-widest">Arquivo</span>
                </button>
              </div>
            </div>

            {/* Layer Observation */}
            <div className="bg-white p-6 sm:p-8 rounded-[24px] sm:rounded-[40px] border border-primary/20 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
              <div className="flex items-center gap-3 mb-4 sm:mb-6 text-primary">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <h4 className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">Observação da Camada de Inteligência</h4>
              </div>
              <p className="text-slate-600 text-[10px] sm:text-sm leading-relaxed font-medium italic">
                &quot;O histórico no GitHub da candidata mostra contribuições significativas em projetos Open Source de nuvem, o que se alinha perfeitamente ao nosso roadmap de inovação para o Q4. O I4U Resume detecta uma alta probabilidade de sucesso em liderança técnica.&quot;
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
