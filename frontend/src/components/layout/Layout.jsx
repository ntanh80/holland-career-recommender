import Header from './Header';
import Footer from './Footer';
import { ToastContainer } from '../ui/Toast';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ToastContainer />
    </div>
  );
}
