// jest.setup.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock FFmpeg for the entire test suite
const mockFFmpeg = {
  load: jest.fn().mockResolvedValue(true),
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue(new Uint8Array(0)),
  exec: jest.fn().mockResolvedValue(0),
  on: jest.fn(),
  log: jest.fn(),
  terminate: jest.fn(),
  listDir: jest.fn().mockResolvedValue([])
};

// Mock @ffmpeg/ffmpeg module
jest.mock('@ffmpeg/ffmpeg', () => ({
  createFFmpeg: jest.fn().mockReturnValue(mockFFmpeg),
  FFmpeg: jest.fn().mockImplementation(() => mockFFmpeg)
}));

// Mock @ffmpeg/util module
jest.mock('@ffmpeg/util', () => ({
  fetchFile: jest.fn().mockResolvedValue(new Uint8Array(0)),
  toBlobURL: jest.fn().mockResolvedValue('mock-blob-url')
}));

// Set global variable for tests
global.ffmpegMock = mockFFmpeg;

// Set a mock window object for browser APIs
if (typeof window !== 'undefined') {
  // Only try to mock if we're in a jsdom environment
  try {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'http://localhost:3000' }
    });
  } catch (e) {
    console.log('Could not redefine window.location');
  }
}

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn()
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  uploadBytesResumable: jest.fn(),
  getDownloadURL: jest.fn()
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn()
}));

// Mock the next/router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));
