import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('easytravel.db');

export const initDB = () => {
  try {
    db.execSync(`
      PRAGMA journal_mode = WAL;
      
      -- Tabela de Viagens
      CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY NOT NULL,
        destination TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        image_url TEXT,
        status TEXT NOT NULL,
        description TEXT,
        budget REAL,
        user_id TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        is_synced INTEGER DEFAULT 1
      );

      -- Tabela de Despesas
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY NOT NULL,
        trip_id TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        is_synced INTEGER DEFAULT 1,
        FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
      );

      -- Tabela de Memórias
      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY NOT NULL,
        trip_id TEXT NOT NULL,
        image_url TEXT,
        caption TEXT,
        location TEXT,
        taken_at TEXT,
        user_id TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        is_synced INTEGER DEFAULT 1,
        FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
      );

      -- Tabela de Perfis
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT,
        avatar_url TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        is_synced INTEGER DEFAULT 1
      );

      -- Fila de Mutação (para ações offline)
      CREATE TABLE IF NOT EXISTS mutation_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
        data TEXT NOT NULL, -- String JSON da linha
        record_id TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );

      -- Estado de Sincronização (rastrear último pull)
      CREATE TABLE IF NOT EXISTS sync_state (
        table_name TEXT PRIMARY KEY NOT NULL,
        last_synced_at TEXT
      );
    `);
    // Banco de dados inicializado com sucesso
  } catch (error) {
    // Falha ao inicializar banco de dados
  }
};

export const getDB = () => db;

// Auxiliares de Tipo
export type MutationAction = 'INSERT' | 'UPDATE' | 'DELETE';

export const queueMutation = async (
  tableName: string,
  action: MutationAction,
  recordId: string,
  data: any
) => {
  await db.runAsync(
    'INSERT INTO mutation_queue (table_name, action, data, record_id) VALUES (?, ?, ?, ?)',
    [tableName, action, JSON.stringify(data), recordId]
  );
};
