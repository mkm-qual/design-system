import { NavLink, useNavigate } from 'react-router-dom';
import { ReactNode, useState, useEffect } from 'react';
import {
  LayoutGrid, FileCode2, Users, Settings, LogOut,
  PanelLeftClose, PanelLeftOpen, Layers, Zap,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn, initials } from '../../lib/utils';

const NAV = [
  { to: '/', icon: LayoutGrid, label: 'Dashboard', end: true },
  { to: '/studio', icon: Layers, label: 'Studio' },
  { to: '/contracts', icon: FileCode2, label: 'UI Contracts' },
  { to: '/users', icon: Users, label: 'Users', adminOnly: true },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const STORAGE_KEY = 'dss_nav_collapsed';

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
  });

  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">

      {/* ── Sidebar ────────────────────────────────────────────────── */}
      {/* `group` enables the hover-reveal on the toggle button */}
      <aside className={cn(
        'group/sidebar relative flex flex-col bg-gray-900 border-r border-gray-800 flex-shrink-0',
        'transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-[56px]' : 'w-52'
      )}>

        {/* Logo */}
        <div className={cn(
          'flex items-center gap-2.5 px-4 py-4 border-b border-gray-800 overflow-hidden',
          collapsed && 'justify-center px-0'
        )}>
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
            <Zap size={14} className="text-white" />
          </div>
          <span className={cn(
            'font-bold text-white text-sm tracking-tight whitespace-nowrap',
            'transition-[opacity,max-width] duration-300 overflow-hidden',
            collapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-xs'
          )}>
            DS Studio
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
          {NAV.map(item => {
            if (item.adminOnly && currentUser?.role !== 'admin') return null;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={item.label}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors duration-150 overflow-hidden',
                  collapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-2',
                  isActive
                    ? 'bg-brand-600/20 text-brand-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                )}
              >
                <item.icon size={16} className="flex-shrink-0" />
                <span className={cn(
                  'whitespace-nowrap overflow-hidden',
                  'transition-[opacity,max-width] duration-300',
                  collapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-xs'
                )}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* User row */}
        <div className={cn(
          'border-t border-gray-800 p-3 overflow-hidden',
          collapsed && 'flex justify-center'
        )}>
          {collapsed ? (
            <div
              className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold"
              title={currentUser?.name}
            >
              {initials(currentUser?.name ?? 'U')}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials(currentUser?.name ?? 'U')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 text-gray-500 hover:text-red-400 transition-colors rounded"
                title="Log out"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ── Hover-reveal edge toggle ──────────────────────────────
            Hidden by default; fades in when the sidebar is hovered.
            Sits exactly on the right border, vertically centred.       */}
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -right-3.5 z-20',
            'flex items-center justify-center w-7 h-7 rounded-full',
            'bg-gray-800 border border-gray-700 text-gray-400',
            'hover:bg-gray-700 hover:text-white hover:border-gray-500',
            'shadow-md transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 focus:ring-offset-gray-900',
            /* hidden until sidebar hover */
            'opacity-0 scale-75 pointer-events-none',
            'group-hover/sidebar:opacity-100 group-hover/sidebar:scale-100 group-hover/sidebar:pointer-events-auto',
          )}
        >
          {collapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
        </button>
      </aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
