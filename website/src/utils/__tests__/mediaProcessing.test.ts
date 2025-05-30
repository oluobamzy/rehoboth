// src/utils/__tests__/mediaProcessing.test.ts
import { jest } from '@jest/globals';
import { processMediaFile } from '../mediaProcessing';
import type { MediaProcessingOptions } from '../mediaProcessing';
import type { FFmpeg } from '@ffmpeg/ffmpeg';
import type {
  UploadResult,
  StorageReference as BaseStorageReference,
  UploadTask as BaseUploadTask,
  UploadTaskSnapshot,
  StorageObserver,
  FullMetadata,
  FirebaseStorage,
  StorageError
} from 'firebase/storage';
import type { FirebaseApp } from 'firebase/app';
import * as firebaseStorage from 'firebase/storage';

// Type for task unsubscribe function
type Unsubscribe = () => void;

// Extended interfaces that match the actual Firebase types
interface StorageReference extends BaseStorageReference {
  bucket: string;
  fullPath: string;
  name: string;
  parent: StorageReference | null;
  root: StorageReference;
  storage: FirebaseStorage;
  toString(): string;
  delete(): Promise<void>;
  getDownloadURL(): Promise<string>;
  getMetadata(): Promise<FullMetadata>;
  list(options?: { maxResults?: number; pageToken?: string }): Promise<{ items: StorageReference[]; prefixes: StorageReference[] }>;
  listAll(): Promise<{ items: StorageReference[]; prefixes: StorageReference[] }>;
  put(data: Blob | Uint8Array | ArrayBuffer, metadata?: any): Promise<UploadResult>;
  putString(data: string, format?: string, metadata?: any): Promise<UploadResult>;
  updateMetadata(metadata: { [key: string]: any }): Promise<FullMetadata>;
}

interface UploadTask extends BaseUploadTask {
  snapshot: UploadTaskSnapshot;
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: UploadTaskSnapshot) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2>;
  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
  ): Promise<UploadTaskSnapshot | TResult>;
}

const mockApp: FirebaseApp = {
  name: '[DEFAULT]',
  options: {},
  automaticDataCollectionEnabled: false
};

const mockStorage: FirebaseStorage = {
  app: mockApp,
  maxOperationRetryTime: 120000,
  maxUploadRetryTime: 600000
};

// Create a mock upload task
const createMockUploadTask = (path: string): UploadTask => {
  const task = {
    snapshot: {
      ref: null as unknown as StorageReference,
      bytesTransferred: 100,
      totalBytes: 100,
      state: 'success' as const,
      metadata: {
        bucket: 'test-bucket',
        fullPath: path,
        generation: '1',
        metageneration: '1',
        name: path.split('/').pop() || '',
        size: 100,
        timeCreated: new Date().toISOString(),
        updated: new Date().toISOString(),
        md5Hash: 'test-hash',
        contentType: 'video/mp4',
        downloadTokens: ['mock-token']
      } as FullMetadata,
      task: null as unknown as UploadTask
    },
    on: (event: string,
      nextOrObserver?: null | StorageObserver<UploadTaskSnapshot> | ((snapshot: UploadTaskSnapshot) => unknown),
      error?: ((a: StorageError) => unknown) | null,
      complete?: (() => unknown) | null): Unsubscribe => {
      if (typeof nextOrObserver === 'function') {
        setTimeout(() => {
          nextOrObserver(task.snapshot);
          if (complete) complete();
        }, 0);
      }
      return () => {};
    },
    pause: () => true,
    resume: () => true,
    cancel: () => true,
    then: (onfulfilled?: ((value: UploadTaskSnapshot) => any) | null, onrejected?: ((reason: any) => any) | null) => {
      return Promise.resolve(task.snapshot).then(onfulfilled, onrejected);
    },
    catch: (onrejected?: ((reason: any) => any) | null) => {
      return Promise.resolve(task.snapshot).catch(onrejected);
    }
  } as UploadTask;

  const mockStorageRef: StorageReference = {
    bucket: 'test-bucket',
    fullPath: path,
    name: path.split('/').pop() || '',
    parent: null,
    root: null as unknown as StorageReference,
    storage: mockStorage,
    toString: () => `gs://test-bucket/${path}`,
    delete: () => Promise.resolve(),
    getDownloadURL: () => Promise.resolve('https://example.com/mocked-url'),
    getMetadata: () => Promise.resolve({
      bucket: 'test-bucket',
      fullPath: path,
      generation: '1',
      metageneration: '1',
      name: path.split('/').pop() || '',
      size: 1024,
      timeCreated: new Date().toISOString(),
      updated: new Date().toISOString(),
      md5Hash: 'test-hash',
      contentType: 'video/mp4',
      downloadTokens: ['mock-token']
    } as FullMetadata),
    list: () => Promise.resolve({ items: [], prefixes: [] }),
    listAll: () => Promise.resolve({ items: [], prefixes: [] }),
    put: (data: Blob | Uint8Array | ArrayBuffer) => Promise.resolve({ ref: mockStorageRef, metadata: task.snapshot.metadata }),
    putString: () => Promise.resolve({ ref: mockStorageRef, metadata: task.snapshot.metadata }),
    updateMetadata: () => Promise.resolve(task.snapshot.metadata)
  };

  task.snapshot.ref = mockStorageRef;
  task.snapshot.task = task;

  return task;
};

