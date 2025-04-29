import { PGliteWorker } from '@electric-sql/pglite/worker';
import { live } from '@electric-sql/pglite/live';

const workerCode = `
import { PGlite } from '@electric-sql/pglite';
import { worker } from '@electric-sql/pglite/worker';
import { live } from '@electric-sql/pglite/live';

worker({
  async init() {
    return new PGlite({
      dataDir: 'idb://patient-registry',
      extensions: { live }
    });
  }
});
`;

const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(workerBlob);

export const initDb = async () => {
  const db = await PGliteWorker.create(
    new Worker(workerUrl, { type: 'module' }),
    {
      extensions: { live }
    }
  );

  await db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth DATE NOT NULL,
      gender TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      medical_history TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
};

let dbInstance = null;

export const getDb = async () => {
  if (!dbInstance) {
    dbInstance = await initDb();
  }
  return dbInstance;
};
