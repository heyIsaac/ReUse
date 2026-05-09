# 🧪 Guia de Testes - ReUse

Este guia cobre as três ferramentas de teste implementadas no projeto: **Jest**, **React Native Testing Library** e **Detox**.

---

## 📋 Índice

1. [Jest - Testes Unitários](#jest---testes-unitários)
2. [React Native Testing Library - Testes de Componentes](#react-native-testing-library---testes-de-componentes)
3. [Detox - Testes E2E](#detox---testes-e2e)
4. [Executando os Testes](#executando-os-testes)
5. [Melhores Práticas](#melhores-práticas)

---

## 🎯 Jest - Testes Unitários

O **Jest** é usado para testar funções isoladas, hooks customizados e lógica de negócio.

### Estrutura de Teste

```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import { useEmailAuth } from '@/src/hooks/useEmailAuth';

describe('useEmailAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve validar email inválido', async () => {
    const showToast = jest.fn();
    const { result } = renderHook(() => useEmailAuth(showToast));

    const success = await result.current.signInWithEmail('email-invalido');

    expect(success).toBe(false);
    expect(result.current.hasError).toBe(true);
  });
});
```

### O que testar com Jest?

✅ **Hooks customizados** (`useEmailAuth`, `useFavorites`, `useUserProfile`)
- Validações de entrada
- Chamadas de API
- Estados e side effects

✅ **Serviços** (`api.ts`, `supabaseStorage.ts`)
- Interceptors
- Transformação de dados
- Tratamento de erros

✅ **Funções utilitárias**
- Formatação de dados
- Validações
- Helpers

### Exemplo: Testar Hook

```typescript
// __tests__/hooks/useFavorites.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useFavorites } from '@/src/hooks/useFavorites';

describe('useFavorites', () => {
  it('deve adicionar item aos favoritos', async () => {
    const { result } = renderHook(() => useFavorites());

    await act(async () => {
      await result.current.addFavorite(123);
    });

    expect(result.current.favorites).toContain(123);
  });
});
```

---

## 🧩 React Native Testing Library - Testes de Componentes

A **React Native Testing Library** foca em testar como o usuário interage com os componentes.

### Princípios

1. **Teste como o usuário usa**: não teste detalhes de implementação
2. **Use queries por acessibilidade**: `getByRole`, `getByLabelText`
3. **Simule interações reais**: `fireEvent.press`, `fireEvent.changeText`

### Estrutura de Teste

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('deve chamar onPress quando clicado', () => {
    const onPressMock = jest.fn();
    const { getByRole } = render(
      <Button onPress={onPressMock}>
        <Text>Clique aqui</Text>
      </Button>
    );

    fireEvent.press(getByRole('button'));

    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
```

### O que testar com RNTL?

✅ **Componentes de UI**
- Renderização condicional
- Interações do usuário (clique, input)
- Estados visuais (loading, erro, sucesso)

✅ **Formulários**
- Validação em tempo real
- Submissão
- Mensagens de erro

✅ **Navegação**
- Redirecionamentos
- Passagem de parâmetros

### Exemplo: Testar Componente com Estado

```typescript
// __tests__/components/SearchBar.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '@/components/home/search-bar';

describe('SearchBar', () => {
  it('deve chamar onSearch ao digitar', () => {
    const onSearchMock = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar onSearch={onSearchMock} />
    );

    const input = getByPlaceholderText('Buscar...');
    fireEvent.changeText(input, 'cadeira');

    expect(onSearchMock).toHaveBeenCalledWith('cadeira');
  });

  it('deve limpar busca ao clicar no X', () => {
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

### Queries Disponíveis

```typescript
// Por role (preferido)
getByRole('button')

// Por texto
getByText('Entrar')

// Por placeholder
getByPlaceholderText('Digite seu email')

// Por testID
getByTestId('login-button')

// Por label
getByLabelText('Email')
```

---

## 🚀 Detox - Testes E2E (End-to-End)

O **Detox** simula o fluxo completo do usuário no app real, incluindo navegação, API e dispositivo.

### Instalação (necessária)

```bash
cd frontend

# Instalar Detox CLI globalmente
npm install -g detox-cli

# Instalar dependências do Detox
yarn add -D detox jest-circus

# Configurar Detox
detox init
```

### Configuração

Adicione ao `package.json`:

```json
{
  "detox": {
    "test-runner": "jest",
    "runner-config": "e2e/config.json",
    "configurations": {
      "ios.sim.debug": {
        "device": {
          "type": "iPhone 15"
        },
        "app": "ios.debug"
      },
      "android.emu.debug": {
        "device": {
          "avdName": "Pixel_7_API_34"
        },
        "app": "android.debug"
      }
    },
    "apps": {
      "ios.debug": {
        "type": "ios.app",
        "build": "npx expo run:ios --configuration Debug",
        "binaryPath": "ios/build/Build/Products/Debug-iphonesimulator/ReUse.app"
      },
      "android.debug": {
        "type": "android.apk",
        "build": "npx expo run:android --variant debug",
        "binaryPath": "android/app/build/outputs/apk/debug/app-debug.apk"
      }
    }
  }
}
```

### Estrutura de Teste E2E

```typescript
// e2e/login.test.ts
describe('Fluxo de Login', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('deve fazer login com email e OTP', async () => {
    // 1. Inserir email
    await element(by.id('email-input')).typeText('teste@example.com');
    await element(by.id('login-button')).tap();

    // 2. Aguardar tela de OTP
    await waitFor(element(by.id('otp-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // 3. Inserir OTP
    await element(by.id('otp-input')).typeText('123456');
    await element(by.id('verify-button')).tap();

    // 4. Verificar home
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});
```

### O que testar com Detox?

✅ **Fluxos críticos**
- Login completo (email + OTP + cadastro)
- Criação de anúncio (fotos + dados + GPS)
- Chat (enviar mensagem + QR Code)

✅ **Navegação entre telas**
- Tabs do bottom navigation
- Stack navigation
- Deep links

✅ **Integrações nativas**
- Câmera (fotos e QR scanner)
- GPS/Mapa
- Permissões

### Exemplo: Testar Criação de Anúncio

```typescript
// e2e/create-listing.test.ts
describe('Criar Anúncio', () => {
  beforeAll(async () => {
    await device.launchApp();
    // Fazer login primeiro
    await loginHelper('teste@example.com');
  });

  it('deve criar anúncio completo', async () => {
    // Navegar para criação
    await element(by.id('create-listing-button')).tap();

    // Adicionar foto (simular)
    await element(by.id('add-photo-button')).tap();
    await element(by.text('Galeria')).tap();

    // Preencher dados
    await element(by.id('title-input')).typeText('Cadeira de escritório');
    await element(by.id('description-input')).typeText('Pouco uso, excelente estado');

    // Selecionar categoria
    await element(by.id('category-selector')).tap();
    await element(by.text('Móveis')).tap();

    // Selecionar condição
    await element(by.id('condition-good')).tap();

    // Publicar
    await element(by.id('publish-button')).tap();

    // Verificar sucesso
    await expect(element(by.text('Anúncio publicado!'))).toBeVisible();
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('deve validar campos obrigatórios', async () => {
    await element(by.id('create-listing-button')).tap();
    await element(by.id('publish-button')).tap();

    await expect(element(by.text('Adicione pelo menos uma foto'))).toBeVisible();
  });
});
```

### Matchers do Detox

```typescript
// Visibilidade
await expect(element(by.id('login-button'))).toBeVisible();
await expect(element(by.id('modal'))).toBeNotVisible();

// Existência
await expect(element(by.text('Bem-vindo'))).toExist();

// Valor
await expect(element(by.id('email-input'))).toHaveText('teste@example.com');

// Estado
await expect(element(by.id('submit-button'))).toBeDisabled();
```

### Ações do Detox

```typescript
// Tap
await element(by.id('button')).tap();

// Digitar
await element(by.id('input')).typeText('texto');
await element(by.id('input')).replaceText('novo texto');

// Scroll
await element(by.id('scroll-view')).scrollTo('bottom');
await element(by.id('item')).swipe('left');

// Esperar
await waitFor(element(by.id('loading')))
  .toBeVisible()
  .withTimeout(5000);
```

---

## ▶️ Executando os Testes

### Jest (Unitários e Componentes)

```bash
# Rodar todos os testes
yarn test

# Modo watch (roda ao salvar arquivos)
yarn test:watch

# Com coverage (cobertura de código)
yarn test:coverage

# Rodar teste específico
yarn test useEmailAuth

# Debug mode
yarn test:debug
```

### Detox (E2E)

```bash
# Build do app (necessário apenas uma vez ou após mudanças nativas)
detox build --configuration ios.sim.debug

# Rodar testes iOS
detox test --configuration ios.sim.debug

# Rodar testes Android
detox test --configuration android.emu.debug

# Rodar teste específico
detox test e2e/login.test.ts --configuration ios.sim.debug

# Modo debug (abre o app e pausa)
detox test --configuration ios.sim.debug --debug-synchronization
```

---

## ✅ Melhores Práticas

### 1. **Organize os testes por funcionalidade**

```
__tests__/
├── hooks/
│   ├── useEmailAuth.test.ts
│   ├── useFavorites.test.ts
│   └── useUserProfile.test.ts
├── services/
│   ├── api.test.ts
│   └── supabaseStorage.test.ts
├── components/
│   ├── Button.test.tsx
│   └── SearchBar.test.tsx
└── utils/
    └── validators.test.ts
```

### 2. **Use describe e it descritivos**

```typescript
✅ Bom
describe('useEmailAuth', () => {
  it('deve validar email inválido', () => { ... });
  it('deve enviar OTP para email válido', () => { ... });
});

❌ Ruim
describe('Auth', () => {
  it('works', () => { ... });
});
```

### 3. **AAA Pattern: Arrange, Act, Assert**

```typescript
it('deve adicionar item aos favoritos', async () => {
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

### 4. **Mock apenas o necessário**

```typescript
// ✅ Mock específico
jest.mock('@/src/services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// ❌ Mock demais (dificulta debugging)
jest.mock('axios');
jest.mock('react-native');
jest.mock('expo-router');
```

### 5. **Teste comportamento, não implementação**

```typescript
// ✅ Testa o resultado
it('deve exibir mensagem de erro', () => {
  const { getByText } = render(<LoginForm />);
  fireEvent.press(getByText('Entrar'));
  expect(getByText('Email obrigatório')).toBeVisible();
});

// ❌ Testa implementação interna
it('deve chamar setState', () => {
  const setStateSpy = jest.spyOn(React, 'useState');
  render(<LoginForm />);
  expect(setStateSpy).toHaveBeenCalled();
});
```

### 6. **Use testID para elementos sem texto**

```typescript
// Componente
<Pressable testID="favorite-button" onPress={onPress}>
  <Heart />
</Pressable>

// Teste
await element(by.id('favorite-button')).tap();
```

### 7. **Limpe mocks entre testes**

```typescript
describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Limpa contadores de chamadas
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restaura implementações originais
  });
});
```

---

## 📊 Coverage (Cobertura de Código)

Para gerar relatório de cobertura:

```bash
yarn test:coverage
```

Isso cria uma pasta `coverage/` com HTML interativo:

```bash
open coverage/lcov-report/index.html
```

**Metas recomendadas:**
- ✅ **80%+** para lógica crítica (auth, pagamento, segurança)
- ✅ **60%+** para funcionalidades gerais
- ✅ **40%+** para UI/componentes visuais

---

## 🐛 Debugging

### Jest

```bash
# Adicionar breakpoint no código
debugger;

# Rodar em modo debug
yarn test:debug

# Abrir chrome://inspect no navegador
```

### Detox

```bash
# Logs verbosos
detox test --loglevel verbose

# Screenshots ao falhar
detox test --take-screenshots failing

# Gravar vídeo
detox test --record-videos failing
```

---

## 📚 Recursos Adicionais

- [Jest Docs](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Docs](https://wix.github.io/Detox/)
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

---

**Última atualização:** Maio 2026
