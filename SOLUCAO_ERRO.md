# ❌ ERRO: "Nenhum dado carregado"

## 🔍 DIAGNÓSTICO

O erro "Erro: [object Object]" e "Nenhum dado carregado" indica que:

1. A API não está rodando
2. A API foi atualizada mas não foi reiniciada
3. Há um erro de CORS ou conexão

---

## ✅ SOLUÇÃO EM 3 PASSOS

### **1. PARAR A API (se estiver rodando)**

No terminal onde a API está rodando:
- Pressionar **Ctrl + C**
- Aguardar parar completamente

### **2. REINICIAR A API**

```powershell
cd e:\gambit\api-mock
npm start
```

**Aguardar aparecer:**
```
🚀 ========================================
🚀 API Mock rodando!
🚀 ========================================
🚀 URL: http://localhost:3000
🚀 Health: http://localhost:3000/health
🚀 Exemplo: http://localhost:3000/api/v1/stocks/VALE3
🚀 ========================================
```

### **3. RECARREGAR O FRONTEND**

No browser:
- Pressionar **F5** ou **Ctrl + R**
- Aguardar recarregar completamente

---

## 🧪 TESTE RÁPIDO

### **1. Testar a API diretamente:**

Abrir novo terminal PowerShell:

```powershell
# Testar health check
curl http://localhost:3000/health

# Deve retornar:
# {"status":"ok","timestamp":"..."}

# Testar VALE3
curl http://localhost:3000/api/v1/stocks/VALE3

# Deve retornar JSON grande com dados

# Testar OIBR3
curl http://localhost:3000/api/v1/stocks/OIBR3

# Deve retornar JSON com dados genéricos
```

### **2. Se o curl não funcionar:**

A API NÃO está rodando! Voltar ao passo 2.

### **3. Se o curl funcionar mas o frontend não:**

Problema de CORS ou cache. Fazer:

1. Abrir DevTools (F12)
2. Ir na aba **Network**
3. Recarregar a página
4. Ver se aparece erro de CORS
5. Limpar cache: **Ctrl + Shift + Delete**

---

## 🔄 FLUXO CORRETO

```
1. Terminal 1: API rodando
   cd e:\gambit\api-mock
   npm start
   ↓
   🚀 API Mock rodando!

2. Terminal 2: Frontend rodando
   cd e:\gambit
   npm run dev
   ↓
   ➜ Local: http://localhost:5173

3. Browser: Acessar
   http://localhost:5173
   ↓
   Buscar: OIBR3
   ↓
   ✅ Dados aparecem!
```

---

## 📋 CHECKLIST

- [ ] API está rodando? (ver terminal)
- [ ] API responde no curl? (testar)
- [ ] Frontend está rodando? (ver terminal)
- [ ] Browser está em localhost:5173? (verificar URL)
- [ ] Cache foi limpo? (Ctrl + Shift + Delete)
- [ ] DevTools mostra erro? (F12 → Console)

---

## 🐛 SE AINDA NÃO FUNCIONAR

### **Verificar Console do Browser:**

1. Abrir DevTools (F12)
2. Ir na aba **Console**
3. Procurar por erros em vermelho
4. Copiar a mensagem de erro
5. Me enviar

### **Verificar Terminal da API:**

1. Ver se aparece:
   ```
   📊 Request para OIBR3
   🔄 Gerando dados genéricos para OIBR3
   ```

2. Se não aparecer nada:
   - API não está recebendo request
   - Problema de conexão

3. Se aparecer erro:
   - Copiar mensagem de erro
   - Me enviar

---

## 💡 DICA IMPORTANTE

**SEMPRE mantenha 2 terminais abertos:**

**Terminal 1 - API:**
```powershell
cd e:\gambit\api-mock
npm start
# DEIXAR RODANDO - NÃO FECHAR!
```

**Terminal 2 - Frontend:**
```powershell
cd e:\gambit
npm run dev
# DEIXAR RODANDO - NÃO FECHAR!
```

---

## 🚀 EXECUTE AGORA

1. **Parar API** (Ctrl + C)
2. **Reiniciar API** (npm start)
3. **Recarregar Frontend** (F5)
4. **Buscar OIBR3**
5. **Ver dados aparecerem!**

---

**SE SEGUIR ESSES PASSOS, VAI FUNCIONAR!** 🎉
