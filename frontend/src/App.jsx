import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import TestPage from './pages/TestPage';
import InfoPage from './pages/InfoPage';
import ResultPage from './pages/ResultPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import QuestionsManagePage from './pages/admin/QuestionsManagePage';
import CareersManagePage from './pages/admin/CareersManagePage';
import UsersListPage from './pages/admin/UsersListPage';
import ResultsListPage from './pages/admin/ResultsListPage';
import EmailLogsPage from './pages/admin/EmailLogsPage';
import HollandTypesManagePage from './pages/admin/HollandTypesManagePage';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/result/:token" element={<ResultPage />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="questions" element={<QuestionsManagePage />} />
        <Route path="careers" element={<CareersManagePage />} />
        <Route path="users" element={<UsersListPage />} />
        <Route path="results" element={<ResultsListPage />} />
        <Route path="email-logs" element={<EmailLogsPage />} />
        <Route path="holland-types" element={<HollandTypesManagePage />} />
      </Route>
    </Routes>
  );
}
