export interface FileValidationOptions {
  maxSizeInMB?: number;
  allowedTypes?: string[];
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateFile(file: File, options: FileValidationOptions = {}): FileValidationResult {
  const {
    maxSizeInMB = 500, // Default max size is 500MB
    allowedTypes = [] // Empty array means all types allowed
  } = options;

  // Check file size
  const fileSizeInMB = file.size / (1024 * 1024);
  if (fileSizeInMB > maxSizeInMB) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeInMB}MB. Current size: ${fileSizeInMB.toFixed(2)}MB`
    };
  }

  // Check file type if restrictions are provided
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  return { isValid: true };
}

export const VIDEO_FILE_CONFIG: FileValidationOptions = {
  maxSizeInMB: 1000, // 1GB
  allowedTypes: [
    'video/mp4',
    'video/webm',
    'video/ogg'
  ]
};

export const AUDIO_FILE_CONFIG: FileValidationOptions = {
  maxSizeInMB: 100, // 100MB
  allowedTypes: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/m4a'
  ]
};

export const IMAGE_FILE_CONFIG: FileValidationOptions = {
  maxSizeInMB: 5, // 5MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
};
