// Mock FFmpeg
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

export const createFFmpeg = jest.fn().mockReturnValue(mockFFmpeg);

export class FFmpeg {
  constructor() {
    return mockFFmpeg;
  }
}

// Export the mock for direct access in tests
export const ffmpegMock = mockFFmpeg;
