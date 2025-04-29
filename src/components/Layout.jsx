import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-primary-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-2">Patient Registry</h1>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className="hover:underline font-medium">
                  Patient List
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:underline font-medium">
                  Register Patient
                </Link>
              </li>
              <li>
                <Link to="/query" className="hover:underline font-medium">
                  Query Interface
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
      
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600">
          <p>Patient Registry App - Powered by PGlite</p>
        </div>
      </footer>
    </div>
  );
}