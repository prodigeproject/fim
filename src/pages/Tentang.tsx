import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { Target, Compass, User, Users, Briefcase, Building2 } from "lucide-react";

const Tentang = () => {
  const sejarah = [
    { year: "2003", event: "Forum Indonesia Muda didirikan oleh sekelompok pemuda idealis" },
    { year: "2005", event: "Ekspansi ke 10 kota besar di Indonesia" },
    { year: "2010", event: "Peluncuran program kaderisasi tahunan nasional" },
    { year: "2015", event: "Pembentukan FIM Club untuk alumni" },
    { year: "2020", event: "Transformasi digital dan perluasan ke 60+ regional" },
    { year: "2024", event: "Memasuki angkatan ke-30+ dengan 4000+ alumni aktif" },
  ];

  const strukturYayasan = [
    { name: "Elmir Amien", position: "Founder / Ketua Dewan Pembina" },
    { name: "Tatty Elmir", position: "Founder / Anggota Dewan Pembina" },
    { name: "Maghleb Elmir", position: "Ketua Dewan Pengawas" },
    { name: "JetC Elmir", position: "Anggota Dewan Pengawas" },
    { name: "Mandira Bienna Elmir", position: "Ketua Pengurus Yayasan" },
    { name: "Ivan Ahda", position: "Sekretaris Pengurus Yayasan" },
    { name: "Ferly Ferdyant", position: "Bendahara Pengurus Yayasan" },
  ];

  const bph = [
    { name: "Dicky Adra Pratama", position: "Direktur Eksekutif" },
    { name: "Anisah Fitriana Rakhman", position: "Sekretaris Bendahara" },
    { name: "M Rafif Quthronada", position: "Sekretaris Jenderal" },
    { name: "Umi Rif'atus S", position: "Wakil Sekretaris Jenderal" },
  ];

  const biroInternal = [
    { name: "Chairul Sinaga", position: "Anggota Biro Internal" },
    { name: "Aisyah Hasim", position: "Anggota Biro Internal" },
    { name: "Arian Handika", position: "Anggota Biro Internal" },
    { name: "Dita Amallya", position: "Anggota Biro Internal" },
  ];

  const divisi = [
    { name: "Nurul Aini", position: "Kepala Biro Media & Komunikasi" },
    { name: "Ayu Rahma Dania", position: "Kepala Divisi Pelatihan" },
    { name: "Mutia Intan Permana G", position: "Kepala Divisi Partnership & Eksternal" },
    { name: "M Aridha Firdaus", position: "Wakil Kepala Divisi Partnership & Eksternal" },
    { name: "Ilham Ramodhan", position: "Kepala Divisi Pengembangan Regional" },
    { name: "RM Agung Dian Perdana", position: "Wakil Kepala Divisi Pengembangan Regional" },
    { name: "Ulfa Rodiah", position: "Kepala Divisi Pengembangan Komunitas" },
    { name: "Arif Setiawan", position: "Kepala Divisi Tanggap Bencana dan Kemanusiaan" },
    { name: "Helmi Anwar R.W.", position: "Wakil Kepala Divisi Tanggap Bencana dan Kemanusiaan" },
    { name: "RM Kuncoro Probojati", position: "Kepala Bisnis Usaha" },
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
              <p className="text-muted-foreground leading-relaxed">
                Hadirnya para pemimpin bangsa yang memiliki semangat nasionalisme dan patriotisme tinggi, 
                berakhlak mulia, sehat dan cerdas paripurna baik secara fisik, rohani, spiritual maupun intelektual. 
                Terwujudnya Indonesia sebagai bangsa yang mandiri dalam ekonomi, berdaulat dalam politik 
                dan berkepribadian dalam kebudayaan.
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
                  Pembinaan pemuda dan mahasiswa untuk diarahkan kepada gagasan jiwa mandiri (entrepreneurship) dan collective leadership.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  Meningkatkan pemahaman akan pentingnya arti kompetensi bagi generasi muda yang berbasis pada soft skill (7 pilar dasar kepemimpinan dan 7 pilar karakter) dan hard skill (teknologi dan profesionalisme).
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  Menyatukan dan mengoptimalkan berbagai potensi pemuda dan mahasiswa dalam forum silaturahim dengan berbagai latar belakang.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  Membuhul solidaritas sosial untuk saling menguatkan antar sesama saudara sebangsa dan setanah air.
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

      {/* Struktur Pengurus Section */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">
            Struktur Pengurus
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Organisasi yang menggerakkan Forum Indonesia Muda
          </p>

          {/* Struktur Yayasan */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Struktur Yayasan</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {strukturYayasan.map((person, index) => (
                <div
                  key={person.name}
                  className="bg-card rounded-xl p-5 shadow-lg hover:shadow-xl transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground text-center mb-1">{person.name}</h4>
                  <p className="text-sm text-muted-foreground text-center">{person.position}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Struktur Pengurus FIM */}
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-supporting/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-supporting" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Struktur Pengurus FIM</h3>
            </div>

            {/* BPH */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Badan Pengurus Harian (BPH)
              </h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {bph.map((person, index) => (
                  <div
                    key={person.name}
                    className="bg-card rounded-xl p-5 shadow-lg hover:shadow-xl transition-all animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="w-14 h-14 bg-supporting/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="h-7 w-7 text-supporting" />
                    </div>
                    <h5 className="font-semibold text-foreground text-center text-sm mb-1">{person.name}</h5>
                    <p className="text-xs text-muted-foreground text-center">{person.position}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Biro Internal */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-foreground mb-4">Biro Internal</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {biroInternal.map((person, index) => (
                  <div
                    key={person.name}
                    className="bg-muted rounded-xl p-4 text-center animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <h5 className="font-medium text-foreground text-sm">{person.name}</h5>
                  </div>
                ))}
              </div>
            </div>

            {/* Kepala Divisi/Biro */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-foreground mb-4">Kepala Divisi & Biro</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {divisi.map((person, index) => (
                  <div
                    key={person.name + person.position}
                    className="bg-card rounded-xl p-4 shadow-md hover:shadow-lg transition-all animate-fade-in flex items-center gap-4"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground text-sm">{person.name}</h5>
                      <p className="text-xs text-muted-foreground">{person.position}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="bg-gradient-to-r from-primary/5 to-supporting/5 rounded-2xl p-6 text-center">
              <p className="text-muted-foreground">
                Di bawah struktur FIM Pusat terdapat <span className="font-semibold text-foreground">60 Regional + 1 Diaspora</span> dan <span className="font-semibold text-foreground">18 FIM Club</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Tentang;
