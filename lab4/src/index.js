const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");

// 1. НАМАГАЄМОСЯ ПРОЧИТАТИ КЛЮЧ
let serviceAccount;
try {
  // Зчитуємо змінну оточення
  const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountStr) {
    serviceAccount = JSON.parse(serviceAccountStr);
    
    // ВАЖЛИВО: Виправляємо проблему Render з екранованими переносами рядків
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    console.log("✅ JSON ключа прочитано. Проєкт:", serviceAccount.project_id);
    console.log("📧 Email сервісного акаунта:", serviceAccount.client_email);
  } else {
    console.log("⚠️ Змінна FIREBASE_SERVICE_ACCOUNT_JSON не знайдена");
  }
} catch (err) {
  console.error("❌ КРИТИЧНА ПОМИЛКА: Неправильний формат FIREBASE_SERVICE_ACCOUNT_JSON на Render.", err.message);
}

// 2. ІНІЦІАЛІЗАЦІЯ FIREBASE ADMIN
if (admin.apps.length === 0 && serviceAccount && serviceAccount.project_id) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// 3. ТЕСТОВИЙ ЗАПИТ ДО БАЗИ (щоб перевірити доступ при старті)
if (serviceAccount && serviceAccount.project_id) {
  db.collection("reviews").limit(1).get()
    .then(() => console.log("🚀 FIREBASE ПІДКЛЮЧЕНО ІДЕАЛЬНО! Можна додавати відгуки."))
    .catch(err => console.error("🛑 FIREBASE ВІДХИЛИВ ДОСТУП (UNAUTHENTICATED):", err.message));
}

// 4. РОЗДАЧА СТАТИКИ (Якщо React збілджений у папку public)
app.use(express.static(path.join(__dirname, "public")));

// 5. МАРШРУТИ АРІ
app.get("/api/reviews/:apartmentId", async (req, res) => {
  try {
    const { apartmentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limitNum = 10;
    const offsetNum = (page - 1) * limitNum;

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

app.post("/api/reviews", async (req, res) => {
  try {
    const newReview = req.body;
    const docRef = await db.collection("reviews").add(newReview);
    res.status(201).json({ id: docRef.id, ...newReview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. ПЕРЕНАПРАВЛЕННЯ ДЛЯ REACT ROUTER
app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер працює на порту ${PORT}`);
});