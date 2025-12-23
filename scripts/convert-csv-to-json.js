const fs = require('fs');
const path = require('path');

// State name mapping
const stateNames = {
  'al': 'Alabama', 'ak': 'Alaska', 'az': 'Arizona', 'ar': 'Arkansas',
  'ca': 'California', 'co': 'Colorado', 'ct': 'Connecticut', 'de': 'Delaware',
  'fl': 'Florida', 'ga': 'Georgia', 'hi': 'Hawaii', 'id': 'Idaho',
  'il': 'Illinois', 'in': 'Indiana', 'ia': 'Iowa', 'ks': 'Kansas',
  'ky': 'Kentucky', 'la': 'Louisiana', 'me': 'Maine', 'md': 'Maryland',
  'ma': 'Massachusetts', 'mi': 'Michigan', 'mn': 'Minnesota', 'ms': 'Mississippi',
  'mo': 'Missouri', 'mt': 'Montana', 'ne': 'Nebraska', 'nv': 'Nevada',
  'nh': 'New Hampshire', 'nj': 'New Jersey', 'nm': 'New Mexico', 'ny': 'New York',
  'nc': 'North Carolina', 'nd': 'North Dakota', 'oh': 'Ohio', 'ok': 'Oklahoma',
  'or': 'Oregon', 'pa': 'Pennsylvania', 'ri': 'Rhode Island', 'sc': 'South Carolina',
  'sd': 'South Dakota', 'tn': 'Tennessee', 'tx': 'Texas', 'ut': 'Utah',
  'vt': 'Vermont', 'va': 'Virginia', 'wa': 'Washington', 'wv': 'West Virginia',
  'wi': 'Wisconsin', 'wy': 'Wyoming', 'dc': 'District of Columbia'
};

// Parse CSV with proper handling of quoted fields and newlines
function parseCSV(content) {
  const lines = [];
  let currentLine = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentLine.push(currentField);
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      if (currentField || currentLine.length > 0) {
        currentLine.push(currentField);
        if (currentLine.length > 1) {
          lines.push(currentLine);
        }
        currentLine = [];
        currentField = '';
      }
    } else {
      currentField += char;
    }
  }

  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField);
    if (currentLine.length > 1) {
      lines.push(currentLine);
    }
  }

  return lines;
}

// Generate URL-friendly slug
function generateSlug(name, city, state) {
  const combined = `${name} ${city} ${state}`;
  return combined
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Main conversion
const csvPath = path.join(__dirname, '..', 'usa_motorcycle_clubs_comprehensive_chapters - Dataset.csv');
const dataDir = path.join(__dirname, '..', 'data');

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const rows = parseCSV(csvContent);

// Headers are in the first row
const headers = rows[0];
console.log('Headers:', headers);

// Convert rows to objects
const clubs = [];
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (row.length < headers.length) continue;

  const club = {};
  headers.forEach((header, index) => {
    club[header.trim()] = row[index] ? row[index].trim() : '';
  });

  // Normalize state to lowercase
  club.State = club.State ? club.State.toLowerCase() : '';
  club.stateName = stateNames[club.State] || club.State.toUpperCase();

  // Normalize city
  club.City = club.City ? club.City.trim() : '';
  club.citySlug = club.City.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

  // Generate slug for URL
  club.slug = generateSlug(club.name, club.City, club.State);

  // Parse numeric fields
  club.reviews = parseInt(club.reviews) || 0;
  club.rating = parseFloat(club.rating) || 0;

  // Only add clubs with valid data
  if (club.name && club.State) {
    clubs.push(club);
  }
}

console.log(`Parsed ${clubs.length} clubs`);

// Generate states data
const statesMap = new Map();
clubs.forEach(club => {
  if (!club.State) return;

  if (!statesMap.has(club.State)) {
    statesMap.set(club.State, {
      code: club.State,
      name: club.stateName,
      slug: club.State,
      clubCount: 0,
      cities: new Set()
    });
  }

  const state = statesMap.get(club.State);
  state.clubCount++;
  if (club.City) {
    state.cities.add(club.City);
  }
});

const states = Array.from(statesMap.values())
  .map(s => ({
    code: s.code,
    name: s.name,
    slug: s.slug,
    clubCount: s.clubCount,
    cityCount: s.cities.size
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

console.log(`Generated ${states.length} states`);

// Generate cities data
const citiesMap = new Map();
clubs.forEach(club => {
  if (!club.City || !club.State) return;

  const cityKey = `${club.State}-${club.citySlug}`;

  if (!citiesMap.has(cityKey)) {
    citiesMap.set(cityKey, {
      name: club.City,
      slug: club.citySlug,
      state: club.State,
      stateName: club.stateName,
      clubCount: 0
    });
  }

  citiesMap.get(cityKey).clubCount++;
});

const cities = Array.from(citiesMap.values())
  .sort((a, b) => {
    if (a.state !== b.state) return a.state.localeCompare(b.state);
    return a.name.localeCompare(b.name);
  });

console.log(`Generated ${cities.length} cities`);

// Write output files
fs.writeFileSync(
  path.join(dataDir, 'clubs.json'),
  JSON.stringify(clubs, null, 2)
);
console.log('Written clubs.json');

fs.writeFileSync(
  path.join(dataDir, 'states.json'),
  JSON.stringify(states, null, 2)
);
console.log('Written states.json');

fs.writeFileSync(
  path.join(dataDir, 'cities.json'),
  JSON.stringify(cities, null, 2)
);
console.log('Written cities.json');

console.log('Done!');
