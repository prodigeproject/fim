
# Rencana Implementasi Komprehensif

## Ringkasan

Implementasi semua fitur dari rencana pengembangan, mencakup:
1. Fitur Portal Pendaftaran (Progress Tracker, Countdown, Push Notifications)
2. Audit & Perbaikan RLS Policies
3. Sistem Notifikasi Terpusat
4. Optimasi Performance Frontend
5. Sistem Cron Jobs Terpusat
6. File Storage Optimization
7. Centralized Error Handling & Logging
8. Data Backup & Recovery
9. Caching System

---

## Fase 1: Audit & Perbaikan RLS Policies

### 1.1 Perbaikan yang Diimplementasikan

| Tabel | Perbaikan |
|-------|-----------|
| `newsletter_subscription_attempts` | Tambah policy untuk rate limiting |
| `newsletter_subscribers` | Batasi INSERT dengan validasi |
| Indeks baru | Tambah index untuk query optimization |

### 1.2 Migrasi Database

```sql
-- Tambah index untuk optimasi query
CREATE INDEX IF NOT EXISTS idx_fim_registrations_batch_stage 
ON fim_registrations(batch_id, selection_stage) 
WHERE registration_status != 'draft';

CREATE INDEX IF NOT EXISTS idx_fim_registrations_email 
ON fim_registrations(email);

CREATE INDEX IF NOT EXISTS idx_articles_status_published 
ON articles(status, published_at DESC) 
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_interview_schedules_date 
ON interview_schedules(scheduled_date, scheduled_time);
```

---

## Fase 2: Fitur Portal Pendaftaran

### 2.1 Progress Tracker yang Engaging

**File baru**: `src/components/registration/ProgressTracker.tsx`

Fitur:
- Animasi step-by-step dengan Framer Motion
- Pulse animation untuk tahap aktif
- Gradient progress bar
- Responsive untuk mobile

### 2.2 Countdown Timer

**File baru**: `src/components/registration/CountdownTimer.tsx`

Fitur:
- Flip clock style dengan animasi
- Real-time countdown (detik, menit, jam, hari)
- Visual warning saat < 24 jam
- Integrasi dengan registration_settings

### 2.3 Push Notifications untuk Status Updates

**File baru**: `src/hooks/usePortalNotifications.ts`

Fitur:
- Subscribe ke perubahan status registrasi via Supabase Realtime
- Browser push notifications
- In-app toast notifications
- Notifikasi untuk: jadwal wawancara, perubahan tahap seleksi, hasil final

---

## Fase 3: Sistem Notifikasi Terpusat

### 3.1 Database Schema

**Tabel baru**: `notification_queue`

```sql
CREATE TABLE notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL, -- 'email', 'push', 'in_app'
  template_name TEXT NOT NULL,
  recipient_id UUID,
  recipient_email TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'pending', -- pending, processing, sent, failed
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query efficiency
CREATE INDEX idx_notification_queue_status ON notification_queue(status, scheduled_at);
```

### 3.2 Edge Function Terpusat

**File baru**: `supabase/functions/process-notifications/index.ts`

Menggabungkan logika dari 9 edge functions:
- notify-article-status
- notify-first-login
- notify-interview-completed
- notify-login
- notify-new-registration
- notify-registration-status
- notify-revision
- notify-selection-stage
- notify-unauthorized-access

### 3.3 Helper Function

**File baru**: `supabase/functions/_shared/notification-service.ts`

```typescript
// Centralized email sending with Gmail SMTP
export async function sendNotification(params: NotificationParams) {
  // Template rendering
  // Email sending via Gmail
  // Retry logic
  // Error handling
}
```

---

## Fase 4: Optimasi Performance Frontend

### 4.1 Vite Bundle Splitting

**Update**: `vite.config.ts`

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', 
                      '@radix-ui/react-select', '@radix-ui/react-tabs'],
        'vendor-charts': ['recharts'],
        'vendor-editor': ['@tiptap/react', '@tiptap/starter-kit'],
        'vendor-motion': ['framer-motion'],
      }
    }
  }
}
```

### 4.2 Image Optimization Component

**File baru**: `src/components/OptimizedImage.tsx`

Fitur:
- Lazy loading dengan Intersection Observer
- Blur placeholder
- WebP conversion via Supabase Image Transformation
- Responsive srcset

### 4.3 Image Compression Before Upload

**Update**: `src/components/admin/ImageUploader.tsx`

Tambah dependency: `browser-image-compression`

```typescript
import imageCompression from 'browser-image-compression';

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  return await imageCompression(file, options);
};
```

---

## Fase 5: Sistem Cron Jobs Terpusat

### 5.1 Database Schema

**Tabel baru**: `cron_jobs`

```sql
CREATE TABLE cron_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  schedule TEXT NOT NULL,
  function_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  last_status TEXT,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default jobs
