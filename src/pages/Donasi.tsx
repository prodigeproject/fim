import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { Heart, Building, Wallet, QrCode, AlertTriangle, CheckCircle, Copy } from "lucide-react";
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

  const bankAccounts = [
    { bank: "Bank BCA", number: "1234567890", name: "Yayasan Forum Indonesia Muda" },
    { bank: "Bank Mandiri", number: "0987654321", name: "Yayasan Forum Indonesia Muda" },
    { bank: "Bank BNI", number: "1122334455", name: "Yayasan Forum Indonesia Muda" },
  ];

  const eWallets = [
    { name: "GoPay", number: "081234567890" },
    { name: "OVO", number: "081234567890" },
    { name: "DANA", number: "081234567890" },
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
              { icon: Heart, title: "5000+ Alumni", desc: "Pemimpin muda yang telah dibentuk sejak 2003" },
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

      {/* Donation Methods */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-12">
            Cara Berdonasi
          </h2>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Bank Transfer */}
            <div className="bg-card rounded-2xl p-6 lg:p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Transfer Bank</h3>
              </div>

              <div className="space-y-4">
                {bankAccounts.map((account) => (
                  <div
                    key={account.bank}
                    className="bg-muted rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{account.bank}</p>
                      <p className="text-lg font-mono text-primary">{account.number}</p>
                      <p className="text-xs text-muted-foreground">a.n. {account.name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(account.number, `Nomor rekening ${account.bank}`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* E-Wallet */}
            <div className="bg-card rounded-2xl p-6 lg:p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-supporting/10 rounded-xl flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-supporting" />
                </div>
                <h3 className="text-xl font-bold text-foreground">E-Wallet</h3>
              </div>

              <div className="space-y-4 mb-6">
                {eWallets.map((wallet) => (
                  <div
                    key={wallet.name}
                    className="bg-muted rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{wallet.name}</p>
                      <p className="text-lg font-mono text-supporting">{wallet.number}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(wallet.number, `Nomor ${wallet.name}`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* QR Code placeholder */}
              <div className="bg-muted rounded-lg p-6 text-center">
                <QrCode className="h-24 w-24 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Scan QR Code untuk donasi via QRIS</p>
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
            href="https://wa.me/628123456789?text=Halo,%20saya%20ingin%20konfirmasi%20donasi%20ke%20FIM"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-supporting text-supporting-foreground px-6 py-3 rounded-lg font-semibold hover:bg-supporting/90 transition-colors"
          >
            Konfirmasi via WhatsApp
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default Donasi;
