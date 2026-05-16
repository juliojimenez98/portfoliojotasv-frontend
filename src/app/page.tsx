import Link from 'next/link';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function HomePage() {
  return (
    <>
      {/* ========== Navigation ========== */}
      <nav className="fixed top-0 left-0 right-0 z-40 glass-strong">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-lg font-bold gradient-text">
              JJ
            </Link>
            <div className="flex items-center gap-4 md:gap-6">
              <a href="#about" className="hidden sm:block text-sm text-foreground-muted hover:text-foreground transition-colors">
                Sobre Mí
              </a>
              <a href="#skills" className="hidden sm:block text-sm text-foreground-muted hover:text-foreground transition-colors">
                Skills
              </a>
              <a href="#projects" className="hidden sm:block text-sm text-foreground-muted hover:text-foreground transition-colors">
                Proyectos
              </a>
              <Link
                href="/login"
                className="text-sm px-4 py-2 rounded-lg bg-primary/10 text-primary-light border border-primary/20 hover:bg-primary/20 transition-all"
              >
                Apps
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* ========== Hero Section ========== */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 pt-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/8 rounded-full blur-[150px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[200px]" />
        </div>

        <div className="relative z-10 text-center max-w-3xl animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-sm mb-8">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Disponible para proyectos
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Hola, soy{' '}
            <span className="gradient-text">Julio</span>
          </h1>

          <p className="text-lg sm:text-xl text-foreground-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Desarrollador Full-Stack apasionado por crear experiencias digitales
            excepcionales con{' '}
            <span className="text-secondary">TypeScript</span>,{' '}
            <span className="text-primary-light">Next.js</span> y{' '}
            <span className="text-accent">Node.js</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all active:scale-[0.98]"
            >
              Ver Proyectos
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="#about"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border text-foreground-muted hover:text-foreground hover:border-border-hover transition-all"
            >
              Conóceme
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-foreground-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ========== About Section ========== */}
      <section id="about" className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Sobre <span className="gradient-text">Mí</span>
            </h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              Construyendo software robusto y escalable desde hace años.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {[
              {
                icon: '🚀',
                title: 'Desarrollo Full-Stack',
                description:
                  'Experiencia en frontend y backend, desde interfaces reactivas con Next.js hasta APIs robustas con Node.js y MongoDB.',
              },
              {
                icon: '🎨',
                title: 'UI/UX Moderno',
                description:
                  'Enfoque en diseño responsive mobile-first, micro-animaciones y experiencias de usuario intuitivas.',
              },
              {
                icon: '⚡',
                title: 'Rendimiento',
                description:
                  'Optimización constante: SSR, lazy loading, indexes en DB y arquitecturas que escalan.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group p-6 rounded-2xl bg-background-card border border-border hover:border-primary/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.08)] transition-all duration-300"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:gradient-text transition-all">
                  {item.title}
                </h3>
                <p className="text-sm text-foreground-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== Skills Section ========== */}
      <section id="skills" className="relative py-24 px-4 bg-background-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tech <span className="gradient-text">Stack</span>
            </h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              Las tecnologías que uso en mi día a día.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 stagger-children">
            {[
              { name: 'TypeScript', color: '#3178c6' },
              { name: 'Next.js', color: '#ffffff' },
              { name: 'React', color: '#61dafb' },
              { name: 'Node.js', color: '#339933' },
              { name: 'MongoDB', color: '#47a248' },
              { name: 'Tailwind', color: '#06b6d4' },
              { name: 'PostgreSQL', color: '#4169e1' },
              { name: 'Docker', color: '#2496ed' },
              { name: 'Git', color: '#f05032' },
              { name: 'Figma', color: '#f24e1e' },
              { name: 'AWS', color: '#ff9900' },
              { name: 'GraphQL', color: '#e10098' },
            ].map((skill) => (
              <div
                key={skill.name}
                className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-background-card border border-border hover:border-border-hover transition-all duration-300 cursor-default"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: `${skill.color}15`, color: skill.color }}
                >
                  {skill.name.charAt(0)}
                </div>
                <span className="text-xs font-medium text-foreground-muted group-hover:text-foreground transition-colors">
                  {skill.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== Projects Section ========== */}
      <section id="projects" className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Mis <span className="gradient-text">Proyectos</span>
            </h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              Aplicaciones y herramientas que he construido.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
            {/* Proyecto: App de Gastos */}
            <Link
              href="/app/gastos"
              className="group relative overflow-hidden rounded-2xl bg-background-card border border-border hover:border-primary/30 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-lg">
                    💰
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Control de Gastos</h3>
                    <p className="text-xs text-foreground-subtle">App financiera personal</p>
                  </div>
                </div>
                <p className="text-sm text-foreground-muted leading-relaxed mb-4">
                  Dashboard para gestionar cuentas, transacciones y suscripciones. Visualiza tus gastos mensuales y anuales con filtros interactivos.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Next.js', 'MongoDB', 'TypeScript'].map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary-light border border-primary/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>

            {/* Placeholder: Próximo proyecto */}
            <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/50 flex items-center justify-center min-h-[220px]">
              <div className="text-center p-6">
                <div className="text-4xl mb-3 opacity-30">🔮</div>
                <p className="text-sm text-foreground-subtle">Próximo proyecto...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Footer ========== */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-foreground-subtle">
            © {new Date().getFullYear()} Julio Jiménez. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-foreground-subtle hover:text-foreground transition-colors">
              GitHub
            </a>
            <a href="#" className="text-foreground-subtle hover:text-foreground transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
