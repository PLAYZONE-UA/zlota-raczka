import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { OrderModalContext } from '../contexts/OrderModalContext'
import './Home.css'

const services = [
  {
    title: 'Montaż paneli i listew',
    desc: 'Układanie paneli podłogowych oraz montaż listew przypodłogowych.',
    price: [
      'Montaż paneli od 30 zł / m²',
      'Montaż listew przypodłogowych 15-20 zł / mb'
    ],
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
    price: 'od 80 zł',
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
    price: 'od 60 zł',
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
    desc: 'Montaż i regulacja drzwi wewnętrznych oraz wejściowych.',
    price: 'od 500 zł',
    items: [
      'montaż drzwi pokojowych',
      'montaż drzwi wejściowych',
      'montaż ościeżnicy',
      'regulacja drzwi',
      'montaż klamek',
      'drobne poprawki'
    ]
  },
  {
    title: 'Drobne prace remontowe',
    desc: 'Pomoc przy drobnych pracach wykończeniowych.',
    price: 'od 100 zł',
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
  const [expandedPrice, setExpandedPrice] = useState(null)
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
              Profesjonalne prace domowe i instalacyjne w <strong style={{ fontWeight: '700' }}>Warszawie i okolicach.</strong><br />
              Świadczymy kompleksowe usługi w domu i mieszkaniu – montaż mebli i wyposażenia, naprawy techniczne, instalacje oraz prace remontowe. Działamy szybko, rzetelnie i bez ukrytych kosztów.
            </p>
            
            <h3 style={{ marginTop: '20px', marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
              Dlaczego warto nas wybrać:
            </h3>
            <ul style={{ marginBottom: '20px', listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}>✓ Szybki dojazd – realizacja często tego samego dnia</li>
              <li style={{ marginBottom: '8px' }}>✓ Pełne wyposażenie i doświadczenie – nie musisz niczego przygotowywać</li>
              <li style={{ marginBottom: '8px' }}>✓ Szeroki zakres usług – od montażu, przez naprawy techniczne, po prace remontowe</li>
              <li style={{ marginBottom: '8px' }}>✓ Elastyczne terminy i indywidualne podejście – dostosowujemy się do Twoich potrzeb</li>
              <li style={{ marginBottom: '8px' }}>✓ Gwarantujemy profesjonalizm, bezpieczeństwo i najwyższą jakość wykonania każdej pracy</li>
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
              <button 
                className="cennik-btn"
                onClick={() => setExpandedPrice(expandedPrice === i ? null : i)}
              >
                Cennik
              </button>
              {expandedPrice === i && (
                <div className="price-info">
                  {Array.isArray(s.price) ? (
                    s.price.map((priceLine, priceIndex) => (
                      <p key={priceIndex} className="price">{priceLine}</p>
                    ))
                  ) : (
                    <p className="price">{s.price}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}

export default Home
