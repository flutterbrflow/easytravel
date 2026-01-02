# EasyTravel - Monorepo

Aplicativo de planejamento de viagens com versões Web e Mobile.

## 📁 Estrutura do Projeto

```
easytravel/
├── web/                    # 🌐 Aplicativo React Web
│   ├── components/         # Componentes React
│   ├── App.tsx            # Componente raiz
│   ├── index.html         # HTML template
│   ├── package.json       # Dependências web
│   └── ...
│
├── mobile/                 # 📱 Aplicativo React Native
│   ├── components/         # Componentes React Native
│   ├── constants/         # Constantes e dados
│   ├── types/             # TypeScript types
│   ├── App.tsx            # Componente raiz
│   ├── package.json       # Dependências mobile
│   └── ...
│
├── doc/                    # 📚 Documentação
│   ├── README.md          # Índice da documentação
│   ├── 01-visao-geral.md  # Visão geral do projeto
│   ├── 02-arquitetura.md  # Arquitetura
│   ├── 03-componentes.md  # Guia de componentes
│   ├── 04-guia-dev.md     # Guia do desenvolvedor
│   ├── 05-guia-usuario.md # Guia do usuário
│   └── 06-react-native.md # Guia de conversão RN
│
├── .git/                   # Controle de versão
├── .gitignore             # Arquivos ignorados
└── README.md              # Este arquivo
```

---

## 🚀 Quick Start

### Web (React + Vite)

```bash
cd web
npm install
npm run dev
```

Acesse: `http://localhost:5173`

### Mobile (React Native + Expo)

```bash
cd mobile
npm install
npm start
```

Escaneie o QR code com o app Expo Go ou execute:
- `npm run android` - Android emulator
- `npm run ios` - iOS simulator (macOS only)

---

## 🌟 Funcionalidades

### ✅ Implementadas
- 🎨 Tela de boas-vindas
- 🔐 Autenticação com Supabase (Login/Logout)
- 📋 Lista de viagens (Próximas/Passadas)
- ➕ Criar nova viagem (com imagem de capa e descrição)
- 🗑️ Exclusão de viagens
- 📸 Upload de imagens (Avatar e Capa)
- 🤝 Funcionalidades sociais (Convidar/Adicionar)
- 🌓 Modo escuro/claro
- 📱 Interface responsiva (Web e Mobile)

### 🚧 Em Desenvolvimento
- 👤 Tela de Perfil (Próximo passo)
- 💰 Controle de gastos detalhado
- 🔔 Notificações push
- 📍 Mapa interativo

---

## 🛠️ Tecnologias

### Web
- **React** 19.2.3
- **TypeScript** 5.8.2
- **Vite** 6.2.0
- **React Router DOM** 7.11.0
- **Tailwind CSS** (via CDN)
- **Supabase** (Backend/Auth)

### Mobile
- **React Native** (via Expo SDK 54)
- **TypeScript** 5.8.2
- **Expo** ~54.0.0
- **React Navigation** 7.x
- **Expo Linear Gradient**
- **Supabase** (Backend/Auth)

---

## 📚 Documentação

Toda a documentação está na pasta [`doc/`](./doc/):

- **[README.md](./doc/README.md)** - Índice completo
- **[Visão Geral](./doc/01-visao-geral.md)** - Overview do projeto
- **[Arquitetura](./doc/02-arquitetura.md)** - Padrões e estrutura
- **[Componentes](./doc/03-componentes.md)** - Documentação detalhada
- **[Guia Dev](./doc/04-guia-dev.md)** - Setup e desenvolvimento
- **[Guia Usuário](./doc/05-guia-usuario.md)** - Como usar o app
- **[React Native](./doc/06-react-native.md)** - Guia de conversão

---

## 🎯 Estrutura de Pastas Detalhada

### 🌐 Web (`/web`)

```
web/
├── components/
│   ├── WelcomeScreen.tsx
│   ├── TripListScreen.tsx
│   └── NewTripScreen.tsx
├── App.tsx               # Router e setup
├── index.tsx             # Entry point
├── index.html            # HTML template
├── constants.ts          # Constantes e mock data
├── types.ts              # TypeScript types
├── package.json          # npm dependencies
├── tsconfig.json         # TypeScript config
└── vite.config.ts        # Vite config
```

