'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ChurchSettings, ChurchSetting } from '@/services/churchSettingsService';

interface UseChurchSettingsReturn {
  settings: ChurchSettings | null;
  rawSettings: ChurchSetting[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateSetting: (key: string, value: string) => Promise<void>;
  updateMultipleSettings: (updates: Array<{ key: string; value: string }>) => Promise<void>;
}

export function useChurchSettings(): UseChurchSettingsReturn {
  const [settings, setSettings] = useState<ChurchSettings | null>(null);
  const [rawSettings, setRawSettings] = useState<ChurchSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all settings from the database
      const { data, error: fetchError } = await supabase
        .from('church_settings')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('display_name', { ascending: true });

      if (fetchError) {
        throw new Error(`Failed to fetch church settings: ${fetchError.message}`);
      }

      const settingsData = data || [];
      setRawSettings(settingsData);

      // Convert to formatted settings object
      const settingsMap: Record<string, string> = {};
      settingsData.forEach(setting => {
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

      const formattedSettings: ChurchSettings = {
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

      setSettings(formattedSettings);
    } catch (err) {
      console.error('Error fetching church settings:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching church settings');
      
      // Set fallback values in case of error
      const fallbackSettings: ChurchSettings = {
        church_name: 'Rehoboth Christian Church',
        address_line_1: '414 Pleasant Park Road',
        address_line_2: '',
        city: 'Rehoboth',
        state: 'MA',
        zip_code: '02769',
        phone_main: '(613) 400-4966',
        email_main: 'rehobothchrisitianchurch2022@gmail.com',
        email_contact: 'rehobothchrisitianchurch2022@gmail.com',
        google_maps_url: '',
        facebook_url: 'https://facebook.com/rehobothcchurch',
        instagram_url: 'https://instagram.com/rehobothcchurch',
        youtube_url: 'https://youtube.com/rehobothcchurch',
        twitter_url: 'https://twitter.com/rehobothcchurch',
        youtube_channel_id: 'UC-yUYcusNxkfA2qyjQMFblA',
        youtube_handle: '@OfficiallRCC',
        service_times: {
          sunday: "3:00 PM - 6:00 PM",
          wednesday: "7:00 PM - 9:00 PM (Prayer Service)",
          friday: "Women Overnight Service",
          saturday: "7:00 PM - 9:00 PM (Youth Prayer & Choir)"
        },
        church_description: 'Join us for worship and fellowship as we grow together in faith.'
      };
      setSettings(fallbackSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData: any = {
        setting_value: value,
        updated_at: new Date().toISOString()
      };

      if (user) {
        updateData.updated_by = user.id;
      }

      const { error: updateError } = await supabase
        .from('church_settings')
        .update(updateData)
        .eq('setting_key', key);

      if (updateError) {
        throw new Error(`Failed to update setting ${key}: ${updateError.message}`);
      }

      // Refresh settings after update
      await fetchSettings();
    } catch (err) {
      console.error('Error updating setting:', err);
      throw err;
    }
  };

  const updateMultipleSettings = async (updates: Array<{ key: string; value: string }>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update settings one by one
      for (const update of updates) {
        const updateData: any = {
          setting_value: update.value,
          updated_at: new Date().toISOString()
        };

        if (user) {
          updateData.updated_by = user.id;
        }

        const { error: updateError } = await supabase
          .from('church_settings')
          .update(updateData)
          .eq('setting_key', update.key);

        if (updateError) {
          throw new Error(`Failed to update setting ${update.key}: ${updateError.message}`);
        }
      }

      // Refresh settings after all updates
      await fetchSettings();
    } catch (err) {
      console.error('Error updating multiple settings:', err);
      throw err;
    }
  };

  const refresh = async () => {
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    rawSettings,
    isLoading,
    error,
    refresh,
    updateSetting,
    updateMultipleSettings
  };
}

// Hook for getting specific setting categories
export function useChurchSettingsByCategory(category: string) {
  const [settings, setSettings] = useState<ChurchSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const fetchCategorySettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('church_settings')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('display_name', { ascending: true });

      if (fetchError) {
        throw new Error(`Failed to fetch ${category} settings: ${fetchError.message}`);
      }

      setSettings(data || []);
    } catch (err) {
      console.error(`Error fetching ${category} settings:`, err);
      setError(err instanceof Error ? err.message : `An error occurred while fetching ${category} settings`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorySettings();
  }, [category]);

  return {
    settings,
    isLoading,
    error,
    refresh: fetchCategorySettings
  };
}