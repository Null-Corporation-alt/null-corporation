import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { 
  LayoutDashboard, 
  Code2, 
  Terminal, 
  Settings2, 
  LogOut, 
  Menu, 
  X,
  Shield,
  ChevronRight
} from 'lucide-react';

const sidebarLinks = [
  { to: '/secret', label: 'DASHBOARD', icon: LayoutDashboard, exact: true },
  { to: '/secret/hacks', label: 'HACKS', icon: Code2 },
  { to: '/secret/terminal', label: 'TERMINAL', icon: Terminal },
  { to: '/secret/control', label: 'CONTROL', icon: Settings2 },
];

export default function SecretLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (link) => {
    if (link.exact) return location.pathname === link.to;
    return location.pathname.startsWith(link.to);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-cyan/10 fixed inset-y-0 left-0 z-40">
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-cyan/10">
          <Link to="/secret" className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-cyan" />
            <span className="text-lg font-bold tracking-widest text-white glow-cyan-subtle">
              NULL<span className="text-cyan">::</span>SECRET
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 text-xs tracking-[0.15em] font-medium transition-all duration-300 rounded ${
                  active 
                    ? 'bg-cyan/10 text-cyan border border-cyan/30 box-glow-cyan' 
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={18} />
                {link.label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-cyan/10">
          <div className="px-4 py-3 bg-secondary/50 rounded mb-3">
            <p className="text-xs text-white/40 tracking-wider">CONECTADO COMO</p>
            <p className="text-sm text-cyan font-medium truncate">{user?.email || 'Usuario'}</p>
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs tracking-[0.15em] font-medium text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 rounded border border-transparent hover:border-red-500/30"
          >
            <LogOut size={16} />
            CERRAR SESIÓN
          </button>
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-2 text-xs tracking-[0.15em] font-medium text-white/40 hover:text-white/60 transition-all duration-300"
          >
            VOLVER AL SITIO
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-xl border-b border-cyan/10 z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white/80 hover:text-cyan transition-colors p-2"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan" />
          <span className="text-sm font-bold tracking-widest text-white">NULL::SECRET</span>
        </div>
        <div className="w-10" />
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/70 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-cyan/10 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-cyan/10">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan" />
            <span className="text-sm font-bold tracking-widest text-white">NULL::SECRET</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white/60 hover:text-white p-2"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="px-4 py-6 space-y-2">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-xs tracking-[0.15em] font-medium transition-all duration-300 rounded ${
                  active 
                    ? 'bg-cyan/10 text-cyan border border-cyan/30' 
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-cyan/10">
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs tracking-[0.15em] font-medium text-white/60 hover:text-red-400 transition-all duration-300"
          >
            <LogOut size={16} />
            CERRAR SESIÓN
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <Outlet />
      </main>

      {/* Scanlines Effect */}
      <div className="fixed inset-0 pointer-events-none scanline opacity-30" />
    </div>
  );
}
