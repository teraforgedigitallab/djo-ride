import { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase/config';
import {
    collection,
    doc,
    setDoc,
    updateDoc,
    getDoc,
    getDocs,
    deleteDoc,
    query,
    where,
    arrayUnion,
    arrayRemove,
    writeBatch
} from 'firebase/firestore';
import { Country, State, City } from 'country-state-city';
import { toast } from 'react-toastify';
import { DollarSign, PlusCircle, Trash2, MapPin, Globe, Car, X, AlertCircle, FileUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PricingExcelUploader from '../../components/PricingExcelUploader';
import Button from '../../components/Button';

const DEFAULT_CAB_MODELS = [
    "Sedan",
    "Sedan +",
    "Sedan Luxury",
    "MUV",
    "SUV",
    "SUV +",
    "Luxury",
    "Luxury +"
];

// Utility to generate doc ID
const getPricingDocId = (city, state, country) =>
    `${city} - ${state} - ${country}`;

// Add a country to Countries collection
const addCountry = async (countryName) => {
    await setDoc(doc(db, "Countries", countryName), {
        countryName,
        states: []
    });
};

// Add a state to a country in Countries collection
const addStateToCountry = async (countryName, stateName) => {
    const countryRef = doc(db, "Countries", countryName);
    await updateDoc(countryRef, {
        states: arrayUnion(stateName)
    });
};

// Remove a state from a country in Countries collection
const removeStateFromCountry = async (countryName, stateName) => {
    const countryRef = doc(db, "Countries", countryName);
    await updateDoc(countryRef, {
        states: arrayRemove(stateName)
    });
};

// Delete a country document from Countries collection
const deleteCountryDoc = async (countryName) => {
    await deleteDoc(doc(db, "Countries", countryName));
};

// Add a city pricing document (requires all pricing fields)
const addCityPricing = async ({
    countryName,
    stateName,
    cityName,
    pricingData // { Sedan: {...}, SUV: {...}, ... }
}) => {
    const docId = getPricingDocId(cityName, stateName, countryName);
    await setDoc(doc(db, "pricing", docId), {
        countryName,
        stateName,
        cityName,
        ...pricingData // Each category as described, null if removed
    });
};

// Remove a category for a city (sets value to null)
const removeCategoryFromCityPricing = async ({
    countryName,
    stateName,
    cityName,
    categoryKey
}) => {
    const docId = getPricingDocId(cityName, stateName, countryName);
    await updateDoc(doc(db, "pricing", docId), {
        [categoryKey]: null
    });
};

// Bulk delete pricing docs by field
const bulkDeletePricingByField = async (field, value) => {
    const q = query(collection(db, "pricing"), where(field, "==", value));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.forEach(docSnap => batch.delete(docSnap.ref));
    await batch.commit();
};

const Dropdown = ({ label, value, options, onChange, disabled, icon, placeholder }) => (
    <div className="flex flex-col flex-1 min-w-[180px]">
        <label className="block text-sm font-medium text-primary mb-1">{label}</label>
        <div className="relative">
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none ${disabled ? 'bg-gray-100' : 'bg-white'}`}
                aria-label={label}
            >
                <option value="">{placeholder}</option>
                {options.length === 0 && <option disabled>No options</option>}
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {icon && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">{icon}</span>}
        </div>
    </div>
);

const PricingManagementTab = () => {
    // Dropdown states
    const [countryIso, setCountryIso] = useState("");
    const [stateIso, setStateIso] = useState("");
    const [cityName, setCityName] = useState("");

    // Pricing input states
    const [pricingInputs, setPricingInputs] = useState({});
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedState, setSelectedState] = useState(null);

    // Data states
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [pricingDocs, setPricingDocs] = useState([]);
    const [editingCityDoc, setEditingCityDoc] = useState(null);

    // UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    //Excel Uploader Modal
    const [showExcelUploader, setShowExcelUploader] = useState(false);

    // For dropdown options
    const countryOptions = Country.getAllCountries().map(c => ({
        value: c.isoCode,
        label: c.name
    }));
    const stateOptions = states.map(s => ({
        value: s.isoCode,
        label: s.name
    }));
    const cityOptions = cities.map(c => ({
        value: c.name,
        label: c.name
    }));

    // Fetch countries from Countries collection
    useEffect(() => {
        const fetchCountries = async () => {
            setLoading(true);
            try {
                const snapshot = await getDocs(collection(db, "Countries"));
                const countryList = snapshot.docs.map(doc => doc.data());
                setCountries(countryList);
            } catch (err) {
                setError("Failed to load countries");
            } finally {
                setLoading(false);
            }
        };
        fetchCountries();
    }, []);

    // Fetch states when country changes
    useEffect(() => {
        if (!countryIso) {
            setStates([]);
            setSelectedCountry(null);
            return;
        }
        const countryObj = Country.getCountryByCode(countryIso);
        setSelectedCountry(countryObj);
        const statesList = State.getStatesOfCountry(countryIso);
        setStates(statesList);
    }, [countryIso]);

    // Fetch cities when state changes
    useEffect(() => {
        if (!countryIso || !stateIso) {
            setCities([]);
            setSelectedState(null);
            return;
        }
        const stateObj = State.getStateByCodeAndCountry(stateIso, countryIso);
        setSelectedState(stateObj);
        const citiesList = City.getCitiesOfState(countryIso, stateIso);
        setCities(citiesList);
    }, [countryIso, stateIso]);

    // Fetch pricing docs for selected state
    useEffect(() => {
        const fetchPricingDocs = async () => {
            if (!selectedState) {
                setPricingDocs([]);
                return;
            }
            setLoading(true);
            try {
                const q = query(collection(db, "pricing"), where("stateName", "==", selectedState.name));
                const snapshot = await getDocs(q);
                setPricingDocs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                setError("Failed to load pricing");
            } finally {
                setLoading(false);
            }
        };
        fetchPricingDocs();
    }, [selectedState]);

    // Add country handler
    const handleAddCountry = async () => {
        if (!countryIso) {
            toast.error("Select a country");
            return;
        }
        setLoading(true);
        try {
            const countryObj = Country.getCountryByCode(countryIso);
            await addCountry(countryObj.name);
            toast.success("Country added");
            setCountries([...countries, { countryName: countryObj.name, states: [] }]);
        } catch (err) {
            toast.error("Failed to add country");
        } finally {
            setLoading(false);
        }
    };

    // Add state handler
    const handleAddState = async () => {
        if (!countryIso || !stateIso) {
            toast.error("Select country and state");
            return;
        }
        setLoading(true);
        try {
            const countryObj = Country.getCountryByCode(countryIso);
            const stateObj = State.getStateByCodeAndCountry(stateIso, countryIso);
            await addStateToCountry(countryObj.name, stateObj.name);
            toast.success("State added");
            // Update countries state
            setCountries(countries.map(c =>
                c.countryName === countryObj.name
                    ? { ...c, states: [...(c.states || []), stateObj.name] }
                    : c
            ));
        } catch (err) {
            toast.error("Failed to add state");
        } finally {
            setLoading(false);
        }
    };

    // Add city handler (requires pricing)
    const handleAddCity = async () => {
        if (!countryIso || !stateIso || !cityName) {
            toast.error("Select country, state, and city");
            return;
        }

        setLoading(true);
        try {
            const countryObj = Country.getCountryByCode(countryIso);
            const stateObj = State.getStateByCodeAndCountry(stateIso, countryIso);

            // Prepare pricing data
            const pricingData = {};

            // Define field name generator function
            const getFieldName = (model) => {
                // Handle special characters properly
                return model.replace(/\s+/g, '').replace(/\+/g, 'Plus') + 'Pricing';
            };

            // Populate pricing data - default empty values to 0
            DEFAULT_CAB_MODELS.forEach(model => {
                const inputs = pricingInputs[model] || {};
                pricingData[getFieldName(model)] = {
                    "4H-40kmRate": Number(inputs["4H-40kmRate"] || 0),
                    "8H-80kmRate": Number(inputs["8H-80kmRate"] || 0),
                    "AirportRate": Number(inputs["AirportRate"] || 0)
                };
            });

            await addCityPricing({
                countryName: countryObj.name,
                stateName: stateObj.name,
                cityName,
                pricingData
            });
            toast.success("City pricing added");
            setPricingInputs({});
            setCityName("");
            // Refresh pricing docs
            const q = query(collection(db, "pricing"), where("stateName", "==", stateObj.name));
            const snapshot = await getDocs(q);
            setPricingDocs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            toast.error("Failed to add city pricing");
        } finally {
            setLoading(false);
        }
    };

    // Remove city handler
    const handleDeleteCity = async (cityDoc) => {
        if (!window.confirm(`Delete city "${cityDoc.cityName}" and its pricing?`)) return;
        setLoading(true);
        try {
            await bulkDeletePricingByField("cityName", cityDoc.cityName);
            toast.success("City deleted");
            setPricingDocs(pricingDocs.filter(doc => doc.cityName !== cityDoc.cityName));
        } catch (err) {
            toast.error("Failed to delete city");
        } finally {
            setLoading(false);
        }
    };

    // Remove state handler
    const handleDeleteState = async () => {
        if (!selectedCountry || !selectedState) return;
        if (!window.confirm(`Delete state "${selectedState.name}" and all its cities?`)) return;
        setLoading(true);
        try {
            await bulkDeletePricingByField("stateName", selectedState.name);
            await removeStateFromCountry(selectedCountry.name, selectedState.name);
            toast.success("State deleted");
            setPricingDocs([]);
            setStateIso("");
        } catch (err) {
            toast.error("Failed to delete state");
        } finally {
            setLoading(false);
        }
    };

    // Remove country handler
    const handleDeleteCountry = async () => {
        if (!selectedCountry) return;
        if (!window.confirm(`Delete country "${selectedCountry.name}" and all its states and cities?`)) return;
        setLoading(true);
        try {
            await bulkDeletePricingByField("countryName", selectedCountry.name);
            await deleteCountryDoc(selectedCountry.name);
            toast.success("Country deleted");
            setCountries(countries.filter(c => c.countryName !== selectedCountry.name));
            setCountryIso("");
            setStateIso("");
            setCities([]);
            setPricingDocs([]);
        } catch (err) {
            toast.error("Failed to delete country");
        } finally {
            setLoading(false);
        }
    };

    // Remove category handler (sets value to null)
    const handleRemoveCategory = async (cityDoc, categoryKey) => {
        if (!window.confirm(`Remove category "${categoryKey.replace('Pricing', '')}" for city "${cityDoc.cityName}"?`)) return;
        setLoading(true);
        try {
            await removeCategoryFromCityPricing({
                countryName: cityDoc.countryName,
                stateName: cityDoc.stateName,
                cityName: cityDoc.cityName,
                categoryKey
            });
            toast.success("Category removed");
            // Refresh pricing doc
            const q = query(collection(db, "pricing"), where("cityName", "==", cityDoc.cityName));
            const snapshot = await getDocs(q);
            setPricingDocs(pricingDocs.map(doc =>
                doc.cityName === cityDoc.cityName
                    ? { ...doc, [categoryKey]: null }
                    : doc
            ));
        } catch (err) {
            toast.error("Failed to remove category");
        } finally {
            setLoading(false);
        }
    };

    // Pricing input change handler
    const handlePricingInputChange = (model, field, value) => {
        setPricingInputs(prev => ({
            ...prev,
            [model]: {
                ...prev[model],
                [field]: value
            }
        }));
    };

    const handleExcelUploaderSuccess = async () => {
        // Refresh the pricing docs after successful upload
        if (selectedState) {
            setLoading(true);
            try {
                const q = query(collection(db, "pricing"), where("stateName", "==", selectedState.name));
                const snapshot = await getDocs(q);
                setPricingDocs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                setError("Failed to refresh pricing data");
            } finally {
                setLoading(false);
            }
        }
    };

    // 2. Add effect to load existing city data when selected
    useEffect(() => {
        const loadExistingPricing = async () => {
            if (!countryIso || !stateIso || !cityName) return;

            const countryObj = Country.getCountryByCode(countryIso);
            const stateObj = State.getStateByCodeAndCountry(stateIso, countryIso);

            try {
                setLoading(true);
                const docId = getPricingDocId(cityName, stateObj.name, countryObj.name);
                const docSnap = await getDoc(doc(db, "pricing", docId));

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const newPricingInputs = {};

                    DEFAULT_CAB_MODELS.forEach(model => {
                        const fieldName = model.replace(/\s+/g, '').replace(/\+/g, 'Plus') + 'Pricing';
                        const pricingData = data[fieldName] || {};

                        newPricingInputs[model] = {
                            "4H-40kmRate": pricingData["4H-40kmRate"] || 0,
                            "8H-80kmRate": pricingData["8H-80kmRate"] || 0,
                            "AirportRate": pricingData["AirportRate"] || 0
                        };
                    });

                    setPricingInputs(newPricingInputs);
                } else {
                    // Reset inputs if no existing data
                    setPricingInputs({});
                }
            } catch (err) {
                setError("Failed to load existing pricing data");
            } finally {
                setLoading(false);
            }
        };

        loadExistingPricing();
    }, [cityName, countryIso, stateIso]);

    // Responsive container variants
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

    return (
        <motion.div
            className="bg-white p-4 md:p-6 rounded-lg shadow-md"
            aria-label="Pricing Management"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >

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

            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary flex items-center">
                    <DollarSign className="mr-2" />
                    Pricing Management
                </h2>

                <Button
                    onClick={() => setShowExcelUploader(true)}
                    className="bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90 transition-all flex items-center"
                    disabled={loading}
                >
                    <FileUp size={16} className="mr-2" /> Update Pricing
                </Button>
            </div>

            {/* Excel Uploader Modal */}
            <AnimatePresence>
                {showExcelUploader && (
                    <PricingExcelUploader
                        isOpen={showExcelUploader}
                        onClose={() => setShowExcelUploader(false)}
                        onSuccess={handleExcelUploaderSuccess}
                    />
                )}
            </AnimatePresence>

            {/* Country Dropdown */}
            <div className="mb-4 flex flex-col md:flex-row gap-2 items-center">
                <Dropdown
                    label="Country"
                    value={countryIso}
                    options={countryOptions}
                    onChange={e => setCountryIso(e.target.value)}
                    disabled={loading}
                    icon={<Globe size={16} />}
                    placeholder="Select Country"
                />

                <Button
                    onClick={handleDeleteCountry}
                    text="Delete Country"
                    className="bg-red-100 !text-red-600 px-4 py-2 mt-4 rounded-md hover:bg-red-200 transition-all"
                    disabled={loading || !selectedCountry}
                >
                    <Trash2 size={16} className="mr-1" /> Delete Country
                </Button>
            </div>

            {/* State Dropdown */}
            <div className="mb-4 flex flex-col md:flex-row gap-2 items-center">
                <Dropdown
                    label="State"
                    value={stateIso}
                    options={stateOptions}
                    onChange={e => setStateIso(e.target.value)}
                    disabled={loading || !countryIso}
                    icon={<MapPin size={16} />}
                    placeholder="Select State"
                />

                <Button
                    onClick={handleDeleteState}
                    text="Delete State"
                    className="bg-red-100 !text-red-600 px-4 py-2 mt-4 rounded-md hover:bg-red-200 transition-all"
                    disabled={loading || !selectedState}
                >
                    <Trash2 size={16} className="mr-1" /> Delete State
                </Button>
            </div>

            {/* City Dropdown */}
            <div className="mb-4 flex flex-col md:flex-row gap-2 items-center">
                <Dropdown
                    label="City"
                    value={cityName}
                    options={cityOptions}
                    onChange={e => setCityName(e.target.value)}
                    disabled={loading || !stateIso}
                    icon={<Car size={16} />}
                    placeholder="Select City"
                />
            </div>

            {/* Pricing Inputs for all categories */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEFAULT_CAB_MODELS.map(model => (
                    <div key={model} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="text-primary font-semibold mb-2">{model}</h4>
                        <div className="flex flex-col gap-2">
                            <input
                                type="number"
                                placeholder="4H-40km Rate"
                                value={pricingInputs[model]?.["4H-40kmRate"] ?? ""}
                                onChange={e => handlePricingInputChange(model, "4H-40kmRate", e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                min="0"
                                disabled={loading}
                            />
                            <input
                                type="number"
                                placeholder="8H-80km Rate"
                                value={pricingInputs[model]?.["8H-80kmRate"] ?? ""}
                                onChange={e => handlePricingInputChange(model, "8H-80kmRate", e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                min="0"
                                disabled={loading}
                            />
                            <input
                                type="number"
                                placeholder="Airport Rate"
                                value={pricingInputs[model]?.["AirportRate"] ?? ""}
                                onChange={e => handlePricingInputChange(model, "AirportRate", e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                min="0"
                                disabled={loading}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <Button
                onClick={handleAddCity}
                text="Add City Pricing"
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-all"
                disabled={loading || !cityName}
            >
                <PlusCircle size={16} className="mr-1" /> Add City Pricing
            </Button>
            {/* Pricing Table */}
            <div className="mt-8 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200" aria-label="Pricing Table">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">City</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">State</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Country</th>
                            {DEFAULT_CAB_MODELS.map(model => (
                                <th key={model} className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">{model}</th>
                            ))}
                            <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pricingDocs.length > 0 ? (
                            pricingDocs.map(doc => (
                                <tr key={doc.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{doc.cityName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{doc.stateName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{doc.countryName}</td>
                                    {DEFAULT_CAB_MODELS.map(model => {
                                        const key = `${model.replace(/\s+/g, '').replace(/\+/g, 'Plus')}Pricing`;
                                        const pricing = doc[key];
                                        return (
                                            <td key={model} className="px-6 py-4 whitespace-nowrap">
                                                {pricing
                                                    ? <>
                                                        <div>4H-40km: {pricing["4H-40kmRate"]}</div>
                                                        <div>8H-80km: {pricing["8H-80kmRate"]}</div>
                                                        <div>Airport: {pricing["AirportRate"]}</div>
                                                        <Button
                                                            onClick={() => handleRemoveCategory(doc, key)}
                                                            className="bg-red-200 !text-red-600 px-2 py-1 rounded hover:bg-red-300 mt-2"
                                                            disabled={loading}
                                                        >
                                                            <Trash2 size={12} className="mr-1" />
                                                        </Button>
                                                    </>
                                                    : <span className="text-gray-400 italic">No Data</span>
                                                }
                                            </td>
                                        );
                                    })}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Button
                                            onClick={() => handleDeleteCity(doc)}
                                            text="Delete"
                                            className="bg-red-100 !text-red-600 px-3 py-1 rounded hover:bg-red-200"
                                            disabled={loading}
                                        >
                                            <Trash2 size={14} className="mr-1" /> Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={DEFAULT_CAB_MODELS.length + 4} className="px-6 py-4 text-center text-gray-500 italic">
                                    No pricing data found for this state.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default PricingManagementTab;