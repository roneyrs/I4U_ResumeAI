'use client';

import React from 'react';
import { FileText, ExternalLink, Search, Filter } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  score: number;
  status: string;
  date: string;
}

export default function CandidateList() {
  const candidates: Candidate[] = [
    { id: '1', name: 'Erick Furst', score: 94, status: 'Analisado', date: '27/03/2026' },
    { id: '2', name: 'Mariana Silva', score: 88, status: 'Analisado', date: '26/03/2026' },
    { id: '3', name: 'João Pereira', score: 72, status: 'Analisado', date: '26/03/2026' },
    { id: '4', name: 'Ana Costa', score: 91, status: 'Analisado', date: '25/03/2026' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-lg">Candidatos Recentes</h3>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-primary transition-all">
            <Filter className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-primary transition-all">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score IA</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {candidates.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{c.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${c.score > 90 ? 'bg-green-500' : c.score > 80 ? 'bg-primary' : 'bg-amber-500'}`}
                        style={{ width: `${c.score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold">{c.score}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold">
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{c.date}</td>
                <td className="px-6 py-4">
                  <button className="p-2 text-slate-400 hover:text-primary transition-all opacity-0 group-hover:opacity-100">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
