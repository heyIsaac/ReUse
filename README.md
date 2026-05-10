# ReUse

[![Tests](https://github.com/heyIsaac/ReUse/actions/workflows/tests.yml/badge.svg)](https://github.com/heyIsaac/ReUse/actions/workflows/tests.yml)
[![CI](https://github.com/heyIsaac/ReUse/actions/workflows/ci.yml/badge.svg)](https://github.com/heyIsaac/ReUse/actions/workflows/ci.yml)

**ReUse** é um aplicativo de **economia circular**: em vez de descartar, você **desapega** do que não usa e encontra **de graça** o que precisa na comunidade. A ideia é aproximar pessoas que têm algo sobrando daquelas que estão procurando — com conversa no app, combinação de entrega e um toque de **consciência ambiental** (estimativas de impacto ao reutilizar).

Este repositório é **público** e nasceu como **projeto acadêmico**: além do produto em si, o trabalho explora **integração com serviços na nuvem**, **autenticação** e **armazenamento local seguro** no celular, sempre com foco em algo utilizável no mundo real.

---

## Por que este projeto existe

Muito do que compramos deixa de ser útil antes de “acabar”. Doar ou trocar de mão em mão reduz lixo, economiza dinheiro e cria vínculo entre vizinhos e conhecidos. O ReUse tenta **baixar o atrito** desse processo: publicar um item leva poucos passos, buscar por categoria ou no mapa é simples, e o chat ajuda a combinar **sem expor o telefone** em um mural aberto.

---

## O que você encontra no app

- **Início** — Busca, filtros por categoria e um cartão de **impacto estimado**: quanto de CO₂ deixou de ser emitido ao reutilizar em vez de comprar novo, usando as categorias dos **seus** anúncios como referência.
- **Mapa** — Ver desapegos geolocalizados e se situar em relação aos itens.
- **Publicar desapego** — Fluxo guiado com validação; **CEP opcional** com preenchimento automático de endereço (serviço público brasileiro).
- **Favoritos e meus anúncios** — Guardar o que interessa e acompanhar o que você publicou.
- **Chat em tempo real** — Conversas ligadas aos anúncios, com histórico sincronizado na nuvem.
- **QR Code** — Apoio na hora de confirmar encontro ou entrega, conforme o fluxo combinado.
- **Avaliações e notificações** — Depois da troca, dá para avaliar a experiência; o app também avisa quando há algo relevante (por exemplo, novidades nas conversas).
- **Perfil** — Resumo de desapegos e nota média; **estimativa de impacto** (CO₂, equivalências em árvores e quilômetros de carro, com textos explicativos); **referência em dinheiro** em real e valores aproximados em outras moedas — são **números ilustrativos**, não preço de venda nem certificado ambiental.

A interface deixa claro que impacto e câmbio são **estimativas** para dar contexto e educar, não laudos oficiais.

---

## Como isso se conecta (visão geral)

- **Backend próprio** na nuvem: guarda anúncios, favoritos, categorias, salas de chat, mensagens, avaliações e notificações. O app conversa com esse backend de forma padronizada.
- **Conta e fotos:** login (e-mail com código, Google ou Facebook, conforme configuração) e armazenamento de imagens usam um provedor especializado (**Supabase**). A sessão fica salva de forma segura no aparelho para você não precisar entrar toda vez.
- **Dados em tempo real:** o chat usa conexão persistente (**SignalR**) para mensagens chegarem sem ficar atualizando a tela manualmente.
- **Serviços públicos sem custo de API key:** **ViaCEP** para endereço a partir do CEP; **taxas de câmbio** públicas para mostrar referência em dólar e euro no perfil. O **CO₂** é calculado **dentro do app** com tabelas de referência por categoria — útil para o tema sustentabilidade sem depender de serviço pago externo.
- **Qualidade contínua:** há **testes automatizados** no frontend e **GitHub Actions** que rodam testes, lint e checagens ao enviar código.

Para ver **o que mudou** ao longo do tempo no código e no produto, use o [`CHANGELOG.md`](./CHANGELOG.md).

---

## Links úteis

- [Protótipo no Figma](https://www.figma.com/design/ALdrMz6X0cFopZPIkJwmIJ/ReUse?node-id=2-8&t=7SdET4y0iHcbCRvk-1)
- [API pública de listagem (exemplo)](https://reuse-hx4x.onrender.com/api/listings) — ambiente de demonstração; disponibilidade depende do servidor.

---

## Como rodar no seu computador

### Aplicativo (Expo / React Native)

```bash
cd frontend
cp .env.example .env
```

Preencha no `.env` as variáveis indicadas no exemplo (URL da API, projeto Supabase e, se for usar, Google Sign-In). **Não commite** arquivos `.env` com segredos — o repositório público traz apenas o `.env.example` como modelo.

```bash
yarn install
```

O projeto usa recursos nativos; em muitos casos o **Expo Go sozinho não é suficiente**. Prefira um build de desenvolvimento:

```bash
yarn ios
# ou
yarn android
```

### API (.NET)

```bash
cd api/ReUse.Api
dotnet run
```

Em produção, a API usa banco **Postgres** e valida o token de acesso conforme a configuração do ambiente.

---

## Testes

```bash
cd frontend
yarn test
```

Com cobertura (inclui o resumo usado no CI):

```bash
yarn test:coverage
```

---

## Estrutura do repositório

| Pasta | Conteúdo |
|--------|----------|
| `frontend/` | App Expo (telas em `app/`, componentes, serviços) |
| `api/ReUse.Api/` | Web API .NET |
| `.github/workflows/` | Automação de qualidade (testes, lint, TypeScript) |

---

## Licença

Este projeto está sob a licença **MIT** — veja o arquivo [`LICENSE`](./LICENSE).

---

*ReUse — menos descarte, mais reutilização.*
