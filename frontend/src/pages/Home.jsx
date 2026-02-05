import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { Hammer, Wrench, Zap, Droplets, Trash2 } from 'lucide-react'
import { OrderModalContext } from '../contexts/OrderModalContext'
import './Home.css'

const services = [
  { title: 'Naprawy domowe', desc: 'Drobne poprawki, regulacje, naprawy',   icon: Hammer   },
  { title: 'Montaż',         desc: 'Meble, półki, lampy, karnisze',         icon: Wrench   },
  { title: 'Elektryka',      desc: 'Gniazdka, lampy, włączniki',            icon: Zap      },
  { title: 'Hydraulika',     desc: 'Kran, syfon, uszczelnienia',            icon: Droplets },
  { title: 'Wiercenie',      desc: 'Ściany, sufity, montaż na ścianie',     icon: Wrench   },
  { title: 'Sprzątanie domu', desc: 'Generalne czyszczenie wnętrz',         icon: Trash2   },
  { title: 'Porządki',       desc: 'Garaż, piwnica, ogród',                icon: Trash2   },
  { title: 'Prace blacharskie', desc: 'Obróbki, poprawki, drobne naprawy (bez dachów)', icon: Hammer },
]

function Home() {
  const [in_, setIn] = useState(false)
  const { openModal } = useContext(OrderModalContext)

  useEffect(() => {
    const t = setTimeout(() => setIn(true), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="home">

      {/* ─── HERO ─── */}
      <section className="home__hero">
        <div className="home__hero-grid">

          <div className={`home__hero-text ${in_ ? 'home__hero-text--in' : ''}`}>
            <p className="home__hero-p">
              Profesjonalne drobne naprawy i prace domowe w <strong style={{ fontWeight: '700' }}>Warszawie i okolicach.</strong><br />
              Oferujemy montaż, naprawy, drobne prace remontowe i pomoc w domu – szybko, uczciwie i bez problemów.
            </p>
            
            <h3 style={{ marginTop: '20px', marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
              Dlaczego warto nas wybrać:
            </h3>
            <ul style={{ marginBottom: '20px', listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}>✓ Dojazd tego samego dnia</li>
              <li style={{ marginBottom: '8px' }}>✓ Własne narzędzia – nie musisz niczego przygotowywać</li>
              <li style={{ marginBottom: '8px' }}>✓ Drobne prace – bez dużych remontów</li>
              <li style={{ marginBottom: '16px' }}>✓ Elastyczne godziny wizyt i indywidualne podejście</li>
            </ul>

            <p style={{ fontSize: '18px', fontWeight: '600', color: '#2c5aa0', marginTop: '16px' }}>
              💰 Cena: Od 80 zł/godz
            </p>

          </div>

          <div className={`home__hero-img ${in_ ? 'home__hero-img--in' : ''}`}>
            <img
              src="/images/hero-image.jpg"
              alt="Fachowiec"
              onError={e => { e.target.style.display = 'none' }}
            />
          </div>

        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section className="home__services">
        <div className="home__services-wrap">
          <h2 className="home__services-h2">Jak mogę pomóc?</h2>
          <div className="home__svc-grid">
            {services.map((s, i) => (
              <div key={i} className="home__svc">
                <s.icon size={26} strokeWidth={1.5} className="home__svc-icon" />
                <h3 className="home__svc-h3">{s.title}</h3>
                <p className="home__svc-p">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}

export default Home
