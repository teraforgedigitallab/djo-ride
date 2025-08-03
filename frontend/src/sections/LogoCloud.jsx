import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

const LogoCloud = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [linePositions, setLinePositions] = useState([]);
  const logoRefs = useRef([]);
  const containerRef = useRef(null);

  const companies = [
    { name: "IBM", logo: "/images/companies/ibm.jpg" },
    { name: "ITC", logo: "/images/companies/itc.png" },
    { name: "Swiggy", logo: "/images/companies/swiggy.png" },
    { name: "TCS", logo: "/images/companies/tcs.png" },
    { name: "Reliance", logo: "/images/companies/reliance.jpg" },
    { name: "Wipro", logo: "/images/companies/wipro.jpg" }
  ];

  // Calculate line positions when components mount and on window resize
  useEffect(() => {
    const calculateLinePositions = () => {
      if (!containerRef.current || logoRefs.current.length === 0) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const logoPositions = logoRefs.current.map(ref => {
        if (!ref) return null;
        const rect = ref.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top
        };
      }).filter(Boolean);

      // Only proceed if we have positions
      if (logoPositions.length === 0) return;

      // Create lines based on logo layout
      const newLines = [];

      // Calculate rows - for small screens we might have 2 or 3 rows
      const yPositions = [...new Set(logoPositions.map(p => Math.round(p.y)))].sort((a, b) => a - b);

      // Connect logos horizontally by row
      yPositions.forEach(y => {
        const rowLogos = logoPositions.filter(p => Math.round(p.y) === y)
          .sort((a, b) => a.x - b.x);

        if (rowLogos.length > 1) {
          for (let i = 0; i < rowLogos.length - 1; i++) {
            newLines.push({
              x1: rowLogos[i].x,
              y1: rowLogos[i].y,
              x2: rowLogos[i + 1].x,
              y2: rowLogos[i + 1].y,
              type: 'horizontal'
            });
          }
        }
      });

      // Connect logos vertically by column
      const xPositions = [...new Set(logoPositions.map(p => Math.round(p.x)))].sort((a, b) => a - b);

      xPositions.forEach(x => {
        const colLogos = logoPositions.filter(p => Math.round(p.x) === x)
          .sort((a, b) => a.y - b.y);

        if (colLogos.length > 1) {
          for (let i = 0; i < colLogos.length - 1; i++) {
            newLines.push({
              x1: colLogos[i].x,
              y1: colLogos[i].y,
              x2: colLogos[i + 1].x,
              y2: colLogos[i + 1].y,
              type: 'vertical'
            });
          }
        }
      });

      setLinePositions(newLines);
    };

    // Initialize refs array
    logoRefs.current = logoRefs.current.slice(0, companies.length);

    // Calculate initial positions
    calculateLinePositions();

    // Add resize listener
    window.addEventListener('resize', calculateLinePositions);

    // Recalculate after a short delay to ensure all elements are properly rendered
    const timer = setTimeout(calculateLinePositions, 500);

    return () => {
      window.removeEventListener('resize', calculateLinePositions);
      clearTimeout(timer);
    };
  }, [companies.length]);

  return (
    <section className="py-10 relative overflow-hidden bg-gradient-to-b from-background to-background/90">
      <div className="absolute inset-0 overflow-hidden">
        {/* Background grid pattern */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(107, 72, 190, 0.2)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent inline-block">
            Powering Corporate Travel for Industry Leaders
          </h3>
        </motion.div>

        <div ref={containerRef} className="relative max-w-5xl mx-auto">
          {/* Dynamic connecting lines between logos */}
          <svg className="absolute inset-0 w-full h-full z-0 block pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <g stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.6">
              {linePositions.map((line, index) => (
                <path
                  key={index}
                  d={`M${line.x1},${line.y1} L${line.x2},${line.y2}`}
                />
              ))}
            </g>
          </svg>
          
          <div className="flex flex-wrap justify-center gap-8 sm:gap-10 relative z-10">
            {companies.map((company, index) => (
              <motion.div
                key={index}
                ref={el => logoRefs.current[index] = el}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <div className="relative group w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                  {/* Background shape with animation */}
                  <motion.div
                    className="absolute inset-0 bg-white rounded-xl shadow-lg"
                    animate={{
                      boxShadow: hoveredIndex === index
                        ? '0 10px 10px rgba(0, 0, 0, 0.05)'
                        : '0 4px 15px rgba(0, 0, 0, 0.05)'
                    }}
                  />

                  {/* Logo */}
                  <div className="w-2/3 h-2/3 relative flex items-center justify-center">
                    <img
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-16 text-center max-w-md mx-auto"
        >
          <p className="text-text/80 italic text-sm">
            "Join the ranks of industry leaders who trust our services for their corporate travel needs"
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default LogoCloud;