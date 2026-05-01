import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, User, Mail, Eye, EyeOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

function generateUsername() {
  const adjectives = ['shadow', 'ghost', 'null', 'void', 'cipher', 'phantom', 'dark', 'silent'];
  const nouns = ['byte', 'node', 'root', 'shell', 'core', 'hex', 'packet', 'signal'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${adj}_${noun}_${num}`;
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}


export default function LoginModal({ open, onClose }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, checkUserAuth } = useAuth();

  // Redirect to secret zone if already authenticated
  useEffect(() => {
    if (open && isAuthenticated) {
      onClose();
      navigate('/secret');
    }
  }, [open, isAuthenticated, navigate, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setError('');
      setMode('login');
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const email = e.target.email.value;
    try {
      await base44.integrations.Core.SendEmail({
        from_name: 'NULL SYSTEM',
        to: email,
        subject: 'ACCESO AL SISTEMA — ENLACE DE ENTRADA',
        body: `SISTEMA NULL // SOLICITUD DE ACCESO RECIBIDA\n\nHemos recibido tu solicitud de inicio de sesión.\n\nPara acceder al sistema, haz clic en el siguiente enlace:\n${window.location.origin}\n\nSi no solicitaste este acceso, ignora este mensaje.\n\n> SISTEMA NULL // CONEXIÓN CIFRADA`,
      });
      setLoginSuccess(true);
    } catch {
      setError('Error al procesar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const email = e.target.email.value;
    const username = generateUsername();
    const password = generatePassword();
    try {
      console.log('[v0] Attempting to register user:', email);
      
      // Try to invite user via base44
      const inviteResult = await base44.users.inviteUser(email, 'user');
      console.log('[v0] Invite result:', inviteResult);
      
      // Send welcome email with credentials
      await base44.integrations.Core.SendEmail({
        from_name: 'NULL SYSTEM',
        to: email,
        subject: 'ACCESO AL SISTEMA — CREDENCIALES GENERADAS',
        body: `BIENVENIDO AL SISTEMA NULL\n\nTus credenciales de acceso han sido generadas automáticamente:\n\nUSUARIO: ${username}\nCONTRASEÑA: ${password}\n\nGuarda estas credenciales en un lugar seguro. No las compartas.\n\n> SISTEMA NULL // CONEXIÓN CIFRADA ESTABLECIDA`,
      });
      setMode('registered');
    } catch (err) {
      console.error('[v0] Registration error:', err);
      console.error('[v0] Error details:', err?.message, err?.response, err?.data);
      
      // More specific error messages
      const errorMessage = err?.message || err?.toString() || '';
      if (errorMessage.toLowerCase().includes('already') || errorMessage.toLowerCase().includes('exist')) {
        setError('Este email ya está registrado. Intenta iniciar sesión.');
      } else if (errorMessage.toLowerCase().includes('permission') || errorMessage.toLowerCase().includes('unauthorized')) {
        setError('No tienes permisos para registrar usuarios.');
      } else if (errorMessage.toLowerCase().includes('invalid')) {
        setError('Email inválido. Verifica el formato.');
      } else {
        setError(`Error al registrar: ${errorMessage || 'Intenta de nuevo más tarde.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative w-full max-w-md bg-background border border-cyan/20 box-glow-cyan animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        style={{ animationDuration: '0.4s' }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-cyan transition-colors">
          <X size={20} />
        </button>

        <div className="p-8 pt-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 border border-cyan/30 mb-4">
              <Lock className="w-6 h-6 text-cyan" />
            </div>
            <h2 className="text-2xl font-bold tracking-[0.2em] text-white">
              {mode === 'login' ? 'INICIAR SESIÓN' : mode === 'register' ? 'REGISTRO' : 'REGISTRO COMPLETO'}
            </h2>
            <div className="w-12 h-[1px] bg-cyan/50 mx-auto mt-3" />
          </div>

          {mode === 'registered' ? (
            <div className="text-center py-4">
              <p className="text-sm text-cyan/80 tracking-wider mb-2">Invitación enviada.</p>
              <p className="text-xs text-white/40 tracking-wider">Revisa tu email para acceder al sistema.</p>
              <button onClick={onClose} className="mt-6 w-full py-3 border border-cyan/30 text-cyan text-xs tracking-[0.2em] hover:bg-cyan/10 transition-all duration-300">
                CERRAR
              </button>
            </div>
          ) : loginSuccess ? (
            <div className="text-center py-4">
              <p className="text-sm text-cyan/80 tracking-wider mb-2">Enlace de acceso enviado.</p>
              <p className="text-xs text-white/40 tracking-wider">Revisa tu email y haz clic en el enlace para entrar.</p>
              <button onClick={() => { onClose(); setLoginSuccess(false); }} className="mt-6 w-full py-3 border border-cyan/30 text-cyan text-xs tracking-[0.2em] hover:bg-cyan/10 transition-all duration-300">
                CERRAR
              </button>
            </div>
          ) : mode === 'login' ? (
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs tracking-[0.15em] text-white/50 mb-2 font-medium">EMAIL</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan/40" />
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full bg-secondary/50 border border-cyan/10 text-white text-sm pl-10 pr-4 py-3 focus:outline-none focus:border-cyan/50 transition-all duration-300 placeholder:text-white/20 font-mono"
                    placeholder="null@system.io"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs tracking-[0.15em] text-white/50 mb-2 font-medium">CONTRASEÑA</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full bg-secondary/50 border border-cyan/10 text-white text-sm pl-10 pr-10 py-3 focus:outline-none focus:border-cyan/50 transition-all duration-300 placeholder:text-white/20 font-mono"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan/40 hover:text-cyan transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {error && <p className="text-xs text-red-400 tracking-wider">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-cyan text-background text-sm font-bold tracking-[0.2em] hover:bg-cyan/90 transition-all duration-300 mt-2 hover:shadow-[0_0_30px_#00f3ff44] disabled:opacity-50"
              >
                {loading ? 'PROCESANDO...' : 'ENTRAR AL SISTEMA'}
              </button>
              <div className="mt-4 text-center">
                <button type="button" onClick={() => setMode('register')} className="text-xs text-white/40 hover:text-cyan transition-colors tracking-wider">
                  ¿No tienes cuenta? Regístrate
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleRegister}>
              <div>
                <label className="block text-xs tracking-[0.15em] text-white/50 mb-2 font-medium">EMAIL</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan/40" />
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full bg-secondary/50 border border-cyan/10 text-white text-sm pl-10 pr-4 py-3 focus:outline-none focus:border-cyan/50 transition-all duration-300 placeholder:text-white/20 font-mono"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              {error && <p className="text-xs text-red-400 tracking-wider">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-cyan text-background text-sm font-bold tracking-[0.2em] hover:bg-cyan/90 transition-all duration-300 hover:shadow-[0_0_30px_#00f3ff44] disabled:opacity-50"
              >
                {loading ? 'PROCESANDO...' : 'CREAR CUENTA'}
              </button>
              <div className="mt-4 text-center">
                <button type="button" onClick={() => setMode('login')} className="text-xs text-white/40 hover:text-cyan transition-colors tracking-wider">
                  ¿Ya tienes cuenta? Inicia sesión
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="h-[2px] bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />
      </div>
    </div>
  );
}
