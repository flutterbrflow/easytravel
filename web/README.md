# EasyTravel Web

Versão web do aplicativo EasyTravel, construída com React, Vite e Tailwind CSS.

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

O aplicativo estará disponível em `http://localhost:5173`

## 🛠️ Tecnologias

- **React** 19.2.3 - UI Library
- **TypeScript** 5.8.2 - Type safety
- **Vite** 6.2.0 - Build tool e dev server
- **React Router DOM** 7.11.0 - Client-side routing
- **Tailwind CSS** (via CDN) - Utility-first CSS
- **Google Fonts** - Plus Jakarta Sans, Noto Sans
- **Material Symbols** - Ícones do Google

## 📁 Estrutura

```
web/
├── components/
│   ├── WelcomeScreen.tsx      # Tela de boas-vindas
│   ├── TripListScreen.tsx     # Lista de viagens
│   └── NewTripScreen.tsx      # Criar viagem
├── App.tsx                    # Router e setup
├── index.tsx                  # Entry point
├── index.html                 # HTML template
├── constants.ts               # Constantes e mock data
├── types.ts                   # TypeScript interfaces
├── package.json               # Dependências
├── tsconfig.json              # Config TypeScript
└── vite.config.ts             # Config Vite
```

## 📚 Documentação

Consulte a pasta [`../doc`](../doc) para documentação completa:
- [Visão Geral](../doc/01-visao-geral.md)
- [Arquitetura](../doc/02-arquitetura.md)
- [Componentes](../doc/03-componentes.md)
- [Guia do Desenvolvedor](../doc/04-guia-dev.md)

---

**Para mais informações, consulte o [README principal](../README.md)**
