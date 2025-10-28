// Helper utility to load and parse college data from CSV
let collegesCache = null;

export const loadColleges = async () => {
  // Return cached data if already loaded
  if (collegesCache) {
    return collegesCache;
  }

  try {
    const response = await fetch('/Hyderabad_Colleges(1).csv');
    if (!response.ok) {
      throw new Error('Failed to load colleges data');
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    // Skip header row and parse data
    const colleges = lines.slice(1)
      .filter(line => line.trim()) // Remove empty lines
      .map(line => {
        // Simple CSV parsing (handles commas within quotes)
        const columns = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            columns.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        columns.push(current.trim()); // Add the last column
        
        return {
          name: columns[0] || '', // College Name
          shortName: columns[1] || '', // Short Name
          type: columns[2] || '', // Type
          affiliation: columns[3] || '', // Affiliation
          location: columns[4] || '', // Location / Area
          city: columns[5] || '', // City
          state: columns[6] || '', // State
          pincode: columns[7] || '', // Pincode
          website: columns[8] || '' // Website
        };
      })
      .filter(college => college.name); // Remove entries without names
    
    // Cache the parsed data
    collegesCache = colleges;
    return colleges;
  } catch (error) {
    console.error('Error loading colleges:', error);
    return [];
  }
};

export const searchColleges = (colleges, searchTerm, limit = 10) => {
  if (!searchTerm || searchTerm.length < 3) {
    return [];
  }
  
  const term = searchTerm.toLowerCase().trim();
  
  return colleges
    .filter(college => {
      const name = college.name.toLowerCase();
      const shortName = college.shortName.toLowerCase();
      
      // Match against full name or short name
      return name.includes(term) || shortName.includes(term);
    })
    .slice(0, limit);
};
