import { PGliteWorker } from '@electric-sql/pglite/worker';
import { live } from '@electric-sql/pglite/live';

let dbInstance = null;
let initializationPromise = null;

export const initDb = async () => {
  console.log('Starting PGliteWorker initialization...');

  try {
    console.log('Creating PGliteWorker instance...');
    
    const db = await PGliteWorker.create(
      new Worker(new URL('../workers/pglite-worker.js', import.meta.url), {
        type: 'module',
      }),
      {
        dataDir: 'idb://patient-registry',
        extensions: { live }
      }
    );
    
    console.log('PGliteWorker instance created successfully');
    
    db.onLeaderChange(() => {
      console.log('Leader worker changed, isLeader:', db.isLeader);
    });
    
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    initializationPromise = null;
    throw error;
  }
};

export const getDb = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  if (!initializationPromise) {
    initializationPromise = initDb().then(db => {
      dbInstance = db;
      return db;
    });
  }

  return initializationPromise;
};
