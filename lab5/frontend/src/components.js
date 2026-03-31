import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';

export const ApartmentCard = ({ apt, isBooked, onBook }) => (
  <article className="card">
    <img src={apt.image} alt={apt.name} />
    <h3><Link to={`/details/${apt.id}`} className="card-link">{apt.name}</Link></h3>
    <p><strong>Адреса:</strong> {apt.address}</p>
    <p><strong>Кімнат:</strong> {apt.rooms} | <strong>Тип:</strong> {apt.type}</p>
    <p><strong>Ціна:</strong> {apt.price} грн/ніч</p>
    <p className={isBooked ? 'status-booked' : 'status-available'}>
      {isBooked ? 'Статус: Заброньовано' : 'Статус: Доступно'}
    </p>
    <button className="book-btn" disabled={isBooked} onClick={() => onBook(apt)}>
      {isBooked ? 'Заброньовано' : 'Забронювати'}
    </button>
  </article>
);

export const BookingsList = ({ bookedItems, onCancel }) => (
  <div className="apartments-container">
    {bookedItems.map(apt => (
      <div key={apt.id} className="booking-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        <ApartmentCard apt={apt} isBooked={true} onBook={() => {}} />
        <button 
          onClick={() => onCancel(apt.id)}
          style={{ 
            background: '#ff4d4d', color: 'white', border: 'none', 
            padding: '12px', borderRadius: '10px', width: '300px', 
            cursor: 'pointer', fontWeight: 'bold' 
          }}
        >
          Скасувати бронювання
        </button>
      </div>
    ))}
  </div>
);

export const MapComponent = ({ apartments }) => {
  useEffect(() => {
    const container = L.DomUtil.get('map-container');
    if (container != null) { container._leaflet_id = null; }

    const map = L.map('map-container').setView([49.8413, 24.0311], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    apartments.forEach(apt => {
      if (apt.coords) {
        const popup = `
          <div style="text-align:center;">
            <img src="${apt.image}" style="width:100px; height:60px; object-fit:cover; border-radius:5px;">
            <h4 style="margin:5px 0;">${apt.name}</h4>
            <a href="/details/${apt.id}">Детальніше</a>
          </div>`;
        L.marker(apt.coords).addTo(map).bindPopup(popup);
      }
    });

    setTimeout(() => { map.invalidateSize(); }, 200);
    return () => map.remove();
  }, [apartments]);

  return <div id="map-container"></div>;
};