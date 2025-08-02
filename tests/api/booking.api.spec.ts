
import { test, expect, APIRequestContext, request } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

  test.describe('Booking API', () => {
    let apiClient: APIRequestContext;
    let token: string;
    let createdBookingId: number;

  // Base booking data used for test creation
  const bookingData = {
    firstname: 'TestUser',
    lastname: 'Automation',
    totalprice: 150,
    depositpaid: true,
    bookingdates: {
      checkin: '2023-12-01',
      checkout: '2023-12-10'
    },
    additionalneeds: 'Wi-Fi'
  };

  // Runs once before all tests - sets up authentication context
  test.beforeAll(async () => {
    const authContext = await request.newContext({ baseURL: process.env.API_BASE_URL });
    const authResponse = await authContext.post('/auth', {
      data: { username: 'admin', password: 'password123' }
    });

    const authBody = await authResponse.json();
    token = authBody.token;

    // Create a reusable client with token
    apiClient = await request.newContext({
      baseURL: process.env.API_BASE_URL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Cookie': `token=${token}`
      }
    });
  });

  // Runs before every test - creates a new booking
  test.beforeEach(async () => {
    const createResponse = await apiClient.post('/booking', {
      data: bookingData
    });
    const createBody = await createResponse.json();
    createdBookingId = createBody.bookingid;
  });

  // Runs after every test - deletes the created booking
  test.afterEach(async () => {
    const response = await apiClient.delete(`/booking/${createdBookingId}`);
    expect(response.status()).toBe(201);
  });

  /////// GetBookingIds ////////
  test('should return an array of booking IDs', async () => {
    const response = await apiClient.get('/booking');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(typeof body[0].bookingid).toBe('number');
    }
  });
 
  //Test: no auth 
  test('should allow fetching booking IDs without token', async () => {
  // Unauthenticated API context
  const unauthClient = await request.newContext({
    baseURL: process.env.API_BASE_URL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json'
    }
  });

  const response = await unauthClient.get('/booking');
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(Array.isArray(body)).toBe(true);

  // If at least one booking exists, ensure it has an id
  if (body.length > 0) {
    expect(body[0]).toHaveProperty('bookingid');
    expect(typeof body[0].bookingid).toBe('number');
  }
});

  // Test: Filter by lastname
  test('should include the created booking when filtering by lastname', async () => {
    const response = await apiClient.get('/booking', {
      params: { lastname: bookingData.lastname }
    });
    const body = await response.json();
    const ids = body.map((b: any) => b.bookingid);
    expect(ids).toContain(createdBookingId);
  });


  // It was my assumption that incorrect data should be handled, but fow now is 500 error
  // test('should return empty array for invalid checkin date format', async () => {
  //   const response = await apiClient.get('/booking', {
  //     params: { checkin: 'not-a-date' }
  //   });
  //   expect(response.status()).toBe(200);
  //   const body = await response.json();
  //   expect(Array.isArray(body)).toBe(true);
  //   expect(body.length).toBe(0);
  // });

  /////// GetBooking ////////
  // Test: Get booking by ID
  test('should retrieve the booking details for the created ID', async () => {
    const response = await apiClient.get(`/booking/${createdBookingId}`);
    expect(response.status()).toBe(200);
    const body = await response.json();

    // Ensure all fields match
    expect(body.firstname.toLowerCase()).toBe(bookingData.firstname.toLowerCase());
    expect(body.lastname.toLowerCase()).toBe(bookingData.lastname.toLowerCase());
    expect(body.totalprice).toBe(bookingData.totalprice);
    expect(body.depositpaid).toBe(bookingData.depositpaid);
    expect(body.additionalneeds.toLowerCase()).toBe(bookingData.additionalneeds.toLowerCase());
    expect(body.bookingdates.checkin).toBe(bookingData.bookingdates.checkin);
    expect(body.bookingdates.checkout).toBe(bookingData.bookingdates.checkout);
  });

  // Test: Non-existent booking ID
  test('should return 404 when trying to retrieve non-existent booking', async () => {
    const response = await apiClient.get('/booking/999999');
    expect(response.status()).toBe(404);
  });

  /////// GreateBooking ////////
  // Valid booking creation test 
  test('should create a new booking successfully with valid data', async () => {
    const validBooking = {
      firstname: 'CreateTest',
      lastname: 'Independent',
      totalprice: 200,
      depositpaid: true,
      bookingdates: {
        checkin: '2023-09-01',
        checkout: '2023-09-10'
      },
      additionalneeds: 'Dinner'
    };

    const response = await apiClient.post('/booking', {
      data: validBooking
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Don't overwrite shared ID
    expect(body).toHaveProperty('bookingid');
    expect(body.booking).toMatchObject(validBooking);

     // Cleanup this booking manually
    const cleanup = await apiClient.delete(`/booking/${body.bookingid}`);
    expect(cleanup.status()).toBe(201);
  });

  // Test: Invalid booking payload
  test('should return 500 when creating booking with missing required fields', async () => {
    const invalidBooking = {
      firstname: 'MissingFields'
      // missing lastname, totalprice, dates, etc.
    };

    const response = await apiClient.post('/booking', {
      data: invalidBooking
    });

    expect(response.status()).toBe(500);
  });

  /////// UpdateBooking ////////
  //Test: update via PUT
  test('should update entire booking with PUT', async () => {
    const updatedBooking = {
      firstname: 'UpdatedFirst',
      lastname: 'UpdatedLast',
      totalprice: 600,
      depositpaid: false,
      bookingdates: {
        checkin: '2023-09-01',
        checkout: '2023-09-15'
      },
      additionalneeds: 'Lunch'
    };

    const response = await apiClient.put(`/booking/${createdBookingId}`, {
      data: updatedBooking
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject(updatedBooking);
  });

  //Test: unauthorized PUT
  test('should reject updating existing booking without token (unauthorized)', async () => {
    const unauthClient = await request.newContext({
      baseURL: process.env.API_BASE_URL,
      extraHTTPHeaders: {
     'Content-Type': 'application/json'
      }
    });

    const updatedBooking = {
      firstname: 'Unauthorized',
      lastname: 'Update',
      totalprice: 500,
      depositpaid: false,
      bookingdates: {
        checkin: '2023-11-01',
        checkout: '2023-11-10'
        },
        additionalneeds: 'Nothing'
      };

    const response = await unauthClient.put(`/booking/${createdBookingId}`, {
        data: updatedBooking
    });

    expect(response.status()).toBe(403); // Forbidden: no auth token
  });


   
  //Test: Missing field on PUT
  test('should return 400 when required fields are missing in PUT', async () => {
    const invalidPutData = {
      firstname: 'OnlyName' // missing lastname, totalprice, bookingdates...
    };

    const response = await apiClient.put(`/booking/${createdBookingId}`, {
      data: invalidPutData
    });

    expect(response.status()).toBe(400);
  });
  
  /////// PartialUpdateBooking ////////
  // Test: update via Patch
  test('should partially update booking with PATCH', async () => {
    const patchData = {
      firstname: 'PatchedName',
      additionalneeds: 'Late Checkout'
    };

    const response = await apiClient.patch(`/booking/${createdBookingId}`, {
      data: patchData
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.firstname).toBe('PatchedName');
    expect(body.additionalneeds).toBe('Late Checkout');
  });

  test('should ignore unknown fields in PATCH without affecting valid update', async () => {
    const patchWithExtraFields = {
      firstname: 'ExtraFieldName',
      hacker: true,
      
    };

    const response = await apiClient.patch(`/booking/${createdBookingId}`, {
      data: patchWithExtraFields
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.firstname).toBe('ExtraFieldName');
    expect(body).not.toHaveProperty('hacker');
    
  });
  
  /////// DeleteBooking ////////
  //Test: Delete booking
  test('should delete booking successfully with valid ID', async () => {
    const toBeDeleted = {
      firstname: 'ToDelete',
      lastname: 'User',
      totalprice: 300,
      depositpaid: true,
      bookingdates: {
        checkin: '2023-11-01',
        checkout: '2023-11-05'
      },
      additionalneeds: 'None'
    };

    const createRes = await apiClient.post('/booking', { data: toBeDeleted });
    expect(createRes.status()).toBe(200);
    const created = await createRes.json();
    const deleteId = created.bookingid;

    const deleteRes = await apiClient.delete(`/booking/${deleteId}`);
    expect(deleteRes.status()).toBe(201);

    const getRes = await apiClient.get(`/booking/${deleteId}`);
    expect(getRes.status()).toBe(404);
  });

  //Test: Invalid ID on Deleting
  test('should return 405 when trying to delete a non-existent booking', async () => {
    const response = await apiClient.delete('/booking/9999999');
    expect(response.status()).toBe(405); // API returns 405 for invalid delete
  });


  ///IDEALLY WE MIGHT NEED TO TEST all the expected response statuses and schema, data types and format validation,
  // booking logic validation(like checkin < checkout), fields limits, boundary conditions and so on
});

