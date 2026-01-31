import './ServicesList.css'

function ServicesList() {
  const services = [
    {
      id: 1,
      icon: '🔧',
      title: 'Drobne naprawy',
      description: 'Naprawy w domu i mieszkaniu - od zamiany żarówki do naprawy mebli'
    },
    {
      id: 2,
      icon: '🔨',
      title: 'Montaż',
      description: 'Montaż mebli, półek, karniszy, lamp i innych elementów wyposażenia'
    },
    {
      id: 3,
      icon: '⚡',
      title: 'Prace elektryczne',
      description: 'Drobne prace elektryczne - wymiana złączeń, żarówek, włączników'
    },
    {
      id: 4,
      icon: '🚿',
      title: 'Hydraulika',
      description: 'Naprawa kranów, uszczelnianie, wymiana radiatorów i inne prace hydrauliczne'
    },
    {
      id: 5,
      icon: '🪛',
      title: 'Wiercenie i śruby',
      description: 'Wiercenie otworów, montaż na ścianie, montaż konstrukcji'
    },
    {
      id: 6,
      icon: '🧹',
      title: 'Porządkowanie',
      description: 'Sprzątanie terenu, drobne prace porządkowe w domu i ogrodzie'
    }
  ]

  return (
    <div className="services-list">
      <div className="services-header">
        <h2>Jak mogę Ci pomóc?</h2>
        <p>Szeroki zakres drobnych usług domowych i naprawczych</p>
      </div>

      <div className="services-grid">
        {services.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-icon">{service.icon}</div>
            <h3 className="service-title">{service.title}</h3>
            <p className="service-description">{service.description}</p>
          </div>
        ))}
      </div>

      <div className="services-footer">
        <div className="info-box">
          <h3>✓ Własne narzędzia</h3>
          <p>Przychodzę ze wszystkim potrzebnym do wykonania pracy</p>
        </div>
        <div className="info-box">
          <h3>✓ Elastyczne terminy</h3>
          <p>Wybierz termin, który Ci odpowiada z kalendarza</p>
        </div>
        <div className="info-box">
          <h3>✓ Legionowo i okolicach</h3>
          <p>Pracuję w Legionowie i pobliskich okolicach</p>
        </div>
      </div>

      <div className="note-box">
        <p>
          <strong>Uwaga:</strong> Nie wykonuję dużych remontów.
          Specjalizuję się w drobnych naprawach i usługach domowych.
        </p>
      </div>
    </div>
  )
}

export default ServicesList