**Stack:** React + Vite + React Router + Tailwind CSS

### 📱 Mobile (`/mobile`)

```
mobile/
├── components/
│   ├── WelcomeScreen.tsx
│   ├── TripListScreen.tsx
│   └── NewTripScreen.tsx
├── constants/
│   └── index.ts          # Cores, imagens, mock data
├── types/
│   └── index.ts          # TypeScript types + navigation
├── App.tsx               # Navigation setup
├── app.json              # Expo config
├── package.json          # npm dependencies
└── tsconfig.json         # TypeScript config
```

**Stack:** React Native + Expo + React Navigation + StyleSheet

---

## 🔄 Diferenças Web vs Mobile

| Aspecto | Web | Mobile |
|---------|-----|--------|
| **Framework** | React | React Native |
| **Navegação** | React Router | React Navigation |
| **Elementos** | `<div>`, `<button>` | `<View>`, `<TouchableOpacity>` |
| **Estilos** | Tailwind classes | StyleSheet API |
| **Ícones** | Material Symbols | Expo Vector Icons |
| **Imagens** | `<img>` | `<Image>` |

Consulte [doc/06-react-native.md](./doc/06-react-native.md) para guia completo de conversão.

---

## 🧪 Scripts Disponíveis

### Web
```bash
npm run dev      # Desenvolvimento
npm run build    # Build produção
npm run preview  # Preview da build
```

### Mobile
```bash
npm start        # Expo dev server
npm run android  # Android emulator
npm run ios      # iOS simulator
npm run web      # Web browser
```

---

## 📦 Instalação Completa

### Clonar repositório
```bash
git clone <repository-url>
cd easytravel
```

### Instalar dependências Web
```bash
cd web
npm install
```

### Instalar dependências Mobile
```bash
cd ../mobile
npm install
```

---

## 🎨 Design System

### Cores Principais
- **Primary:** `#137fec` (Azul)
- **Background Light:** `#f6f7f8`
- **Background Dark:** `#101922`
- **Text Dark:** `#111418`
- **Text Light:** `#ffffff`

### Tipografia
- **Fonte:** Plus Jakarta Sans, Noto Sans
- **Títulos:** 28-32px, Bold/ExtraBold
- **Corpo:** 14-16px, Medium/Regular

---

## 🤝 Contribuindo

1. Crie uma branch para sua feature
2. Faça commit das alterações
3. Teste em ambas as plataformas (web/mobile)
4. Abra um Pull Request

---

## 📝 Convenções de Código

### Commits
```
feat: nova funcionalidade
fix: correção de bug
docs: atualização de documentação
style: formatação de código
refactor: refatoração
test: adicionar testes
```

### Nomenclatura
- **Componentes:** PascalCase (`WelcomeScreen.tsx`)
- **Funções/variáveis:** camelCase (`handleClick`, `userName`)
- **Constantes:** UPPER_CASE (`COLORS`, `MOCK_TRIPS`)
- **Arquivos:** kebab-case ou PascalCase

---

## 🐛 Troubleshooting

### Web não inicia
```bash
cd web
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Mobile - Expo não conecta
```bash
cd mobile
npx expo start --clear
```

### Portas em conflito
- Web usa porta **5173** (Vite)
- Mobile usa porta **8081** (Metro)

---

## 📄 Licença

Projeto privado - Todos os direitos reservados

---

## 🔗 Links Úteis

### Documentação Oficial
- [React](https://react.dev/)
- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)
- [React Router](https://reactrouter.com/)
- [React Navigation](https://reactnavigation.org/)
- [Vite](https://vitejs.dev/)

### Ferramentas
- [Expo Go](https://expo.dev/go) - App para testar
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

## 📞 Suporte

- 📚 **Documentação:** Consulte a pasta `/doc`
- 🐛 **Bugs:** Abra uma issue
- 💡 **Sugestões:** Entre em contato com a equipe

---

**Desenvolvido com ❤️ usando React e React Native**

*Última atualização: Janeiro 2026*
