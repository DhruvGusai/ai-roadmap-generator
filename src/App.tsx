import React, { useState, useEffect} from 'react';
import { Map } from 'lucide-react';
import RoadmapForm from './components/RoadmapForm';
import RoadmapDisplay from './components/RoadmapDisplay';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { RoadmapData, UserInput,user } from './types';


function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [serverPort, setServerPort] = useState<number | null>(null);

  useEffect(() => {
    const checkPort = async (port: number) => {
      try {
        const response = await fetch(`http://localhost:${port}/health`);
        if (response.ok) {
          setServerPort(port);
          return true;
        }
      } catch {
        return false;
      }
    };

    const findServer = async () => {
      for (let port = 3000; port < 3010; port++) {
        if (await checkPort(port)) {
          break;
        }
      }
    };

    findServer();
  }, []);  // ✅ This should be inside the component

  const handleSubmit = async (input: UserInput) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending request with input:', input);
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/generate-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Server responded with error:', data);
        throw new Error(data.details || data.error || 'Failed to generate roadmap');
      }

      console.log('Received roadmap data:', data);
      setRoadmap(data);
    } catch (err) {
      console.error('Error during roadmap generation:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating the roadmap');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setRoadmap(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Map className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">AI Roadmap Generator</h1>
            </div>
            <div>
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Welcome, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-x-4">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-900"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col items-center space-y-8">
            {!roadmap && (
              <>
                <div className="text-center max-w-2xl">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Generate Your Career Roadmap
                  </h2>
                  <p className="text-gray-600">
                    Enter your career goals and let AI create a personalized roadmap to help you
                    achieve them.
                  </p>
                </div>
                <RoadmapForm onSubmit={handleSubmit} isLoading={isLoading} />
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {roadmap && <RoadmapDisplay roadmap={roadmap} />}

            {roadmap && (
              <button
                onClick={() => setRoadmap(null)}
                className="mt-8 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
              >
                Generate Another Roadmap
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(userData) => {
            setUser(userData);
            setShowAuthModal(false);
          }}
        />
      )}
    </div>
  );
}

export default App;