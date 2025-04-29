```markdown
# Patient Registry App

This is a simple Patient Registry web application built using React and PGlite. PGlite is a serverless PostgreSQL database designed to run in browsers, Node.js, and WebAssembly environments. This application demonstrates how to use PGlite for basic data storage, retrieval, and live updates.

## Features

- Register new patients with personal and medical history details.
- View a list of registered patients with basic information.
- Search patients by name or email.
- Execute custom SQL queries against the patient database using an integrated query interface.
- Live updates of the patient list using PGlite's `live` extension.

## Technologies Used

- **React:** Frontend library for building the user interface.
- **React Router:** For navigation between different pages/components.
- **PGlite:** The embedded PostgreSQL database.
  - `@electric-sql/pglite/worker`: To run PGlite in a Web Worker, keeping the main thread free.
  - `@electric-sql/pglite/live`: PGlite extension for live query results.
- **Tailwind CSS:** For styling.

## File Structure

```
patient-registry-app/
├── public/
│   ├── index.html       # The main HTML file
│   └── ...
├── src/
│   ├── components/
│   │   ├── Layout.jsx     # Main layout component with navigation
│   │   ├── PatientForm.jsx # Component for registering new patients
│   │   ├── PatientList.jsx # Component for displaying the list of patients
│   │   └── QueryInterface.jsx # Component for executing custom SQL queries
│   ├── services/
│   │   └── db.js          # Database initialization and access logic
│   ├── workers/
│   │   └── pglite-worker.js # Web Worker for running PGlite
│   ├── App.jsx            # Main application component and routing
│   ├── index.css          # Tailwind CSS and custom styles
│   └── main.jsx           # Entry point for the React application
└── package.json         # Project dependencies and scripts
```

## Database Schema

The application uses a single table named `patients` in the PGlite database. The schema is defined in `src/workers/pglite-worker.js` and is automatically created when the worker initializes the database.

```sql
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,          -- Unique identifier for each patient
  first_name TEXT NOT NULL,       -- Patient's first name
  last_name TEXT NOT NULL,        -- Patient's last name
  date_of_birth DATE NOT NULL,    -- Patient's date of birth
  gender TEXT NOT NULL,           -- Patient's gender
  email TEXT,                     -- Patient's email address (optional)
  phone TEXT,                     -- Patient's phone number (optional)
  address TEXT,                   -- Patient's address (optional)
  medical_history TEXT,           -- Patient's medical history (optional)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp of registration
);

CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patients_first_name ON patients(first_name);
CREATE INDEX IF NOT EXISTS idx_patients_last_name ON patients(last_name);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
```

- `id`: A unique integer ID automatically generated for each new patient.
- `first_name`, `last_name`, `date_of_birth`, `gender`: Required fields for patient registration.
- `email`, `phone`, `address`, `medical_history`: Optional fields.
- `created_at`: A timestamp indicating when the patient record was created, defaulting to the current time.
- Indexes are created on relevant columns (`created_at`, `first_name`, `last_name`, `email`) to improve query performance, especially for listing and searching.

## How PGlite Works in This Application

1.  **Web Worker (`src/workers/pglite-worker.js`):**
    - PGlite is initialized and runs within a Web Worker. This prevents heavy database operations from blocking the main UI thread, ensuring a smooth user experience.
    - The `worker()` function from `@electric-sql/pglite/worker` is used to define the worker's behavior.
    - The `init()` function within the worker is responsible for creating the PGlite instance and setting up the database schema (creating the `patients` table and indexes if they don't exist).
    - The `live` extension is enabled here to support live queries.

2.  **Database Service (`src/services/db.js`):**
    - This file provides a singleton pattern for accessing the PGlite database instance.
    - `initDb()`: Creates a `PGliteWorker` instance by pointing to the `pglite-worker.js` file. It configures PGlite to use IndexedDB for data persistence (`dataDir: 'idb://patient-registry'`) and enables the `live` extension.
    - `getDb()`: Returns the single instance of the PGlite database. It handles potential race conditions by using a promise to ensure the database is only initialized once.

3.  **Main Application (`src/App.jsx`):**
    - The `App.jsx` component is responsible for initializing the database when the application starts.
    - It uses a `useState` hook (`dbReady`) to track the database initialization status and renders a loading state or an error message while initialization is in progress or if it fails.
    - Once the database is ready, it sets up the React Router and renders the `Layout` component.

4.  **Components Interacting with the Database:**
    - Components like `PatientList`, `PatientForm`, and `QueryInterface` use the `getDb()` function from `src/services/db.js` to get the database instance.
    - They then use the database instance to perform SQL queries (`db.query()`) or live queries (`db.live.query()`).

## How Live Queries Work (`PatientList.jsx`)

- The `PatientList.jsx` component demonstrates the use of PGlite's `live` extension for real-time updates.
- It uses `db.live.query()` to fetch the list of patients.
- This method takes the SQL query and a callback function.
- The callback function is executed initially with the results and then *again* whenever there is a change in the data that affects the results of the query (e.g., a new patient is registered, or an existing patient record is updated or deleted).
- The component's state (`patients`) is updated within this callback, causing the UI to re-render automatically with the latest data without manual polling.
- The `db.live.query()` method returns an object with an `unsubscribe` function. It's important to call `unsubscribe()` in the component's cleanup function (`useEffect` return) to stop listening for updates when the component unmounts, preventing memory leaks.

## Where to Find Code:

- **Layout and Navigation:** `src/components/Layout.jsx`
- **Patient Registration Form:** `src/components/PatientForm.jsx`
- **Patient List and Live Updates:** `src/components/PatientList.jsx`
- **SQL Query Interface:** `src/components/QueryInterface.jsx`
- **Database Initialization and Access:** `src/services/db.js`
- **PGlite Web Worker:** `src/workers/pglite-worker.js`
- **Application Entry Point and Routing:** `src/App.jsx`
- **Database Schema Definition:** Within the `init()` function in `src/workers/pglite-worker.js`.

## Running the Application

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd patient-registry-app
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Start the development server:**
    ```bash
    npm start
    # or
    yarn start
    ```

The application should open in your browser at `http://localhost:3000` (or a similar address).

## Persistence

PGlite is configured to use IndexedDB (`dataDir: 'idb://patient-registry'`). This means the data you enter in the application will persist across browser sessions. If you close and reopen the browser, or even restart your computer, your registered patient data should still be available. To clear the data, you would typically need to clear the IndexedDB storage for the application's origin in your browser's developer tools.
```