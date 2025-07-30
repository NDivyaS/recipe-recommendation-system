import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChefHat, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle success message from registration
  useEffect(() => {
    const state = location.state as any;
    if (state?.message) {
      setSuccessMessage(state.message);
      // Pre-fill email if provided
      if (state.email) {
        setFormData(prev => ({ ...prev, email: state.email }));
      }
      // Clear the success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData);
      // Redirect will happen automatically via AuthContext
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestCredentials = () => {
    setFormData({
      email: 'test@example.com',
      password: 'password123'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <ChefHat className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900">
            Sign in to RecipeAI
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Welcome to your smart recipe and shopping companion
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          <div className="card-content">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-green-600">{successMessage}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input mt-1"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="input pr-10"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-neutral-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-neutral-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-lg w-full"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>

              {/* Test Credentials Button */}
              <button
                type="button"
                onClick={fillTestCredentials}
                className="btn btn-outline w-full"
              >
                Use Test Account
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign up here
                </Link>
              </p>
            </div>

            {/* Test Account Info */}
            <div className="mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <h4 className="text-sm font-medium text-neutral-900 mb-2">Test Account</h4>
              <div className="text-xs text-neutral-600 space-y-1">
                <p><strong>Email:</strong> test@example.com</p>
                <p><strong>Password:</strong> password123</p>
                <p className="text-neutral-500">Click "Use Test Account" to auto-fill</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 