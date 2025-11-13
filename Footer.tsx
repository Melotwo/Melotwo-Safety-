import React from 'react';

const Footer: React.FC = () => (
  <footer className="no-print bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-16">
    <div className="max-w-4xl mx-auto py-8 px-4 text-center text-sm text-slate-500 dark:text-slate-400">
      <p>&copy; {new Date().getFullYear()} Melotwo Digital Solutions. All rights reserved.</p>
      <p className="mt-1">Empowering safer workplaces with intelligent tools.</p>
    </div>
  </footer>
);

export default Footer;
