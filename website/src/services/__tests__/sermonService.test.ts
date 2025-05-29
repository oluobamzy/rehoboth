jest.mock('../supabase');
jest.mock('../posthog');
jest.mock('firebase/storage');
jest.mock('../firebase');

import { 
  fetchSermons, 
  fetchSermonById, 
  incrementSermonViewCount, 
  uploadSermonMedia 
} from '../sermonService';
import * as supabase from '../supabase';
import * as posthog from '../posthog';
import * as firebase from '../firebase';
import * as firebaseStorage from 'firebase/storage';

// Mock response data
const mockSupabaseResponse = {
  data: [
    { 
      id: 'sermon123',
      title: 'Test Sermon',
      description: 'A test sermon',
      speaker_name: 'Pastor John',
      sermon_date: '2025-01-01',
      series: {
        id: 'series123',
        title: 'Test Series'
      }
    }
  ],
  count: 1,
  error: null
};

const mockStorageFunctions = {
  ref: jest.fn().mockImplementation((_, path) => ({ path })),
  uploadBytes: jest.fn().mockImplementation(async () => ({ 
    ref: { path: 'mocked-path' } 
  })),
  uploadBytesResumable: jest.fn().mockImplementation((ref, file) => ({
    on: jest.fn((event, progressCallback, errorCallback, completeCallback) => {
      progressCallback?.({ bytesTransferred: 100, totalBytes: 100 });
      completeCallback?.({
        ref: { path: 'mocked-path' },
        metadata: { contentType: file.type }
      });
      return () => {};
    }),
    snapshot: {
      ref: { path: 'mocked-path' },
      bytesTransferred: 100,
      totalBytes: 100,
      state: 'success'
    }
  })),
  getDownloadURL: jest.fn().mockImplementation(async () => 'https://example.com/mocked-url'),
  getStorage: jest.fn().mockImplementation(() => ({}))
};

describe('sermonService', () => {
  const mockSupabaseClient = {
    from: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up Supabase mock implementations
    (supabase as any).supabase = mockSupabaseClient;
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockSupabaseResponse.data[0], error: null }),
          range: jest.fn().mockResolvedValue(mockSupabaseResponse)
        })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      })
    });

    // Set up Firebase Storage mocks
    Object.assign(firebaseStorage, mockStorageFunctions);
    (firebase as any).storage = mockStorageFunctions;
    (firebase as any).auth = { currentUser: { uid: 'test-user-id' } };
  });

  describe('fetchSermons', () => {
    it('fetches sermons with default parameters', async () => {
      const result = await fetchSermons({});
      
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sermons');
      expect(result).toEqual({
        sermons: mockSupabaseResponse.data,
        count: mockSupabaseResponse.count
      });
    });
  });

  describe('fetchSermonById', () => {
    it('fetches a single sermon by ID', async () => {
      const result = await fetchSermonById('sermon123');
      
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sermons');
      expect(result).toEqual(mockSupabaseResponse.data[0]);
    });
  });

  describe('uploadSermonMedia', () => {
    it('uploads media and updates the sermon record', async () => {
      const file = new File(['dummy content'], 'test-audio.mp3', { type: 'audio/mp3' });
      
      const result = await uploadSermonMedia(file, 'sermon123', 'audio');
      
      expect(mockStorageFunctions.ref).toHaveBeenCalledWith(
        expect.anything(), 
        expect.stringContaining('sermons/audio/sermon123')
      );
      expect(result).toBe('https://example.com/mocked-url');
    });
  });
});
