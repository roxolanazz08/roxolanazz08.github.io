import React, { useState, useEffect } from 'react';
import { apartmentsData } from '../data'; 
import { ApartmentCard, MapComponent } from '../components'; 

function Home() {
  // Стейт для списку квартир і бронювань
  const [apartments, setApartments] = useState(apartmentsData);
  const [myBookings, setMyBookings] = useState(JSON.parse(localStorage.getItem('myBookings')) || []);

  // Стейт для наших трьох фільтрів
  const [priceSort, setPriceSort] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // useEffect спрацьовує щоразу, коли ми змінюємо будь-який фільтр
  useEffect(() => {
    let filtered = [...apartmentsData];

    // 1. Фільтр за кількістю кімнат
    if (roomFilter) {
      filtered = filtered.filter(apt => apt.rooms === parseInt(roomFilter));
    }

    // 2. Фільтр за типом (Квартира, Студія, Апартаменти)
    if (typeFilter) {
      filtered = filtered.filter(apt => apt.type === typeFilter);
    }

    // 3. Сортування за ціною (asc - дешевші, desc - дорожчі)
    if (priceSort === 'asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (priceSort === 'desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    // Оновлюємо список квартир на екрані
    setApartments(filtered);
  }, [priceSort, roomFilter, typeFilter]);

  const handleBook = (apt) => {
    const updated = [...myBookings, apt];
    setMyBookings(updated);
    localStorage.setItem('myBookings', JSON.stringify(updated));
    alert(`${apt.name} заброньовано!`);
  };

  return (
    <section>
      <h2 style={{textAlign: 'center', color: '#d81b60', marginBottom: '20px'}}>Доступні квартири</h2>
      
      {/* ПАНЕЛЬ ФІЛЬТРІВ */}
      <div className="filters-container" style={{
        display: 'flex', gap: '15px', justifyContent: 'center', 
        marginBottom: '30px', flexWrap: 'wrap'
      }}>
        <select 
          value={priceSort} 
          onChange={(e) => setPriceSort(e.target.value)}
          style={filterStyle}
        >
          <option value="">Сортування за ціною</option>
          <option value="asc">Від найдешевших</option>
          <option value="desc">Від найдорожчих</option>
        </select>

        <select 
          value={roomFilter} 
          onChange={(e) => setRoomFilter(e.target.value)}
          style={filterStyle}
        >
          <option value="">Кількість кімнат (Всі)</option>
          <option value="1">1 кімната</option>
          <option value="2">2 кімнати</option>
          <option value="3">3+ кімнати</option>
        </select>

        <select 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)}
          style={filterStyle}
        >
          <option value="">Тип житла (Всі)</option>
          <option value="Квартира">Квартира</option>
          <option value="Апартаменти">Апартаменти</option>
          <option value="Студія">Студія</option>
        </select>
      </div>

      {/* СПИСОК КВАРТИР */}
      <div className="apartments-container">
        {apartments.length > 0 ? (
          apartments.map(apt => (
            <ApartmentCard 
              key={apt.id} 
              apt={apt} 
              isBooked={myBookings.some(b => b.id === apt.id)} 
              onBook={handleBook} 
            />
          ))
        ) : (
          <p style={{textAlign: 'center', width: '100%', fontSize: '1.2rem'}}>За вашими критеріями нічого не знайдено.</p>
        )}
      </div>
      
      {/* МАПА (показує тільки відфільтровані об'єкти) */}
      <div className="map-section">
        <h3 style={{textAlign: 'center', color: '#d81b60', marginTop: '40px'}}>Карта об'єктів</h3>
        <MapComponent apartments={apartments} />
      </div>
    </section>
  );
}

const filterStyle = {
  padding: '10px 15px',
  borderRadius: '10px',
  border: '2px solid #ff85a2',
  fontFamily: 'inherit',
  fontSize: '1rem',
  outline: 'none',
  cursor: 'pointer',
  backgroundColor: 'white',
  color: '#4a4a4a'
};

export default Home;