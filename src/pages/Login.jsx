import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        const result = await signup(email, password, name);
        if (result.success) {
          alert('Conta criada! Verifique seu email para confirmar.');
          setIsSignup(false);
        } else {
          setError(result.error);
        }
      } else {
        const result = await login(email, password);
        if (result.success) {
          navigate('/pricing');
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('Erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1E] via-[#0D1425] to-[#0A0F1E] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-white/10 bg-[#10192E]/80 backdrop-blur">
        <CardContent className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">🎯 Gambit</h1>
            <p className="text-white/60">
              {isSignup ? 'Crie sua conta' : 'Faça login para continuar'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="text-sm text-white/70 mb-2 block">Nome</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            )}

            <div>
              <label className="text-sm text-white/70 mb-2 block">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-white/70 mb-2 block">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-white/5 border-white/10 text-white"
              />
              {isSignup && (
                <p className="text-xs text-white/40 mt-1">Mínimo 6 caracteres</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#3E8FFF] hover:bg-[#2c75dc] text-white"
              disabled={loading}
            >
              {loading ? 'Processando...' : (isSignup ? 'Criar Conta' : 'Entrar')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-white/60">
            {isSignup ? 'Já tem conta?' : 'Não tem conta?'}{' '}
            <span 
              className="text-[#3E8FFF] cursor-pointer hover:underline"
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
            >
              {isSignup ? 'Fazer login' : 'Criar conta'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
