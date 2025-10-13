import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface ChurchSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'text' | 'json' | 'url' | 'email' | 'phone' | 'textarea';
  category: 'contact' | 'social_media' | 'services' | 'general';
  display_name: string;
  description?: string;
  is_active: boolean;
  updated_at: string;
  updated_by?: string;
  created_at: string;
}

export interface ChurchSettings {
  // Contact Information
  church_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  phone_main: string;
  email_main: string;
  email_contact: string;
  google_maps_url: string;
  
  // Social Media
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  twitter_url: string;
  youtube_channel_id: string;
  youtube_handle: string;
  
  // Services
  service_times: {
    sunday: string;
    wednesday: string;
    friday: string;
    saturday: string;
  };
  
  // General
  church_description: string;
}

export class ChurchSettingsService {
  private static getSupabaseClient() {
    return createClientComponentClient();
  }

  // Get all settings
  static async getAllSettings(): Promise<ChurchSetting[]> {
    try {
      const supabase = this.getSupabaseClient();
      const { data, error } = await supabase
        .from('church_settings')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('display_name', { ascending: true });

      if (error) {
        console.error('Error fetching church settings:', error);
        throw new Error(`Failed to fetch church settings: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Exception in getAllSettings:', error);
      throw error;
    }
  }

  // Get settings by category
  static async getSettingsByCategory(category: string): Promise<ChurchSetting[]> {
    try {
      const supabase = this.getSupabaseClient();
      const { data, error } = await supabase
        .from('church_settings')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('display_name', { ascending: true });

      if (error) {
        console.error(`Error fetching ${category} settings:`, error);
        throw new Error(`Failed to fetch ${category} settings: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error(`Exception in getSettingsByCategory(${category}):`, error);
      throw error;
    }
  }

  // Get a single setting by key
  static async getSetting(key: string): Promise<string | null> {
    try {
      const supabase = this.getSupabaseClient();
      const { data, error } = await supabase
        .from('church_settings')
        .select('setting_value')
        .eq('setting_key', key)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error(`Error fetching setting ${key}:`, error);
        throw new Error(`Failed to fetch setting ${key}: ${error.message}`);
      }

      return data?.setting_value || null;
    } catch (error) {
      console.error(`Exception in getSetting(${key}):`, error);
      throw error;
    }
  }

  // Get formatted church settings object
  static async getFormattedSettings(): Promise<ChurchSettings> {
    try {
      const settings = await this.getAllSettings();
      const settingsMap: Record<string, string> = {};
      
      settings.forEach(setting => {
        settingsMap[setting.setting_key] = setting.setting_value;
      });

      // Parse service times JSON
      let serviceTimes;
      try {
        serviceTimes = JSON.parse(settingsMap.service_times || '{}');
      } catch (e) {
        console.warn('Error parsing service_times JSON:', e);
        serviceTimes = {
          sunday: "3:00 PM - 6:00 PM",
          wednesday: "7:00 PM - 9:00 PM (Prayer Service)",
          friday: "Women Overnight Service",
          saturday: "7:00 PM - 9:00 PM (Youth Prayer & Choir)"
        };
      }

      return {
        church_name: settingsMap.church_name || 'Rehoboth Christian Church',
        address_line_1: settingsMap.address_line_1 || '414 Pleasant Park Road',
        address_line_2: settingsMap.address_line_2 || '',
        city: settingsMap.city || 'Rehoboth',
        state: settingsMap.state || 'MA',
        zip_code: settingsMap.zip_code || '02769',
        phone_main: settingsMap.phone_main || '(613) 400-4966',
        email_main: settingsMap.email_main || 'rehobothchrisitianchurch2022@gmail.com',
        email_contact: settingsMap.email_contact || 'rehobothchrisitianchurch2022@gmail.com',
        google_maps_url: settingsMap.google_maps_url || '',
        facebook_url: settingsMap.facebook_url || 'https://facebook.com/rehobothcchurch',
        instagram_url: settingsMap.instagram_url || 'https://instagram.com/rehobothcchurch',
        youtube_url: settingsMap.youtube_url || 'https://youtube.com/rehobothcchurch',
        twitter_url: settingsMap.twitter_url || 'https://twitter.com/rehobothcchurch',
        youtube_channel_id: settingsMap.youtube_channel_id || 'UC-yUYcusNxkfA2qyjQMFblA',
        youtube_handle: settingsMap.youtube_handle || '@OfficiallRCC',
        service_times: serviceTimes,
        church_description: settingsMap.church_description || 'Join us for worship and fellowship as we grow together in faith.'
      };
    } catch (error) {
      console.error('Exception in getFormattedSettings:', error);
      throw error;
    }
  }

  // Update a setting
  static async updateSetting(
    key: string, 
    value: string, 
    userId?: string
  ): Promise<ChurchSetting> {
    try {
      const supabase = this.getSupabaseClient();
      const updateData: any = {
        setting_value: value,
        updated_at: new Date().toISOString()
      };

      if (userId) {
        updateData.updated_by = userId;
      }

      const { data, error } = await supabase
        .from('church_settings')
        .update(updateData)
        .eq('setting_key', key)
        .select()
        .single();

      if (error) {
        console.error(`Error updating setting ${key}:`, error);
        throw new Error(`Failed to update setting ${key}: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error(`Exception in updateSetting(${key}):`, error);
      throw error;
    }
  }

  // Update multiple settings
  static async updateMultipleSettings(
    updates: Array<{ key: string; value: string }>,
    userId?: string
  ): Promise<ChurchSetting[]> {
    try {
      const results: ChurchSetting[] = [];
      
      for (const update of updates) {
        const result = await this.updateSetting(update.key, update.value, userId);
        results.push(result);
      }

      return results;
    } catch (error) {
      console.error('Exception in updateMultipleSettings:', error);
      throw error;
    }
  }

  // Validate setting value based on type
  static validateSettingValue(type: string, value: string): { isValid: boolean; error?: string } {
    if (!value.trim()) {
      return { isValid: false, error: 'Value cannot be empty' };
    }

    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return { isValid: false, error: 'Please enter a valid email address' };
        }
        break;
      
      case 'phone':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$|^[\(]?[\d\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
          return { isValid: false, error: 'Please enter a valid phone number' };
        }
        break;
      
      case 'url':
        try {
          new URL(value);
        } catch {
          return { isValid: false, error: 'Please enter a valid URL' };
        }
        break;
      
      case 'json':
        try {
          JSON.parse(value);
        } catch {
          return { isValid: false, error: 'Please enter valid JSON' };
        }
        break;
    }

    return { isValid: true };
  }

  // Get full address string
  static formatAddress(settings: ChurchSettings): string {
    const parts = [
      settings.address_line_1,
      settings.address_line_2,
      `${settings.city}, ${settings.state} ${settings.zip_code}`
    ].filter(Boolean);
    
    return parts.join(', ');
  }
}