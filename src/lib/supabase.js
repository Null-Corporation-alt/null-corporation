import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Some features may not work.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Hacks Service
export const hacksService = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('hacks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('hacks')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(hack) {
    const { data, error } = await supabase
      .from('hacks')
      .insert([hack])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('hacks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('hacks')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getStats(userId) {
    const { data, error } = await supabase
      .from('hacks')
      .select('category, status, risk_level, created_at')
      .eq('user_id', userId);
    if (error) throw error;
    
    const stats = {
      total: data.length,
      byCategory: {},
      byStatus: {},
      byRiskLevel: {},
      recentActivity: []
    };

    data.forEach(hack => {
      stats.byCategory[hack.category] = (stats.byCategory[hack.category] || 0) + 1;
      stats.byStatus[hack.status] = (stats.byStatus[hack.status] || 0) + 1;
      stats.byRiskLevel[hack.risk_level] = (stats.byRiskLevel[hack.risk_level] || 0) + 1;
    });

    return stats;
  }
};

// Activity Logs Service
export const activityService = {
  async log(userId, action, details = {}) {
    const { error } = await supabase
      .from('activity_logs')
      .insert([{ user_id: userId, action, details }]);
    if (error) console.error('Failed to log activity:', error);
  },

  async getRecent(userId, limit = 20) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async getStats(userId) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('action, created_at')
      .eq('user_id', userId);
    if (error) throw error;

    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const activityByDay = {};
    last7Days.forEach(day => activityByDay[day] = 0);

    data.forEach(log => {
      const day = log.created_at.split('T')[0];
      if (activityByDay[day] !== undefined) {
        activityByDay[day]++;
      }
    });

    return {
      total: data.length,
      byDay: last7Days.map(day => ({
        date: day,
        count: activityByDay[day]
      }))
    };
  }
};

// Site Config Service
export const siteConfigService = {
  async getAll() {
    const { data, error } = await supabase
      .from('site_config')
      .select('*');
    if (error) throw error;
    return data;
  },

  async get(key) {
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .eq('key', key)
      .single();
    if (error) throw error;
    return data;
  },

  async update(key, value) {
    const { data, error } = await supabase
      .from('site_config')
      .update({ value: JSON.stringify(value), updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getPublicConfig() {
    const { data, error } = await supabase
      .from('site_config')
      .select('key, value')
      .eq('is_public', true);
    if (error) throw error;
    
    const config = {};
    data.forEach(item => {
      config[item.key] = JSON.parse(item.value);
    });
    return config;
  }
};

// Terminal Commands Service
export const terminalService = {
  async getCommands(userId) {
    const { data, error } = await supabase
      .from('terminal_commands')
      .select('*')
      .or(`user_id.eq.${userId},is_system.eq.true`)
      .order('command', { ascending: true });
    if (error) throw error;
    return data;
  },

  async addCommand(userId, command, output, description = '') {
    const { data, error } = await supabase
      .from('terminal_commands')
      .insert([{ user_id: userId, command, output, description }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCommand(id) {
    const { error } = await supabase
      .from('terminal_commands')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
