# 🐛 GUIA DE DEBUG - Dados Dinâmicos

## ⚠️ PROBLEMA ATUAL

Os dados não estão mudando quando você busca uma nova ação.

---

## 🔍 VERIFICAÇÕES PASSO A PASSO

### **1. Verificar se a API está rodando**

```bash
# Terminal 1 - Verificar API
curl http://localhost:3000/health

# Deve retornar:
# {"status":"ok","timestamp":"..."}
```

Se não funcionar:
```bash
cd e:\gambit\api
npm run dev
```

---

### **2. Verificar se o StockContext está funcionando**

Abra o browser em http://localhost:5173 e:

1. **Abrir DevTools** (F12)
2. **Ir para Console**
3. **Buscar "ITUB3"**
4. **Verificar logs**:

**✅ LOGS ESPERADOS:**
```
🔍 Buscando: ITUB3
🔄 Mudando ticker de VALE3 para ITUB3
🔄 Carregando dados de ITUB3...
✅ Overview carregado: {company: {...}, quote: {...}}
✅ Dados de ITUB3 carregados com sucesso!
🔍 Analysis recalculando... {hasStockData: true, stockDataTicker: "ITUB3", ...}
✅ Usando dados da API: ITUB3
📊 Analysis gerado: {ticker: "ITUB3", empresa: "Itaú Unibanco", ...}
```

**❌ SE APARECER:**
```
⚠️ Usando fallback/hook antigo
```
**Significa que stockData está null/undefined!**

---

### **3. Verificar Network Requests**

1. **DevTools** → **Network** tab
2. **Buscar "ITUB3"**
3. **Procurar request**: `stocks/ITUB3`

**✅ ESPERADO:**
- Request: `GET http://localhost:3000/api/v1/stocks/ITUB3`
- Status: `200 OK`
- Response: JSON com dados da ação

**❌ SE NÃO APARECER:**
- StockContext não está fazendo a chamada
- Verificar se App.jsx tem `<StockProvider>`

---

### **4. Verificar React DevTools**

