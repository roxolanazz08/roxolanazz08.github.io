import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase"; 
import { onAuthStateChanged } from "firebase/auth";

const Details = () => {
  const { id } = useParams();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [user, setUser] = useState(null);
  const [isBooked, setIsBooked] = useState(true); 

  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Перевірка авторизації
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Отримання даних
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Отримання квартири з Firebase
        const docRef = doc(db, "apartments", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setApartment(docSnap.data());
        }

        // 2. Отримання відгуків з нашого Node.js сервера
        const response = await fetch(`http://localhost:5000/api/reviews/${id}?page=${page}`);
        if (!response.ok) {
          throw new Error("Не вдалося завантажити відгуки з сервера");
        }
        const data = await response.json();
        setReviews(data.reviews || []);
        setTotalPages(data.totalPages || 1);

      } catch (error) {
        console.error("Помилка завантаження:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, page]);

  // Додавання відгуку
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    const reviewData = {
      apartmentId: String(id), // Примусово робимо рядком для збігу з базою
      userEmail: user?.email || "Анонім",
      text: newReview,
      date: new Date().toLocaleDateString()
    };

    try {
      const response = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        setNewReview("");
        setPage(1); 
        
        // Перезавантажуємо першу сторінку відгуків
        const fetchResponse = await fetch(`http://localhost:5000/api/reviews/${id}?page=1`);
        const data = await fetchResponse.json();
        setReviews(data.reviews || []);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error("Помилка сервера при збереженні.");
      }
    } catch (error) {
      console.error("Помилка мережі при відправці відгуку:", error);
    }
  };

  if (loading) return <div className="loading">Завантаження...</div>;
  if (!apartment) return <div className="error">Квартиру не знайдено.</div>;

  return (
    <div className="details-page">
      
      {/* Інформація про квартиру */}
      <div className="apartment-info">
        <h2>{apartment.title || apartment.name}</h2>
        
        {/* Виведення фото (перевіряємо всі можливі назви полів) */}
        {(apartment.image || apartment.img || apartment.imageUrl) && (
          <img 
            src={apartment.image || apartment.img || apartment.imageUrl} 
            alt="apartment" 
            className="details-img" 
          />
        )}
        
        <p className="price"><strong>Ціна:</strong> {apartment.price} грн</p>
        <p className="location"><strong>Адреса:</strong> {apartment.location || apartment.address}</p>
        <p className="description">{apartment.description}</p>
      </div>

      {/* Блок відгуків */}
      <div className="reviews-section">
        <h3>Відгуки</h3>

        {reviews.length > 0 ? (
          <ul className="reviews-list">
            {reviews.map((review, index) => (
              <li key={index} className="review-item">
                <div className="review-header">
                  <strong>{review.userEmail}</strong> 
                  <span className="review-date"> ({review.date})</span>
                </div>
                <p className="review-text">{review.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Поки немає відгуків.</p>
        )}

        {/* Пагінація */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="btn"
            >
              Попередня
            </button>
            <span>Сторінка {page} з {totalPages}</span>
            <button 
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="btn"
            >
              Наступна
            </button>
          </div>
        )}

        {/* Форма */}
        {user && isBooked ? (
          <form onSubmit={handleAddReview} className="add-review-form">
            <h4>Залишити відгук:</h4>
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="Напишіть ваші враження..."
              required
            />
            <button type="submit" className="btn btn-submit">Відправити</button>
          </form>
        ) : (
          <p className="error-msg">Увійдіть у систему, щоб залишити відгук.</p>
        )}
      </div>
    </div>
  );
};

export default Details;