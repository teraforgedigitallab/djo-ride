import { useState, useRef } from 'react';
import { X, Download, FileSpreadsheet, Upload, AlertCircle, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import Button from './Button';
import { db } from '../firebase/config';
import { doc, setDoc, writeBatch } from 'firebase/firestore';

// Change the EXCEL_TEMPLATE_HEADERS to a more user-friendly format
const EXCEL_TEMPLATE_HEADERS = [
  'Country Name',
  'State Name',
  'City Name',
  'Sedan - 4H-40km Rate',
  'Sedan - 8H-80km Rate',
  'Sedan - Airport Rate',
  'Sedan Plus - 4H-40km Rate',
  'Sedan Plus - 8H-80km Rate',
  'Sedan Plus - Airport Rate',
  'Sedan Luxury - 4H-40km Rate',
  'Sedan Luxury - 8H-80km Rate',
  'Sedan Luxury - Airport Rate',
  'MUV - 4H-40km Rate',
  'MUV - 8H-80km Rate',
  'MUV - Airport Rate',
  'SUV - 4H-40km Rate',
  'SUV - 8H-80km Rate',
  'SUV - Airport Rate',
  'SUV Plus - 4H-40km Rate',
  'SUV Plus - 8H-80km Rate',
  'SUV Plus - Airport Rate',
  'Luxury - 4H-40km Rate',
  'Luxury - 8H-80km Rate',
  'Luxury - Airport Rate',
  'Luxury Plus - 4H-40km Rate',
  'Luxury Plus - 8H-80km Rate',
  'Luxury Plus - Airport Rate'
];

// Create a mapping from user-friendly headers to the internal field names
const HEADER_TO_FIELD_MAPPING = {
  'Country Name': 'countryName',
  'State Name': 'stateName',
  'City Name': 'cityName',
  'Sedan - 4H-40km Rate': 'SedanPricing_4H-40kmRate',
  'Sedan - 8H-80km Rate': 'SedanPricing_8H-80kmRate',
  'Sedan - Airport Rate': 'SedanPricing_AirportRate',
  'Sedan Plus - 4H-40km Rate': 'SedanPlusPricing_4H-40kmRate',
  'Sedan Plus - 8H-80km Rate': 'SedanPlusPricing_8H-80kmRate',
  'Sedan Plus - Airport Rate': 'SedanPlusPricing_AirportRate',
  'Sedan Luxury - 4H-40km Rate': 'SedanLuxuryPricing_4H-40kmRate',
  'Sedan Luxury - 8H-80km Rate': 'SedanLuxuryPricing_8H-80kmRate',
  'Sedan Luxury - Airport Rate': 'SedanLuxuryPricing_AirportRate',
  'MUV - 4H-40km Rate': 'MUVPricing_4H-40kmRate',
  'MUV - 8H-80km Rate': 'MUVPricing_8H-80kmRate',
  'MUV - Airport Rate': 'MUVPricing_AirportRate',
  'SUV - 4H-40km Rate': 'SUVPricing_4H-40kmRate',
  'SUV - 8H-80km Rate': 'SUVPricing_8H-80kmRate',
  'SUV - Airport Rate': 'SUVPricing_AirportRate',
  'SUV Plus - 4H-40km Rate': 'SUVPlusPricing_4H-40kmRate',
  'SUV Plus - 8H-80km Rate': 'SUVPlusPricing_8H-80kmRate',
  'SUV Plus - Airport Rate': 'SUVPlusPricing_AirportRate',
  'Luxury - 4H-40km Rate': 'LuxuryPricing_4H-40kmRate',
  'Luxury - 8H-80km Rate': 'LuxuryPricing_8H-80kmRate',
  'Luxury - Airport Rate': 'LuxuryPricing_AirportRate',
  'Luxury Plus - 4H-40km Rate': 'LuxuryPlusPricing_4H-40kmRate',
  'Luxury Plus - 8H-80km Rate': 'LuxuryPlusPricing_8H-80kmRate',
  'Luxury Plus - Airport Rate': 'LuxuryPlusPricing_AirportRate'
};

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

const MODEL_FIELD_MAPPING = {
  "Sedan": "SedanPricing",
  "Sedan +": "SedanPlusPricing",
  "Sedan Luxury": "SedanLuxuryPricing",
  "MUV": "MUVPricing",
  "SUV": "SUVPricing",
  "SUV +": "SUVPlusPricing",
  "Luxury": "LuxuryPricing",
  "Luxury +": "LuxuryPlusPricing"
};

const PricingExcelUploader = ({ isOpen, onClose, onSuccess }) => {
  const [fileData, setFileData] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState('upload'); // upload, preview, success
  const [expandedRows, setExpandedRows] = useState({});
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Create and download Excel template
  const downloadTemplate = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([EXCEL_TEMPLATE_HEADERS]);

    // Apply some styling to make the template more readable
    const wscols = EXCEL_TEMPLATE_HEADERS.map(() => ({ wch: 22 })); // Width for each column
    worksheet['!cols'] = wscols;

    // Add styling to the header row
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cell_address]) continue;
      worksheet[cell_address].s = {
        font: { bold: true, color: { rgb: "000000" } },
        fill: { fgColor: { rgb: "EEEEEE" } }
      };
    }

    // Add sample row
    XLSX.utils.sheet_add_aoa(worksheet, [
      [
        'India',
        'Maharashtra',
        'Mumbai',
        2000, 4000, 3000, // Sedan
        2500, 4500, 3500, // Sedan Plus
        3000, 5000, 4000, // Sedan Luxury
        3500, 5500, 4500, // MUV
        4000, 6000, 5000, // SUV
        4500, 6500, 5500, // SUV Plus
        5000, 7000, 6000, // Luxury
        5500, 7500, 6500  // Luxury Plus
      ]
    ], { origin: -1 });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pricing Template');

    // Add instructions sheet with better formatting
    const instructionsData = [
      ['DJO Ride - Pricing Upload Instructions'],
      [''],
      ['1. Do not modify the header row'],
      ['2. Each row must have Country Name, State Name, and City Name'],
      ['3. Rates must be numeric values only'],
      ['4. You can leave rates empty for categories you don\'t want to set'],
      ['5. Each row represents a city with its pricing for all categories'],
      ['6. Upload the completed Excel file without changing the structure'],
      [''],
      ['Format Explanation:'],
      ['- 4H-40km Rate: Price for 4 hours, 40 kilometers package'],
      ['- 8H-80km Rate: Price for 8 hours, 80 kilometers package'],
      ['- Airport Rate: Price for airport pickup/drop service'],
      [''],
      ['Note: Any existing pricing for the same city will be overwritten']
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    // Generate file and download
    XLSX.writeFile(workbook, 'DJO_Ride_Pricing_Template.xlsx');
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileData(file);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON with the user-friendly headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate data and map the user-friendly headers back to our internal field names
        const validationErrors = [];
        const processedData = jsonData.map((row, idx) => {
          const internalRow = {};

          // Convert headers from user-friendly to internal format
          Object.entries(row).forEach(([header, value]) => {
            const internalField = HEADER_TO_FIELD_MAPPING[header];
            if (internalField) {
              internalRow[internalField] = value;
            } else {
              // If the uploaded file uses our internal field names directly
              internalRow[header] = value;
            }
          });

          // Check for required fields
          if (!internalRow.countryName || !internalRow.stateName || !internalRow.cityName) {
            validationErrors.push(`Row ${idx + 2}: Missing required field (Country Name, State Name, or City Name)`);
          }

          // Structure pricing data
          const pricingData = {};

          DEFAULT_CAB_MODELS.forEach(model => {
            const fieldName = MODEL_FIELD_MAPPING[model];
            const hasData = [
              `${fieldName}_4H-40kmRate`,
              `${fieldName}_8H-80kmRate`,
              `${fieldName}_AirportRate`
            ].some(key => internalRow[key] !== undefined);

            if (hasData) {
              pricingData[fieldName] = {
                "4H-40kmRate": Number(internalRow[`${fieldName}_4H-40kmRate`] || 0),
                "8H-80kmRate": Number(internalRow[`${fieldName}_8H-80kmRate`] || 0),
                "AirportRate": Number(internalRow[`${fieldName}_AirportRate`] || 0)
              };
            }
          });

          return {
            countryName: internalRow.countryName,
            stateName: internalRow.stateName,
            cityName: internalRow.cityName,
            pricing: pricingData,
            docId: `${internalRow.cityName} - ${internalRow.stateName} - ${internalRow.countryName}`
          };
        });

        setParsedData(processedData);
        setErrors(validationErrors);
        setStep('preview');

      } catch (error) {
        console.error(error);
        toast.error("Failed to parse Excel file");
        setErrors(["Invalid Excel file format. Please use the template."]);
      }
    };

    reader.onerror = () => {
      toast.error("Error reading file");
      setErrors(["Failed to read the file"]);
    };

    reader.readAsBinaryString(file);
  };

  // Toggle expanded row
  const toggleRowExpanded = (docId) => {
    setExpandedRows(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  // Upload pricing data to Firestore
  const uploadPricingData = async () => {
    if (parsedData.length === 0 || errors.length > 0) {
      toast.error("Please fix errors before uploading");
      return;
    }

    setUploading(true);

    try {
      const batch = writeBatch(db);

      parsedData.forEach(city => {
        const docRef = doc(db, "pricing", city.docId);

        // Prepare document data
        const docData = {
          countryName: city.countryName,
          stateName: city.stateName,
          cityName: city.cityName,
          // Add all pricing fields
          ...Object.entries(city.pricing).reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {})
        };

        batch.set(docRef, docData, { merge: true });
      });

      await batch.commit();
      toast.success(`Successfully uploaded pricing for ${parsedData.length} cities`);
      setStep('success');
      onSuccess && onSuccess();

      // Reset after 2 seconds
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);

    } catch (error) {
      toast.error("Failed to upload pricing data");
      setErrors([error.message]);
    } finally {
      setUploading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFileData(null);
    setParsedData([]);
    setErrors([]);
    setStep('upload');
    setExpandedRows({});
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold text-primary flex items-center">
            <FileSpreadsheet className="mr-2" size={20} />
            {step === 'upload' && 'Upload Pricing Data'}
            {step === 'preview' && 'Preview Pricing Data'}
            {step === 'success' && 'Upload Successful'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            disabled={uploading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="text-center py-8">
              <div className="mb-8">
                <p className="text-gray-600">
                  Download the template and follow the format for uploading city pricing data
                </p>
              </div>

              {/* Instructions Section */}
              <div className="mb-8 text-left max-w-2xl mx-auto bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h5 className="font-semibold text-primary mb-2">Instructions:</h5>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Do not modify the header row in the template.</li>
                  <li>Each row must have <b>Country Name</b>, <b>State Name</b>, and <b>City Name</b>.</li>
                  <li>Rates must be numeric values only.</li>
                  <li>You can leave rates empty for categories you don&apos;t want to set.</li>
                  <li>Each row represents a city with its pricing for all categories.</li>
                  <li>Upload the completed Excel file without changing the structure.</li>
                  <li>
                    <b>Format Explanation:</b>
                    <ul className="list-disc list-inside ml-4">
                      <li>4H-40km Rate: Price for 4 hours, 40 kilometers package</li>
                      <li>8H-80km Rate: Price for 8 hours, 80 kilometers package</li>
                      <li>Airport Rate: Price for airport pickup/drop service</li>
                    </ul>
                  </li>
                  <li className="mt-2 text-red-600 font-medium">Note: Any existing pricing for the same city will be overwritten.</li>
                </ul>
              </div>

              <Button
                onClick={downloadTemplate}
                className="bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90 mb-8 mx-auto"
              >
                <Download size={16} className="mr-2" /> Download Excel Template
              </Button>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 max-w-md mx-auto">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx,.xls"
                  className="hidden"
                  id="excel-upload"
                />
                <label
                  htmlFor="excel-upload"
                  className="cursor-pointer flex flex-col items-center text-gray-600 hover:text-primary"
                >
                  <Upload size={40} className="mb-3 text-gray-400" />
                  <span className="font-medium">Click to upload Excel file</span>
                  <span className="text-sm text-gray-500 mt-1">
                    .xlsx or .xls format only
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-medium">Pricing Data Preview</h4>
                  <p className="text-gray-600 text-sm">
                    {parsedData.length} cities loaded from {fileData?.name}
                  </p>
                </div>
                <Button
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                  disabled={uploading}
                >
                  Reset
                </Button>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="mb-4 bg-red-50 border border-red-200 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" size={16} />
                    <div>
                      <h5 className="font-medium text-red-700">Fix these issues before uploading:</h5>
                      <ul className="mt-1 list-disc list-inside text-red-600 text-sm">
                        {errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2"></th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase tracking-wider">City</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase tracking-wider">State</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase tracking-wider">Country</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase tracking-wider">Categories</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parsedData.map((city, idx) => (
                      <>
                        <tr key={city.docId} className={expandedRows[city.docId] ? "bg-blue-50" : "hover:bg-gray-50"}>
                          <td className="w-10">
                            <button
                              onClick={() => toggleRowExpanded(city.docId)}
                              className="p-1 rounded-full hover:bg-gray-200"
                            >
                              <ChevronDown
                                size={16}
                                className={`transition-transform ${expandedRows[city.docId] ? 'rotate-180' : ''}`}
                              />
                            </button>
                          </td>
                          <td className="px-3 py-2">{city.cityName}</td>
                          <td className="px-3 py-2">{city.stateName}</td>
                          <td className="px-3 py-2">{city.countryName}</td>
                          <td className="px-3 py-2">
                            {Object.keys(city.pricing).length} categories
                          </td>
                        </tr>
                        {expandedRows[city.docId] && (
                          <tr>
                            <td colSpan={5} className="px-4 py-2 bg-gray-50">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                                {Object.entries(city.pricing).map(([category, rates]) => (
                                  <div key={category} className="bg-white p-2 rounded border border-gray-200">
                                    <div className="font-medium text-primary">
                                      {category.replace('Pricing', '')}:
                                    </div>
                                    <div className="mt-1 space-y-1">
                                      <div>4H-40km: {rates["4H-40kmRate"]}</div>
                                      <div>8H-80km: {rates["8H-80kmRate"]}</div>
                                      <div>Airport: {rates["AirportRate"]}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
                <Check size={40} className="text-green-600" />
              </div>
              <h4 className="text-xl font-medium text-green-700 mb-2">Upload Successful!</h4>
              <p className="text-gray-600">
                {parsedData.length} cities have been updated with new pricing data
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-2">
          {step === 'upload' && (
            <Button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </Button>
          )}

          {step === 'preview' && (
            <>
              <Button
                onClick={onClose}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={uploadPricingData}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 flex items-center"
                disabled={uploading || errors.length > 0}
              >
                {uploading ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" /> Upload Data
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PricingExcelUploader;