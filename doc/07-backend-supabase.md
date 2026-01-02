# Backend Supabase - EasyTravel

Esta seção documenta a implementação do backend utilizando Supabase para as versões Web e Mobile do EasyTravel.

## Visão Geral

O projeto utiliza Supabase como Backend-as-a-Service (BaaS) para:
- **Autenticação:** Gerenciamento de usuários
- **Banco de Dados:** PostgreSQL para persistência de dados
- **Storage:** Armazenamento de imagens (buckets 'avatars' e 'memories')

## Storage

### Buckets

#### `avatars`
Armazena fotos de perfil dos usuários.
- **Acesso:** Público (Leitura)
- **RLS:** Autenticados podem fazer upload/update (apenas seus próprios arquivos, validado por nome da pasta/arquivo ou policy)
- **Cache Busting:** O front-end (Web e Mobile) deve implementar cache busting appendando `?t=timestamp` à URL da imagem, pois o Supabase/CDN faz cache agressivo de arquivos com mesmo nome.

#### `trip-images` (Planejado)
Imagens de capa para viagens.

#### `memories` (Planejado)
Fotos privadas de memórias da viagem.

## Estrutura do Banco de Dados

### Tabelas

#### `profiles`
Estende a tabela `auth.users` do Supabase com dados públicos do perfil.
- `id`: FK para auth.users (PK)
- `name`: Nome do usuário
- `avatar_url`: URL da foto de perfil

#### `trips`
Armazena as viagens criadas pelos usuários.
- `id`: UUID (PK)
- `user_id`: FK para profiles (usuários podem ver apenas suas viagens)
- `destination`: Destino da viagem
- `status`: 'upcoming', 'planning', 'past'

#### `expenses`
Despesas associadas a uma viagem.
- `id`: UUID (PK)
- `trip_id`: FK para trips (Delete Cascade)
- `amount`: Valor da despesa
- `category`: Categoria (Alimentação, Transporte, etc)

#### `memories`
Fotos e memórias de viagens.
- `id`: UUID (PK)
- `trip_id`: FK para trips
- `image_url`: URL da imagem no Storage

## Autenticação

### Web
Utiliza `@supabase/supabase-js`. O estado da sessão é gerenciado pelo `AuthContext` em `web/contexts/AuthContext.tsx`.

### Mobile
Utiliza `@supabase/supabase-js` com `@react-native-async-storage/async-storage` para persistência de sessão.
Configurado em `mobile/lib/supabase.ts` e `mobile/contexts/AuthContext.tsx`.

## Configuração

Variáveis de ambiente necessárias:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### Web
Arquivo `.env` na raiz do projeto web:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Mobile
Arquivo `.env` na raiz do projeto mobile:
```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## TypeScript

Os tipos do banco de dados são gerados automaticamente e salvos em:
- Web: `web/lib/supabase-types.ts`
- Mobile: `mobile/types/database-types.ts`
