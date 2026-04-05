import { useState } from 'react'
import './NaszeRealizacje.css'

const projects = [
  {
    id: 1,
    title: 'Montaż paneli w mieszkaniu 60m²',
    desc: 'Kompleksowy montaż paneli laminowanych i listew w całym mieszkaniu.',
    time: '2 dni',
    image: '/images/project1.jpg'
  },
  {
    id: 2,
    title: 'Montaż szafy pięciodrzwiowej',
    desc: 'Montaż meblościanki IKEA z regulacją i dopasowaniem do wnęki.',
    time: '1 dzień',
    image: '/images/project2.jpg'
  },
  {
    id: 3,
    title: 'Montaż TV na ścianie z projektorem',
    desc: 'Zawieszenie TV, montaż soundbara i systemu projekcyjnego w salonie.',
    time: '1 dzień',
    image: '/images/project3.jpg'
  }
]

function NaszeRealizacje() {
  const [expandedId, setExpandedId] = useState(null)

  return (
    <div className="realizacje">
      {/* ─── HERO ─── */}
      <section className="realizacje__hero">
        <h1>Nasze Realizacje</h1>
        <p>Zawsze pracujemy na najwyższym poziomie i z pełnym zaangażowaniem</p>
      </section>

      {/* ─── PROJECTS GRID ─── */}
      <section className="realizacje__container">
        <div className="realizacje__grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              {project.image && (
                <div className="project-card__image">
                  <img src={project.image} alt={project.title} onError={e => { e.target.style.display = 'none' }} />
                </div>
              )}
              
              <div className="project-card__content">
                <h3>{project.title}</h3>
                <p className="project-card__desc">{project.desc}</p>
                
                <button
                  className="project-card__btn"
                  onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
                >
                  {expandedId === project.id ? 'Ukryj szczegóły' : 'Pokaż szczegóły'}
                </button>

                {expandedId === project.id && (
                  <div className="project-card__details">
                    <div className="project-meta">
                      <span className="project-meta__time">⏱ Czas: {project.time}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default NaszeRealizacje
