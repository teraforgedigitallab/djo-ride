import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-hot-toast';
import { Image, Search, X, Save, Globe, MapPin, AlertCircle, ChevronDown, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/Button';

const CityImageManagementTab = () => {
    // States for data management
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [imageUrls, setImageUrls] = useState({});
    
    // UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [stateFilter, setStateFilter] = useState("");
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewCity, setPreviewCity] = useState(null);

    // Fetch unique countries from pricing collection
    useEffect(() => {
        const fetchCountries = async () => {
            setLoading(true);
            setError(null);
            try {
                const pricingSnapshot = await getDocs(collection(db, "pricing"));
                
                // Extract unique countries
                const countriesMap = new Map();
                pricingSnapshot.docs.forEach(docSnap => {
                    const data = docSnap.data();
                    if (data.countryName && !countriesMap.has(data.countryName)) {
                        countriesMap.set(data.countryName, {
                            name: data.countryName
                        });
                    }
                });
                
                setCountries(Array.from(countriesMap.values()));
            } catch (error) {
                console.error("Error fetching countries:", error);
                setError("Failed to load countries. Please try again.");
                toast.error("Failed to load countries");
            } finally {
                setLoading(false);
            }
        };
        
        fetchCountries();
    }, []);

    // Fetch states when country is selected
    useEffect(() => {
        if (!selectedCountry) {
            setStates([]);
            setCities([]);
            return;
        }
        
        const fetchStates = async () => {
            setLoading(true);
            setError(null);
            try {
                const statesQuery = query(
                    collection(db, "pricing"), 
                    where("countryName", "==", selectedCountry.name)
                );
                
                const statesSnapshot = await getDocs(statesQuery);
                
                // Extract unique states
                const statesMap = new Map();
                statesSnapshot.docs.forEach(docSnap => {
                    const data = docSnap.data();
                    if (data.stateName && !statesMap.has(data.stateName)) {
                        statesMap.set(data.stateName, {
                            name: data.stateName
                        });
                    }
                });
                
                setStates(Array.from(statesMap.values()));
                
                // Fetch all cities for this country
                const citiesData = [];
                const imageUrlsData = {};
                
                statesSnapshot.docs.forEach(docSnap => {
                    const data = docSnap.data();
                    if (data.cityName && data.stateName) {
                        const cityKey = `${data.stateName}-${data.cityName}`;
                        
                        if (!citiesData.some(city => 
                            city.name === data.cityName && city.state === data.stateName)) {
                            
                            citiesData.push({
                                name: data.cityName,
                                state: data.stateName,
                                docId: docSnap.id,
                                imageUrl: data.imageUrl || ''
                            });
                            
                            // Store image URLs
                            imageUrlsData[cityKey] = data.imageUrl || '';
                        }
                    }
                });
                
                setCities(citiesData);
                setImageUrls(imageUrlsData);
                
            } catch (error) {
                console.error("Error fetching states:", error);
                setError("Failed to load states. Please try again.");
                toast.error("Failed to load states");
            } finally {
                setLoading(false);
            }
        };
        
        fetchStates();
        setStateFilter("");
        setSearchTerm("");
    }, [selectedCountry]);

    // Handle image URL change
    const handleImageUrlChange = (state, cityName, url) => {
        const cityKey = `${state}-${cityName}`;
        setImageUrls(prev => ({
            ...prev,
            [cityKey]: url
        }));
    };

    // Save image URL to Firestore
    const saveImageUrl = async (cityName, state, docId) => {
        if (!selectedCountry) {
            toast.error("No country selected");
            return;
        }
        
        if (!cityName) {
            setError("City name is required");
            toast.error("City name is required");
            return;
        }
        
        const cityKey = `${state}-${cityName}`;
        const imageUrl = imageUrls[cityKey];
        
        setLoading(true);
        setError(null);

        try {
            // Update the pricing document with the image URL
            const pricingDocRef = doc(db, "pricing", docId);
            await updateDoc(pricingDocRef, { imageUrl: imageUrl });
            
            toast.success(`Image URL updated for ${cityName}`);
            
            // Update local state to reflect changes
            setCities(cities.map(city => 
                city.name === cityName && city.state === state
                    ? { ...city, imageUrl }
                    : city
            ));
            
        } catch (error) {
            console.error("Error updating image URL:", error);
            setError(`Failed to update image URL for ${cityName}. Error: ${error.message}`);
            toast.error(`Failed to update image URL for ${cityName}`);
        } finally {
            setLoading(false);
        }
    };

    // Show image preview
    const showPreview = (cityName, state) => {
        const cityKey = `${state}-${cityName}`;
        const url = imageUrls[cityKey];
        if (url) {
            setPreviewUrl(url);
            setPreviewCity({ name: cityName, state });
        } else {
            toast.error("No image URL to preview");
        }
    };

    // Close preview
    const closePreview = () => {
        setPreviewUrl(null);
        setPreviewCity(null);
    };

    // Get unique states for filtering
    const uniqueStates = Array.from(new Set(cities.map(city => city.state))).sort();

    // Filter cities by state and search term
    const filteredCities = cities.filter(city => {
        const matchesState = !stateFilter || city.state === stateFilter;
        const matchesSearch = !searchTerm ||
            city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            city.state.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesState && matchesSearch;
    });

    // Group cities by state for display
    const citiesByState = filteredCities.reduce((acc, city) => {
        if (!acc[city.state]) {
            acc[city.state] = [];
        }
        acc[city.state].push(city);
        return acc;
    }, {});

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="bg-white p-6 rounded-lg shadow-md"
            aria-label="City Image Management"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary flex items-center">
                    <Image className="mr-2" />
                    City Image Management
                </h2>
            </div>

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start"
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3 }}
                        role="alert"
                        aria-live="assertive"
                    >
                        <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={18} />
                        <span>{error}</span>
                        <button
                            className="ml-auto text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-1"
                            onClick={() => setError(null)}
                            aria-label="Dismiss error"
                        >
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading indicator */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        className="flex justify-center my-4"
                        aria-live="polite"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Country Selection */}
            <motion.section
                className="mb-8 p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-primary/5 to-gray-50"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <h3 className="text-xl font-semibold text-primary mb-4 flex items-center">
                    <Globe className="mr-2" size={20} />
                    Select Country
                </h3>

                <motion.div
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                    variants={containerVariants}
                >
                    {countries.map((country, index) => (
                        <motion.div
                            key={index}
                            tabIndex={0}
                            role="button"
                            aria-pressed={selectedCountry?.name === country.name}
                            onClick={() => setSelectedCountry(country)}
                            onKeyDown={e => (e.key === "Enter" || e.key === " ") && setSelectedCountry(country)}
                            className={`p-3 rounded-md cursor-pointer transition-all flex items-center justify-between outline-none ring-offset-2 focus:ring-2 focus:ring-primary ${selectedCountry?.name === country.name
                                ? "bg-primary text-white shadow-md"
                                : "bg-white hover:bg-gray-200 text-gray-800"
                                }`}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="font-medium truncate">
                                {country.name}
                                </span>
                            
                        </motion.div>
                    ))}
                </motion.div>
            </motion.section>

            {/* City Image Management Section */}
            <AnimatePresence>
                {selectedCountry && (
                    <motion.section
                        key="city-image-management"
                        className="mb-8 p-4 border border-gray-200 rounded-lg"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <h3 className="text-xl font-semibold text-primary mb-4 flex items-center">
                            <MapPin className="mr-2" size={20} />
                            City Images for {selectedCountry.name}
                        </h3>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-4 mb-6">
                            {/* State Filter */}
                            <div className="w-full md:w-1/3">
                                <label htmlFor="stateFilter" className="block text-sm font-medium text-gray-700 mb-1">
                                    Filter by State:
                                </label>
                                <div className="relative">
                                    <select
                                        id="stateFilter"
                                        value={stateFilter}
                                        onChange={e => setStateFilter(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pr-10"
                                        aria-label="Filter by State"
                                        disabled={loading || uniqueStates.length === 0}
                                    >
                                        <option value="">All States</option>
                                        {uniqueStates.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <ChevronDown size={16} className="text-gray-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="w-full md:w-2/3">
                                <label htmlFor="searchCity" className="block text-sm font-medium text-gray-700 mb-1">
                                    Search City:
                                </label>
                                <div className="relative">
                                    <input
                                        id="searchCity"
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Search city name..."
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pr-10"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <Search size={16} className="text-gray-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* City List by State */}
                        {Object.keys(citiesByState).length > 0 ? (
                            Object.entries(citiesByState).map(([state, stateCities]) => (
                                <motion.div
                                    key={state}
                                    className="mb-8"
                                    variants={itemVariants}
                                >
                                    <h4 className="text-lg font-medium text-primary mb-3 bg-primary/10 p-2 rounded">
                                        {state}
                                    </h4>

                                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">City</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Image URL</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {stateCities.map((city, index) => {
                                                    const cityKey = `${city.state}-${city.name}`;
                                                    return (
                                                        <tr key={`${city.name}-${index}`} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap font-medium">
                                                                {city.name}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <input
                                                                    type="text"
                                                                    value={imageUrls[cityKey] || ''}
                                                                    onChange={(e) => handleImageUrlChange(city.state, city.name, e.target.value)}
                                                                    placeholder="Enter image URL"
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                                                    disabled={loading}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        onClick={() => saveImageUrl(city.name, city.state, city.docId)}
                                                                        className="bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90 flex items-center"
                                                                        disabled={loading || !imageUrls[cityKey]}
                                                                    >
                                                                        <Save size={14} className="mr-1" /> Save
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => showPreview(city.name, city.state)}
                                                                        className="bg-accent/20 text-accent px-3 py-1.5 rounded-md hover:bg-accent/30 flex items-center"
                                                                        disabled={loading || !imageUrls[cityKey]}
                                                                    >
                                                                        <Eye size={14} className="mr-1" /> Preview
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">
                                    {searchTerm || stateFilter
                                        ? "No cities found matching your filters. Try adjusting your search."
                                        : "No cities found for this country."}
                                </p>
                            </div>
                        )}
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Image Preview Modal */}
            <AnimatePresence>
                {previewUrl && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closePreview}
                    >
                        <motion.div
                            className="bg-white rounded-xl p-4 max-w-3xl w-full max-h-[90vh] flex flex-col"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">
                                    Image Preview: {previewCity?.name}, {previewCity?.state}
                                </h3>
                                <button
                                    onClick={closePreview}
                                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="overflow-auto flex-1 flex items-center justify-center bg-gray-100 rounded-lg">
                                <img
                                    src={previewUrl}
                                    alt={`${previewCity?.name}, ${previewCity?.state}`}
                                    className="max-w-full max-h-[70vh] object-contain"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                                    }}
                                />
                            </div>
                            <div className="mt-4 text-sm text-gray-500 break-all">
                                <p>URL: {previewUrl}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CityImageManagementTab;