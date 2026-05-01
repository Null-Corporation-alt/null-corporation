import { useState } from 'react';
import SectionTitle from '../components/SectionTitle';
import { Send, Mail, MapPin, Github, AtSign } from 'lucide-react';

const contactInfo = [
  { icon: Mail, label: 'EMAIL', value: 'anonymous.lard060@passinbox.com' },
  { icon: MapPin, label: 'UBICACIÓN', value: 'SOMEWHERE IN THE NETWORK' },
  { icon: Github, label: 'GITHUB', value: 'github.com/Null-Corporation-alt' },
  { icon: AtSign, label: 'DISCORD', value: 'mr_tostador' },
];

export default function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <SectionTitle title="CONTACTO" subtitle="// ESTABLECE CONEXIÓN" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: '0.2s', opacity: 0 }}
            >
              <p className="text-sm text-white/50 leading-relaxed tracking-wider mb-8">
                ¿Tienes un proyecto en mente? ¿Necesitas una auditoría de seguridad?
                ¿O simplemente quieres hablar de código? Envíame un mensaje.
              </p>
            </div>

            {contactInfo.map((info, i) => (
              <div
                key={info.label}
                className="flex items-center gap-4 group animate-fade-in-up"
                style={{ animationDelay: `${0.3 + i * 0.1}s`, opacity: 0 }}
              >
                <div className="w-10 h-10 border border-cyan/15 flex items-center justify-center group-hover:border-cyan/40 transition-colors">
                  <info.icon className="w-4 h-4 text-cyan/40 group-hover:text-cyan transition-colors" />
                </div>
                <div>
                  <p className="text-[9px] tracking-[0.2em] text-white/30">{info.label}</p>
                  <p className="text-xs tracking-wider text-white/60 group-hover:text-white/80 transition-colors">
                    {info.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 animate-fade-in-up"
            style={{ animationDelay: '0.4s', opacity: 0 }}
          >
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-white/40 mb-2">NOMBRE</label>
              <input
                type="text"
                required
                className="w-full bg-secondary/30 border border-cyan/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-cyan/40 transition-all duration-300 placeholder:text-white/15 font-mono tracking-wider"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-white/40 mb-2">EMAIL</label>
              <input
                type="email"
                required
                className="w-full bg-secondary/30 border border-cyan/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-cyan/40 transition-all duration-300 placeholder:text-white/15 font-mono tracking-wider"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-white/40 mb-2">MENSAJE</label>
              <textarea
                required
                rows={5}
                className="w-full bg-secondary/30 border border-cyan/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-cyan/40 transition-all duration-300 placeholder:text-white/15 font-mono tracking-wider resize-none"
                placeholder="Escribe tu mensaje..."
              />
            </div>

            <button
              type="submit"
              className={`w-full py-4 text-sm font-bold tracking-[0.25em] transition-all duration-300 flex items-center justify-center gap-3 ${
                sent
                  ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                  : 'bg-cyan text-background hover:bg-cyan/90 hover:shadow-[0_0_30px_#00f3ff44]'
              }`}
            >
              {sent ? (
                <>MENSAJE ENVIADO</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  ENVIAR MENSAJE
                </>
              )}
            </button>
          </form>
        </div>

        {/* Encrypted message */}
        <div
          className="mt-20 text-center animate-fade-in-up"
          style={{ animationDelay: '0.8s', opacity: 0 }}
        >
          <p className="text-[10px] tracking-[0.3em] text-white/10 font-mono">
            {'> ENCRYPTED CHANNEL READY // AWAITING TRANSMISSION...'}
          </p>
        </div>
      </div>
    </div>
  );
}