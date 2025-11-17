import { useState } from 'react';
import { useStock } from '@/contexts/StockContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const { 
    currentTicker, 
    stockData, 
    loading, 
    error,
    changeTicker 
  } = useStock();

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          🐛 Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="border-purple-500/50 bg-slate-900/95 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-purple-400">🐛 Debug Panel</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-2 text-xs">
            {/* Status */}
            <div className="rounded bg-slate-800 p-2">
              <div className="font-semibold text-white mb-1">Status:</div>
              <div className="flex items-center gap-2">
                {loading && <span className="text-yellow-400">⏳ Carregando...</span>}
                {!loading && stockData && <span className="text-green-400">✅ Dados carregados</span>}
                {!loading && !stockData && <span className="text-red-400">❌ Sem dados</span>}
                {error && <span className="text-red-400">❌ Erro: {error}</span>}
              </div>
            </div>

            {/* Ticker Atual */}
            <div className="rounded bg-slate-800 p-2">
              <div className="font-semibold text-white mb-1">Ticker Atual:</div>
              <div className="text-purple-300 font-mono">{currentTicker || 'N/A'}</div>
            </div>

            {/* Dados da API */}
            <div className="rounded bg-slate-800 p-2">
              <div className="font-semibold text-white mb-1">Dados da API:</div>
              {stockData ? (
                <div className="space-y-1 text-green-300">
                  <div>✅ Company: {stockData.company?.ticker}</div>
                  <div>✅ Nome: {stockData.company?.name}</div>
                  <div>✅ Preço: R$ {stockData.quote?.price?.toFixed(2)}</div>
                  <div>✅ ROE: {stockData.key_metrics?.roe?.toFixed(1)}%</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Fontes: {stockData._sources?.join(', ')}
                  </div>
                </div>
              ) : (
                <div className="text-red-300">❌ Nenhum dado carregado</div>
              )}
            </div>

            {/* Teste Rápido */}
            <div className="rounded bg-slate-800 p-2">
              <div className="font-semibold text-white mb-2">Teste Rápido:</div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => changeTicker('VALE3')}
                  className="flex-1 h-7 text-xs bg-blue-600 hover:bg-blue-700"
                >
                  VALE3
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => changeTicker('PETR4')}
                  className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700"
                >
                  PETR4
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => changeTicker('ITUB3')}
                  className="flex-1 h-7 text-xs bg-orange-600 hover:bg-orange-700"
                >
                  ITUB3
                </Button>
              </div>
            </div>

            {/* API URL */}
            <div className="rounded bg-slate-800 p-2">
              <div className="font-semibold text-white mb-1">API URL:</div>
              <div className="text-xs text-slate-400 break-all">
                {import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}
              </div>
            </div>

            {/* JSON Raw */}
            <details className="rounded bg-slate-800 p-2">
              <summary className="font-semibold text-white cursor-pointer">
                📄 JSON Raw (clique para expandir)
              </summary>
              <pre className="mt-2 text-xs text-slate-300 overflow-auto max-h-40">
                {JSON.stringify(stockData, null, 2)}
              </pre>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
