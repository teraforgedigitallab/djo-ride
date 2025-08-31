import { useState, useRef, useEffect } from 'react';
import { Undo2, Redo2, Clipboard, Upload, X, AlertCircle, MapPin } from 'lucide-react';
import * as XLSX from 'xlsx';

const BulkImportPricing = ({ onImport, activeCabModels, pricing, cityName, countryName }) => {
  const [isActive, setIsActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [error, setError] = useState(null);
  const pasteRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize history with current pricing on mount or when pricing changes
  useEffect(() => {
    if (pricing && Object.keys(pricing).length > 0) {
      // Only initialize if history is empty
      if (history.length === 0) {
        setHistory([{ data: pricing }]);
        setHistoryIndex(0);
      }
    }
  }, [pricing]);

  const focusInput = () => {
    pasteRef.current?.focus();
    setIsActive(true);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    
    // Get clipboard data
    const clipText = e.clipboardData.getData('text');
    processTabularData(clipText);
    setIsActive(false);
  };

  const processTabularData = (data) => {
    // Process the pasted data
    const rows = data.trim().split('\n');
    const parsedData = [];

    rows.forEach((row) => {
      const cells = row.split('\t');
      if (cells.length >= 3) {
        parsedData.push({
          fourHrRate: parseFloat(cells[0]) || 0,
          eightHrRate: parseFloat(cells[1]) || 0,
          airportRate: parseFloat(cells[2]) || 0,
        });
      }
    });

    applyParsedData(parsedData);
  };

  const applyParsedData = (parsedData) => {
    // Only proceed if we have data
    if (parsedData.length > 0) {
      // Create a snapshot of current pricing before applying changes
      const newPricing = { ...pricing };
      const cabModelsInPricing = activeCabModels.filter(model => pricing[model]);
      
      // Apply parsed data to the pricing
      parsedData.forEach((item, index) => {
        if (index < cabModelsInPricing.length) {
          const model = cabModelsInPricing[index];
          newPricing[model] = {
            ...newPricing[model],
            "4hr40km": item.fourHrRate,
            "8hr80km": item.eightHrRate,
            "airport": item.airportRate
          };
        }
      });
      
      // Add to history and update index
      const newHistory = [...history.slice(0, historyIndex + 1), { data: newPricing }];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      // Pass the updated pricing to parent
      onImport(newPricing);
      setError(null);
    }
  };

  // Handle drag and drop events
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
        
        // Extract just the 3 columns we need (if they exist)
        const processedRows = rows.map(row => {
          if (row.length >= 3) {
            return {
              fourHrRate: parseFloat(row[0]) || 0,
              eightHrRate: parseFloat(row[1]) || 0,
              airportRate: parseFloat(row[2]) || 0
            };
          }
          return null;
        }).filter(Boolean); // Remove null entries
        
        if (processedRows.length === 0) {
          setError('No valid data found in Excel file');
          return;
        }
        
        applyParsedData(processedRows);
      } catch (err) {
        console.error('Error processing Excel file:', err);
        setError('Error processing Excel file. Please make sure it has the correct format.');
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onImport(history[newIndex].data);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onImport(history[newIndex].data);
    }
  };

  return (
    <div className="mb-4 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className={`p-1.5 rounded-md ${historyIndex <= 0 ? 'text-gray-400' : 'text-primary hover:bg-primary/10'}`}
          title="Undo"
        >
          <Undo2 size={18} />
        </button>
        
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className={`p-1.5 rounded-md ${historyIndex >= history.length - 1 ? 'text-gray-400' : 'text-primary hover:bg-primary/10'}`}
          title="Redo"
        >
          <Redo2 size={18} />
        </button>

         
        
        <div className="flex gap-2 ml-auto">
          {/* Show current context */}
        <div className="text-sm text-gray-600 flex items-center">
          <MapPin size={14} className="mr-1" />
          Importing for: <span className="font-medium ml-1">{cityName}, {countryName}</span>
        </div>
        
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
          >
            <Upload size={16} />
            <span>Import Excel</span>
          </button>
          <button
            onClick={focusInput}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
          >
            <Clipboard size={16} />
            <span>Paste Data</span>
          </button>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".xlsx,.xls,.csv" 
          onChange={handleFileSelect}
        />
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
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
      
      {/* Drop zone for Excel files */}
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
          or click to select file<br />
          (Excel must have 3 columns: 4hr/40km, 8hr/80km, airport transfer)
        </p>
      </div>
      
      {isActive && (
        <div className="relative">
          <div className="absolute inset-0 bg-primary/5 border-2 border-primary/30 rounded-lg flex items-center justify-center">
            <div className="bg-white p-3 rounded-lg shadow-lg text-center">
              <p className="mb-2"><strong>Paste your Excel data here</strong></p>
              <p className="text-sm text-gray-600 mb-3">Format: 4hr/40km, 8hr/80km, airport transfer (tab-separated)</p>
              <textarea
                ref={pasteRef}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                onPaste={handlePaste}
                onBlur={() => setIsActive(false)}
                autoFocus
              />
            </div>
          </div>
          <div className="h-32"></div>
        </div>
      )}
    </div>
  );
};

export default BulkImportPricing;