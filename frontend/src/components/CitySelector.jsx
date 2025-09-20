import { useState, useEffect } from 'react';
import { Search, MapPin, Globe, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import data from '../data/data.json';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { AD, AE, AF, AG, AI, AL, AM, AO, AQ, AR, AS, AT, AU, AW, AX, AZ, BA, BB, BD, BE, BF, BG, BH, BI, BJ, BL, BM, BN, BO, BQ, BR, BS, BT, BV, BW, BY, BZ, CA, CC, CD, CF, CG, CH, CI, CK, CL, CM, CN, CO, CR, CU, CV, CW, CX, CY, CZ, DE, DJ, DK, DM, DO, DZ, EC, EE, EG, EH, ER, ES, ET, FI, FJ, FK, FM, FO, FR, GA, GB, GD, GE, GF, GG, GH, GI, GL, GM, GN, GP, GQ, GR, GS, GT, GU, GW, GY, HK, HM, HN, HR, HT, HU, ID, IE, IL, IM, IN, IO, IQ, IR, IS, IT, JE, JM, JO, JP, KE, KG, KH, KI, KM, KN, KP, KR, KW, KY, KZ, LA, LB, LC, LI, LK, LR, LS, LT, LU, LV, LY, MA, MC, MD, ME, MF, MG, MH, MK, ML, MM, MN, MO, MP, MQ, MR, MS, MT, MU, MV, MW, MX, MY, MZ, NA, NC, NE, NF, NG, NI, NL, NO, NP, NR, NU, NZ, OM, PA, PE, PF, PG, PH, PK, PL, PM, PN, PR, PS, PT, PW, PY, QA, RE, RO, RS, RU, RW, SA, SB, SC, SD, SE, SG, SH, SI, SJ, SK, SL, SM, SN, SO, SR, SS, ST, SV, SX, SY, SZ, TC, TD, TF, TG, TH, TJ, TK, TL, TM, TN, TO, TR, TT, TV, TW, TZ, UA, UG, UM, US, UY, UZ, VA, VC, VE, VG, VI, VN, VU, WF, WS, XK, YE, YT, ZA, ZM, ZW } from 'country-flag-icons/react/3x2';

const CitySelector = ({ onCitySelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showCountrySelector, setShowCountrySelector] = useState(true);
  const [countryPopularCities, setCountryPopularCities] = useState([]);
  const [hasCountryData, setHasCountryData] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch countries from Firestore
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const db = getFirestore();
        const pricingSnapshot = await getDocs(collection(db, "pricing"));
        const availableCountries = [];

        pricingSnapshot.forEach(doc => {
          const docData = doc.data();
          if (docData.countryName && !availableCountries.includes(docData.countryName)) {
            availableCountries.push(docData.countryName);
          }
        });

        setCountries(availableCountries.sort());
        setLoading(false);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Fetch cities for selected country from Firestore
  useEffect(() => {
  if (selectedCountry) {
    setShowCountrySelector(false);
    setLoading(true);

    const fetchCities = async () => {
      try {
        const db = getFirestore();
        const pricingSnapshot = await getDocs(collection(db, "pricing"));
        const citiesList = [];

        pricingSnapshot.forEach(doc => {
          const docData = doc.data();
          if (docData.countryName === selectedCountry && docData.cityName && docData.stateName) {
            citiesList.push({
              city: docData.cityName,
              state: docData.stateName,
              country: docData.countryName,
              id: doc.id,
              imageUrl: docData.imageUrl || null
            });
          }
        });

        if (citiesList.length > 0) {
          setHasCountryData(true);
          setCities(citiesList);
          setFilteredCities(citiesList);

          // Make all cities popular by default
          setCountryPopularCities(citiesList.map(city => city.city));
        } else {
          setHasCountryData(false);
          setCities([]);
          setFilteredCities([]);
          setCountryPopularCities([]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setHasCountryData(false);
        setLoading(false);
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

  // Filter cities based on search term
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

    switch (country.toLowerCase()) {
      case 'andorra': return <AD style={flagSize} />;
      case 'united arab emirates': return <AE style={flagSize} />;
      case 'afghanistan': return <AF style={flagSize} />;
      case 'antigua and barbuda': return <AG style={flagSize} />;
      case 'anguilla': return <AI style={flagSize} />;
      case 'albania': return <AL style={flagSize} />;
      case 'armenia': return <AM style={flagSize} />;
      case 'angola': return <AO style={flagSize} />;
      case 'antarctica': return <AQ style={flagSize} />;
      case 'argentina': return <AR style={flagSize} />;
      case 'american samoa': return <AS style={flagSize} />;
      case 'austria': return <AT style={flagSize} />;
      case 'australia': return <AU style={flagSize} />;
      case 'aruba': return <AW style={flagSize} />;
      case 'åland islands': return <AX style={flagSize} />;
      case 'azerbaijan': return <AZ style={flagSize} />;
      case 'bosnia and herzegovina': return <BA style={flagSize} />;
      case 'barbados': return <BB style={flagSize} />;
      case 'bangladesh': return <BD style={flagSize} />;
      case 'belgium': return <BE style={flagSize} />;
      case 'burkina faso': return <BF style={flagSize} />;
      case 'bulgaria': return <BG style={flagSize} />;
      case 'bahrain': return <BH style={flagSize} />;
      case 'burundi': return <BI style={flagSize} />;
      case 'benin': return <BJ style={flagSize} />;
      case 'saint barthélemy': return <BL style={flagSize} />;
      case 'bermuda': return <BM style={flagSize} />;
      case 'brunei darussalam': return <BN style={flagSize} />;
      case 'bolivia, plurinational state of': return <BO style={flagSize} />;
      case 'bonaire, sint eustatius and saba': return <BQ style={flagSize} />;
      case 'brazil': return <BR style={flagSize} />;
      case 'bahamas': return <BS style={flagSize} />;
      case 'bhutan': return <BT style={flagSize} />;
      case 'bouvet island': return <BV style={flagSize} />;
      case 'botswana': return <BW style={flagSize} />;
      case 'belarus': return <BY style={flagSize} />;
      case 'belize': return <BZ style={flagSize} />;
      case 'canada': return <CA style={flagSize} />;
      case 'cocos (keeling) islands': return <CC style={flagSize} />;
      case 'congo, the democratic republic of the': return <CD style={flagSize} />;
      case 'central african republic': return <CF style={flagSize} />;
      case 'congo': return <CG style={flagSize} />;
      case 'switzerland': return <CH style={flagSize} />;
      case 'côte d\'ivoire': return <CI style={flagSize} />;
      case 'cook islands': return <CK style={flagSize} />;
      case 'chile': return <CL style={flagSize} />;
      case 'cameroon': return <CM style={flagSize} />;
      case 'china': return <CN style={flagSize} />;
      case 'colombia': return <CO style={flagSize} />;
      case 'costa rica': return <CR style={flagSize} />;
      case 'cuba': return <CU style={flagSize} />;
      case 'cabo verde': return <CV style={flagSize} />;
      case 'curaçao': return <CW style={flagSize} />;
      case 'christmas island': return <CX style={flagSize} />;
      case 'cyprus': return <CY style={flagSize} />;
      case 'czechia': return <CZ style={flagSize} />;
      case 'germany': return <DE style={flagSize} />;
      case 'djibouti': return <DJ style={flagSize} />;
      case 'denmark': return <DK style={flagSize} />;
      case 'dominica': return <DM style={flagSize} />;
      case 'dominican republic': return <DO style={flagSize} />;
      case 'algeria': return <DZ style={flagSize} />;
      case 'ecuador': return <EC style={flagSize} />;
      case 'estonia': return <EE style={flagSize} />;
      case 'egypt': return <EG style={flagSize} />;
      case 'western sahara': return <EH style={flagSize} />;
      case 'eritrea': return <ER style={flagSize} />;
      case 'spain': return <ES style={flagSize} />;
      case 'ethiopia': return <ET style={flagSize} />;
      case 'finland': return <FI style={flagSize} />;
      case 'fiji': return <FJ style={flagSize} />;
      case 'falkland islands (malvinas)': return <FK style={flagSize} />;
      case 'micronesia, federated states of': return <FM style={flagSize} />;
      case 'faroe islands': return <FO style={flagSize} />;
      case 'france': return <FR style={flagSize} />;
      case 'gabon': return <GA style={flagSize} />;
      case 'united kingdom': return <GB style={flagSize} />;
      case 'grenada': return <GD style={flagSize} />;
      case 'georgia': return <GE style={flagSize} />;
      case 'french guiana': return <GF style={flagSize} />;
      case 'guernsey': return <GG style={flagSize} />;
      case 'ghana': return <GH style={flagSize} />;
      case 'gibraltar': return <GI style={flagSize} />;
      case 'greenland': return <GL style={flagSize} />;
      case 'gambia': return <GM style={flagSize} />;
      case 'guinea': return <GN style={flagSize} />;
      case 'guadeloupe': return <GP style={flagSize} />;
      case 'equatorial guinea': return <GQ style={flagSize} />;
      case 'greece': return <GR style={flagSize} />;
      case 'south georgia and the south sandwich islands': return <GS style={flagSize} />;
      case 'guatemala': return <GT style={flagSize} />;
      case 'guam': return <GU style={flagSize} />;
      case 'guinea-bissau': return <GW style={flagSize} />;
      case 'guyana': return <GY style={flagSize} />;
      case 'hong kong': return <HK style={flagSize} />;
      case 'heard island and mcdonald islands': return <HM style={flagSize} />;
      case 'honduras': return <HN style={flagSize} />;
      case 'croatia': return <HR style={flagSize} />;
      case 'haiti': return <HT style={flagSize} />;
      case 'hungary': return <HU style={flagSize} />;
      case 'indonesia': return <ID style={flagSize} />;
      case 'ireland': return <IE style={flagSize} />;
      case 'israel': return <IL style={flagSize} />;
      case 'isle of man': return <IM style={flagSize} />;
      case 'india': return <IN style={flagSize} />;
      case 'british indian ocean territory': return <IO style={flagSize} />;
      case 'iraq': return <IQ style={flagSize} />;
      case 'iran, islamic republic of iran': return <IR style={flagSize} />;
      case 'iceland': return <IS style={flagSize} />;
      case 'italy': return <IT style={flagSize} />;
      case 'jersey': return <JE style={flagSize} />;
      case 'jamaica': return <JM style={flagSize} />;
      case 'jordan': return <JO style={flagSize} />;
      case 'japan': return <JP style={flagSize} />;
      case 'kenya': return <KE style={flagSize} />;
      case 'kyrgyzstan': return <KG style={flagSize} />;
      case 'cambodia': return <KH style={flagSize} />;
      case 'kiribati': return <KI style={flagSize} />;
      case 'comoros': return <KM style={flagSize} />;
      case 'saint kitts and nevis': return <KN style={flagSize} />;
      case 'korea, democratic people\'s republic of korea': return <KP style={flagSize} />;
      case 'korea, republic of': return <KR style={flagSize} />;
      case 'kuwait': return <KW style={flagSize} />;
      case 'cayman islands': return <KY style={flagSize} />;
      case 'kazakhstan': return <KZ style={flagSize} />;
      case 'lao people\'s democratic republic': return <LA style={flagSize} />;
      case 'lebanon': return <LB style={flagSize} />;
      case 'saint lucia': return <LC style={flagSize} />;
      case 'liechtenstein': return <LI style={flagSize} />;
      case 'sri lanka': return <LK style={flagSize} />;
      case 'liberia': return <LR style={flagSize} />;
      case 'lesotho': return <LS style={flagSize} />;
      case 'lithuania': return <LT style={flagSize} />;
      case 'luxembourg': return <LU style={flagSize} />;
      case 'latvia': return <LV style={flagSize} />;
      case 'libya': return <LY style={flagSize} />;
      case 'morocco': return <MA style={flagSize} />;
      case 'monaco': return <MC style={flagSize} />;
      case 'moldova, republic of': return <MD style={flagSize} />;
      case 'montenegro': return <ME style={flagSize} />;
      case 'saint martin (french part)': return <MF style={flagSize} />;
      case 'madagascar': return <MG style={flagSize} />;
      case 'marshall islands': return <MH style={flagSize} />;
      case 'north macedonia': return <MK style={flagSize} />;
      case 'mali': return <ML style={flagSize} />;
      case 'myanmar': return <MM style={flagSize} />;
      case 'mongolia': return <MN style={flagSize} />;
      case 'macao': return <MO style={flagSize} />;
      case 'northern mariana islands': return <MP style={flagSize} />;
      case 'martinique': return <MQ style={flagSize} />;
      case 'mauritania': return <MR style={flagSize} />;
      case 'montserrat': return <MS style={flagSize} />;
      case 'malta': return <MT style={flagSize} />;
      case 'mauritius': return <MU style={flagSize} />;
      case 'maldives': return <MV style={flagSize} />;
      case 'malawi': return <MW style={flagSize} />;
      case 'mexico': return <MX style={flagSize} />;
      case 'malaysia': return <MY style={flagSize} />;
      case 'mozambique': return <MZ style={flagSize} />;
      case 'namibia': return <NA style={flagSize} />;
      case 'new caledonia': return <NC style={flagSize} />;
      case 'niger': return <NE style={flagSize} />;
      case 'norfolk island': return <NF style={flagSize} />;
      case 'nigeria': return <NG style={flagSize} />;
      case 'nicaragua': return <NI style={flagSize} />;
      case 'netherlands': return <NL style={flagSize} />;
      case 'norway': return <NO style={flagSize} />;
      case 'nepal': return <NP style={flagSize} />;
      case 'nauru': return <NR style={flagSize} />;
      case 'niue': return <NU style={flagSize} />;
      case 'new zealand': return <NZ style={flagSize} />;
      case 'oman': return <OM style={flagSize} />;
      case 'panama': return <PA style={flagSize} />;
      case 'peru': return <PE style={flagSize} />;
      case 'french polynesia': return <PF style={flagSize} />;
      case 'papua new guinea': return <PG style={flagSize} />;
      case 'philippines': return <PH style={flagSize} />;
      case 'pakistan': return <PK style={flagSize} />;
      case 'poland': return <PL style={flagSize} />;
      case 'saint pierre and miquelon': return <PM style={flagSize} />;
      case 'pitcairn': return <PN style={flagSize} />;
      case 'puerto rico': return <PR style={flagSize} />;
      case 'palestine, state of': return <PS style={flagSize} />;
      case 'portugal': return <PT style={flagSize} />;
      case 'palau': return <PW style={flagSize} />;
      case 'paraguay': return <PY style={flagSize} />;
      case 'qatar': return <QA style={flagSize} />;
      case 'réunion': return <RE style={flagSize} />;
      case 'romania': return <RO style={flagSize} />;
      case 'serbia': return <RS style={flagSize} />;
      case 'russian federation': return <RU style={flagSize} />;
      case 'rwanda': return <RW style={flagSize} />;
      case 'saudi arabia': return <SA style={flagSize} />;
      case 'solomon islands': return <SB style={flagSize} />;
      case 'seychelles': return <SC style={flagSize} />;
      case 'sudan': return <SD style={flagSize} />;
      case 'sweden': return <SE style={flagSize} />;
      case 'singapore': return <SG style={flagSize} />;
      case 'saint helena, ascension and tristan da cunha': return <SH style={flagSize} />;
      case 'slovenia': return <SI style={flagSize} />;
      case 'svalbard and jan mayen': return <SJ style={flagSize} />;
      case 'slovakia': return <SK style={flagSize} />;
      case 'sierra leone': return <SL style={flagSize} />;
      case 'san marino': return <SM style={flagSize} />;
      case 'senegal': return <SN style={flagSize} />;
      case 'somalia': return <SO style={flagSize} />;
      case 'suriname': return <SR style={flagSize} />;
      case 'south sudan': return <SS style={flagSize} />;
      case 'sao tome and principe': return <ST style={flagSize} />;
      case 'el salvador': return <SV style={flagSize} />;
      case 'sint maarten (dutch part)': return <SX style={flagSize} />;
      case 'syrian arab republic': return <SY style={flagSize} />;
      case 'eswatini': return <SZ style={flagSize} />;
      case 'turks and caicos islands': return <TC style={flagSize} />;
      case 'chad': return <TD style={flagSize} />;
      case 'french southern territories': return <TF style={flagSize} />;
      case 'togo': return <TG style={flagSize} />;
      case 'thailand': return <TH style={flagSize} />;
      case 'tajikistan': return <TJ style={flagSize} />;
      case 'tokelau': return <TK style={flagSize} />;
      case 'timor-leste': return <TL style={flagSize} />;
      case 'turkmenistan': return <TM style={flagSize} />;
      case 'tunisia': return <TN style={flagSize} />;
      case 'tonga': return <TO style={flagSize} />;
      case 'turkey': return <TR style={flagSize} />;
      case 'trinidad and tobago': return <TT style={flagSize} />;
      case 'tuvalu': return <TV style={flagSize} />;
      case 'taiwan, province of china': return <TW style={flagSize} />;
      case 'tanzania, united republic of': return <TZ style={flagSize} />;
      case 'ukraine': return <UA style={flagSize} />;
      case 'uganda': return <UG style={flagSize} />;
      case 'united states minor outlying islands': return <UM style={flagSize} />;
      case 'united states': return <US style={flagSize} />;
      case 'uruguay': return <UY style={flagSize} />;
      case 'uzbekistan': return <UZ style={flagSize} />;
      case 'holy see': return <VA style={flagSize} />;
      case 'saint vincent and the grenadines': return <VC style={flagSize} />;
      case 'venezuela, bolivarian republic of': return <VE style={flagSize} />;
      case 'virgin islands, british': return <VG style={flagSize} />;
      case 'virgin islands, u.s.': return <VI style={flagSize} />;
      case 'viet nam': return <VN style={flagSize} />;
      case 'vanuatu': return <VU style={flagSize} />;
      case 'wallis and futuna': return <WF style={flagSize} />;
      case 'samoa': return <WS style={flagSize} />;
      case 'kosovo': return <XK style={flagSize} />;
      case 'yemen': return <YE style={flagSize} />;
      case 'mayotte': return <YT style={flagSize} />;
      case 'south africa': return <ZA style={flagSize} />;
      case 'zambia': return <ZM style={flagSize} />;
      case 'zimbabwe': return <ZW style={flagSize} />;
      default: return country.charAt(0); // Fallback to first letter
    }
  };

  // Use static images from data.json
  const getCityImageUrl = (cityData) => {
    if (cityData.imageUrl) {
      return cityData.imageUrl;
    }
    // Fallback to static images from data.json
     return '/images/city_fallback.webp';
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

        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Country selector visibility */}
        <AnimatePresence>
          {showCountrySelector && !loading && (
            <motion.div
              key="country-selector"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden bg-white"
              style={{ willChange: "opacity, height" }}
            >
              {countries.length > 0 ? (
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
              ) : (
                <p className="text-center py-4 text-gray-500">No countries available</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* City Selection Section */}
      {selectedCountry && !loading && (
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
                                src={getCityImageUrl(cityData)}
                                alt={cityName}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://via.placeholder.com/400x200?text=Image+Not+Available";
                                }}
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