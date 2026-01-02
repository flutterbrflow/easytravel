# Guia de Componentes

## Visão Geral

Este documento detalha todos os componentes da aplicação EasyTravel, suas props, funcionalidades e exemplos de uso.

---

## App.tsx

**Tipo:** Componente Raiz  
**Localização:** `/App.tsx`

### Descrição
Componente principal que configura o roteamento da aplicação usando React Router DOM com HashRouter.

### Responsabilidades
- Configurar rotas da aplicação
- Renderizar container mobile (max-width: 448px)
- Gerenciar tema dark/light através de classes CSS

### Estrutura
```tsx
<HashRouter>
  <div className="mobile-container">
    <Routes>
      <Route path="/" element={<WelcomeScreen />} />
      <Route path="/list" element={<TripListScreen />} />
      <Route path="/new" element={<NewTripScreen />} />
    </Routes>
  </div>
</HashRouter>
```

### Routes
| Path | Componente | Descrição |
|------|-----------|-----------|
| `/` | WelcomeScreen | Tela inicial de boas-vindas |
| `/list` | TripListScreen | Lista de viagens do usuário |
| `/new` | NewTripScreen | Formulário para criar nova viagem |

---

## WelcomeScreen

**Tipo:** Screen Component  
**Localização:** `/components/WelcomeScreen.tsx`

### Descrição
Tela de boas-vindas que apresenta o aplicativo ao usuário pela primeira vez.

### Características
- Hero image com overlay gradient
- Título e descrição do app
- Ícones de features principais
- CTA button para começar
- Indicadores de paginação
- Link para login

### Estrutura Visual
```
┌─────────────────────────────┐
│   [Hero Image]              │
│   (Aspect ratio 3:4)        │
│                             │
│   Explore o Mundo           │
│   sem Estresse              │
│                             │
│   [Description]             │
│                             │
│   [Roteiros] [Gastos] [Mem] │
│                             │
│   [●  ○  ○]                 │
│   [Começar Agora →]         │
│   [Já tem conta? Entrar]    │
└─────────────────────────────┘
```

### Props
Nenhuma

### Hooks Utilizados
- `useNavigate()` - Para navegação

### Interações
| Elemento | Ação | Resultado |
|----------|------|-----------|
| Botão "Começar Agora" | Click | Navega para `/list` |
| Link "Entrar" | Click | Link placeholder |

### Seções
1. **Hero Section** - Imagem principal com gradient overlay
2. **Text Content** - Título, descrição e feature icons
3. **Footer Actions** - Indicadores, CTA button e login link

---

## TripListScreen

**Tipo:** Screen Component  
**Localização:** `/components/TripListScreen.tsx`

### Descrição
Tela principal que exibe a lista de viagens do usuário com navegação bottom.

### Características
- Header com avatar e settings
- Segmented control (Próximas/Passadas)
- Lista scrollável de viagens
- FAB para adicionar nova viagem
- Bottom navigation bar

### Estado Local
```typescript
const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
```

### Sub-componentes

#### TripCard
**Props:**
```typescript
interface TripCardProps {
  trip: Trip;
}
```

**Estrutura:**
- Imagem de destino (h-40)
- Status badge (timing/label)
- Título do destino
- Datas de viagem
- Botão de ação (chevron)

#### NavItem
**Props:**
```typescript
interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
}
```

### Estrutura Visual
```
┌─────────────────────────────┐
│ [Avatar]    [⚙️ Settings]   │
│ Minhas Viagens              │
│ [Próximas | Passadas]       │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ [Trip Image]            │ │
│ │ [Badge: Faltam 15 dias] │ │
│ ├─────────────────────────┤ │
│ │ Paris, França       [>] │ │
│ │ 10 Out - 24 Out         │ │
│ └─────────────────────────┘ │
│                             │
│ [+ Planejar nova aventura]  │
├─────────────────────────────┤
│                       [FAB] │
├─────────────────────────────┤
│ [Nav: Viagens|Explorar|...] │
└─────────────────────────────┘
```

### Interações
| Elemento | Ação | Resultado |
|----------|------|-----------|
| Tab "Próximas" | Click | Filtra a lista para exibir apenas viagens futuras ou em andamento |
| Tab "Passadas" | Click | Filtra a lista para exibir apenas viagens encerradas |
| FAB (+) | Click | Navega para `/new` |
| Botão "Planejar nova" | Click | Navega para `/new` |
| TripCard | Click | Navega para detalhes (WIP) |

### Dados Mock
Utiliza `MOCK_TRIPS` de `constants.ts`:
- Paris, França
- Tóquio, Japão
- Nova York, EUA

---

## NewTripScreen

**Tipo:** Screen Component  
**Localização:** `/components/NewTripScreen.tsx`

