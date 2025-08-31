import { useState, useRef } from 'react';
import { Upload, X, AlertCircle, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import Button from './Button';

const BulkPricingUpdate = ({
  isOpen,
  onClose,
  onApplyBulkUpdate,
  updateType, // "global", "country", "city"
  countryName = "",
  cityName = "",
  loading
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pricingData, setPricingData] = useState([]);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Excel format examples based on update type
  const excelFormatExamples = {
    global: [
      ["Country", "State", "City", "Model", "4H/40KM", "8H/80KM", "Airport Transfers per way"],
      ["India", "NCR", "Delhi", "Sedan", 13, 20, 13],
      ["India", "NCR", "Delhi", "Sedan +", 19, 29, 19],
      ["India", "NCR", "Delhi", "Sedan - Luxury", 26, 43, 26],
      ["India", "Maharashtra", "Mumbai", "Sedan", 18, 29, 18],
      ["UAE", "Dubai", "Dubai City", "SUV", 45, 70, 45],
    ],
    country: [
      ["Country", "State", "City", "Model", "4H/40KM", "8H/80KM", "Airport Transfers per way"],
      ["India", "NCR", "Delhi", "Sedan", 13, 20, 13],
      ["India", "NCR", "Delhi", "Sedan +", 19, 29, 19],
      ["India", "Maharashtra", "Mumbai", "Sedan", 18, 29, 18],
      ["India", "Maharashtra", "Pune", "Sedan", 16, 25, 17],
    ],
    city: [
      ["Country", "State", "City", "Model", "4H/40KM", "8H/80KM", "Airport Transfers per way"],
      ["India", "Maharashtra", "Mumbai", "Sedan", 18, 29, 18],
      ["India", "Maharashtra", "Mumbai", "Sedan +", 25, 37, 25],
      ["India", "Maharashtra", "Mumbai", "SUV", 29, 48, 29],
      ["India", "Maharashtra", "Mumbai", "Luxury", 52, 95, 52],
    ]
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processExcelFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processExcelFile(e.target.files[0]);
    }
  };

  const processExcelFile = (file) => {
    setError(null);

    if (!file) return;

    // Check if file is an Excel file
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      setError('Please upload an Excel file (.xlsx, .xls) or CSV file');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to array of arrays
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip empty rows
        const filteredRows = rows.filter(row => row.length > 0);

        if (filteredRows.length <= 1) { // Only header or empty
          setError('No data found in the Excel file');
          return;
        }

        // Process based on update type
        let processedData;

        switch (updateType) {
          case 'global':
            // Expect: Country, City, Cab Model, 4hr/40km, 8hr/80km, Airport
            processedData = processGlobalData(filteredRows);
            break;
          case 'country':
            // Expect: City, Cab Model, 4hr/40km, 8hr/80km, Airport
            processedData = processCountryData(filteredRows, countryName);
            break;
          case 'city':
            // Expect: Cab Model, 4hr/40km, 8hr/80km, Airport
            processedData = processCityData(filteredRows, countryName, cityName);
            break;
          default:
            setError('Invalid update type');
            return;
        }

        if (processedData.error) {
          setError(processedData.error);
        } else {
          setPricingData(processedData.data);
        }
      } catch (err) {
        console.error('Error processing Excel file:', err);
        setError('Error processing Excel file. Please make sure it has the correct format.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Process functions for each update type
  const processGlobalData = (rows) => {
    try {
      const headerRow = rows[0];
      // Check if header has the expected columns
      if (headerRow.length < 7 ||
        !String(headerRow[0]).toLowerCase().includes('country') ||
        !String(headerRow[2]).toLowerCase().includes('city') ||
        !String(headerRow[3]).toLowerCase().includes('model')) {
        return {
          error: 'Invalid format. Expected columns: Country, State, City, Model, 4H/40KM, 8H/80KM, Airport Transfers per way'
        };
      }

      const data = rows.slice(1).map(row => {
        if (row.length < 7) return null;

        return {
          country: String(row[0]),
          state: String(row[1]),
          city: String(row[2]),
          cabModel: String(row[3]),
          fourHrRate: parseFloat(row[4]) || 0,
          eightHrRate: parseFloat(row[5]) || 0,
          airportRate: parseFloat(row[6]) || 0
        };
      }).filter(Boolean);

      return { data };
    } catch (err) {
      return { error: 'Error processing global data. Please check the format.' };
    }
  };

  // Update the processCountryData function
  const processCountryData = (rows, country) => {
    try {
      const headerRow = rows[0];
      // Check if header has the expected columns
      if (headerRow.length < 7 ||
        !String(headerRow[2]).toLowerCase().includes('city') ||
        !String(headerRow[3]).toLowerCase().includes('model')) {
        return {
          error: 'Invalid format. Expected columns: Country, State, City, Model, 4H/40KM, 8H/80KM, Airport Transfers per way'
        };
      }

      const data = rows.slice(1).map(row => {
        if (row.length < 7) return null;

        // For country updates, make sure we only process rows for the selected country
        if (country && String(row[0]).toLowerCase() !== country.toLowerCase()) {
          return null;
        }

        return {
          country: String(row[0]),
          state: String(row[1]),
          city: String(row[2]),
          cabModel: String(row[3]),
          fourHrRate: parseFloat(row[4]) || 0,
          eightHrRate: parseFloat(row[5]) || 0,
          airportRate: parseFloat(row[6]) || 0
        };
      }).filter(Boolean);

      return { data };
    } catch (err) {
      return { error: 'Error processing country data. Please check the format.' };
    }
  };

  // Update the processCityData function
  const processCityData = (rows, country, city) => {
    try {
      const headerRow = rows[0];
      // Check if header has the expected columns
      if (headerRow.length < 7 ||
        !String(headerRow[3]).toLowerCase().includes('model')) {
        return {
          error: 'Invalid format. Expected columns: Country, State, City, Model, 4H/40KM, 8H/80KM, Airport Transfers per way'
        };
      }

      const data = rows.slice(1).map(row => {
        if (row.length < 7) return null;

        // For city updates, make sure we only process rows for the selected country and city
        if ((country && String(row[0]).toLowerCase() !== country.toLowerCase()) ||
          (city && String(row[2]).toLowerCase() !== city.toLowerCase())) {
          return null;
        }

        return {
          country: String(row[0]),
          state: String(row[1]),
          city: String(row[2]),
          cabModel: String(row[3]),
          fourHrRate: parseFloat(row[4]) || 0,
          eightHrRate: parseFloat(row[5]) || 0,
          airportRate: parseFloat(row[6]) || 0
        };
      }).filter(Boolean);

      return { data };
    } catch (err) {
      return { error: 'Error processing city data. Please check the format.' };
    }
  };

  const handleApplyUpdate = () => {
    if (pricingData.length === 0) {
      setError('Please import pricing data first');
      return;
    }

    onApplyBulkUpdate(pricingData, updateType);
  };

  const getTitle = () => {
    switch (updateType) {
      case 'global': return 'Update All Pricing';
      case 'country': return `Update All Pricing for ${countryName}`;
      case 'city': return `Update Pricing for ${cityName}, ${countryName}`;
      default: return 'Update Pricing';
    }
  };

  // Download sample template
  const downloadSampleTemplate = () => {
    const example = excelFormatExamples[updateType];
    const worksheet = XLSX.utils.aoa_to_sheet(example);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample");

    // Generate file name
    let fileName;
    switch (updateType) {
      case 'global':
        fileName = 'global_pricing_template.xlsx';
        break;
      case 'country':
        fileName = `${countryName.toLowerCase().replace(/\s+/g, '_')}_pricing_template.xlsx`;
        break;
      case 'city':
        fileName = `${cityName.toLowerCase().replace(/\s+/g, '_')}_pricing_template.xlsx`;
        break;
      default:
        fileName = 'pricing_template.xlsx';
    }

    XLSX.writeFile(workbook, fileName);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">{getTitle()}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={18} />
              <span>{error}</span>
              <button
                className="ml-auto text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-1"
                onClick={() => setError(null)}
                aria-label="Dismiss error"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">1. Download the Sample Template</h3>
            <p className="text-gray-600 mb-3">
              Download our sample Excel template to see the exact format required for this update.
            </p>
            <Button
              onClick={downloadSampleTemplate}
              className="bg-primary/90 text-white hover:bg-primary px-4 py-2 rounded-md flex items-center"
            >
              <span className="flex items-center">
                <FileSpreadsheet size={16} className="mr-2" />
                Download Template
              </span>
            </Button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">2. Upload Your Excel File</h3>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 mb-4 transition-colors text-center cursor-pointer
                ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}`}
            >
              <Upload className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-gray-600 font-medium">Drag & Drop Excel File Here</p>
              <p className="text-sm text-gray-500 mt-1">
                or click to select file
              </p>
              <div className="mt-4 border border-gray-200 rounded-lg p-3 bg-gray-50 text-left">
                <p className="text-sm font-medium text-gray-700 mb-2">Required Format:</p>
                <div className="text-xs text-gray-600">
                  <p className="font-medium">Columns:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>Country (exact name as in system)</li>
                    <li>State</li>
                    <li>City (exact name as in system)</li>
                    <li>Model (cab model name)</li>
                    <li>4H/40KM (rate)</li>
                    <li>8H/80KM (rate)</li>
                    <li>Airport Transfers per way (rate)</li>
                  </ul>

                  {updateType === 'global' && (
                    <p className="mt-2 italic">For global updates, include data for all countries and cities you want to update.</p>
                  )}
                  {updateType === 'country' && (
                    <p className="mt-2 italic">For country updates, include only data for cities in {countryName}.</p>
                  )}
                  {updateType === 'city' && (
                    <p className="mt-2 italic">For city updates, include only data for {cityName}, {countryName}.</p>
                  )}
                </div>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
            />
          </div>

          {pricingData.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">3. Review Imported Data</h3>
              <div className="border border-gray-200 rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {updateType === 'global' && (
                        <>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                        </>
                      )}
                      {updateType === 'country' && (
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                      )}
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cab Model</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">4hr/40km</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">8hr/80km</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Airport</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {pricingData.slice(0, 10).map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {updateType === 'global' && (
                          <>
                            <td className="px-3 py-2 text-sm text-gray-900">{item.country}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{item.city}</td>
                          </>
                        )}
                        {updateType === 'country' && (
                          <td className="px-3 py-2 text-sm text-gray-900">{item.city}</td>
                        )}
                        <td className="px-3 py-2 text-sm text-gray-900">{item.cabModel}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{item.fourHrRate}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{item.eightHrRate}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{item.airportRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pricingData.length > 10 && (
                  <div className="px-3 py-2 text-center text-sm text-gray-500 bg-gray-50 border-t border-gray-200">
                    Showing 10 of {pricingData.length} rows
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-8 border-t pt-4">
            <Button
              onClick={onClose}
              size="sm"
              variant="outline"
            >
              Cancel
            </Button>

            <Button
              onClick={handleApplyUpdate}
              disabled={pricingData.length === 0 || loading}
              variant="primary"
            >
              {loading ? "Processing..." : "Apply Update"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkPricingUpdate;