-- Add approval workflow fields to articles
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS needs_approval boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approved_by uuid,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Create index for approval queries
CREATE INDEX IF NOT EXISTS idx_articles_needs_approval ON public.articles(needs_approval) WHERE needs_approval = true;

-- Update PRD changelog with real-time data from Dec 23, 2025
DELETE FROM public.prd_changelog;

INSERT INTO public.prd_changelog (version, title, description, release_date, changes, created_at) VALUES
('1.0.0', 'Initial Launch', 'Peluncuran pertama website Forum Indonesia Muda', '2025-12-23', 
 '[{"type": "added", "description": "Landing page dengan hero section dan informasi organisasi"},{"type": "added", "description": "Halaman Tentang FIM dengan sejarah dan visi misi"},{"type": "added", "description": "Halaman Program Unggulan dan Pelatihan"},{"type": "added", "description": "Halaman Cerita Alumni"},{"type": "added", "description": "Halaman Regional dan FIM Club"},{"type": "added", "description": "Halaman Blog dengan kategori artikel"},{"type": "added", "description": "Halaman FAQ"},{"type": "added", "description": "Formulir Newsletter dan Donasi"},{"type": "added", "description": "Multi-language support (ID/EN)"},{"type": "added", "description": "Dark mode support"},{"type": "added", "description": "SEO optimization"}]'::jsonb, 
 '2025-12-23'),
('1.1.0', 'Admin Panel Launch', 'Peluncuran panel administrasi untuk manajemen konten', '2025-12-24',
 '[{"type": "added", "description": "Admin login dengan autentikasi aman"},{"type": "added", "description": "Dashboard admin dengan statistik"},{"type": "added", "description": "Manajemen artikel dengan CRUD operations"},{"type": "added", "description": "TipTap rich text editor"},{"type": "added", "description": "Image uploader untuk artikel"},{"type": "added", "description": "Kategori artikel: Pengumuman, Prestasi, Kegiatan, Sosial, Opini, Tips"},{"type": "added", "description": "Role-based access: Super Admin dan Moderator"},{"type": "added", "description": "Audit logging untuk semua aktivitas admin"}]'::jsonb,
 '2025-12-24'),
('1.2.0', 'Newsletter Management', 'Fitur manajemen newsletter dan subscribers', '2025-12-26',
 '[{"type": "added", "description": "Manajemen subscriber newsletter"},{"type": "added", "description": "Bulk email broadcast"},{"type": "added", "description": "Scheduled broadcast feature"},{"type": "added", "description": "Email settings configuration"},{"type": "added", "description": "Subscriber import/export"},{"type": "security", "description": "Email validation dan sanitization"}]'::jsonb,
 '2025-12-26'),
('1.3.0', 'Regional & Club Management', 'Fitur manajemen FIM Regional dan Club', '2025-12-28',
 '[{"type": "added", "description": "CRUD FIM Regional dengan logo dan informasi"},{"type": "added", "description": "CRUD FIM Club dengan kategori dan aktivitas"},{"type": "added", "description": "Sorting dan filtering untuk Regional/Club"},{"type": "added", "description": "Status aktif/nonaktif untuk Regional/Club"},{"type": "improved", "description": "UI/UX halaman tentang Regional dan Club"}]'::jsonb,
 '2025-12-28'),
('1.4.0', 'User Management & Security', 'Fitur manajemen pengguna dan keamanan', '2025-12-30',
 '[{"type": "added", "description": "Manajemen pengguna admin"},{"type": "added", "description": "Create user dengan temporary password"},{"type": "added", "description": "Force password change on first login"},{"type": "added", "description": "Session management"},{"type": "added", "description": "Login rate limiting"},{"type": "added", "description": "Audit logs viewer"},{"type": "security", "description": "RLS policies untuk semua tabel"},{"type": "security", "description": "Auto logout setelah 30 menit idle"}]'::jsonb,
 '2025-12-30'),
