import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from './sections';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './utils/ScrollToTop';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AuthProvider } from './contexts/AuthContext';

const App = () => {
  return (
    <AuthProvider>
    <CurrencyProvider>
      <div className="min-h-screen bg-background text-text font-sans">
        <ScrollToTop />
        <header>
          <Navbar />
        </header>

        <main>
          <Outlet />
        </main>

        <Footer />
      </div>
    </CurrencyProvider>
    </ AuthProvider>
  );
};

export default App;