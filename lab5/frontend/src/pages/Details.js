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
  const [isBooked, setIsBooked] = useState(true); // Заглушка для відображення форми

  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Отримуємо дані квартири з Firebase
        const docRef = doc(db, "apartments", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setApartment(data);
        }

        // 2. Отримуємо відгуки з Node.js сервера (Лаба 5)
        const res = await fetch(`https://comfortstay-backend.onrender.com/api/reviews/${id}?page=${page}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
          setTotalPages(data.totalPages || 1);
        }
      } catch (error) {
        console.error("Помилка завантаження:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, page]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    const reviewData = {
      apartmentId: String(id),
      userEmail: user?.email || "Анонім",
      text: newReview,
      date: new Date().toLocaleDateString()
    };

    try {
      const response = await fetch("https://comfortstay-backend.onrender.com/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        setNewReview("");
        setPage(1); // Повертаємось на 1 сторінку
        
        // Оновлюємо список відгуків
        const fetchResponse = await fetch(`https://comfortstay-backend.onrender.com/api/reviews/${id}?page=1`);
        const data = await fetchResponse.json();
        setReviews(data.reviews || []);
        setTotalPages(data.totalPages || 1);
        alert("Відгук додано!");
      }
    } catch (error) {
      alert("Помилка сервера при відправці відгуку.");
    }
  };

  if (loading) return <div className="loading" style={{textAlign: "center", padding: "50px"}}>Завантаження...</div>;
  if (!apartment) return <div className="error" style={{textAlign: "center", padding: "50px", color: "red"}}>Квартиру не знайдено.</div>;

  // Визначаємо шлях до фото
  const apartmentImage = apartment.image || apartment.img || apartment.imageUrl;

  return (
    <div className="details-container" style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      
      <div className="apartment-card" style={{ marginBottom: "30px" }}>
        <h1 style={{ color: "#333", marginBottom: "15px" }}>{apartment.title || apartment.name}</h1>
        
        {/* Блок з фото - УНІФІКОВАНИЙ РОЗМІР */}
        {apartmentImage ? (
          <img 
            src={apartmentImage} 
            alt="apartment" 
            style={{ 
              width: "100%", 
              height: "400px",       // Фіксована висота для всіх фото
              objectFit: "cover",     // Робить фото акуратним, обрізаючи зайве
              borderRadius: "12px", 
              marginBottom: "20px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "400px", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", marginBottom: "20px", color: "#888" }}>
            Фото відсутнє в базі
          </div>
        )}
        
        <div className="info-section" style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
          <p style={{ fontSize: "1.3em", color: "#db7093", fontWeight: "bold", margin: "0 0 10px 0" }}>
            Ціна: {apartment.price} грн/доба
          </p>
          <p style={{ margin: "0 0 10px 0", color: "#555" }}>
            <strong>Адреса:</strong> {apartment.location || apartment.address}
          </p>
          <p style={{ lineHeight: "1.7", color: "#666", margin: 0 }}>
            {apartment.description}
          </p>
        </div>
      </div>

      <hr style={{ margin: "40px 0", border: "0", borderTop: "2px solid #eee" }} />

      <div className="reviews-section">
        <h2 style={{ color: "#333", marginBottom: "20px" }}>Відгуки користувачів</h2>

        {reviews.length > 0 ? (
          <div className="reviews-list">
            {reviews.map((review, index) => (
              <div key={index} style={{ background: "#fff", padding: "15px", borderRadius: "8px", marginBottom: "15px", border: "1px solid #eee" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", borderBottom: "1px solid #f0f0f0", paddingBottom: "5px" }}>
                  <strong style={{ color: "#555" }}>{review.userEmail}</strong>
                  <span style={{ color: "#999", fontSize: "0.9em" }}>{review.date}</span>
                </div>
                <p style={{ margin: 0, color: "#444", lineHeight: "1.5" }}>{review.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontStyle: "italic", color: "#888" }}>Поки немає відгуків. Будьте першими!</p>
        )}

        {/* Пагінація */}
        {totalPages > 1 && (
          <div className="pagination" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "15px", margin: "25px 0" }}>
            <button 
              onClick={() => setPage(p => Math.max(p - 1, 1))} 
              disabled={page === 1} 
              style={{ padding: "8px 15px", cursor: "pointer", borderRadius: "5px", border: "1px solid #ccc", background: page === 1 ? "#eee" : "#fff" }}
            >
              Назад
            </button>
            <span style={{ fontWeight: "bold", color: "#555" }}>Сторінка {page} з {totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(p + 1, totalPages))} 
              disabled={page === totalPages} 
              style={{ padding: "8px 15px", cursor: "pointer", borderRadius: "5px", border: "1px solid #ccc", background: page === totalPages ? "#eee" : "#fff" }}
            >
              Вперед
            </button>
          </div>
        )}

        {/* Форма відгуку */}
        {user && isBooked ? (
          <form onSubmit={handleAddReview} style={{ marginTop: "35px", background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eee", display: "flex", flexDirection: "column", gap: "15px" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Залишити свій відгук</h3>
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="Поділіться вашими враженнями про проживання..."
              required
              rows="5"
              style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontFamily: "inherit", fontSize: "1em", resize: "vertical" }}
            />
            {/* РОЖЕВА КНОПКА */}
            <button 
              type="submit" 
              style={{ 
                padding: "12px", 
                background: "#db7093", // Рожевий колір
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                cursor: "pointer", 
                fontWeight: "bold", 
                fontSize: "1.1em",
                transition: "background 0.3s ease" 
              }}
              onMouseOver={(e) => e.target.style.background = "#c76083"} // Ефект при наведенні
              onMouseOut={(e) => e.target.style.background = "#db7093"}
            >
              Відправити відгук
            </button>
          </form>
        ) : (
          <div style={{ marginTop: "20px", padding: "15px", background: "#f8d7da", color: "#721c24", borderRadius: "8px", border: "1px solid #f5c6cb" }}>
            Увійдіть у систему, щоб мати можливість залишити відгук.
          </div>
        )}
      </div>
    </div>
  );
};

export default Details;