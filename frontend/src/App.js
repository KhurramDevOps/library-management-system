import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import BooksPage from './pages/Books/BooksPage';
import AddBookPage from './pages/Books/AddBookPage';
import EditBookPage from './pages/Books/EditBookPage';
import StudentsPage from './pages/Students/StudentsPage';
import AddStudentPage from './pages/Students/AddStudentPage';
import StudentDetailPage from './pages/Students/StudentDetailPage';
import IssueBookPage from './pages/Issues/IssueBookPage';
import ReturnBookPage from './pages/Issues/ReturnBookPage';
import IssueHistoryPage from './pages/Issues/IssueHistoryPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/books" element={<ProtectedRoute><BooksPage /></ProtectedRoute>} />
          <Route path="/books/add" element={<ProtectedRoute><AddBookPage /></ProtectedRoute>} />
          <Route path="/books/edit/:id" element={<ProtectedRoute><EditBookPage /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
          <Route path="/students/add" element={<ProtectedRoute><AddStudentPage /></ProtectedRoute>} />
          <Route path="/students/:id" element={<ProtectedRoute><StudentDetailPage /></ProtectedRoute>} />
          <Route path="/issues/issue" element={<ProtectedRoute><IssueBookPage /></ProtectedRoute>} />
          <Route path="/issues/return" element={<ProtectedRoute><ReturnBookPage /></ProtectedRoute>} />
          <Route path="/issues/history" element={<ProtectedRoute><IssueHistoryPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
