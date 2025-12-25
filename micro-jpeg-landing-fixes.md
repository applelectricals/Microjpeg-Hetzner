// ============================================================================
// MICRO-JPEG-LANDING.TSX - FIXES FOR NEW FREE TIER LIMITS
// ============================================================================
//
// Update file size limits from 7MB/15MB to 5MB/10MB
//
// ============================================================================

// CHANGE 1: Update comments (lines 76-77)
// ============================================================================
// FIND:
// - 7MB for Regular files (JPG, PNG, WEBP, AVIF, SVG, TIFF)
// - 15MB for RAW files (ARW, CR2, CRW, DNG, NEF, ORF, RAF)

// REPLACE WITH:
// - 5MB for Regular files (JPG, PNG, WEBP, AVIF, SVG, TIFF)
// - 10MB for RAW files (ARW, CR2, CRW, DNG, NEF, ORF, RAF)


// CHANGE 2: Update constants (lines 81-82)
// ============================================================================
// FIND:
const MAX_FILE_SIZE = 7 * 1024 * 1024; // 7MB for regular formats
const MAX_RAW_FILE_SIZE = 15 * 1024 * 1024; // 15MB for RAW formats

// REPLACE WITH:
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for regular formats
const MAX_RAW_FILE_SIZE = 10 * 1024 * 1024; // 10MB for RAW formats


// CHANGE 3: Update FREE_MONTHLY_LIMIT (line 83)
// ============================================================================
// FIND:
const FREE_MONTHLY_LIMIT = 200; // 100 regular + 100 RAW

// REPLACE WITH:
const FREE_MONTHLY_LIMIT = 30; // New 2-tier limit


// CHANGE 4: Update FAQ answer (line 149)
// ============================================================================
// FIND:
answer: "Yes! Our free plan includes 200 operations per month (compressions + conversions), 7MB limit for regular files (JPG, PNG, WEBP, AVIF, SVG, TIFF), 15MB limit for RAW files (ARW, CR2, CRW, DNG, NEF, ORF, RAF), web interface access, and community support. Perfect for trying our service or small personal projects."

// REPLACE WITH:
answer: "Yes! Our free plan includes 30 operations per month, 5MB limit for regular files (JPG, PNG, WEBP, AVIF, SVG, TIFF), 10MB limit for RAW files (ARW, CR2, CRW, DNG, NEF, ORF, RAF), web interface access, and community support. Perfect for trying our service or small personal projects."


// CHANGE 5: Update validateFile size label (line 410)
// ============================================================================
// FIND:
const sizeLabel = isRawFormat ? "15MB" : "7MB";

// REPLACE WITH:
const sizeLabel = isRawFormat ? "10MB" : "5MB";


// CHANGE 6: Update drag-drop box text (line 1528)
// ============================================================================
// FIND:
Each image up to 15MB for RAW & 7MB for Regular

// REPLACE WITH:
Each image up to 10MB for RAW & 5MB for Regular


// ============================================================================
// COMPLETE STR_REPLACE COMMANDS FOR EASY COPY-PASTE
// ============================================================================

// For line 81-84, use this replacement:
/*
OLD:
const MAX_FILE_SIZE = 7 * 1024 * 1024; // 7MB for regular formats
const MAX_RAW_FILE_SIZE = 15 * 1024 * 1024; // 15MB for RAW formats
const FREE_MONTHLY_LIMIT = 200; // 100 regular + 100 RAW

NEW:
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for regular formats
const MAX_RAW_FILE_SIZE = 10 * 1024 * 1024; // 10MB for RAW formats
const FREE_MONTHLY_LIMIT = 30; // New 2-tier limit
*/

// For line 410:
/*
OLD:
const sizeLabel = isRawFormat ? "15MB" : "7MB";

NEW:
const sizeLabel = isRawFormat ? "10MB" : "5MB";
*/

// For line 1528:
/*
OLD:
Each image up to 15MB for RAW & 7MB for Regular

NEW:
Each image up to 10MB for RAW & 5MB for Regular
*/