INSERT INTO cron_jobs (name, schedule, function_name) VALUES
  ('cleanup-expired-sessions', '0 */6 * * *', 'cleanup-sessions'),
  ('reminder-incomplete-registration', '0 9 * * *', 'send-reminder-incomplete'),
  ('publish-scheduled-articles', '*/5 * * * *', 'publish-scheduled'),
  ('process-notification-queue', '* * * * *', 'process-notifications'),
  ('cleanup-orphaned-files', '0 3 * * 0', 'cleanup-files');
```

### 5.2 Master Cron Edge Function

**File baru**: `supabase/functions/cron-master/index.ts`

Menjalankan job berdasarkan schedule dari tabel cron_jobs.

---

## Fase 6: File Storage Optimization

### 6.1 Auto-Cleanup Orphaned Files

**File baru**: `supabase/functions/cleanup-orphaned-files/index.ts`

Logic:
1. List semua file di storage buckets
2. Query database untuk file yang masih direferensikan
3. Hapus file yang tidak ada referensinya
4. Log hasil ke audit_logs

### 6.2 Thumbnail Generation

Memanfaatkan Supabase Image Transformation yang sudah tersedia:

```typescript
const thumbnailUrl = supabase.storage
  .from(bucket)
  .getPublicUrl(path, {
    transform: { width: 300, height: 200, resize: 'cover' }
  });
```

---

## Fase 7: Centralized Error Handling & Logging

### 7.1 Error Codes & Types

**File baru**: `src/lib/errors.ts`

```typescript
export const ErrorCodes = {
  // Authentication (1xxx)
  AUTH_INVALID_CREDENTIALS: 'E1001',
  AUTH_UNVERIFIED_EMAIL: 'E1002',
  AUTH_BLOCKED_ACCOUNT: 'E1003',
  AUTH_SESSION_EXPIRED: 'E1004',
  
  // Database (2xxx)
  DB_CONNECTION_ERROR: 'E2001',
  DB_QUERY_ERROR: 'E2002',
  DB_RLS_VIOLATION: 'E2003',
  
  // Validation (3xxx)
  VALIDATION_REQUIRED_FIELD: 'E3001',
  VALIDATION_INVALID_FORMAT: 'E3002',
  VALIDATION_FILE_TOO_LARGE: 'E3003',
  
  // External (4xxx)
  EXTERNAL_API_ERROR: 'E4001',
  EXTERNAL_TIMEOUT: 'E4002',
  EXTERNAL_RATE_LIMITED: 'E4003',
} as const;

export interface AppError {
  code: keyof typeof ErrorCodes;
  category: 'user' | 'system' | 'external';
  message: string;
  technicalDetails?: string;
  recoverable: boolean;
  suggestedAction?: string;
}
```

### 7.2 Error Logging Table

```sql
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_code TEXT NOT NULL,
  category TEXT NOT NULL,
  message TEXT,
  stack_trace TEXT,
  user_id UUID,
  context JSONB,
  severity TEXT DEFAULT 'error',
  url TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying
CREATE INDEX idx_error_logs_created ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_code ON error_logs(error_code);
```

### 7.3 Error Boundary Component

**File baru**: `src/components/ErrorBoundary.tsx`

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logErrorToServer({
      error,
      errorInfo,
      userId: getCurrentUserId(),
      route: window.location.pathname
    });
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}
```

### 7.4 Error Logging Edge Function

**File baru**: `supabase/functions/log-error/index.ts`

---

## Fase 8: Data Backup & Recovery

### 8.1 Data Export Functionality

**File baru**: `src/components/admin/DataExporter.tsx`

Fitur:
- Export ke JSON, CSV, Excel
- Filter berdasarkan tanggal
- Download individual tables atau semua data
- Menggunakan exceljs yang sudah terinstall

### 8.2 Backup Edge Function

**File baru**: `supabase/functions/backup-data/index.ts`

Fitur:
- Export tabel-tabel penting ke JSON
- Compress dengan gzip
- Upload ke Google Drive (memerlukan GOOGLE_SERVICE_ACCOUNT_KEY)
- Rotasi backup (hapus > 30 hari)

