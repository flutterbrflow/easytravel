# Guia do Desenvolvedor

## Pré-requisitos

- **Node.js** versão 18+ 
- **npm** ou **yarn**
- Editor de código (recomendado: VS Code)
- Git

## Configuração do Ambiente

### 1. Clonar o Repositório
```bash
git clone <repository-url>
cd easytravel
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Executar em Desenvolvimento
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

### 4. Build para Produção
```bash
npm run build
```

### 5. Preview da Build
```bash
npm run preview
```

## Estrutura de Pastas

```
easytravel/
├── .git/                   # Controle de versão Git
├── components/             # Componentes React
│   ├── WelcomeScreen.tsx   # Tela de boas-vindas
│   ├── TripListScreen.tsx  # Lista de viagens
│   └── NewTripScreen.tsx   # Nova viagem
├── doc/                    # Documentação
│   ├── 01-visao-geral.md   # Overview do projeto
│   ├── 02-arquitetura.md   # Arquitetura
│   ├── 03-componentes.md   # Guia de componentes
│   └── 04-guia-dev.md      # Este arquivo
├── App.tsx                 # Componente raiz
├── index.tsx               # Entry point
├── types.ts                # TypeScript types
├── constants.ts            # Constantes e mocks
├── index.html              # HTML template
├── package.json            # Dependências
├── tsconfig.json           # Config TypeScript
├── vite.config.ts          # Config Vite
└── .gitignore              # Arquivos ignorados
```

## Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| dev | `npm run dev` | Inicia servidor de desenvolvimento |
| build | `npm run build` | Cria build de produção |
| preview | `npm run preview` | Preview da build de produção |

## Tecnologias e Ferramentas

### Core
- **React 19.2.3** - UI Library
- **TypeScript 5.8.2** - Type checking
- **Vite 6.2.0** - Build tool

### Routing
- **React Router DOM 7.11.0** - Client-side routing

### Styling
- **Tailwind CSS** (via CDN) - Utility-first CSS
- **Google Fonts** - Plus Jakarta Sans, Noto Sans
- **Material Symbols** - Icon library

### Dev Tools
- **@vitejs/plugin-react** - Vite plugin for React
- **@types/node** - Node.js type definitions

## Convenções de Código

### Nomenclatura

#### Componentes
```typescript
// PascalCase para componentes
export const MyComponent: React.FC = () => { ... }
```

#### Arquivos
```
PascalCase.tsx - Para componentes
kebab-case.ts  - Para utilitários
camelCase.ts   - Para configs
```

#### Variáveis e Funções
```typescript
// camelCase para variáveis e funções
const userName = 'John';
const handleClick = () => { ... }

// UPPER_CASE para constantes
const API_URL = 'https://api.example.com';
```

### TypeScript

#### Sempre tipar props
```typescript
interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onClick }) => {
  return <button onClick={onClick}>{title}</button>;
}
```

#### Usar interfaces para objetos
```typescript
interface Trip {
  id: string;
  destination: string;
  startDate: string;
}
```

#### Usar enums para valores fixos
```typescript
enum AppRoute {
  WELCOME = '/',
  LIST = '/list',
}
```

### Componentes React

#### Functional Components
```typescript
const MyComponent: React.FC = () => {
  return <div>Content</div>;
}
```

#### Hooks
```typescript
// Estado
const [value, setValue] = useState<string>('');

// Navegação
const navigate = useNavigate();
```

#### Event Handlers
```typescript
const handleClick = () => {
  console.log('Clicked!');
}

<button onClick={handleClick}>Click</button>
```

## Estilização com Tailwind

### Classes Base
```typescript
// Background
className="bg-white dark:bg-[#1e2a36]"

// Text
className="text-[#111418] dark:text-white"

// Padding/Margin
className="p-4 mb-2"

// Flexbox
className="flex items-center justify-between"

// Grid
className="grid grid-cols-7 gap-2"
```

### Dark Mode
```typescript
// Adicionar variante dark:
className="bg-white dark:bg-gray-900 
           text-black dark:text-white"
