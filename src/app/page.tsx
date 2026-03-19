
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gift, Zap, Shield, Sparkles, Heart, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { getData } from '@/lib/storage';

export default async function Home() {
  const settings = await getData('settings');
  const homepage = settings?.homepage || {
    hero: {
      title: "Bagikan Kebahagiaan Lewat Roda Keberuntungan",
      description: "Platform interaktif untuk berbagi THR kepada keluarga, teman, atau komunitas dengan cara yang seru dan transparan.",
      imageUrl: "https://picsum.photos/seed/lucky-thr/1200/800"
    },
    features: [
      { id: "1", title: "Cepat & Mudah", description: "Hanya butuh 2 menit untuk membuat event dan menyebarkan link ke grup WA.", icon: "Zap" },
      { id: "2", title: "Anti-Cheat Berbasis IP", description: "Sistem pengunci IP memastikan setiap orang hanya bisa memutar sekali meskipun ganti browser.", icon: "Shield" },
      { id: "3", title: "Custom Nominal", description: "Atur sendiri nominal THR yang tersedia, mulai dari receh sampai jutaan!", icon: "Gift" }
    ],
    footer: {
      copyright: "© 2026 LuckyTHR. Rayakan hari raya dengan sukacita.",
      linkText: "maudigi.com",
      linkUrl: "https://maudigi.com"
    }
  };

  const IconMap: any = {
    Zap: <Zap className="w-8 h-8" />,
    Shield: <Shield className="w-8 h-8" />,
    Gift: <Gift className="w-8 h-8" />,
    Sparkles: <Sparkles className="w-8 h-8" />,
    Heart: <Heart className="w-8 h-8" />
  };

  return (
    <div className="min-h-screen flex flex-col bg-background scroll-smooth">
      {/* Header */}
      <header className="p-4 sm:p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-accent p-2 rounded-xl">
            <Gift className="text-white w-6 h-6" />
          </div>
          <span className="font-black text-2xl text-accent tracking-tighter">{settings?.siteTitle || 'LuckyTHR'}</span>
        </div>
        <Link href="/login">
          <Button variant="ghost" className="font-bold text-slate-600">Login</Button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12 sm:py-20 flex flex-col items-center text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-primary/20 text-accent px-4 py-2 rounded-full font-bold text-sm animate-float">
          <Sparkles className="w-4 h-4" />
          <span>Bagi-bagi THR makin seru & transparan</span>
        </div>
        
        <h1 className="text-4xl sm:text-7xl font-black text-foreground tracking-tight leading-tight max-w-5xl whitespace-pre-line">
          {homepage.hero.title}
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl font-medium">
          {homepage.hero.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
          <Link href="/login">
            <Button className="w-full sm:w-auto h-14 px-10 text-lg font-black bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 rounded-2xl">
              Buat Event Sekarang
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" className="w-full sm:w-auto h-14 px-8 text-md font-black border-2 border-slate-200 rounded-2xl gap-2 text-slate-800 hover:bg-slate-50">
              Kenapa LuckyTHR? <ChevronDown className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl mt-12 border-8 border-white bg-slate-100">
          <Image 
            src={homepage.hero.imageUrl} 
            alt="Dashboard Preview" 
            fill 
            className="object-cover"
            priority
          />
        </div>
      </main>

      {/* Features */}
      <section id="features" className="bg-white py-24 px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black">Fitur Unggulan {settings?.siteTitle || 'LuckyTHR'}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Kami menyediakan tools lengkap agar event bagi-bagi THR kamu berjalan lancar, aman, dan berkesan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {homepage.features.map((feature: any) => (
              <FeatureCard 
                key={feature.id}
                icon={IconMap[feature.icon] || <Zap className="w-8 h-8" />}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-16 text-center text-muted-foreground text-sm">
        <div className="flex flex-col items-center gap-6">
           <p className="font-medium text-slate-500">{homepage.footer.copyright}</p>
           <div className="flex items-center gap-2 font-black text-slate-800 text-base">
             <span>developed by</span>
             <Link href={homepage.footer.linkUrl} target="_blank" className="text-accent hover:underline flex items-center gap-1.5">
               {homepage.footer.linkText} <Heart className="w-4 h-4 fill-accent" />
             </Link>
           </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-10 rounded-[2.5rem] bg-slate-50 border-none space-y-5 hover:shadow-2xl transition-all duration-500 group">
      <div className="bg-white w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-accent shadow-sm group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-black tracking-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed font-medium">{description}</p>
    </div>
  );
}
