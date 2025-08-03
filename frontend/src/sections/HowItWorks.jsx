import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, UserPlus, Car, Check, ChevronRight } from 'lucide-react';
import Button from '../components/Button';
import { Link } from 'react-router-dom'

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      icon: <UserPlus size={28} className="text-white" />,
      title: "Register Your Business",
      description: "Quick onboarding process for corporate airport transfer services.",
      bullets: [
        "Corporate account setup",
        "Multiple user access levels",
        "Centralized billing system",
        "Company travel policy integration"
      ],
      cta: "Register Now",
      ctaLink: "/signup",
      image: "/images/how-it-works/howitworks1.jpg"
    },
    {
      icon: <ClipboardCheck size={28} className="text-white" />,
      title: "Schedule Airport Transfers",
      description: "Streamlined booking process for all your airport pickup and drop requirements.",
      bullets: [
        "Flight tracking integration",
        "Meet & greet services",
        "Bulk booking options",
        "Preferred vehicle selection"
      ],
      cta: "Schedule Ride",
      ctaLink: "/book",
      image: "/images/how-it-works/howitworks2.jpg"
    },
    {
      icon: <Car size={28} className="text-white" />,
      title: "Enjoy Seamless Travel",
      description: "Experience reliable airport transfers with real-time monitoring and professional chauffeurs.",
      bullets: [
        "Real-time status updates",
        "Chauffeur contact details",
        "Automated travel reports",
        "24/7 customer support"
      ],
      cta: "Learn More",
      ctaLink: "#services",
      image: "/images/how-it-works/howitworks3.jpg"
    }
  ];

  return (
    <section id="how-it-works" className="bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden py-10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span
            className="px-4 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Seamless Integration
          </motion.span>
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-text mt-4 mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            How It <span className="text-primary">Works</span>
          </motion.h2>
          <motion.p
            className="text-lg text-text/70"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Provide reliable airport transfers for your clients, guests, or employees in three simple steps.
          </motion.p>
        </motion.div>

        {/* Steps navigation */}
        <div className="mb-12">
          <div className="flex justify-center items-center">
            <div className="flex items-center">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  {/* Step item */}
                  <motion.div
                    className="relative px-2 md:px-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <button
                      onClick={() => setActiveStep(index)}
                      className="flex flex-col items-center cursor-pointer"
                      aria-label={`Step ${index + 1}: ${step.title}`}
                    >
                      {/* Number circle */}
                      <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full ${activeStep === index
                        ? 'bg-gradient-to-br from-primary to-secondary shadow-md'
                        : 'bg-primary/10'
                        }`}>
                        <span className={`text-sm md:text-base font-medium ${activeStep === index ? 'text-white' : 'text-primary/70'
                          }`}>
                          {index + 1}
                        </span>
                      </div>

                      {/* Step title - no line clamp */}
                      <span className={`text-xs md:text-sm font-medium text-center mt-2 ${activeStep === index ? 'text-primary font-semibold' : 'text-text/70'
                        }`}>
                        {step.title}
                      </span>
                    </button>
                  </motion.div>

                  {/* Connector line between steps */}
                  {index !== steps.length - 1 && (
                    <div className="w-8 md:w-12 h-0.5 bg-primary/20">
                      {activeStep > index && (
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.5 }}
                        />
                      )}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Active step content */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-10 mt-8"
        >
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="lg:w-1/2 order-2 lg:order-1">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mr-4">
                  {steps[activeStep].icon}
                </div>
                <h3 className="text-2xl font-bold text-text">{steps[activeStep].title}</h3>
              </div>

              <p className="text-text/70 text-lg mb-8">
                {steps[activeStep].description}
              </p>

              <div className="mb-10">
                <h4 className="font-semibold mb-4 text-text">Key Benefits:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {steps[activeStep].bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <Check size={14} className="text-primary" />
                      </div>
                      <span className="text-text/80">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link to={steps[activeStep].ctaLink}>
              <Button className="flex items-center gap-1">
                {steps[activeStep].cta}
                <ChevronRight size={18} />
              </Button>
              </Link>
            </div>

            <motion.div
              className="lg:w-1/2 order-1 lg:order-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Image size suggestion: 600x400 for each process step */}
              <img
                src={steps[activeStep].image}
                alt={steps[activeStep].title}
                className="w-full h-auto rounded-xl shadow-lg object-cover"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;