import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { terminalService, hacksService, activityService, siteConfigService } from '@/lib/supabase';
import { Plus, Trash2, X, Terminal as TerminalIcon } from 'lucide-react';
import { format } from 'date-fns';

const BUILT_IN_COMMANDS = {
  help: {
    description: 'Muestra todos los comandos disponibles',
    execute: (args, context) => {
      const commands = [
        { cmd: 'help', desc: 'Muestra este mensaje de ayuda' },
        { cmd: 'clear', desc: 'Limpia la terminal' },
        { cmd: 'whoami', desc: 'Muestra información del usuario' },
        { cmd: 'date', desc: 'Muestra la fecha y hora actual' },
        { cmd: 'ls', desc: 'Lista todos los hacks' },
        { cmd: 'ls -c [cat]', desc: 'Lista hacks por categoría' },
        { cmd: 'stats', desc: 'Muestra estadísticas' },
        { cmd: 'config', desc: 'Muestra configuración del sitio' },
        { cmd: 'neofetch', desc: 'Información del sistema' },
        { cmd: 'matrix', desc: 'Efecto Matrix' },
        { cmd: 'hack [name]', desc: 'Simula hack (solo visual)' },
        { cmd: 'exit', desc: 'Vuelve al dashboard' },
        ...context.customCommands.map(c => ({ cmd: c.command, desc: c.description || 'Comando personalizado' }))
      ];
      return commands.map(c => `  ${c.cmd.padEnd(16)} - ${c.desc}`).join('\n');
    }
  },
  clear: {
    description: 'Limpia la terminal',
    execute: () => '__CLEAR__'
  },
  whoami: {
    description: 'Muestra información del usuario',
    execute: (args, context) => {
      return `Usuario: ${context.user?.email || 'unknown'}\nID: ${context.user?.id || 'N/A'}\nRol: ADMIN\nSesión: Activa`;
    }
  },
  date: {
    description: 'Muestra la fecha actual',
    execute: () => format(new Date(), 'EEEE, dd MMMM yyyy HH:mm:ss')
  },
  ls: {
    description: 'Lista los hacks',
    execute: async (args, context) => {
      try {
        const hacks = await hacksService.getAll(context.user.id);
        if (hacks.length === 0) return 'No hay hacks registrados';
        
        const filterCat = args.includes('-c') ? args[args.indexOf('-c') + 1] : null;
        const filtered = filterCat ? hacks.filter(h => h.category === filterCat) : hacks;
        
        if (filtered.length === 0) return `No hay hacks en la categoría "${filterCat}"`;
        
        return filtered.map(h => 
          `[${h.status.toUpperCase().padEnd(8)}] ${h.name.padEnd(20)} (${h.category}) - ${h.risk_level}`
        ).join('\n');
      } catch (e) {
        return 'Error al cargar hacks';
      }
    }
  },
  stats: {
    description: 'Muestra estadísticas',
    execute: async (args, context) => {
      try {
        const stats = await hacksService.getStats(context.user.id);
        return `
╔════════════════════════════════╗
║        ESTADÍSTICAS            ║
╠════════════════════════════════╣
║  Total Hacks:     ${String(stats.total).padStart(10)}  ║
║  Activos:         ${String(stats.byStatus?.active || 0).padStart(10)}  ║
║  En Testing:      ${String(stats.byStatus?.testing || 0).padStart(10)}  ║
║  Archivados:      ${String(stats.byStatus?.archived || 0).padStart(10)}  ║
╠════════════════════════════════╣
║  Riesgo Crítico:  ${String(stats.byRiskLevel?.critical || 0).padStart(10)}  ║
║  Riesgo Alto:     ${String(stats.byRiskLevel?.high || 0).padStart(10)}  ║
║  Riesgo Medio:    ${String(stats.byRiskLevel?.medium || 0).padStart(10)}  ║
║  Riesgo Bajo:     ${String(stats.byRiskLevel?.low || 0).padStart(10)}  ║
╚════════════════════════════════╝`;
      } catch (e) {
        return 'Error al cargar estadísticas';
      }
    }
  },
  config: {
    description: 'Muestra configuración',
    execute: async () => {
      try {
        const configs = await siteConfigService.getAll();
        return configs.map(c => `${c.key}: ${c.value}`).join('\n');
      } catch (e) {
        return 'Error al cargar configuración';
      }
    }
  },
  neofetch: {
    description: 'Información del sistema',
    execute: (args, context) => {
      return `
       ▄▄▄▄▄▄▄       ${context.user?.email?.split('@')[0] || 'user'}@NULL-SYSTEM
      █░░░░░░░█      ────────────────────
     █░░░░░░░░░█     OS: NULL OS 1.0
     █░░▀░░░▀░░█     Kernel: Cyberpunk-x64
     █░░░░░░░░░█     Shell: null-sh 1.0
      █░░▀▀▀░░█      Terminal: NULL Terminal
       █░░░░░█       Theme: Cyan Glow
        █████        
                     Hacks: ${context.hackCount || 0}
                     Uptime: Always On
`;
    }
  },
  matrix: {
    description: 'Efecto Matrix',
    execute: () => {
      const chars = '01';
      const lines = [];
      for (let i = 0; i < 8; i++) {
        let line = '';
        for (let j = 0; j < 50; j++) {
          line += chars[Math.floor(Math.random() * chars.length)];
        }
        lines.push(line);
      }
      return `\n${lines.join('\n')}\n\nWake up, Neo...`;
    }
  },
  hack: {
    description: 'Simulación de hack',
    execute: async (args) => {
      const target = args.join(' ') || 'target';
      const steps = [
        `Iniciando exploit contra ${target}...`,
        'Escaneando puertos abiertos...',
        'Puerto 22 (SSH) detectado',
        'Puerto 80 (HTTP) detectado',
        'Inyectando payload...',
        'Bypass de autenticación...',
        '████████████████████ 100%',
        `\n[!] Acceso conseguido a ${target}`,
        '[!] Esto es solo una simulación'
      ];
      return steps.join('\n');
    }
  },
  exit: {
    description: 'Volver al dashboard',
    execute: () => '__EXIT__'
  }
};

