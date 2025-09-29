// src/services/volunteerService.ts
import { supabase } from '@/lib/supabase';

export interface VolunteerApplication {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ministry: string;
  experience?: string;
  availability?: string;
  message?: string;
  status: 'pending' | 'contacted' | 'accepted' | 'declined';
  submitted_at: string;
  updated_at: string;
  admin_notes?: string;
}

export interface VolunteerApplicationSubmission {
  name: string;
  email: string;
  phone?: string;
  ministry: string;
  experience?: string;
  availability?: string;
  message?: string;
}

export interface VolunteerApplicationStats {
  total: number;
  pending: number;
  contacted: number;
  accepted: number;
  declined: number;
  thisMonth: number;
}

export class VolunteerService {
  // Submit a new volunteer application
  static async submitApplication(data: VolunteerApplicationSubmission): Promise<VolunteerApplication> {
    try {
      const { data: result, error } = await supabase
        .from('volunteer_applications')
        .insert([{
          ...data,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error submitting volunteer application:', error);
        throw new Error(error.message || 'Failed to submit volunteer application');
      }

      return result;
    } catch (error) {
      console.error('Error submitting volunteer application:', error);
      throw error;
    }
  }

  // Get all volunteer applications for admin
  static async getAllApplications(): Promise<VolunteerApplication[]> {
    try {
      const { data, error } = await supabase
        .from('volunteer_applications')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching volunteer applications:', error);
        throw new Error(error.message || 'Failed to fetch volunteer applications');
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching volunteer applications:', error);
      throw error;
    }
  }

  // Get applications by status
  static async getApplicationsByStatus(status: VolunteerApplication['status']): Promise<VolunteerApplication[]> {
    try {
      const { data, error } = await supabase
        .from('volunteer_applications')
        .select('*')
        .eq('status', status)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications by status:', error);
        throw new Error(error.message || 'Failed to fetch applications');
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching applications by status:', error);
      throw error;
    }
  }

  // Update application status and admin notes
  static async updateApplication(
    id: string, 
    updates: Partial<Pick<VolunteerApplication, 'status' | 'admin_notes'>>
  ): Promise<VolunteerApplication> {
    try {
      const { data, error } = await supabase
        .from('volunteer_applications')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating volunteer application:', error);
        throw new Error(error.message || 'Failed to update volunteer application');
      }

      return data;
    } catch (error) {
      console.error('Error updating volunteer application:', error);
      throw error;
    }
  }

  // Delete a volunteer application
  static async deleteApplication(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('volunteer_applications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting volunteer application:', error);
        throw new Error(error.message || 'Failed to delete volunteer application');
      }
    } catch (error) {
      console.error('Error deleting volunteer application:', error);
      throw error;
    }
  }

  // Get application statistics
  static async getApplicationStats(): Promise<VolunteerApplicationStats> {
    try {
      const { data, error } = await supabase
        .from('volunteer_applications')
        .select('status, submitted_at');

      if (error) {
        console.error('Error fetching volunteer statistics:', error);
        throw new Error(error.message || 'Failed to fetch statistics');
      }

      const applications = data || [];
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const stats: VolunteerApplicationStats = {
        total: applications.length,
        pending: applications.filter((app: any) => app.status === 'pending').length,
        contacted: applications.filter((app: any) => app.status === 'contacted').length,
        accepted: applications.filter((app: any) => app.status === 'accepted').length,
        declined: applications.filter((app: any) => app.status === 'declined').length,
        thisMonth: applications.filter((app: any) => {
          const submittedDate = new Date(app.submitted_at);
          return submittedDate.getMonth() === currentMonth && 
                 submittedDate.getFullYear() === currentYear;
        }).length
      };

      return stats;
    } catch (error) {
      console.error('Error fetching volunteer statistics:', error);
      throw error;
    }
  }

  // Get a single application by ID
  static async getApplicationById(id: string): Promise<VolunteerApplication | null> {
    try {
      const { data, error } = await supabase
        .from('volunteer_applications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows found
        }
        console.error('Error fetching volunteer application:', error);
        throw new Error(error.message || 'Failed to fetch volunteer application');
      }

      return data;
    } catch (error) {
      console.error('Error fetching volunteer application:', error);
      throw error;
    }
  }
}