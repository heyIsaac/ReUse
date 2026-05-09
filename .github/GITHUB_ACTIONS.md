# 🚀 GitHub Actions - Configuração Gratuita

## ✅ TOTALMENTE GRATUITO!

O GitHub Actions é **100% gratuito** para:
- ✅ Repositórios públicos (uso ilimitado)
- ✅ Repositórios privados (2.000 minutos/mês grátis)

### Limites Gratuitos (Plano Free)

| Item | Limite Gratuito |
|------|----------------|
| **Repositórios Públicos** | ♾️ Ilimitado |
| **Repositórios Privados** | 2.000 minutos/mês |
| **Armazenamento** | 500 MB |
| **Concurrent Jobs** | 20 jobs simultâneos |
| **Tempo por Job** | 6 horas |
| **Tempo por Workflow** | 72 horas |

**Seu uso estimado:** ~3-5 minutos por execução de testes
- 📊 **400-600 execuções gratuitas por mês** em repo privado
- 📊 **Ilimitado** em repo público

---

## 📋 Workflows Configurados

### 1. 🧪 Tests (`tests.yml`)
Roda todos os testes Jest com cobertura.

**Triggers:**
- Push para `main`, `marco`, `develop`
- Pull Requests
- Mudanças em arquivos do `frontend/`

**O que faz:**
- ✅ Instala dependências
- ✅ Roda `yarn test --coverage`
- ✅ Envia relatório para Codecov
- ✅ Comenta cobertura em PRs
- ✅ Gera resumo no GitHub

**Duração estimada:** ~3 minutos

---

### 2. 🔍 Lint (`lint.yml`)
Verifica qualidade de código com ESLint.

**Triggers:**
- Push para `main`, `marco`, `develop`
- Pull Requests
- Mudanças em arquivos `.ts`, `.tsx`, `.js`, `.jsx`

**O que faz:**
- ✅ Roda `yarn lint`
- ✅ Reporta erros de estilo

**Duração estimada:** ~1 minuto

---

### 3. 📝 TypeScript (`type-check.yml`)
Valida tipos TypeScript.

**Triggers:**
- Push para `main`, `marco`, `develop`
- Pull Requests
- Mudanças em arquivos `.ts`, `.tsx` ou `tsconfig.json`

**O que faz:**
- ✅ Roda `tsc --noEmit`
- ✅ Verifica erros de tipo

**Duração estimada:** ~1 minuto

---

### 4. ✨ CI (`ci.yml`)
Pipeline completo de integração contínua.

**Triggers:**
- Push para `main`, `marco`, `develop`
- Pull Requests

**O que faz:**
- ✅ Testa em Node 18 e 20
- ✅ Cache de dependências
- ✅ Testes com cobertura
- ✅ Gera badge de cobertura
- ✅ Envia para Codecov
- ✅ Salva relatórios por 30 dias
- ✅ Verifica build

**Duração estimada:** ~5 minutos (rodando 2 versões do Node em paralelo)

---

## 🎯 Como Funciona

### Fluxo Automático

```
1. Você faz commit e push
   ↓
2. GitHub detecta mudanças
   ↓
3. Workflows relevantes iniciam automaticamente
   ↓
4. Rodam em máquinas Ubuntu do GitHub
   ↓
5. Resultados aparecem na aba "Actions"
   ↓
6. Status ✅ ou ❌ aparece no commit/PR
```

### Exemplo de Execução

```
📥 Checkout code           (10s)
📦 Setup Node.js           (15s)
🔧 Install dependencies    (60s)
🧪 Run tests               (45s)
📊 Upload coverage         (10s)
💬 Comment PR              (5s)
───────────────────────────────
Total: ~2m 25s
```

---

## 📊 Codecov (Relatórios de Cobertura)

### Configuração

1. **Crie conta gratuita:** https://codecov.io
2. **Conecte seu repositório**
3. **Copie o token**
4. **Adicione aos secrets do GitHub:**
   - Vá em: `Settings` → `Secrets and variables` → `Actions`
   - Clique em `New repository secret`
   - Nome: `CODECOV_TOKEN`
   - Value: [seu token do Codecov]

### Limites Gratuitos do Codecov

| Item | Limite Free |
|------|-------------|
| **Repositórios Públicos** | Ilimitado |
| **Repositórios Privados** | 1 repositório grátis |
| **Uploads** | Ilimitados |
| **Usuários** | Ilimitados |

---

## 🏷️ Badges para README

Adicione ao seu `README.md`:

```markdown
# ReUse

[![Tests](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/tests.yml/badge.svg)](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/tests.yml)
[![CI](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/ci.yml/badge.svg)](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/ci.yml)
[![Lint](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/lint.yml/badge.svg)](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/lint.yml)
[![TypeScript](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/type-check.yml/badge.svg)](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/type-check.yml)
[![codecov](https://codecov.io/gh/SEU_USUARIO/reuse-facul/branch/main/graph/badge.svg)](https://codecov.io/gh/SEU_USUARIO/reuse-facul)
```

**Resultado:**

