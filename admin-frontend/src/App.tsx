import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import MoviesPage from './pages/movies/MoviesPage';
import MovieFormPage from './pages/movies/MovieFormPage';
import MovieDetailPage from './pages/movies/MovieDetailPage';

// User Management Pages
import UsersPage from './pages/users/UsersPage';
import UserFormPage from './pages/users/UserFormPage';
import UserDetailPage from './pages/users/UserDetailPage';

// Screening Management Pages
import ScreeningsPage from './pages/screenings/ScreeningsPage';
import ScreeningFormPage from './pages/screenings/ScreeningFormPage';
import ScreeningDetailPage from './pages/screenings/ScreeningDetailPage';
import BulkCreatePage from './pages/screenings/BulkCreatePage';
import ScreeningStatisticsPage from './pages/screenings/ScreeningStatisticsPage';

// Cinema Management Pages
import CinemasPage from './pages/cinemas/CinemasPage';
import CinemaFormPage from './pages/cinemas/CinemaFormPage';
import CinemaDetailPage from './pages/cinemas/CinemaDetailPage';
import CinemaHallFormPage from './pages/cinemas/CinemaHallFormPage';

// Booking Management Pages
import BookingsPage from './pages/bookings/BookingsPage';
import BookingDetailPage from './pages/bookings/BookingDetailPage';
import BookingEditPage from './pages/bookings/BookingEditPage';
import BookingStatisticsPage from './pages/bookings/BookingStatisticsPage';

// Auth
import AuthService from './services/auth.service';

// Layout component to redirect if not authenticated
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = AuthService.isLoggedIn();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang đăng nhập */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Trang Admin */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />

        {/* Quản lý phim */}
        <Route path="/admin/movies" element={
          <ProtectedRoute>
            <MoviesPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/movies/add" element={
          <ProtectedRoute>
            <MovieFormPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/movies/edit/:id" element={
          <ProtectedRoute>
            <MovieFormPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/movies/:id" element={
          <ProtectedRoute>
            <MovieDetailPage />
          </ProtectedRoute>
        } />

        {/* Quản lý người dùng */}
        <Route path="/admin/users" element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/users/add" element={
          <ProtectedRoute>
            <UserFormPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/users/edit/:id" element={
          <ProtectedRoute>
            <UserFormPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/users/:id" element={
          <ProtectedRoute>
            <UserDetailPage />
          </ProtectedRoute>
        } />

        {/* Quản lý lịch chiếu */}
        <Route path="/admin/screenings" element={
          <ProtectedRoute>
            <ScreeningsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/screenings/add" element={
          <ProtectedRoute>
            <ScreeningFormPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/screenings/edit/:id" element={
          <ProtectedRoute>
            <ScreeningFormPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/screenings/:id" element={
          <ProtectedRoute>
            <ScreeningDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/screenings/bulk-create" element={
          <ProtectedRoute>
            <BulkCreatePage />
          </ProtectedRoute>
        } />
        <Route path="/admin/screenings/statistics" element={
          <ProtectedRoute>
            <ScreeningStatisticsPage />
          </ProtectedRoute>
        } />

        {/* Quản lý rạp chiếu phim */}
        <Route path="/admin/cinemas" element={
          <ProtectedRoute>
            <CinemasPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/cinemas/add" element={
          <ProtectedRoute>
            <CinemaFormPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/cinemas/edit/:id" element={
          <ProtectedRoute>
            <CinemaFormPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/cinemas/:id" element={
          <ProtectedRoute>
            <CinemaDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/cinemas/:cinemaId/halls/add" element={
          <ProtectedRoute>
            <CinemaHallFormPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/cinemas/:cinemaId/halls/edit/:hallId" element={
          <ProtectedRoute>
            <CinemaHallFormPage />
          </ProtectedRoute>
        } />

        {/* Quản lý đặt vé */}
        <Route path="/admin/bookings" element={
          <ProtectedRoute>
            <BookingsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/bookings/statistics" element={
          <ProtectedRoute>
            <BookingStatisticsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/bookings/:id" element={
          <ProtectedRoute>
            <BookingDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/bookings/edit/:id" element={
          <ProtectedRoute>
            <BookingEditPage />
          </ProtectedRoute>
        } />

        {/* Bắt lỗi 404 */}
        <Route path="/admin/*" element={<NotFoundPage />} />

        {/* Mặc định chuyển hướng về Dashboard */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
