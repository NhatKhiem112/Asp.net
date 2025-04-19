import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailPage from './pages/MovieDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import CinemasPage from './pages/CinemasPage';
import CinemaDetailPage from './pages/CinemaDetailPage';
import SeatBookingPage from './pages/SeatBookingPage';
import BookingPaymentPage from './pages/BookingPaymentPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import './App.css';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-dark">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/change-password" element={<ChangePasswordPage />} />
          <Route path="/cinemas" element={<CinemasPage />} />
          <Route path="/cinemas/:id" element={<CinemaDetailPage />} />
          <Route path="/screenings/:id/seats" element={<SeatBookingPage />} />
          <Route path="/bookings/:id/payment" element={<BookingPaymentPage />} />
          <Route path="/profile/bookings" element={<BookingHistoryPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
