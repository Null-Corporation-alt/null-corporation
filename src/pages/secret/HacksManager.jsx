import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { hacksService, activityService } from '@/lib/supabase';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Code2,
  AlertTriangle,
  CheckCircle,
  Archive,
  FlaskConical,
  Filter
} from 'lucide-react';

const CATEGORIES = [
  { value: 'exploit', label: 'Exploit', icon: AlertTriangle },
  { value: 'tool', label: 'Tool', icon: Code2 },
  { value: 'script', label: 'Script', icon: FlaskConical },
  { value: 'payload', label: 'Payload', icon: Archive },
  { value: 'other', label: 'Other', icon: Code2 }
];

const RISK_LEVELS = [
  { value: 'low', label: 'Bajo', color: '#22c55e' },
  { value: 'medium', label: 'Medio', color: '#f97316' },
  { value: 'high', label: 'Alto', color: '#ef4444' },
  { value: 'critical', label: 'Crítico', color: '#dc2626' }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo', icon: CheckCircle },
  { value: 'testing', label: 'Testing', icon: FlaskConical },
  { value: 'archived', label: 'Archivado', icon: Archive }
];

export default function HacksManager() {
  const { user } = useAuth();
  const [hacks, setHacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHack, setEditingHack] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadHacks();
    }
  }, [user]);

  const loadHacks = async () => {
    try {
      setLoading(true);
      const data = await hacksService.getAll(user.id);
      setHacks(data);
    } catch (error) {
      console.error('Failed to load hacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (hackData) => {
    try {
      if (editingHack) {
        await hacksService.update(editingHack.id, hackData);
        await activityService.log(user.id, `Hack actualizado: ${hackData.name}`);
      } else {
        await hacksService.create({ ...hackData, user_id: user.id });
        await activityService.log(user.id, `Nuevo hack creado: ${hackData.name}`);
      }
      loadHacks();
      setModalOpen(false);
      setEditingHack(null);
    } catch (error) {
      console.error('Failed to save hack:', error);
    }
  };

  const handleDelete = async (hack) => {
    if (!confirm(`¿Eliminar "${hack.name}"?`)) return;
    try {
      await hacksService.delete(hack.id);
      await activityService.log(user.id, `Hack eliminado: ${hack.name}`);
      loadHacks();
    } catch (error) {
      console.error('Failed to delete hack:', error);
    }
  };

  const openEdit = (hack) => {
    setEditingHack(hack);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingHack(null);
    setModalOpen(true);
  };

  const filteredHacks = hacks.filter(hack => {
    const matchesSearch = hack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          hack.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || hack.category === filterCategory;
    const matchesStatus = !filterStatus || hack.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-wider text-white">
            GESTOR DE <span className="text-cyan glow-cyan-subtle">HACKS</span>
          </h1>
          <p className="text-sm text-white/40 tracking-wide mt-1">
            {hacks.length} herramientas registradas
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan/10 border border-cyan/50 text-cyan text-xs tracking-wider font-bold hover:bg-cyan/20 transition-all duration-300 box-glow-cyan-hover"
        >
          <Plus size={16} />
          NUEVO HACK
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Buscar hacks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-white/10 text-white text-sm rounded focus:border-cyan/50 focus:outline-none transition-colors"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 bg-secondary border border-white/10 text-white text-sm rounded focus:border-cyan/50 focus:outline-none"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-secondary border border-white/10 text-white text-sm rounded focus:border-cyan/50 focus:outline-none"
        >
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
      </div>

      {/* Hacks Grid */}
      {filteredHacks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredHacks.map((hack) => (
            <HackCard 
              key={hack.id} 
              hack={hack} 
              onEdit={() => openEdit(hack)}
              onDelete={() => handleDelete(hack)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card border border-cyan/10 rounded">
          <Code2 size={48} className="mx-auto mb-4 text-white/20" />
          <p className="text-white/40 mb-4">
            {searchTerm || filterCategory || filterStatus 
              ? 'No se encontraron hacks con esos filtros'
              : 'Aún no tienes hacks registrados'
            }
          </p>
          {!searchTerm && !filterCategory && !filterStatus && (
            <button
              onClick={openCreate}
              className="px-5 py-2 text-xs tracking-wider text-cyan border border-cyan/50 hover:bg-cyan/10 transition-colors"
            >
              CREAR PRIMER HACK
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <HackModal
          hack={editingHack}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingHack(null); }}
        />
      )}
    </div>
  );
}

function HackCard({ hack, onEdit, onDelete }) {
  const category = CATEGORIES.find(c => c.value === hack.category);
  const riskLevel = RISK_LEVELS.find(r => r.value === hack.risk_level);
  const status = STATUS_OPTIONS.find(s => s.value === hack.status);
  const CategoryIcon = category?.icon || Code2;
  const StatusIcon = status?.icon || CheckCircle;

  return (
    <div className="bg-card border border-cyan/10 rounded p-5 hover:border-cyan/30 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-cyan/10 rounded border border-cyan/20">
            <CategoryIcon size={18} className="text-cyan" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm tracking-wide">{hack.name}</h3>
            <span className="text-xs text-white/40 uppercase tracking-wider">{category?.label}</span>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 text-white/40 hover:text-cyan hover:bg-cyan/10 rounded transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      {hack.description && (
        <p className="text-sm text-white/60 mb-4 line-clamp-2">{hack.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span 
            className="px-2 py-1 text-[10px] tracking-wider rounded border"
            style={{ 
              color: riskLevel?.color, 
              borderColor: `${riskLevel?.color}44`,
              backgroundColor: `${riskLevel?.color}11`
            }}
          >
            {riskLevel?.label?.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <StatusIcon size={12} />
          <span className="uppercase tracking-wider">{status?.label}</span>
        </div>
      </div>

      {hack.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
          {hack.tags.slice(0, 4).map((tag, i) => (
            <span key={i} className="px-2 py-0.5 text-[10px] bg-white/5 text-white/50 rounded">
              {tag}
            </span>
          ))}
          {hack.tags.length > 4 && (
            <span className="text-[10px] text-white/30">+{hack.tags.length - 4}</span>
          )}
        </div>
      )}
    </div>
  );
}

function HackModal({ hack, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: hack?.name || '',
    description: hack?.description || '',
    category: hack?.category || 'tool',
    code: hack?.code || '',
    status: hack?.status || 'active',
    risk_level: hack?.risk_level || 'low',
    tags: hack?.tags?.join(', ') || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative bg-card border border-cyan/20 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto box-glow-cyan">
        <div className="sticky top-0 bg-card border-b border-cyan/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-wider text-white">
            {hack ? 'EDITAR' : 'NUEVO'} <span className="text-cyan">HACK</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs tracking-wider text-white/60 mb-2">NOMBRE</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-secondary border border-white/10 text-white rounded focus:border-cyan/50 focus:outline-none"
              placeholder="Nombre del hack..."
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider text-white/60 mb-2">DESCRIPCIÓN</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-secondary border border-white/10 text-white rounded focus:border-cyan/50 focus:outline-none resize-none"
              rows={3}
              placeholder="Descripción del hack..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs tracking-wider text-white/60 mb-2">CATEGORÍA</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-secondary border border-white/10 text-white rounded focus:border-cyan/50 focus:outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs tracking-wider text-white/60 mb-2">ESTADO</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 bg-secondary border border-white/10 text-white rounded focus:border-cyan/50 focus:outline-none"
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs tracking-wider text-white/60 mb-2">NIVEL DE RIESGO</label>
              <select
                value={formData.risk_level}
                onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
                className="w-full px-4 py-2.5 bg-secondary border border-white/10 text-white rounded focus:border-cyan/50 focus:outline-none"
              >
                {RISK_LEVELS.map(risk => (
                  <option key={risk.value} value={risk.value}>{risk.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs tracking-wider text-white/60 mb-2">CÓDIGO / PAYLOAD</label>
            <textarea
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-4 py-2.5 bg-secondary border border-white/10 text-white rounded focus:border-cyan/50 focus:outline-none font-mono text-sm resize-none"
              rows={6}
              placeholder="# Tu código aquí..."
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider text-white/60 mb-2">TAGS (separados por coma)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2.5 bg-secondary border border-white/10 text-white rounded focus:border-cyan/50 focus:outline-none"
              placeholder="xss, web, injection..."
            />
          </div>

          <div className="flex gap-3 pt-4">
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
              {hack ? 'GUARDAR CAMBIOS' : 'CREAR HACK'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
