// firebase.ts mock
export const mockFirebaseApp = {
  name: '[DEFAULT]',
  options: {
    apiKey: 'test-api-key',
    authDomain: 'test-auth-domain',
    projectId: 'test-project-id',
    storageBucket: 'test-storage-bucket'
  }
};

export const mockFirebaseAuth = {
  currentUser: { uid: 'test-user-id' }
};

export const mockStorageRef = { path: 'test-path' };

export const mockUploadTask = {
  on: jest.fn((event: string, progressCb?: any, errorCb?: any, completeCb?: any) => {
    setTimeout(() => {
      progressCb?.({ bytesTransferred: 100, totalBytes: 100 });
      completeCb?.();
    }, 0);
    return () => {};
  }),
  snapshot: { ref: mockStorageRef, state: 'success' }
};

export const mockStorage = {
  ref: jest.fn().mockReturnValue(mockStorageRef),
  uploadBytes: jest.fn().mockResolvedValue({ ref: mockStorageRef }),
  uploadBytesResumable: jest.fn().mockReturnValue(mockUploadTask),
  getDownloadURL: jest.fn().mockResolvedValue('https://example.com/test.mp4')
};
