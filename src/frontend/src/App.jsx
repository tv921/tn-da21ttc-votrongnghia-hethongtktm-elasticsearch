import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import SearchPage from './page/SearchPage';
import ResultPage from './page/ResultPage';
import UploadPage from './page/UploadPage';
import RegisterPage from './page/RegisterPage';
import LoginPage from './page/LoginPage';
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDocumentPage from './page/AdminDocumentPage';
import AdminUserPage from './page/AdminUserPage';
import AdminSearchHistoryPage from "./page/AdminSearchHistoryPage";
import ResetPasswordPage from "./page/ResetPasswordPage";
import UserProfile from './components/UserProfile';


function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/result/:id" element={<ResultPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/users" element={<AdminUserPage />} />
        <Route path="/admin/search-history" element={<AdminSearchHistoryPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<UserProfile />} /> 
       

        {/* Chỉ admin mới truy cập */}
        <Route
          path="/upload"
          element={
            <ProtectedRoute role="admin">
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/documents"
          element={
          <ProtectedRoute role="admin">
          <AdminDocumentPage />
          </ProtectedRoute>
          }
/>
      </Routes>
    </Router>
  );
}

export default App;

