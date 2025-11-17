import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const StockChart = ({ priceHistory, currentPrice, ticker }) => {
  const [period, setPeriod] = useState('1M');
  const [chartReady, setChartReady] = useState(false);
  const chartId = useMemo(() => `tradingview_chart_${ticker || 'main'}`, [ticker]);

  const periods = [
    { label: '1d', value: '1D' },
    { label: '5d', value: '5D' },
    { label: '1m', value: '1M' },
    { label: '6m', value: '6M' },
    { label: '1a', value: '1Y' }
  ];

  useEffect(() => {
    if (window.TradingView) {
      setChartReady(true);
      return undefined;
    }

    let script = document.querySelector('script[data-tradingview]');
    let appended = false;

    if (!script) {
      script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.dataset.tradingview = 'true';
      script.onload = () => setChartReady(true);
      document.body.appendChild(script);
      appended = true;
    } else if (window.TradingView) {
      setChartReady(true);
    } else {
      script.addEventListener('load', () => setChartReady(true), { once: true });
    }

    return () => {
      if (appended && script?.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (chartReady && ticker && window.TradingView) {
      const container = document.getElementById(chartId);
      if (container) {
        container.innerHTML = '';
      }
      new window.TradingView.widget({
        "width": "100%",
        "height": 400,
        "symbol": `BMFBOVESPA:${ticker.replace(/\d/g, '')}${ticker.match(/\d+/)?.[0] || ''}`,
        "interval": period === '1D' ? '5' : 'D',
        "timezone": "America/Sao_Paulo",
        "theme": "dark",
        "style": "1",
        "locale": "br",
        "toolbar_bg": "#0A0F1E",
        "enable_publishing": false,
        "hide_side_toolbar": false,
        "allow_symbol_change": false,
        "container_id": chartId,
        "backgroundColor": "#0A0F1E",
        "gridColor": "#1f2a44",
        "hide_top_toolbar": false,
        "hide_legend": false,
        "save_image": false
      });
    }
  }, [chartReady, ticker, period, chartId]);

  return (
    <Card className="rounded-2xl border-white/10 bg-[#0A0F1E]/50">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm uppercase tracking-wide text-white/50">📈 Gráfico {ticker}</div>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-2xl font-bold text-white">
                R$ {currentPrice?.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            {periods.map(p => (
              <Button
                key={p.label}
                onClick={() => setPeriod(p.value)}
                variant="ghost"
                size="sm"
                className={`h-7 px-2 text-xs ${
                  period === p.value 
                    ? 'bg-[#3E8FFF] text-white hover:bg-[#3E8FFF]/80' 
                    : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {/* TradingView Widget */}
        <div id={chartId} style={{ height: '400px' }}></div>
        {!chartReady && (
          <div className="mt-4 text-center text-xs text-white/40">
            Carregando gráfico em tempo real...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockChart;
