import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function Details({ user }) {
  const { id } = useParams();
  const [apt, setApt] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [isBooked, setIsBooked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Стейт для пагінації
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const bookings = JSON.parse(localStorage.getItem('myBookings')) || [];
    setIsBooked(bookings.some(b => String(b.id) === String(id)));

    // Функція для отримання відгуків з нашого власного Node.js сервера
    const fetchReviews = async (pageNum = 1) => {
      try {
        const response = await fetch(`http://localhost:5000/api/reviews/${id}?page=${pageNum}`);
        const data = await response.json();
        
        // Якщо прийшло менше 10 відгуків, значить більше в базі немає
        if (data.length < 10) {
          setHasMore(false);
        }

        if (pageNum === 1) {
          setReviews(data);
        } else {
          setReviews(prev => [...prev, ...data]); // Додаємо нові до списку
        }
      } catch (error) {
        console.error("Помилка завантаження відгуків із сервера:", error);
      }
    };

    const fetchData = async () => {
      try {
        // Отримання квартири (залишається з Firebase напряму)
        const docRef = doc(db, "apartments", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setApt({ ...docSnap.data(), id: docSnap.id });
        } else {
          setApt(null);
        }

        // Завантажуємо першу сторінку відгуків
        await fetchReviews(1);
      } catch (error) {
        console.error("Помилка:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Функція для кнопки "Завантажити ще"
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    
    fetch(`http://localhost:5000/api/reviews/${id}?page=${nextPage}`)
      .then(res => res.json())
      .then(data => {
          if (data.length < 10) setHasMore(false);
          setReviews(prev => [...prev, ...data]);
      })
      .catch(err => console.error("Помилка:", err));
  };

  const handleBook = () => {
    let bookings = JSON.parse(localStorage.getItem('myBookings')) || [];
    if (!bookings.some(b => String(b.id) === String(apt.id))) {
      bookings.push(apt);
      localStorage.setItem('myBookings', JSON.stringify(bookings));
      setIsBooked(true);
      alert(`${apt.name} успішно заброньовано!`);
    }
  };

  // Оновлене додавання відгуку через POST-запит на наш сервер
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    const reviewObj = {
      apartmentId: id,
      userEmail: user.email,
      text: newReview,
      date: new Date().toLocaleDateString()
    };

    try {
      const response = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewObj)
      });
      
      if (response.ok) {
        const addedReview = await response.json();
        setReviews([addedReview, ...reviews]); // Додаємо новий відгук на початок списку
        setNewReview("");
        alert("Відгук успішно додано через сервер!");
      } else {
        alert("Помилка при додаванні відгуку");
      }
    } catch (error) {
      alert("Помилка підключення до сервера: " + error.message);
    }
  };

  if (loading) return <h2 style={{ textAlign: 'center', padding: '50px' }}>Завантаження...</h2>;
  if (!apt) return <div style={{ textAlign: 'center', padding: '50px' }}><h2>Квартиру не знайдено</h2><Link to="/">Повернутися</Link></div>;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      <div className="detail-container">
        <div className="detail-image">
          <img src={apt.image} alt={apt.name} />
        </div>
        <div className="detail-info">
          <h2 style={{ marginTop: '0' }}>{apt.name}</h2>
          <p className="price" style={{ color: '#d81b60', fontSize: '1.4rem', fontWeight: 'bold' }}>{apt.price} грн / ніч</p>
          
          <div className="description-box" style={{ background: '#fffafa', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #ffeef2' }}>
            <p style={{ margin: '5px 0' }}><strong>Адреса:</strong> {apt.address}</p>
            <p style={{ margin: '5px 0' }}><strong>Тип житла:</strong> {apt.type}</p>
            <p style={{ margin: '5px 0' }}><strong>Кількість кімнат:</strong> {apt.rooms}</p>
            <hr style={{ border: 'none', borderTop: '1px solid #ffeef2', margin: '15px 0' }} />
            <p style={{ margin: '5px 0', lineHeight: '1.5' }}><strong>Опис:</strong> {apt.description}</p>
          </div>
          
          <h3 style={{ marginTop: '0' }}>Зручності:</h3>
          <ul className="features-list" style={{ paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.6' }}>
            {apt.features?.map((feature, index) => (
              <li key={index} style={{ marginBottom: '5px' }}>{feature}</li>
            ))}
          </ul>
          
          <p className={isBooked ? 'status-booked' : 'status-available'} style={{ fontSize: '1.1rem' }}>
            {isBooked ? 'Статус: Заброньовано' : 'Статус: Доступно'}
          </p>
          
          <button className="book-btn" disabled={isBooked} onClick={handleBook} style={{ width: '100%', fontSize: '1.1rem', padding: '15px' }}>
            {isBooked ? 'Заброньовано' : 'Забронювати зараз'}
          </button>
          <Link to="/" className="back-link" style={{ display: 'block', marginTop: '20px', color: '#6a1b9a', textAlign: 'center', textDecoration: 'none', fontWeight: 'bold' }}>Повернутися до списку</Link>
        </div>
      </div>

      <div className="reviews-section" style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(255, 133, 162, 0.15)' }}>
        <h3 style={{ color: '#d81b60', marginTop: '0' }}>Відгуки</h3>
        
        {reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
            {reviews.map((rev, idx) => (
              <div key={idx} style={{ borderBottom: '1px solid #ffeef2', paddingBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <strong style={{ color: '#4a4a4a' }}>{rev.userEmail}</strong>
                  <small style={{ color: '#888' }}>{rev.date}</small>
                </div>
                <p style={{ margin: '0', lineHeight: '1.4' }}>{rev.text}</p>
              </div>
            ))}
            
            {/* Кнопка пагінації */}
            {hasMore && (
              <button onClick={handleLoadMore} style={{ background: '#fff0f3', color: '#d81b60', border: '1px solid #ffb3c6', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                Завантажити ще відгуки
              </button>
            )}

          </div>
        ) : (
          <p style={{ color: '#666' }}>Поки немає жодного відгуку. Будьте першим!</p>
        )}

        {user && isBooked ? (
          <form onSubmit={handleAddReview} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <textarea value={newReview} onChange={(e) => setNewReview(e.target.value)} placeholder="Напишіть свій відгук про проживання..." required rows="4" style={{ padding: '15px', borderRadius: '10px', border: '2px solid #ffeef2', fontFamily: 'inherit', fontSize: '1rem', resize: 'vertical', outline: 'none' }} />
            <button type="submit" className="book-btn" style={{ alignSelf: 'flex-start', padding: '10px 25px' }}>Залишити відгук</button>
          </form>
        ) : (
          <div style={{ marginTop: '20px', padding: '15px', background: '#fff5f7', borderRadius: '10px', borderLeft: '4px solid #ff85a2' }}>
            <p style={{ margin: '0', color: '#6a1b9a', fontSize: '0.95rem' }}><em>* Залишати відгуки можуть лише авторизовані користувачі, які орендували цю квартиру.</em></p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Details;