### Descrição
Formulário completo para criar uma nova viagem com todos os detalhes.

### Características
- Header com cancelar/salvar
- Input de destino com ícone
- Seletor de datas (calendário)
- Seleção de participantes
- Campo de notas/descrição
- Sticky footer com CTA

### Sub-componentes

#### Participant
**Props:**
```typescript
interface ParticipantProps {
  avatar: string;
  name: string;
  isUser?: boolean;
}
```

Renderiza avatar circular com nome e badge opcional "Eu".

#### Calendar (Custom)
**Props:**
- `startDate`: string
- `endDate`: string
- `onSelectDate`: (date: string) => void

Renderiza um calendário interativo com seleção de período (range).
- **Web:** Utiliza lógica customizada de seleção.
- **Mobile:** Componente `CustomCalendar` nativo com `TouchableOpacity`.

### Estrutura Visual
```
┌─────────────────────────────┐
│ [Cancelar] Nova Viagem [Sal]│
├─────────────────────────────┤
│ Vamos planejar sua          │
│ próxima aventura?           │
│                             │
│ Para onde você vai?         │
│ [📍 Ex: Paris, França]      │
│                             │
│ Quando?              [Limpa]│
│ ┌─────────┐ ┌─────────────┐ │
│ │IDA      │ │VOLTA        │ │
│ │5 Jul'24 │ │Selecione    │ │
│ └─────────┘ └─────────────┘ │
│                             │
│ [Calendar Component]        │
│                             │
│ Quem vai com você? [Convid] │
│ [👤Você][👤André][👤Sofia][+]│
│                             │
│ Notas ou Descrição          │
│ [Text Area]                 │
│                             │
├─────────────────────────────┤
│ [🛫 Criar Viagem]           │
└─────────────────────────────┘
```

### Campos do Formulário
| Campo | Tipo | Required | Placeholder |
|-------|------|----------|-------------|
| Destino | Text Input | Sim | "Ex: Paris, França" |
| Data Ida | Date | Sim | - |
| Data Volta | Date | Não | "Selecione" |
| Participantes | Multi-select | Não | - |
| Notas | TextArea | Não | "Escreva algo..." |

### Interações
| Elemento | Ação | Resultado |
|----------|------|-----------|
| Botão "Cancelar" | Click | Navega back (-1) |
| Botão "Salvar" | Click | Navega para `/list` |
| Input Destino | Focus | Mostra teclado |
| Calendário | Click dia | Seleciona data |
| Botão "Limpar" | Click | Reseta datas |
| Botão "Convidar" | Click | Placeholder |
| Botão "+" participantes | Click | Placeholder |
| Botão "Criar Viagem" | Click | Navega para `/list` |

### Validação
⚠️ Atualmente sem validação implementada

---

## Componentes Compartilhados

### Material Symbols Icons
Utiliza ícones do Google Material Symbols:
- `map` - Roteiros
- `payments` - Gastos
- `photo_library` - Memórias
- `airplane_ticket` - Viagens
- `explore` - Explorar
- `bookmark` - Salvos
- `person` - Perfil
- `settings` - Configurações
- `location_on` - Localização
- `flight_takeoff` - Criar viagem
- `add` - Adicionar
- `share` - Compartilhar
- `timer` - Tempo restante

### Padrões de Estilo

#### Botões
```typescript
// Primary Button
className="bg-primary hover:bg-blue-600 active:bg-blue-700 
           text-white font-bold rounded-xl h-14"

// Secondary Button
className="border-2 border-dashed border-gray-300 
           hover:bg-gray-50 rounded-2xl"

// Icon Button
className="size-10 rounded-full hover:bg-gray-200"
```

#### Cards
```typescript
className="rounded-2xl bg-white dark:bg-[#1e2a36] 
           shadow-md overflow-hidden"
```

#### Inputs
```typescript
className="rounded-xl bg-white dark:bg-surface-dark 
           border focus-within:border-primary/50 
           p-4 h-14"
```

---

## Type Definitions

### Trip Interface
```typescript
interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  status: 'upcoming' | 'planning' | 'past';
  daysLeft?: number;
  timeLabel?: string;
}
```

### User Interface
```typescript
interface User {
  name: string;
  avatarUrl: string;
}
```

### AppRoute Enum
```typescript
enum AppRoute {
  WELCOME = '/',
  LIST = '/list',
  NEW_TRIP = '/new',
}
```

---

## Boas Práticas

✅ **Componentização:** Quebrar componentes grandes em sub-componentes reutilizáveis  
✅ **TypeScript:** Sempre tipar props e estado  
✅ **Acessibilidade:** Usar tags semânticas e alt text  
✅ **Performance:** Evitar re-renders desnecessários  
✅ **Responsividade:** Mobile-first approach  
✅ **Dark Mode:** Sempre incluir variantes dark:
