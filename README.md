# 🌱 ReUse 
[Figma](https://www.figma.com/design/ALdrMz6X0cFopZPIkJwmIJ/ReUse?node-id=2-8&t=7SdET4y0iHcbCRvk-1)

O ReUse é uma plataforma focada em sustentabilidade e renovação, conectando usuários para dar um novo ciclo de vida a produtos. Este repositório contém o código-fonte completo do projeto, dividido em um aplicativo móvel (Frontend) e uma API (Backend).

## 🎯 Contexto da Sprint
Nesta primeira grande Sprint (Fundação e Autenticação), o objetivo principal foi estabelecer a espinha dorsal da arquitetura do projeto e garantir uma porta de entrada segura e amigável para os usuários.

## Entregáveis desta Sprint:

- Configuração do ecossistema de desenvolvimento (Monorepo lógico separando frontend/ e api/).
- Implementação da tela de Onboarding com design responsivo (Pixel Perfect).
- Pivotagem da estratégia de Autenticação: migração de OTP via SMS (alto custo) para OTP via E-mail usando a API do Resend (baixo custo operacional/MVP).
- Construção de uma API RESTful robusta para gerenciamento de usuários, geração de códigos temporários e emissão de Tokens JWT.
- Integração ponta-a-ponta: O aplicativo se comunica com a API local (via túnel ADB), recebe o Token JWT e o armazena no cofre biométrico do dispositivo (SecureStore).

## 🎨 Decisões de Interface e Organização do App
Como o projeto tem um forte apelo visual guiado por princípios sólidos de UX/UI design, várias decisões técnicas foram tomadas no frontend para garantir que a interface implementada fosse fiel aos protótipos de alta fidelidade:

- Paleta e Identidade Visual: Adoção da escala emerald do TailwindCSS para transmitir a ideia de sustentabilidade, ecologia e renovação. (Podendo mudar no futuro, ainda estamos pensando)
- Roteamento Moderno: Utilização do Expo Router para roteamento baseado em arquivos (file-based routing), facilitando a passagem de parâmetros (como o e-mail) entre a tela de Login e a tela de Verificação.

Decisões de Backend (Segurança e Escala)
- Stack: Escolha do .NET 8 (LTS) para garantir estabilidade de longo prazo e alta performance.
- Banco de Dados: PostgreSQL, preparando o terreno para a integridade dos dados relacionais (Usuários, Produtos, Categorias e Mensagens) que o ReUse exigirá nos próximos módulos.
- Autenticação Stateless: Uso de JSON Web Tokens (JWT). A API não guarda sessão em memória, permitindo escalabilidade horizontal.
- E-mails Transacionais: Integração com a ferramenta moderna Resend para envio assíncrono e confiável dos códigos de acesso.
- A ideia de Login é ser algo mais moderno: se passa apenas o email, recebe-se um codigo via email para validação, a ideia inicial era ser via número de telefone, porém não achamos uma opção free

🏗️ Estrutura do Projeto
A arquitetura foi desenhada separando claramente as responsabilidades de interface (React Native) e regras de negócio (C#).

```
ReUse/
│
├── frontend/                  # Aplicativo Mobile (Expo / React Native)
│   ├── app/                   # Rotas do App (Expo Router)
│   │   ├── (auth)/            # Fluxo público (Login, OTP)
│   │   │   ├── login.tsx      # Tela de captura de e-mail e social login
│   │   │   └── otp.tsx        # Tela de validação dos 6 dígitos
│   │   └── index.tsx          # Tela inicial de Onboarding
│   │
│   ├── src/
│   │   ├── assets/images/     # Imagens estáticas e backgrounds
│   │   ├── components/        # Componentes UI reutilizáveis (Botões, Inputs, Ícones)
│   │   └── services/          # Conexões externas
│   │       └── api.ts         # Cliente HTTP (Axios) configurado com Interceptors JWT
│   │
│   ├── tailwind.config.js     # Configurações do NativeWind (TailwindCSS)
│   └── package.json           # Dependências do Frontend
│
└── api/                       # Backend (C# .NET 8 Web API)
    ├── ReUse.Api/
    │   ├── Controllers/       # Recepcionam as requisições HTTP do Mobile
    │   │   └── AuthController.cs
    │   │
    │   ├── Services/          # Cérebro do sistema (Regras de negócio e integrações)
    │   │   └── AuthService.cs # Lógica de OTP, Resend e geração de JWT
    │   │
    │   ├── Data/              # Configuração do Entity Framework Core
    │   │   └── AppDbContext.cs# Mapeamento do PostgreSQL
    │   │
    │   ├── Models/            # Entidades do Banco de Dados
    │   │   ├── User.cs
    │   │   └── OtpCode.cs
    │   │
    │   ├── DTOs/              # Data Transfer Objects (Envelopes de entrada/saída)
    │   │   └── AuthDTOs.cs
    │   │
    │   ├── appsettings.json   # Variáveis de ambiente (Connection Strings, JWT Secret)
    │   └── Program.cs         # Ponto de entrada e injeção de dependências
    │
    └── ReUse.sln              # Arquivo de Solução do Visual Studio / .NET
```
> Documentação atualizada em: Março de 2026.
