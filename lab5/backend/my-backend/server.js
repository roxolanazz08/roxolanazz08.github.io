const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Ініціалізація бази даних [cite: 5085, 5086]
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json()); // Для обробки JSON з клієнта [cite: 5089]

// GET маршрут для відгуків з пагінацією (Варіант 7) [cite: 5286, 5288]
app.get("/api/reviews/:apartmentId", async (req, res) => {
    try {
        const { apartmentId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Обмеження в 10 відгуків згідно завдання 

        // Отримуємо всі відгуки для конкретної квартири
        const snapshot = await db.collection("reviews").where("apartmentId", "==", apartmentId).get();
        let allReviews = [];
        snapshot.forEach(doc => allReviews.push(doc.data()));

        // Логіка пагінації на сервері 
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedReviews = allReviews.slice(startIndex, endIndex);

        res.json({
            reviews: paginatedReviews,
            total: allReviews.length,
            page: page,
            totalPages: Math.ceil(allReviews.length / limit)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST маршрут для додавання відгуку (Варіант 7) [cite: 5289]
app.post("/api/reviews", async (req, res) => {
    try {
        const newReview = req.body;
        // Зберігаємо відгук у Firestore
        await db.collection("reviews").add(newReview);
        res.json({ message: "Відгук успішно додано!", review: newReview });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(5000, () => {
    console.log("Server is running on port 5000"); [cite: 5090]
});