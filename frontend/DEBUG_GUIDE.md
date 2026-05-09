# 🐛 Guia de Depuração - ReUse

## 🎯 Ferramentas Disponíveis

### 1. React DevTools (Built-in)

**Como usar:**
```bash
npx expo start
# Pressione 'j' para abrir DevTools
```

**O que você pode fazer:**
- ✅ Inspecionar componentes React
- ✅ Ver props e state em tempo real
- ✅ Profiler de performance
- ✅ Buscar componentes por nome

---

### 2. Console Logs

**Boas práticas:**
```typescript
// ✅ Use emojis para identificar rápido
console.log('📡 API chamada:', endpoint);
console.log('✅ Sucesso:', data);
console.warn('⚠️ Atenção:', warning);
console.error('❌ Erro:', error);

// ✅ Use console.table para arrays/objetos
console.table(listings);

// ✅ Use console.group para organizar
console.group('🔐 Login Flow');
console.log('Email:', email);
console.log('OTP enviado');
console.groupEnd();

// ✅ Tempo de execução
console.time('fetch-listings');
await fetchListings();
console.timeEnd('fetch-listings'); // → fetch-listings: 234ms
```

---

### 3. TanStack Query DevTools

**Já configurado!** Visualize:
- Cache de queries
- Estado de loading/error
- Refetch automático
- Invalidação de cache

**Ver no console:**
```typescript
// Adicione ao QueryClient:
const queryClient = new QueryClient({
  logger: {
    log: console.log,
    warn: console.warn,
    error: console.error,
  },
});
```

---

### 4. Network Inspector

**Automático!** Todas as requisições HTTP aparecem no terminal:

```
GET /api/listings 200 OK (234ms)
POST /api/chat/messages 201 Created (123ms)
GET /api/users/me 401 Unauthorized (45ms)
```

---

### 5. Expo DevTools

**Comandos úteis:**
```bash
npx expo start

# Depois pressione:
j → React DevTools
m → Menu de opções
r → Reload app
shift+m → Mais opções
d → Dev menu no simulador
```

---

## 🔍 Cenários Comuns de Debug

### 1. API não responde

**Passos:**
```typescript
// 1. Verificar URL da API
console.log('API URL:', process.env.EXPO_PUBLIC_API_URL);

// 2. Verificar token
import { supabase } from '@/src/services/supabase';
const { data } = await supabase.auth.getSession();
console.log('Token:', data.session?.access_token);

// 3. Ver erro completo
try {
  await api.get('/listings');
} catch (error) {
  console.error('Erro completo:', error);
  console.error('Response:', error.response?.data);
}
```

### 2. Componente não re-renderiza

**Debug:**
```typescript
// Adicione console.log no componente
export function MyComponent() {
  console.log('🔄 MyComponent renderizou');
  
  useEffect(() => {
    console.log('✨ Effect executou');
  }, [deps]);
  
  return ...;
}
```

### 3. Estado não atualiza

**Verificar:**
```typescript
const [value, setValue] = useState(0);

// ❌ Errado (não atualiza)
const increment = () => {
  setValue(value + 1);
  setValue(value + 1); // Ainda usa valor antigo!
};

// ✅ Correto
const increment = () => {
  setValue(prev => prev + 1);
  setValue(prev => prev + 1);
};

// Debug
useEffect(() => {
  console.log('Value mudou:', value);
}, [value]);
```

### 4. Supabase Storage não faz upload

**Debug:**
```typescript
import { uploadImages } from '@/src/services/supabaseStorage';

try {
  console.log('📸 Iniciando upload:', uris.length, 'imagens');
  const urls = await uploadImages(uris);
  console.log('✅ Upload concluído:', urls);
} catch (error) {
  console.error('❌ Erro no upload:', error.message);
  console.error('Detalhes:', error);
}
```

---

## 🚀 Flipper (Opcional - Avançado)

**Quando usar:**
- Debug de rede avançado
- Inspeção de banco local
- Profile de performance

**Como instalar:**
1. Download: https://fbflipper.com/
2. Ejetar Expo: `npx expo prebuild`
3. Rodar app: `npx expo run:ios`
4. Abrir Flipper → conecta automaticamente

**Plugins úteis:**
- 📡 Network - Ver todas requisições HTTP
- 📝 Logs - Ver console.log organizados
- 🎨 Layout - Inspecionar UI
- 💾 Database - Ver AsyncStorage/SecureStore
- ⚡ Performance - Medir FPS e renderizações

---

## 📊 Performance Profiling

### Medir tempo de renderização:

```typescript
import { Profiler } from 'react';

function onRenderCallback(
  id, // nome do Profiler
  phase, // "mount" ou "update"
  actualDuration, // tempo da renderização
) {
  console.log(`⏱️ ${id} ${phase}: ${actualDuration}ms`);
}

<Profiler id="ListingsList" onRender={onRenderCallback}>
  <ListingsList />
</Profiler>
```

---

## 🎯 Checklist de Debug

Antes de pedir ajuda, verifique:

- [ ] Console do terminal tem erros?
- [ ] React DevTools mostra o componente?
- [ ] Network request está falhando? (ver terminal)
- [ ] Token JWT está válido?
- [ ] Variáveis de ambiente estão corretas?
- [ ] App foi reloadado após mudança de código?
- [ ] Testes passam? (`yarn test`)

---

## 📚 Links Úteis

- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Expo DevTools](https://docs.expo.dev/debugging/tools/)
- [TanStack Query DevTools](https://tanstack.com/query/latest/docs/framework/react/devtools)
- [Flipper](https://fbflipper.com/)

---

**Última atualização:** Maio 2026