('1.5.0', 'Analytics & PRD Documentation', 'Dashboard analytics dan dokumentasi PRD', '2026-01-02',
 '[{"type": "added", "description": "Analytics dashboard dengan statistik artikel"},{"type": "added", "description": "Grafik views per kategori"},{"type": "added", "description": "Top artikel dan trending topics"},{"type": "added", "description": "Newsletter statistics"},{"type": "added", "description": "PRD documentation page"},{"type": "added", "description": "Changelog management"},{"type": "added", "description": "Export analytics ke CSV"}]'::jsonb,
 '2026-01-02'),
('1.6.0', 'Real-time Notifications & Improvements', 'Notifikasi real-time dan perbaikan', '2026-01-04',
 '[{"type": "added", "description": "Real-time login notifications untuk super admin"},{"type": "added", "description": "Sorting A-Z/Z-A di semua manajemen"},{"type": "added", "description": "Bulk import CSV untuk newsletter subscribers"},{"type": "added", "description": "Grafik perbandingan views artikel per bulan"},{"type": "added", "description": "Email notification untuk first login moderator"},{"type": "added", "description": "Export PRD ke Markdown"},{"type": "improved", "description": "Menu admin panel reorganization"},{"type": "security", "description": "Removed default login placeholders"}]'::jsonb,
 '2026-01-04'),
('1.7.0', 'Profile Management & Approval Workflow', 'Manajemen profil dan workflow approval', '2026-01-04',
 '[{"type": "added", "description": "Login dengan username atau email"},{"type": "added", "description": "Upload dan ganti foto profil"},{"type": "added", "description": "Update username di admin panel"},{"type": "added", "description": "Approval workflow untuk artikel moderator"},{"type": "added", "description": "Dashboard real-time admin online"},{"type": "added", "description": "Export analytics ke PDF"},{"type": "security", "description": "Restrict Newsletter, Club, Regional untuk super admin"},{"type": "improved", "description": "Favicon dengan logo FIM"}]'::jsonb,
 '2026-01-04');

-- Update PRD documents
DELETE FROM public.prd_documents;

INSERT INTO public.prd_documents (title, description, category, status, priority, content, created_at) VALUES
('Website Public Pages', 'Halaman-halaman publik website FIM', 'feature', 'completed', 'high',
 '## Halaman Publik\n\n### Landing Page\n- Hero section dengan CTA\n- Partner logos carousel\n- Statistik FIM (alumni, regional, club)\n- Newsletter signup form\n\n### Tentang\n- Sejarah FIM\n- Visi & Misi\n- Regional overview\n- FIM Club overview\n\n### Program\n- Program Unggulan\n- Pelatihan\n\n### Blog\n- Kategori artikel\n- Detail artikel dengan views\n- Related articles\n\n### Lainnya\n- FAQ\n- Cerita Alumni\n- Donasi\n- Gabung Relawan', '2025-12-23'),

('Admin Authentication System', 'Sistem autentikasi admin panel', 'feature', 'completed', 'high',
 '## Autentikasi\n\n### Login\n- Email/password authentication\n- Rate limiting (5 attempts/15 min)\n- Login attempt logging\n- Session management\n\n### Security\n- JWT tokens\n- Auto logout after 30 min idle\n- Password change enforcement\n- Audit logging\n\n### Roles\n- Super Admin: Full access\n- Moderator: Limited access', '2025-12-24'),

('Article Management', 'Sistem manajemen artikel', 'feature', 'completed', 'high',
 '## Manajemen Artikel\n\n### CRUD Operations\n- Create artikel dengan rich text editor\n- Upload featured image\n- Kategori: Pengumuman, Prestasi, Kegiatan, Sosial, Opini, Tips\n- Tags management\n- Scheduling articles\n\n### Features\n- Pin/unpin artikel\n- View count tracking\n- Draft/Published/Archived status\n- Author affiliation\n\n### Permissions\n- Moderator: Create, edit own\n- Super Admin: All operations', '2025-12-24'),

