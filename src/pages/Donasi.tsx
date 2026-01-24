import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import { Heart, Building, AlertTriangle, CheckCircle, Copy, MessageCircle, Instagram, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

const Donasi = () => {
  const { t } = useTranslation();
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("donation.copied"),
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
      <SEO 
        title={t("donation.title")} 
        description={t("donation.subtitle")}
      />
      <PageHero
        title={t("donation.title")}
        subtitle={t("donation.subtitle")}
      />

      {/* Two Column Layout - Main Donations vs Disaster */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
            {/* LEFT: Main FIM Donations - 2 columns */}
            <div className="lg:col-span-2 space-y-12">
              {/* Why Donate */}
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                  {t("donation.whyDonate")}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  {t("donation.whyDesc")}
                </p>

                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { icon: Heart, title: "4000+ Alumni", desc: t("common.alumniCount") },
                    { icon: Building, title: "60+ Regional", desc: t("common.regionalCount") },
                    { icon: CheckCircle, title: "100+ Proyek/Tahun", desc: t("common.projectCount") },
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
                  {t("donation.howToDonate")}
                </h2>

                {/* Bank Account */}
                <div className="bg-card rounded-2xl p-6 shadow-lg mb-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{t("donation.donationAccount")}</h3>
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
                        {t("donation.copy")}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Donation Steps */}
                <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4">{t("donation.steps")}</h3>
                  
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
                      <span className="font-semibold">💡 {t("donation.importantNote")}</span> {t("donation.uniqueCode")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transparency */}
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                  {t("donation.transparency")}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t("donation.transparencyDesc")}
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
                  {t("donation.alreadyDonated")}
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
                  {t("donation.confirmDonation")}
                </p>
                <a
                  href="https://wa.me/6285213580323?text=Halo,%20saya%20ingin%20konfirmasi%20donasi%20ke%20FIM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-supporting text-supporting-foreground px-5 py-2.5 rounded-lg font-semibold hover:bg-supporting/90 transition-colors text-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t("donation.confirmViaWA")}
                </a>
              </div>
            </div>

            {/* RIGHT: Disaster Relief - 1 column but wider */}
            <div className="lg:col-span-1">
              <div className="bg-destructive/5 rounded-2xl p-6 lg:p-8 border-2 border-destructive/20 sticky top-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-destructive/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-7 w-7 text-destructive" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {t("donation.disasterTitle")}
                    </h2>
                    <p className="text-sm text-destructive font-medium">{t("donation.disasterSubtitle")}</p>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t("donation.disasterDesc")}
                </p>

                <div className="bg-card rounded-xl p-5 mb-6 border border-border">
                  <p className="text-sm text-muted-foreground italic mb-5">
                    {t("donation.disasterUpdate")}
                  </p>
                  
                  <div className="space-y-3">
                    <a
                      href="https://instagram.com/fimtanggapbencana"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl hover:from-pink-500/20 hover:to-purple-500/20 transition-colors group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Instagram className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-foreground">@fimtanggapbencana</p>
                        <p className="text-sm text-muted-foreground">Instagram Resmi Tanggap Bencana</p>
                      </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </a>

                    <a
                      href="https://instagram.com/fimnews"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl hover:from-pink-500/20 hover:to-purple-500/20 transition-colors group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Instagram className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-foreground">@fimnews</p>
                        <p className="text-sm text-muted-foreground">Media Resmi FIM</p>
                      </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </a>
                  </div>
                </div>

                <div className="bg-muted rounded-xl p-5 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{t("donation.disasterTransparency")}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("donation.disasterTransparencyDesc")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center p-4 bg-destructive/10 rounded-xl border border-destructive/20">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{t("donation.disasterInfo")}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("donation.disasterInfoDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Donasi;