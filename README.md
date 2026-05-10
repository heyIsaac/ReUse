# ReUse

[![Tests](https://github.com/heyIsaac/ReUse/actions/workflows/tests.yml/badge.svg)](https://github.com/heyIsaac/ReUse/actions/workflows/tests.yml)
[![CI](https://github.com/heyIsaac/ReUse/actions/workflows/ci.yml/badge.svg)](https://github.com/heyIsaac/ReUse/actions/workflows/ci.yml)

**ReUse** é um aplicativo de **economia circular** pensado para dar nova vida a itens que você não usa mais: publicar desapegos, descobrir o que precisa perto de você e combinar entrega de forma simples. Este repositório é **público** e faz parte de um **projeto acadêmico** com ênfase em consumo de serviços na nuvem, autenticação segura e boas práticas de desenvolvimento.

---

## O que você encontra no app

- **Início** — Busca, categorias e um cartão de **impacto estimado** (quanto de CO₂ deixou de ser emitido ao reutilizar em vez de comprar novo, com base nas categorias dos seus anúncios).
- **Mapa** — Visualizar anúncios no mapa.
- **Publicar desapego** — Formulário com validação; opcionalmente **CEP** com preenchimento automático do endereço (serviço público brasileiro).
- **Favoritos e meus anúncios** — Organizar o que interessa e o que você publicou.
- **Chat em tempo real** — Conversa ligada aos anúncios, com histórico na nuvem.
- **QR Code** — Apoio ao combinado de entrega na prática.
- **Avaliações e notificações** — Após a troca, é possível avaliar; o app também mostra avisos relevantes.
- **Perfil** — Resumo de desapegos e avaliação; **estimativa de impacto** (CO₂, equivalências em árvores e quilômetros de carro, com explicações em texto); **referência em dinheiro** em real e conversão aproximada para outras moedas (somente referência, não é “preço de mercado” do item).

Tudo isso é apresentado de forma direta na interface; os números de impacto e câmbio são **estimativas** para dar contexto, não certificação ambiental ou financeira.

---

## Por trás dos panos (sem mergulhar em código)

- Uma **API própria** (hospedada na nuvem) guarda anúncios, favoritos, categorias, chat, avaliações e notificações.
- O **login** e o **armazenamento de fotos** usam um provedor especializado (Supabase), com sessão persistente no celular.
- Alguns recursos usam **serviços públicos gratuitos**: busca de endereço por CEP (ViaCEP) e taxas de câmbio para mostrar valores aproximados em dólar e euro. A pegada de carbono no app é calculada **no próprio aplicativo** com fatores médios por tipo de item — não depende de um serviço pago externo.
- O repositório inclui **testes automatizados** no frontend e **pipelines** que rodam testes, lint e checagens ao enviar código — isso ajuda a manter o projeto estável enquanto evolui.

Se quiser o detalhe técnico (endpoints, cache, decisões de arquitetura), vale olhar também o `CHANGELOG.md` e o `TRABALHO_APIS.md`.

---

## Links úteis

- [Protótipo no Figma](https://www.figma.com/design/ALdrMz6X0cFopZPIkJwmIJ/ReUse?node-id=2-8&t=7SdET4y0iHcbCRvk-1)
- [API pública de listagem (exemplo)](https://reuse-hx4x.onrender.com/api/listings) — ambiente de demonstração; uso sujeito à disponibilidade do servidor.

---

## Como rodar no seu computador

### Aplicativo (Expo / React Native)

```bash
cd frontend
cp .env.example .env
```

Preencha no `.env` as variáveis indicadas no exemplo (URL da API, projeto Supabase e, se for usar, Google Sign-In). Depois:

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

A API em produção usa banco Postgres e validação de token conforme a configuração do ambiente.

---

## Testes

```bash
cd frontend
yarn test
```

Com cobertura (gera também o resumo usado no CI):

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