// Create the FFmpeg mock with proper return types
const mockFFmpeg = {
  load: jest.fn().mockImplementation(async () => true),
  writeFile: jest.fn().mockImplementation(async () => undefined),
  readFile: jest.fn().mockImplementation(async () => new Uint8Array(0)),
  exec: jest.fn().mockImplementation(async () => 0),
  on: jest.fn(),
  log: jest.fn(),
  terminate: jest.fn()
} as unknown as FFmpeg;

jest.mock('@ffmpeg/ffmpeg', () => ({
  createFFmpeg: jest.fn().mockImplementation(() => mockFFmpeg)
}));

// Mock the storage module with proper type annotations
const storageFunctions = {
  getStorage: jest.fn().mockReturnValue(mockStorage),
  ref: jest.fn().mockImplementation((...args: unknown[]) => {
    const path = typeof args[1] === 'string' ? args[1] : args[0];
    const uploadTask = createMockUploadTask(typeof path === 'string' ? path : '');
    return uploadTask.snapshot.ref;
  }),
  uploadBytes: jest.fn().mockImplementation(
    (ref: any, data: any) => Promise.resolve({
      ref,
      metadata: {
        bucket: 'test-bucket',
        fullPath: ref.fullPath,
        generation: '1',
        metageneration: '1',
        name: ref.name,
        size: 1024,
        timeCreated: new Date().toISOString(),
        updated: new Date().toISOString(),
        md5Hash: 'test-hash',
        contentType: 'video/mp4',
        downloadTokens: ['mock-token']
      } as FullMetadata
    })
  ),
  uploadBytesResumable: jest.fn().mockImplementation(
    (ref: any, data: any) => createMockUploadTask(ref.fullPath)
  ),
  getDownloadURL: jest.fn().mockImplementation(
    (ref: any) => Promise.resolve('https://example.com/mocked-url')
  )
};

jest.mock('firebase/storage', () => storageFunctions);

// Re-export the mocked functions for use in tests
export const storage = storageFunctions;

