'use client';

import React from 'react';
import { FileText, TrendingUp, Hourglass, Activity, ChevronRight, Zap, Cpu, Search } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  results?: any[];
  onNavigate?: (tab: string) => void;
}

export default function Dashboard({ results = [], onNavigate }: DashboardProps) {
  const totalProcessed = results.length;
  const averageScore = results.length > 0 
    ? (results.reduce((acc, curr) => acc + curr.score, 0) / results.length).toFixed(1)
    : '0.0';

  const stats = [
    { label: 'Total Processado', value: totalProcessed.toString(), change: '+12%', icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Match Médio', value: averageScore, change: 'Estável', icon: Activity, color: 'text-secondary', bg: 'bg-slate-100' },
    { label: 'Fila Ativa', value: '0', change: 'Nominal', icon: Cpu, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  // Generate real activities from results
  const realActivities = results.slice(0, 3).map(res => ({
    title: `Análise: ${res.name}`,
    desc: `Score: ${res.score} - ${res.analysis?.substring(0, 60)}...`,
    time: res.date,
    color: 'bg-primary'
  }));

  const activities = realActivities.length > 0 ? realActivities : [
    { title: 'Sistema Pronto', desc: 'Aguardando novos currículos para análise.', time: 'Agora', color: 'bg-slate-200' },
  ];

  return (
    <div className="space-y-12">
      <section className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Visão Geral do Sistema</span>
        <h2 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight">
          RH <span className="text-primary">Inteligente</span>
        </h2>
        <p className="text-slate-500 font-medium mt-2">Desempenho de triagem inteligente e status da infraestrutura.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-all`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${stat.change === 'Nominal' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-slate-400 text-[10px] mt-6 uppercase tracking-widest font-bold">{stat.label}</h3>
            <p className="text-4xl font-bold mt-2 text-slate-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary fill-current" />
              </div>
              <h3 className="font-bold text-xl text-slate-900">Pulso do Sistema</h3>
            </div>
            <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-all">Ver Histórico Completo</button>
          </div>
          <div className="space-y-8">
            {activities.map((act) => (
              <div key={act.title} className="flex gap-6 group cursor-pointer">
                <div className={`w-1.5 h-12 ${act.color} rounded-full shrink-0 group-hover:scale-y-110 transition-all`}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-slate-900">{act.title}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{act.time}</p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-slate-900 p-10 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/20 transition-all"></div>
          
          <div>
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h4 className="text-3xl font-bold text-white mb-4 tracking-tight">Explorar Banco de Talentos</h4>
            <p className="text-slate-400 text-sm leading-relaxed max-w-[280px]">
              Analise e filtre candidatos de alta performance usando nossa camada de inteligência proprietária.
            </p>
          </div>

          <button 
            onClick={() => onNavigate?.('candidates')}
            className="w-full py-5 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 mt-12"
          >
            Acessar Triagem
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
