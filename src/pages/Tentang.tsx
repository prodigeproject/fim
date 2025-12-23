import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { Heart, Users, Target, Lightbulb, BookOpen, Globe, Compass, Shield, Star, Zap, Award } from "lucide-react";

const Tentang = () => {
  const sejarah = [
    { year: "2003", event: "Forum Indonesia Muda didirikan oleh sekelompok pemuda idealis" },
    { year: "2005", event: "Ekspansi ke 10 kota besar di Indonesia" },
    { year: "2010", event: "Peluncuran program kaderisasi tahunan nasional" },
    { year: "2015", event: "Pembentukan FIM Club untuk alumni" },
    { year: "2020", event: "Transformasi digital dan perluasan ke 60+ regional" },
    { year: "2024", event: "Memasuki angkatan ke-24 dengan ribuan alumni aktif" },
  ];

  const pilarKarakter = [
    { icon: Heart, name: "Integritas", desc: "Konsisten dalam nilai dan tindakan" },
    { icon: Users, name: "Kolaborasi", desc: "Bekerja sama untuk tujuan bersama" },
    { icon: Target, name: "Keberanian", desc: "Berani mengambil langkah maju" },
    { icon: Lightbulb, name: "Kreativitas", desc: "Inovasi dalam setiap solusi" },
    { icon: BookOpen, name: "Pembelajaran", desc: "Terus bertumbuh dan berkembang" },
    { icon: Globe, name: "Kepedulian", desc: "Peduli terhadap sesama dan lingkungan" },
    { icon: Compass, name: "Visioner", desc: "Melihat jauh ke depan" },
  ];

  const pilarKepemimpinan = [
    { icon: Shield, name: "Servant Leadership", desc: "Memimpin dengan melayani" },
    { icon: Star, name: "Authentic Leadership", desc: "Memimpin dengan autentik" },
    { icon: Zap, name: "Transformational", desc: "Membawa perubahan positif" },
    { icon: Award, name: "Ethical Leadership", desc: "Memimpin dengan etika" },
    { icon: Users, name: "Collaborative", desc: "Membangun tim yang solid" },
    { icon: Target, name: "Strategic Thinking", desc: "Berpikir strategis" },
    { icon: Heart, name: "Empathy", desc: "Memahami perspektif orang lain" },
  ];

  return (
    <Layout>
      <PageHero
        title="Tentang Forum Indonesia Muda"
        subtitle="Lebih dari dua dekade membangun generasi muda Indonesia yang berkarakter dan berjiwa pemimpin"
      />

      {/* Visi Misi Section */}
      <section className="py-16 lg:py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Visi */}
            <div className="bg-card rounded-2xl p-8 shadow-lg animate-fade-in">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Visi</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Menjadi wadah terdepan dalam membentuk generasi muda Indonesia yang 
                memiliki karakter kuat, jiwa kepemimpinan, dan semangat untuk berkontribusi 
                bagi kemajuan bangsa.
              </p>
            </div>

            {/* Misi */}
            <div className="bg-card rounded-2xl p-8 shadow-lg animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="w-16 h-16 bg-supporting/10 rounded-xl flex items-center justify-center mb-6">
                <Compass className="h-8 w-8 text-supporting" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Misi</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  Menyelenggarakan program pelatihan kepemimpinan berkualitas
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  Membangun jaringan pemuda lintas daerah dan latar belakang
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  Mendorong kontribusi nyata bagi masyarakat
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  Menjadi platform kolaborasi dan pengembangan diri
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Kunang-kunang Quote */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl p-8 lg:p-12">
              <div className="absolute top-4 left-4 text-6xl text-accent/30">"</div>
              <blockquote className="text-xl lg:text-2xl text-foreground font-medium italic mb-6">
                Seperti kunang-kunang yang kecil namun mampu menerangi kegelapan, 
                kami percaya setiap pemuda Indonesia memiliki cahaya yang dapat 
                menerangi jalan bagi sesama dan bangsa.
              </blockquote>
              <div className="w-16 h-1 bg-accent mx-auto mb-4" />
              <p className="text-muted-foreground font-semibold">Filosofi Kunang-Kunang FIM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sejarah Timeline */}
      <section className="py-16 lg:py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-12">
            Perjalanan Kami
          </h2>
          
          <div className="max-w-3xl mx-auto">
            {sejarah.map((item, index) => (
              <div
                key={item.year}
                className="flex gap-6 mb-8 last:mb-0 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                    {item.year}
                  </div>
                  {index < sejarah.length - 1 && (
                    <div className="w-0.5 flex-1 bg-primary/30 mt-2" />
                  )}
                </div>
                <div className="flex-1 bg-card rounded-xl p-6 shadow-md">
                  <p className="text-foreground">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 Pilar Karakter */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">
            7 Pilar Karakter
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Fondasi karakter yang kami tanamkan kepada setiap kader FIM
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pilarKarakter.map((pilar, index) => (
              <div
                key={pilar.name}
                className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <pilar.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{pilar.name}</h3>
                <p className="text-sm text-muted-foreground">{pilar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 Pilar Kepemimpinan */}
      <section className="py-16 lg:py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">
            7 Pilar Kepemimpinan
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Prinsip kepemimpinan yang menjadi panduan bagi alumni FIM
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pilarKepemimpinan.map((pilar, index) => (
              <div
                key={pilar.name}
                className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="w-12 h-12 bg-supporting/10 rounded-lg flex items-center justify-center mb-4">
                  <pilar.icon className="h-6 w-6 text-supporting" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{pilar.name}</h3>
                <p className="text-sm text-muted-foreground">{pilar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Tentang;
