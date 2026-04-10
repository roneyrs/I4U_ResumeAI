'use client';

import React from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  CloudUpload, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Zap, 
  Cpu, 
  Database, 
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';

interface BatchUploadProps {
  apiKey: string;
  prompt: string;
  setPrompt: (prompt: string) => void;
  onComplete: (results: any[]) => void;
}

interface ProcessingFile {
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;
  stage: string;
  result?: any;
  error?: string;
}

export default function BatchUpload({ apiKey, prompt, setPrompt, onComplete }: BatchUploadProps) {
  const [files, setFiles] = React.useState<ProcessingFile[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processMode, setProcessMode] = React.useState<'individual' | 'batch'>('batch');

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      status: 'pending' as const,
      progress: 0,
      stage: 'Aguardando'
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true
  });

  const processFiles = async () => {
    if (!apiKey) {
      alert('Por favor, insira uma chave de API nas configurações.');
      return;
    }

    if (!prompt.trim()) {
      alert('Por favor, insira o objetivo da vaga (prompt).');
      return;
    }

    setIsProcessing(true);
    const results: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const currentFile = files[i].file;
      if (files[i].status === 'done') continue;

      try {
        if (
          currentFile.type !== "application/pdf" &&
          !currentFile.name.toLowerCase().endsWith(".pdf")
        ) {
          throw new Error("A API aceita apenas arquivos PDF.");
        }

        // Update to Stage 1: Text Extraction
        setFiles(prev =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "uploading", progress: 25, stage: "Extraindo texto...", error: undefined } : f
          )
        );
        await new Promise(r => setTimeout(r, 800));

        // Update to Stage 2: AI Analysis
        setFiles(prev =>
          prev.map((f, idx) =>
            idx === i ? { ...f, progress: 50, stage: "Analisando com IA..." } : f
          )
        );

        const fileArrayBuffer = await currentFile.arrayBuffer();
        const response = await axios.post(
          "/api/analyze",
          fileArrayBuffer,
          {
            headers: {
              "x-api-key": apiKey.trim(),
              "Content-Type": "application/pdf",
            },
            params: {
              prompt: prompt,
            },
            timeout: 120000, // 120 seconds timeout on client
          }
        );

        // Update to Stage 3: Score Calculation
        setFiles(prev =>
          prev.map((f, idx) =>
            idx === i ? { ...f, progress: 75, stage: "Calculando score..." } : f
          )
        );
        await new Promise(r => setTimeout(r, 500));

        let data = response.data;
        
        // Robust JSON parsing (handles markdown blocks and common API quirks)
        if (typeof data === 'string') {
          try {
            // Remove markdown code blocks if present
            const cleanJson = data.replace(/```json\n?|```/g, '').trim();
            data = JSON.parse(cleanJson);
          } catch (e) {
            console.warn("Failed to parse API response as JSON, using raw string:", e);
          }
        }
        
        console.log("I4U API Full Response:", JSON.stringify(data, null, 2));

        // Helper to find email/phone using regex in the entire response string
        const findByRegex = (obj: any, regex: RegExp): string | null => {
          const str = JSON.stringify(obj);
          const match = str.match(regex);
          return match ? match[0] : null;
        };

        // Deep search helper to find keys anywhere in the response
        const findKeyDeep = (obj: any, targetKeys: string[]): any => {
          if (!obj || typeof obj !== 'object') return null;
          
          // Check current level
          for (const key of targetKeys) {
            if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
              return obj[key];
            }
          }

          // Check nested levels
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              const found = findKeyDeep(obj[key], targetKeys);
              if (found) return found;
            }
          }
          return null;
        };

        const extractedName = findKeyDeep(data, ['nome', 'name', 'full_name', 'candidato', 'display_name', 'candidate_name', 'nome_completo']);
        
        // Try key search first, then regex fallback
        let extractedEmail = findKeyDeep(data, ['email', 'e_mail', 'e-mail', 'mail', 'user_email', 'contato_email', 'email_candidato', 'address_email']);
        if (!extractedEmail) {
          extractedEmail = findByRegex(data, /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        }

        let extractedPhone = findKeyDeep(data, ['telefone', 'phone', 'tel', 'celular', 'mobile', 'contact', 'whatsapp', 'contato_telefone', 'phone_number', 'telephone']);
        if (!extractedPhone) {
          extractedPhone = findByRegex(data, /(\+?\d{1,3}[-.\s]?)?\(?\d{2,3}\)?[-.\s]?\d{4,5}[-.\s]?\d{4}/);
        }

        const extractedRole = findKeyDeep(data, ['cargo', 'role', 'position', 'job_title', 'headline', 'ocupacao']);
        const extractedScore = findKeyDeep(data, ['pontuacao', 'score', 'rating', 'match', 'percentual', 'aderencia']);
        const extractedAnalysis = findKeyDeep(data, ['analise', 'analysis', 'summary', 'resumo', 'feedback', 'comentario']);
        const extractedExperience = findKeyDeep(data, ['experiencia', 'experience', 'experience_years', 'anos_experiencia', 'tempo_experiencia']);
        const extractedSkills = findKeyDeep(data, ['skills', 'habilidades', 'competencias', 'tecnologias', 'conhecimentos']);
        const extractedStrengths = findKeyDeep(data, ['strengths', 'pontos_fortes', 'fortalezas', 'qualidades']);
        const extractedAttention = findKeyDeep(data, ['attention_areas', 'pontos_atencao', 'areas_atencao', 'weaknesses', 'melhorias']);

        const result = {
          id: Math.random().toString(36).substr(2, 9),
          name: extractedName || currentFile.name.replace('.pdf', ''),
          score: typeof extractedScore === 'number' ? extractedScore : parseFloat(extractedScore) || 0,
          analysis: extractedAnalysis || data.analise || 'Sem análise disponível',
          status: 'Em Análise',
          date: new Date().toISOString(),
          email: extractedEmail || 'Não identificado',
          phone: extractedPhone || 'Não identificado',
          role: extractedRole || 'Não identificado',
          experienceYears: extractedExperience || 'Não especificado',
          skills: Array.isArray(extractedSkills) ? extractedSkills.map(s => String(s)) : [],
          strengths: Array.isArray(extractedStrengths) ? extractedStrengths.map(s => String(s)) : [],
          attentionAreas: Array.isArray(extractedAttention) ? extractedAttention.map(s => String(s)) : [],
          tags: []
        };

        results.push(result);
        
        // Small delay between files to avoid rate limits/congestion
        await new Promise(r => setTimeout(r, 1000));

        // Update to Stage 4: Done
        setFiles(prev =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "done", progress: 100, stage: "Análise concluída", result: data } : f
          )
        );
      } catch (err: any) {
        let errorMessage = "Erro inesperado";

        if (axios.isAxiosError(err)) {
          const data = err.response?.data;
          errorMessage = 
            (typeof data === 'object' && data?.error) ? data.error :
            (typeof data === 'string' ? data : err.message);
          
          if (err.code === 'ECONNABORTED') {
            errorMessage = "A requisição demorou muito e foi cancelada.";
          }
        } else {
          errorMessage = err?.message || "Erro inesperado";
        }

        console.error("Erro na API:", errorMessage, err);

        setFiles(prev =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "error", stage: "Falha no processamento", error: errorMessage } : f
          )
        );
      }
    }

    setIsProcessing(false);
    if (results.length > 0) {
      onComplete(results);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Fluxo de Ingestão</span>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Processamento em Lote</h1>
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button 
              onClick={() => setProcessMode('individual')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${processMode === 'individual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Individual
            </button>
            <button 
              onClick={() => setProcessMode('batch')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${processMode === 'batch' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Lote (Batch)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Upload & Prompt */}
        <div className="col-span-12 md:col-span-6 lg:col-span-7 space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Layers className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-bold text-slate-900">Configuração da Camada</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Objetivo da Vaga (Prompt)</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Analise para vaga de cientista de dados sênior com foco em NLP..."
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 min-h-[120px] resize-none font-medium"
                />
              </div>

              <div 
                {...getRootProps()} 
                className={`
                  border-2 border-dashed rounded-[32px] p-12 text-center transition-all cursor-pointer
                  ${isDragActive ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'}
                `}
              >
                <input {...getInputProps()} />
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CloudUpload className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Arraste seus currículos aqui</h3>
                <p className="text-slate-400 text-sm">PDFs suportados para análise em lote (Máx 50MB por arquivo)</p>
              </div>
            </div>
          </div>

          {/* Telemetry Section */}
          <div className="bg-slate-900 p-8 rounded-[32px] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-bold text-white">Telemetria do Sistema</h3>
              </div>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-[10px] font-bold uppercase tracking-widest">Status: Nominal</span>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Carga da CPU</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-white">24%</span>
                  <div className="flex gap-0.5 mb-1.5">
                    {[1,2,3,4,5].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i <= 2 ? 'bg-primary' : 'bg-slate-700'}`}></div>)}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Latência de IA</p>
                <p className="text-2xl font-bold text-white">1.2s</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tokens/Min</p>
                <p className="text-2xl font-bold text-white">42.8k</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Queue */}
        <div className="col-span-12 md:col-span-6 lg:col-span-5">
          <div className="bg-white rounded-[24px] sm:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px] sm:min-h-[600px]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Fila de Análise Ativa</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{files.length} Arquivos em Espera</p>
                </div>
              </div>
              <button 
                onClick={processFiles}
                disabled={isProcessing || files.length === 0 || files.every(f => f.status === 'done')}
                className="px-6 py-3 bg-secondary text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-secondary/20"
              >
                {isProcessing ? 'Processando...' : 'Iniciar Triagem'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {files.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 p-12 text-center">
                  <Database className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm font-medium">A fila está vazia.<br/>Faça o upload de arquivos para começar.</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {files.map((f, idx) => (
                    <motion.div 
                      key={f.file.name + idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-5 bg-slate-50 rounded-2xl border border-slate-100 relative group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{f.file.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {(f.file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFile(idx)}
                          disabled={isProcessing}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                          <span className={f.status === 'error' ? 'text-red-500' : 'text-primary'}>{f.stage}</span>
                          <span className="text-slate-400">{f.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${f.progress}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${f.status === 'error' ? 'bg-red-500' : 'bg-primary'}`}
                          />
                        </div>
                      </div>

                      {f.status === 'done' && (
                        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score IA:</span>
                            <span className="text-sm font-bold text-primary">{f.result?.pontuacao || '0.0'}</span>
                          </div>
                          <button className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1 hover:underline">
                            Ver Detalhes <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {f.status === 'error' && (
                        <p className="mt-2 text-[10px] font-bold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
                          {f.error}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
