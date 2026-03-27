'use client';

import React from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudUpload, FileText, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';

interface BatchUploadProps {
  apiKey: string;
  onComplete: (results: any[]) => void;
}

interface ProcessingFile {
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: any;
  error?: string;
}

export default function BatchUpload({ apiKey, onComplete }: BatchUploadProps) {
  const [files, setFiles] = React.useState<ProcessingFile[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      status: 'pending' as const
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

    setIsProcessing(true);
    const results: any[] = [];

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'completed') continue;

      setFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'processing' } : f
      ));

      try {
        const file = files[i].file;
        const arrayBuffer = await file.arrayBuffer();
        
        const url = "https://api.i4uai.com/resume/analisar_curriculo?prompt=Analise+para+vaga+de+cientista+de+dados";
        const response = await axios.post(url, arrayBuffer, {
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/octet-stream"
          }
        });

        const result = {
          fileName: file.name,
          data: response.data,
          timestamp: new Date().toISOString()
        };

        results.push(result);

        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'completed', result: response.data } : f
        ));
      } catch (err: any) {
        console.error(err);
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'error', error: err.message } : f
        ));
      }
    }

    setIsProcessing(false);
    onComplete(results);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'}
        `}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CloudUpload className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold mb-1">Arraste seus currículos aqui</h3>
        <p className="text-slate-500 text-sm">PDFs suportados para análise em lote</p>
      </div>

      {files.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h4 className="font-bold text-sm">Fila de Processamento ({files.length})</h4>
            <button 
              onClick={processFiles}
              disabled={isProcessing || files.every(f => f.status === 'completed')}
              className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-secondary/90 transition-all"
            >
              {isProcessing ? 'Processando...' : 'Iniciar Triagem'}
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <AnimatePresence initial={false}>
              {files.map((f, idx) => (
                <motion.div 
                  key={f.file.name + idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 border-b border-slate-50 flex items-center justify-between last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{f.file.name}</p>
                      <p className="text-[10px] text-slate-400">{(f.file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {f.status === 'processing' && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                    {f.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {f.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    <button 
                      onClick={() => removeFile(idx)}
                      disabled={isProcessing}
                      className="p-1 text-slate-400 hover:text-red-500 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
