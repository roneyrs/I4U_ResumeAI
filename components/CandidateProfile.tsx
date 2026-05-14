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
  Trash2,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { Candidate } from './CandidateList';

interface CandidateProfileProps {
  candidate: Candidate;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onUpdateStatus?: (id: string, status: string) => void;
  onUpdateTags?: (id: string, tags: string[]) => void;
}

export default function CandidateProfile({ candidate, onClose, onDelete, onUpdateStatus, onUpdateTags }: CandidateProfileProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);
  const [newTagInput, setNewTagInput] = React.useState('');

  const handleAddTag = () => {
    const tag = newTagInput.trim();
    if (!tag) return;

    const currentTags = candidate.tags || [];
    if (!currentTags.includes(tag)) {
      onUpdateTags?.(candidate.id, [...currentTags, tag]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = candidate.tags || [];
    onUpdateTags?.(candidate.id, currentTags.filter(t => t !== tagToRemove));
  };

  const skills = candidate.skills && candidate.skills.length > 0 ? candidate.skills : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full md:max-w-2xl lg:max-w-3xl bg-slate-50 shadow-2xl flex flex-col h-full overflow-hidden"
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

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 sm:p-10 space-y-8">
            {/* Profile Card */}
            <div className="bg-white p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[24px] sm:rounded-[32px] overflow-hidden border-4 border-white shadow-xl">
                  <img 
                    src={`https://picsum.photos/seed/${candidate.id}/200/200`} 
                    alt={candidate.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-primary text-white rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm border-4 border-white shadow-lg">
                  {(candidate.score || 0).toFixed(1)}
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-1">
                  <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">{candidate.name}</h2>
                </div>
                <p className="text-xs text-slate-400 italic mb-3 sm:mb-4">{candidate.fileName || 'Arquivo não identificado'}</p>
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 sm:gap-6 text-primary font-bold mb-4 sm:mb-6 text-sm sm:text-base">
                  {candidate.role && candidate.role !== 'Não identificado' && (
                    <>
                      <span>{candidate.role}</span>
                      <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    </>
                  )}
                  <span className="hidden sm:inline">{candidate.experienceYears || '0'} Anos de Experiência</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100">
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-slate-600 truncate">
                      {candidate.email && candidate.email !== 'Não identificado' ? candidate.email : 'E-mail não identificado'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-slate-600">
                      {candidate.phone && candidate.phone !== 'Não identificado' ? candidate.phone : 'Telefone não identificado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <select 
                value={candidate.status}
                onChange={(e) => onUpdateStatus?.(candidate.id, e.target.value)}
                className={`px-6 py-4 rounded-2xl sm:rounded-3xl font-bold border-2 transition-all cursor-pointer appearance-none text-center flex-1 sm:flex-none ${
                  candidate.status === 'Aprovado' 
                    ? 'bg-green-50 border-green-200 text-green-600' 
                    : 'bg-amber-50 border-amber-200 text-amber-600'
                }`}
              >
                <option value="Em Análise">Em Análise</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Reprovado">Reprovado</option>
              </select>

              <button 
                onClick={() => {
                  if (isConfirmingDelete) {
                    onDelete?.(candidate.id);
                  } else {
                    setIsConfirmingDelete(true);
                    setTimeout(() => setIsConfirmingDelete(false), 3000);
                  }
                }}
                className={`px-6 py-4 border-2 rounded-2xl sm:rounded-3xl font-bold transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none ${
                  isConfirmingDelete 
                    ? 'bg-red-600 text-white border-red-600 animate-pulse' 
                    : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                }`}
              >
                {isConfirmingDelete ? (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Confirmar Exclusão?
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Excluir
                  </>
                )}
              </button>

              <button className="px-6 sm:px-8 py-4 sm:py-5 bg-primary text-white rounded-2xl sm:rounded-3xl font-bold shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 flex-1 sm:flex-none">
                <UserCheck className="w-5 h-5" />
                Contratar
              </button>
            </div>

            {/* Tags Section */}
            <div className="bg-white p-6 sm:p-8 rounded-[24px] sm:rounded-[40px] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Tags de Organização</h3>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    placeholder="Nova tag..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button 
                    onClick={handleAddTag}
                    className="p-2 bg-primary text-white rounded-xl hover:scale-105 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {candidate.tags && candidate.tags.length > 0 ? candidate.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-sm flex items-center gap-2 group"
                  >
                    {tag}
                    <button 
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )) : (
                  <p className="text-sm text-slate-400 italic">Nenhuma tag adicionada ainda.</p>
                )}
              </div>
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
              <p className="text-slate-600 text-sm sm:text-lg leading-relaxed italic font-medium text-center">
                &quot;{candidate.analysis || 'Resumo da análise não disponível para este candidato.'}&quot;
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
                    {skills.length > 0 ? skills.map(skill => (
                      <span key={skill} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-50 border border-slate-100 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold text-slate-600">
                        {skill}
                      </span>
                    )) : (
                      <span className="text-xs text-slate-400 italic">Nenhuma habilidade identificada</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-4 sm:p-6 bg-green-50/50 rounded-2xl sm:rounded-3xl border border-green-100">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4 text-green-600 font-bold text-[10px] uppercase tracking-widest">
                      <CheckCircle2 className="w-4 h-4" />
                      Pontos Fortes
                    </div>
                    <ul className="space-y-2 sm:space-y-3">
                      {(candidate.strengths && candidate.strengths.length > 0) ? candidate.strengths.map((strength, idx) => (
                        <li key={idx} className="text-xs sm:text-sm text-slate-600 flex gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                          {strength}
                        </li>
                      )) : (
                        <li className="text-xs sm:text-sm text-slate-400 italic">Nenhum ponto forte identificado</li>
                      )}
                    </ul>
                  </div>
                  <div className="p-4 sm:p-6 bg-amber-50/50 rounded-2xl sm:rounded-3xl border border-amber-100">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4 text-amber-600 font-bold text-[10px] uppercase tracking-widest">
                      <AlertCircle className="w-4 h-4" />
                      Áreas de Atenção
                    </div>
                    <ul className="space-y-2 sm:space-y-3">
                      {(candidate.attentionAreas && candidate.attentionAreas.length > 0) ? candidate.attentionAreas.map((area, idx) => (
                        <li key={idx} className="text-xs sm:text-sm text-slate-600 flex gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                          {area}
                        </li>
                      )) : (
                        <li className="text-xs sm:text-sm text-slate-400 italic">Nenhuma área de atenção identificada</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
