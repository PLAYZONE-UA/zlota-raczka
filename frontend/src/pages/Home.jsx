import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { OrderModalContext } from '../contexts/OrderModalContext'
import './Home.css'

const services = [
  {
    title: 'Montaż paneli i listew',
    desc: 'Układanie paneli podłogowych oraz montaż listew przypodłogowych.',
    items: [
      'montaż paneli laminowanych',
      'montaż paneli winylowych (click)',
      'montaż listew przypodłogowych',
      'docinanie listew pod kątem',
      'montaż progów podłogowych'
    ]
  },
  {
    title: 'Montaż mebli',
    desc: 'Montaż mebli i wyposażenia w domu lub mieszkaniu.',
    items: [
      'montaż mebli IKEA, Leroy Merlin',
      'montaż szaf, komód i regałów',
      'montaż półek',
      'montaż karniszy i rolet',
      'montaż lamp'
    ]
  },
  {
    title: 'Wiercenie i montaż na ścianie',
    desc: 'Montaż elementów na ścianach i sufitach.',
    items: [
      'wiercenie w betonie i cegle',
      'montaż TV na ścianie',
      'montaż półek i luster',
      'montaż obrazów',
      'montaż szafek'
    ]
  },
  {
    title: 'Montaż drzwi',
    desc: 'Montaż i regulacja drzwi wewnętrznych.',
    items: [
      'montaż drzwi pokojowych',
      'montaż ościeżnicy',
      'regulacja drzwi',
      'montaż klamek',
      'drobne poprawki'
    ]
  },
  {
    title: 'Drobne prace remontowe',
    desc: 'Pomoc przy drobnych pracach wykończeniowych.',
    items: [
      'silikonowanie łazienki i kuchni',
      'drobne naprawy ścian',
      'montaż paneli dekoracyjnych',
      'poprawki po remoncie',
      'montaż listew wykończeniowych'
    ]
  }
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
              <li style={{ marginBottom: '8px' }}>✓ Elastyczne godziny wizyt i indywidualne podejście</li>
            </ul>

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
      <section className="services">
        <h2>Jak mogę pomóc?</h2>
        <div className="services-grid">
          {services.map((s, i) => (
            <div key={i} className="service-card">
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <ul>
                {s.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="pricing">
        <h2>Cennik usług</h2>
        <p className="pricing-subtitle">Przykładowe ceny usług. Dokładna wycena zależy od zakresu pracy.</p>
        <div className="pricing-grid">
          <div className="price-card">
            <h3>Montaż paneli</h3>
            <p className="price">od 30 zł / m²</p>
            <ul>
              <li>układanie paneli laminowanych</li>
              <li>układanie paneli winylowych</li>
              <li>docinanie przy ścianach</li>
            </ul>
          </div>

          <div className="price-card">
            <h3>Montaż listew przypodłogowych</h3>
            <p className="price">15 – 20 zł / mb</p>
            <ul>
              <li>listwy MDF</li>
              <li>listwy PVC</li>
              <li>docinanie narożników</li>
            </ul>
          </div>

          <div className="price-card">
            <h3>Montaż mebli</h3>
            <p className="price">od 80 zł</p>
            <ul>
              <li>komody</li>
              <li>szafy</li>
              <li>regały</li>
            </ul>
          </div>

          <div className="price-card">
            <h3>Montaż półek / TV</h3>
            <p className="price">od 60 zł</p>
            <ul>
              <li>wiercenie w betonie</li>
              <li>montaż półek</li>
              <li>montaż telewizora</li>
            </ul>
          </div>

          <div className="price-card">
            <h3>Montaż drzwi</h3>
            <p className="price">od 200 zł</p>
            <ul>
              <li>montaż drzwi pokojowych</li>
              <li>regulacja drzwi</li>
              <li>montaż klamek</li>
            </ul>
          </div>

          <div className="price-card">
            <h3>Drobne naprawy</h3>
            <p className="price">od 100 zł</p>
            <ul>
              <li>drobne prace domowe</li>
              <li>silikonowanie</li>
              <li>małe naprawy</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── CALL BOX ─── */}
      <section className="call-section">
        <div className="call-box">
          <h3>Potrzebujesz pomocy?</h3>
          <p>Zadzwoń – szybka wycena i wolne terminy.</p>
          <a href="tel:+48574621560" className="call-button">Zadzwoń teraz</a>
        </div>
      </section>

    </div>
  )
}

export default Home
