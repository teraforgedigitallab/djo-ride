import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, doc, updateDoc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-hot-toast';
import { DollarSign, PlusCircle, Trash2, MapPin, Globe, Car, X, AlertCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BulkImportPricing from '../../components/BulkImportPricing';

const DEFAULT_CAB_MODELS = [
    "Sedan", "Sedan +", "Sedan - Luxury", "MUV", "SUV", "SUV +", "Luxury", "Luxury +"
];

const PricingManagementTab = () => {
    // State
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [cities, setCities] = useState([]);
    const [editingCity, setEditingCity] = useState(null);
    const [pricing, setPricing] = useState({});
    const [pricingHistory, setPricingHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [newCountry, setNewCountry] = useState("");
    const [newCityData, setNewCityData] = useState({ state: "", city: "" });
    const [cabModels, setCabModels] = useState(DEFAULT_CAB_MODELS);
    const [newCabModel, setNewCabModel] = useState("");
    const [stateFilter, setStateFilter] = useState("");
    const [cabModelOrder, setCabModelOrder] = useState(DEFAULT_CAB_MODELS);
    const [error, setError] = useState(null);

    // Refs for scrolling and focus management
    const pricingEditorRef = useRef(null);
    const cityRowRefs = useRef({});

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
        },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    // Fetch all countries
    useEffect(() => {
        const fetchCountries = async () => {
            setLoading(true);
            setError(null);
            try {
                const pricingSnapshot = await getDocs(collection(db, "pricing"));
                const countriesData = pricingSnapshot.docs.map(doc => ({
                    id: doc.id,
                    country: doc.data().country,
                    cabModelOrder: doc.data().cabModelOrder || DEFAULT_CAB_MODELS
                }));
                setCountries(countriesData);
            } catch (error) {
                console.error("Failed to load countries:", error);
                setError("Failed to load countries. Please try again.");
                toast.error("Failed to load countries");
            } finally {
                setLoading(false);
            }
        };
        fetchCountries();
    }, []);

    // Fetch cities and cabModelOrder when a country is selected
    useEffect(() => {
        if (!selectedCountry) {
            setCities([]);
            setCabModelOrder(DEFAULT_CAB_MODELS);
            return;
        }
        const fetchCities = async () => {
            setLoading(true);
            setError(null);
            try {
                const countryDoc = await getDoc(doc(db, "pricing", selectedCountry.id));
                if (countryDoc.exists()) {
                    const data = countryDoc.data();
                    setCities(data.states || []);
                    setCabModelOrder(data.cabModelOrder || DEFAULT_CAB_MODELS);
                }
            } catch (error) {
                console.error("Failed to load cities:", error);
                setError("Failed to load cities. Please try again.");
                toast.error("Failed to load cities");
            } finally {
                setLoading(false);
            }
        };
        fetchCities();
        // Reset city filter when changing country
        setStateFilter("");
    }, [selectedCountry]);

    // Handle setting an editing city, with scroll and focus
    const handleSetEditingCity = (city) => {
        setEditingCity(city);

        // Set a small timeout to allow the editor to render before scrolling
        setTimeout(() => {
            pricingEditorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            pricingEditorRef.current?.focus();
        }, 100);
    };

    // Fetch pricing when a city is selected for editing
    useEffect(() => {
        if (!editingCity) {
            setPricing({});
            return;
        }
        setPricing(editingCity.pricing || {});
    }, [editingCity]);

    // Add a new country
    const handleAddCountry = async () => {
        if (!newCountry.trim()) {
            toast.error("Country name is required");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const exists = countries.some(c => c.country.toLowerCase() === newCountry.toLowerCase());
            if (exists) {
                toast.error("Country already exists");
                return;
            }
            const newCountryRef = doc(collection(db, "pricing"));
            await setDoc(newCountryRef, {
                country: newCountry,
                states: [],
                cabModelOrder: DEFAULT_CAB_MODELS
            });
            const newCountryObj = {
                id: newCountryRef.id,
                country: newCountry,
                cabModelOrder: DEFAULT_CAB_MODELS
            };
            setCountries([...countries, newCountryObj]);
            setSelectedCountry(newCountryObj); // Auto-select the new country
            setNewCountry("");
            toast.success("Country added successfully");
        } catch (error) {
            console.error("Failed to add country:", error);
            setError("Failed to add country. Please try again.");
            toast.error("Failed to add country");
        } finally {
            setLoading(false);
        }
    };

    // Delete a country
    const handleDeleteCountry = async (country) => {
        if (!window.confirm(`Delete country "${country.country}" and all its cities?`)) return;
        setLoading(true);
        setError(null);
        try {
            await deleteDoc(doc(db, "pricing", country.id));
            setCountries(countries.filter(c => c.id !== country.id));
            if (selectedCountry?.id === country.id) {
                setSelectedCountry(null);
                setCities([]);
                setEditingCity(null);
            }
            toast.success("Country deleted successfully");
        } catch (error) {
            console.error("Failed to delete country:", error);
            setError("Failed to delete country. Please try again.");
            toast.error("Failed to delete country");
        } finally {
            setLoading(false);
        }
    };

    // Add a new city
    const handleAddCity = async () => {
        if (!selectedCountry) {
            toast.error("Please select a country first");
            return;
        }
        if (!newCityData.state.trim() || !newCityData.city.trim()) {
            toast.error("State and city names are required");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const cityExists = cities.some(
                c => c.city.toLowerCase() === newCityData.city.toLowerCase() &&
                    c.state.toLowerCase() === newCityData.state.toLowerCase()
            );
            if (cityExists) {
                toast.error("This city already exists");
                return;
            }
            const newPricing = {};
            cabModelOrder.forEach(model => {
                newPricing[model] = { "4hr40km": 0, "8hr80km": 0, "airport": 0 };
            });
            const newCity = {
                state: newCityData.state,
                city: newCityData.city,
                pricing: newPricing
            };
            const updatedCities = [...cities, newCity];
            await updateDoc(doc(db, "pricing", selectedCountry.id), { states: updatedCities });
            setCities(updatedCities);
            setNewCityData({ state: "", city: "" });
            toast.success("City added successfully");

            // Set state filter to the new city's state
            setStateFilter(newCity.state);

            // Auto-edit the new city after a short delay
            setTimeout(() => {
                handleSetEditingCity(newCity);
            }, 300);
        } catch (error) {
            console.error("Failed to add city:", error);
            setError("Failed to add city. Please try again.");
            toast.error("Failed to add city");
        } finally {
            setLoading(false);
        }
    };

    // Delete a city
    const handleDeleteCity = async (cityToDelete) => {
        if (!selectedCountry) return;
        if (!window.confirm(`Delete city "${cityToDelete.city}, ${cityToDelete.state}"?`)) return;
        setLoading(true);
        setError(null);
        try {
            const updatedCities = cities.filter(
                c => !(c.city === cityToDelete.city && c.state === cityToDelete.state)
            );
            await updateDoc(doc(db, "pricing", selectedCountry.id), { states: updatedCities });
            setCities(updatedCities);
            if (editingCity && editingCity.city === cityToDelete.city && editingCity.state === cityToDelete.state) {
                setEditingCity(null);
                setPricing({});
            }
            toast.success("City deleted successfully");
        } catch (error) {
            console.error("Failed to delete city:", error);
            setError("Failed to delete city. Please try again.");
            toast.error("Failed to delete city");
        } finally {
            setLoading(false);
        }
    };

    // Add a new cab model to pricing (and update cabModelOrder in Firebase)
    const handleAddCabModelToPricing = async (cabModel) => {
        if (!cabModel) {
            toast.error("Please select a cab model");
            return;
        }
        if (pricing[cabModel]) {
            toast.error("This cab model already exists in pricing");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // First update local state for instant feedback
            setPricing(prev => ({
                ...prev,
                [cabModel]: { "4hr40km": 0, "8hr80km": 0, "airport": 0 }
            }));

            // Update cabModelOrder in Firebase and local state
            if (!cabModelOrder.includes(cabModel)) {
                const newOrder = [...cabModelOrder, cabModel];
                setCabModelOrder(newOrder);
                await updateDoc(doc(db, "pricing", selectedCountry.id), { cabModelOrder: newOrder });
            }

            setNewCabModel("");
            toast.success(`Added ${cabModel} to pricing`);
        } catch (error) {
            console.error("Failed to add cab model:", error);
            setError("Failed to add cab model. Please try again.");
            toast.error("Failed to add cab model");
        } finally {
            setLoading(false);
        }
    };

    // Remove a cab model from pricing (and update cabModelOrder in Firebase)
    const handleRemoveCabModelFromPricing = async (cabModel) => {
        if (!window.confirm(`Remove "${cabModel}" from pricing for this city?`)) return;

        setLoading(true);
        setError(null);
        try {
            // Remove cab model only from this city's pricing
            const newPricing = { ...pricing };
            delete newPricing[cabModel];
            setPricing(newPricing);

            toast.success(`Removed ${cabModel} from this city's pricing`);
        } catch (error) {
            console.error("Failed to remove cab model:", error);
            setError("Failed to remove cab model. Please try again.");
            toast.error("Failed to remove cab model");
        } finally {
            setLoading(false);
        }
    };

    // Update pricing for a city
    const handleUpdatePricing = async () => {
        if (!selectedCountry || !editingCity) {
            toast.error("Please select a country and city");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const updatedCities = cities.map(city => {
                if (city.city === editingCity.city && city.state === editingCity.state) {
                    return { ...city, pricing: pricing };
                }
                return city;
            });

            await updateDoc(doc(db, "pricing", selectedCountry.id), { states: updatedCities });
            setCities(updatedCities);
            toast.success("Pricing updated successfully");

            // Don't close the editor automatically, allow the user to continue editing
            // Just update the reference to the updated city
            const updatedCity = updatedCities.find(
                c => c.city === editingCity.city && c.state === editingCity.state
            );
            setEditingCity(updatedCity);
        } catch (error) {
            console.error("Failed to update pricing:", error);
            setError("Failed to update pricing. Please try again.");
            toast.error("Failed to update pricing");
        } finally {
            setLoading(false);
        }
    };

    // Handle price change with proper validation
    const handlePriceChange = (cabModel, packageType, value) => {
        // Allow empty string for easier editing, but convert to 0 for storage
        const numValue = value === "" ? "" : parseInt(value) || 0;

        setPricing({
            ...pricing,
            [cabModel]: {
                ...pricing[cabModel],
                [packageType]: numValue
            }
        });
    };

    const handleBulkImport = (newPricing) => {
        if (!editingCity) return;

        // Since we're now passing the full pricing object from BulkImportPricing
        // we can just set it directly
        setPricing(newPricing);
    };

    // Filtered cities by state
    const filteredCities = stateFilter
        ? cities.filter(city => city.state.toLowerCase() === stateFilter.toLowerCase())
        : cities;

    // All unique states for filter dropdown
    const allStates = Array.from(new Set(cities.map(city => city.state))).sort();

    return (
        <motion.div
            className="bg-white p-6 rounded-lg shadow-md"
            aria-label="Pricing Management"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center">
                <DollarSign className="mr-2" />
                Pricing Management
            </h2>

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

            {/* Country Management Section */}
            <motion.section
                className="mb-8 p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-primary/5 to-gray-50"
                aria-label="Country Management"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <h3 className="text-xl font-semibold text-primary mb-4 flex items-center">
                    <Globe className="mr-2" size={20} />
                    Countries
                </h3>
                <motion.div className="flex gap-2 mb-4" variants={itemVariants}>
                    <input
                        type="text"
                        value={newCountry}
                        onChange={e => setNewCountry(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddCountry()}
                        placeholder="New Country Name"
                        className="px-3 py-2 border border-gray-300 rounded-md flex-grow focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        aria-label="New Country Name"
                        disabled={loading}
                    />
                    <motion.button
                        onClick={handleAddCountry}
                        disabled={loading}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 flex items-center"
                        aria-label="Add Country"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <PlusCircle size={16} className="mr-1" /> Add Country
                    </motion.button>
                </motion.div>
                <motion.div
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                    variants={containerVariants}
                >
                    {countries.map(country => (
                        <motion.div
                            key={country.id}
                            tabIndex={0}
                            role="button"
                            aria-pressed={selectedCountry?.id === country.id}
                            onClick={() => setSelectedCountry(country)}
                            onKeyDown={e => (e.key === "Enter" || e.key === " ") && setSelectedCountry(country)}
                            className={`p-3 rounded-md cursor-pointer transition-all flex items-center justify-between outline-none ring-offset-2 focus:ring-2 focus:ring-primary ${selectedCountry?.id === country.id
                                ? "bg-primary text-white shadow-md"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                                }`}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="font-medium truncate">{country.country}</span>
                            <button
                                onClick={e => { e.stopPropagation(); handleDeleteCountry(country); }}
                                className={`ml-2 p-1.5 rounded-full focus:outline-none focus:ring-2 ${selectedCountry?.id === country.id
                                    ? "text-white/80 hover:text-white hover:bg-white/20 focus:ring-white"
                                    : "text-red-600 hover:text-red-800 hover:bg-red-100 focus:ring-red-500"
                                    }`}
                                aria-label={`Delete ${country.country}`}
                                tabIndex={0}
                                disabled={loading}
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.section>

            {/* City Management Section */}
            <AnimatePresence>
                {selectedCountry && (
                    <motion.section
                        className="mb-8 p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-primary/5 to-gray-50"
                        aria-label="City Management"
                        key="city-management"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <h3 className="text-xl font-semibold text-primary mb-4 flex items-center">
                            <MapPin className="mr-2" size={20} />
                            Cities in {selectedCountry.country}
                        </h3>
                        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5" variants={itemVariants}>
                            <input
                                type="text"
                                value={newCityData.state}
                                onChange={e => setNewCityData({ ...newCityData, state: e.target.value })}
                                placeholder="State"
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                aria-label="State"
                                disabled={loading}
                            />
                            <input
                                type="text"
                                value={newCityData.city}
                                onChange={e => setNewCityData({ ...newCityData, city: e.target.value })}
                                onKeyDown={e => e.key === 'Enter' && handleAddCity()}
                                placeholder="City"
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                aria-label="City"
                                disabled={loading}
                            />
                            <motion.button
                                onClick={handleAddCity}
                                disabled={loading}
                                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
                                aria-label="Add City"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <PlusCircle size={16} className="mr-1" /> Add City
                            </motion.button>
                        </motion.div>

                        {/* State Filter */}
                        <motion.div className="mb-5 flex flex-wrap items-center gap-2" variants={itemVariants}>
                            <label htmlFor="stateFilter" className="text-sm font-medium text-primary">
                                Filter by State:
                            </label>
                            <div className="relative flex-grow max-w-xs">
                                <select
                                    id="stateFilter"
                                    value={stateFilter}
                                    onChange={e => setStateFilter(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pr-10"
                                    aria-label="Filter by State"
                                    disabled={loading || allStates.length === 0}
                                >
                                    <option value="">All States</option>
                                    {allStates.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <ChevronDown size={16} className="text-gray-500" />
                                </div>
                            </div>
                            {stateFilter && (
                                <motion.button
                                    onClick={() => setStateFilter("")}
                                    className="text-gray-500 hover:text-primary hover:bg-gray-100 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                    aria-label="Clear State Filter"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X size={18} />
                                </motion.button>
                            )}
                            <span className="text-sm text-gray-500 ml-auto">
                                {filteredCities.length} {filteredCities.length === 1 ? 'city' : 'cities'}
                                {stateFilter ? ` in ${stateFilter}` : ''}
                            </span>
                        </motion.div>

                        {/* City List */}
                        <motion.div
                            className="overflow-x-auto rounded-lg border border-gray-200"
                            variants={itemVariants}
                        >
                            <table
                                className="min-w-full divide-y divide-gray-200"
                                aria-label="City List"
                            >
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">State</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">City</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCities.length > 0 ? (
                                        filteredCities.map((city, index) => (
                                            <motion.tr
                                                key={`${city.state}-${city.city}-${index}`}
                                                className={`${editingCity && editingCity.city === city.city && editingCity.state === city.state ? "bg-primary/10" : "hover:bg-gray-50"} transition-colors`}
                                                ref={el => cityRowRefs.current[`${city.state}-${city.city}`] = el}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">{city.state}</td>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium">{city.city}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <motion.button
                                                            onClick={() => handleSetEditingCity(city)}
                                                            className={`${editingCity && editingCity.city === city.city && editingCity.state === city.state
                                                                ? "bg-primary text-white"
                                                                : "bg-primary/20 text-primary hover:bg-primary/30"
                                                                } px-3 py-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary`}
                                                            aria-label={`Edit pricing for ${city.city}, ${city.state}`}
                                                            aria-pressed={editingCity && editingCity.city === city.city && editingCity.state === city.state}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            disabled={loading}
                                                        >
                                                            {editingCity && editingCity.city === city.city && editingCity.state === city.state
                                                                ? "Currently Editing"
                                                                : "Edit Pricing"}
                                                        </motion.button>
                                                        <motion.button
                                                            onClick={() => handleDeleteCity(city)}
                                                            className="bg-red-100 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-200 transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-red-500"
                                                            aria-label={`Delete ${city.city}, ${city.state}`}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            disabled={loading}
                                                        >
                                                            <Trash2 size={14} className="mr-1" /> Delete
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-4 text-center text-gray-500 italic">
                                                {stateFilter
                                                    ? `No cities found in ${stateFilter}. Try another state or add a new city.`
                                                    : 'No cities found. Add your first city using the form above.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </motion.div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Inline Pricing Editor */}
            <AnimatePresence>
                {editingCity && (
                    <motion.section
                        ref={pricingEditorRef}
                        tabIndex={-1}
                        className="mt-4 mb-8 p-5 border-2 border-primary rounded-lg bg-gradient-to-r from-primary/10 to-gray-50 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                        aria-label={`Edit Pricing for ${editingCity.city}, ${editingCity.state}`}
                        key="pricing-editor"
                        initial={{ opacity: 0, y: 20, height: 0 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            height: 'auto',
                            transition: {
                                duration: 0.4,
                                ease: "easeOut"
                            }
                        }}
                        exit={{
                            opacity: 0,
                            y: -20,
                            height: 0,
                            transition: {
                                duration: 0.3,
                                ease: "easeIn"
                            }
                        }}
                    >

                        <div className="flex items-center justify-between mb-5 border-b border-primary/20 pb-3">
                            <h3 className="text-xl font-semibold text-primary flex items-center">
                                <Car className="mr-2" size={20} />
                                Pricing for {editingCity.city}, {editingCity.state}
                            </h3>
                            <motion.button
                                onClick={() => { setEditingCity(null); setPricing({}); }}
                                className="text-gray-500 hover:text-primary hover:bg-primary/10 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                aria-label="Close Pricing Editor"
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <X size={20} />
                            </motion.button>
                        </div>

                        {/* Cab Model Management */}
                        <motion.div
                            className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                            variants={itemVariants}
                        >
                            <h4 className="text-lg font-medium text-primary mb-3">Add Cab Model to Pricing</h4>
                            <div className="flex flex-wrap gap-3 mb-4">
                                <div className="relative flex-grow max-w-md">
                                    <select
                                        value={newCabModel}
                                        onChange={e => setNewCabModel(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pr-10"
                                        aria-label="Select Cab Model"
                                        disabled={loading || cabModels.filter(model => !pricing[model]).length === 0}
                                    >
                                        <option value="">Select a Cab Model</option>
                                        {cabModels.filter(model => !pricing[model]).map(model => (
                                            <option key={model} value={model}>{model}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <ChevronDown size={16} className="text-gray-500" />
                                    </div>
                                </div>
                                <motion.button
                                    onClick={() => handleAddCabModelToPricing(newCabModel)}
                                    disabled={!newCabModel || loading}
                                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 flex items-center"
                                    aria-label="Add Cab Model to Pricing"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <PlusCircle size={16} className="mr-1" /> Add to Pricing
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Pricing Table */}
                        <motion.div
                            className="overflow-x-auto rounded-lg border border-gray-200 bg-white"
                            variants={itemVariants}
                        >
                            <motion.div className="mb-5 p-4" variants={itemVariants}>
                                <BulkImportPricing
                                    onImport={handleBulkImport}
                                    activeCabModels={cabModelOrder.filter(model => pricing[model])}
                                    pricing={pricing}
                                />
                            </motion.div>

                            <table className="min-w-full divide-y divide-gray-200" aria-label="Pricing Table">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Cab Model</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">4hr/40km</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">8hr/80km</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Airport Transfer</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {cabModelOrder.filter(model => pricing[model]).length > 0 ? (
                                        cabModelOrder.filter(model => pricing[model]).map((model, index) => (
                                            <motion.tr
                                                key={model}
                                                initial={{ opacity: 0, backgroundColor: "rgba(90, 48, 146, 0.1)" }}
                                                animate={{ opacity: 1, backgroundColor: "rgba(255, 255, 255, 1)" }}
                                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap font-medium">{model}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        value={pricing[model]["4hr40km"]}
                                                        onChange={e => handlePriceChange(model, "4hr40km", e.target.value)}
                                                        className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                                        min="0"
                                                        aria-label={`4hr/40km price for ${model}`}
                                                        disabled={loading}
                                                        onPaste={e => {
                                                            // This handles pasting directly into a cell
                                                            e.preventDefault();
                                                            const pasteData = e.clipboardData.getData('text').trim();
                                                            const values = pasteData.split('\t').map(v => parseFloat(v) || 0);

                                                            if (values.length >= 1) {
                                                                const updatedPricing = { ...pricing };

                                                                // Update this model with pasted values
                                                                updatedPricing[model] = {
                                                                    ...updatedPricing[model],
                                                                    "4hr40km": values[0]
                                                                };

                                                                if (values.length >= 2) {
                                                                    updatedPricing[model]["8hr80km"] = values[1];
                                                                }

                                                                if (values.length >= 3) {
                                                                    updatedPricing[model]["airport"] = values[2];
                                                                }

                                                                // Save this state to history (if you want cell pastes in history too)
                                                                // and update the pricing
                                                                setPricing(updatedPricing);
                                                            }
                                                        }}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        value={pricing[model]["8hr80km"]}
                                                        onChange={e => handlePriceChange(model, "8hr80km", e.target.value)}
                                                        className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                                        min="0"
                                                        aria-label={`8hr/80km price for ${model}`}
                                                        disabled={loading}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        value={pricing[model]["airport"]}
                                                        onChange={e => handlePriceChange(model, "airport", e.target.value)}
                                                        className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                                        min="0"
                                                        aria-label={`Airport price for ${model}`}
                                                        disabled={loading}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <motion.button
                                                        onClick={() => handleRemoveCabModelFromPricing(model)}
                                                        className="bg-red-100 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-200 transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-red-500"
                                                        aria-label={`Remove ${model} from pricing`}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        disabled={loading}
                                                    >
                                                        <Trash2 size={14} className="mr-1" /> Remove
                                                    </motion.button>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500 italic">
                                                No cab models added yet. Use the "Add Cab Model" section above to add pricing.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </motion.div>

                        {/* Save Button */}
                        <motion.div
                            className="mt-6 flex justify-end gap-3"
                            variants={itemVariants}
                        >
                            <motion.button
                                onClick={() => { setEditingCity(null); setPricing({}); }}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                                aria-label="Cancel"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={loading}
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                onClick={handleUpdatePricing}
                                disabled={loading}
                                className="bg-primary text-white px-6 py-2.5 rounded-md hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 font-medium shadow-sm"
                                aria-label="Save Pricing"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {loading ? 'Saving...' : 'Save Pricing'}
                            </motion.button>
                        </motion.div>
                    </motion.section>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PricingManagementTab;