('Newsletter System', 'Sistem newsletter dan broadcast', 'feature', 'completed', 'medium',
 '## Newsletter\n\n### Subscriber Management\n- Add/remove subscribers\n- Bulk import from CSV\n- Export subscriber list\n- Active/inactive status\n\n### Broadcast\n- Rich text email composer\n- Schedule broadcasts\n- Send to all active subscribers\n- Delivery statistics', '2025-12-26'),

('Regional & Club Management', 'Manajemen FIM Regional dan Club', 'feature', 'completed', 'medium',
 '## Regional & Club\n\n### Regional\n- CRUD operations\n- Logo upload\n- Province/Island categorization\n- Contact info (email, instagram)\n\n### Club\n- CRUD operations\n- Category classification\n- Activities list\n- Icon customization', '2025-12-28'),

('User Management', 'Manajemen pengguna admin', 'feature', 'completed', 'high',
 '## User Management\n\n### Operations\n- Create new admin users\n- Assign roles (Super Admin/Moderator)\n- Deactivate users\n- Reset passwords\n\n### Profile\n- Update profile info\n- Upload avatar\n- Change username\n- Password management', '2025-12-30'),

('Analytics Dashboard', 'Dashboard analitik', 'feature', 'completed', 'medium',
 '## Analytics\n\n### Article Stats\n- Total views\n- Views per category\n- Top articles\n- Trending topics\n- Engagement rate\n- Monthly comparison\n\n### Newsletter Stats\n- Total subscribers\n- Growth rate\n- Broadcast statistics\n\n### Export\n- CSV export\n- Summary report\n- PDF export with charts', '2026-01-02'),

('Approval Workflow', 'Workflow approval artikel moderator', 'feature', 'in_progress', 'high',
 '## Approval Workflow\n\n### Flow\n1. Moderator creates article\n2. Article marked as "needs_approval"\n3. Super Admin reviews\n4. Approve or reject with reason\n5. If approved, article can be published\n\n### Features\n- Pending approval queue\n- Rejection with reason\n- Notification to moderator', '2026-01-04'),

('Real-time Features', 'Fitur real-time', 'feature', 'in_progress', 'medium',
 '## Real-time\n\n### Online Dashboard\n- Active admin sessions\n- Last activity tracking\n- Device/browser info\n\n### Notifications\n- Login notifications\n- New article notifications\n- Approval notifications', '2026-01-04'),

('Multi-language Support', 'Dukungan multi-bahasa', 'feature', 'completed', 'low',
 '## Internationalization\n\n### Languages\n- Indonesian (default)\n- English\n\n### Implementation\n- JSON translation files\n- Language context provider\n- Language switcher component', '2025-12-23'),

('Dark Mode', 'Mode gelap', 'feature', 'completed', 'low',
 '## Dark Mode\n\n### Implementation\n- Theme provider with next-themes\n- CSS variables for colors\n- System preference detection\n- Toggle in navbar', '2025-12-23'),

('SEO Optimization', 'Optimasi SEO', 'feature', 'completed', 'medium',
 '## SEO\n\n### Meta Tags\n- Title and description\n- Open Graph tags\n- Twitter cards\n- Canonical URLs\n\n### Technical\n- Semantic HTML\n- robots.txt\n- sitemap.xml\n- Lazy loading images', '2025-12-23'),

('Security Audit', 'Audit keamanan', 'security', 'completed', 'high',
 '## Security Measures\n\n### Authentication\n- Secure password hashing\n- Rate limiting\n- Session management\n\n### Database\n- Row Level Security (RLS)\n- Role-based policies\n- Audit logging\n\n### Frontend\n- Input validation with Zod\n- XSS prevention\n- HTTPS enforcement', '2025-12-30'),

('Performance Optimization', 'Optimasi performa', 'improvement', 'planned', 'medium',
 '## Performance\n\n### Planned\n- Image optimization\n- Code splitting\n- Caching strategies\n- CDN integration', '2026-01-04'),

('Mobile App', 'Aplikasi mobile', 'feature', 'planned', 'low',
 '## Mobile App\n\n### Planned Features\n- React Native app\n- Push notifications\n- Offline support\n- Mobile-first design', '2026-01-04');