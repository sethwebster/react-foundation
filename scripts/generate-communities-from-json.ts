/**
 * Generate communities.ts from JSON
 * Reads normalized-meetups-data.json and generates src/data/communities.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// City coordinates - same as import script
const CITY_COORDINATES: Record<string, any> = {
  'Tirana, Albania': { lat: 41.3275, lng: 19.8187, timezone: 'Europe/Tirane', country: 'Albania' },
  'Buenos Aires, Argentina': { lat: -34.6037, lng: -58.3816, timezone: 'America/Argentina/Buenos_Aires', country: 'Argentina' },
  'Brisbane, Australia': { lat: -27.4698, lng: 153.0251, timezone: 'Australia/Brisbane', region: 'Queensland', country: 'Australia' },
  'Melbourne, Australia': { lat: -37.8136, lng: 144.9631, timezone: 'Australia/Melbourne', region: 'Victoria', country: 'Australia' },
  'Sydney, Australia': { lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney', region: 'New South Wales', country: 'Australia' },
  'Vienna, Austria': { lat: 48.2082, lng: 16.3738, timezone: 'Europe/Vienna', country: 'Austria' },
  'Brussels, Belgium': { lat: 50.8503, lng: 4.3517, timezone: 'Europe/Brussels', country: 'Belgium' },
  'Belo Horizonte, Brazil': { lat: -19.9167, lng: -43.9345, timezone: 'America/Sao_Paulo', region: 'Minas Gerais', country: 'Brazil' },
  'Curitiba, Brazil': { lat: -25.4284, lng: -49.2733, timezone: 'America/Sao_Paulo', region: 'Paraná', country: 'Brazil' },
  'Florianópolis, Brazil': { lat: -27.5954, lng: -48.5480, timezone: 'America/Sao_Paulo', region: 'Santa Catarina', country: 'Brazil' },
  'Montreal, Québec, Canada': { lat: 45.5017, lng: -73.5673, timezone: 'America/Toronto', region: 'Quebec', country: 'Canada' },
  'Paris, France': { lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris', country: 'France' },
  'München, Germany': { lat: 48.1351, lng: 11.5820, timezone: 'Europe/Berlin', region: 'Bavaria', country: 'Germany' },
  'Zurich, Switzerland': { lat: 47.3769, lng: 8.5417, timezone: 'Europe/Zurich', country: 'Switzerland' },
  'Barcelona, Spain': { lat: 41.3851, lng: 2.1734, timezone: 'Europe/Madrid', region: 'Catalonia', country: 'Spain' },
  'Madrid, Spain': { lat: 40.4168, lng: -3.7038, timezone: 'Europe/Madrid', country: 'Spain' },
  'Warsaw, Poland': { lat: 52.2297, lng: 21.0122, timezone: 'Europe/Warsaw', country: 'Poland' },
  'Wroclaw, Poland': { lat: 51.1079, lng: 17.0385, timezone: 'Europe/Warsaw', country: 'Poland' },
  'Johannesburg, South Africa': { lat: -26.2041, lng: 28.0473, timezone: 'Africa/Johannesburg', country: 'South Africa' },
  'Osaka, Japan': { lat: 34.6937, lng: 135.5023, timezone: 'Asia/Tokyo', country: 'Japan' },
  'Oslo, Norway': { lat: 59.9139, lng: 10.7522, timezone: 'Europe/Oslo', country: 'Norway' },
  'Helsinki, Finland': { lat: 60.1699, lng: 24.9384, timezone: 'Europe/Helsinki', country: 'Finland' },
  'Manila, Philippines': { lat: 14.5995, lng: 120.9842, timezone: 'Asia/Manila', country: 'Philippines' },
  'Medellín, Colombia': { lat: 6.2476, lng: -75.5658, timezone: 'America/Bogota', country: 'Colombia' },
  'Mexico City, Mexico': { lat: 19.4326, lng: -99.1332, timezone: 'America/Mexico_City', country: 'Mexico' },
  'Seattle, WA, USA': { lat: 47.6062, lng: -122.3321, timezone: 'America/Los_Angeles', region: 'Washington', country: 'United States' },
  'Denver, CO, USA': { lat: 39.7392, lng: -104.9903, timezone: 'America/Denver', region: 'Colorado', country: 'United States' },
  'Atlanta, GA, USA': { lat: 33.7490, lng: -84.3880, timezone: 'America/New_York', region: 'Georgia', country: 'United States' },
  'Austin, TX, USA': { lat: 30.2672, lng: -97.7431, timezone: 'America/Chicago', region: 'Texas', country: 'United States' },
  'Boston, MA, USA': { lat: 42.3601, lng: -71.0589, timezone: 'America/New_York', region: 'Massachusetts', country: 'United States' },
  'Charlotte, NC, USA': { lat: 35.2271, lng: -80.8431, timezone: 'America/New_York', region: 'North Carolina', country: 'United States' },
  'Chicago, IL, USA': { lat: 41.8781, lng: -87.6298, timezone: 'America/Chicago', region: 'Illinois', country: 'United States' },
  'Columbus, OH, USA': { lat: 39.9612, lng: -82.9988, timezone: 'America/New_York', region: 'Ohio', country: 'United States' },
  'Dallas, TX, USA': { lat: 32.7767, lng: -96.7970, timezone: 'America/Chicago', region: 'Texas', country: 'United States' },
  'Kansas City, MO, USA': { lat: 39.0997, lng: -94.5786, timezone: 'America/Chicago', region: 'Missouri', country: 'United States' },
  'Las Vegas, NV, USA': { lat: 36.1699, lng: -115.1398, timezone: 'America/Los_Angeles', region: 'Nevada', country: 'United States' },
  'Indianapolis, IN, USA': { lat: 39.7684, lng: -86.1581, timezone: 'America/Indiana/Indianapolis', region: 'Indiana', country: 'United States' },
  'Irvine, CA, USA': { lat: 33.6846, lng: -117.8265, timezone: 'America/Los_Angeles', region: 'California', country: 'United States' },
  'Los Angeles, CA, USA': { lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles', region: 'California', country: 'United States' },
  'Washington, DC, USA': { lat: 38.9072, lng: -77.0369, timezone: 'America/New_York', region: 'District of Columbia', country: 'United States' },
};

const jsonPath = join(process.cwd(), 'data', 'normalized-meetups-data.json');
const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'));

console.log('Generating communities.ts from JSON...');

// Output to communities.ts (overwriting existing file)
const output = join(process.cwd(), 'src', 'data', 'communities-generated.json');

writeFileSync(output, JSON.stringify(jsonData, null, 2));

console.log(`✅ Wrote to ${output}`);
console.log('Run: npm run seed:communities -- --force to re-seed Redis');
