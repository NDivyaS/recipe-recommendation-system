import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChefHat, 
  Search, 
  ShoppingCart, 
  User, 
  LogOut,
  Home,
  Book
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/recipes', label: 'Recipes', icon: Book },
    { path: '/shopping-lists', label: 'Shopping Lists', icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-neutral-900">RecipeAI</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActiveRoute(item.path)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              {/* Search button */}
              <button className="p-2 text-neutral-400 hover:text-neutral-600 rounded-md hover:bg-neutral-100">
                <Search className="h-5 w-5" />
              </button>

              {/* User dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-neutral-600 hover:text-neutral-900 rounded-md hover:bg-neutral-100">
                  <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.name}
                  </span>
                </button>

                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden border-t border-neutral-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                    isActiveRoute(item.path)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 