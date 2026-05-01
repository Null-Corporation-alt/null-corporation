import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import LoginModal from './LoginModal.jsx';

const navLinks = [
  { to: '/about', label: 'SOBRE MÍ' },
  { to: '/skills', label: 'HABILIDADES' },
  { to: '/projects', label: 'PROYECTOS' },
  { to: '/contact', label: 'CONTACTO' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-cyan/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold tracking-widest text-white glow-cyan-subtle hover:glow-cyan transition-all duration-300">
            NULL
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-xs tracking-[0.2em] font-medium transition-all duration-300 hover:text-cyan ${
                  location.pathname === link.to ? 'text-cyan glow-cyan-subtle' : 'text-white/60'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => setLoginOpen(true)}
              className="ml-4 px-5 py-2 text-xs tracking-[0.2em] font-bold border border-cyan/50 text-cyan hover:bg-cyan/10 hover:border-cyan transition-all duration-300 box-glow-cyan-hover"
            >
              INICIAR SESIÓN
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white/80 hover:text-cyan transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-xl border-t border-cyan/10 animate-fade-in">
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm tracking-[0.15em] font-medium transition-all duration-300 hover:text-cyan ${
                    location.pathname === link.to ? 'text-cyan' : 'text-white/60'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => { setLoginOpen(true); setMobileOpen(false); }}
                className="mt-2 px-5 py-3 text-xs tracking-[0.2em] font-bold border border-cyan/50 text-cyan hover:bg-cyan/10 transition-all duration-300 w-full"
              >
                INICIAR SESIÓN
              </button>
            </div>
          </div>
        )}
      </nav>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}