# 06 - Sistema Offline-First com Cache

> **Documentação Técnica Completa do Sistema de Cache Offline do EasyTravel Mobile**

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Componentes](#componentes)
4. [Sincronização](#sincronização)
5. [Cache de Imagens](#cache-de-imagens)
6. [Guia de Uso](#guia-de-uso)
7. [Testes](#testes)
8. [Expo Go vs Standalone](#expo-go-vs-standalone)

---

## Visão Geral

O EasyTravel Mobile implementa uma **arquitetura offline-first** que garante funcionalidade completa mesmo sem conexão com a internet.

### Características Principais

✅ **Offline-First**: Todas as operações são gravadas localmente primeiro  
✅ **Sincronização Automática**: Dados sincronizam automaticamente ao voltar online  
✅ **Cache de Imagens**: Imagens são armazenadas localmente para acesso offline  
✅ **Fila de Mutações**: Alterações offline são enfileiradas e processadas quando online  
✅ **Consistência de Dados**: Sincronização bidirecional com resolução de conflitos

### Dependências

```json
{
  "expo-sqlite": "~latest",
  "expo-file-system": "~latest",
  "@react-native-community/netinfo": "~latest"
}
```

---

## Arquitetura

### Camadas do Sistema

```
┌─────────────────────────────────────┐
│         UI Components               │
│  (TripListScreen, ProfileScreen)    │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│         API Layer                   │
│  (api.ts - Optimistic Writes)       │
└────────────┬────────────────────────┘
             │
     ┌───────┴───────┐
     │               │
┌────▼─────┐   ┌────▼──────┐
│ LocalDB  │   │  Queue    │
│ (SQLite) │   │ (Mutations)│
└──────────┘   └─────┬─────┘
                     │
            ┌────────▼────────┐
            │   SyncService   │
            │  (Push/Pull)    │
            └────────┬────────┘
                     │
            ┌────────▼────────┐
            │    Supabase     │
            │  (Backend/DB)   │
            └─────────────────┘
```

### Fluxo de Dados

1. **Criação Offline**: UI → API → LocalDB + Queue
2. **Sincronização**: Queue → SyncService → Supabase
3. **Pull de Dados**: Supabase → SyncService → LocalDB → UI

---

## Componentes

### 1. NetworkContext

**Arquivo**: `contexts/NetworkContext.tsx`

Gerencia estado de conectividade e orquestra sincronização.

**Responsabilidades**:
- Monitora conectividade via NetInfo
- Inicializa banco de dados local
- Dispara sincronização ao voltar online
- Fornece API de sincronização manual

**API**:
```typescript
interface NetworkContextType {
    isConnected: boolean | null;
    syncNow: () => Promise<void>;
    checkConnectivity: () => Promise<boolean>;
    isSyncing: boolean;
}
```

**Uso**:
```tsx
import { useNetwork } from '../contexts/NetworkContext';

const { isConnected, syncNow, isSyncing } = useNetwork();

// Verificar conexão
if (!isConnected) {
    console.log('Offline mode');
}

// Sincronizar manualmente
await syncNow();
```

### 2. Local Database

**Arquivo**: `services/localDb.ts`

Banco SQLite local que espelha schema do Supabase.

**Tabelas**:
- `trips`: Viagens
- `expenses`: Despesas
- `memories`: Memórias/fotos
- `profiles`: Perfis de usuários
- `mutation_queue`: Fila de sincronização
- `sync_state`: Estado de sincronização

**Exemplo de Tabela**:
```sql
CREATE TABLE trips (
    id TEXT PRIMARY KEY,
    destination TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    image_url TEXT,
    status TEXT NOT NULL,
    description TEXT,
    user_id TEXT NOT NULL,
    created_at TEXT,
    updated_at TEXT,
    is_synced INTEGER DEFAULT 1
);
```

### 3. API Layer

**Arquivo**: `services/api.ts`

Camada de abstração com gravação otimista.

**Padrão de Gravação Otimista**:
```typescript
async create(trip: TripInsert) {
    // 1. Gerar ID
    const id = generateUUID();
    
    // 2. Gravar localmente IMEDIATAMENTE
    await db.runAsync('INSERT INTO trips...', values);
    
    // 3. Enfileirar para sincronização
    await queueMutation('trips', 'INSERT', id, tripData);
    
    // 4. Tentar sincronizar (não bloqueante)
    if (online) SyncService.push();
    
    return newTrip; // Retorna imediatamente
}
```

### 4. Sync Service

**Arquivo**: `services/syncService.ts`

Gerencia sincronização bidirecional.

**Métodos Principais**:

#### Pull (Remoto → Local)
```typescript
async pull() {
    await this.pullTable('trips');
    await this.pullTable('expenses');
    await this.pullTable('memories');
    await this.pullTable('profiles');
    await this.pullDeletions('trips');
}
```

#### Push (Local → Remoto)
```typescript
async push() {
    const mutations = await getMutations();
    
    for (const mutation of mutations) {
        // Upload de imagens locais se necessário
        if (payload.image_url?.startsWith('file://')) {
            const publicUrl = await uploadFileToStorage(...);
            payload.image_url = publicUrl;
        }
        
        // Executar no Supabase
        await supabase.from(table).insert/update/delete(payload);
        
        // Remover da fila
        await deleteMutation(mutation.id);
    }
}
```

### 5. CachedImage Component

**Arquivo**: `components/CachedImage.tsx`

Componente que gerencia cache de imagens automaticamente.

**Características**:
- Baixa imagens HTTP e armazena localmente
- Usa URIs locais (`file://`) diretamente
- Placeholder enquanto carrega
- Funciona offline após cache

**Uso**:
```tsx
<CachedImage
    uri={trip.image_url}
    style={styles.coverImage}
    placeholder={IMAGES.defaultCover}
/>
```

**Fluxo Interno**:
1. URI local? → Usa diretamente
2. Existe em cache? → Carrega do cache
3. URI HTTP? → Baixa e salva no cache
4. Erro? → Usa placeholder

---

## Sincronização

### Cenários de Uso

#### 1. Criar Viagem Offline

```typescript
// Usuario offline cria viagem
const trip = await api.trips.create({
    destination: 'Paris',
    start_date: '2026-03-01',
    end_date: '2026-03-10',
    user_id: userId
});

// Viagem salva localmente + mutation enfileirada
console.log(trip.id); // UUID gerado localmente

// Usuario volta online
// → NetworkContext detecta
// → SyncService.push() automático
// → Mutation processada
// → Viagem sincronizada no Supabase
```

#### 2. Editar Despesa Offline

```typescript
await api.expenses.update(expenseId, {
    amount: 280.00,
    description: 'Uber + táxi'
});

// Alteração reflete imediatamente na UI
// Mutation UPDATE enfileirada
// Sincroniza quando voltar online
```

#### 3. Upload de Imagem Offline

```typescript
// Seleciona imagem e salva localmente
const localPath = await saveImageLocally(imageUri);

await api.profiles.update(userId, {
    avatar_url: localPath // file://...
});

// Ao voltar online:
// → SyncService detecta file://
// → Upload para Supabase Storage
// → URL atualizada para https://...
// → Record atualizado no Supabase
```

### Resolução de Conflitos

O sistema usa estratégia **Last-Write-Wins**:
- Última alteração sobrescreve anterior
- Baseado em `updated_at` timestamp
- Adequado para maioria dos casos de uso

Para cenários críticos, considere:
- Versionamento com coluna `version`
- Merge manual de conflitos
- Timestamps mais granulares (milliseconds)

---

## Cache de Imagens

### Diretório de Cache

```
DocumentDirectory/image_cache/
├── avatar_user123_1704334800000.jpg
├── trip_abc123.jpg
├── memory_xyz789.jpg
└── ...
```

### Ciclo de Vida

1. **Primeira visualização (online)**:
   - Componente recebe URL HTTP
   - Download inicia em background
   - Salva em `image_cache/`
   - Renderiza imagem

2. **Visualizações subsequentes**:
   - Verifica cache primeiro
   - Cache hit → Renderiza imediatamente
   - Cache miss → Download novamente

3. **Modo offline**:
   - Apenas cache local é usado
   - Sem downloads
   - Imagens cacheadas exibidas normalmente

### Otimizações

- **Nomes únicos**: Evita colisões
- **Extensões preservadas**: Mantém formato original
- **Verificação de existência**: Evita downloads redundantes
- **Fallback para placeholder**: UX consistente

---

## Guia de Uso

### Inicialização

O sistema é inicializado automaticamente pelo `NetworkContext`:

```tsx
// App.tsx
import { NetworkProvider } from './contexts/NetworkContext';

function App() {
    return (
        <NetworkProvider>
            {/* Resto do app */}
        </NetworkProvider>
    );
}
```

### Criar Dados Offline

```typescript
import { api } from '../services/api';

// Funciona identicamente online ou offline
const trip = await api.trips.create({
    destination: 'Tokyo',
    start_date: '2026-04-01',
    end_date: '2026-04-10',
    user_id: user.id
});

// Retorna imediatamente com ID local
// Sincroniza automaticamente quando online
```

### Sincronização Manual

```typescript
import { useNetwork } from '../contexts/NetworkContext';

function SyncButton() {
    const { syncNow, isSyncing } = useNetwork();
    
    return (
        <TouchableOpacity onPress={syncNow} disabled={isSyncing}>
            <Text>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</Text>
        </TouchableOpacity>
    );
}
```

### Verificar Conectividade

```typescript
const { isConnected, checkConnectivity } = useNetwork();

// Estado atual
if (!isConnected) {
    Alert.alert('Offline', 'Você está sem conexão');
}

// Verificação manual
const online = await checkConnectivity();
```

### Sincronização Forçada (Reset)

```typescript
import { SyncService } from '../services/syncService';

// Reseta estado e re-sincroniza tudo
await SyncService.resetSync();
```

---

## Testes

### Teste Básico: Criar Viagem Offline

1. Ativar modo avião
2. Criar nova viagem
3. Verificar que aparece na lista
4. Desativar modo avião
5. Aguardar 3-5 segundos
6. Verificar no Supabase Dashboard

**Resultado esperado**: Viagem sincronizada no backend

### Teste de Cache: Avatar Offline

1. (Online) Atualizar avatar no perfil
2. Aguardar upload completar
3. Fechar app
4. Ativar modo avião
5. Reabrir app
6. Navegar para perfil

**Resultado esperado**: Avatar carrega instantaneamente do cache

### Verificação Técnica

```bash
# Android - Inspecionar banco SQLite
adb exec-out run-as <package> cat databases/easytravel.db > local.db
sqlite3 local.db "SELECT COUNT(*) FROM mutation_queue;"

# Verificar cache de imagens
adb shell run-as <package> ls -lh files/image_cache/
```

### Casos de Teste Completos

Ver arquivo: `testing_guide.md` para 7 casos de teste detalhados

---

## Expo Go vs Standalone

### Limitações do Expo Go

| Recurso | Expo Go | Standalone |
|---------|---------|------------|
| SQLite | ✅ Funciona | ✅ Funciona |
| FileSystem | ✅ Funciona | ✅ Funciona |
| Cache persistente | ⚠️ Pode ser limpo | ✅ Persistente |
| Background sync | ❌ Não suportado | ✅ Suportado |
| Performance | ⚠️ Razoável | ✅ Otimizada |

### Quando Usar

**Expo Go**: Desenvolvimento, testes rápidos, demos  
**Standalone**: Produção, testes de performance, release

### Build Standalone

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Configurar
eas build:configure

# Build de desenvolvimento
eas build --profile development --platform android

# Build de produção
eas build --profile production --platform android
```

---

## Troubleshooting

### Imagens não aparecem offline

**Problema**: Placeholder ao invés da imagem cacheada

**Soluções**:
1. Verificar diretório de cache existe
2. Confirmar imagem foi baixada (logs)
3. Limpar cache e forçar re-download

```typescript
import * as FileSystem from 'expo-file-system';

const cacheDir = FileSystem.documentDirectory + 'image_cache/';
const info = await FileSystem.getInfoAsync(cacheDir);
console.log('Cache exists:', info.exists);
```

### Sincronização não ocorre

**Problema**: Mutations ficam na fila

**Soluções**:
1. Verificar eventos de NetInfo
2. Forçar sincronização manual
3. Verificar erros de rede nos logs

```typescript
// Verificar fila
const db = getDB();
const mutations = await db.getAllAsync('SELECT * FROM mutation_queue');
console.log('Pending mutations:', mutations.length);
```

### App lento com muitos dados

**Problema**: UI congela durante sync

**Soluções**:
1. Implementar batch processing
2. Usar transações SQLite
3. Adicionar debounce na sincronização

---

## Referências

- [Expo SQLite Docs](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Expo FileSystem Docs](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [NetInfo Docs](https://github.com/react-native-netinfo/react-native-netinfo)
- [Offline-First Patterns](https://offlinefirst.org/)

---

## Próximos Passos

### Melhorias Planejadas

- [ ] Background sync com `expo-task-manager`
- [ ] Retry logic com exponential backoff
- [ ] Compressão de imagens antes de upload
- [ ] Indicador visual de estado de sincronização
- [ ] Estatísticas de cache e sync

---

**Desenvolvido com ❤️ para garantir a melhor experiência offline**

*Última atualização: Janeiro 2026*
