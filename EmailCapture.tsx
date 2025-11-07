
import React, { useState } from 'react';
import { Mail, Loader2, CheckCircle } from 'lucide-react';

const EmailCapture: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }
    setError('');
    setIsLoading(true);

    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSuccess(true);
  };

  return (
    <section className="bg-amber-50 dark:bg-slate-800/50">
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
        <Mail className="mx-auto h-12 w-12 text-amber-500" />
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
          Stay Ahead in Safety
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
          Join our mailing list for the latest on SABS standards, new product arrivals, and exclusive procurement tips.
        </p>
        
        <div className="mt-8 max-w-md mx-auto">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center p-6 bg-green-100 dark:bg-green-500/20 rounded-lg">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-xl font-semibold text-green-800 dark:text-green-300">
                Thank you for subscribing!
              </h3>
              <p className="mt-1 text-green-600 dark:text-green-400">
                You're on the list. Keep an eye on your inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="sm:flex sm:gap-3">
              <div className="min-w-0 flex-1">
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-slate-300 dark:border-slate-600 px-5 py-3 text-base text-slate-900 dark:text-slate-200 placeholder-slate-500 shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-white dark:bg-slate-900/50"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="mt-3 sm:mt-0">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center w-full rounded-md border border-transparent bg-amber-500 px-5 py-3 text-base font-medium text-white shadow hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-amber-50 dark:focus:ring-offset-slate-800 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Subscribing...
                    </>
                  ) : 'Subscribe'}
                </button>
              </div>
            </form>
          )}
           {error && !isSuccess && <p className="mt-3 text-sm text-red-600 dark:text-red-500">{error}</p>}
        </div>
      </div>
    </section>
  );
};

export default EmailCapture;
