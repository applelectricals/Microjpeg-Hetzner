// Removed UniversalUsageTracker - using DualCounter only

const FREE_USER_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for free users
const PREPAID_USER_MAX_FILE_SIZE = 75 * 1024 * 1024; // 75MB for prepaid users

// Add all possible TIFF MIME types
const ALLOWED_TYPES = [
  'image/jpeg', 
  'image/jpg', 
  'image/png', 
  'image/webp', 
  'image/avif', 
  'image/tiff',
  'image/tif',
  'image/x-tiff',
  'image/x-tif',
  '' // Empty MIME type (common for TIFF)
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff', '.tif'];

export function validateFiles(files: FileList | File[]): File[] {
  const validFiles: File[] = [];
  
  for (const file of files) {
    // Get file extension
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    // OPTION 1: Skip MIME check entirely for TIFF files
    if (extension === '.tiff' || extension === '.tif') {
      validFiles.push(file);
      continue;
    }
    
    // Check file type for other formats
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.warn(`File ${file.name} is not a supported image format (JPEG, PNG, WebP, AVIF, TIFF). Got MIME: ${file.type}`);
      continue;
    }
    
    // Check file extension
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      console.warn(`File ${file.name} does not have a valid image extension (.jpg, .jpeg, .png, .webp, .avif, .tiff, .tif)`);
      continue;
    }
    
    validFiles.push(file);
  }
  
  return validFiles;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.toLowerCase().substring(filename.lastIndexOf('.'));
}

export async function isValidImageFile(file: File): Promise<boolean> {
  // Check file type and size only (usage limits handled server-side)
  return ALLOWED_TYPES.includes(file.type) && file.size > 0;
}

// Legacy alias for backwards compatibility
export async function isValidJpegFile(file: File): Promise<boolean> {
  return await isValidImageFile(file);
}

// Backward compatibility with old isPremium parameter
export async function validateFilesLegacy(files: File[], isPremium: boolean = false): Promise<File[]> {
  return await validateFiles(files);
}

export async function isValidImageFileLegacy(file: File, isPremium: boolean = false): Promise<boolean> {
  return await isValidImageFile(file);
}
