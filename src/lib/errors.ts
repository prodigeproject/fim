// =====================================================
// CENTRALIZED ERROR CODES & TYPES
// =====================================================

export const ErrorCodes = {
  // Authentication (1xxx)
  AUTH_INVALID_CREDENTIALS: "E1001",
  AUTH_UNVERIFIED_EMAIL: "E1002",
  AUTH_BLOCKED_ACCOUNT: "E1003",
  AUTH_SESSION_EXPIRED: "E1004",
  AUTH_UNAUTHORIZED: "E1005",
  AUTH_RATE_LIMITED: "E1006",
  AUTH_TOKEN_INVALID: "E1007",
  AUTH_PASSWORD_WEAK: "E1008",
  
  // Database (2xxx)
  DB_CONNECTION_ERROR: "E2001",
  DB_QUERY_ERROR: "E2002",
  DB_RLS_VIOLATION: "E2003",
  DB_DUPLICATE_KEY: "E2004",
  DB_NOT_FOUND: "E2005",
  DB_CONSTRAINT_VIOLATION: "E2006",
  
  // Validation (3xxx)
  VALIDATION_REQUIRED_FIELD: "E3001",
  VALIDATION_INVALID_FORMAT: "E3002",
  VALIDATION_FILE_TOO_LARGE: "E3003",
  VALIDATION_INVALID_FILE_TYPE: "E3004",
  VALIDATION_MAX_LENGTH: "E3005",
  VALIDATION_MIN_LENGTH: "E3006",
  VALIDATION_INVALID_EMAIL: "E3007",
  VALIDATION_INVALID_PHONE: "E3008",
  
  // External Services (4xxx)
  EXTERNAL_API_ERROR: "E4001",
  EXTERNAL_TIMEOUT: "E4002",
  EXTERNAL_RATE_LIMITED: "E4003",
  EXTERNAL_SERVICE_UNAVAILABLE: "E4004",
  EXTERNAL_INVALID_RESPONSE: "E4005",
  
  // Business Logic (5xxx)
  BUSINESS_REGISTRATION_CLOSED: "E5001",
  BUSINESS_QUOTA_EXCEEDED: "E5002",
  BUSINESS_DEADLINE_PASSED: "E5003",
  BUSINESS_ALREADY_SUBMITTED: "E5004",
  BUSINESS_INVALID_STATE: "E5005",
  BUSINESS_PERMISSION_DENIED: "E5006",
  
  // System (9xxx)
  SYSTEM_UNKNOWN: "E9001",
  SYSTEM_NETWORK_ERROR: "E9002",
  SYSTEM_STORAGE_ERROR: "E9003",
  SYSTEM_MAINTENANCE: "E9004",
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export type ErrorCategory = "user" | "system" | "external";

export type ErrorSeverity = "info" | "warn" | "error" | "critical";

export interface AppError {
  code: ErrorCode;
  category: ErrorCategory;
  message: string;
  technicalDetails?: string;
  recoverable: boolean;
  suggestedAction?: string;
  context?: Record<string, unknown>;
}

// User-friendly error messages
const ERROR_MESSAGES: Record<ErrorCode, { message: string; action?: string }> = {
  [ErrorCodes.AUTH_INVALID_CREDENTIALS]: {
    message: "Email atau password tidak valid",
    action: "Periksa kembali email dan password Anda",
  },
  [ErrorCodes.AUTH_UNVERIFIED_EMAIL]: {
    message: "Email belum diverifikasi",
    action: "Silakan verifikasi email Anda terlebih dahulu",
  },
  [ErrorCodes.AUTH_BLOCKED_ACCOUNT]: {
    message: "Akun Anda diblokir",
    action: "Hubungi admin untuk informasi lebih lanjut",
  },
  [ErrorCodes.AUTH_SESSION_EXPIRED]: {
    message: "Sesi Anda telah berakhir",
    action: "Silakan login kembali",
  },
  [ErrorCodes.AUTH_UNAUTHORIZED]: {
    message: "Anda tidak memiliki akses ke halaman ini",
    action: "Silakan login dengan akun yang sesuai",
  },
  [ErrorCodes.AUTH_RATE_LIMITED]: {
    message: "Terlalu banyak percobaan",
    action: "Tunggu beberapa menit sebelum mencoba lagi",
  },
  [ErrorCodes.AUTH_TOKEN_INVALID]: {
    message: "Token tidak valid atau sudah kadaluarsa",
    action: "Silakan request ulang",
  },
  [ErrorCodes.AUTH_PASSWORD_WEAK]: {
    message: "Password terlalu lemah",
    action: "Gunakan kombinasi huruf, angka, dan simbol",
  },
  [ErrorCodes.DB_CONNECTION_ERROR]: {
    message: "Gagal terhubung ke server",
    action: "Periksa koneksi internet Anda",
  },
  [ErrorCodes.DB_QUERY_ERROR]: {
    message: "Terjadi kesalahan saat memproses data",
    action: "Coba refresh halaman",
  },
  [ErrorCodes.DB_RLS_VIOLATION]: {
    message: "Anda tidak memiliki akses ke data ini",
    action: "Hubungi admin jika Anda merasa ini adalah kesalahan",
  },
  [ErrorCodes.DB_DUPLICATE_KEY]: {
    message: "Data sudah ada",
    action: "Gunakan data yang berbeda",
  },
  [ErrorCodes.DB_NOT_FOUND]: {
    message: "Data tidak ditemukan",
    action: "Pastikan data yang dicari benar",
  },
  [ErrorCodes.DB_CONSTRAINT_VIOLATION]: {
    message: "Data tidak valid",
    action: "Periksa kembali data yang dimasukkan",
  },
  [ErrorCodes.VALIDATION_REQUIRED_FIELD]: {
    message: "Field ini wajib diisi",
    action: "Lengkapi semua field yang diperlukan",
  },
  [ErrorCodes.VALIDATION_INVALID_FORMAT]: {
    message: "Format tidak valid",
    action: "Periksa format yang benar",
  },
  [ErrorCodes.VALIDATION_FILE_TOO_LARGE]: {
    message: "Ukuran file terlalu besar",
    action: "Pilih file dengan ukuran lebih kecil",
  },
  [ErrorCodes.VALIDATION_INVALID_FILE_TYPE]: {
    message: "Tipe file tidak didukung",
    action: "Pilih file dengan format yang sesuai",
  },
  [ErrorCodes.VALIDATION_MAX_LENGTH]: {
    message: "Teks terlalu panjang",
    action: "Persingkat teks Anda",
  },
  [ErrorCodes.VALIDATION_MIN_LENGTH]: {
    message: "Teks terlalu pendek",
    action: "Tambahkan lebih banyak teks",
  },
  [ErrorCodes.VALIDATION_INVALID_EMAIL]: {
    message: "Format email tidak valid",
    action: "Masukkan email yang benar",
  },
  [ErrorCodes.VALIDATION_INVALID_PHONE]: {
    message: "Format nomor telepon tidak valid",
    action: "Masukkan nomor telepon yang benar",
  },
  [ErrorCodes.EXTERNAL_API_ERROR]: {
    message: "Terjadi kesalahan pada layanan eksternal",
    action: "Coba lagi nanti",
  },
  [ErrorCodes.EXTERNAL_TIMEOUT]: {
    message: "Waktu permintaan habis",
    action: "Coba lagi nanti",
  },
  [ErrorCodes.EXTERNAL_RATE_LIMITED]: {
    message: "Layanan sedang sibuk",
    action: "Tunggu beberapa menit",
  },
  [ErrorCodes.EXTERNAL_SERVICE_UNAVAILABLE]: {
    message: "Layanan tidak tersedia",
    action: "Coba lagi nanti",
  },
  [ErrorCodes.EXTERNAL_INVALID_RESPONSE]: {
    message: "Respons tidak valid dari layanan",
    action: "Hubungi support jika masalah berlanjut",
  },
  [ErrorCodes.BUSINESS_REGISTRATION_CLOSED]: {
    message: "Pendaftaran sudah ditutup",
    action: "Pantau pengumuman untuk batch berikutnya",
  },
  [ErrorCodes.BUSINESS_QUOTA_EXCEEDED]: {
    message: "Kuota pendaftaran sudah penuh",
    action: "Hubungi admin untuk informasi lebih lanjut",
  },
  [ErrorCodes.BUSINESS_DEADLINE_PASSED]: {
    message: "Batas waktu sudah lewat",
    action: "Perhatikan deadline untuk kegiatan berikutnya",
  },
  [ErrorCodes.BUSINESS_ALREADY_SUBMITTED]: {
    message: "Data sudah pernah dikirim",
    action: "Anda tidak dapat mengirim ulang",
  },
  [ErrorCodes.BUSINESS_INVALID_STATE]: {
    message: "Status tidak valid untuk aksi ini",
    action: "Refresh halaman dan coba lagi",
  },
  [ErrorCodes.BUSINESS_PERMISSION_DENIED]: {
    message: "Anda tidak memiliki izin untuk melakukan aksi ini",
    action: "Hubungi admin jika Anda memerlukan akses",
  },
  [ErrorCodes.SYSTEM_UNKNOWN]: {
    message: "Terjadi kesalahan yang tidak terduga",
    action: "Coba refresh halaman atau hubungi support",
  },
  [ErrorCodes.SYSTEM_NETWORK_ERROR]: {
    message: "Kesalahan jaringan",
    action: "Periksa koneksi internet Anda",
  },
  [ErrorCodes.SYSTEM_STORAGE_ERROR]: {
    message: "Gagal mengakses penyimpanan",
    action: "Coba lagi nanti",
  },
  [ErrorCodes.SYSTEM_MAINTENANCE]: {
    message: "Sistem sedang dalam pemeliharaan",
    action: "Coba lagi dalam beberapa menit",
  },
};

// Create AppError from error code
export function createAppError(
  code: ErrorCode,
  options?: {
    technicalDetails?: string;
    context?: Record<string, unknown>;
    overrideMessage?: string;
  }
): AppError {
  const errorInfo = ERROR_MESSAGES[code] || ERROR_MESSAGES[ErrorCodes.SYSTEM_UNKNOWN];
  
  const category = getErrorCategory(code);
  const recoverable = isRecoverable(code);
  
  return {
    code,
    category,
    message: options?.overrideMessage || errorInfo.message,
    technicalDetails: options?.technicalDetails,
    recoverable,
    suggestedAction: errorInfo.action,
    context: options?.context,
  };
}

// Determine error category from code prefix
function getErrorCategory(code: ErrorCode): ErrorCategory {
  if (code.startsWith("E1") || code.startsWith("E3") || code.startsWith("E5")) {
    return "user";
  }
  if (code.startsWith("E4")) {
    return "external";
  }
  return "system";
}

// Determine if error is recoverable
function isRecoverable(code: ErrorCode): boolean {
  const unrecoverableErrors: ErrorCode[] = [
    ErrorCodes.AUTH_BLOCKED_ACCOUNT,
    ErrorCodes.BUSINESS_ALREADY_SUBMITTED,
    ErrorCodes.DB_RLS_VIOLATION,
  ];
  return !unrecoverableErrors.includes(code);
}

// Parse Supabase/PostgreSQL errors to AppError
export function parseSupabaseError(error: { code?: string; message?: string }): AppError {
  const codeMap: Record<string, ErrorCode> = {
    "invalid_credentials": ErrorCodes.AUTH_INVALID_CREDENTIALS,
    "email_not_confirmed": ErrorCodes.AUTH_UNVERIFIED_EMAIL,
    "user_banned": ErrorCodes.AUTH_BLOCKED_ACCOUNT,
    "session_expired": ErrorCodes.AUTH_SESSION_EXPIRED,
    "PGRST301": ErrorCodes.DB_RLS_VIOLATION,
    "23505": ErrorCodes.DB_DUPLICATE_KEY,
    "23503": ErrorCodes.DB_CONSTRAINT_VIOLATION,
    "PGRST116": ErrorCodes.DB_NOT_FOUND,
    "42501": ErrorCodes.AUTH_UNAUTHORIZED,
    "over_request_rate_limit": ErrorCodes.AUTH_RATE_LIMITED,
  };

  const errorCode = error.code || "";
  const mappedCode = codeMap[errorCode] || ErrorCodes.SYSTEM_UNKNOWN;

  return createAppError(mappedCode, {
    technicalDetails: error.message,
  });
}

// Get severity from error code
export function getErrorSeverity(code: ErrorCode): ErrorSeverity {
  if (code.startsWith("E9") || code === ErrorCodes.DB_CONNECTION_ERROR) {
    return "critical";
  }
  if (code.startsWith("E2") || code.startsWith("E4")) {
    return "error";
  }
  if (code.startsWith("E3")) {
    return "warn";
  }
  return "error";
}
