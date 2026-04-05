import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import './NaszeRealizacje.css'

const projects = [
  {
    id: 1,
    title: 'Montaż drzwi',
    desc: 'Drzwi wypadły i wymagały ponownego montażu – drzwi wewnętrzne. Poniżej znajdują się dwa zdjęcia: przed naprawą i po niej, pokazujące problem oraz zastosowane rozwiązanie. Montaż został wykonany dokładnie, aby drzwi działały poprawnie i bezpiecznie.',
    time: '4 godziny',
    imageBefore: '/images/project1-after.jpg',
    imageAfter: '/images/project1-before.jpg'
  },
  {
    id: 2,
    title: 'Montaż szafy',
    desc: 'Profesjonalny montaż szafy z IKEA. Szafa zamontowana stabilnie i zgodnie z instrukcją producenta, gotowa do użytkowania.',
    time: '2 godziny',
    image: '/images/project2-wardrobe.jpg'
  },
  {
    id: 3,
    title: 'Montaż listew przypodłogowych',
    desc: 'Profesjonalny montaż listew przypodłogowych – estetycznie i stabilnie dopasowane do wnętrza. Praca wykonana starannie, z dbałością o szczegóły, gwarantując trwały i elegancki efekt.',
    time: '12 godzin',
    images: ['/images/project3-baseboard-1.jpg', '/images/project3-baseboard-2.jpg', '/images/project3-baseboard-3.jpg']
  }
]

function NaszeRealizacje() {
  const [expandedId, setExpandedId] = useState(null)

  return (
    <div className="realizacje">
      {/* ─── HERO ─── */}
      <section className="realizacje__hero">
        <Link to="/" className="realizacje__back">
          <ArrowLeft size={24} />
        </Link>
        <h1>Nasze Realizacje</h1>
        <p>Zawsze pracujemy na najwyższym poziomie i z pełnym zaangażowaniem</p>
      </section>

      {/* ─── PROJECTS GRID ─── */}
      <section className="realizacje__container">
        <div className="realizacje__grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              {(project.imageBefore || project.imageAfter) && (
                <div className="project-card__images">
                  {project.imageBefore && (
                    <div className="project-card__image">
                      <img src={project.imageBefore} alt={`${project.title} - przed`} onError={e => { e.target.style.display = 'none' }} />
                      <span className="project-card__label">Przed</span>
                    </div>
                  )}
                  {project.imageAfter && (
                    <div className="project-card__image">
                      <img src={project.imageAfter} alt={`${project.title} - po`} onError={e => { e.target.style.display = 'none' }} />
                      <span className="project-card__label">Po</span>
                    </div>
                  )}
                </div>
              )}
              {project.images && (
                <div className="project-card__gallery">
                  {project.images.map((img, idx) => (
                    <div key={idx} className="project-card__image">
                      <img src={img} alt={`${project.title} - ${idx + 1}`} onError={e => { e.target.style.display = 'none' }} />
                    </div>
                  ))}
                </div>
              )}
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
