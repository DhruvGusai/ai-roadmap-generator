import React from 'react';
import { RoadmapData } from '../types';
import { Download, Share2 } from 'lucide-react';

interface RoadmapDisplayProps {
  roadmap: RoadmapData;
}

export default function RoadmapDisplay({ roadmap }: RoadmapDisplayProps) {
  const handleShare = async () => {
    try {
      await navigator.share({
        title: roadmap.title,
        text: roadmap.description,
        url: window.location.href
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{roadmap.title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
          >
            <Share2 className="h-5 w-5" />
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      <p className="text-gray-600 mb-8">{roadmap.description}</p>

      <div className="space-y-8">
        {roadmap.steps.map((step, index) => (
          <div key={index} className="relative pl-8 border-l-2 border-indigo-200">
            <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-indigo-500" />
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
              <span className="text-sm text-gray-500">{step.duration}</span>
            </div>
            <p className="text-gray-600 mb-2">{step.description}</p>
            {step.resources && step.resources.length > 0 && (
              <div className="mt-2">
                <h4 className="text-sm font-semibold text-gray-700">Recommended Resources:</h4>
                <ul className="list-disc list-inside text-sm text-indigo-600">
                  {step.resources.map((resource, idx) => (
                    <li key={idx}>{resource}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}