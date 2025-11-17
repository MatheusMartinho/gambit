const NodeCache = require('node-cache');
const cache = new NodeCache();

console.log('🗑️  Limpando cache...');
cache.flushAll();
console.log('✅ Cache limpo com sucesso!');
console.log('\n🔄 Agora reinicie o servidor com: npm run dev:mock');
