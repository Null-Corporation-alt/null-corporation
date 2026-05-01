import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { siteConfigService, activityService } from '@/lib/supabase';
import { 
  Power, 
  Eye, 
  EyeOff, 
  MessageSquare, 
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings2
} from 'lucide-react';

const CONFIG_ITEMS = [
  { 
    key: 'maintenance_mode', 
    label: 'Modo Mantenimiento', 
    description: 'Muestra una página de mantenimiento a los visitantes',
    icon: Power,
    type: 'boolean',
    danger: true
  },
  { 
    key: 'show_projects', 
    label: 'Mostrar Proyectos', 
    description: 'Visibilidad de la sección de proyectos',
    icon: Eye,
    type: 'boolean'
  },
  { 
    key: 'show_skills', 
    label: 'Mostrar Habilidades', 
    description: 'Visibilidad de la sección de habilidades',
    icon: Eye,
    type: 'boolean'
  },
  { 
    key: 'show_contact', 
    label: 'Mostrar Contacto', 
    description: 'Visibilidad de la sección de contacto',
    icon: Eye,
    type: 'boolean'
  },
  { 
    key: 'site_message', 
    label: 'Mensaje del Sitio', 
    description: 'Mensaje personalizado que aparece en el header',
    icon: MessageSquare,
    type: 'string'
  }
];

