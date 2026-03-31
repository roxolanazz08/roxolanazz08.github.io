const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");

// Ініціалізація Firebase через змінні оточення (Render)
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Наступний рядок дуже важливий: він правильно перетворює перенесення рядків у ключі
  privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// 1. Налаштування хостингу статичних файлів сайту (Пункт 1 завдання)
app.use(express.static(path.join(__dirname, "public")));

// 2. GET-маршрут: Отримання відгуків з пагінацією (Пункт 3 завдання)
app.get("/api/reviews/:apartmentId", async (req, res) => {
  try {
    const { apartmentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limitNum = 10; // Ліміт 10 відгуків
    const offsetNum = (page - 1) * limitNum;

    // Робимо запит до колекції reviews у Firebase
    const snapshot = await db.collection("reviews")
      .where("apartmentId", "==", apartmentId)
      .limit(limitNum)
      .offset(offsetNum)
      .get();

    const reviews = [];
    snapshot.forEach(doc => reviews.push({ id: doc.id, ...doc.data() }));
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. POST-маршрут: Додавання нового відгуку (Пункт 4 завдання)
app.post("/api/reviews", async (req, res) => {
  try {
    const newReview = req.body;
    // Додаємо новий відгук у колекцію reviews
    const docRef = await db.collection("reviews").add(newReview);
    res.status(201).json({ id: docRef.id, ...newReview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер працює на порту ${PORT}`);
});