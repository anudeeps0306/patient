import { PGlite } from '@electric-sql/pglite';
import { worker } from '@electric-sql/pglite/worker';
import { live } from '@electric-sql/pglite/live';

worker({
  async init(options) {
    console.log('Worker: Initializing PGlite instance...');
    
    const db = new PGlite({
      dataDir: options.dataDir || 'idb://patient-registry',
      extensions: { live }
    });
    
    console.log('Worker: Creating schema...');
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
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_patients_first_name ON patients(first_name);
      CREATE INDEX IF NOT EXISTS idx_patients_last_name ON patients(last_name);
      CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
    `);
    
    
    console.log('Worker: Schema created successfully');
    return db;
  }
});
