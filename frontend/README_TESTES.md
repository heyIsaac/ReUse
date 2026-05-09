# 🧪 Sistema de Testes - ReUse

## 📊 Status Atual

```
✅ Jest configurado
✅ React Native Testing Library configurado
✅ 16 testes criados (13 passando)
✅ 4 suites de teste
✅ Coverage configurado
⏳ Detox (E2E) - Pendente instalação
```

## 🛠️ Ferramentas Instaladas

### 1️⃣ **Jest** - Testes Unitários
Framework de teste JavaScript para testar lógica isolada.

**O que testar:**
- ✅ Hooks customizados (`useEmailAuth`, `useFavorites`)
- ✅ Serviços (`api.ts`, `supabaseStorage.ts`)
- ✅ Funções utilitárias
- ✅ Validações e transformações

**Exemplo:**
```typescript
describe('useEmailAuth', () => {
  it('deve validar email inválido', () => {
    const { result } = renderHook(() => useEmailAuth());
    const success = await result.current.signInWithEmail('invalido');
    expect(success).toBe(false);
  });
});
```

---

### 2️⃣ **React Native Testing Library** - Testes de Componentes
Teste como o usuário interage com a interface.

**O que testar:**
- ✅ Componentes UI (`Button`, `SearchBar`, `ProductCard`)
- ✅ Formulários e validações
- ✅ Interações (clique, input, scroll)
- ✅ Renderização condicional

**Exemplo:**
```typescript
describe('Button', () => {
  it('deve chamar onPress quando clicado', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Button onPress={onPress}>Clique</Button>
    );
    
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

---

### 3️⃣ **Detox** - Testes E2E (End-to-End)
Simula o usuário real navegando pelo app inteiro.

**O que testar:**
- ✅ Fluxos completos (Login → Criar anúncio → Chat → QR Code)
- ✅ Navegação entre telas
- ✅ Integrações nativas (Câmera, GPS, Permissões)
- ✅ Cenários críticos de negócio

**Exemplo:**
```typescript
describe('Fluxo de Login', () => {
  it('deve fazer login com email e OTP', async () => {
    await element(by.id('email-input')).typeText('teste@example.com');
    await element(by.id('login-button')).tap();
    
    await waitFor(element(by.id('otp-screen'))).toBeVisible();
    
    await element(by.id('otp-input')).typeText('123456');
    await element(by.id('verify-button')).tap();
    
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});
```

---

## 🚀 Como Usar

### Comandos Principais

```bash
# Rodar todos os testes
yarn test

# Modo watch (auto re-executa)
yarn test:watch

# Com cobertura de código
yarn test:coverage

# Debug
yarn test:debug
```

### Estrutura de Arquivos

```
__tests__/
├── hooks/                    # Testes de hooks customizados
│   └── useEmailAuth.test.ts
├── services/                 # Testes de serviços/APIs
│   ├── api.test.ts
│   └── supabaseStorage.test.ts
├── components/               # Testes de componentes UI
│   └── Button.test.tsx
└── e2e/                      # Testes End-to-End (Detox)
    └── login.test.ts
```

---

## 📈 Pirâmide de Testes

```
           /\
          /  \     ← E2E (Detox)
         /    \      Poucos, lentos, caros
        /------\     Fluxos críticos
       /        \
      /  Unit &  \  ← Jest + RNTL
     /  Component \   Muitos, rápidos, baratos
    /    Tests    \  70-80% dos testes
   /              \
  /________________\
```

**Distribuição recomendada:**
- 🟢 **70%** - Unitários + Componentes (Jest + RNTL)
- 🟡 **20%** - Integração
- 🔴 **10%** - E2E (Detox)

---

## ✅ Exemplos Práticos

### Testar Hook de Autenticação

```typescript
// __tests__/hooks/useEmailAuth.test.ts
import { renderHook } from '@testing-library/react-native';
import { useEmailAuth } from '@/src/hooks/useEmailAuth';

describe('useEmailAuth', () => {
  it('deve validar email inválido', async () => {
    const showToast = jest.fn();
    const { result } = renderHook(() => useEmailAuth(showToast));

    const success = await result.current.signInWithEmail('email-invalido');

    expect(success).toBe(false);
    expect(result.current.hasError).toBe(true);
    expect(showToast).toHaveBeenCalledWith(
      '⚠️ Digite um e-mail válido para continuar.',
      'error'
    );
  });
});
```

### Testar Componente de Busca

```typescript
// __tests__/components/SearchBar.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '@/components/home/search-bar';

describe('SearchBar', () => {
  it('deve filtrar ao digitar', () => {
    const onSearchMock = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar onSearch={onSearchMock} />
    );

    const input = getByPlaceholderText('Buscar...');
    fireEvent.changeText(input, 'cadeira');

    expect(onSearchMock).toHaveBeenCalledWith('cadeira');
  });

  it('deve limpar busca', () => {
    const onSearchMock = jest.fn();
    const { getByPlaceholderText, getByTestId } = render(
      <SearchBar onSearch={onSearchMock} />
    );

    fireEvent.changeText(getByPlaceholderText('Buscar...'), 'mesa');
    fireEvent.press(getByTestId('clear-button'));

    expect(onSearchMock).toHaveBeenCalledWith('');
  });
});
```

### Testar Upload de Imagem

```typescript
// __tests__/services/supabaseStorage.test.ts
import { uploadImages } from '@/src/services/supabaseStorage';
import { supabase } from '@/src/services/supabase';

jest.mock('@/src/services/supabase');

describe('Upload de Imagens', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        blob: () => Promise.resolve(new Blob()),
      })
    );
  });

  it('deve fazer upload de múltiplas imagens', async () => {
    const mockUpload = jest.fn().mockResolvedValue({ error: null });
    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: jest.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/image.jpg' },
      }),
    });

    const uris = ['file:///img1.jpg', 'file:///img2.jpg'];
    const result = await uploadImages(uris);

    expect(result).toHaveLength(2);
    expect(mockUpload).toHaveBeenCalledTimes(2);
  });
});
```

---

## 🎯 Melhores Práticas

### 1. **Organize por funcionalidade**

```
✅ Bom
__tests__/
├── hooks/
│   ├── useEmailAuth.test.ts
│   └── useFavorites.test.ts
└── services/
    └── api.test.ts

