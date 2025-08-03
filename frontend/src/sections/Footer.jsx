import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Instagram, ChevronRight, CarTaxiFront, ArrowRight } from 'lucide-react';

const Footer = () => {
  const footerLinks = [
    {
      title: "Quick Links",
      links: [
        { name: "Home", href: "#" },
        { name: "Services", href: "#services" },
        { name: "How It Works", href: "#how-it-works" },
        { name: "Testimonials", href: "#testimonials" },
        { name: "FAQ", href: "#faq" },
        { name: "Contact", href: "#contact" }
      ]
    },
    {
      title: "Services",
      links: [
        { name: "Airport Transfers", href: "#" },
        { name: "Hotel Transfers", href: "#" },
        { name: "Corporate Events", href: "#" },
        { name: "Executive Services", href: "#" },
        { name: "Group Transportation", href: "#" },
        { name: "International Services", href: "#" }
      ]
    }
  ];

  const contactInfo = [
    {
      icon: <MapPin size={20} className="mr-3 text-accent flex-shrink-0 mt-1" />,
      content: "Mumbai, Maharashtra,\nIndia 400001",
      href: "https://maps.google.com"
    },
    {
      icon: <Phone size={20} className="mr-3 text-accent flex-shrink-0" />,
      content: "+91 99999 99999",
      href: "tel:+919999999999"
    },
    {
      icon: <Mail size={20} className="mr-3 text-accent flex-shrink-0" />,
      content: "contact@delightfuljourney.com",
      href: "mailto:contact@delightfuljourney.com"
    }
  ];

  const socialLinks = [
    { icon: <Facebook size={20} />, href: "#", name: "Facebook" },
    { icon: <Twitter size={20} />, href: "#", name: "Twitter" },
    { icon: <Linkedin size={20} />, href: "#", name: "LinkedIn" },
    { icon: <Instagram size={20} />, href: "#", name: "Instagram" }
  ];

  return (
    <footer className="relative bg-text pt-20 pb-10 overflow-hidden">
    
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center mb-6">
              <div className="relative">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <CarTaxiFront size={20} className="text-white" />
                </div>
              </div>
              <span className="ml-3 text-2xl font-bold text-white">DJO<span className="text-accent">Ride</span></span>
            </div>
            <p className="text-white/70 mb-6">
              Professional airport transfer services tailored for corporate clients. Reliable, efficient, and stress-free transportation solutions for businesses worldwide.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-accent/80 flex items-center justify-center text-white/70 hover:text-white transition-all duration-300"
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {footerLinks.map((group, groupIndex) => (
            <motion.div
              key={groupIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 + groupIndex * 0.1 }}
            >
              <h4 className="text-lg font-semibold text-white mb-6">{group.title}</h4>
              <ul className="space-y-3">
                {group.links.map((link, linkIndex) => (
                  <motion.li
                    key={linkIndex}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors duration-300 flex items-center"
                    >
                      <ChevronRight size={16} className="mr-2 text-accent" />
                      <span>{link.name}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold text-white mb-6">Contact Us</h4>
            <ul className="space-y-4">
              {contactInfo.map((item, index) => (
                <motion.li
                  key={index}
                  className="flex items-start"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.icon}
                  <a href={item.href} className="text-white/70 hover:text-white transition-colors duration-300">
                    {item.content.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < item.content.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </a>
                </motion.li>
              ))}
            </ul>

            <div className="mt-8 p-5 bg-white/10 rounded-xl">
              <h5 className="text-white font-medium mb-3">Subscribe to our newsletter</h5>
              <div className="flex overflow-hidden">
                <input
                  type="email"
                  name="email"
                  placeholder="Your email"
                  autoComplete="email"
                  className="flex-grow px-4 py-2 bg-white/20 rounded-l-lg text-white placeholder:text-white/50 focus:outline-none w-full"
                />
                <button className="bg-accent hover:bg-accent/90 text-white px-4 rounded-r-lg transition-colors duration-300 cursor-pointer">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/50 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Delightful Journey. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-white/50 hover:text-white text-sm transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="text-white/50 hover:text-white text-sm transition-colors duration-300">Terms of Service</a>
            <a href="#" className="text-white/50 hover:text-white text-sm transition-colors duration-300">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;