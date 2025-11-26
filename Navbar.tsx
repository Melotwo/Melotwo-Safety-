import React from 'react';
import { Shield, User } from './icons';
import { Page } from '../types';

interface NavbarProps {
    currentPage: Page;
    setPage: (page: Page) => void;
    userId: string | null;
    isAuthReady: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setPage, userId, isAuthReady }) => {
    const navItems: { name: string; page: Page }[] = [
        { name: 'Home', page: 'home' },
        { name: 'Solutions', page: 'solutions' },
        { name: 'AI Safety Inspector', page: 'inspector' },
    ];

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <button onClick={() => setPage('home')} className="flex items-center space-x-2 shrink-0" aria-label="Go to homepage">
                    <Shield className="w-7 h-7 text-indigo-600" />
                    <span className="text-2xl font-extrabold text-gray-900 tracking-tight">Melotwo</span>
                </button>
                
                {/* Changed breakpoint from md to lg for main nav to handle tablet width better */}
                <nav className="hidden lg:flex space-x-8">
                    {navItems.map(item => (
                        <button
                            key={item.page}
                            onClick={() => setPage(item.page)}
                            className={`px-3 py-2 text-sm font-medium transition duration-150 ease-in-out rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                                currentPage === item.page
                                    ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            {item.name}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center space-x-3 md:space-x-4">
                    {/* Auth Status Indicator */}
                    {isAuthReady && userId ? (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                            <User className="w-4 h-4 text-indigo-500" />
                            {/* Hide ID on very small screens */}
                            <span className="hidden sm:inline font-mono text-xs" title={userId}>
                                {userId.slice(0, 6)}...
                            </span>
                        </div>
                    ) : (
                         <div className="h-8 w-24 bg-gray-100 animate-pulse rounded-lg"></div>
                    )}
                    
                    <button className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Get Started
                    </button>
                </div>
            </div>
            
            {/* Mobile/Tablet Sub-nav for smaller screens where main nav is hidden */}
            <div className="lg:hidden border-t border-gray-100 py-2 overflow-x-auto">
                 <div className="flex justify-around px-4 min-w-max">
                    {navItems.map(item => (
                        <button
                            key={item.page}
                            onClick={() => setPage(item.page)}
                            className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
                                currentPage === item.page
                                    ? 'text-indigo-600'
                                    : 'text-gray-500'
                            }`}
                        >
                            {item.name}
                        </button>
                    ))}
                 </div>
            </div>
        </header>
    );
};