```

### Responsividade
```typescript
// Mobile-first
className="w-full md:w-1/2 lg:w-1/3"
```

### Custom Colors
```typescript
// Definidos em index.html
primary: "#137fec"
background-light: "#f6f7f8"
background-dark: "#101922"
surface-light: "#ffffff"
surface-dark: "#1e2a36"
```

## Navegação

### useNavigate Hook
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navegar para rota específica
navigate('/list');
navigate(AppRoute.LIST);

// Voltar
navigate(-1);
```

### Route Definitions
```typescript
<Routes>
  <Route path={AppRoute.WELCOME} element={<WelcomeScreen />} />
  <Route path={AppRoute.LIST} element={<TripListScreen />} />
  <Route path={AppRoute.NEW_TRIP} element={<NewTripScreen />} />
</Routes>
```

## Estado e Dados

### Estado Local
```typescript
const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
```

### Dados Mock
```typescript
import { MOCK_TRIPS } from '../constants';

// Usar em componentes
{MOCK_TRIPS.map((trip) => (
  <TripCard key={trip.id} trip={trip} />
))}
```

## Boas Práticas

### Performance
✅ Usar `key` em listas  
✅ Evitar re-renders desnecessários  
✅ Lazy load de imagens  
✅ Code splitting quando necessário  

### Acessibilidade
✅ Usar semantic HTML  
✅ Adicionar `alt` em imagens  
✅ Garantir contraste de cores  
✅ Keyboard navigation  

### Code Quality
✅ Remover console.logs antes do commit  
✅ Comentar código complexo  
✅ Manter componentes pequenos e focados  
✅ Extrair lógica repetida para funções  

## Debugging

### React DevTools
```bash
# Instalar extensão do navegador
Chrome: React Developer Tools
Firefox: React Developer Tools
```

### Vite Dev Server
- Hot Module Replacement (HMR) automático
- Error overlay no browser
- Source maps para debugging

### TypeScript Errors
```bash
# Check de tipos
npx tsc --noEmit
```

## Deployment

### Build
```bash
npm run build
```

Gera pasta `/dist` com arquivos otimizados.

### Deploy Platforms
- **Vercel** - Recomendado para Vite
- **Netlify** - Suporte nativo
- **GitHub Pages** - Gratuito
- **Firebase Hosting** - Google Cloud

### Exemplo: Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Troubleshooting

### Erro: Cannot find module
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro: Port já em uso
```bash
# Matar processo na porta 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5173 | xargs kill
```

### TypeScript errors
```bash
# Verificar versão
npx tsc --version

# Rebuild
npm run build
```

## Próximos Passos

### Features Planejadas
- [ ] Backend integration (Supabase)
- [ ] Autenticação de usuários
- [ ] Persistência de dados real
- [ ] Upload de imagens
- [ ] Compartilhamento de viagens
- [ ] Notificações
- [ ] Conversão para React Native

### Melhorias Técnicas
- [ ] Testes unitários (Jest + React Testing Library)
- [ ] Testes E2E (Playwright)
- [ ] State management (Zustand/Redux)
- [ ] API layer (React Query)
- [ ] Form validation (Zod + React Hook Form)
- [ ] Internacionalização (i18n)

## Recursos Úteis

### Documentação Oficial
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)

### Ferramentas
- [VS Code](https://code.visualstudio.com/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)

### Comunidade
- [React Discord](https://discord.gg/react)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/reactjs)
- [GitHub Discussions](https://github.com/facebook/react/discussions)

## Contribuindo

1. Criar branch para feature
2. Fazer alterações
3. Testar localmente
4. Commit com mensagem descritiva
5. Push e criar Pull Request

### Commit Messages
```
feat: adicionar nova feature
fix: corrigir bug
docs: atualizar documentação
style: mudanças de formatação
refactor: refatorar código
test: adicionar testes
```

## Suporte

Para dúvidas ou problemas, consulte:
1. Documentação nesta pasta `/doc`
2. Issues no repositório
3. Contato com a equipe
