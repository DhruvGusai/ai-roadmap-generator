import React, { useState } from 'react';
import { MapPin, Send } from 'lucide-react';
import { UserInput } from '../types';

interface RoadmapFormProps {
  onSubmit: (input: UserInput) => Promise<void>;
  isLoading: boolean;
}

export default function RoadmapForm({ onSubmit, isLoading }: RoadmapFormProps) {
  const [formData, setFormData] = useState<UserInput>({
    career: '',
    experience: '',
    goals: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-2xl">
      <div>
        <label htmlFor="career" className="block text-sm font-medium text-gray-700">
          Desired Career Path
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="career"
            value={formData.career}
            onChange={(e) => setFormData(prev => ({ ...prev, career: e.target.value }))}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
            placeholder="e.g., Full Stack Developer"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
          Current Experience Level
        </label>
        <div className="mt-1">
          <select
            id="experience"
            value={formData.experience}
            onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Select experience level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="goals" className="block text-sm font-medium text-gray-700">
          Career Goals
        </label>
        <div className="mt-1">
          <textarea
            id="goals"
            value={formData.goals}
            onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
            rows={4}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
            placeholder="Describe your career goals and aspirations..."
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isLoading ? (
          <MapPin className="animate-spin h-5 w-5" />
        ) : (
          <>
            <Send className="h-5 w-5 mr-2" />
            Generate Roadmap
          </>
        )}
      </button>
    </form>
  );
}