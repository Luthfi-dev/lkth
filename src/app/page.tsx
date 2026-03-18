
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gift, Zap, Shield, Sparkles, Heart } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-accent p-2 rounded-xl">
            <Gift className="text-white w-6 h-6" />
          </div>
          <span className="font-black text-2xl text-accent tracking-tighter">LuckyTHR</span>
        </div>
        <Link href="/login">
          <Button variant="ghost" className="font-semibold">Login Admin</Button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12 sm:py-20 flex flex-col items-center text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-primary/20 text-accent px-4 py-2 rounded-full font-bold text-sm animate-float">
          <Sparkles className="w-4 h-4" />
          <span>Baru! Bagi-bagi THR makin seru</span>
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-black text-foreground tracking-tight leading-none max-w-4xl">
          Bagikan Kebahagiaan <br />
          <span className="text-accent">Lewat Roda Keberuntungan</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
          Platform interaktif untuk berbagi THR kepada keluarga, teman, atau komunitas dengan cara yang seru dan transparan.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
          <Link href="/login">
            <Button className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 rounded-2xl">
              Buat Event THR Sekarang
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg font-bold border-2 rounded-2xl">
              Lihat Fitur
            </Button>
          </Link>
        </div>

        <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl mt-12 border-8 border-white">
          <Image 
            src="https://picsum.photos/seed/lucky-thr/1200/800" 
            alt="Dashboard Preview" 
            fill 
            className="object-cover"
            data-ai-hint="celebration group"
          />
        </div>
      </main>

      {/* Features */}
      <section id="features" className="bg-white py-20 px-4">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black">Kenapa Pakai LuckyTHR?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Kami menyediakan tools lengkap agar event bagi-bagi THR kamu berjalan lancar dan seru.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-8 h-8" />}
              title="Cepat & Mudah"
              description="Hanya butuh 2 menit untuk membuat event dan menyebarkan link ke grup WA."
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8" />}
              title="Anti-Cheat"
              description="Sistem pengunci IP dan perangkat memastikan setiap orang hanya bisa memutar sekali."
            />
            <FeatureCard 
              icon={<Gift className="w-8 h-8" />}
              title="Custom Nominal"
              description="Atur sendiri nominal THR yang tersedia, mulai dari receh sampai jutaan!"
            />
          </div>
        </div>
      </section>

      <footer className="bg-background border-t py-12 text-center text-muted-foreground text-sm">
        <div className="flex flex-col items-center gap-4">
           <p>© 2024 LuckyTHR Engine. Rayakan hari raya dengan sukacita.</p>
           <div className="flex items-center gap-2 font-bold text-slate-800">
             <span>by</span>
             <Link href="https://maudigi.com" target="_blank" className="text-accent hover:underline flex items-center gap-1">
               maudigi.com <Heart className="w-3 h-3 fill-accent" />
             </Link>
           </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-background border border-border/50 space-y-4 hover:shadow-xl transition-shadow">
      <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center text-accent">
        {icon}
      </div>
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
