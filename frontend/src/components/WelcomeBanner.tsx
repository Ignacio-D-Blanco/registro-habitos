interface WelcomeBannerProps {
  userName: string;
  activeCount: number;
  completedCount: number;
}

export default function WelcomeBanner({ userName, activeCount, completedCount }: WelcomeBannerProps) {
  return (
    <section className="bg-surface/30 border border-surface rounded-3xl p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row justify-between gap-8">
      <div className="space-y-2 z-10 max-w-xl">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
          Buenos días, {userName} 👋
        </h1>
        <p className="text-textSecondary text-base leading-relaxed">
          Hoy estás construyendo tu mejor versión. Revisa tus registros diarios, mantén la disciplina y alcanza tus objetivos.
        </p>
      </div>
      
      <div className="flex items-center gap-6 bg-[#0F0F13] border border-surface rounded-2xl p-6 self-stretch md:self-auto justify-around z-10 min-w-[240px]">
        <div className="flex flex-col items-center">
          <span className="text-3xl font-black text-[#8A2BE2]">{activeCount}</span>
          <span className="text-[10px] text-textSecondary font-bold uppercase tracking-wider mt-0.5">Activos</span>
        </div>
        <div className="w-px bg-surface h-10"></div>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-black text-[#B030B0]">{completedCount}</span>
          <span className="text-[10px] text-textSecondary font-bold uppercase tracking-wider mt-0.5">Completados</span>
        </div>
      </div>
      
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#8A2BE2]/10 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
}