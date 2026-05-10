# ReUse — frontend

Cliente mobile em Expo. A visão geral do monorepo está no [README da raiz](../README.md).

## Comandos úteis

```bash
yarn install
yarn start          # desenvolvimento (prefira build nativo abaixo)
yarn ios            # simulador iOS com módulos nativos
yarn android
yarn test
```

Variáveis: copie `.env.example` para `.env`. Para alinhar o build local ao ambiente de produção, use `.env.production` e `yarn ios:prod` / `yarn start:prod` (ver README raiz).