![Tests](https://img.shields.io/badge/tests-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-81%25-green)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

---

## 🔧 Otimizações de Velocidade

### 1. Cache de Dependências
```yaml
- uses: actions/cache@v4
  with:
    path: ~/.yarn/cache
    key: ${{ runner.os }}-yarn-${{ hashFiles('yarn.lock') }}
```
**Economia:** ~30-40 segundos por execução

### 2. Jobs Paralelos
```yaml
strategy:
  matrix:
    node-version: [18, 20]
```
**Economia:** Testa 2 versões ao mesmo tempo (não sequencial)

### 3. Frozen Lockfile
```yaml
yarn install --frozen-lockfile
```
**Economia:** Não recalcula dependências, usa exatamente o que está no lockfile

### 4. MaxWorkers
```yaml
yarn test --maxWorkers=2
```
**Economia:** Limita uso de CPU, evita timeout

---

## 📈 Monitoramento

### Ver Status dos Workflows

1. **GitHub:**
   - Vá em: `Actions` (aba no topo do repo)
   - Veja histórico completo de execuções
   - Clique em qualquer workflow para ver detalhes
   - Logs completos disponíveis

2. **Em Commits:**
   - ✅ Checkmark verde = tudo passou
   - ❌ X vermelho = algo falhou
   - 🟡 Círculo amarelo = rodando

3. **Em Pull Requests:**
   - Status aparece automaticamente
   - Comentário com cobertura adicionado
   - Bloqueia merge se falhar (configurável)

---

## 🚨 Notificações

### Configurar Alertas

Por padrão, você recebe email quando:
- ❌ Workflow falha no **seu** push
- ❌ Workflow falha em branch que você **criou**

**Personalizar:**
1. Vá em: `Settings` → `Notifications`
2. Seção: "GitHub Actions"
3. Escolha: Email, Web, Mobile

---

## 💰 Custos Estimados (Plano Free)

### Repo Público
```
Custo: R$ 0,00 (ilimitado)
✅ Recomendado para projetos acadêmicos
```

### Repo Privado
```
Limite: 2.000 minutos/mês
Uso por execução: ~3-5 minutos
Execuções possíveis: ~400-600/mês

Média de desenvolvimento:
- 10 commits/dia = ~50 minutos/dia
- 20 dias úteis = ~1.000 minutos/mês
- Margem: 1.000 minutos restantes

✅ Suficiente para desenvolvimento normal
```

### Se Ultrapassar o Limite

Opções gratuitas:
1. **Tornar repo público** (ilimitado)
2. **GitHub Student Pack** (mais minutos grátis)
3. **Self-hosted runner** (roda na sua máquina)

---

## 🎓 GitHub Student Pack

Se você é estudante, ganhe **MUITO MAIS** de graça:

### Benefícios
- ✅ **GitHub Pro** (grátis enquanto estudante)
- ✅ **3.000 minutos/mês** (ao invés de 2.000)
- ✅ **2 GB de armazenamento** (ao invés de 500 MB)
- ✅ Acesso a ferramentas pagas

### Como Conseguir
1. Acesse: https://education.github.com/pack
2. Verifique com email da faculdade
3. Ou envie foto do RG de estudante

**Aprovação:** ~1-7 dias

---

## 🔐 Secrets Necessários (Opcionais)

Para funcionalidades extras:

| Secret | Para que serve | Obrigatório? |
|--------|---------------|--------------|
| `CODECOV_TOKEN` | Relatórios de cobertura | Não (funciona sem) |
| `GITHUB_TOKEN` | Comentar em PRs | Automático (já existe) |

---

## 📊 Exemplo de Pull Request

Quando você abre um PR, o GitHub Actions automaticamente:

```
✅ Tests (3m 24s)
✅ Lint (1m 12s)
✅ TypeScript (58s)
✅ CI - Node 18 (4m 45s)
✅ CI - Node 20 (4m 52s)

💬 Comentário automático:
Coverage: 81.3% (+2.1%)
✅ All checks passed
```

---

## 🛠️ Troubleshooting

### Workflow não roda

**Causa:** Arquivo YAML com erro de sintaxe
**Solução:** Validar em https://www.yamllint.com/

### Testes falhando no CI mas passam localmente

**Causa:** Diferenças de ambiente
**Solução:**
```yaml
env:
  CI: true
  NODE_ENV: test
```

### Timeout (job demora muito)

**Causa:** Testes lentos ou travados
**Solução:**
```yaml
timeout-minutes: 15  # Limitar tempo máximo
--maxWorkers=2       # Limitar paralelização
```

### Cache não funciona

**Causa:** Key do cache não bate
**Solução:** Verificar se `yarn.lock` mudou

---

## 📚 Recursos Adicionais

- [Documentação GitHub Actions](https://docs.github.com/en/actions)
- [GitHub Actions Pricing](https://github.com/pricing)
- [Marketplace de Actions](https://github.com/marketplace?type=actions)
- [Codecov Docs](https://docs.codecov.com/)
- [GitHub Student Pack](https://education.github.com/pack)

---

## 🎯 Resumo

✅ **TOTALMENTE GRATUITO** para repositórios públicos
✅ **2.000 minutos grátis** para repositórios privados
✅ **Configuração automática** - só fazer push
✅ **4 workflows** configurados e prontos
✅ **Codecov integrado** para relatórios visuais
✅ **Badges** para README
✅ **Notificações** automáticas
✅ **Comentários em PR** com cobertura
✅ **Zero configuração adicional** necessária

**Basta fazer commit e push para começar! 🚀**

---

**Última atualização:** Maio 2026
