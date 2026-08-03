import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Plasma from './Plasma';
import LogoLoop from './Loop';
import { Sparkles, ArrowRight, MessageSquare, Image as ImageIcon, Zap, Code, Shield, Activity, Cpu } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const FeatureCard = ({ icon: Icon, title, description, delay, className = "" }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 backdrop-blur-md hover:bg-white/10 transition-colors group relative overflow-hidden ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-white/60 leading-relaxed">
      {description}
    </p>
  </motion.div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const logos = [
    { node: <div className="flex items-center gap-2 text-white/60 text-lg font-medium"><Code className="w-5 h-5 text-purple-400" /> React</div>, ariaLabel: 'React' },
    { node: <div className="flex items-center gap-2 text-white/60 text-lg font-medium"><Zap className="w-5 h-5 text-yellow-400" /> Vite</div>, ariaLabel: 'Vite' },
    { node: <div className="flex items-center gap-2 text-white/60 text-lg font-medium"><Sparkles className="w-5 h-5 text-blue-400" /> TailwindCSS</div>, ariaLabel: 'TailwindCSS' },
    { node: <div className="flex items-center gap-2 text-white/60 text-lg font-medium"><Activity className="w-5 h-5 text-green-400" /> TypeScript</div>, ariaLabel: 'TypeScript' },
    { node: <div className="flex items-center gap-2 text-white/60 text-lg font-medium"><Cpu className="w-5 h-5 text-orange-400" /> Gemini AI</div>, ariaLabel: 'Gemini' },
    { node: <div className="flex items-center gap-2 text-white/60 text-lg font-medium"><Shield className="w-5 h-5 text-red-400" /> Firebase</div>, ariaLabel: 'Firebase' }
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-y-auto overflow-x-hidden bg-black text-white font-sans selection:bg-purple-500/30 scroll-smooth">
      {/* Background - Fixed so it covers the whole scrolling area */}
      <div className="fixed inset-0 z-0">
        <Plasma 
          color="#B497CF"
          speed={1}
          direction="forward"
          scale={1}
          opacity={1}
          mouseInteractive={false}
          renderScale={0.25}
          maxDpr={1}
          targetFps={60}
          iterations={40}
        />
        {/* Subtle overlay gradient to blend content */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-black/60 to-black z-10" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <img src="/logo-app.jpg" alt="XhzellAI Logo" className="w-8 h-8 rounded-full object-cover border border-white/20" />
            <span className="font-semibold text-lg tracking-tight">XhzellAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
            <a href="#features" className="hover:text-white transition-colors">Fitur</a>
            <a href="#preview" className="hover:text-white transition-colors">Preview</a>
          </nav>
          <button 
            onClick={onGetStarted}
            className="bg-white text-black px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/90 transition-transform active:scale-95"
          >
            Masuk
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 text-center pt-20">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="flex flex-col items-center"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">Baru</span>
            <span className="text-white/90">XhzellAI v2.5.0 Dirilis</span>
            <Sparkles className="w-3 h-3 text-purple-400" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
            style={{ textWrap: 'balance' }}
          >
            Asisten Cerdas Tanpa Batas Ruang & Waktu
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl"
            style={{ textWrap: 'balance' }}
          >
            Rasakan pengalaman chat cerdas, animasi interaktif, dan generasi gambar memukau dalam satu platform elegan yang didesain oleh M Fariz Alfauzi.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-20"
          >
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black px-8 py-3.5 rounded-2xl font-semibold hover:bg-white/90 transition-all active:scale-95 group shadow-[0_0_40px_rgba(255,255,255,0.15)]"
            >
              Mulai Sekarang
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <a 
              href="#features"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-3.5 rounded-2xl font-semibold hover:bg-white/10 transition-all active:scale-95 backdrop-blur-md"
            >
              Pelajari Fitur
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="w-full max-w-4xl mx-auto overflow-hidden relative"
            style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
          >
            <p className="text-sm text-white/40 mb-6 uppercase tracking-widest font-semibold">Ditenagai oleh teknologi modern</p>
            <LogoLoop 
              logos={logos}
              speed={40}
              direction="left"
              gap={32}
              logoHeight={30}
              pauseOnHover={true}
              scaleOnHover={false}
            />
          </motion.div>
        </motion.div>

        {/* Decorative Floating Elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-10 md:left-32 top-1/4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl z-0"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-10 md:right-32 top-1/3 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl z-0"
        />
      </main>

      {/* Stats Section */}
      <section className="relative z-20 border-y border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-y-0 gap-x-4 md:gap-8 divide-x-0 md:divide-x divide-white/5">
            {[
              { label: "Uptime", value: "99.9%" },
              { label: "Generasi Gambar", value: "< 2s" },
              { label: "Model Cerdas", value: "Gen 3" },
              { label: "Keamanan", value: "AES-256" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center px-2 md:px-4"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 md:mb-2">{stat.value}</div>
                <div className="text-white/50 text-xs sm:text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="features" className="relative z-20 max-w-7xl mx-auto px-6 py-24 min-h-screen flex flex-col justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Kemampuan Tanpa Batas</h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">Dirancang untuk kecepatan, keindahan, dan produktivitas maksimal.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <FeatureCard 
            icon={MessageSquare} 
            title="Chat Interaktif & Pintar" 
            description="Dilengkapi model AI mutakhir (Xspace Models) untuk merespons semua pertanyaan Anda dengan cepat, akurat, dan memiliki memori kontekstual super."
            delay={0.1}
            className="md:col-span-2"
          />
          <FeatureCard 
            icon={ImageIcon} 
            title="Generasi Gambar" 
            description="Ciptakan mahakarya visual memukau hanya dengan deskripsi teks melalui integrasi Gemini 2.5 Flash Image resolusi tinggi."
            delay={0.2}
          />
          <FeatureCard 
            icon={Code} 
            title="Asisten Koding Ahli" 
            description="Mampu menulis, melakukan debug, dan memberikan arsitektur software kompleks dengan kode yang terstruktur elegan."
            delay={0.3}
          />
          <FeatureCard 
            icon={Zap} 
            title="UI/UX Optimal & Mulus" 
            description="Animasi mulus dengan framer-motion, desain sangat responsif untuk mobile maupun desktop."
            delay={0.4}
          />
          <FeatureCard 
            icon={Shield} 
            title="Aman & Terjamin" 
            description="Data Anda dilindungi oleh Firebase Authentication dan enkripsi modern pada setiap interaksi."
            delay={0.5}
            className="md:col-span-2 lg:col-span-1"
          />
        </div>
        
        {/* Chat Mockup Preview */}
        <motion.div 
          id="preview"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mt-24 relative group"
        >
           <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-[2.5rem] blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
           <div className="relative bg-black/80 border border-white/10 rounded-3xl md:rounded-[2rem] p-3 md:p-8 backdrop-blur-xl shadow-2xl">
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                 <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-white/5">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <div className="mx-auto text-xs font-medium text-white/40 flex items-center gap-2">
                      <Cpu className="w-3 h-3" />
                      XhzellAI Terminal Preview
                    </div>
                 </div>
                 <div className="p-6 md:p-8 space-y-6">
                    {/* User message */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                      className="flex justify-end"
                    >
                       <div className="bg-white/10 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] text-sm shadow-sm border border-white/5">
                          Tolong buatkan visualisasi aurora borealis di atas pegunungan salju
                       </div>
                    </motion.div>
                    {/* AI message */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.9 }}
                      className="flex justify-start"
                    >
                       <div className="flex gap-3 max-w-[90%] md:max-w-[80%]">
                          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/20">
                             <img src="/logo-app.jpg" alt="AI" className="w-full h-full object-cover" />
                          </div>
                          <div className="bg-transparent text-white/90 px-2 py-1 text-sm leading-relaxed space-y-4">
                             <p>Tentu, berikut adalah generasi gambar aurora borealis yang Anda minta:</p>
                             <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-teal-900/50 border border-white/10 flex items-center justify-center overflow-hidden relative group/img">
                                {/* Simulated image load */}
                                <motion.div 
                                  initial={{ opacity: 1 }}
                                  animate={{ opacity: 0.5 }}
                                  transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                                  className="absolute inset-0 bg-white/5"
                                />
                                <ImageIcon className="w-8 h-8 text-white/30" />
                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] text-white/60 border border-white/10">
                                  Generated by Gemini 2.5 Flash
                                </div>
                             </div>
                             <p className="text-white/60 italic text-xs">✨ Gambar berhasil dibuat dalam 1.8 detik.</p>
                          </div>
                       </div>
                    </motion.div>
                 </div>
              </div>
           </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative z-20 max-w-4xl mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Siap Memulai Perjalanan Anda?</h2>
          <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
            Bergabunglah sekarang dan rasakan sendiri kecerdasan asisten AI masa depan yang didesain untuk produktivitas Anda.
          </p>
          <button 
            onClick={onGetStarted}
            className="bg-white text-black px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/90 transition-transform active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            Mulai Chat Sekarang
          </button>
        </motion.div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-20 border-t border-white/5 bg-black/60 backdrop-blur-md py-8 text-center text-sm text-white/40">
        <p>© 2026 Xee.Rizz. all rights reversed.</p>
        <p className="mt-1 flex items-center justify-center gap-1">
          Ditenagai oleh Gemini Xspace <Activity className="w-3 h-3 text-purple-500" />
        </p>
      </footer>
    </div>
  );
};

