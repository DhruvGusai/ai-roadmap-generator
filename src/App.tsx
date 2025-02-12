import React, { useState } from 'react';
import { Map } from 'lucide-react';
import RoadmapForm from './components/RoadmapForm';
import RoadmapDisplay from './components/RoadmapDisplay';
import { RoadmapData, UserInput } from './types';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (input: UserInput) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending request with input:', input);
      
      const response = await fetch('http://localhost:3000/api/generate-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <Map className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">AI Roadmap Generator</h1>
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
    </div>
  );
}

export default App;