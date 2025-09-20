import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { Home, TestimonialsPage, Book, Login, SignUp, UserDashboard, Admin } from './pages'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import { Toaster } from 'react-hot-toast'
import 'react-phone-input-2/lib/style.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="testimonials" element={<TestimonialsPage />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="book" element={
            <ProtectedRoute>
              <Book />
            </ProtectedRoute>
          } />
          <Route path="dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="admin" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)