'use client';

import React from 'react';
import { 
  FileText, 
  ExternalLink, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  UserPlus, 
  Download, 
  Zap, 
  Trash2,
  Folder, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp,
  X,
  Plus,
  Copy,
  Check,
  Mail,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative inline-flex items-center ml-2">
      <button
        onClick={handleCopy}
        className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-primary transition-all focus:outline-none"
        title="Copiar"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
      <AnimatePresence>
        {copied && (
          <motion.span
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl pointer-events-none z-50 whitespace-nowrap"
          >
            Copiado!
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export interface Candidate {
  id: string;
  name: string;
  score: number;
  status: string;
  date: string;
  analysis?: string;
  email?: string;
  phone?: string;
  role?: string;
  jobDescription?: string;
  experienceYears?: string;
  fileName?: string;
  skills?: string[];
  attentionAreas?: string[];
  strengths?: string[];
  tags?: string[];
  evaluationScores?: { label: string; score: number }[];
}

interface CandidateListProps {
  candidates: Candidate[];
  externalSearchTerm?: string;
  onViewProfile?: (candidate: Candidate) => void;
  onDelete?: (id: string) => void;
  onUpdateStatus?: (id: string, status: string) => void;
  onUpdateTags?: (id: string, tags: string[]) => void;
}

export default function CandidateList({ 
  candidates, 
  externalSearchTerm = '', 
  onViewProfile, 
  onDelete, 
  onUpdateStatus, 
  onUpdateTags 
}: CandidateListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [jobFilter, setJobFilter] = React.useState('');
  const [tagFilter, setTagFilter] = React.useState('Todas');
  const [scoreLimit, setScoreLimit] = React.useState(0.0);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [exportType, setExportType] = React.useState<'analysis' | 'cv'>('analysis');
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);
  const [migrationSummary, setMigrationSummary] = React.useState<{
    count: number;
    text: string;
    emailBody: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [newTagInput, setNewTagInput] = React.useState<{ [key: string]: string }>({});
  const itemsPerPage = 10;

  // Extract all unique tags for the filter
  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    candidates.forEach(c => {
      c.tags?.forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [candidates]);

  const effectiveSearchTerm = externalSearchTerm || searchTerm;

  const filteredCandidates = candidates.filter(c => 
    (c.name.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
    c.status.toLowerCase().includes(effectiveSearchTerm.toLowerCase())) &&
    (c.jobDescription?.toLowerCase().includes(jobFilter.toLowerCase()) || !jobFilter) &&
    (tagFilter === 'Todas' || c.tags?.includes(tagFilter)) &&
    c.score >= scoreLimit
  );

  const handleAddTag = (id: string) => {
    const tag = newTagInput[id]?.trim();
    if (!tag) return;

    const candidate = candidates.find(c => c.id === id);
    if (!candidate) return;

    const currentTags = candidate.tags || [];
    if (!currentTags.includes(tag)) {
      onUpdateTags?.(id, [...currentTags, tag]);
    }
    
    setNewTagInput(prev => ({ ...prev, [id]: '' }));
  };

  const handleRemoveTag = (id: string, tagToRemove: string) => {
    const candidate = candidates.find(c => c.id === id);
    if (!candidate) return;

    const currentTags = candidate.tags || [];
    onUpdateTags?.(id, currentTags.filter(t => t !== tagToRemove));
  };

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, jobFilter, scoreLimit, externalSearchTerm]);

  // AI Talent Prediction Logic
  const predictionData = React.useMemo(() => {
    if (candidates.length === 0) {
      return {
        role: "Nenhum dado",
        prob: "0%",
        days: "0 Dias",
        count: 0,
        topScore: 0
      };
    }

    const highPerformers = candidates.filter(c => c.score >= 8.5);
    const roles: { [key: string]: number } = {};
    
    candidates.forEach(c => {
      if (c.role && c.role !== 'Não identificado') {
        roles[c.role] = (roles[c.role] || 0) + 1;
      }
    });

    const topRole = Object.entries(roles).sort((a, b) => b[1] - a[1])[0]?.[0] || "Especialistas";
    const avgScore = candidates.reduce((acc, c) => acc + c.score, 0) / candidates.length;
    
    // Status weight: Highly approved pool = higher confidence
    const approvedCount = candidates.filter(c => c.status === 'Aprovado').length;
    const rejectedCount = candidates.filter(c => c.status === 'Reprovado').length;
    const statusWeight = (approvedCount - rejectedCount) * 2;

    // Probabilidade baseada no score médio, densidade e status histórico
    const baseProb = avgScore * 10;
    const densityBonus = (highPerformers.length / candidates.length) * 15;
    const prob = Math.min(99.4, Math.max(5, baseProb + densityBonus + statusWeight)).toFixed(1);
    
    // Heuristic: Hire time decreases with more high performers
    const baseDays = 20;
    const reduction = Math.min(12, highPerformers.length * 0.8);
    const finalDays = Math.max(3, Math.ceil(baseDays - reduction));

    const topScore = Math.max(...candidates.map(c => c.score));

    return {
      role: topRole,
      prob: `${prob}%`,
      days: `${finalDays} Dias`,
      count: highPerformers.length,
      topScore
    };
  }, [candidates]);

  const handleMigration = () => {
    const threshold = Math.max(8.5, predictionData.topScore - 0.5);
    const toMigrate = candidates.filter(c => c.score >= threshold && c.status !== 'Revisão Executiva');

    if (toMigrate.length === 0) {
      alert("Nenhum novo candidato atende aos critérios de migração automática no momento.");
      return;
    }

    // Execute status updates
    toMigrate.forEach(c => {
      onUpdateStatus?.(c.id, 'Revisão Executiva');
    });

    // Generate Summary
    let summaryText = `RELATÓRIO DE MIGRAÇÃO EXECUTIVA - ${new Date().toLocaleDateString('pt-BR')}\n\n`;
    summaryText += `Foram migrados ${toMigrate.length} candidatos com Score Neural >= ${threshold.toFixed(1)}.\n\n`;
    
    let emailBody = `Olá,\n\nSegue a lista de candidatos qualificados para Revisão Executiva:\n\n`;

    toMigrate.forEach((c, index) => {
      const candidateInfo = 
        `${index + 1}. ${c.name.toUpperCase()}\n` +
        `   Score: ${c.score.toFixed(1)}\n` +
        `   Email: ${c.email || 'Não informado'}\n` +
        `   Telefone: ${c.phone || 'Não informado'}\n\n`;
      
      summaryText += candidateInfo;
      emailBody += candidateInfo;
    });

    emailBody += `\nAtt,\nEquipe de Recrutamento IA`;

    setMigrationSummary({
      count: toMigrate.length,
      text: summaryText,
      emailBody: emailBody
    });
  };

  const shareByEmail = () => {
    if (!migrationSummary) return;
    const subject = encodeURIComponent(`Relatório de Talentos IA - ${migrationSummary.count} Candidatos Qualificados`);
    const body = encodeURIComponent(migrationSummary.emailBody);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCandidates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCandidates.map(c => c.id)));
    }
  };

  const handleExport = async (onlySelected: boolean) => {
    const toExport = onlySelected 
      ? candidates.filter(c => selectedIds.has(c.id))
      : filteredCandidates;

    if (toExport.length === 0) return;

    const zip = new JSZip();

    toExport.forEach(c => {
      const scoreFolder = `Score_${Math.floor(c.score)}-${Math.floor(c.score) + 1}`;
      const folder = zip.folder(scoreFolder);
      
      let content = "";
      let fileName = "";

      if (exportType === 'analysis') {
        content = `
RELATÓRIO DE ANÁLISE I4U: ${c.name}
-------------------------------------------
SCORE NEURAL: ${c.score.toFixed(1)}/10
CARGO: ${c.role || 'N/A'}
STATUS: ${c.status}
DATA: ${c.date}
EMAIL: ${c.email || 'N/A'}
TELEFONE: ${c.phone || 'N/A'}

ANÁLISE EXECUTIVA:
${c.analysis || 'Sem análise disponível.'}
        `.trim();
        fileName = `${c.name.replace(/\s+/g, '_')}_Analise_${c.id}.txt`;
      } else {
        content = `
CURRÍCULO VITAE: ${c.name}
-------------------------------------------
CARGO: ${c.role || 'Especialista'}
CONTATO: ${c.email || 'N/A'} | ${c.phone || 'N/A'}
DATA DA CANDIDATURA: ${c.date}

RESUMO PROFISSIONAL (Extraído por I4U AI):
Candidato com score de aderência ${c.score.toFixed(1)}/10 para a vaga.
Perfil identificado: ${c.role || 'Não especificado'}.

[O currículo original em PDF foi processado pela camada de inteligência I4U. 
Este arquivo contém os dados estruturados extraídos do documento original.]
        `.trim();
        fileName = `${c.name.replace(/\s+/g, '_')}_Curriculo_${c.id}.txt`;
      }

      folder?.file(fileName, content);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `export_candidatos_${new Date().toISOString().split('T')[0]}.zip`);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Motor de Inteligência</span>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Triagem de Candidatos</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 mr-2">
              <button 
                onClick={() => setExportType('analysis')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${exportType === 'analysis' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Análise IA
              </button>
              <button 
                onClick={() => setExportType('cv')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${exportType === 'cv' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Currículo
              </button>
            </div>
            <button 
              onClick={() => handleExport(true)}
              disabled={selectedIds.size === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Exportar Selecionados ({selectedIds.size})
            </button>
            <button 
              onClick={() => handleExport(false)}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/30 hover:brightness-110 hover:shadow-primary/40 active:scale-[0.98] transition-all"
            >
              <Folder className="w-4 h-4 fill-current" />
              Exportar Tudo (Filtro)
            </button>
          </div>
        </div>
        <p className="text-slate-500 text-sm mt-2">
          Processando scores neurais em tempo real para <span className="font-bold text-primary">{candidates.length} aplicantes</span>. Otimizado para Proficiência Técnica e Potencial de Liderança.
        </p>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6 mb-8">
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:ring-2 hover:ring-slate-100">
          <div className="flex items-center justify-between mb-6">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Limite de Score Neural</label>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg font-bold text-sm leading-none flex items-center justify-center">{scoreLimit.toFixed(1)}+</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="10" 
            step="0.1"
            value={scoreLimit}
            onChange={(e) => setScoreLimit(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:ring-2 hover:ring-slate-100">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] block mb-4">Buscar Candidato</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Nome ou status..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:ring-2 hover:ring-slate-100">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] block mb-4">Descrição da Vaga</label>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filtrar por vaga..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all"
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:ring-2 hover:ring-slate-100">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] block mb-4">Filtrar por Tag</label>
          <select 
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all"
          >
            <option value="Todas">Todas as Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-left">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                    checked={selectedIds.size === filteredCandidates.length && filteredCandidates.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Candidato</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identidade de Contato</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fase de Processamento</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tags</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Score Neural</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-24 text-center">
                     <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                        <p className="italic text-sm font-medium">
                          Nenhum candidato atende aos critérios de score.
                        </p>
                     </div>
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                        checked={selectedIds.has(c.id)}
                        onChange={() => toggleSelect(c.id)}
                      />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200">
                          <img 
                            src={`https://picsum.photos/seed/${c.id}/100/100`} 
                            alt={c.name}
                            className="object-cover w-full h-full"
                          />
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{c.name}</p>
                          <p className="text-[10px] text-slate-400 italic mb-0.5">{c.fileName || 'Arquivo não identificado'}</p>
                          {c.role && c.role !== 'Não identificado' && (
                            <p className="text-xs text-slate-500">{c.role}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-slate-700">
                            {c.email && c.email !== 'Não identificado' ? c.email : <span className="text-slate-300 italic">E-mail não encontrado</span>}
                          </p>
                          {c.email && c.email !== 'Não identificado' && <CopyButton text={c.email} />}
                        </div>
                        <div className="flex items-center">
                          <p className="text-xs text-slate-400">
                            {c.phone && c.phone !== 'Não identificado' ? c.phone : <span className="text-slate-300 italic">Telefone não encontrado</span>}
                          </p>
                          {c.phone && c.phone !== 'Não identificado' && <CopyButton text={c.phone} />}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <select 
                        value={c.status}
                        onChange={(e) => onUpdateStatus?.(c.id, e.target.value)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border-none focus:ring-0 cursor-pointer ${
                          c.status === 'Aprovado' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-amber-100 text-amber-600'
                        }`}
                      >
                        <option value="Em Análise">Em Análise</option>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Reprovado">Reprovado</option>
                      </select>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-2 max-w-[150px] sm:max-w-[200px]">
                        {c.tags?.map(tag => (
                          <span 
                            key={tag} 
                            className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md flex items-center gap-1 group/tag"
                          >
                            {tag}
                            <button 
                              onClick={() => handleRemoveTag(c.id, tag)}
                              className="hover:text-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        <div className="flex items-center gap-1">
                          <input 
                            type="text"
                            placeholder="Add tag..."
                            value={newTagInput[c.id] || ''}
                            onChange={(e) => setNewTagInput(prev => ({ ...prev, [c.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTag(c.id)}
                            className="w-20 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-[10px] outline-none focus:border-primary"
                          />
                          <button 
                            onClick={() => handleAddTag(c.id)}
                            className="p-1 bg-slate-100 hover:bg-primary hover:text-white rounded-md transition-all"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">{c.score.toFixed(1)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onViewProfile?.(c)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                          title="Ver Perfil"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirmingId === c.id) {
                              onDelete?.(c.id);
                              setConfirmingId(null);
                            } else {
                              setConfirmingId(c.id);
                              setTimeout(() => setConfirmingId(null), 3000);
                            }
                          }}
                          className={`p-2 rounded-lg transition-all ${
                            confirmingId === c.id 
                              ? 'text-white bg-red-600 animate-pulse' 
                              : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                          }`}
                          title={confirmingId === c.id ? 'Confirmar?' : 'Excluir'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-white">
          <p className="text-xs font-bold text-slate-400">
            Mostrando <span className="text-slate-900">{filteredCandidates.length > 0 ? startIndex + 1 : 0}</span> a <span className="text-slate-900">{Math.min(startIndex + itemsPerPage, filteredCandidates.length)}</span> de <span className="text-slate-900">{filteredCandidates.length}</span> candidatos
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              // Simple pagination logic: show first, last, and current +/- 1
              if (
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button 
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === page 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                (page === 2 && currentPage > 3) || 
                (page === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return <span key={page} className="text-slate-400 mx-1">...</span>;
              }
              return null;
            })}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Previsão de Talentos IA</h3>
          <div className="flex items-start gap-8">
            <div className="flex-1 space-y-6">
              <p className="text-slate-500 text-sm leading-relaxed">
                Detectada alta densidade de <span className="font-bold text-primary underline decoration-2 underline-offset-4 cursor-pointer">{predictionData.role}</span>. 
                {predictionData.count > 0 
                  ? ` Recomendamos acelerar a triagem para os top ${Math.min(predictionData.count, 5)} candidatos para evitar perda de talentos.`
                  : " Continue as triagens para identificar os melhores perfis para esta vaga."}
              </p>
              <div className="flex items-center gap-6">
                <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex-1">
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Prob. de Sucesso</p>
                  <p className="text-2xl font-bold text-green-700">{predictionData.prob}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tempo para Contratação</p>
                  <p className="text-2xl font-bold text-700">{predictionData.days}</p>
                </div>
              </div>
            </div>
            <div className="w-64 h-40 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center relative group cursor-pointer">
              <TrendingUp className="w-12 h-12 text-slate-200 group-hover:text-primary transition-all" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <span className="bg-white px-4 py-2 rounded-lg shadow-lg text-xs font-bold">Ver Gráfico</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-[#1e293b] p-8 rounded-3xl shadow-xl border border-slate-700/50 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -mr-24 -mt-24 group-hover:bg-primary/20 transition-all duration-500"></div>
          <div>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-extrabold uppercase tracking-[0.2em] border border-primary/20">Ação Rápida</span>
            <h3 className="text-2xl font-bold text-white mt-4 mb-3 tracking-tight">Automatizar Migração</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Mover candidatos com Score Neural &gt; {Math.max(8.5, predictionData.topScore - 0.5).toFixed(1)} para &apos;Revisão Executiva&apos; imediatamente.
            </p>
          </div>
          <button 
            onClick={handleMigration}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:brightness-110 hover:shadow-primary/40 active:scale-[0.98] transition-all mt-10"
          >
            Executar Migração
          </button>
        </div>
      </div>

      {/* Migration Summary Modal */}
      <AnimatePresence>
        {migrationSummary && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMigrationSummary(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Send className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Relatório Gerado</h3>
                    <p className="text-slate-500 text-sm">{migrationSummary.count} candidatos migrados com sucesso</p>
                  </div>
                </div>
                <button 
                  onClick={() => setMigrationSummary(null)}
                  className="p-2 hover:bg-slate-200 rounded-xl transition-all"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto bg-slate-50/50">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-inner font-mono text-xs whitespace-pre-wrap text-slate-700 leading-relaxed max-h-[400px] overflow-y-auto">
                  {migrationSummary.text}
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 bg-white grid grid-cols-2 gap-4">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(migrationSummary.text);
                    alert("Copiado para a área de transferência!");
                  }}
                  className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  <Copy className="w-4 h-4" />
                  Copiar Relatório
                </button>
                <button 
                  onClick={shareByEmail}
                  className="flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold hover:brightness-110 shadow-lg shadow-primary/20 transition-all"
                >
                  <Mail className="w-4 h-4" />
                  Enviar por E-mail
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
