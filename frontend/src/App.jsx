import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import TestPage from './pages/TestPage';
import InfoPage from './pages/InfoPage';
import ResultPage from './pages/ResultPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/result/:token" element={<ResultPage />} />
      </Routes>
    </Layout>
  );
}
