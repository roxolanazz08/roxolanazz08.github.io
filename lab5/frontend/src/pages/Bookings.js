import React, { useState } from 'react';
import { BookingsList } from '../components'; 

function Bookings() {
  const [bookedApts, setBookedApts] = useState(JSON.parse(localStorage.getItem('myBookings')) || []);

  const handleCancel = (id) => {
    if (window.confirm("Скасувати?")) {
      const updated = bookedApts.filter(apt => apt.id !== id);
      setBookedApts(updated);
      localStorage.setItem('myBookings', JSON.stringify(updated));
    }
  };

  return (
    <section>
      <h2 style={{textAlign: 'center', marginTop: '30px'}}>Ваші бронювання</h2>
      <BookingsList bookedItems={bookedApts} onCancel={handleCancel} />
    </section>
  );
}

export default Bookings;