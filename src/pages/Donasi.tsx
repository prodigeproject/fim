import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { Heart, Building, AlertTriangle, CheckCircle, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Donasi = () => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Berhasil disalin!",
      description: `${label} telah disalin ke clipboard.`,
    });
  };

  const bankAccount = {
    bank: "Bank Mandiri",
    number: "006 00 1059 3089",
    name: "Forum Indonesia Muda",
  };

  const donationSteps = [
    {
      step: 1,
      title: "Transfer ke Rekening Mandiri",
      description: "Transfer donasi ke rekening Bank Mandiri 006 00 1059 3089 a.n. Forum Indonesia Muda",
    },
    {
      step: 2,
      title: "Cantumkan Kode Unik",
      description: "Tambahkan kode unik 99 di akhir nominal transfer (contoh: Rp 100.099)",
    },
    {
      step: 3,
      title: "Tambahkan Catatan",
      description: "Sertakan catatan tujuan donasi pada keterangan transfer (opsional)",
    },
    {
      step: 4,
      title: "Konfirmasi Donasi",
      description: "Kirimkan bukti transfer ke WhatsApp +62 852-1358-0323 untuk konfirmasi",
    },
  ];

  const usages = [
    { title: "Program Beasiswa", percentage: 40, description: "Beasiswa untuk calon kader dari keluarga kurang mampu" },
    { title: "Pelatihan & Workshop", percentage: 30, description: "Biaya operasional program kaderisasi tahunan" },
    { title: "Proyek Sosial", percentage: 20, description: "Pendanaan proyek sosial alumni di berbagai daerah" },
    { title: "Operasional", percentage: 10, description: "Biaya administrasi dan operasional organisasi" },
  ];

  return (
    <Layout>
      <PageHero
        title="Dukung Forum Indonesia Muda"
        subtitle="Kontribusi Anda membantu kami mencetak lebih banyak pemimpin muda untuk Indonesia"
      />

      {/* Why Donate */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              Mengapa Mendukung FIM?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Selama lebih dari 20 tahun, FIM telah mencetak ribuan pemimpin muda yang 
              kini berkontribusi di berbagai sektor. Dukungan Anda membantu kami 
              menjangkau lebih banyak pemuda dari berbagai latar belakang.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Heart, title: "4000+ Alumni", desc: "Pemimpin muda yang telah dibentuk sejak 2003" },
              { icon: Building, title: "60+ Regional", desc: "Jangkauan dari Sabang sampai Merauke" },
              { icon: CheckCircle, title: "100+ Proyek/Tahun", desc: "Proyek sosial yang berdampak langsung" },
            ].map((item, index) => (
              <div
                key={item.title}
                className="bg-card rounded-xl p-6 text-center shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <item.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Method */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-12">
            Cara Berdonasi
          </h2>

          <div className="max-w-4xl mx-auto">
            {/* Bank Account */}
            <div className="bg-card rounded-2xl p-6 lg:p-8 shadow-lg mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Rekening Donasi</h3>
              </div>

              <div className="bg-gradient-to-r from-primary/5 to-supporting/5 rounded-xl p-6 border-2 border-primary/20">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="font-bold text-lg text-foreground">{bankAccount.bank}</p>
                    <p className="text-2xl lg:text-3xl font-mono font-bold text-primary my-2">{bankAccount.number}</p>
                    <p className="text-muted-foreground">a.n. {bankAccount.name}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => copyToClipboard(bankAccount.number.replace(/\s/g, ''), `Nomor rekening ${bankAccount.bank}`)}
                    className="gap-2"
                  >
                    <Copy className="h-5 w-5" />
                    Salin No. Rekening
                  </Button>
                </div>
              </div>
            </div>

            {/* Donation Steps */}
            <div className="bg-card rounded-2xl p-6 lg:p-8 shadow-lg">
              <h3 className="text-xl font-bold text-foreground mb-6">Langkah-langkah Berdonasi</h3>
              
              <div className="space-y-6">
                {donationSteps.map((item, index) => (
                  <div key={item.step} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Important Note */}
              <div className="mt-8 bg-accent/10 rounded-xl p-4 border border-accent/20">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">💡 Penting:</span> Kode unik (99) di akhir nominal transfer membantu kami mengidentifikasi donasi Anda dengan lebih mudah.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disaster Relief */}
      <section className="py-16 bg-destructive/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-2xl p-6 lg:p-8 shadow-lg border-l-4 border-destructive">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-destructive/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    🆘 Donasi Khusus Bencana
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    FIM aktif dalam tanggap darurat bencana. Jika ada bencana yang sedang terjadi, 
                    donasi khusus bencana akan diinformasikan di sini dan melalui media sosial resmi FIM.
                  </p>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground italic">
                      Saat ini tidak ada program donasi bencana yang sedang berlangsung. 
                      Pantau media sosial kami untuk update terbaru.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section className="py-16 lg:py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">
            Transparansi Penggunaan Dana
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Kami berkomitmen untuk menggunakan setiap donasi secara bertanggung jawab dan transparan.
          </p>

          <div className="max-w-3xl mx-auto space-y-6">
            {usages.map((usage, index) => (
              <div
                key={usage.title}
                className="bg-card rounded-xl p-6 shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">{usage.title}</h3>
                  <span className="text-2xl font-bold text-primary">{usage.percentage}%</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{usage.description}</p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all duration-1000"
                    style={{ width: `${usage.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Confirmation CTA */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Sudah Berdonasi?
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Kirimkan bukti transfer ke WhatsApp kami untuk konfirmasi dan mendapatkan laporan penggunaan dana.
          </p>
          <a
            href="https://wa.me/6285213580323?text=Halo,%20saya%20ingin%20konfirmasi%20donasi%20ke%20FIM"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-supporting text-supporting-foreground px-6 py-3 rounded-lg font-semibold hover:bg-supporting/90 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            Konfirmasi via WhatsApp
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default Donasi;
