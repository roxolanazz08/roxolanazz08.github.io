import React from 'react';

function Contacts() {
  return (
    <div className="contact-page-wrapper">
      <section className="contact-container">
        {/* Ліва частина з текстом */}
        <div className="contact-info">
          <h2>Контакти</h2>
          <p><strong>Адреса:</strong> м. Львів, вул. Сахарова, 23</p>
          <p><strong>Телефон:</strong> +380 00 000 00 00</p>
          <p><strong>Email:</strong> info@comfortstay.ua</p>
        </div>

        {/* Права частина з формою */}
        <form 
          className="contact-form" 
          onSubmit={(e) => { e.preventDefault(); alert('Надіслано!'); }}
        >
          <input type="text" placeholder="Ім'я" required />
          <input type="email" placeholder="Ваш Email" required />
          <textarea placeholder="Повідомлення" rows="5" required></textarea>
          <button type="submit">Надіслати</button>
        </form>
      </section>
    </div>
  );
}

export default Contacts;