'use client';

import { useState } from 'react';

const projects = [
  {
    title: 'Polymarket Bot',
    description: 'Bot automatizado con Python y LLMs. Alertas en tiempo real vía Telegram.',
    tags: ['Python', 'Telegram API', 'LLMs'],
    link: 'https://github.com/nachopalmeri/polymarket-bot',
    size: 'large'
  },
  {
    title: 'FulboTracker Pro',
    description: 'Dashboard de estadísticas de fútbol amateur con cálculo de costos.',
    tags: ['Next.js', 'Vercel', 'Tailwind'],
    link: 'https://fulbotracker.vercel.app/',
    size: 'medium'
  },
  {
    title: 'Dashboard Franquiciados',
    description: 'Sistema integral: control de stock, plan de compra, turnos de empleados.',
    tags: ['Python', 'API', 'Dashboard'],
    link: '#',
    size: 'medium'
  },
  {
    title: 'DApp Blockchain',
    description: 'Aplicación descentralizada en Base Network para registros inmutables.',
    tags: ['Solidity', 'Web3', 'Base'],
    link: '#',
    size: 'small'
  },
  {
    title: 'Comida de Barrio',
    description: 'E-commerce con carrito de compras, favoritos y diseño responsivo.',
    tags: ['Bootstrap', 'JavaScript', 'LocalStorage'],
    link: 'https://comidadebarrio.vercel.app/',
    size: 'small'
  },
  {
    title: 'Fútbol Tracker',
    description: 'Seguimiento de estadísticas de fútbol amateur.',
    tags: ['HTML/CSS', 'JavaScript'],
    link: '#',
    size: 'small'
  }
];

const experience = [
  {
    company: 'Grido | Atención y Gestión',
    period: '2023 — Presente',
    role: 'Atención al cliente',
    description: 'Gestión de caja, control de stock mediante Excel, resolución de problemas operativos.'
  },
  {
    company: 'Editor Multimedia & Content Manager',
    period: '2021 — 2023',
    role: 'Freelance',
    description: 'Edición en DaVinci Resolve para YouTube y TikTok.'
  }
];

const skills = [
  { category: 'Languages', items: ['Python', 'JavaScript', 'TypeScript', 'SQL', 'Java', 'Solidity'] },
  { category: 'Frameworks', items: ['Next.js', 'React', 'Tailwind', 'FastAPI'] },
  { category: 'Tools', items: ['Git', 'Linux', 'Docker', 'Vercel', 'Railway'] },
  { category: 'Soft Skills', items: ['Trabajo en equipo', 'Comunicación', 'Resolución de problemas'] }
];

const certifications = [
  { name: 'Red Hat System Administrator', icon: '🐧', desc: 'Linux • Bash • Administración' },
  { name: 'Claude Code in Action', icon: '🤖', desc: 'AI Tools • Desarrollo con IA' }
];

