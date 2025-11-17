import React, { useState, useEffect } from 'react';

export default function PeerComparison({ ticker, stockData }) {
  const [peers, setPeers] = useState([]);
  const [sector, setSector] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeers = async () => {
      if (!ticker) return;
      
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/api/v1/stocks/${ticker}/peers`);
        const data = await response.json();
        
        if (data.success) {
          setSector(data.data.sector);
          setPeers(data.data.peers);
        }
      } catch (error) {
        console.error('Erro ao buscar peers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPeers();
  }, [ticker]);

  if (loading) {
    return (
      <div className="text-center py-8 text-white/60">
        Carregando comparação...
      </div>
    );
  }

  if (peers.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        Nenhum concorrente encontrado
      </div>
    );
  }

  // Encontrar melhor valor para cada métrica
  const getBest = (metric) => {
    const values = peers.map(p => p[metric]).filter(v => v !== null && v !== undefined);
    if (values.length === 0) return null;
    
    if (metric === 'pe_ratio' || metric === 'pb_ratio' || metric === 'debt_to_ebitda') {
      return Math.min(...values); // Menor é melhor
    } else {
      return Math.max(...values); // Maior é melhor
    }
  };

  const currentPe = stockData?.key_metrics?.pe_ratio;
  const currentPb = stockData?.key_metrics?.pb_ratio;
  const currentRoe = stockData?.key_metrics?.roe;
  const currentYield = stockData?.key_metrics?.dividend_yield;
  const currentDebt = stockData?.key_metrics?.debt_to_ebitda;

  const bestPe = getBest('pe_ratio');
  const bestPb = getBest('pb_ratio');
  const bestRoe = getBest('roe');
  const bestYield = getBest('dividend_yield');
  const bestDebt = getBest('debt_to_ebitda');

  // Calcular quantas métricas a empresa atual é a melhor
  const advantages = [];
  if (currentPe === bestPe && currentPe !== null) advantages.push('Menor P/L (mais barato)');
  if (currentRoe === bestRoe && currentRoe !== null) advantages.push(`ROE de ${currentRoe.toFixed(1)}%`);
  if (currentYield === bestYield && currentYield !== null) advantages.push('Maior Dividend Yield');
  if (currentDebt === bestDebt && currentDebt !== null) advantages.push('Menor alavancagem');

  // Determinar posicionamento
  const advantageCount = advantages.length;
  let positioning = {
    zone: 'NEUTRA',
    color: 'yellow',
    recommendation: 'MANTER',
    message: 'Empresa competitiva no setor'
  };

  if (advantageCount >= 3) {
    positioning = {
      zone: 'IDEAL',
      color: 'emerald',
      recommendation: 'COMPRA',
      message: 'Melhor empresa do setor'
    };
  } else if (advantageCount === 2) {
    positioning = {
      zone: 'BOA',
      color: 'emerald',
      recommendation: 'COMPRA',
      message: 'Empresa bem posicionada'
    };
  } else if (advantageCount === 1) {
    positioning = {
      zone: 'RAZOÁVEL',
      color: 'yellow',
      recommendation: 'MANTER',
      message: 'Empresa competitiva'
    };
  } else {
    positioning = {
      zone: 'FRACA',
      color: 'rose',
      recommendation: 'VENDA',
      message: 'Empresa menos competitiva'
    };
  }

  return (
    <>
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-white mb-4">
          🏭 {sector} (Setor)
        </h4>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-3 text-left text-xs text-white/50">Métrica</th>
              {peers.map((peer) => (
                <th key={peer.ticker} className="pb-3 text-center text-xs text-white/50">
                  {peer.ticker}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* P/L */}
            <tr className="border-b border-white/5">
              <td className="py-3 text-sm text-white">P/L</td>
              {peers.map((peer) => {
                const value = peer.ticker === ticker ? currentPe : peer.pe_ratio;
                const isBest = value === bestPe && value !== null;
                const isCurrentTicker = peer.ticker === ticker;
                
                return (
                  <td key={peer.ticker} className="py-3 text-center">
                    <span className={`text-sm ${isCurrentTicker ? 'font-semibold text-emerald-400' : 'text-white'}`}>
                      {value ? `${value.toFixed(1)}x` : 'N/D'} {isBest ? '✅' : ''}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* ROE */}
            <tr className="border-b border-white/5">
              <td className="py-3 text-sm text-white">ROE</td>
              {peers.map((peer) => {
                const value = peer.ticker === ticker ? currentRoe : peer.roe;
                const isBest = value === bestRoe && value !== null;
                const isCurrentTicker = peer.ticker === ticker;
                
                return (
                  <td key={peer.ticker} className="py-3 text-center">
                    <span className={`text-sm ${isCurrentTicker ? 'font-semibold text-emerald-400' : 'text-white'}`}>
                      {value ? `${value.toFixed(1)}%` : 'N/D'} {isBest ? '✅' : ''}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Yield */}
            <tr className="border-b border-white/5">
              <td className="py-3 text-sm text-white">Yield</td>
              {peers.map((peer) => {
                const value = peer.ticker === ticker ? currentYield : peer.dividend_yield;
                const isBest = value === bestYield && value !== null;
                const isCurrentTicker = peer.ticker === ticker;
                
                return (
                  <td key={peer.ticker} className="py-3 text-center">
                    <span className={`text-sm ${isCurrentTicker ? 'font-semibold text-emerald-400' : 'text-white'}`}>
                      {value ? `${value.toFixed(1)}%` : 'N/D'} {isBest ? '✅' : ''}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Dív/EBITDA */}
            <tr>
              <td className="py-3 text-sm text-white">Dív/EBITDA</td>
              {peers.map((peer) => {
                const value = peer.ticker === ticker ? currentDebt : peer.debt_to_ebitda;
                const isBest = value === bestDebt && value !== null;
                const isCurrentTicker = peer.ticker === ticker;
                
                return (
                  <td key={peer.ticker} className="py-3 text-center">
                    <span className={`text-sm ${isCurrentTicker ? 'font-semibold text-emerald-400' : 'text-white'}`}>
                      {value ? `${value.toFixed(1)}x` : 'N/D'} {isBest ? '✅' : ''}
                    </span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>

      {/* 🎯 POSICIONAMENTO DINÂMICO */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">🎯 Posicionamento</h4>
        <div className={`rounded-xl border p-6 ${
          positioning.color === 'emerald' 
            ? 'border-emerald-500/20 bg-emerald-500/5' 
            : positioning.color === 'yellow'
            ? 'border-yellow-500/20 bg-yellow-500/5'
            : 'border-rose-500/20 bg-rose-500/5'
        }`}>
          <div className={`text-lg font-bold mb-4 ${
            positioning.color === 'emerald' 
              ? 'text-emerald-400' 
              : positioning.color === 'yellow'
              ? 'text-yellow-400'
              : 'text-rose-400'
          }`}>
            {ticker} está na zona {positioning.zone}
          </div>
          
          {advantages.length > 0 ? (
            <div className="space-y-2 text-sm text-white/80">
              {advantages.map((advantage, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className={
                    positioning.color === 'emerald' 
                      ? 'text-emerald-400' 
                      : positioning.color === 'yellow'
                      ? 'text-yellow-400'
                      : 'text-rose-400'
                  }>✓</span>
                  <span>{advantage}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-white/60">
              Empresa não lidera em nenhuma métrica principal comparada aos concorrentes
            </div>
          )}
          
          <div className={`mt-6 pt-4 border-t ${
            positioning.color === 'emerald' 
              ? 'border-emerald-500/20' 
              : positioning.color === 'yellow'
              ? 'border-yellow-500/20'
              : 'border-rose-500/20'
          }`}>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                positioning.color === 'emerald' 
                  ? 'text-emerald-400' 
                  : positioning.color === 'yellow'
                  ? 'text-yellow-400'
                  : 'text-rose-400'
              }`}>
                {positioning.recommendation === 'COMPRA' ? '✅' : positioning.recommendation === 'VENDA' ? '❌' : '⚠️'} 
                {' '}Recomendação: {positioning.recommendation}
              </div>
              <div className="text-xs text-white/60 mt-2">{positioning.message}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
