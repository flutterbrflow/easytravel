# EasyTravel - Visão Geral do Aplicativo

## Sobre o Projeto

**EasyTravel** é um aplicativo de planejamento de viagens que permite aos usuários organizar roteiros, controlar gastos e guardar memórias de suas aventuras em um único lugar.

## Características Principais

### 🗺️ Planejamento de Viagens
- Criar e gerenciar múltiplas viagens
- Definir destinos, datas de ida e volta
- Adicionar participantes e compartilhar itinerários
- Visualizar viagens próximas e passadas
- Organização por status (planejando, próximas, realizadas)

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
- **React** 18+ - Biblioteca JavaScript para construção de interfaces
- **React Router DOM** 6+ - Gerenciamento de rotas
- **TypeScript** - Superset tipado de JavaScript
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **Supabase** - Backend-as-a-Service (Auth, DB, Storage)

### Versão Mobile
- **React Native** - Framework para apps nativos
- **Expo** - Plataforma e ferramentas para React Native
- **Expo Router / React Navigation** - Navegação nativa

## Estrutura do Projeto

```
easytravel/
├── web/                 # Aplicação Web (React + Vite)
│   ├── src/
│   │   ├── components/  # Componentes Web
│   │   ├── services/    # Serviços (API, Auth)
│   │   └── App.tsx      # Componente raiz Web
├── mobile/              # Aplicação Mobile (React Native + Expo)
│   ├── components/      # Componentes Mobile
│   ├── services/        # Serviços (API, Auth)
│   └── App.tsx          # Componente raiz Mobile
├── doc/                 # Documentação
└── package.json         # Dependências raiz
```

## Público-Alvo

- Viajantes frequentes
- Pessoas que desejam organizar suas viagens
- Grupos de amigos planejando aventuras juntos
- Qualquer pessoa que queira manter memórias de suas viagens

## Status do Projeto

✅ Interface Web Responsiva
✅ Design Mobile-First na Web e App Nativo
✅ Integração Supabase Completa (Auth, Banco de Dados, Storage)
✅ Autenticação (Login, Cadastro, Sessão)
✅ CRUD de Viagens (Criar, Listar, Editar, Excluir)
✅ Upload de Imagens (Capa de viagem, Avatar)
✅ Filtros de Viagens (Próximas, Realizadas)
🚧 Refinamento de UI/UX em andamento
🚧 Módulo de Gastos e Memórias (Em desenvolvimento)

## Licença

Projeto privado - Todos os direitos reservados

## Contato

Para mais informações sobre o projeto, consulte a documentação técnica na pasta `/doc`.
