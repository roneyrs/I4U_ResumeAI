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
  Folder, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp 
} from 'lucide-react';
import { motion } from 'motion/react';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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
}

interface CandidateListProps {
  candidates: Candidate[];
  onViewProfile?: (candidate: Candidate) => void;
  onDelete?: (id: string) => void;
  onUpdateStatus?: (id: string, status: string) => void;
}

export default function CandidateList({ candidates, onViewProfile, onDelete, onUpdateStatus }: CandidateListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [jobFilter, setJobFilter] = React.useState('');
  const [scoreLimit, setScoreLimit] = React.useState(0.0);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [exportType, setExportType] = React.useState<'analysis' | 'cv'>('analysis');

  const filteredCandidates = candidates.filter(c => 
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.status.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (c.jobDescription?.toLowerCase().includes(jobFilter.toLowerCase()) || !jobFilter) &&
    c.score >= scoreLimit
  );

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
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
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
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Limite de Score Neural</label>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg font-bold text-sm">{scoreLimit.toFixed(1)}+</span>
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

        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Buscar Candidato</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Nome ou status..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Descrição da Vaga</label>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filtrar por vaga..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20"
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
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
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Score Neural</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-slate-400 italic text-sm">
                    {searchTerm || jobFilter ? 'Nenhum candidato encontrado para esta busca.' : 'Nenhum candidato atende aos critérios de score.'}
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c) => (
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
                          <p className="text-xs text-slate-500">{c.role || 'Arquiteta de Sistemas Sênior'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-slate-700">{c.email || 's.jenning@cloud-ops.ai'}</p>
                        <p className="text-xs text-slate-400">{c.phone || '+1 (555) 092-8831'}</p>
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
                          onClick={() => onDelete?.(c.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <MoreVertical className="w-4 h-4" />
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
          <p className="text-xs font-bold text-slate-400">Mostrando <span className="text-slate-900">25</span> de 1.284 candidatos</p>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 bg-primary text-white rounded-lg text-xs font-bold">1</button>
            <button className="w-8 h-8 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold">2</button>
            <button className="w-8 h-8 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold">3</button>
            <span className="text-slate-400 mx-1">...</span>
            <button className="w-8 h-8 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold">52</button>
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-all">
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
                Detectada alta densidade de <span className="font-bold text-primary underline decoration-2 underline-offset-4 cursor-pointer">Engenheiros Rust</span>. Recomendamos acelerar a triagem para os top 5 candidatos para evitar perda de talentos.
              </p>
              <div className="flex items-center gap-6">
                <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex-1">
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Prob. de Sucesso</p>
                  <p className="text-2xl font-bold text-green-700">88.4%</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tempo para Contratação</p>
                  <p className="text-2xl font-bold text-700">12 Dias</p>
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

        <div className="col-span-12 lg:col-span-4 bg-secondary p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-16 -mt-16"></div>
          <div>
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-[10px] font-bold uppercase tracking-widest">Ação Rápida</span>
            <h3 className="text-2xl font-bold text-white mt-4 mb-2">Automatizar Migração de Pasta</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Mover candidatos com Score Neural {'>'} 9.4 para &apos;Revisão Executiva&apos; imediatamente.
            </p>
          </div>
          <button className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all mt-8">
            Executar Migração
          </button>
        </div>
      </div>

    </div>
  );
}
