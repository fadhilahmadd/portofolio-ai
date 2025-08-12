'use client';

import { useState } from 'react';
import { Menu, X, Bot, Github, Linkedin, Download } from 'lucide-react';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'My Portfolio', icon: Bot, href: 'http://portofolio-fadhilahmad.netlify.app/' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/fadhilahmadd' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/in/fadhil-ahmad-hidayat-604623139/' },
    { name: 'Resume', icon: Download, href: 'https://resume-fadhil-ahmad.tiiny.site' },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="fixed top-5 left-5 z-30 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/70 backdrop-blur-sm transition-colors"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <aside className={`fixed top-0 left-0 h-full bg-gray-950/70 backdrop-blur-lg z-20 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-64 border-r border-white/10`}>
        <div className="p-6 pt-20">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Fadhil Ahmad Hidayat</h2>
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-2 text-gray-400 hover:bg-white/10 hover:text-white rounded-md transition-colors"
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};