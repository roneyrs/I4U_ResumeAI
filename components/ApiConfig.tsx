'use client';

import React from 'react';
import { Key, CheckCircle2, Eye, EyeOff, Activity, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';

interface ApiConfigProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  onValidationSuccess?: () => void;
}

type ValidationStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ApiConfig({ apiKey, onApiKeyChange, onValidationSuccess }: ApiConfigProps) {
  const [showKey, setShowKey] = React.useState(false);
  const [status, setStatus] = React.useState<ValidationStatus>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [latency, setLatency] = React.useState<number | null>(null);

  const testConnection = async () => {
    if (!apiKey) {
      setStatus('error');
      setErrorMessage('A chave de API não pode estar vazia.');
      return;
    }

    setStatus('loading');
    setErrorMessage(null);
    const startTime = Date.now();

    try {
      // Fazemos uma chamada mínima para testar a chave
      const url = "/api/analyze?prompt=test_connection";
      
      // Enviamos um Uint8Array vazio em vez de null para garantir que o Content-Type seja respeitado
      // e o corpo não seja interpretado de forma ambíguos pelo axios/proxy
      await axios.post(url, new Uint8Array(0), {
        headers: {
          "x-api-key": apiKey.trim(),
          "Content-Type": "application/pdf"
        },
        timeout: 20000 // 20 seconds timeout
      });

      setStatus('success');
      setLatency(Date.now() - startTime);
      if (onValidationSuccess) onValidationSuccess();
    } catch (err: any) {
      const endTime = Date.now();
      const responseStatus = err.response?.status;
      
      // O proxy agora retorna 200 se o I4U retornar 400 em um teste
      if (responseStatus === 401 || responseStatus === 403) {
        setStatus('error');
        setErrorMessage('Chave de API inválida ou sem permissão.');
      } else {
        setStatus('error');
        setErrorMessage(
          err.response?.data?.error || 
          err.response?.data?.message || 
          err.message || 
          'Erro ao conectar com a API.'
        );
      }
    }
  };

  // Reset status when API key changes
  React.useEffect(() => {
    setStatus('idle');
    setErrorMessage(null);
  }, [apiKey]);

  return (
    <div className="bg-secondary text-white p-8 rounded-xl border border-white/5 relative overflow-hidden shadow-xl h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
      
      <div className="flex items-center gap-3 mb-6">
        <Key className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">Configuração da API</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Provedor de Endpoint
          </label>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-white/10 flex items-center justify-between">
            <span className="text-sm font-medium">I4U AI Resume API</span>
            <CheckCircle2 className={status === 'success' ? "w-4 h-4 text-green-500" : "w-4 h-4 text-primary"} />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Chave de API Secreta
          </label>
          <div className="relative mb-2">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="Insira sua chave de API aqui..."
              className={`w-full bg-slate-800/50 border-none rounded-lg py-3 px-4 text-sm font-mono text-slate-200 focus:ring-2 transition-all ${
                status === 'error' ? 'ring-2 ring-red-500' : 
                status === 'success' ? 'ring-2 ring-green-500' : 
                'focus:ring-primary/40'
              }`}
            />
            <button 
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
            Não tem uma chave? Obtenha em{' '}
            <a 
              href="https://agents-marketplace.i4uai.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-bold"
            >
              marketplace.i4uai.com
            </a>
          </p>
          <AnimatePresence>
            {errorMessage && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[10px] text-red-500 mt-2 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" /> {errorMessage}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <button 
            onClick={testConnection}
            disabled={status === 'loading'}
            className={`w-full py-3 rounded-lg font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
              status === 'success' ? 'bg-green-600 text-white shadow-green-900/20' :
              status === 'error' ? 'bg-red-600 text-white shadow-red-900/20' :
              'bg-primary text-white shadow-primary/20 hover:brightness-110 active:scale-95'
            }`}
          >
            {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {status === 'success' ? <CheckCircle className="w-4 h-4" /> : null}
            {status === 'error' ? <AlertCircle className="w-4 h-4" /> : null}
            {status === 'loading' ? 'Testando...' : 
             status === 'success' ? 'Conectado' : 
             status === 'error' ? 'Falha na Conexão' : 
             'Testar Conexão'}
          </button>
          <button 
            onClick={() => onApiKeyChange('')}
            className="w-full py-3 text-slate-400 font-semibold text-sm hover:text-white transition-all"
          >
            Revogar Chave de Acesso
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Latência</span>
            <span className={`text-xs font-bold ${status === 'success' ? 'text-green-500' : 'text-primary'}`}>
              {latency ? `${latency}ms` : '---'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: status === 'success' ? '100%' : '0%' }}
              className={`h-full rounded-full shadow-[0_0_8px_rgba(235,93,29,0.5)] ${
                status === 'success' ? 'bg-green-500' : 'bg-primary'
              }`}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            {status === 'success' ? 'Janela de processamento ideal ativa.' : 'Aguardando validação da chave.'}
          </p>
        </div>
      </div>
    </div>
  );
}
