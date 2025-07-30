import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cookingSkillLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    // Reset error
    setError('');

    // Name validation
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    // Password strength validation
    if (!/(?=.*[a-z])(?=.*[A-Z])|(?=.*[a-z])(?=.*[0-9])|(?=.*[A-Z])(?=.*[0-9])/.test(formData.password)) {
      setError('Password must contain at least 2 of: lowercase, uppercase, or numbers');
      return false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { confirmPassword, ...registerData } = formData;
      
      const response = await api.post('/auth/register', registerData);
      
      // Show success message
      setSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        cookingSkillLevel: 'beginner'
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Account created successfully! Please sign in with your credentials.',
            email: registerData.email 
          } 
        });
      }, 2000);

    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.details) {
        setError(Array.isArray(err.response.data.details) 
          ? err.response.data.details.join(', ')
          : err.response.data.details);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
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
            Create your RecipeAI account
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Join us and discover amazing recipes tailored to your preferences
          </p>
        </div>

        {/* Registration Form */}
        <div className="card">
          <div className="card-content">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div className="text-sm text-green-600">
                    <p className="font-medium">Account created successfully!</p>
                    <p>Redirecting to login page...</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && !success && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="label">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="input mt-1"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

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

              {/* Cooking Skill Level */}
              <div>
                <label htmlFor="cookingSkillLevel" className="label">
                  Cooking Skill Level
                </label>
                <select
                  id="cookingSkillLevel"
                  name="cookingSkillLevel"
                  className="input mt-1"
                  value={formData.cookingSkillLevel}
                  onChange={handleInputChange}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
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
                    autoComplete="new-password"
                    required
                    className="input pr-10"
                    placeholder="Choose a strong password"
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
                <p className="mt-1 text-xs text-neutral-500">
                  Must be at least 6 characters with 2 of: lowercase, uppercase, or numbers
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="label">
                  Confirm Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="input pr-10"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
                disabled={isLoading || success}
                className="btn btn-primary btn-lg w-full"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 