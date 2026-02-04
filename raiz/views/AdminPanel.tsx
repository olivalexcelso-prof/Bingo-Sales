
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Settings, Play, Square, Image, Database, Users, MessageSquare, DollarSign, Clock, Layout, Percent } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { config, updateConfig, forceStart, forceEnd } = useGame();
  const [activeTab, setActiveTab] = useState<'general' | 'visual' | 'logic' | 'finance'>('general');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        updateConfig({
          ...config,
          [parent]: {
            ...(config as any)[parent],
            [child]: val
          }
        });
      }
    } else {
      updateConfig({ ...config, [name]: val });
    }
  };

  const handleToggle = (name: string, current: boolean) => {
    updateConfig({ ...config, [name]: !current });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 pt-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Settings className="w-8 h-8 text-slate-500" /> Diretoria Admin
            </h1>
            <p className="text-slate-500 text-sm">Painel de controle total do Bingo Master Pro</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={forceStart}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
            >
              <Play className="w-5 h-5" /> Iniciar Partida
            </button>
            <button 
              onClick={forceEnd}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
            >
              <Square className="w-5 h-5" /> Forçar Término
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="space-y-2">
            {[
              { id: 'general', label: 'Geral & Fakes', icon: Users },
              { id: 'visual', label: 'Identidade Visual', icon: Layout },
              { id: 'logic', label: 'Lógica & Servidor', icon: Database },
              { id: 'finance', label: 'Financeiro & Rateio', icon: DollarSign },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-4">Configurações Gerais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Nome do Bingo</label>
                    <input 
                      type="text" name="bingoName" value={config.bingoName} onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Usuários Fakes</label>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleToggle('fakeUsersEnabled', config.fakeUsersEnabled)}
                        className={`px-4 py-2 rounded-lg font-bold ${config.fakeUsersEnabled ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                      >
                        {config.fakeUsersEnabled ? 'ATIVADO' : 'DESATIVADO'}
                      </button>
                      <input 
                        type="number" name="fakeUsersCount" value={config.fakeUsersCount} onChange={handleInputChange}
                        className="w-24 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-slate-300 font-bold flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Textos para Locução (TTS)</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {Object.keys(config.ttsTexts).map(key => (
                      <div key={key}>
                        <label className="block text-slate-500 text-[10px] uppercase mb-1">{key}</label>
                        <input 
                          type="text" name={`ttsTexts.${key}`} value={(config.ttsTexts as any)[key]} onChange={handleInputChange}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'visual' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-4">Personalização Visual</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Logo URL</label>
                    <input 
                      type="text" name="logoUrl" value={config.logoUrl} onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Imagem de Fundo (Páginas)</label>
                    <input 
                      type="text" name="backgroundUrl" value={config.backgroundUrl} onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Opacidade do Fundo ({Math.round(config.backgroundOpacity * 100)}%)</label>
                    <input 
                      type="range" name="backgroundOpacity" min="0" max="1" step="0.01" value={config.backgroundOpacity} onChange={handleInputChange}
                      className="w-full accent-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logic' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-4">Programação & Servidor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-slate-300 font-bold mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Horários</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-slate-500 text-[10px] uppercase mb-1">Início</label>
                        <input type="time" name="schedule.startTime" value={config.schedule.startTime} onChange={handleInputChange} className="w-full bg-slate-800 p-2 rounded border border-slate-700 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-500 text-[10px] uppercase mb-1">Intervalo (Minutos)</label>
                        <input type="number" name="schedule.intervalMinutes" value={config.schedule.intervalMinutes} onChange={handleInputChange} className="w-full bg-slate-800 p-2 rounded border border-slate-700 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-500 text-[10px] uppercase mb-1">Última Partida</label>
                        <input type="time" name="schedule.lastMatchTime" value={config.schedule.lastMatchTime} onChange={handleInputChange} className="w-full bg-slate-800 p-2 rounded border border-slate-700 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'finance' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <h3 className="text-xl font-bold text-white">Financeiro & Rateio Automático</h3>
                  <div className="bg-slate-800 px-4 py-2 rounded-xl">
                    <span className="text-slate-500 text-[10px] uppercase font-black block">Grande Acumulado Total</span>
                    <span className="text-green-400 font-black">R$ {config.prizes.acumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-slate-300 font-bold flex items-center gap-2"><Percent className="w-4 h-4" /> Configuração de Rateio (%)</h4>
                    <p className="text-slate-500 text-xs">Defina quanto da arrecadação real vai para cada prêmio.</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-500 text-[10px] uppercase font-black mb-1">Quadra (%)</label>
                        <input type="number" name="prizePercentages.quadra" value={config.prizePercentages.quadra} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-bold" />
                      </div>
                      <div>
                        <label className="block text-slate-500 text-[10px] uppercase font-black mb-1">Linha (%)</label>
                        <input type="number" name="prizePercentages.linha" value={config.prizePercentages.linha} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-bold" />
                      </div>
                      <div>
                        <label className="block text-slate-500 text-[10px] uppercase font-black mb-1">Bingo (%)</label>
                        <input type="number" name="prizePercentages.bingo" value={config.prizePercentages.bingo} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-bold" />
                      </div>
                      <div>
                        <label className="block text-slate-500 text-[10px] uppercase font-black mb-1">Acumular (%)</label>
                        <input type="number" name="prizePercentages.accumulate" value={config.prizePercentages.accumulate} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-bold" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-slate-300 font-bold flex items-center gap-2"><DollarSign className="w-4 h-4" /> Valores Base</h4>
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Valor da Série (R$)</label>
                      <input type="number" name="seriesPrice" value={config.seriesPrice} onChange={handleInputChange} className="w-full bg-slate-800 p-3 rounded-lg border border-slate-700 text-white font-black" />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Chave PIX (Depósitos)</label>
                      <input type="text" name="pixKey" value={config.pixKey} onChange={handleInputChange} className="w-full bg-slate-800 p-3 rounded-lg border border-slate-700 text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase mb-2">WhatsApp Administrativo</label>
                      <input type="text" name="adminWhatsapp" value={config.adminWhatsapp} onChange={handleInputChange} className="w-full bg-slate-800 p-3 rounded-lg border border-slate-700 text-white" placeholder="5511999999999" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
