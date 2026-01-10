import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import { Target, Compass, User, Users, Briefcase, Building2, Heart, Shield, Star, Handshake, Scale, UserCheck, MessageSquare, BookOpen, Brain, Clipboard, Network } from "lucide-react";

const Tentang = () => {
  const pilarKarakter = [
    { icon: Heart, name: "Cinta Kasih", desc: "Mencintai sesama dan berbagi kebaikan" },
    { icon: Shield, name: "Integritas", desc: "Konsisten dalam nilai dan tindakan" },
    { icon: Star, name: "Kebersahajaan", desc: "Sederhana namun bermakna" },
    { icon: Target, name: "Totalitas", desc: "Memberikan yang terbaik dalam segala hal" },
    { icon: Handshake, name: "Solidaritas", desc: "Bersatu dan saling mendukung" },
    { icon: Scale, name: "Keadilan", desc: "Menegakkan kebenaran dan kesetaraan" },
    { icon: UserCheck, name: "Keteladanan", desc: "Menjadi contoh yang baik bagi sesama" },
  ];

  const pilarKepemimpinan = [
    { icon: Users, name: "Mengenal Diri", desc: "Memahami kekuatan dan kelemahan diri" },
    { icon: MessageSquare, name: "Komunikasi", desc: "Menyampaikan pesan dengan efektif" },
    { icon: Heart, name: "Akhlak", desc: "Berperilaku mulia dalam setiap tindakan" },
    { icon: BookOpen, name: "Kekuatan Belajar", desc: "Terus mengembangkan ilmu dan wawasan" },
    { icon: Brain, name: "Proses Pengambilan Keputusan", desc: "Membuat keputusan yang bijak" },
    { icon: Clipboard, name: "Manajerial", desc: "Mengelola sumber daya dengan efisien" },
    { icon: Network, name: "Pengorganisasian", desc: "Membangun tim dan sistem yang solid" },
  ];

  const sejarah = [
    { year: "2003", event: "Forum Indonesia Muda didirikan oleh sepasang suami istri Elmir Amien dan Tatty Elmir, yang disupport pakar leadership Buchori Nasution, dan rekan-rekannya sesama jurnalis di Jakarta News FM. Pelatihan pertama di Graha Pemuda Cibodas Jakarta." },
    { year: "2004", event: "FIM ke-2 kegiatan dipindahkan ke Wiladatika Jakarta, agar mudah diakses para mentor dan undangan." },
    { year: "2005", event: "Pelatihan FIM dibarengi dengan pemberangkatan relawan FIM ke Nias saat bencana gempa besar bekerjasama dengan TNI AL." },
    { year: "2007", event: "FIM telah ekspansi di 10 kota besar di Indonesia dan dibentuknya Koordinator Nasional." },
    { year: "2010", event: "Transformasi kurikulum program kaderisasi kepemimpinan FIM (FIM 9) dan peluncuran FIM tematik Rescue bekerjasama dengan MER-C." },
    { year: "2015", event: "Dibentuknya FIM Club untuk basis keminatan alumni FIM di bidang-bidang tertentu." },
    { year: "2018", event: "Dilaksanakan pelatihan FIM di 5 wilayah sekaligus (FIM 20) untuk melakukan ekspansi kaderisasi kepemimpinan di setiap wilayah di Indonesia." },
    { year: "2023", event: "Momentum 2 dekade FIM, telah menghasilkan 30 lebih angkatan pelatihan FIM, lebih dari 60 regional, dan hampir 4000 alumni." },
    { year: "2025", event: "Perdana pelatihan FIM tematik Kebijakan Publik bekerjasama dengan Nalar Institute untuk menghasilkan ahli kebijakan publik di level intermediate & advance." },
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
    { name: "Chairul Sinaga" },
    { name: "Aisyah Hasim" },
    { name: "Arian Handika" },
    { name: "Dita Amallya" },
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
      <SEO 
        title="Tentang FIM" 
        description="Sejarah, visi misi, struktur organisasi, dan nilai-nilai Forum Indonesia Muda. Lebih dari dua dekade membangun generasi muda Indonesia yang berkarakter dan berjiwa pemimpin sejak 2003."
      />
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

      {/* 7 Pilar Section - Full content on Tentang page */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">Nilai & Pilar FIM</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">Fondasi karakter dan kepemimpinan yang ditanamkan kepada setiap kader FIM</p>
          
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* 7 Pilar Karakter */}
            <div>
              <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3 text-center lg:text-left">7 Pilar Karakter FIM</h3>
              <p className="text-muted-foreground text-center lg:text-left mb-6 text-sm">Fondasi karakter yang ditanamkan kepada setiap kader FIM</p>
              <div className="space-y-3">
                {pilarKarakter.map((item, index) => (
                  <div key={item.name} className="bg-card rounded-lg p-4 shadow-md hover:shadow-lg transition-all flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7 Pilar Kepemimpinan */}
            <div>
              <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3 text-center lg:text-left">7 Pilar Kepemimpinan FIM</h3>
              <p className="text-muted-foreground text-center lg:text-left mb-6 text-sm">Prinsip kepemimpinan yang menjadi panduan alumni FIM</p>
              <div className="space-y-3">
                {pilarKepemimpinan.map((item, index) => (
                  <div key={item.name} className="bg-card rounded-lg p-4 shadow-md hover:shadow-lg transition-all flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="w-10 h-10 bg-supporting/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-supporting" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
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
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {item.year}
                  </div>
                  {index < sejarah.length - 1 && (
                    <div className="w-0.5 flex-1 bg-primary/30 mt-2" />
                  )}
                </div>
                <div className="flex-1 bg-card rounded-xl p-6 shadow-md">
                  <p className="text-foreground text-sm leading-relaxed">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Struktur Pengurus Section - Modern Design */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">
            Struktur Pengurus
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Organisasi yang menggerakkan Forum Indonesia Muda
          </p>

          {/* Struktur Yayasan */}
          <div className="max-w-6xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Struktur Yayasan</h3>
            </div>
            
            {/* Modern Grid Layout for Yayasan */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {strukturYayasan.map((person, index) => (
                <div 
                  key={person.name} 
                  className={`bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all animate-fade-in ${
                    index < 2 ? 'lg:col-span-1 border-2 border-primary/20' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                      index < 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{person.name}</h4>
                      <p className={`text-sm ${index < 2 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        {person.position}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Struktur Pengurus FIM */}
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 bg-supporting/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-supporting" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Struktur Pengurus FIM</h3>
            </div>

            {/* BPH Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {bph.map((person, index) => (
                <div 
                  key={person.name}
                  className={`bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all animate-fade-in ${
                    index === 0 ? 'lg:col-span-4 bg-gradient-to-r from-primary/5 to-supporting/5 border-2 border-primary/20' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`flex ${index === 0 ? 'flex-row items-center' : 'flex-col items-center text-center'} gap-4`}>
                    <div className={`${index === 0 ? 'w-20 h-20' : 'w-16 h-16'} rounded-full flex items-center justify-center flex-shrink-0 ${
                      index === 0 ? 'bg-primary text-primary-foreground' : 'bg-supporting/20'
                    }`}>
                      <User className={index === 0 ? 'h-10 w-10' : 'h-8 w-8'} />
                    </div>
                    <div className={index === 0 ? '' : 'text-center'}>
                      <h4 className={`font-bold text-foreground ${index === 0 ? 'text-lg' : ''}`}>{person.name}</h4>
                      <p className={`text-sm ${index === 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        {person.position}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Biro Internal */}
            <div className="mb-8">
              <h4 className="text-center font-semibold text-foreground mb-4 flex items-center justify-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Biro Internal
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {biroInternal.map((person, index) => (
                  <div key={person.name} className="bg-muted rounded-xl p-4 text-center animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <h5 className="font-medium text-sm text-foreground">{person.name}</h5>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Kepala Divisi/Biro */}
            <div className="w-full">
              <h4 className="text-center font-semibold text-foreground mb-6">Kepala Divisi & Biro</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {divisi.map((person, index) => (
                  <div
                    key={person.name + person.position}
                    className="bg-card rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-border animate-fade-in"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-foreground text-sm">{person.name}</h5>
                        <p className="text-xs text-muted-foreground">{person.position}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="bg-gradient-to-r from-primary/5 to-supporting/5 rounded-2xl p-6 text-center mt-12">
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
