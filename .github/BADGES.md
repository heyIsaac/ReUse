# 🏷️ Badges para README

## Como Adicionar

Copie e cole no início do seu `README.md`, substituindo `SEU_USUARIO` pelo seu username do GitHub:

```markdown
# ReUse

[![Tests](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/tests.yml/badge.svg)](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/tests.yml)
[![CI](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/ci.yml/badge.svg)](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/ci.yml)
[![Lint](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/lint.yml/badge.svg)](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/lint.yml)
[![TypeScript](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/type-check.yml/badge.svg)](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/type-check.yml)
[![codecov](https://codecov.io/gh/SEU_USUARIO/reuse-facul/branch/main/graph/badge.svg)](https://codecov.io/gh/SEU_USUARIO/reuse-facul)

[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-blue.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![.NET](https://img.shields.io/badge/.NET-8-purple.svg)](https://dotnet.microsoft.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Storage-green.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
```

## Preview

Assim vai ficar:

![Tests](https://img.shields.io/badge/tests-passing-brightgreen)
![CI](https://img.shields.io/badge/CI-passing-brightgreen)
![Lint](https://img.shields.io/badge/lint-passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-passing-blue)
![Coverage](https://img.shields.io/badge/coverage-81%25-green)

![React Native](https://img.shields.io/badge/React%20Native-0.81-blue)
![Expo](https://img.shields.io/badge/Expo-54-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![.NET](https://img.shields.io/badge/.NET-8-purple)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Storage-green)

## Badges Customizados

### Badge de Cobertura Customizado

```markdown
[![Coverage](https://img.shields.io/codecov/c/github/SEU_USUARIO/reuse-facul)](https://codecov.io/gh/SEU_USUARIO/reuse-facul)
```

### Badge de Issues

```markdown
[![Issues](https://img.shields.io/github/issues/SEU_USUARIO/reuse-facul)](https://github.com/SEU_USUARIO/reuse-facul/issues)
```

### Badge de PRs

```markdown
[![Pull Requests](https://img.shields.io/github/issues-pr/SEU_USUARIO/reuse-facul)](https://github.com/SEU_USUARIO/reuse-facul/pulls)
```

### Badge de Stars

```markdown
[![Stars](https://img.shields.io/github/stars/SEU_USUARIO/reuse-facul?style=social)](https://github.com/SEU_USUARIO/reuse-facul)
```

### Badge de Último Commit

```markdown
[![Last Commit](https://img.shields.io/github/last-commit/SEU_USUARIO/reuse-facul)](https://github.com/SEU_USUARIO/reuse-facul/commits/main)
```

## Exemplo Completo de README

```markdown
<div align="center">
  <h1>🌱 ReUse</h1>
  <p>Plataforma de economia circular e sustentabilidade</p>
  
  [![Tests](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/tests.yml/badge.svg)](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/tests.yml)
  [![CI](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/ci.yml/badge.svg)](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/ci.yml)
  [![codecov](https://codecov.io/gh/SEU_USUARIO/reuse-facul/branch/main/graph/badge.svg)](https://codecov.io/gh/SEU_USUARIO/reuse-facul)
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.81-blue.svg)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-54-blue.svg)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
</div>

---

## 📱 Sobre o Projeto

O **ReUse** é uma plataforma mobile focada em sustentabilidade...

[resto do README]
```

## Criar Badge Personalizado

Use https://shields.io/ para criar badges customizados:

```markdown
![Custom Badge](https://img.shields.io/badge/TEXTO-VALOR-COR)
```

Exemplos:
```markdown
![Made with Love](https://img.shields.io/badge/made%20with-%E2%9D%A4%EF%B8%8F-red)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
```

## Cores Disponíveis

- `brightgreen` - Verde claro
- `green` - Verde
- `yellowgreen` - Verde amarelado
- `yellow` - Amarelo
- `orange` - Laranja
- `red` - Vermelho
- `blue` - Azul
- `lightgrey` - Cinza claro
- `success` - Verde de sucesso
- `important` - Laranja importante
- `critical` - Vermelho crítico
- `informational` - Azul informativo
- `inactive` - Cinza inativo

## Estilos de Badge

```markdown
?style=flat          # Padrão
?style=flat-square   # Quadrado
?style=for-the-badge # Grande
?style=plastic       # 3D
?style=social        # Estilo social (para stars)
```

Exemplo:
```markdown
![Tests](https://img.shields.io/badge/tests-passing-brightgreen?style=for-the-badge)
```
