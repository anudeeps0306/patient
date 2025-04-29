import { useState, useEffect } from "react";
import { getDb } from "../services/db";
import { live } from '@electric-sql/pglite/live';


export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = null;
    let isMounted = true;
  
    const fetchLivePatients = async () => {
      try {
        const db = await getDb();
        const ret = await db.live.query(
          'SELECT * FROM patients ORDER BY created_at DESC',
          [],
          (result) => {
            if (isMounted) {
              setPatients(result?.rows || []);
              setLoading(false);
            }
          }
        );
        unsubscribe = ret.unsubscribe;
        if (isMounted) {
          setPatients(ret.initialResults?.rows || []);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching live patients:', error);
          setError('Failed to load patients. Please try again.');
          setLoading(false);
        }
      }
    };
  
    fetchLivePatients();
  
    return () => {
        isMounted = false;
        if (unsubscribe) {
          Promise.resolve(unsubscribe()).catch((e) => {
            console.warn("Error during live query unsubscribe:", e);
          });
        }
      };
  }, []);


  // For search, you can use a normal query or also a live query if you want live search
  const handleSearch = async () => {
    setLoading(true);
    try {
      const db = await getDb();
      const result = await db.query(
        `
            SELECT * FROM patients
            WHERE
              first_name ILIKE $1 OR
              last_name ILIKE $1 OR
              email ILIKE $1
            ORDER BY created_at DESC
          `,
        [`%${searchTerm}%`]
      );
      setPatients(result.rows || []);
    } catch (error) {
      setError("Failed to search patients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (error) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Patient Records
        </h2>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button onClick={() => window.location.reload()} className="btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Patient Records
      </h2>

      <div className="flex mb-6">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input flex-1 mr-2"
        />
        <button onClick={handleSearch} className="btn">
          Search
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <svg
            className="animate-spin h-8 w-8 text-primary-500 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-2 text-gray-600">Loading patients...</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No patients found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date of Birth
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Gender
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Registered On
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{`${patient.first_name} ${patient.last_name}`}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(patient.date_of_birth)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.gender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.email || patient.phone || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(patient.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