❌ Ruim
__tests__/
├── test1.ts
├── test2.ts
└── test3.ts
```

### 2. **Descrições claras e específicas**

```typescript
✅ Bom
it('deve validar email inválido', () => { ... })
it('deve enviar OTP para email válido', () => { ... })

❌ Ruim
it('works', () => { ... })
it('test 1', () => { ... })
```

### 3. **Use AAA Pattern**

```typescript
it('deve adicionar favorito', async () => {
  // Arrange - Preparar
  const { result } = renderHook(() => useFavorites());
  const itemId = 123;

  // Act - Executar
  await act(async () => {
    await result.current.addFavorite(itemId);
  });

  // Assert - Verificar
  expect(result.current.favorites).toContain(itemId);
});
```

### 4. **Teste comportamento, não implementação**

```typescript
// ✅ Testa o que o usuário vê
it('deve exibir erro de email obrigatório', () => {
  const { getByText } = render(<LoginForm />);
  fireEvent.press(getByText('Entrar'));
  expect(getByText('Email obrigatório')).toBeVisible();
});

// ❌ Testa detalhes internos
it('deve chamar setState com email', () => {
  const spy = jest.spyOn(React, 'useState');
  render(<LoginForm />);
  expect(spy).toHaveBeenCalled();
});
```

### 5. **Limpe mocks entre testes**

```typescript
describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('teste 1', () => { ... });
  it('teste 2', () => { ... });
});
```

---

## 📚 Documentação

- 📖 **[TESTING.md](./TESTING.md)** - Guia completo (3500+ linhas)
- 🚀 **[QUICK_START_TESTES.md](./QUICK_START_TESTES.md)** - Início rápido
- 🧪 **[README_TESTES.md](./README_TESTES.md)** - Este arquivo

---

## 🔧 Troubleshooting

### Erro: Cannot find module '@/...'

```bash
# Verificar jest.config.js
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

### Erro: Mock not working

```bash
# Limpar cache
yarn test --clearCache
```

### Testes lentos

```bash
# Rodar em paralelo (padrão)
yarn test

# Rodar um por vez (debug)
yarn test --runInBand
```

---

## 📊 Coverage Report

```bash
# Gerar relatório
yarn test:coverage

# Ver no navegador
open coverage/lcov-report/index.html
```

**Metas de cobertura:**
- 🎯 **80%+** - Lógica crítica (auth, pagamento)
- 🎯 **60%+** - Funcionalidades gerais
- 🎯 **40%+** - Componentes UI

---

## 🚦 CI/CD Integration

### GitHub Actions

Crie `.github/workflows/test.yml`:

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: yarn install
      - run: yarn test:coverage
      - uses: codecov/codecov-action@v3
```

---

## 🎓 Recursos de Aprendizado

- [Jest Docs](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Docs](https://wix.github.io/Detox/)
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Última atualização:** Maio 2026  
**Status:** ✅ Configurado e funcional  
**Próximos passos:** Adicionar mais testes e configurar Detox (E2E)
