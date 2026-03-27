'use client';

import React from 'react';
import { User, Mail, Shield, CreditCard, Bell, LogOut, Camera, CheckCircle2, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

export default function UserProfile() {
  const user = {
    name: 'Usuário Admin',
    email: 'admin@i4uai.com',
    role: 'Administrador Senior',
    plan: 'Enterprise',
    joined: 'Janeiro 2024',
    avatar: 'https://picsum.photos/seed/admin/200/200'
  };

  const stats = [
    { label: 'Análises Realizadas', value: '1,240', icon: Zap },
    { label: 'Precisão Média', value: '98.5%', icon: CheckCircle2 },
    { label: 'Economia de Tempo', value: '450h', icon: Shield },
  ];

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Configurações da Conta</span>
        <h2 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight">
          Perfil do <span className="text-primary">Usuário</span>
        </h2>
        <p className="text-slate-500 font-medium mt-2">Gerencie suas informações pessoais e preferências do sistema.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-[32px] overflow-hidden border-4 border-white shadow-xl relative">
                <Image
                  src={user.avatar}
                  alt={user.name}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-xl border-4 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-all">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900">{user.name}</h3>
            <p className="text-primary font-bold text-sm mb-6">{user.role}</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-600 truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">Plano {user.plan}</span>
              </div>
            </div>

            <button className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
              <LogOut className="w-4 h-4" />
              Encerrar Sessão
            </button>
          </div>

          <div className="bg-primary p-8 rounded-[40px] text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all"></div>
            <h4 className="text-xl font-bold mb-2">Upgrade Disponível</h4>
            <p className="text-white/80 text-xs leading-relaxed mb-6">
              Desbloqueie análises preditivas de retenção e integração direta com seu ATS.
            </p>
            <button className="w-full py-3 bg-white text-primary rounded-xl font-bold text-sm hover:scale-105 transition-all">
              Ver Planos Pro
            </button>
          </div>
        </div>

        {/* Right Column: Details & Settings */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              Preferências do Sistema
            </h3>
            
            <div className="space-y-6">
              {[
                { label: 'Notificações por E-mail', desc: 'Receba alertas quando novas triagens forem concluídas.', active: true },
                { label: 'Relatórios Semanais', desc: 'Resumo executivo de todas as análises da semana.', active: false },
                { label: 'Modo de Alta Precisão', desc: 'Utiliza modelos mais densos para análise (pode ser mais lento).', active: true },
                { label: 'Auto-Arquivamento', desc: 'Arquiva automaticamente candidatos com score abaixo de 5.0.', active: false },
              ].map((pref) => (
                <div key={pref.label} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="font-bold text-slate-900">{pref.label}</p>
                    <p className="text-xs text-slate-500">{pref.desc}</p>
                  </div>
                  <button className={`w-12 h-6 rounded-full transition-all relative ${pref.active ? 'bg-primary' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${pref.active ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <Bell className="w-6 h-6 text-primary" />
              Segurança
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
                Alterar Senha
              </button>
              <button className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
                Autenticação em 2 Fatores
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
