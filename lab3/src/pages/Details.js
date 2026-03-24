import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apartmentsData } from '../data';

function Details() {
  const { id } = useParams();
  
  const apt = apartmentsData.find(a => a.id === parseInt(id));
  
  const [isBooked, setIsBooked] = useState(
    (JSON.parse(localStorage.getItem('myBookings')) || []).some(b => b.id === apt?.id)
  );

  if (!apt) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Квартиру не знайдено</h2>
        <Link to="/">Повернутися на головну</Link>
      </div>
    );
  }

  const handleBook = () => {
    let bookings = JSON.parse(localStorage.getItem('myBookings')) || [];
    if (!bookings.some(b => b.id === apt.id)) {
      bookings.push(apt);
      localStorage.setItem('myBookings', JSON.stringify(bookings));
      setIsBooked(true);
      alert(`${apt.name} успішно заброньовано!`);
    }
  };

  return (
    <section className="detail-container">
      <div className="detail-image">
        <img src={apt.image} alt={apt.name} />
      </div>

      <div className="detail-info">
        <h2 style={{ marginTop: '0' }}>{apt.name}</h2>
        <p className="price" style={{ color: '#d81b60', fontSize: '1.4rem', fontWeight: 'bold' }}>
          {apt.price} грн / ніч
        </p>
        
        <div className="description-box" style={{ background: '#fffafa', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #ffeef2' }}>
          <p style={{ margin: '5px 0' }}><strong>Адреса:</strong> {apt.address}</p>
          <p style={{ margin: '5px 0' }}><strong>Тип житла:</strong> {apt.type}</p>
          <p style={{ margin: '5px 0' }}><strong>Кількість кімнат:</strong> {apt.rooms}</p>
          <hr style={{ border: 'none', borderTop: '1px solid #ffeef2', margin: '15px 0' }} />
          <p style={{ margin: '5px 0', lineHeight: '1.5' }}><strong>Опис:</strong> {apt.description}</p>
        </div>

        <h3 style={{ marginTop: '0' }}>Зручності:</h3>
        <ul className="features-list" style={{ paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.6' }}>
          {apt.features.map((feature, index) => (
            <li key={index} style={{ marginBottom: '5px' }}>{feature}</li>
          ))}
        </ul>

        <p className={isBooked ? 'status-booked' : 'status-available'} style={{ fontSize: '1.1rem' }}>
          {isBooked ? 'Статус: Заброньовано' : 'Статус: Доступно'}
        </p>

        <button 
          className="book-btn" 
          disabled={isBooked} 
          onClick={handleBook}
          style={{ width: '100%', fontSize: '1.1rem', padding: '15px' }}
        >
          {isBooked ? 'Заброньовано' : 'Забронювати зараз'}
        </button>

        <Link to="/" className="back-link" style={{ display: 'block', marginTop: '20px', color: '#6a1b9a', textAlign: 'center', textDecoration: 'none', fontWeight: 'bold' }}>
          Повернутися до списку
        </Link>
      </div>
    </section>
  );
}

export default Details;