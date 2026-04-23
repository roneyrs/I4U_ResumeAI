'use client';

import React from 'react';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

interface AuthProps {
  onVisitorMode?: () => void;
}

export default function Auth({ onVisitorMode }: AuthProps) {
  const [isLogin, setIsLogin] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        if (error) throw error;
        alert('Cadastro realizado! Um e-mail de confirmação foi enviado. Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta. Dica: Se o link der erro de validade, tente fazer login diretamente; em alguns casos, o e-mail é confirmado automaticamente pelo provedor.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
          <div className="bg-secondary p-10 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-primary font-bold text-2xl">I4U</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {isLogin ? 'Bem-vindo de Volta' : 'Criar Nova Conta'}
              </h1>
              <p className="text-slate-400 text-sm font-medium">A Camada de Inteligência para Recrutamento</p>
            </div>
          </div>

          <div className="p-10">
            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">E-mail Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@i4uai.com"
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all font-medium outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Sua Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all font-medium outline-none"
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    {isLogin ? 'Entrar no Sistema' : 'Finalizar Cadastro'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 text-center space-y-4">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-bold text-slate-400 hover:text-primary transition-all"
              >
                {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já possui uma conta? Entre aqui'}
              </button>

              {!supabase && (
                <div className="pt-4">
                  <button
                    onClick={onVisitorMode}
                    className="w-full py-3 border-2 border-slate-100 text-slate-400 rounded-2xl text-xs font-bold hover:bg-slate-50 hover:text-primary transition-all"
                  >
                    Entrar em Modo Visitante (Local Only)
                  </button>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center gap-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aviso Importante</p>
                <p className="text-xs text-slate-600 leading-relaxed max-w-[280px]">
                  Para obter sua <span className="text-primary font-bold">Chave de API</span>, acesse o marketplace oficial:
                </p>
                <a 
                  href="https://agents-marketplace.i4uai.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-secondary font-bold text-xs hover:underline decoration-2"
                >
                  marketplace.i4uai.com <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
