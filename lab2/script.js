const apartmentsData = [
    { id: 0, name: "Затишна квартира", address: "вул. Вірменська, 1", price: "1200 грн/ніч", image: "images/photo1.jpg", details: "details1.html", coords: [49.8430, 24.0305] },
    { id: 1, name: "Сучасні апартаменти", address: "вул. В. Липинського, 15", price: "2100 грн/ніч", image: "images/photo2.jpg", details: "details2.html", coords: [49.8598, 24.0322] },
    { id: 2, name: "Люкс-студія", address: "пл. Ринок, 10", price: "4500 грн/ніч", image: "images/photo3.jpg", details: "details3.html", coords: [49.8413, 24.0311] }
];

// 1. Виведення списку доступних квартир (Завдання 1: цикл do...while)
function renderApartments() {
    const container = document.getElementById('apartments-list');
    if (!container) return;

    let saved = JSON.parse(localStorage.getItem('myBookings')) || [];
    let i = 0; 
    container.innerHTML = ''; 

    do {
        const apt = apartmentsData[i];
        const isBooked = saved.some(b => b.name === apt.name);

        container.innerHTML += `
            <article class="card">
                <img src="${apt.image}" alt="${apt.name}">
                <h3><a href="${apt.details}">${apt.name}</a></h3>
                <p><strong>Адреса:</strong> ${apt.address}</p>
                <p><strong>Ціна:</strong> ${apt.price}</p>
                <p id="status-${apt.id}" class="${isBooked ? 'status-booked' : 'status-available'}">
                    ${isBooked ? 'Статус: Заброньовано' : 'Статус: Доступно'}
                </p>
                <button class="book-btn" id="btn-${apt.id}" ${isBooked ? 'disabled' : ''} onclick="processBooking(${apt.id})">
                    ${isBooked ? 'Заброньовано' : 'Забронювати'}
                </button>
            </article>`;
        i++;
    } while (i < apartmentsData.length);
}

// 2. Логіка бронювання (Завдання 2: зміна статусу та додавання в список)
function processBooking(id) {
    const apt = apartmentsData[id];
    if (confirm(`Ви впевнені, що хочете забронювати: ${apt.name}?`)) {
        let bookings = JSON.parse(localStorage.getItem('myBookings')) || [];
        
        // Додаємо об'єкт у масив
        bookings.push({ 
            name: apt.name, 
            address: apt.address, 
            price: apt.price, 
            image: apt.image 
        });
        
        // Зберігаємо в пам'ять браузера
        localStorage.setItem('myBookings', JSON.stringify(bookings));
        
        // Оновлюємо інтерфейс (маніпуляція DOM)
        updateUI(id);
        alert("Квартиру успішно заброньовано!");
    }
}

// Функція для оновлення тексту та кнопок без перезавантаження сторінки
function updateUI(id) {
    const statusText = document.getElementById(`status-${id}`);
    const btn = document.getElementById(`btn-${id}`);
    if (statusText) {
        statusText.innerText = "Статус: Заброньовано";
        statusText.className = "status-booked";
    }
    if (btn) {
        btn.innerText = "Заброньовано";
        btn.disabled = true;
    }
}

// 3. Сторінка "Мої бронювання" (Виведення списку та ВИДАЛЕННЯ)
function displayBookings() {
    const container = document.getElementById('bookings-list');
    if (!container) return;

    let bookings = JSON.parse(localStorage.getItem('myBookings')) || [];
    
    if (bookings.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%;">У вас поки немає активних бронювань.</p>';
        return;
    }

    container.innerHTML = ''; 
    bookings.forEach((item, index) => {
        container.innerHTML += `
            <article class="card">
                <img src="${item.image}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>${item.address}</p>
                <p><strong>${item.price}</strong></p>
                <button class="book-btn" style="background:#ff4d4d;" onclick="removeBooking(${index})">
                    Скасувати бронювання
                </button>
            </article>`;
    });
}

// ТУТ ДОДАНО ПІДТВЕРДЖЕННЯ ВИДАЛЕННЯ
function removeBooking(index) {
    // Використання умовного оператора if для підтвердження дії
    if (confirm("Ви впевнені, що хочете скасувати це бронювання?")) {
        let bookings = JSON.parse(localStorage.getItem('myBookings')) || [];
        
        // Видаляємо елемент з масиву за індексом
        bookings.splice(index, 1);
        
        // Перезаписуємо сховище
        localStorage.setItem('myBookings', JSON.stringify(bookings));
        
        // Перемальовуємо список
        displayBookings();
    }
}

// 4. Інтерактивна мапа (Завдання 3)
function initMap() {
    const mapBox = document.getElementById('map');
    if (!mapBox) return;

    const map = L.map('map').setView([49.8413, 24.0311], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    apartmentsData.forEach(apt => {
        const marker = L.marker(apt.coords).addTo(map);
        
        // Спливаюче вікно з фото та посиланням
        marker.bindPopup(`
            <div style="text-align:center;">
                <img src="${apt.image}" style="width:120px; border-radius:5px; margin-bottom:5px;">
                <h4 style="margin:0;">${apt.name}</h4>
                <a href="${apt.details}" style="color:#d81b60; font-weight:bold; text-decoration:none;">Детальніше</a>
            </div>
        `);

        marker.on('click', () => {
            document.getElementById('map-info-box').innerText = `${apt.name}: ${apt.address}`;
        });
    });
}

// 5. Валідація форми контактів
function handleContact() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = form.querySelector('input[type="text"]').value;
        const email = form.querySelector('input[type="email"]').value;

        if (name.length < 2 || !email.includes('@')) {
            alert("Будь ласка, введіть коректні дані!");
        } else {
            alert(`Дякуємо, ${name}! Ми зв'яжемося з вами найближчим часом.`);
            form.reset();
        }
    });
}

// 6. Синхронізація сторінок деталей
function initDetails() {
    const titleEl = document.querySelector('.detail-info h2');
    const btn = document.querySelector('.detail-info .book-btn');
    if (!titleEl || !btn) return;

    // Знаходимо квартиру в масиві за назвою в заголовку
    const apt = apartmentsData.find(a => titleEl.innerText.includes(a.name));
    
    if (apt) {
        btn.onclick = () => processBooking(apt.id);
        btn.id = `btn-${apt.id}`;

        // Створюємо елемент статусу
        const statusP = document.createElement('p');
        statusP.id = `status-${apt.id}`;
        statusP.className = "status-label";
        btn.parentNode.insertBefore(statusP, btn);

        let saved = JSON.parse(localStorage.getItem('myBookings')) || [];
        if (saved.some(b => b.name === apt.name)) {
            updateUI(apt.id);
        } else {
            statusP.innerText = "Статус: Доступно";
            statusP.className = "status-available status-label";
        }
    }
}

// Запуск усіх функцій після завантаження DOM
document.addEventListener('DOMContentLoaded', () => {
    renderApartments();
    displayBookings();
    initMap();
    handleContact();
    initDetails();
});