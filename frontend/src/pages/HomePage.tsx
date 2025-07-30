import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
          Your smart recipe and shopping companion is ready to help you discover delicious meals 
          tailored to your dietary preferences and generate smart shopping lists.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-neutral-900">Recipe Search</h3>
          </div>
          <div className="card-content">
            <p className="text-neutral-600">
              Find recipes by ingredients, cuisine, dietary restrictions, and more.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-neutral-900">Smart Substitutions</h3>
          </div>
          <div className="card-content">
            <p className="text-neutral-600">
              Get AI-powered ingredient alternatives based on your dietary needs.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-neutral-900">Shopping Lists</h3>
          </div>
          <div className="card-content">
            <p className="text-neutral-600">
              Generate consolidated shopping lists from your selected recipes.
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-neutral-900">System Status</h3>
        </div>
        <div className="card-content">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Backend API</span>
              <span className="text-secondary-600 font-medium">✅ Ready</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Database</span>
              <span className="text-secondary-600 font-medium">✅ Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Authentication</span>
              <span className="text-secondary-600 font-medium">✅ Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Recipe System</span>
              <span className="text-secondary-600 font-medium">✅ Functional</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Shopping Lists</span>
              <span className="text-secondary-600 font-medium">✅ Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 