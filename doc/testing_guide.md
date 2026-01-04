# Guia de Testes - Sistema de Cache Offline

## 📝 Visão Geral

Este guia fornece casos de teste detalhados para validar o sistema de cache offline do EasyTravel Mobile. Cada teste inclui:
- **Objetivo claro**
- **Pré-requisitos**
- **Passos detalhados**
- **Resultados esperados**
- **Verificações técnicas**
- **Troubleshooting**

---

## 🔧 Configuração Inicial

### Preparar Ambiente de Desenvolvimento

```bash
# 1. Navegar para o diretório do projeto mobile
cd d:\Sistemas\easytravel\mobile

# 2. Instalar dependências (se necessário)
npm install

# 3. Iniciar o servidor de desenvolvimento
npx expo start --clear

# 4. Conectar dispositivo/emulador
# - Android: Pressionar 'a' no terminal
# - iOS: Pressionar 'i' no terminal
```

### Habilitar Logs de Debug

Adicione estas linhas temporariamente para visualizar logs detalhados:

**[contexts/NetworkContext.tsx](file:///d:/Sistemas/easytravel/mobile/contexts/NetworkContext.tsx):**
```typescript
// Linha 33
console.log('[NetworkContext] Sync inicial:', state.isConnected ? 'Tentando' : 'Pulando');

// Linha 53
console.log('[NetworkContext] Voltou online! Disparando sync...');

// Linha 68
console.log('[NetworkContext] Sync iniciado. Mutações pendentes a processar.');
```

**[services/syncService.ts](file:///d:/Sistemas/easytravel/mobile/services/syncService.ts):**
```typescript
// Linha 127
console.log('[SyncService] Processando', mutations.length, 'mutações pendentes');

// Linha 150
console.log('[SyncService] Imagem enviada:', publicUrl);
```

**[components/CachedImage.tsx](file:///d:/Sistemas/easytravel/mobile/components/CachedImage.tsx):**
```typescript
// Linha 49
console.log('[CachedImage] ✅ Cache HIT:', fileName);

// Linha 60
console.log('[CachedImage] ⬇️ Baixando:', fileName);
```

### Ferramentas de Monitoramento

#### React Native Debugger (Recomendado)
```bash
# Instalar React Native Debugger
# Windows
choco install react-native-debugger

# macOS
brew install --cask react-native-debugger

# Abrir após iniciar o app
# Menu: Debug → Open Debugger
```

#### React DevTools
```bash
npx react-devtools
```

#### Inspecionar Banco SQLite (Android)

```bash
# Copiar banco para o computador
adb exec-out run-as <package-name> cat databases/easytravel.db > easytravel.db

# Abrir com SQLite Browser
# Download: https://sqlitebrowser.org/
```

---

## 🧪 Casos de Teste

### Teste 1: Criação de Viagem Offline

**ID:** `TEST-OFFLINE-001`  
**Prioridade:** Alta  
**Duração:** ~5 minutos

#### Objetivo
Verificar que viagens podem ser criadas totalmente offline e sincronizadas posteriormente.

#### Pré-requisitos
- App instalado e autenticado
- Conexão de internet ativa inicialmente

#### Passos

1. **Ativar Modo Offline**
   - Android: Deslizar do topo → Ativar "Modo Avião"
   - iOS: Central de Controle → Ativar "Modo Avião"
   - Emulador: Configurações → Network → Airplane Mode ON

2. **Verificar Estado Offline no App**
   - Observar indicador de status (se implementado)
   - Console deve mostrar: `[NetworkContext] isConnected: false`

3. **Navegar para Nova Viagem**
   - Tela de viagens → Botão "+"
   - Ou menu inferior → "Viagens" → "Nova Viagem"

4. **Preencher Formulário**
   - **Destino:** `Bangkok, Tailândia`
   - **Data Ida:** `15/03/2026`
   - **Data Volta:** `25/03/2026`
   - **Descrição:** `Viagem de aventura pelo sudeste asiático`
   - **Imagem:** Selecionar foto da galeria (obrigatório para este teste)

5. **Salvar Viagem**
   - Clicar em "Criar Viagem"
   - ⏱️ **Tempo esperado:** < 500ms

#### Resultados Esperados

✅ **UI:**
- Viagem aparece imediatamente na lista
- Imagem de capa é exibida (armazenada localmente)
- Card da viagem mostra: destino, datas, imagem
- Sem mensagens de erro
- Sem spinners ou loading infinito

✅ **Console:**
```
[API] Criando viagem offline: Bangkok, Tailândia
[LocalDB] INSERT trip: <uuid>
[Queue] Mutation enfileirada: INSERT trips
[SyncService] Push ignorado (offline)
```

✅ **Banco de Dados:**

Verificar com query SQL:
```sql
-- Viagem foi salva localmente
SELECT * FROM trips WHERE destination LIKE '%Bangkok%';
-- Resultado esperado: 1 row

-- Mutação foi enfileirada
SELECT * FROM mutation_queue WHERE table_name = 'trips' AND action = 'INSERT';
-- Resultado esperado: 1 row (JSON com dados da viagem)
```

6. **Voltar Online**
   - Desativar "Modo Avião"
   - Aguardar 3-5 segundos

#### Resultados Esperados (Sincronização)

✅ **Console:**
```
[NetworkContext] Voltou online! Disparando sync...
[SyncService] Processando 1 mutações pendentes
[SyncService] Detectada imagem local: file://...
[SyncService] Imagem enviada: https://...supabase.co/storage/...
[LocalDB] UPDATE trip image_url: https://...
[Supabase] INSERT trip: <uuid>
[Queue] DELETE mutation: <id>
[SyncService] Sync completo. 1 mutations processadas.
```

✅ **Banco de Dados:**
```sql
-- Fila deve estar vazia
SELECT COUNT(*) FROM mutation_queue;
-- Resultado: 0

-- image_url deve ser URL pública (não file://)
SELECT image_url FROM trips WHERE destination LIKE '%Bangkok%';
-- Resultado: https://...supabase.co/storage/...
```

✅ **Supabase Dashboard:**
- Navegar para `Database > trips`
- Confirmar registro existe com ID correto
- Verificar `image_url` aponta para Storage
- Navegar para `Storage > trip-images`
- Confirmar arquivo de imagem existe

#### Troubleshooting

| Problema | Possível Causa | Solução |
|---|---|---|
| Viagem não aparece na lista | Estado local não atualizado | Puxar para atualizar (pull-to-refresh) |
| Imagem não aparece | Permissão de galeria negada | Ir em Configurações → Permissões |
| Sync não dispara ao voltar online | Evento de rede não capturado | Fechar e reabrir app |
| Erro "Network request failed" | Problema de DNS ou firewall | Testar com outra rede |

---

### Teste 2: Edição de Despesa Offline

**ID:** `TEST-OFFLINE-002`  
**Prioridade:** Alta  
**Duração:** ~4 minutos

#### Objetivo
Validar que despesas existentes podem ser editadas offline e sincronizadas corretamente.

#### Pré-requisitos
- Pelo menos 1 viagem criada
- Pelo menos 1 despesa criada (online)

#### Passos

1. **Criar Despesa (Online)**
   - Navegar para uma viagem
   - Aba "Gastos" → Botão "+"
   - **Categoria:** Transporte
   - **Valor:** R$ 150,00
   - **Descrição:** Uber para aeroporto
   - **Data:** Hoje
   - Salvar

2. **Verificar Sincronização**
   - Aguardar 2 segundos
   - Confirmar que despesa aparece na lista

3. **Ativar Modo Offline**
   - Modo Avião ON
   - Console: `[NetworkContext] isConnected: false`

4. **Editar Despesa**
   - Clicar na despesa criada
   - Alterar **Valor:** R$ 280,00
   - Alterar **Descrição:** Uber + táxi para aeroporto
   - Salvar alterações

#### Resultados Esperados

✅ **UI:**
- Despesa atualiza imediatamente
- Novo valor e descrição são exibidos
- Sem erros ou loading infinito

✅ **Console:**
```
[API] Atualizando despesa offline: <uuid>
[LocalDB] UPDATE expense SET amount = 280, description = 'Uber + táxi...'
[Queue] Mutation enfileirada: UPDATE expenses
```

✅ **Banco de Dados:**
```sql
-- Despesa foi atualizada localmente
SELECT amount, description FROM expenses WHERE id = '<uuid>';
-- Resultado: 280.00, 'Uber + táxi para aeroporto'

-- Mutação UPDATE enfileirada
SELECT * FROM mutation_queue WHERE action = 'UPDATE' AND table_name = 'expenses';
-- Resultado: 1 row
```

5. **Voltar Online**
   - Desativar Modo Avião
   - Aguardar sincronização

✅ **Console:**
```
[SyncService] UPDATE expenses: <uuid>
[Supabase] Response: 200 OK
[Queue] DELETE mutation
```

✅ **Supabase:**
- Verificar tabela `expenses`
- Confirmar `amount = 280` e `description` atualizada

---

### Teste 3: Cache de Imagens de Perfil

**ID:** `TEST-CACHE-001`  
**Prioridade:** Crítica  
**Duração:** ~6 minutos

#### Objetivo
Garantir que avatares de perfil permaneçam visíveis offline após serem cacheados.

#### Passos

1. **Online - Atualizar Avatar**
   - Navegar para Perfil
   - Clicar no ícone de edição do avatar
   - Selecionar nova foto da galeria
   - **Observar:** Indicador de loading enquanto upload ocorre
   - Aguardar até foto aparecer

2. **Verificar Cache**
   - Console deve mostrar:
   ```
   [CachedImage] Baixando: avatar_<user-id>_<timestamp>.jpg
   [CachedImage] Download concluído
   [CachedImage] Cache salvo em: /image_cache/avatar_...
   ```

3. **Fechar App Completamente**
   - Android: Recents → Swipe up
   - iOS: Swipe up → Swipe up no app
   - Emulador: Menu → Force Stop

4. **Ativar Modo Offline**
   - Modo Avião ON

5. **Reabrir App**
   - Iniciar app novamente
   - Fazer login (dados de auth cached)

6. **Navegar para Perfil**

#### Resultados Esperados

✅ **UI:**
- Avatar carrega **instantaneamente** (< 100ms)
- Imagem é nítida (não placeholder)
- Sem indicadores de loading

✅ **Console:**
```
[CachedImage] Verificando cache para: avatar_...
[CachedImage] ✅ Cache HIT: avatar_<user-id>_<timestamp>.jpg
[CachedImage] Usando arquivo local: file:///.../image_cache/avatar_...
```

✅ **Verificação Manual:**
- Inspecionar diretório de cache (via adb ou File Explorer):
  ```
  /data/data/com.easytravel.app/files/image_cache/
  ```
- Confirmar arquivo existe e tamanho > 0 bytes

#### Cenário Adicional: Sincronização de Avatar

7. **Ainda Offline - Trocar Avatar Novamente**
   - Selecionar outra foto
   - Observar que foto aparece imediatamente (salva localmente)

8. **Voltar Online**

✅ **Resultado:**
- Console mostra upload para Supabase Storage
- URL local (`file://...`) é substituída por URL pública
- Avatar permanece visível

---

### Teste 4: Sincronização Pull (Remoto → Local)

**ID:** `TEST-SYNC-001`  
**Prioridade:** Alta  
**Duração:** ~5 minutos

#### Objetivo
Validar que mudanças criadas em outro device/web são puxadas para o mobile.

#### Pré-requisitos
- 2 dispositivos OU 1 mobile + web app
- Mesma conta de usuário em ambos

#### Passos

1. **Dispositivo A (Web ou Mobile 2)**
   - Fazer login
   - Criar nova viagem:
     - **Destino:** Marrakech, Marrocos
     - **Datas:** 01/04/2026 - 10/04/2026
     - **Descrição:** Explorando o deserto
   - Salvar

2. **Dispositivo B (Mobile de Teste)**
   - Verificar que viagem NÃO aparece ainda na lista

3. **Pull Manual**
   - Puxar para atualizar (pull-to-refresh) na lista de viagens
   - OU aguardar 30-60 segundos (auto-refresh se implementado)

#### Resultados Esperados

✅ **UI:**
- Nova viagem "Marrakech, Marrocos" aparece na lista
- Imagem de capa é baixada e exibida
- Datas e descrição corretas

✅ **Console:**
```
[SyncService] Pull iniciado
[SyncService] Buscando trips com updated_at > <last_sync>
[Supabase] Retornou 1 novo registro
[LocalDB] UPSERT trip: <uuid>
[CachedImage] Baixando imagem de capa...
[CachedImage] Download concluído: trip_marrakech.jpg
[SyncState] Atualizado: trips -> 2026-01-04T04:30:00Z
```

✅ **Banco de Dados:**
```sql
SELECT * FROM trips WHERE destination LIKE '%Marrakech%';
-- Resultado: 1 row com dados corretos

SELECT last_synced_at FROM sync_state WHERE table_name = 'trips';
-- Resultado: Timestamp recente (últimos 60 segundos)
```

4. **Testar Offline**
   - Ativar Modo Avião
   - Navegar para a viagem "Marrakech"
   - Confirmar que imagem de capa carrega do cache

---

### Teste 5: Exclusão Offline de Despesa

**ID:** `TEST-OFFLINE-003`  
**Prioridade:** Média  
**Duração:** ~3 minutos

#### Objetivo
Verificar que exclusões offline são sincronizadas corretamente.

#### Passos

1. **Online - Criar Despesa de Teste**
   - Categoria: Alimentação
   - Valor: R$ 45,00
   - Descrição: Café da manhã

2. **Ativar Modo Offline**

3. **Excluir Despesa**
   - Clicar na despesa
   - Botão "Excluir" ou swipe com ação de delete
   - Confirmar exclusão

#### Resultados Esperados

✅ **UI:**
- Despesa desaparece da lista imediatamente
- Sem erros

✅ **Console:**
```
[API] Excluindo despesa offline: <uuid>
[LocalDB] DELETE FROM expenses WHERE id = '<uuid>'
[Queue] Mutation enfileirada: DELETE expenses
```

✅ **Banco de Dados:**
```sql
-- Despesa removida localmente
SELECT COUNT(*) FROM expenses WHERE id = '<uuid>';
-- Resultado: 0

-- Delete mutation enfileirada
SELECT * FROM mutation_queue WHERE action = 'DELETE' AND record_id = '<uuid>';
-- Resultado: 1 row
```

4. **Voltar Online**

✅ **Console:**
```
[SyncService] DELETE expenses: <uuid>
[Supabase] Response: 204 No Content
[Queue] DELETE mutation
```

✅ **Supabase:**
- Confirmar registro não existe mais na tabela `expenses`

---

### Teste 6: Múltiplas Operações Offline

**ID:** `TEST-OFFLINE-004`  
**Prioridade:** Alta  
**Duração:** ~8 minutos

#### Objetivo
Testar fila de sincronização com múltiplas operações de tipos diferentes.

#### Passos (Todos Offline)

1. **Ativar Modo Offline**

2. **Criar 2 Viagens**
   - Viagem 1: Tokyo, Japão (01/05 - 10/05)
   - Viagem 2: Seoul, Coreia (12/05 - 20/05)

3. **Criar 3 Despesas** (em viagens existentes)
   - Hospedagem: R$ 800,00
   - Transporte: R$ 150,00
   - Alimentação: R$ 100,00

4. **Editar 1 Viagem Existente**
   - Alterar descrição de uma viagem antiga

5. **Excluir 1 Despesa**
   - Deletar uma despesa antiga

#### Resultados Esperados (Offline)

✅ **UI:**
- Todas as operações refletem imediatamente
- Total de itens correto na lista

✅ **Banco de Dados:**
```sql
SELECT COUNT(*) FROM mutation_queue;
-- Resultado: 7 (2 INSERTs trips + 3 INSERTs expenses + 1 UPDATE trip + 1 DELETE expense)
```

6. **Voltar Online**

#### Resultados Esperados (Sincronização)

✅ **Console:**
```
[SyncService] Processando 7 mutações pendentes
[SyncService] INSERT trips (1/7)
[SyncService] INSERT trips (2/7)
[SyncService] INSERT expenses (3/7)
...
[SyncService] DELETE expenses (7/7)
[SyncService] Sync completo. 7 mutations processadas.
```

✅ **Ordem de Processamento:**
- INSERTs devem ser processados antes de UPDATEs/DELETEs da mesma tabela
- DELETEs devem ser os últimos

✅ **Banco de Dados:**
```sql
-- Fila completamente limpa
SELECT COUNT(*) FROM mutation_queue;
-- Resultado: 0
```

✅ **Supabase:**
- Todas as 7 operações refletidas no banco remoto

---

### Teste 7: Sincronização de Exclusões Remotas

**ID:** `TEST-SYNC-002`  
**Prioridade:** Média  
**Duração:** ~4 minutos

#### Objetivo
Validar que exclusões feitas remotamente são sincronizadas para o local.

#### Passos

1. **Mobile - Criar Viagem**
   - Destino: Cancún, México
   - Aguardar sincronização

2. **Web/Outro Device - Excluir Viagem**
   - Localizar viagem "Cancún"
   - Excluir permanentemente

3. **Mobile - Pull**
   - Puxar para atualizar lista de viagens

#### Resultados Esperados

✅ **UI:**
- Viagem "Cancún" desaparece da lista

✅ **Console:**
```
[SyncService] pullDeletions: trips
[SyncService] Remoto: 10 trips
[SyncService] Local: 11 trips
[SyncService] Sincronizando remoções: Excluindo 1 itens de trips locais
[LocalDB] DELETE FROM trips WHERE id IN ('<uuid>')
```

✅ **Banco de Dados:**
```sql
SELECT * FROM trips WHERE destination LIKE '%Cancún%';
-- Resultado: 0 rows
```

---

## 🔍 Verificações Técnicas Avançadas

### Inspecionar Cache de Imagens

#### Android (adb)

```bash
# Listar arquivos em cache
adb shell run-as com.easytravel.app ls -lh files/image_cache/

# Contar imagens em cache
adb shell run-as com.easytravel.app ls files/image_cache/ | wc -l

# Verificar tamanho total do cache
adb shell run-as com.easytravel.app du -sh files/image_cache/

# Copiar imagem específica para análise
adb shell run-as com.easytravel.app cat files/image_cache/trip_xyz.jpg > local_copy.jpg
```

#### iOS (Simulador)

```bash
# Encontrar diretório do app
xcrun simctl get_app_container booted com.easytravel.app data

# Listar cache
ls -lh ~/Library/Developer/CoreSimulator/Devices/<UUID>/data/Containers/Data/Application/<UUID>/Documents/image_cache/
```

### Inspecionar Banco SQLite

```bash
# Android - Extrair banco
adb exec-out run-as com.easytravel.app cat databases/easytravel.db > easytravel_backup.db

# Abrir com sqlite3 CLI
sqlite3 easytravel_backup.db

# Queries úteis
.tables
.schema trips
SELECT COUNT(*) FROM trips;
SELECT COUNT(*) FROM mutation_queue;
SELECT * FROM sync_state;
```

### Monitorar Tráfego de Rede

#### mitmproxy (Interceptar requests do Supabase)

```bash
# Instalar
pip install mitmproxy

# Iniciar
mitmweb

# Configurar proxy no emulador
# Android: Settings > Wi-Fi > Modify Network > Proxy: Manual
# Host: 192.168.x.x (IP do computador)
# Port: 8080

# Filtrar requests Supabase
# Na interface web: Flow Filter -> ~u supabase
```

---

## 📊 Checklist de Validação Completa

Use esta checklist para validação final antes de release:

### Funcionalidades Core
- [ ] Criar viagem offline → sincroniza ao voltar online
- [ ] Editar viagem offline → sincroniza corretamente
- [ ] Excluir viagem offline → sincroniza exclusão
- [ ] Criar despesa offline → sincroniza
- [ ] Editar despesa offline → sincroniza
- [ ] Excluir despesa offline → sincroniza
- [ ] Pull de dados remotos funciona (refresh manual)
- [ ] Pull de exclusões remotas funciona

### Cache de Imagens
- [ ] Imagens de capa de viagens são cacheadas
- [ ] Avatares de perfil são cacheados
- [ ] Imagens aparecem offline após serem cacheadas
- [ ] Upload de imagens offline funciona (após voltar online)
- [ ] Imagens locais (file://) são convertidas para URLs públicas na sync

### Sincronização
- [ ] Sincronização automática ao voltar online
- [ ] Ordem correta de processamento de mutações
- [ ] Fila de mutações é limpa após sync bem-sucedida
- [ ] Estado de sincronização (last_synced_at) é atualizado
- [ ] Sincronização não bloqueia UI
- [ ] Múltiplas mutações são processadas corretamente

### Conectividade
- [ ] Indicador de online/offline funciona
- [ ] Transição offline → online dispara sync
- [ ] App funciona completamente offline
- [ ] Verificação de conectividade (checkConnectivity) funciona
- [ ] Timeout de requests é adequado

### Edge Cases
- [ ] App fecha e reabre offline → dados continuam disponíveis
- [ ] Fila com 10+ mutações sincroniza sem erros
- [ ] Upload de imagem grande (> 5MB) funciona
- [ ] Conflito: mesma viagem editada offline e online → resolve corretamente
- [ ] Banco SQLite com 100+ viagens → performance aceitável (< 1s para carregar)

### Expo Go vs Standalone
- [ ] Teste em Expo Go → funcionalidades core funcionam
- [ ] Teste em APK/IPA development → funcionalidades core funcionam
- [ ] Cache persiste entre fechamentos (standalone)
- [ ] Permissões de galeria/câmera funcionam (ambos)

---

## 🐛 Debugging comum

### Log não aparece no console

**Solução:**
```typescript
// Usar console.warn ou console.error para destacar
console.warn('[DEBUG]', JSON.stringify(data, null, 2));

// Ou criar logger customizado
const logger = {
    debug: (tag: string, ...args: any[]) => {
        if (__DEV__) {
            console.log(`[${tag}]`, ...args);
        }
    }
};
```

### Banco SQLite parece vazio

**Verificar:**
```typescript
import { getDB } from './services/localDb';

const db = getDB();

// Verificar se banco foi inicializado
const tables = await db.getAllAsync(
    "SELECT name FROM sqlite_master WHERE type='table'"
);
console.log('Tabelas:', tables);
```

### Mutações ficam presas na fila

**Debug:**
```typescript
// Em syncService.ts, adicionar try-catch detalhado
try {
    await supabase.from(table_name).insert(payload);
} catch (error) {
    console.error('[SyncService] Erro detalhado:', {
        table: table_name,
        action,
        error: error.message,
        payload: JSON.stringify(payload)
    });
    throw error;
}
```

---

## 📈 Métricas de Sucesso

Após completar todos os testes, o sistema deve atender:

| Métrica | Meta |
|---|---|
| Taxa de sucesso de sincronização | > 95% |
| Tempo de resposta offline | < 500ms |
| Acerto de cache de imagens | > 90% |
| Tempo de sincronização (10 mutações) | < 5 segundos |
| Uso de armazenamento (cache) | < 100MB |
| Taxa de erro de upload de imagem | < 5% |

---

## ✅ Conclusão

Este guia de testes fornece cobertura completa para validar:
- ✅ Criação, edição e exclusão offline
- ✅ Sincronização bidirecional
- ✅ Cache de imagens
- ✅ Resiliência a falhas de rede
- ✅ Consistência de dados

Execute todos os testes antes de cada release para garantir qualidade e confiabilidade do sistema offline-first.