export default function TerminalPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [customCommands, setCustomCommands] = useState([]);
  const [hackCount, setHackCount] = useState(0);
  const [showAddCommand, setShowAddCommand] = useState(false);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      loadCustomCommands();
      loadHackCount();
      addToHistory({ type: 'system', text: 'NULL Terminal v1.0 - Escribe "help" para ver comandos disponibles' });
    }
  }, [user]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const loadCustomCommands = async () => {
    try {
      const commands = await terminalService.getCommands(user.id);
      setCustomCommands(commands);
    } catch (e) {
      console.error('Failed to load commands:', e);
    }
  };

  const loadHackCount = async () => {
    try {
      const stats = await hacksService.getStats(user.id);
      setHackCount(stats.total);
    } catch (e) {
      console.error('Failed to load hack count:', e);
    }
  };

  const addToHistory = (entry) => {
    setHistory(prev => [...prev, { ...entry, id: Date.now() + Math.random() }]);
  };

  const executeCommand = async (cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addToHistory({ type: 'input', text: `$ ${trimmed}` });
    setCommandHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);

    const [command, ...args] = trimmed.split(' ');
    const context = { user, customCommands, hackCount };

    // Check built-in commands
    if (BUILT_IN_COMMANDS[command]) {
      const result = await BUILT_IN_COMMANDS[command].execute(args, context);
      
      if (result === '__CLEAR__') {
        setHistory([]);
        return;
      }
      
      if (result === '__EXIT__') {
        window.location.href = '/secret';
        return;
      }
      
      addToHistory({ type: 'output', text: result });
      await activityService.log(user.id, `Terminal: ${command}`);
      return;
    }

    // Check custom commands
    const customCmd = customCommands.find(c => c.command === command);
    if (customCmd) {
      addToHistory({ type: 'output', text: customCmd.output });
      await activityService.log(user.id, `Terminal (custom): ${command}`);
      return;
    }

    addToHistory({ type: 'error', text: `Comando no encontrado: ${command}. Escribe "help" para ver comandos disponibles.` });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const handleDeleteCommand = async (id) => {
    try {
      await terminalService.deleteCommand(id);
      loadCustomCommands();
    } catch (e) {
      console.error('Failed to delete command:', e);
    }
  };

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-wider text-white">
            <span className="text-cyan glow-cyan-subtle">NULL</span> TERMINAL
          </h1>
          <p className="text-sm text-white/40 tracking-wide mt-1">
            Shell interactiva - {customCommands.length} comandos personalizados
          </p>
        </div>
        <button
          onClick={() => setShowAddCommand(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan/10 border border-cyan/50 text-cyan text-xs tracking-wider hover:bg-cyan/20 transition-colors"
        >
          <Plus size={14} />
          NUEVO COMANDO
        </button>
      </div>

      {/* Terminal */}
      <div 
        ref={terminalRef}
        onClick={() => inputRef.current?.focus()}
        className="flex-1 bg-black/50 border border-cyan/20 rounded p-4 font-mono text-sm overflow-y-auto cursor-text min-h-[400px] box-glow-cyan"
      >
        {history.map((entry) => (
          <div 
            key={entry.id} 
            className={`mb-1 whitespace-pre-wrap ${
              entry.type === 'input' ? 'text-cyan' :
              entry.type === 'error' ? 'text-red-400' :
              entry.type === 'system' ? 'text-white/40' :
              'text-white/80'
            }`}
          >
            {entry.text}
          </div>
        ))}
        
        {/* Input Line */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-cyan">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white outline-none caret-cyan"
            autoFocus
            spellCheck={false}
          />
          <span className="w-2 h-5 bg-cyan animate-pulse" />
        </div>
      </div>

      {/* Custom Commands List */}
      {customCommands.length > 0 && (
        <div className="bg-card border border-cyan/10 rounded p-4">
          <h3 className="text-xs tracking-wider text-white/60 mb-3">COMANDOS PERSONALIZADOS</h3>
          <div className="flex flex-wrap gap-2">
            {customCommands.map((cmd) => (
              <div 
                key={cmd.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded text-xs group"
              >
                <TerminalIcon size={12} className="text-cyan" />
                <span className="text-white/80 font-mono">{cmd.command}</span>
                <button
                  onClick={() => handleDeleteCommand(cmd.id)}
                  className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Command Modal */}
      {showAddCommand && (
        <AddCommandModal
          userId={user.id}
          onClose={() => setShowAddCommand(false)}
          onSave={() => {
            loadCustomCommands();
            setShowAddCommand(false);
          }}
        />
      )}
    </div>
  );
}

function AddCommandModal({ userId, onClose, onSave }) {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await terminalService.addCommand(userId, command, output, description);
      onSave();
    } catch (error) {
      console.error('Failed to add command:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative bg-card border border-cyan/20 rounded-lg w-full max-w-md box-glow-cyan">
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan/10">
          <h2 className="text-lg font-bold tracking-wider text-white">
            NUEVO <span className="text-cyan">COMANDO</span>
          </h2>
          <button onClick={onClose} className="p-2 text-white/60 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs tracking-wider text-white/60 mb-2">COMANDO</label>
            <input
              type="text"
              required
              value={command}
              onChange={(e) => setCommand(e.target.value.toLowerCase().replace(/\s/g, ''))}
              className="w-full px-4 py-2.5 bg-secondary border border-white/10 text-white font-mono rounded focus:border-cyan/50 focus:outline-none"
              placeholder="micomando"
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider text-white/60 mb-2">OUTPUT</label>
            <textarea
              required
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              className="w-full px-4 py-2.5 bg-secondary border border-white/10 text-white font-mono text-sm rounded focus:border-cyan/50 focus:outline-none resize-none"
              rows={4}
              placeholder="Respuesta del comando..."
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider text-white/60 mb-2">DESCRIPCIÓN (opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-secondary border border-white/10 text-white rounded focus:border-cyan/50 focus:outline-none"
              placeholder="Qué hace este comando..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-2.5 text-xs tracking-wider text-white/60 border border-white/10 hover:bg-white/5 transition-colors rounded"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-2.5 text-xs tracking-wider text-cyan bg-cyan/10 border border-cyan/50 hover:bg-cyan/20 transition-colors rounded font-bold"
            >
              CREAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