// --- Test Suite ---
describe('Media Processing Utilities', () => {
  let mockFile: File;
  let progressCallback: (progress: number, stage: string) => void;

  beforeEach(() => {
    mockFile = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    progressCallback = jest.fn();
    jest.clearAllMocks();
  });

  describe('Firebase Storage Paths', () => {
    it('should use correct path for audio files', async () => {
      await processMediaFile(
        mockFile,
        'test-sermon-id',
        'audio',
        { transcodeAudio: true },
        progressCallback
      );

      expect(storage.ref).toHaveBeenCalledWith(expect.anything(), 'sermons/audio/test-sermon-id.mp3');
    });

    it('should use correct path for video files', async () => {
      await processMediaFile(
        mockFile,
        'test-sermon-id',
        'video',
        { transcodeVideo: true },
        progressCallback
      );

      expect(storage.ref).toHaveBeenCalledWith(expect.anything(), 'sermons/video/test-sermon-id.mp4');
    });

    it('should use correct path for thumbnails', async () => {
      await processMediaFile(
        mockFile,
        'test-sermon-id',
        'video',
        { transcodeVideo: true, generateThumbnail: true },
        progressCallback
      );

      expect(storage.ref).toHaveBeenCalledWith(expect.anything(), 'sermons/thumbnails/test-sermon-id.jpg');
    });
  });

  describe('HLS Video Processing', () => {
    it('should create HLS streaming files with correct path', async () => {
      await processMediaFile(
        mockFile,
        'test-sermon-id',
        'video',
        { transcodeVideo: true },
        progressCallback
      );

      expect(storage.ref).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/sermons\/video\/test-sermon-id/)
      );
    });
  });

  describe('FFmpeg Operations', () => {
    it('should report progress during transcoding', async () => {
      const progressCallback = jest.fn();

      await processMediaFile(
        mockFile,
        'test-sermon-id',
        'video',
        { transcodeVideo: true },
        progressCallback
      );

      // Check if progressCallback was called with the expected values
      expect(progressCallback).toHaveBeenCalledWith(50); // ratio: 0.5 = 50%
      expect(progressCallback).toHaveBeenCalledWith(100); // ratio: 1.0 = 100%
    });

    it('should create HLS files for all quality levels', async () => {
      await processMediaFile(
        mockFile,
        'test-sermon-id',
        'video',
        { transcodeVideo: true },
        progressCallback
      );

      expect(storage.ref).toHaveBeenCalledWith(
        expect.anything(), 
        expect.stringMatching(/sermons\/video\/test-sermon-id\/playlist_240p.m3u8/)
      );
      expect(storage.ref).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/sermons\/video\/test-sermon-id\/playlist_360p.m3u8/)
      );
      expect(storage.ref).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/sermons\/video\/test-sermon-id\/playlist_480p.m3u8/)
      );
    });
  });

  describe('FFmpeg Command Arguments', () => {
    beforeEach(() => {
      (mockFFmpeg.exec as jest.Mock).mockClear();
    });

    it('should use correct FFmpeg arguments for video transcoding', async () => {
      await processMediaFile(
        mockFile,
        'test-sermon-id',
        'video',
        { transcodeVideo: true },
        progressCallback
      );

      // Check that the correct FFmpeg commands were executed
      expect(mockFFmpeg.exec).toHaveBeenCalledWith(expect.arrayContaining([
        '-i', 'input.mp4',
        '-c:v', 'libx264',
        '-c:a', 'aac'
      ]));
    });

    it('should use correct FFmpeg arguments for audio transcoding', async () => {
      const audioFile = new File(['test'], 'test.wav', { type: 'audio/wav' });
      
      await processMediaFile(
        audioFile,
        'test-sermon-id',
        'audio',
        { transcodeAudio: true },
        progressCallback
      );

      expect(mockFFmpeg.exec).toHaveBeenCalledWith(expect.arrayContaining([
        '-i', 'input.wav',
        '-c:a', 'libmp3lame',
        '-q:a', '2'
      ]));
    });

    it('should use correct FFmpeg arguments for thumbnail generation', async () => {
      await processMediaFile(
        mockFile,
        'test-sermon-id',
        'video',
        { transcodeVideo: true, generateThumbnail: true },
        progressCallback
      );

      expect(mockFFmpeg.exec).toHaveBeenCalledWith(expect.arrayContaining([
        '-i', 'input.mp4',
        '-vf', 'thumbnail,scale=-1:720',
        '-vframes', '1'
      ]));
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle FFmpeg load failures', async () => {
      const mockError = new Error('FFmpeg load failed');
      (mockFFmpeg.load as jest.MockedFunction<typeof mockFFmpeg.load>).mockImplementationOnce(
        () => Promise.reject(mockError)
      );

      await expect(processMediaFile(
        mockFile,
        'test-sermon-id',
        'video',
        { transcodeVideo: true },
        progressCallback
      )).rejects.toThrow('FFmpeg load failed');
    });

    it('should handle FFmpeg execution failures', async () => {
      const mockError = new Error('FFmpeg execution failed');
      (mockFFmpeg.exec as jest.MockedFunction<typeof mockFFmpeg.exec>).mockRejectedValueOnce(mockError);

      await expect(processMediaFile(
        mockFile,
        'test-sermon-id',
        'video',
        { transcodeVideo: true },
        progressCallback
      )).rejects.toThrow('FFmpeg execution failed');
    });

    it('should handle upload failures', async () => {
      const mockError = new Error('Upload failed');
      const mockUploadTask: UploadTask = {
        on: (event: string, progressCb?: ((snapshot: UploadTaskSnapshot) => void) | null, 
            errorCb?: ((error: Error) => void) | null,
            completeCb?: (() => void) | null) => {
          if (event === 'state_changed' && errorCb) {
            setTimeout(() => errorCb(mockError), 0);
          }
          return () => {};
        },
        snapshot: { ref: { path: 'test-path' }, state: 'error' },
        pause: () => Promise.resolve(),
        resume: () => Promise.resolve(),
        cancel: () => Promise.resolve(),
        catch: () => Promise.resolve(),
        then: () => Promise.resolve(undefined)
      } as UploadTask;

      (storage.uploadBytesResumable as jest.MockedFunction<typeof storage.uploadBytesResumable>)
        .mockReturnValueOnce(mockUploadTask);

      await expect(processMediaFile(
        mockFile,
        'test-sermon-id',
        'video',
        { transcodeVideo: true },
        progressCallback
      )).rejects.toThrow('Upload failed');
    });

    it('should handle invalid file types', async () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      await expect(processMediaFile(
        invalidFile,
        'test-sermon-id',
        'video',
        { transcodeVideo: true },
        progressCallback
      )).rejects.toThrow('Invalid file type');
    });
  });
});
