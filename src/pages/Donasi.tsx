import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { Heart, Building, AlertTriangle, CheckCircle, Copy, MessageCircle, Instagram, ExternalLink } from "lucide-react";
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

      {/* Two Column Layout - Main Donations vs Disaster */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* LEFT: Main FIM Donations - 3 columns */}
            <div className="lg:col-span-3 space-y-12">
              {/* Why Donate */}
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                  Mengapa Mendukung FIM?
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Selama lebih dari 20 tahun, FIM telah mencetak ribuan pemimpin muda yang 
                  kini berkontribusi di berbagai sektor. Dukungan Anda membantu kami 
                  menjangkau lebih banyak pemuda dari berbagai latar belakang.
                </p>

                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { icon: Heart, title: "4000+ Alumni", desc: "Pemimpin muda sejak 2003" },
                    { icon: Building, title: "60+ Regional", desc: "Dari Sabang sampai Merauke" },
                    { icon: CheckCircle, title: "100+ Proyek/Tahun", desc: "Proyek sosial berdampak" },
                  ].map((item, index) => (
                    <div
                      key={item.title}
                      className="bg-secondary rounded-xl p-4 text-center animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <item.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h3 className="font-bold text-foreground text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Donation Method */}
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">
                  Cara Berdonasi
                </h2>

                {/* Bank Account */}
                <div className="bg-card rounded-2xl p-6 shadow-lg mb-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Rekening Donasi</h3>
                  </div>

                  <div className="bg-gradient-to-r from-primary/5 to-supporting/5 rounded-xl p-5 border border-primary/20">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="font-bold text-foreground">{bankAccount.bank}</p>
                        <p className="text-xl lg:text-2xl font-mono font-bold text-primary my-1">{bankAccount.number}</p>
                        <p className="text-sm text-muted-foreground">a.n. {bankAccount.name}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(bankAccount.number.replace(/\s/g, ''), `Nomor rekening ${bankAccount.bank}`)}
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Salin
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Donation Steps */}
                <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4">Langkah-langkah</h3>
                  
                  <div className="space-y-4">
                    {donationSteps.map((item, index) => (
                      <div key={item.step} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0 text-sm">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                          <p className="text-muted-foreground text-xs">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 bg-accent/10 rounded-xl p-3 border border-accent/20">
                    <p className="text-xs text-foreground">
                      <span className="font-semibold">💡 Penting:</span> Kode unik (99) membantu kami mengidentifikasi donasi Anda.
                    </p>
                  </div>
                </div>
              </div>

              {/* Transparency */}
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                  Transparansi Penggunaan Dana
                </h2>
                <p className="text-muted-foreground mb-6">
                  Kami berkomitmen menggunakan setiap donasi secara bertanggung jawab dan transparan.
                </p>

                <div className="space-y-4">
                  {usages.map((usage, index) => (
                    <div
                      key={usage.title}
                      className="bg-card rounded-xl p-4 shadow-lg border border-border animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground text-sm">{usage.title}</h3>
                        <span className="text-xl font-bold text-primary">{usage.percentage}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{usage.description}</p>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary rounded-full h-1.5 transition-all duration-1000"
                          style={{ width: `${usage.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirmation CTA */}
              <div className="bg-secondary rounded-2xl p-6 text-center">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Sudah Berdonasi?
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
                  Kirimkan bukti transfer ke WhatsApp kami untuk konfirmasi.
                </p>
                <a
                  href="https://wa.me/6285213580323?text=Halo,%20saya%20ingin%20konfirmasi%20donasi%20ke%20FIM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-supporting text-supporting-foreground px-5 py-2.5 rounded-lg font-semibold hover:bg-supporting/90 transition-colors text-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  Konfirmasi via WhatsApp
                </a>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden lg:flex justify-center">
              <div className="w-px bg-border h-full" />
            </div>

            {/* Horizontal Divider for Mobile */}
            <div className="lg:hidden">
              <div className="h-px bg-border w-full my-8" />
            </div>

            {/* RIGHT: Disaster Relief - 1 column */}
            <div className="lg:col-span-1">
              <div className="bg-destructive/5 rounded-2xl p-6 border-2 border-destructive/20 sticky top-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-destructive/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    🆘 Donasi Bencana
                  </h2>
                </div>
                
                <p className="text-muted-foreground text-sm mb-6">
                  FIM aktif dalam tanggap darurat bencana melalui program FIM Tanggap Bencana.
                </p>

                <div className="bg-card rounded-xl p-4 mb-6 border border-border">
                  <p className="text-sm text-muted-foreground italic mb-4">
                    Update penggalangan donasi untuk bencana kemanusiaan dapat diikuti melalui:
                  </p>
                  
                  <a
                    href="https://instagram.com/fimtanggapbencana"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg hover:from-pink-500/20 hover:to-purple-500/20 transition-colors mb-3"
                  >
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">@fimtanggapbencana</p>
                      <p className="text-xs text-muted-foreground">Instagram Resmi</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                  </a>

                  <a
                    href="https://instagram.com/fimnews"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg hover:from-pink-500/20 hover:to-purple-500/20 transition-colors"
                  >
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">@fimnews</p>
                      <p className="text-xs text-muted-foreground">Media Resmi FIM</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                  </a>
                </div>

                <div className="bg-muted rounded-xl p-4">
                  <h4 className="font-semibold text-foreground text-sm mb-2">📋 Transparansi</h4>
                  <p className="text-xs text-muted-foreground">
                    Laporan penggunaan dana donasi bencana diinformasikan secara spesifik di akun Instagram @fimtanggapbencana dan @fimnews.
                  </p>
                </div>

                <p className="text-xs text-muted-foreground mt-4 italic text-center">
                  Cara berdonasi untuk bencana akan diinformasikan saat ada penggalangan aktif.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Donasi;