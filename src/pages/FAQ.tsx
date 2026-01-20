import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const FAQ = () => {
  const faqCategories = [
    {
      category: "Tentang FIM",
      questions: [
        {
          q: "Apa itu Forum Indonesia Muda (FIM)?",
          a: "Forum Indonesia Muda adalah organisasi pemuda yang berdiri sejak 2003. FIM bertujuan untuk membentuk pemimpin muda Indonesia yang berkarakter, memiliki jiwa kepemimpinan, dan berkontribusi bagi bangsa. Dengan filosofi 'kunang-kunang', FIM percaya setiap pemuda bisa menjadi cahaya yang menerangi Indonesia.",
        },
        {
          q: "Berapa usia FIM saat ini?",
          a: "FIM telah berdiri sejak tahun 2003, yang berarti sudah lebih dari 20 tahun berkontribusi dalam pembentukan pemimpin muda Indonesia. Hingga saat ini, FIM telah meluluskan lebih dari 34 angkatan kader.",
        },
        {
          q: "Apa filosofi 'kunang-kunang' FIM?",
          a: "Filosofi kunang-kunang menggambarkan bahwa seperti kunang-kunang yang kecil namun mampu menerangi kegelapan, setiap pemuda Indonesia memiliki cahaya (potensi) yang dapat menerangi jalan bagi sesama dan bangsa, sekecil apapun kontribusinya.",
        },
      ],
    },
    {
      category: "Program & Pendaftaran",
      questions: [
        {
          q: "Siapa yang bisa mendaftar program FIM?",
          a: "Program FIM terbuka untuk pemuda Indonesia berusia 17-25 tahun dari berbagai latar belakang. Yang paling penting adalah semangat untuk belajar, berkembang, dan berkontribusi bagi masyarakat.",
        },
        {
          q: "Kapan pendaftaran FIM dibuka?",
          a: "Pendaftaran program kaderisasi FIM biasanya dibuka setiap tahun pada bulan Januari-Februari. Informasi pendaftaran akan diumumkan melalui website resmi dan media sosial FIM. Pastikan Anda mengikuti akun resmi kami untuk update terbaru.",
        },
        {
          q: "Apakah ada biaya untuk mengikuti program FIM?",
          a: "Program FIM memerlukan biaya partisipasi yang terjangkau untuk mendukung operasional pelatihan. Namun, FIM menyediakan beasiswa penuh bagi calon kader dari keluarga kurang mampu. Tidak ada yang terhalang karena faktor ekonomi.",
        },
        {
          q: "Bagaimana proses seleksi FIM?",
          a: "Proses seleksi meliputi: (1) Pendaftaran online dengan pengisian formulir dan esai, (2) Seleksi administrasi, (3) Tes tertulis atau online, (4) Wawancara oleh tim regional. Kandidat terpilih akan mengikuti serangkaian pelatihan intensif.",
        },
        {
          q: "Apa saja yang akan dipelajari di FIM?",
          a: "Program FIM mencakup: pengembangan karakter (7 Pilar Karakter), kepemimpinan (7 Pilar Kepemimpinan), public speaking, project management, networking, dan implementasi proyek sosial di komunitas masing-masing.",
        },
      ],
    },
    {
      category: "Regional & FIM Club",
      questions: [
        {
          q: "Ada berapa regional FIM di Indonesia?",
          a: "Saat ini FIM memiliki 60 regional + 1 diaspora yang tersebar di 34 provinsi Indonesia, dari Aceh hingga Papua. Setiap regional memiliki koordinator dan kegiatan lokal masing-masing.",
        },
        {
          q: "Apa itu FIM Club?",
          a: "FIM Club adalah komunitas alumni FIM yang dikelompokkan berdasarkan bidang minat dan keahlian, seperti FC Policy, FC Pendidikan, FC IT, dll. Saat ini ada 18 FIM Club aktif dengan ribuan anggota.",
        },
        {
          q: "Bagaimana cara bergabung dengan FIM Club?",
          a: "Setelah lulus dari program kaderisasi FIM, alumni secara otomatis dapat bergabung dengan FIM Club sesuai minat. Satu orang bisa bergabung dengan lebih dari satu klub.",
        },
      ],
    },
    {
      category: "Alumni & Jaringan",
      questions: [
        {
          q: "Berapa jumlah alumni FIM saat ini?",
          a: "FIM telah meluluskan lebih dari 4.000 alumni dari lebih dari 34 angkatan yang tersebar di berbagai sektor: pemerintahan, bisnis, pendidikan, kesehatan, dan sektor sosial lainnya.",
        },
        {
          q: "Apakah alumni tetap terhubung setelah lulus?",
          a: "Ya! Alumni FIM tetap terhubung melalui FIM Club, kegiatan regional, reunion tahunan, dan berbagai platform komunikasi. Jaringan alumni adalah salah satu aset terbesar FIM.",
        },
        {
          q: "Bagaimana alumni FIM berkontribusi?",
          a: "Alumni berkontribusi melalui berbagai cara: menjadi mentor bagi kader baru, mendukung proyek sosial, berbagi pengalaman sebagai narasumber, memberikan donasi, dan menginisiasi program-program kolaboratif.",
        },
      ],
    },
    {
      category: "Donasi & Dukungan",
      questions: [
        {
          q: "Bagaimana cara berdonasi ke FIM?",
          a: "Anda dapat berdonasi melalui transfer bank ke rekening Mandiri 006 00 1059 3089 a.n. Forum Indonesia Muda. Jangan lupa cantumkan kode unik (99) di akhir nominal transfer dan konfirmasi via WhatsApp +62 852-1358-0323.",
        },
        {
          q: "Untuk apa donasi digunakan?",
          a: "Donasi digunakan untuk: beasiswa calon kader (40%), operasional pelatihan (30%), pendanaan proyek sosial alumni (20%), dan biaya administrasi organisasi (10%). Kami berkomitmen untuk transparansi penggunaan dana.",
        },
        {
          q: "Apakah FIM menerima donasi untuk bencana?",
          a: "Ya, FIM aktif dalam tanggap darurat bencana. Ketika ada bencana, kami membuka donasi khusus dan mengoordinasikan relawan alumni untuk membantu korban. Informasi akan diumumkan melalui media sosial resmi.",
        },
      ],
    },
    {
      category: "Kerjasama & Partnership",
      questions: [
        {
          q: "Bagaimana jika ingin bekerjasama dengan FIM?",
          a: "Jika Anda atau lembaga Anda ingin bekerjasama dengan FIM, silakan menghubungi kami melalui WhatsApp +62 852-1358-0323 atau kirimkan proposal ke email halo@forumindonesiamuda.org. Proposal akan ditinjau oleh pengurus dan kami akan menghubungi Anda untuk tindak lanjut.",
        },
      ],
    },
  ];

  return (
    <Layout>
      <SEO 
        title="FAQ" 
        description="Pertanyaan yang sering diajukan tentang Forum Indonesia Muda. Temukan jawaban seputar pendaftaran, program, regional, alumni, donasi, dan kerjasama dengan FIM."
      />
      <PageHero
        title="Pertanyaan yang Sering Diajukan"
        subtitle="Temukan jawaban untuk pertanyaan umum tentang Forum Indonesia Muda"
      />

      {/* FAQ Section */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {faqCategories.map((category, categoryIndex) => (
              <div
                key={category.category}
                className="mb-10 animate-fade-in"
                style={{ animationDelay: `${categoryIndex * 0.1}s` }}
              >
                <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">
                  {category.category}
                </h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.questions.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${category.category}-${index}`}
                      className="bg-card rounded-lg border border-border px-4"
                    >
                      <AccordionTrigger className="text-left text-foreground hover:text-primary py-4">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Pertanyaan Lain?
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Jika pertanyaan Anda belum terjawab, jangan ragu untuk menghubungi kami.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:halo@forumindonesiamuda.org"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <Mail className="h-5 w-5" />
              Email Kami
            </a>
            <a
              href="https://wa.me/6285213580323"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-supporting text-supporting-foreground px-6 py-3 rounded-lg font-semibold hover:bg-supporting/90 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h3 className="text-xl font-bold text-center text-foreground mb-8">
            Link Cepat
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/tentang">
              <Button variant="outline">Tentang FIM</Button>
            </Link>
            <Link to="/program/pelatihan">
              <Button variant="outline">Program Pelatihan</Button>
            </Link>
            <Link to="/program/regional">
              <Button variant="outline">Regional FIM</Button>
            </Link>
            <Link to="/donasi">
              <Button variant="outline">Donasi</Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;
