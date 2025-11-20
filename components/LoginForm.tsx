import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { Link } from 'react-router-dom';

const LoginForm = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { content } = useContent();

  const heroImageUrl = content?.textContent?.heroImageUrl;

  // FIX: Define the handleSubmit function to handle form submission.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!login(password)) {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-stone-100 dark:bg-stone-900 overflow-hidden">
      {heroImageUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center z-0" 
          style={{ backgroundImage: `url(${heroImageUrl})` }}
        >
           <div className="absolute inset-0 bg-black/30 backdrop-blur-md"></div>
        </div>
      )}
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm rounded-lg shadow-2xl border border-white/20 dark:border-stone-700/50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-stone-800 dark:text-white">Admin Login</h1>
          <p className="text-stone-500 dark:text-stone-300">Access the Villa Luar CMS</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password-input" className="text-sm font-medium text-stone-700 dark:text-stone-200">Password</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-stone-700 dark:border-stone-600 dark:text-white dark:placeholder-stone-400"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-amber-700 rounded-md hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors dark:hover:bg-amber-600"
            >
              Login
            </button>
          </div>
        </form>
         <div className="text-center">
            <Link to="/" className="text-sm text-amber-700 dark:text-amber-500 hover:underline">
              &larr; Back to Villa Website
            </Link>
          </div>
      </div>
    </div>
  );
};

export default LoginForm;