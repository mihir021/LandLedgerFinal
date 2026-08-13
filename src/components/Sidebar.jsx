import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RoleSwitcher from './RoleSwitcher';

export default function Sidebar({ navItems = [] }) {
  const [isHovered, setIsHovered] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-16 z-50 flex h-[calc(100vh-4rem)] flex-col bg-white border-r border-gray-200 transition-all duration-200 ease-in-out ${
        isHovered ? 'w-[260px]' : 'w-[64px]'
      }`}
      style={{ boxShadow: '1px 0 4px rgba(30,58,95,0.04)' }}
    >
      <div className={`flex flex-col flex-1 overflow-y-auto ${isHovered ? 'px-3' : 'px-2'} py-4 overflow-x-hidden`}>
        {user?.role === 'both' && <RoleSwitcher isHovered={isHovered} />}
        {navItems.map((group, gIdx) => (
          <div key={gIdx} className="mb-6">
            {/* Group Header */}
            {group.title && (
              <div 
                className={`mb-2 transition-opacity duration-200 whitespace-nowrap h-4 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {isHovered && (
                  <span className="px-3 text-xs font-bold text-gray-400 tracking-wider uppercase">
                    {group.title}
                  </span>
                )}
              </div>
            )}
            <ul className="space-y-1">
              {group.items.map((item, iIdx) => (
                <NavItem key={iIdx} item={item} isHovered={isHovered} currentPath={location.pathname} />
              ))}
            </ul>
          </div>
        ))}
      </div>
      {/* Footer */}
      <div className={`border-t border-gray-100 p-2 flex flex-col gap-1`}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          title={!isHovered ? 'Sign Out' : ''}
        >
          <LogOut className={`h-5 w-5 shrink-0 ${!isHovered ? 'mx-auto' : 'ml-1'}`} />
          {isHovered && (
            <span className="text-sm font-medium whitespace-nowrap animate-fade-in">
              Sign Out
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

function NavItem({ item, isHovered, currentPath }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;

  // Auto-expand if a child is active
  useEffect(() => {
    if (item.children && item.children.some(child => currentPath === child.to || currentPath.startsWith(child.to + '/'))) {
      setIsOpen(true);
    }
  }, [currentPath, item.children]);

  if (item.children) {
    const isActiveChild = item.children.some(child => currentPath === child.to || currentPath.startsWith(child.to + '/'));

    return (
      <li>
        <button
          onClick={() => isHovered && setIsOpen(!isOpen)}
          title={!isHovered ? item.label : ''}
          className={`flex w-full items-center justify-between rounded-lg p-2 transition-colors border-l-4 ${
            isActiveChild
              ? 'bg-blue-50/50 text-blue-900 border-blue-500'
              : 'text-gray-600 hover:bg-gray-50 border-transparent'
          } ${!isHovered ? 'justify-center border-l-0 px-0' : ''}`}
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon className={`h-5 w-5 shrink-0 ${!isHovered ? 'mx-auto' : ''} ${isActiveChild ? 'text-blue-700' : ''}`} />}
            {isHovered && (
              <span className="text-sm font-medium whitespace-nowrap animate-fade-in">
                {item.label}
              </span>
            )}
          </div>
          {isHovered && (
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </button>
        {isHovered && isOpen && (
          <ul className="mt-1 space-y-1 pl-10 pr-2">
            {item.children.map((child, idx) => {
              const ChildIcon = child.icon;
              return (
                <li key={idx}>
                  <NavLink
                    to={child.to}
                    end={child.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-md py-2 px-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-900'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                      }`
                    }
                  >
                    {ChildIcon && <ChildIcon className="h-4 w-4 shrink-0" />}
                    <span className="whitespace-nowrap truncate">{child.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={item.to}
        end={item.end}
        title={!isHovered ? item.label : ''}
        className={({ isActive }) =>
          `flex items-center gap-2.5 rounded-lg p-2 text-sm font-medium transition-colors border-l-4 ${
            isActive
              ? 'bg-amber-500/10 text-navy-950 border-[#F5B800] font-bold'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent'
          } ${!isHovered ? 'justify-center border-l-0 px-0' : ''}`
        }
      >
        {({ isActive }) => (
          <>
            <div className="relative flex items-center shrink-0">
              {Icon && <Icon className={`h-5 w-5 shrink-0 ${!isHovered ? 'mx-auto' : ''} ${isActive ? 'text-[#2E333D]' : ''}`} />}
              {isActive && (
                <span 
                  className="absolute -top-1 -right-1.5 h-2.5 w-2.5 rounded-full bg-[#F5B800] border-1.5 border-[#2E333D] shadow-[1px_1px_0px_#2E333D]" 
                  title="Active LEGO Stud"
                />
              )}
            </div>
            {isHovered && (
              <span className="whitespace-nowrap animate-fade-in flex items-center gap-1.5">
                {item.label}
              </span>
            )}
          </>
        )}
      </NavLink>
    </li>
  );
}
