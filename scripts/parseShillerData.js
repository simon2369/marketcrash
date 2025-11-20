// Run this with: node scripts/parseShillerData.js
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Try to find the Shiller data file
const possibleFiles = [
  './public/data/shiller-data.xls',
  './public/data/ie_data.xls',
  './public/data/shiller-data.xlsx',
];

let dataFile = null;
for (const file of possibleFiles) {
  if (fs.existsSync(file)) {
    dataFile = file;
    break;
  }
}

if (!dataFile) {
  console.error('❌ Error: Could not find Shiller data file.');
  console.error('   Please ensure one of these files exists:');
  possibleFiles.forEach(file => console.error(`   - ${file}`));
  process.exit(1);
}

console.log(`📄 Reading file: ${dataFile}`);
const workbook = XLSX.readFile(dataFile);

console.log('📋 Available sheets:', workbook.SheetNames.join(', '));

// Find the Data sheet (preferred) or use the last sheet
let sheetName = workbook.SheetNames.find(name => 
  name.toLowerCase().includes('data')
) || workbook.SheetNames[workbook.SheetNames.length - 1];

console.log(`📄 Using sheet: ${sheetName}`);

const worksheet = workbook.Sheets[sheetName];

// Get the range of the worksheet
const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
console.log(`📏 Sheet range: ${worksheet['!ref']}`);

// Try to find header row by looking for common column names
// Skip first few rows which are usually titles/notes
let headerRow = 0;
for (let row = 2; row <= Math.min(15, range.e.r); row++) {
  const rowData = XLSX.utils.sheet_to_json(worksheet, { 
    range: XLSX.utils.encode_range({ s: { r: row, c: 0 }, e: { r: row, c: 30 } }),
    header: 1,
    defval: null
  });
  
  if (rowData && rowData[0]) {
    const firstRow = rowData[0];
    const rowStr = firstRow.join(' ').toLowerCase();
    // Look for actual column headers, not title rows
    if ((rowStr.includes('date') || rowStr.includes('year')) && 
        (rowStr.includes('cape') || rowStr.includes('p/e') || rowStr.includes('price') || rowStr.includes('p'))) {
      headerRow = row;
      console.log(`✅ Found header row at index: ${row}`);
      console.log(`📊 Header:`, firstRow.slice(0, 15).join(', '));
      break;
    }
  }
}

// Parse with the found header row
let data = XLSX.utils.sheet_to_json(worksheet, { 
  range: headerRow > 0 ? headerRow : undefined,
  defval: null 
});

// If still no good data, try raw parsing
if (!data || data.length === 0 || Object.keys(data[0] || {}).every(k => k.startsWith('__EMPTY'))) {
  console.log('⚠️  Trying raw parsing to inspect structure...');
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
  
  // Find the actual header row
  for (let i = 0; i < Math.min(20, rawData.length); i++) {
    const row = rawData[i];
    if (row && Array.isArray(row)) {
      const rowStr = row.join(' ').toLowerCase();
      if (rowStr.includes('date') && (rowStr.includes('cape') || rowStr.includes('p/e'))) {
        console.log(`✅ Found header at row ${i}:`, row.slice(0, 10).join(', '));
        // Use this row as header
        const headers = row;
        data = [];
        for (let j = i + 1; j < rawData.length; j++) {
          const rowData = {};
          headers.forEach((header, idx) => {
            if (header) {
              rowData[header] = rawData[j] && rawData[j][idx] !== undefined ? rawData[j][idx] : null;
            }
          });
          if (Object.values(rowData).some(v => v !== null && v !== '')) {
            data.push(rowData);
          }
        }
        break;
      }
    }
  }
}

if (!data || data.length === 0) {
  console.error('❌ Error: No data found in the Excel file.');
  process.exit(1);
}

// Log available columns for debugging
if (data.length > 0) {
  console.log('📊 Available columns:', Object.keys(data[0]).join(', '));
}

// Filter out note/header rows and find actual data rows
const dataRows = data.filter(row => {
  // Check if row has numeric values (actual data)
  const values = Object.values(row);
  return values.some(v => typeof v === 'number' && !isNaN(v) && v > 0);
});

if (dataRows.length === 0) {
  console.error('❌ Error: No data rows found (only notes/headers).');
  console.error('   First few rows:', JSON.stringify(data.slice(0, 5), null, 2));
  process.exit(1);
}

// Get the latest actual data row
const latestData = dataRows[dataRows.length - 1];
console.log(`📊 Found ${dataRows.length} data rows`);

// Try to find CAPE value with various possible column names
const capeValue = 
  latestData['CAPE'] || 
  latestData['Cyclically Adjusted PE Ratio'] ||
  latestData['CAPE Ratio'] ||
  latestData['P/E10'] ||
  latestData['PE10'] ||
  latestData['Ratio'] ||
  latestData['Ratio_1'] ||
  latestData['P/E Ratio'];

if (!capeValue || (typeof capeValue !== 'number' && isNaN(parseFloat(capeValue)))) {
  console.error('❌ Error: Could not find valid CAPE ratio in the data.');
  console.error('   Available columns:', Object.keys(latestData).join(', '));
  console.error('   Latest data row:', JSON.stringify(latestData, null, 2));
  process.exit(1);
}

const capeData = {
  cape: typeof capeValue === 'number' ? capeValue : parseFloat(capeValue),
  date: latestData['Date'] || latestData['date'] || new Date().toISOString(),
  price: latestData['P'] || latestData['Price'] || latestData['price'] || null,
  earnings: latestData['E'] || latestData['Earnings'] || latestData['earnings'] || null,
  historicalAverage: 16.8,
  updatedAt: new Date().toISOString()
};

// Ensure directory exists
const outputDir = path.dirname('./public/data/cape-latest.json');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  './public/data/cape-latest.json',
  JSON.stringify(capeData, null, 2)
);

console.log('✅ CAPE data parsed:', capeData);

