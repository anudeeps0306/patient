import { useState } from 'react';
import { getDb } from '../services/db';

export default function QueryInterface() {
  const [query, setQuery] = useState('SELECT * FROM patients LIMIT 10');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const executeQuery = async () => {
    setIsExecuting(true);
    setError(null);
    
    try {
      const db = await getDb();
      const result = await db.query(query);
      setResults(result);
    } catch (err) {
      console.error('Query execution error:', err);
      setError(err.message);
      setResults(null);
    } finally {
      setIsExecuting(false);
    }
  };

  const exampleQueries = [
    {
      name: 'List 10 patients',
      query: 'SELECT * FROM patients LIMIT 10'
    },
    {
      name: 'Female patients by age',
      query: "SELECT * FROM patients WHERE gender = 'Female' ORDER BY date_of_birth DESC"
    },
    {
      name: 'Patient count by gender',
      query: "SELECT COUNT(*) as total, gender FROM patients GROUP BY gender"
    }
  ];

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">SQL Query Interface</h2>
      
      <div className="mb-6">
        <label htmlFor="query" className="form-label">SQL Query</label>
        <textarea
          id="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={5}
          className="input font-mono text-sm"
          placeholder="Enter SQL query here..."
        />
        <div className="mt-3 flex justify-between items-center">
          <div className="flex space-x-2">
            {exampleQueries.map((example, index) => (
              <button 
                key={index}
                onClick={() => setQuery(example.query)}
                className="btn-outline text-xs"
              >
                {example.name}
              </button>
            ))}
          </div>
          <button 
            onClick={executeQuery}
            disabled={isExecuting}
            className="btn"
          >
            {isExecuting ? 'Executing...' : 'Execute Query'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <pre className="whitespace-pre-wrap font-mono">{error}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {results && (
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            Results ({results.rows.length} rows)
          </h3>
          
          {results.rows.length === 0 ? (
            <p className="text-gray-500 italic">No results returned.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(results.rows[0]).map(key => (
                      <th 
                        key={key}
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {value === null ? 
                            <span className="italic text-gray-400">NULL</span> : 
                            typeof value === 'object' ? 
                              JSON.stringify(value) : 
                              String(value)
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}