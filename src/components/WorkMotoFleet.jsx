import { Shield, Zap, Package, Clock, ChevronRight } from 'lucide-react';
import './WorkMotoFleet.css';

// ─────────────────────────────────────────────────────────────────
// AGREGA TUS FOTOS AQUÍ
// Coloca los archivos PNG en la carpeta: /public/trabajo/
// Nombra los archivos: trabajo-1.png, trabajo-2.png, etc.
// Puedes agregar o quitar elementos del array workImages.
// ─────────────────────────────────────────────────────────────────
const workImages = [
  '/trabajo/trabajo-1.png',
  '/trabajo/trabajo-2.png',
  '/trabajo/trabajo-3.png',
  '/trabajo/trabajo-4.png',
];

const services = [
  {
    icon: <Shield size={32} />,
    title: 'Mantenimiento Preventivo',
    description:
      'Programas de servicio periódico diseñados para flotas que no pueden parar. Revisión integral para maximizar la vida útil de cada unidad.',
    items: ['Cambios de aceite programados', 'Revisión de frenos y cadena', 'Diagnóstico eléctrico completo'],
  },
  {
    icon: <Zap size={32} />,
    title: 'Reparación Express',
    description:
      'Sabemos que cada hora fuera de servicio cuesta. Atendemos tu unidad con prioridad para minimizar el tiempo de inactividad.',
    items: ['Servicio prioritario para flota', 'Diagnóstico en el día', 'Repuestos disponibles en stock'],
  },
  {
    icon: <Package size={32} />,
    title: 'Insumos de Calidad',
    description:
      'Utilizamos únicamente materiales originales y de primera calidad para garantizar la durabilidad y rendimiento de tu moto de trabajo.',
    items: ['Refacciones originales', 'Aceites y lubricantes certificados', 'Componentes de marcas reconocidas'],
  },
];

function WorkMotoFleet() {
  return (
    <section className="work-fleet">
      {/* Fondo industrial */}
      <div className="work-fleet__bg" aria-hidden="true">
        <div className="work-fleet__grid"></div>
        <div className="work-fleet__orb work-fleet__orb--1"></div>
        <div className="work-fleet__orb work-fleet__orb--2"></div>
        {/* Motos decorativas de fondo */}
        <img src="/trabajo/trabajo-1.png" className="work-fleet__moto work-fleet__moto--1" aria-hidden="true" alt="" loading="lazy" />
        <img src="/trabajo/trabajo-2.png" className="work-fleet__moto work-fleet__moto--2" aria-hidden="true" alt="" loading="lazy" />
        <img src="/trabajo/trabajo-3.png" className="work-fleet__moto work-fleet__moto--3" aria-hidden="true" alt="" loading="lazy" />
        <img src="/trabajo/trabajo-4.png" className="work-fleet__moto work-fleet__moto--4" aria-hidden="true" alt="" loading="lazy" />
      </div>

      <div className="container work-fleet__container">

        {/* Header */}
        <div className="work-fleet__header">
          <span className="work-fleet__eyebrow">
            <Clock size={13} /> Servicio Profesional · Flota de Trabajo
          </span>
          <h2 className="work-fleet__title">
            MOTOS QUE<br />
            <span className="work-fleet__title--accent">TRABAJAN DURO</span>
          </h2>
          <p className="work-fleet__subtitle">
            Soluciones de mantenimiento y reparación para unidades de reparto,
            delivery y servicio profesional que necesitan estar siempre en carretera.
          </p>
        </div>

        {/* Servicios */}
        <div className="work-fleet__services">
          {services.map((s, i) => (
            <div className="work-fleet__card" key={i}>
              <div className="work-fleet__card-icon">{s.icon}</div>
              <h3 className="work-fleet__card-title">{s.title}</h3>
              <p className="work-fleet__card-desc">{s.description}</p>
              <ul className="work-fleet__card-list">
                {s.items.map((item, j) => (
                  <li key={j}>
                    <ChevronRight size={14} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="work-fleet__cta-wrap">
          <a
            href="https://wa.me/529516512065?text=Hola,%20tengo%20una%20moto%20de%20trabajo%20y%20necesito%20servicio"
            target="_blank"
            rel="noopener noreferrer"
            className="work-fleet__cta"
          >
            Solicitar servicio para mi flota
            <ChevronRight size={18} />
          </a>
        </div>

      </div>
    </section>
  );
}

export default WorkMotoFleet;
