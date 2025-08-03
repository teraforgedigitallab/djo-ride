import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Clock, MapPin, PlayCircle } from 'lucide-react';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import VideoModal from '../components/VideoModal';

// https://youtu.be/5T4l9eKHQgE?si=Ci08tg0yfG5dA8dO

const HeroSection = () => {
  const containerRef = useRef(null);
  const sectionRef = useRef(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const requestRef = useRef();
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [isInView, setIsInView] = useState(true);

  // Images
  const heroImage = "/images/hero.png"; 

  // YouTube video ID for your demo video
  const demoVideoId = "xJFK1e2Yl08";
  
  // Smoothly animate elements based on mouse position
  const animateParallax = () => {
    if (!containerRef.current || !isInView) return;
    
    const elements = containerRef.current.querySelectorAll('.parallax-element');
    elements.forEach(el => {
      const speed = parseFloat(el.getAttribute('data-speed') || 1);
      const rotateX = mousePositionRef.current.y * 7 * speed; // Reduced intensity from 10 to 7
      const rotateY = -mousePositionRef.current.x * 7 * speed;
      
      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    requestRef.current = requestAnimationFrame(animateParallax);
  };
  
  useEffect(() => {
    // Smooth mouse tracking with lerp (linear interpolation)
    const handleMouseMove = (e) => {
      if (!containerRef.current || !isInView) return;

      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const targetX = (e.clientX - left) / width - 0.5;
      const targetY = (e.clientY - top) / height - 0.5;
      
      // Smooth interpolation
      mousePositionRef.current.x += (targetX - mousePositionRef.current.x) * 0.1;
      mousePositionRef.current.y += (targetY - mousePositionRef.current.y) * 0.1;
    };
    
    // Check if section is in viewport with improved logic
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      
      // Consider element in view when at least 30% of it is visible
      const threshold = 0.3;
      const visibleRatio = Math.min(
        (rect.bottom / viewportHeight),
        (viewportHeight - rect.top) / viewportHeight
      );
      
      const wasInView = isInView;
      const nowInView = visibleRatio > threshold;
      
      if (wasInView !== nowInView) {
        setIsInView(nowInView);
        
        // Reset transform when exiting view
        if (!nowInView && containerRef.current) {
          const elements = containerRef.current.querySelectorAll('.parallax-element');
          elements.forEach(el => {
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
            el.style.transition = 'transform 0.5s ease-out';
          });
          
          // Reset mouse position
          mousePositionRef.current = { x: 0, y: 0 };
          
          // Cancel animation frame
          if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
          }
        } else if (nowInView) {
          // Add transitions when entering view
          if (containerRef.current) {
            const elements = containerRef.current.querySelectorAll('.parallax-element');
            elements.forEach(el => {
              el.style.transition = 'transform 0.2s ease-out';
            });
          }
          
          // Start animation loop
          requestRef.current = requestAnimationFrame(animateParallax);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    // Start animation loop
    requestRef.current = requestAnimationFrame(animateParallax);
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isInView]);

  const openVideoModal = () => setVideoModalOpen(true);
  const closeVideoModal = () => setVideoModalOpen(false);

  return (
    <section id="home" className="relative pt-32 pb-20 overflow-hidden" ref={sectionRef}>
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 ">
          <motion.div
            className="lg:w-1/2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center mb-6">
              <motion.div
                className="px-4 py-1 bg-primary/10 rounded-full text-primary font-medium text-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Trusted by 500+ Corporate Clients
              </motion.div>
            </div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-text mb-6 leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <span className="text-primary">Effortless</span> Airport Transfers for Your Business Teams
            </motion.h1>

            <motion.p
              className="text-lg text-text/80 mb-8 max-w-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Streamline corporate travel with our dedicated fleet, simplified billing, and real-time tracking platform. From airport to hotel and beyond - we handle the logistics so you don't have to.
            </motion.p>

            <motion.div
              className="flex flex-col md:flex-row gap-4 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <Link to="/book">
                <Button size="lg" className="px-8 flex items-center gap-2 shadow-xl shadow-primary/20 w-full md:w-auto">
                  Book Now
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 2 }}
                  >
                    <ArrowRight size={18} />
                  </motion.div>
                </Button>
              </Link>

              <Button 
                variant="outline" 
                size="md" 
                className="px-8 flex items-center gap-2 w-full md:w-auto"
                onClick={openVideoModal}
              >
                Watch Demo
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                >
                  <PlayCircle size={18} className="text-primary" />
                </motion.div>
              </Button>
            </motion.div>

            <motion.div
              className="grid grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              {[
                { icon: <Shield size={20} />, text: "Duty of Care" },
                { icon: <Clock size={20} />, text: "24/7 Service" },
                { icon: <MapPin size={20} />, text: "Global Coverage" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-text/70">
                  <div className="p-1.5 bg-primary/10 rounded-full text-primary">
                    {item.icon}
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="lg:w-1/2 relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            ref={containerRef}
          >
            <div className="relative">
              {/* Main image */}
              <motion.div
                className="parallax-element rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 cursor-pointer"
                data-speed="0.5"
                onClick={openVideoModal}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                style={{ transition: 'transform 0.2s ease-out' }}
              >
                <div className="relative">
                  <img
                    src={heroImage}
                    alt="Premium Airport Transfer Service for Corporate Clients"
                    className="w-full h-[300px] md:h-[500px] object-cover"
                  />
                  <div className="absolute inset-0 bg-text/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <motion.div
                      className="h-16 w-16 bg-primary rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <PlayCircle size={32} className="text-white" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Floating card element 1 */}
              <motion.div
                className="parallax-element absolute -top-8 -left-8 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 max-w-[200px]"
                data-speed="1.0" // Reduced from 1.2
                initial={{ opacity: 0, x: -20, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                style={{ transition: 'transform 0.2s ease-out' }}
              >
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs text-text/60">Average Wait Time</p>
                  <p className="font-bold text-text">{'<'} 8 minutes</p>
                </div>
              </motion.div>

              {/* Floating card element 2 */}
              <motion.div
                className="parallax-element absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl max-w-[220px]"
                data-speed="0.8" // Reduced from 1.0
                initial={{ opacity: 0, x: 20, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                style={{ transition: 'transform 0.2s ease-out' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Shield size={16} />
                  </div>
                  <p className="font-bold text-text">Safety First</p>
                </div>
                <p className="text-xs text-text/60">All drivers background-checked and vehicles regularly inspected</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal 
        isOpen={videoModalOpen} 
        onClose={closeVideoModal} 
        videoId={demoVideoId} 
      />
    </section>
  );
};

export default HeroSection;