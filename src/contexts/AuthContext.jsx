import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseEnabled } from '@/lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [plan, setPlan] = useState('free'); // 'free' ou 'pro'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseEnabled && supabase) {
      // Verificar sessão do Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          fetchUserPlan(session.user.id);
        }
        setLoading(false);
      });

      // Escutar mudanças de autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          fetchUserPlan(session.user.id);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setPlan('free');
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Fallback: usar localStorage
      const savedUser = localStorage.getItem('gambit_user');
      const savedPlan = localStorage.getItem('gambit_plan');
      
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
        setPlan(savedPlan || 'free');
      }
      setLoading(false);
    }
  }, []);

  const fetchUserPlan = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan_type, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (data && !error) {
        setPlan(data.plan_type);
      } else {
        setPlan('free');
      }
    } catch (err) {
      console.error('Erro ao buscar plano:', err);
      setPlan('free');
    }
  };

  const signup = async (email, password, name) => {
    try {
      if (isSupabaseEnabled && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name
            }
          }
        });

        if (error) throw error;

        return { success: true, data };
      } else {
        // Fallback: localStorage
        const users = JSON.parse(localStorage.getItem('gambit_users') || '[]');
        
        // Verificar se email já existe
        if (users.find(u => u.email === email)) {
          return { success: false, error: 'Email já cadastrado' };
        }

        const newUser = {
          id: Date.now().toString(),
          email,
          name,
          password, // Em produção, NUNCA salvar senha em texto puro!
          created_at: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('gambit_users', JSON.stringify(users));

        return { success: true, data: { user: newUser } };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      if (isSupabaseEnabled && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        return { success: true, data };
      } else {
        // Fallback: localStorage
        const users = JSON.parse(localStorage.getItem('gambit_users') || '[]');
        const foundUser = users.find(u => u.email === email && u.password === password);

        if (!foundUser) {
          return { success: false, error: 'Email ou senha incorretos' };
        }

        const userData = {
          id: foundUser.id,
          email: foundUser.email,
          user_metadata: { name: foundUser.name }
        };

        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('gambit_user', JSON.stringify(userData));

        return { success: true, data: { user: userData } };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    if (isSupabaseEnabled && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('gambit_user');
      localStorage.removeItem('gambit_plan');
    }
    setUser(null);
    setIsAuthenticated(false);
    setPlan('free');
  };

  const upgradeToPro = async (stripeSessionId) => {
    try {
      if (isSupabaseEnabled && supabase) {
        // Criar registro de assinatura no Supabase
        const { error } = await supabase
          .from('subscriptions')
          .insert([
            {
              user_id: user.id,
              plan_type: 'pro',
              status: 'active',
              stripe_session_id: stripeSessionId,
              started_at: new Date().toISOString()
            }
          ]);

        if (error) throw error;
      } else {
        // Fallback: localStorage
        localStorage.setItem('gambit_plan', 'pro');
      }

      setPlan('pro');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const isPro = plan === 'pro';

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      plan,
      isPro,
      loading,
      signup,
      login,
      logout,
      upgradeToPro
    }}>
      {children}
    </AuthContext.Provider>
  );
};