export default function Home() {
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['Bienvenido! Escribe "help" para ver comandos.']);
  const [terminalInput, setTerminalInput] = useState('');

  const commands: Record<string, string> = {
    help: 'Comandos disponibles: help, about, skills, contact, clear',
    about: 'Ignacio Palmeri - Estudiante de Gestión IT (UADE). Busco rol Trainee/Junior en Python, Web3 y datos.',
    skills: 'Python, JavaScript, Next.js, Solidity, SQL, Linux, Git',
    contact: 'Email: nachopalmeri@gmail.com | GitHub: @nachopalmeri | LinkedIn: Ignacio Palmeri'
  };

  const handleTerminal = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.toLowerCase().trim();
    let response = `Comando no encontrado: ${cmd}`;

    if (commands[cmd]) {
      response = commands[cmd];
    } else if (cmd === 'clear') {
      setTerminalOutput([]);
      setTerminalInput('');
      return;
    }

    setTerminalOutput([...terminalOutput, `> ${terminalInput}`, response]);
    setTerminalInput('');
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#EDEDED] font-sans">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        
        {/* Navbar */}
        <nav className="py-6 flex items-center justify-between border-b border-[#1F1F1F]">
          <span className="text-sm font-medium text-[#EDEDED]">IP</span>
          <div className="flex items-center gap-6">
            <a href="#proyectos" className="text-sm text-[#666666] hover:text-[#EDEDED] transition-colors duration-200">Proyectos</a>
            <a href="#experiencia" className="text-sm text-[#666666] hover:text-[#EDEDED] transition-colors duration-200">Experiencia</a>
            <a href="#stack" className="text-sm text-[#666666] hover:text-[#EDEDED] transition-colors duration-200">Stack</a>
            <a href="#contacto" className="text-sm text-[#666666] hover:text-[#EDEDED] transition-colors duration-200">Contacto</a>
          </div>
        </nav>

        {/* Hero */}
        <section className="py-20 md:py-28">
          <p className="text-[#333333] text-xs uppercase tracking-widest mb-4">Backend Developer</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6">
            Ignacio
            <br />
            Palmeri
          </h1>
          <p className="text-[#666666] text-lg max-w-lg leading-relaxed mb-8">
            Estudiante de Gestión IT (UADE). Busco mi primera oportunidad como Trainee/Junior en Python, Web3 y análisis de datos.
          </p>
          <div className="flex gap-4">
            <a href="#proyectos" className="inline-flex px-6 py-3 bg-[#EDEDED] text-black font-medium rounded-full hover:bg-white transition-colors">
              Ver proyectos
            </a>
            <a href="#contacto" className="inline-flex px-6 py-3 border border-[#333333] text-[#EDEDED] font-medium rounded-full hover:border-[#EDEDED] transition-colors">
              Contactarme
            </a>
          </div>
        </section>

        {/* Terminal */}
        <section className="py-8 mb-8">
          <div className="bg-[#0A0A0A] rounded-xl border border-[#1F1F1F] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1F1F1F]">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-2 text-xs text-[#333333]">terminal</span>
            </div>
            <div className="p-4 font-mono text-sm">
              <div className="text-[#22c55e] mb-2">guest@ignacio:~$</div>
              <div className="text-[#666666] mb-4">
                {terminalOutput.map((line, i) => (
                  <div key={i} className={line.startsWith('>') ? 'text-[#EDEDED]' : ''}>{line}</div>
                ))}
              </div>
              <form onSubmit={handleTerminal} className="flex items-center gap-2">
                <span className="text-[#22c55e]">$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="Escribe un comando..."
                  className="flex-1 bg-transparent border-none outline-none text-[#EDEDED] placeholder-[#333333]"
                />
              </form>
            </div>
          </div>
        </section>

        {/* Proyectos */}
        <section id="proyectos" className="py-16">
          <h2 className="text-xs uppercase tracking-widest text-[#333333] mb-8">Proyectos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, i) => (
              <a
                key={i}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 bg-[#0A0A0A] rounded-xl border border-[#1F1F1F] hover:border-[#333333] transition-all duration-300 hover:-translate-y-1"
              >
                <h3 className="text-lg font-bold mb-2 text-[#EDEDED]">{project.title}</h3>
                <p className="text-[#666666] text-sm mb-4 leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag, j) => (
                    <span key={j} className="px-2 py-0.5 text-[10px] text-[#666666] bg-[#141414] rounded">{tag}</span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Experiencia */}
        <section id="experiencia" className="py-16 border-t border-[#1F1F1F]">
          <h2 className="text-xs uppercase tracking-widest text-[#333333] mb-8">Experiencia</h2>
          
          <div className="space-y-8">
            {experience.map((exp, i) => (
              <div key={i} className="flex flex-col md:flex-row md:gap-8">
                <div className="md:w-48 text-[#333333] text-sm">{exp.period}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#EDEDED]">{exp.company}</h3>
                  <p className="text-[#666666] text-sm mb-2">{exp.role}</p>
                  <p className="text-[#666666] text-sm">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stack */}
        <section id="stack" className="py-16 border-t border-[#1F1F1F]">
          <h2 className="text-xs uppercase tracking-widest text-[#333333] mb-6">Tech Stack</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {skills.map((skill, i) => (
              <div key={i}>
                <h3 className="text-xs text-[#333333] mb-3">{skill.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skill.items.map((item, j) => (
                    <span key={j} className="px-3 py-1.5 text-xs text-[#666666] bg-[#0A0A0A] rounded-full border border-[#1F1F1F]">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certificaciones */}
        <section className="py-16 border-t border-[#1F1F1F]">
          <h2 className="text-xs uppercase tracking-widest text-[#333333] mb-6">Certificaciones</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certifications.map((cert, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-[#0A0A0A] rounded-xl border border-[#1F1F1F]">
                <span className="text-3xl">{cert.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-[#EDEDED]">{cert.name}</h3>
                  <p className="text-xs text-[#666666]">{cert.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contacto */}
        <section id="contacto" className="py-16 border-t border-[#1F1F1F]">
          <h2 className="text-xs uppercase tracking-widest text-[#333333] mb-6">Contacto</h2>
          
          <p className="text-[#666666] mb-8 max-w-md">
            Estoy buscando mi primera oportunidad como Trainee/Junior en desarrollo, Python, Web3 o gestión de datos.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex gap-6">
              <a href="mailto:nachopalmeri@gmail.com" className="text-sm text-[#666666] hover:text-[#EDEDED] transition-colors">Email</a>
              <a href="https://github.com/nachopalmeri" target="_blank" rel="noopener noreferrer" className="text-sm text-[#666666] hover:text-[#EDEDED] transition-colors">GitHub</a>
              <a href="https://www.linkedin.com/in/ignacio-palmeri-64035b378/" target="_blank" rel="noopener noreferrer" className="text-sm text-[#666666] hover:text-[#EDEDED] transition-colors">LinkedIn</a>
            </div>
            <a href="mailto:nachopalmeri@gmail.com" className="inline-flex items-center gap-2 text-[#EDEDED] hover:text-white text-sm mt-2 group">
              <span>Hablemos</span>
              <span className="group-hover:translate-x-1 transition-transform duration-200">-&gt;</span>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-[#1F1F1F] text-center">
          <p className="text-[#333333] text-xs">© 2026 Ignacio Palmeri</p>
        </footer>

      </div>
    </div>
  );
}
