// src/lib/duckdb.ts
import {
  AsyncDuckDB,
  ConsoleLogger,
  getJsDelivrBundles,
  selectBundle,
} from '@duckdb/duckdb-wasm';

let dbInstance: Promise<AsyncDuckDB> | null = null;

export async function getDuckDb(): Promise<AsyncDuckDB> {
  if (typeof window === 'undefined') {
    throw new Error('DuckDB hanya tersedia di browser.');
  }

  if (!dbInstance) {
    dbInstance = (async () => {
      // Ambil daftar bundle dari CDN (mvp/eh/coi) dan pilih yang cocok
      const bundles = getJsDelivrBundles();
      const bundle = await selectBundle(bundles);

      // Pakai worker URL dari bundle (jangan import path internal /dist/)
      const worker = new Worker(bundle.mainWorker as string, { type: 'module' });

      const logger = new ConsoleLogger();
      const db = new AsyncDuckDB(logger, worker);

      // pthreadWorker opsional di beberapa bundle, aman pakai || undefined
      await db.instantiate(bundle.mainModule as string, (bundle.pthreadWorker as string) || undefined);

      return db;
    })();
  }

  return dbInstance;
}