1. **Instalar**: [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
2. **Abrir DevTools** → **Components** tab
3. **Procurar**: `StockProvider`
4. **Verificar props/state**:

```javascript
StockProvider
  value: {
    currentTicker: "ITUB3",
    stockData: {
      company: { ticker: "ITUB3", name: "Itaú Unibanco" },
      quote: { price: 38.11, ... },
      // ... mais dados
    },
    loading: false,
    error: null
  }
```

**❌ SE stockData for null:**
- API não está retornando dados
- Verificar erro no console

---

### **5. Verificar se .env está correto**

```bash
# Verificar arquivo .env
cat e:\gambit\.env

# Deve conter:
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

**Se não existir:**
```bash
cd e:\gambit
cp .env.example .env
```

---

## 🔧 SOLUÇÕES COMUNS

### **Problema 1: API não está rodando**

```bash
cd e:\gambit\api
npm install
npm run dev
```

### **Problema 2: StockProvider não está envolvendo o App**

Verificar `e:\gambit\src\App.jsx`:

```jsx
import { StockProvider } from "./contexts/StockContext.jsx";

function App() {
  return (
    <StockProvider>  {/* ← DEVE TER ISSO */}
      <Screen />
    </StockProvider>
  );
}
```

### **Problema 3: Context não está sendo importado**

Verificar `e:\gambit\src\Screen.jsx`:

```jsx
import { useStock } from "@/contexts/StockContext";  // ← DEVE TER

const Screen = () => {
  const { stockData, changeTicker } = useStock();  // ← DEVE TER
  // ...
}
```

### **Problema 4: CORS bloqueando**

Se aparecer erro de CORS no console:

```bash
# Verificar se API tem CORS habilitado
# e:\gambit\api\src\server.js deve ter:
app.use(cors());
```

### **Problema 5: Porta errada**

Verificar se API está em `localhost:3000` e frontend em `localhost:5173`:

```bash
# API
cd e:\gambit\api
npm run dev
# Deve mostrar: Server running on http://localhost:3000

# Frontend
cd e:\gambit
npm run dev
# Deve mostrar: Local: http://localhost:5173/
```

---

## 🧪 TESTE MANUAL

### **Teste 1: Verificar API diretamente**

```bash
# Testar endpoint
curl http://localhost:3000/api/v1/stocks/ITUB3

# Deve retornar JSON grande com:
{
  "success": true,
  "data": {
    "company": {
      "ticker": "ITUB3",
      "name": "Itaú Unibanco",
      ...
    },
    "quote": {
      "price": 38.11,
      ...
    }
  }
}
```

### **Teste 2: Verificar Context no Console**

No console do browser, digite:

```javascript
// Verificar se Context existe
window.__REACT_DEVTOOLS_GLOBAL_HOOK__
```

### **Teste 3: Forçar reload**

1. Buscar "VALE3"
2. Abrir Console
3. Digitar: `location.reload()`
4. Buscar "ITUB3"
5. Verificar logs

---

## 📋 CHECKLIST DE VERIFICAÇÃO

Marque cada item conforme verifica:

- [ ] API rodando em `localhost:3000`
- [ ] Frontend rodando em `localhost:5173`
- [ ] `.env` existe e está correto
- [ ] `App.jsx` tem `<StockProvider>`
- [ ] `Screen.jsx` importa `useStock`
- [ ] Console mostra logs de carregamento
- [ ] Network mostra request para API
- [ ] Response da API tem status 200
- [ ] Response tem dados da ação
- [ ] React DevTools mostra `stockData` preenchido
- [ ] Logs mostram "✅ Usando dados da API"
- [ ] Nome da empresa muda na UI
- [ ] Ticker muda na UI
- [ ] Preço muda na UI

---

## 🆘 SE NADA FUNCIONAR

### **Reset Completo:**

```bash
# 1. Parar tudo (Ctrl+C em todos os terminais)

# 2. Limpar cache
cd e:\gambit
rm -rf node_modules
rm -rf .vite
npm install

cd e:\gambit\api
rm -rf node_modules
npm install

# 3. Verificar .env
cat e:\gambit\.env
# Deve ter: VITE_API_BASE_URL=http://localhost:3000/api/v1

# 4. Iniciar API
cd e:\gambit\api
npm run dev

# 5. Iniciar Frontend (novo terminal)
cd e:\gambit
npm run dev

# 6. Abrir browser
# http://localhost:5173

# 7. Abrir Console (F12)

# 8. Buscar "ITUB3"

# 9. Verificar logs
```

---

## 📞 INFORMAÇÕES PARA DEBUG

Se ainda não funcionar, copie e cole isso:

```javascript
// Cole isso no Console do browser:
console.log('=== DEBUG INFO ===');
console.log('URL:', window.location.href);
console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Has StockProvider:', !!document.querySelector('[data-provider="stock"]'));

// Teste API manualmente:
fetch('http://localhost:3000/api/v1/stocks/ITUB3')
  .then(r => r.json())
  .then(d => console.log('API Response:', d))
  .catch(e => console.error('API Error:', e));
```

---

## ✅ RESULTADO ESPERADO

Quando funcionar, você verá:

1. **Console**:
   ```
   🔍 Buscando: ITUB3
   🔄 Carregando dados de ITUB3...
   ✅ Overview carregado
   ✅ Usando dados da API: ITUB3
   ```

2. **UI**:
   - Nome: "Itaú Unibanco"
   - Ticker: "ITUB3"
   - Preço: ~38.11
   - ROE: ~22.5%
   - P/L: ~8.5x

3. **Network**:
   - Request para `/api/v1/stocks/ITUB3`
   - Status 200
   - Response com dados

**Quando isso acontecer, os dados estarão DINÂMICOS!** 🎉
