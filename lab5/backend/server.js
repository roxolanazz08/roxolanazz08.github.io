const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

// Ініціалізація Firebase Admin
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// GET: Отримання відгуків для конкретної квартири з пагінацією
app.get("/api/reviews/:apartmentId", async (req, res) => {
  try {
    const { apartmentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Обмеження згідно з варіантом 7

    // Отримуємо всі відгуки для цієї квартири
    const reviewsRef = db.collection("reviews");
    const snapshot = await reviewsRef.where("apartmentId", "==", apartmentId).get();
    
    let allReviews = [];
    snapshot.forEach(doc => {
      allReviews.push({ id: doc.id, ...doc.data() });
    });

    // Сортуємо за датою (новіші перші) - опціонально, але корисно
    // allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Логіка пагінації
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedReviews = allReviews.slice(startIndex, endIndex);
    const totalPages = Math.ceil(allReviews.length / limit);

    res.json({
      reviews: paginatedReviews,
      currentPage: page,
      totalPages: totalPages,
      totalReviews: allReviews.length
    });
  } catch (error) {
    console.error("Помилка отримання відгуків:", error);
    res.status(500).json({ error: "Внутрішня помилка сервера" });
  }
});

// POST: Додавання нового відгуку
app.post("/api/reviews", async (req, res) => {
  try {
    const { apartmentId, userEmail, text, date } = req.body;

    if (!apartmentId || !text) {
      return res.status(400).json({ error: "Бракує необхідних даних" });
    }

    const newReview = { apartmentId, userEmail, text, date };
    const docRef = await db.collection("reviews").add(newReview);

    res.status(201).json({ 
      message: "Відгук додано", 
      review: { id: docRef.id, ...newReview } 
    });
  } catch (error) {
    console.error("Помилка додавання відгуку:", error);
    res.status(500).json({ error: "Внутрішня помилка сервера" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});