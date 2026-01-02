# EasyTravel - Visão Geral do Aplicativo

## Sobre o Projeto

**EasyTravel** é um aplicativo de planejamento de viagens que permite aos usuários organizar roteiros, controlar gastos e guardar memórias de suas aventuras em um único lugar.

## Características Principais

### 🗺️ Planejamento de Viagens
- Criar e gerenciar múltiplas viagens
- Definir destinos, datas de ida e volta
- Adicionar participantes e compartilhar itinerários
- Visualizar viagens próximas e passadas
- Organização por status (planejando, próximas, passadas)

### 💰 Controle de Gastos
- Acompanhar despesas relacionadas a cada viagem
- Categorização de gastos
- Visualização de orçamento e saldo

### 📸 Memórias
- Galeria de fotos de cada viagem
- Organização de memórias por destino
- Compartilhamento de experiências

## Tecnologias Utilizadas

### Versão Web
- **React** 19.2.3 - Biblioteca JavaScript para construção de interfaces
- **React Router DOM** 7.11.0 - Gerenciamento de rotas
- **TypeScript** 5.8.2 - Superset tipado de JavaScript
- **Vite** 6.2.0 - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **Google Fonts** - Plus Jakarta Sans, Noto Sans
- **Material Symbols** - Ícones do Google

## Estrutura do Projeto

```
easytravel/
├── components/          # Componentes React
│   ├── WelcomeScreen.tsx
│   ├── TripListScreen.tsx
│   └── NewTripScreen.tsx
├── doc/                 # Documentação
├── App.tsx              # Componente raiz
├── index.tsx            # Ponto de entrada
├── types.ts             # Definições TypeScript
├── constants.ts         # Constantes e dados mock
├── index.html           # Template HTML
├── package.json         # Dependências
├── tsconfig.json        # Configuração TypeScript
└── vite.config.ts       # Configuração Vite
```

## Público-Alvo

- Viajantes frequentes
- Pessoas que desejam organizar suas viagens
- Grupos de amigos planejando aventuras juntos
- Qualquer pessoa que queira manter memórias de suas viagens

## Status do Projeto

✅ Interface Web Responsiva  
✅ Modo Escuro/Claro  
✅ Design Mobile-First  
🚧 Conversão para React Native em andamento  
📱 Futuras features: Sincronização, Backend, Autenticação

## Licença

Projeto privado - Todos os direitos reservados

## Contato

Para mais informações sobre o projeto, consulte a documentação técnica na pasta `/doc`.
