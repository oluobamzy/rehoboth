// src/services/contactService.ts
import { supabase } from '@/lib/supabase';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  submitted_at: string;
  updated_at: string;
  admin_notes?: string;
  replied_at?: string;
}

export interface ContactMessageSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessageStats {
  total: number;
  unread: number;
  read: number;
  replied: number;
  archived: number;
  thisMonth: number;
}

export class ContactService {
  // Submit a new contact message
  static async submitMessage(data: ContactMessageSubmission): Promise<ContactMessage> {
    try {
      const { data: result, error } = await supabase
        .from('contact_messages')
        .insert([{
          ...data,
          status: 'unread'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error submitting contact message:', error);
        throw new Error(error.message || 'Failed to submit contact message');
      }

      return result;
    } catch (error) {
      console.error('Error submitting contact message:', error);
      throw error;
    }
  }

  // Get all contact messages for admin
  static async getAllMessages(): Promise<ContactMessage[]> {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching contact messages:', error);
        throw new Error(error.message || 'Failed to fetch contact messages');
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      throw error;
    }
  }

  // Get messages by status
  static async getMessagesByStatus(status: ContactMessage['status']): Promise<ContactMessage[]> {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('status', status)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages by status:', error);
        throw new Error(error.message || 'Failed to fetch messages');
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching messages by status:', error);
      throw error;
    }
  }

  // Update message status and admin notes
  static async updateMessage(
    id: string, 
    updates: Partial<Pick<ContactMessage, 'status' | 'admin_notes' | 'replied_at'>>
  ): Promise<ContactMessage> {
    try {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Set replied_at when status changes to replied
      if (updates.status === 'replied' && !updates.replied_at) {
        updateData.replied_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('contact_messages')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating contact message:', error);
        throw new Error(error.message || 'Failed to update contact message');
      }

      return data;
    } catch (error) {
      console.error('Error updating contact message:', error);
      throw error;
    }
  }

  // Delete a contact message
  static async deleteMessage(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting contact message:', error);
        throw new Error(error.message || 'Failed to delete contact message');
      }
    } catch (error) {
      console.error('Error deleting contact message:', error);
      throw error;
    }
  }

  // Get message statistics
  static async getMessageStats(): Promise<ContactMessageStats> {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('status, submitted_at');

      if (error) {
        console.error('Error fetching contact statistics:', error);
        throw new Error(error.message || 'Failed to fetch statistics');
      }

      const messages = data || [];
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const stats: ContactMessageStats = {
        total: messages.length,
        unread: messages.filter((msg: any) => msg.status === 'unread').length,
        read: messages.filter((msg: any) => msg.status === 'read').length,
        replied: messages.filter((msg: any) => msg.status === 'replied').length,
        archived: messages.filter((msg: any) => msg.status === 'archived').length,
        thisMonth: messages.filter((msg: any) => {
          const submittedDate = new Date(msg.submitted_at);
          return submittedDate.getMonth() === currentMonth && 
                 submittedDate.getFullYear() === currentYear;
        }).length
      };

      return stats;
    } catch (error) {
      console.error('Error fetching contact statistics:', error);
      throw error;
    }
  }

  // Get a single message by ID
  static async getMessageById(id: string): Promise<ContactMessage | null> {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows found
        }
        console.error('Error fetching contact message:', error);
        throw new Error(error.message || 'Failed to fetch contact message');
      }

      return data;
    } catch (error) {
      console.error('Error fetching contact message:', error);
      throw error;
    }
  }

  // Mark message as read
  static async markAsRead(id: string): Promise<ContactMessage> {
    return this.updateMessage(id, { status: 'read' });
  }

  // Mark message as replied
  static async markAsReplied(id: string, adminNotes?: string): Promise<ContactMessage> {
    return this.updateMessage(id, { 
      status: 'replied', 
      admin_notes: adminNotes,
      replied_at: new Date().toISOString()
    });
  }

  // Archive message
  static async archiveMessage(id: string, adminNotes?: string): Promise<ContactMessage> {
    return this.updateMessage(id, { 
      status: 'archived', 
      admin_notes: adminNotes 
    });
  }
}