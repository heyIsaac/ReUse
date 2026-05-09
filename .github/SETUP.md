# ⚡ Setup Rápido - GitHub Actions

## 🚀 Passo a Passo (5 minutos)

### 1️⃣ Commit e Push

Os workflows já estão configurados! Basta fazer push:

```bash
cd /Users/marcomendes/Desktop/reuse-facul/ReUse

git add .github/workflows/
git commit -m "ci: adicionar GitHub Actions para testes automatizados"
git push origin marco
```

### 2️⃣ Ver Actions Rodando

1. Abra seu repositório no GitHub
2. Clique na aba **"Actions"** (no topo)
3. Veja os workflows rodando em tempo real!

### 3️⃣ Configurar Codecov (Opcional)

Para relatórios de cobertura bonitos:

1. **Acesse:** https://codecov.io
2. **Login:** com GitHub
3. **Adicione o repositório:** reuse-facul
4. **Copie o token**
5. **No GitHub:**
   - Vá em: `Settings` → `Secrets and variables` → `Actions`
   - `New repository secret`
   - Nome: `CODECOV_TOKEN`
   - Value: [cole o token]
   - `Add secret`

### 4️⃣ Adicionar Badges ao README

Copie e cole no `README.md` (substitua `SEU_USUARIO`):

```markdown
[![Tests](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/tests.yml/badge.svg)](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/tests.yml)
[![CI](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/ci.yml/badge.svg)](https://github.com/SEU_USUARIO/reuse-facul/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/SEU_USUARIO/reuse-facul/branch/main/graph/badge.svg)](https://codecov.io/gh/SEU_USUARIO/reuse-facul)
```

---

## ✅ Pronto!

Agora a cada push:
- ✅ Testes rodam automaticamente
- ✅ Cobertura é calculada
- ✅ Status aparece nos commits
- ✅ PRs recebem comentário com coverage
- ✅ Relatórios salvos por 30 dias

---

## 🎯 O Que Vai Acontecer

### Quando você fizer PUSH:

```
1. GitHub detecta mudanças
2. Workflows iniciam automaticamente
3. Você recebe notificação (se falhar)
4. Status aparece no commit
```

### Quando abrir PULL REQUEST:

```
1. Todos os workflows rodam
2. Status aparece no PR
3. Comentário com cobertura é adicionado
4. Você pode configurar para bloquear merge se falhar
```

---

## 📊 Monitorar Uso

Ver quantos minutos você usou:

1. GitHub → `Settings` (do seu perfil, não do repo)
2. `Billing and plans`
3. `Plans and usage`
4. Seção "Actions & Packages"

**Limite Free:** 2.000 minutos/mês (repo privado)
**Limite Free:** ♾️ Ilimitado (repo público)

---

## 🎓 GitHub Student Pack (Recomendado!)

Se você é estudante, ganhe 3.000 minutos/mês:

1. Acesse: https://education.github.com/pack
2. Verifique com email da faculdade
3. Aprovação em ~1-7 dias
4. **Bônus:** GitHub Pro grátis!

---

## 🔧 Personalizar Workflows

### Mudar quando os workflows rodam

Edite `.github/workflows/tests.yml`:

```yaml
on:
  push:
    branches: [ main, marco ]  # ← Adicione suas branches
  pull_request:
    branches: [ main ]
```

### Adicionar mais testes

Os workflows detectam automaticamente novos testes em `__tests__/`!

### Mudar versão do Node

Edite `.github/workflows/ci.yml`:

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]  # ← Adicione versões
```

---

## 🚨 Notificações

Por padrão, você recebe email quando workflows falham.

**Personalizar:**
1. GitHub → `Settings` (perfil)
2. `Notifications`
3. Seção "GitHub Actions"

---

## ❓ FAQ

### Os workflows não aparecem

**Resposta:** Dê push primeiro! Os workflows só aparecem após o primeiro push.

### Workflow falhou, e agora?

**Resposta:** 
1. Vá em `Actions`
2. Clique no workflow que falhou
3. Veja os logs completos
4. Corrija o erro
5. Faça novo push (roda automaticamente)

### Posso desabilitar um workflow?

**Resposta:** Sim!
1. `Actions` → `[nome do workflow]`
2. `...` (três pontos) → `Disable workflow`

### Como rodar workflow manualmente?

**Resposta:** Adicione ao workflow:

```yaml
on:
  push:
  workflow_dispatch:  # ← Adicione esta linha
```

Depois, em `Actions` → workflow → `Run workflow`

---

## 🎁 Bônus: Self-Hosted Runner

Se quiser rodar na sua própria máquina (grátis, minutos ilimitados):

1. Repo → `Settings` → `Actions` → `Runners`
2. `New self-hosted runner`
3. Siga instruções

**Vantagens:**
- ♾️ Minutos ilimitados
- 🚀 Mais rápido (suas dependências já baixadas)
- 💰 Grátis total

**Desvantagens:**
- 💻 Sua máquina precisa ficar ligada
- 🔧 Você gerencia o ambiente

---

## 📚 Documentação Completa

- [GITHUB_ACTIONS.md](.github/GITHUB_ACTIONS.md) - Guia completo
- [BADGES.md](.github/BADGES.md) - Todos os badges disponíveis

---

## 🎉 Resumo

✅ **4 workflows configurados:**
- 🧪 Tests (testes unitários)
- 🔍 Lint (qualidade de código)
- 📝 TypeScript (verificação de tipos)
- ✨ CI (pipeline completo)

✅ **100% gratuito** para repo público
✅ **2.000 min/mês grátis** para repo privado
✅ **Zero configuração adicional**
✅ **Funciona agora mesmo**

**Basta fazer push! 🚀**

---

**Última atualização:** Maio 2026
