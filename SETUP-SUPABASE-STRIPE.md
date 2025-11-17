# 🚀 SETUP SUPABASE + STRIPE

## 📋 **PASSO 1: Configurar Supabase**

### 1.1 Criar projeto no Supabase
1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta (se não tiver)
3. Clique em "New Project"
4. Escolha um nome (ex: `gambit-prod`)
5. Defina uma senha forte para o banco
6. Escolha a região mais próxima (ex: South America)
7. Aguarde a criação do projeto (~2 minutos)

### 1.2 Executar SQL Schema
1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor e clique em **RUN**
5. Verifique se apareceu "Success"

### 1.3 Obter credenciais
1. Vá em **Settings** → **API**
2. Copie:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon public** key (chave longa começando com `eyJ...`)

### 1.4 Configurar .env
Abra o arquivo `.env` e cole:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 💳 **PASSO 2: Configurar Stripe**

### 2.1 Criar conta no Stripe
1. Acesse [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Crie uma conta
3. Ative o **Test Mode** (toggle no canto superior direito)

### 2.2 Criar produto "Gambit Pro"
1. Vá em **Products** → **Add Product**
2. Preencha:
   - **Name:** Gambit Pro
   - **Description:** Acesso completo à análise avançada
   - **Pricing:** R$ 49,00 / mês (recorrente)
3. Clique em **Save Product**
4. Copie o **Price ID** (começa com `price_...`)

### 2.3 Obter chaves da API
1. Vá em **Developers** → **API Keys**
2. Copie a **Publishable key** (começa com `pk_test_...`)
3. Copie a **Secret key** (começa com `sk_test_...`)

### 2.4 Configurar .env
Adicione no arquivo `.env`:
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_sua_chave_aqui
VITE_STRIPE_PRICE_ID=price_seu_price_id_aqui
```

---

## 🔧 **PASSO 3: Testar localmente**

```bash
# 1. Instalar dependências (se ainda não fez)
npm install

# 2. Reiniciar servidor
npm run dev

# 3. Testar fluxo:
# - Clicar em "Upgrade para Pro"
# - Criar conta
# - Fazer login
# - Escolher plano Pro
```

---

## ✅ **CHECKLIST**

- [ ] Projeto criado no Supabase
- [ ] SQL schema executado
- [ ] Credenciais do Supabase no .env
- [ ] Conta criada no Stripe
- [ ] Produto "Gambit Pro" criado
- [ ] Chaves do Stripe no .env
- [ ] Testado criar conta
- [ ] Testado fazer login
- [ ] Testado upgrade para Pro

---

## 🆘 **PROBLEMAS COMUNS**

### Erro: "Invalid API key"
- Verifique se copiou a chave completa (sem espaços)
- Certifique-se de usar a chave **anon** (não a service_role)

### Erro: "Email not confirmed"
- Vá em Supabase → Authentication → Email Templates
- Desabilite "Confirm email" para testes

### Erro: "Stripe not defined"
- Verifique se instalou: `npm install @stripe/stripe-js`
- Reinicie o servidor: `npm run dev`

---

## 📞 **SUPORTE**

Se tiver dúvidas:
1. Verifique os logs do console (F12)
2. Verifique os logs do Supabase (Authentication → Logs)
3. Verifique os logs do Stripe (Developers → Logs)
