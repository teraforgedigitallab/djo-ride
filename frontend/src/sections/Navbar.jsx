import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, CarTaxiFront, LogIn, LogOut, Settings } from 'lucide-react';
import Button from '../components/Button';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.replace('#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location]);

  return null;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('home');
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const clickedNavRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      if (!clickedNavRef.current) {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.scrollY;

        sections.forEach(section => {
          const sectionHeight = section.offsetHeight;
          const sectionTop = section.offsetTop - 100;
          const sectionId = section.getAttribute('id');

          if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            setActiveLink(sectionId);
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'Services', href: '#services', id: 'services' },
    { name: 'How It Works', href: '#how-it-works', id: 'how-it-works' },
    { name: 'Testimonials', href: '#testimonials', id: 'testimonials' },
    { name: 'FAQ', href: '#faq', id: 'faq' },
    { name: 'Contact', href: '#contact', id: 'contact' },
  ];

  const getSectionLink = (id) => `/#${id}`;

  const handleLinkClick = (id) => {
    setActiveLink(id);
    clickedNavRef.current = true;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      clickedNavRef.current = false;
    }, 1000);
  };

  return (
    <motion.nav
      className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'py-3 bg-background/95 backdrop-blur-md shadow-lg shadow-primary/5' : 'py-5 bg-transparent'}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <ScrollToHash />
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="mr-2 md:mr-10"
            >
              <Link to="/" className="flex items-center">
                <div className="relative">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <CarTaxiFront size={16} className="text-white md:size-5" />
                  </div>
                </div>
                <span className="ml-2 text-xl md:text-2xl font-extrabold text-primary">DJO<span className="text-secondary">Ride</span></span>
              </Link>
            </motion.div>

            <div className="hidden lg:flex space-x-1">
              <AnimatePresence mode="sync">
                {navLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={getSectionLink(link.id)}
                    className={`px-3 md:px-4 py-2 rounded-lg transition-colors duration-300 relative ${activeLink === link.id ? 'text-primary' : 'text-text hover:text-primary'}`}
                    onClick={() => handleLinkClick(link.id)}
                  >
                    {link.name}
                    {activeLink === link.id && (
                      <motion.div
                        className="absolute bottom-0 left-0 h-1 bg-primary rounded-full w-full"
                        layoutId="activeNavIndicator"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                          duration: 0.35
                        }}
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 1 }}
                      />
                    )}
                  </Link>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden lg:flex gap-2 align-center justify-center">
            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                {/* Admin button - only show if admin */}
                {isAdmin && isAdmin() && (
                  <Link to="/admin">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1 px-3"
                    >
                      <Settings size={16} />
                      Admin
                    </Button>
                  </Link>
                )}
                
                {/* Logout Button */}
                <Button
                  onClick={handleLogout}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1 px-3"
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button
                  className="flex items-center gap-1 px-3"
                  size='sm'
                  variant="outline"
                >
                  <LogIn size={16} />
                  Login
                </Button>
              </Link>
            )}

            {/* Register Now button */}
            <Link to="/signup">
              <Button
                variant="primary"
                size="sm"
                className="flex items-center gap-1 !px-3 !py-2"
              >
                Register Now
              </Button>
            </Link>
          </div>

          <motion.div
            className="lg:hidden"
            whileTap={{ scale: 0.9 }}
          >
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg bg-primary/10 text-primary"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </motion.div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="lg:hidden mt-4 bg-white rounded-xl shadow-xl overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="py-3">
                {navLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={getSectionLink(link.id)}
                    className={`block px-6 py-3 transition-colors duration-200 ${activeLink === link.id ? 'bg-primary/10 text-primary font-medium' : 'text-text'}`}
                    onClick={() => {
                      setIsOpen(false);
                      handleLinkClick(link.id);
                    }}
                  >
                    {link.name}
                  </Link>
                ))}

                <div className="px-5 pt-3 pb-4 border-t border-gray-100 mt-3 flex flex-col gap-2">
                  {/* Mobile Auth Buttons */}
                  {user ? (
                    <>
                      {/* Admin link for mobile */}
                      {isAdmin && isAdmin() && (
                        <Link to="/admin" onClick={() => setIsOpen(false)}>
                          <Button
                            className="flex items-center justify-center gap-2 w-full"
                            size='sm'
                            variant="outline"
                          >
                            <Settings size={16} />
                            Admin Dashboard
                          </Button>
                        </Link>
                      )}
                      
                      {/* Logout button for mobile */}
                      <Button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full"
                        size='sm'
                        variant="outline"
                      >
                        <LogOut size={16} />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button
                        className="flex items-center justify-center gap-2 w-full"
                        size='sm'
                        variant="outline"
                      >
                        <LogIn size={16} />
                        Login
                      </Button>
                    </Link>
                  )}

                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex items-center justify-center gap-2 w-full !py-2"
                    >
                      Register Now
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};


export default Navbar;