export default function ControlPanel() {
  const { user } = useAuth();
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await siteConfigService.getAll();
      const configMap = {};
      data.forEach(item => {
        configMap[item.key] = JSON.parse(item.value);
      });
      setConfigs(configMap);
    } catch (error) {
      console.error('Failed to load configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (key, value) => {
    setSaving(prev => ({ ...prev, [key]: true }));
    setSaved(prev => ({ ...prev, [key]: false }));
    
    try {
      await siteConfigService.update(key, value);
      setConfigs(prev => ({ ...prev, [key]: value }));
      await activityService.log(user.id, `Config actualizada: ${key} = ${JSON.stringify(value)}`);
      
      setSaved(prev => ({ ...prev, [key]: true }));
      setTimeout(() => setSaved(prev => ({ ...prev, [key]: false })), 2000);
    } catch (error) {
      console.error('Failed to update config:', error);
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  const toggleBoolean = (key) => {
    const currentValue = configs[key] === 'true' || configs[key] === true;
    updateConfig(key, !currentValue);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-wider text-white">
            CONTROL <span className="text-cyan glow-cyan-subtle">REMOTO</span>
          </h1>
          <p className="text-sm text-white/40 tracking-wide mt-1">
            Gestiona la configuración del sitio público
          </p>
        </div>
        <button
          onClick={loadConfigs}
          className="flex items-center gap-2 px-4 py-2 text-xs tracking-wider text-white/60 border border-white/10 hover:bg-white/5 transition-colors"
        >
          <RefreshCw size={14} />
          RECARGAR
        </button>
      </div>

      {/* Warning Banner */}
      {(configs.maintenance_mode === 'true' || configs.maintenance_mode === true) && (
        <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded">
          <AlertTriangle className="text-red-500 flex-shrink-0" size={24} />
          <div>
            <p className="text-red-400 font-bold text-sm tracking-wider">MODO MANTENIMIENTO ACTIVO</p>
            <p className="text-red-400/70 text-xs mt-1">El sitio público está mostrando una página de mantenimiento</p>
          </div>
        </div>
      )}

      {/* Config Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {CONFIG_ITEMS.map((item) => (
          <ConfigCard
            key={item.key}
            item={item}
            value={configs[item.key]}
            saving={saving[item.key]}
            saved={saved[item.key]}
            onToggle={() => toggleBoolean(item.key)}
            onUpdate={(value) => updateConfig(item.key, value)}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-cyan/10 rounded p-6">
        <h3 className="text-sm font-bold tracking-wider text-white/80 mb-4 flex items-center gap-2">
          <Settings2 size={16} className="text-cyan" />
          ACCIONES RÁPIDAS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickAction
            label="Ocultar Todo"
            description="Oculta todas las secciones"
            onClick={() => {
              updateConfig('show_projects', false);
              updateConfig('show_skills', false);
              updateConfig('show_contact', false);
            }}
            variant="warning"
          />
          <QuickAction
            label="Mostrar Todo"
            description="Muestra todas las secciones"
            onClick={() => {
              updateConfig('show_projects', true);
              updateConfig('show_skills', true);
              updateConfig('show_contact', true);
            }}
            variant="success"
          />
          <QuickAction
            label="Reset Mensaje"
            description="Elimina el mensaje del sitio"
            onClick={() => updateConfig('site_message', '')}
            variant="default"
          />
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-card border border-cyan/10 rounded p-6">
        <h3 className="text-sm font-bold tracking-wider text-white/80 mb-4">ESTADO ACTUAL</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatusIndicator
            label="Mantenimiento"
            active={configs.maintenance_mode === 'true' || configs.maintenance_mode === true}
            danger
          />
          <StatusIndicator
            label="Proyectos"
            active={configs.show_projects === 'true' || configs.show_projects === true}
          />
          <StatusIndicator
            label="Habilidades"
            active={configs.show_skills === 'true' || configs.show_skills === true}
          />
          <StatusIndicator
            label="Contacto"
            active={configs.show_contact === 'true' || configs.show_contact === true}
          />
        </div>
      </div>
    </div>
  );
}

function ConfigCard({ item, value, saving, saved, onToggle, onUpdate }) {
  const [inputValue, setInputValue] = useState('');
  const Icon = item.icon;
  const isBoolean = item.type === 'boolean';
  const boolValue = value === 'true' || value === true;

  useEffect(() => {
    if (!isBoolean) {
      setInputValue(value || '');
    }
  }, [value, isBoolean]);

  const handleSave = () => {
    onUpdate(inputValue);
  };

  return (
    <div className={`bg-card border rounded p-5 transition-all duration-300 ${
      item.danger && boolValue 
        ? 'border-red-500/30 bg-red-500/5' 
        : 'border-cyan/10 hover:border-cyan/20'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 flex items-center justify-center rounded border ${
            item.danger && boolValue
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-cyan/10 border-cyan/20'
          }`}>
            <Icon size={18} className={item.danger && boolValue ? 'text-red-500' : 'text-cyan'} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm tracking-wide">{item.label}</h4>
            <p className="text-xs text-white/40 mt-0.5">{item.description}</p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {saving && (
            <RefreshCw size={14} className="text-cyan animate-spin" />
          )}
          {saved && (
            <CheckCircle size={14} className="text-green-500" />
          )}
        </div>
      </div>

      {isBoolean ? (
        <button
          onClick={onToggle}
          disabled={saving}
          className={`w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 text-xs tracking-wider font-bold transition-all duration-300 rounded ${
            boolValue
              ? item.danger
                ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
                : 'bg-cyan/20 border border-cyan/50 text-cyan hover:bg-cyan/30'
              : 'bg-secondary border border-white/10 text-white/60 hover:bg-white/5'
          }`}
        >
          {boolValue ? <Eye size={14} /> : <EyeOff size={14} />}
          {boolValue ? 'ACTIVO' : 'INACTIVO'}
        </button>
      ) : (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-4 py-2 bg-secondary border border-white/10 text-white text-sm rounded focus:border-cyan/50 focus:outline-none"
            placeholder="Escribe un mensaje..."
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-cyan/10 border border-cyan/50 text-cyan hover:bg-cyan/20 transition-colors rounded"
          >
            <Save size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function QuickAction({ label, description, onClick, variant = 'default' }) {
  const variants = {
    default: 'border-white/10 hover:border-white/20 text-white/60 hover:text-white',
    warning: 'border-orange-500/30 hover:border-orange-500/50 text-orange-400 hover:bg-orange-500/10',
    success: 'border-green-500/30 hover:border-green-500/50 text-green-400 hover:bg-green-500/10'
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 text-left border rounded transition-all duration-300 ${variants[variant]}`}
    >
      <p className="text-sm font-bold tracking-wider">{label}</p>
      <p className="text-xs opacity-60 mt-1">{description}</p>
    </button>
  );
}

function StatusIndicator({ label, active, danger = false }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded">
      <div className={`w-3 h-3 rounded-full ${
        active
          ? danger
            ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
            : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
          : 'bg-white/20'
      }`} />
      <span className="text-xs text-white/60 tracking-wider">{label}</span>
    </div>
  );
}
