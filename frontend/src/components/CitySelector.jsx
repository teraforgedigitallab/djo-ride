import { useState, useEffect } from 'react';
import { Search, MapPin, Globe, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import data from '../data/data.json';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { US, IN, AE, CA, GB, AU } from 'country-flag-icons/react/3x2';

const CitySelector = ({ onCitySelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showCountrySelector, setShowCountrySelector] = useState(true);
  const [countryPopularCities, setCountryPopularCities] = useState([]);
  const [hasCountryData, setHasCountryData] = useState(true);

  // Fetch countries from Firestore
  useEffect(() => {
    const fetchCountries = async () => {
      const db = getFirestore();
      const pricingSnapshot = await getDocs(collection(db, "pricing"));
      const availableCountries = [];
      pricingSnapshot.forEach(doc => {
        const docData = doc.data();
        if (docData.country) availableCountries.push(docData.country);
      });
      setCountries(availableCountries);
    };
    fetchCountries();
  }, []);

  // Fetch cities for selected country from Firestore
  useEffect(() => {
    if (selectedCountry) {
      setShowCountrySelector(false);

      const fetchCities = async () => {
        const db = getFirestore();
        const pricingSnapshot = await getDocs(collection(db, "pricing"));
        let countryData = null;
        pricingSnapshot.forEach(doc => {
          const docData = doc.data();
          if (docData.country === selectedCountry) countryData = docData;
        });

        if (countryData && countryData.states && countryData.states.length > 0) {
          setHasCountryData(true);
          const countryCities = countryData.states
            .filter(item => item.city)
            .map(item => ({
              city: item.city,
              state: item.state,
              country: selectedCountry
            }));
          setCities(countryCities);
          setFilteredCities(countryCities);

          // Use static popularCities from data.json
          const popularCitiesForCountry = data.popularCities
            .filter(item => item.country === selectedCountry)
            .map(item => item.name);
          setCountryPopularCities(popularCitiesForCountry);
        } else {
          setHasCountryData(false);
          setCities([]);
          setFilteredCities([]);
          setCountryPopularCities([]);
        }
      };
      fetchCities();
    } else {
      setCities([]);
      setFilteredCities([]);
      setCountryPopularCities([]);
      setHasCountryData(true);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (searchTerm && cities.length > 0) {
      const filtered = cities.filter(
        item => item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cities);
    }
  }, [searchTerm, cities]);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setSearchTerm('');
  };

  const handleCitySelect = (city) => {
    onCitySelect(city);
  };

  const toggleCountrySelector = () => {
    setShowCountrySelector(prev => !prev);
  };

    // Function to get country flag component
  const CountryFlag = ({ country }) => {
    const flagSize = { width: '100%', height: '100%' };
    
    switch(country.toLowerCase()) {
      case 'usa':
        return <US style={flagSize} />;
      case 'india':
        return <IN style={flagSize} />;
      case 'uae':
        return <AE style={flagSize} />;
      case 'canada':
        return <CA style={flagSize} />;
      case 'uk':
        return <GB style={flagSize} />;
      case 'australia':
        return <AU style={flagSize} />;
      default:
        return country.charAt(0); // Fallback to first letter
    }
  };

  // Use static images from data.json
  const getCityImageUrl = (city) => {
    const popularCity = data.popularCities.find(
      item => item.name.toLowerCase() === city.toLowerCase()
    );
    return popularCity ? popularCity.image : `/images/top-cities/${city.toLowerCase()}.jpg`;
  };

  // Optimized animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  // Function to determine which city content to show
  const getCityContent = () => {
    if (searchTerm && filteredCities.length === 0) {
      return "no-results";
    } else if (!searchTerm && countryPopularCities.length > 0) {
      return "popular-cities";
    } else if (filteredCities.length > 0) {
      return "cities-list";
    }
    return null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-20">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-2xl font-bold mb-6 text-center text-primary"
      >
        Select City to Book your Ride
      </motion.h2>

      {/* Country Selector */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-primary flex items-center">
            <Globe size={18} className="mr-2" />
            {selectedCountry ? `Country: ${selectedCountry}` : "Select Country"}
          </h3>

          {selectedCountry && (
            <button
              onClick={toggleCountrySelector}
              className="flex items-center text-sm font-medium text-primary px-3 py-1.5 rounded-md border border-primary/30 hover:bg-primary/5 transition-colors"
            >
              {showCountrySelector ? 'Hide Options' : 'Change Country'}
              {showCountrySelector ?
                <ChevronUp size={16} className="ml-1" /> :
                <ChevronDown size={16} className="ml-1" />
              }
            </button>
          )}
        </div>

        {/* Fixed country selector visibility */}
        <AnimatePresence>
          {showCountrySelector && (
            <motion.div
              key="country-selector"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden bg-white"
              style={{ willChange: "opacity, height" }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-2 pt-2 bg-white">
                {countries.map((country, index) => (
                  <div
                    key={index}
                    className={`p-2.5 rounded-md border ${selectedCountry === country
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white border-gray-200 hover:border-primary/50'
                      } cursor-pointer transition-colors`}
                    onClick={() => handleCountrySelect(country)}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 p-2 rounded-full flex items-center justify-center ${selectedCountry === country ? 'bg-white text-primary' : 'bg-primary/10 text-primary'
                        }`}>
                        <CountryFlag country={country} />
                      </div>
                      <p className="ml-2 font-medium text-sm">{country}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* City Selection Section */}
      {selectedCountry && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          {/* Show message when country has no data */}
          {!hasCountryData ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-10"
            >
              <div className="inline-block mb-4 p-4 bg-amber-100 rounded-full">
                <AlertCircle size={32} className="text-amber-500" />
              </div>

              <h3 className="text-xl font-semibold mb-3 text-primary">
                Coming Soon to {selectedCountry}!
              </h3>

              <p className="text-gray-600 mb-2 max-w-md mx-auto">
                We're expanding our services to {selectedCountry} very soon. Please check back later or select another country.
              </p>

              <button
                onClick={() => setShowCountrySelector(true)}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Choose Another Country
              </button>
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4 text-primary flex items-center">
                  <MapPin size={18} className="mr-2" />
                  Select City in {selectedCountry}
                </h3>

                <div className="relative">
                  <input
                    id='citySearch'
                    type="text"
                    placeholder="Search city or state..."
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute right-2 top-2 bg-primary text-white p-1 rounded-md">
                    <Search size={20} />
                  </div>
                </div>
              </div>

              {/* City Content */}
              <AnimatePresence mode="wait">
                {getCityContent() === "popular-cities" && (
                  <motion.div
                    key="popular-cities"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8"
                    style={{ willChange: "opacity" }}
                  >
                    <h3 className="text-lg font-medium mb-4 text-primary">Popular Cities in {selectedCountry}</h3>
                    <motion.div
                      className="grid grid-cols-2 md:grid-cols-3 gap-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {countryPopularCities.map(cityName => {
                        const cityData = cities.find(c => c.city === cityName);
                        if (!cityData) return null;

                        return (
                          <motion.div
                            key={cityName}
                            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => handleCitySelect(cityData)}
                            variants={itemVariants}
                            whileHover={{ y: -2 }}
                            style={{ willChange: "transform" }}
                          >
                            <div className="h-32 bg-gray-200 overflow-hidden">
                              <img
                                src={getCityImageUrl(cityName)}
                                alt={cityName}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className="p-3 bg-primary text-white text-center">
                              <h4 className="font-medium">{cityName}</h4>
                              <p className="text-xs opacity-80">{cityData.state}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </motion.div>
                )}

                {getCityContent() === "no-results" && (
                  <motion.div
                    key="no-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-6"
                  >
                    <div className="inline-block mb-4 p-3 bg-accent/10 rounded-full">
                      <MapPin size={32} className="text-accent" />
                    </div>

                    <h3 className="text-xl font-semibold mb-2 text-primary">
                      We couldn't find "{searchTerm}"
                    </h3>

                    <p className="text-gray-600 mb-4">
                      We're expanding rapidly to new cities across {selectedCountry}!
                    </p>

                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      View All Available Cities
                    </button>
                  </motion.div>
                )}

                {getCityContent() === "cities-list" && (
                  <motion.div
                    key="cities-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ willChange: "opacity" }}
                  >
                    <h3 className="text-lg font-medium mb-4 text-primary">
                      {searchTerm ? "Search Results" : `Cities in ${selectedCountry}`}
                    </h3>
                    <motion.div
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {filteredCities.map((city, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          className="p-3 bg-white border border-gray-200 rounded-md group cursor-pointer hover:bg-accent hover:text-white transition-colors"
                          onClick={() => handleCitySelect(city)}
                          whileHover={{ y: -2 }}
                          style={{ willChange: "transform" }}
                        >
                          <p className="font-medium">{city.city}</p>
                          <p className="text-xs text-gray-500 group-hover:text-white/80">{city.state}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CitySelector;
