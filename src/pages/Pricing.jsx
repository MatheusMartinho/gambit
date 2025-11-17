import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export default function Pricing() {
  const { upgradeToPro, user } = useAuth();
  const navigate = useNavigate();

  const handleSelectPlan = (planType) => {
    if (planType === 'pro') {
      upgradeToPro();
    }
    navigate('/');
  };

  const plans = [
    {
      name: 'Freemium',
      price: 'R$ 0',
      period: '/mês',
      description: 'Para começar a investir',
      features: [
        'Análise básica de ações',
        'Dados fundamentalistas',
        'Histórico de preços',
        'Indicadores principais',
        'Até 10 consultas/dia'
      ],
      cta: 'Plano Atual',
      highlighted: false
    },
    {
      name: 'Pro',
      price: 'R$ 49',
      period: '/mês',
      description: 'Para investidores sérios',
      features: [
        'Tudo do Freemium',
        '🎓 Avaliação Avançada completa',
        'Análise DCF detalhada',
        'Comparação com peers',
        'Alertas de preço',
        'Consultas ilimitadas',
        'Suporte prioritário',
        'Relatórios exportáveis'
      ],
      cta: 'Upgrade para Pro',
      highlighted: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1E] via-[#0D1425] to-[#0A0F1E] p-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Escolha seu plano
          </h1>
          <p className="text-xl text-white/60">
            Olá, <span className="text-[#3E8FFF]">{user?.name}</span>! Selecione o plano ideal para você
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative border-2 ${
                plan.highlighted
                  ? 'border-[#3E8FFF] bg-gradient-to-br from-[#10192E] to-[#0D1425]'
                  : 'border-white/10 bg-[#10192E]/50'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#3E8FFF] text-white px-4 py-1 rounded-full text-sm font-semibold">
                    ⭐ Recomendado
                  </span>
                </div>
              )}

              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-white/60 text-sm">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/60">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-white/80">
                      <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan.name.toLowerCase())}
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-[#3E8FFF] hover:bg-[#2c75dc] text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  disabled={!plan.highlighted}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-white/60 hover:text-white"
          >
            ← Voltar para análise
          </Button>
        </div>
      </div>
    </div>
  );
}
