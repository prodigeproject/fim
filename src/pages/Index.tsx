import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Target, Sparkles } from "lucide-react";
import logoFim from "@/assets/logo-fim.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-glow" style={{ animationDelay: "1s" }} />
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="flex flex-col items-center text-center">
            {/* Logo */}
            <img 
              src={logoFim} 
              alt="Forum Indonesia Muda" 
              className="h-24 lg:h-32 mb-8 animate-fade-in"
            />
            
            {/* Headline */}
            <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Forum Indonesia Muda
            </h1>
            
            <p className="text-lg lg:text-xl text-primary-foreground/90 max-w-2xl mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Wadah bagi pemuda Indonesia untuk bertumbuh, berkolaborasi, dan menjadi 
              <span className="text-accent font-semibold"> cahaya kunang-kunang </span>
              yang menerangi masa depan bangsa.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                Bergabung Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Pelajari Lebih Lanjut
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">
            Nilai-Nilai Kami
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            FIM hadir untuk membangun generasi muda yang memiliki karakter kuat dan visi ke depan.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-card rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow animate-fade-in">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Kolaborasi</h3>
              <p className="text-muted-foreground">
                Bersama-sama membangun jaringan pemuda Indonesia yang solid dan saling mendukung.
              </p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-card rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="w-14 h-14 bg-supporting/10 rounded-lg flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-supporting" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Pertumbuhan</h3>
              <p className="text-muted-foreground">
                Mengembangkan potensi diri melalui berbagai program kepemimpinan dan pelatihan.
              </p>
            </div>
            
            {/* Card 3 */}
            <div className="bg-card rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="w-14 h-14 bg-accent/20 rounded-lg flex items-center justify-center mb-6">
                <Sparkles className="h-7 w-7 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Inspirasi</h3>
              <p className="text-muted-foreground">
                Menjadi kunang-kunang yang menerangi dan menginspirasi sesama pemuda Indonesia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Siap Menjadi Bagian dari Perubahan?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Bergabunglah dengan ribuan pemuda Indonesia lainnya dalam membangun masa depan yang lebih baik.
          </p>
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            Daftar Sekarang
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logoFim} alt="FIM" className="h-10" />
              <span className="text-background font-semibold">Forum Indonesia Muda</span>
            </div>
            <p className="text-background/70 text-sm">
              © 2024 Forum Indonesia Muda. Hak cipta dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