**Catatan**: Google Drive backup memerlukan secret `GOOGLE_SERVICE_ACCOUNT_KEY` yang perlu ditambahkan.

---

## Fase 9: Caching System

### 9.1 Edge Function Cache Layer

**File baru**: `supabase/functions/_shared/cache.ts`

```typescript
const CACHE = new Map<string, { data: any; expiresAt: number }>();

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const cached = CACHE.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  
  const data = await fetcher();
  CACHE.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
  return data;
}

export function invalidateCache(keyPattern?: string) {
  if (!keyPattern) {
    CACHE.clear();
    return;
  }
  for (const key of CACHE.keys()) {
    if (key.includes(keyPattern)) {
      CACHE.delete(key);
    }
  }
}
```

### 9.2 Materialized View untuk Dashboard Stats

```sql
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM fim_registrations WHERE registration_status = 'pending') as pending_registrations,
  (SELECT COUNT(*) FROM fim_registrations WHERE selection_stage = 'wawancara') as interview_stage,
  (SELECT COUNT(*) FROM articles WHERE status = 'published') as published_articles,
  (SELECT COUNT(*) FROM articles WHERE needs_approval = true AND status = 'draft') as pending_approvals,
  (SELECT COUNT(*) FROM newsletter_subscribers WHERE is_active = true) as active_subscribers,
  NOW() as last_refreshed;

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW dashboard_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Daftar File yang Akan Dibuat/Dimodifikasi

### File Baru (20 files)

| Path | Deskripsi |
|------|-----------|
| `src/components/registration/ProgressTracker.tsx` | Progress tracker dengan animasi |
| `src/components/registration/CountdownTimer.tsx` | Countdown timer flip clock |
| `src/hooks/usePortalNotifications.ts` | Push notifications untuk portal |
| `src/components/OptimizedImage.tsx` | Image optimization component |
| `src/lib/errors.ts` | Error codes & types |
| `src/components/ErrorBoundary.tsx` | React Error Boundary |
| `src/components/admin/DataExporter.tsx` | Data export functionality |
| `supabase/functions/process-notifications/index.ts` | Centralized notification processor |
| `supabase/functions/_shared/notification-service.ts` | Notification helper |
| `supabase/functions/_shared/cache.ts` | Caching layer |
| `supabase/functions/cron-master/index.ts` | Master cron handler |
| `supabase/functions/cleanup-orphaned-files/index.ts` | Storage cleanup |
| `supabase/functions/log-error/index.ts` | Error logging |
| `supabase/functions/backup-data/index.ts` | Data backup |

### File yang Dimodifikasi (7 files)

| Path | Perubahan |
|------|-----------|
| `vite.config.ts` | Bundle splitting configuration |
| `src/components/admin/ImageUploader.tsx` | Image compression |
| `src/pages/registration/RegistrationDashboard.tsx` | Integrate ProgressTracker |
| `src/pages/registration/RegistrationLanding.tsx` | Integrate CountdownTimer |
| `src/App.tsx` | Add ErrorBoundary |
| `supabase/config.toml` | Add new edge function configs |

### Migrasi Database

1 migration file dengan:
- Tabel: `notification_queue`, `cron_jobs`, `error_logs`
- Indexes untuk optimization
- Materialized view: `dashboard_stats`
- RLS policies untuk tabel baru

---

## Dependencies Baru

```json
{
  "browser-image-compression": "^2.0.2"
}
```

---

## Secrets yang Diperlukan

| Secret | Status | Untuk |
|--------|--------|-------|
| `GMAIL_USER` | ✅ Ada | Email sending |
| `GMAIL_APP_PASSWORD` | ✅ Ada | Email sending |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | ❌ Perlu ditambah | GDrive backup (opsional) |

---

## Catatan Implementasi

1. **RLS Policies**: Tidak mengubah pembatasan field UPDATE pada fim_registrations sesuai permintaan

2. **Backward Compatibility**: Edge functions lama tetap berfungsi, sistem notifikasi baru berjalan paralel

3. **Gradual Migration**: Notifikasi baru akan menggunakan queue, edge functions lama bisa di-deprecate secara bertahap

4. **Performance**: Bundle splitting akan mengurangi initial load time secara signifikan

5. **Google Drive Backup**: Bersifat opsional, memerlukan setup Google Cloud Service Account
