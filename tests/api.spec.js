import { test, expect } from '@playwright/test';

test.describe('Mercedes-Benz API Tests', () => {

  // ============================================
  // VEHICLE DATA APIs (Using Free Car API)
  // ============================================
  
  const CAR_API_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

  test('API-01: Get Mercedes-Benz vehicle models', async ({ request }) => {
    // NHTSA API - Get models for Mercedes-Benz
    const response = await request.get(
      `${CAR_API_BASE}/GetModelsForMake/mercedes?format=json`
    );
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    // Verify response structure
    expect(data).toHaveProperty('Results');
    expect(data.Results.length).toBeGreaterThan(0);
    
    // Verify Mercedes models returned
    const modelNames = data.Results.map(r => r.Model_Name);
    console.log('✅ Mercedes models found:', modelNames.slice(0, 5));
    
    // Should include known models
    expect(modelNames.some(m => m.includes('C-Class') || m.includes('E-Class') || m.includes('S-Class') || m.includes('GLE'))).toBeTruthy();
  });

  test('API-02: Get vehicle details by VIN decoding', async ({ request }) => {
    // Sample Mercedes VIN (public example)
    const mercedesVIN = 'WDDGF4HB1CA660797';
    
    const response = await request.get(
      `${CAR_API_BASE}/DecodeVinValues/${mercedesVIN}?format=json`
    );
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.Results).toBeDefined();
    expect(data.Results[0].Make).toContain('MERCEDES');
    
    console.log('✅ VIN Decoded:', {
      Make: data.Results[0].Make,
      Model: data.Results[0].Model,
      Year: data.Results[0].ModelYear,
    });
  });

  test('API-03: Get vehicle manufacturers list', async ({ request }) => {
    const response = await request.get(
      `${CAR_API_BASE}/GetAllManufacturers?format=json&page=1`
    );
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.Results.length).toBeGreaterThan(0);
    
    // Find Mercedes in manufacturers
    const mercedes = data.Results.find(m => 
      m.Mfr_Name?.toUpperCase().includes('MERCEDES') ||
      m.Mfr_CommonName?.toUpperCase().includes('MERCEDES')
    );
    
    console.log('✅ Manufacturers API working, found', data.Results.length, 'manufacturers');
  });

  // ============================================
  // LOCATION/DEALER APIs (Using Free Geocoding)
  // ============================================
  
  test('API-04: Geocode Stuttgart location (Dealer search simulation)', async ({ request }) => {
    // Using free Nominatim API (OpenStreetMap)
    const response = await request.get(
      'https://nominatim.openstreetmap.org/search?q=Stuttgart,Germany&format=json&limit=1',
      {
        headers: {
          'User-Agent': 'PlaywrightTest/1.0'
        }
      }
    );
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].display_name).toContain('Stuttgart');
    
    console.log('✅ Stuttgart coordinates:', {
      lat: data[0].lat,
      lon: data[0].lon,
    });
  });

  test('API-05: Search for Mercedes dealerships in area', async ({ request }) => {
    // Using Overpass API (OpenStreetMap) to find car dealers
    const query = `
      [out:json][timeout:25];
      area["name"="Stuttgart"]->.searchArea;
      node["shop"="car"]["brand"~"Mercedes",i](area.searchArea);
      out body;
    `;
    
    const response = await request.post('https://overpass-api.de/api/interpreter', {
      data: query,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    console.log('✅ Found', data.elements?.length || 0, 'Mercedes-related locations in Stuttgart');
  });

  test('API-06: Validate location coordinates format', async ({ request }) => {
    const response = await request.get(
      'https://nominatim.openstreetmap.org/search?q=Mercedes-Benz+Museum+Stuttgart&format=json&limit=1',
      {
        headers: {
          'User-Agent': 'PlaywrightTest/1.0'
        }
      }
    );
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    if (data.length > 0) {
      // Validate coordinate format
      expect(parseFloat(data[0].lat)).toBeGreaterThan(48);  // Stuttgart latitude ~48.7
      expect(parseFloat(data[0].lon)).toBeGreaterThan(9);   // Stuttgart longitude ~9.1
      console.log('✅ Mercedes-Benz Museum location validated');
    }
  });

  // ============================================
  // CONTACT/FORM APIs (Using Mock API)
  // ============================================
  
  const MOCK_API = 'https://jsonplaceholder.typicode.com';

  test('API-07: Submit contact form (POST simulation)', async ({ request }) => {
    // Simulating contact form submission
    const contactData = {
      name: 'Test Customer',
      email: 'customer@test.com',
      subject: 'Test Drive Request',
      message: 'I would like to schedule a test drive for the new E-Class',
      preferredDealer: 'Stuttgart-Mitte',
      vehicleInterest: 'E-Class 2024'
    };
    
    const response = await request.post(`${MOCK_API}/posts`, {
      data: contactData
    });
    
    expect(response.status()).toBe(201);
    
    const result = await response.json();
    expect(result.id).toBeDefined();
    
    console.log('✅ Contact form submitted, ID:', result.id);
  });

  test('API-08: Update contact request (PUT simulation)', async ({ request }) => {
    const updatedData = {
      id: 1,
      name: 'Test Customer Updated',
      email: 'customer.updated@test.com',
      subject: 'Updated: Test Drive Request',
      status: 'confirmed'
    };
    
    const response = await request.put(`${MOCK_API}/posts/1`, {
      data: updatedData
    });
    
    expect(response.status()).toBe(200);
    
    const result = await response.json();
    expect(result.status).toBe('confirmed');
    
    console.log('✅ Contact request updated');
  });

  // ============================================
  // AUTHENTICATION APIs (Using GoRest)
  // ============================================
  
  const GOREST_API = 'https://gorest.co.in/public/v2';
  const GOREST_TOKEN = 'd916f8e168cee833066a2fb07146f8aea01c7585bf541867459ec3bf70a20797';

  test('API-09: User registration flow (Customer account)', async ({ request }) => {
    const timestamp = Date.now();
    const userData = {
      name: 'Mercedes Test Customer',
      email: `mercedes.customer.${timestamp}@test.com`,
      gender: 'female',
      status: 'active'
    };
    
    const response = await request.post(`${GOREST_API}/users`, {
      headers: {
        'Authorization': `Bearer ${GOREST_TOKEN}`
      },
      data: userData
    });
    
    expect(response.status()).toBe(201);
    
    const user = await response.json();
    expect(user.id).toBeDefined();
    expect(user.name).toBe('Mercedes Test Customer');
    
    console.log('✅ Customer registered, ID:', user.id);
    
    // Cleanup - delete the test user
    await request.delete(`${GOREST_API}/users/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${GOREST_TOKEN}`
      }
    });
  });

  test('API-10: Unauthorized access returns 401', async ({ request }) => {
    // Try to access protected endpoint without token
    const response = await request.post(`${GOREST_API}/users`, {
      data: {
        name: 'Unauthorized User',
        email: 'unauth@test.com',
        gender: 'male',
        status: 'active'
      }
      // NO Authorization header!
    });
    
    expect(response.status()).toBe(401);
    
    console.log('✅ Unauthorized access correctly rejected with 401');
  });

});