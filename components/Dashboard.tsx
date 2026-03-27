'use client';

import React from 'react';
import { FileText, TrendingUp, Hourglass, Activity, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const stats = [
    { label: 'Total Processado', value: '12.482', change: '+12%', icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Match Médio', value: '84%', change: 'Estável', icon: Activity, color: 'text-secondary', bg: 'bg-slate-100' },
    { label: 'Tarefas Pendentes', value: '156', change: 'Ao Vivo', icon: Hourglass, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  const activities = [
    { title: 'Lote #482 Concluído', desc: '12 candidatos analisados com 98% de precisão.', time: '2 minutos atrás', color: 'bg-primary' },
    { title: 'Chave de API Rotacionada', desc: 'Protocolo de segurança atualizado com sucesso.', time: '45 minutos atrás', color: 'bg-secondary' },
    { title: 'Relatório Diário Gerado', desc: 'Enviado para recrutamento@empresa.com.br', time: '2 horas atrás', color: 'bg-slate-200' },
  ];

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-4xl font-headline font-bold text-slate-900 tracking-tight leading-tight">
          O Arquiteto <span className="text-primary">Cognitivo</span>
        </h2>
        <p className="text-lg text-slate-500 font-light mt-2">Desempenho de triagem inteligente e status da infraestrutura.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold ${stat.change === 'Ao Vivo' ? 'text-red-500' : 'text-green-600'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-slate-400 text-[10px] mt-4 uppercase tracking-widest font-bold">{stat.label}</h3>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Pulso do Sistema</h3>
            <button className="text-xs font-bold text-primary hover:underline">Ver Tudo</button>
          </div>
          <div className="space-y-6">
            {activities.map((act) => (
              <div key={act.title} className="flex gap-4">
                <div className={`w-1 h-10 ${act.color} rounded-full shrink-0`}></div>
                <div>
                  <p className="text-sm font-bold">{act.title}</p>
                  <p className="text-xs text-slate-500">{act.desc}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
            <Activity className="w-10 h-10 text-primary" />
          </div>
          <h4 className="text-xl font-bold mb-2">Iniciar Nova Triagem</h4>
          <p className="text-sm text-slate-500 mb-8 max-w-[240px]">Propague seu banco de talentos através do nosso motor de pontuação neural.</p>
          <button className="w-full py-3 bg-secondary text-white rounded-lg font-bold shadow-lg hover:bg-secondary/90 transition-all active:scale-95">
            Explorar Banco
          </button>
        </div>
      </div>
    </div>
  );
}
