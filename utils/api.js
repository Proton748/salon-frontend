import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ── Change this to your Render backend URL in production ──────────────────────
export const BASE_URL = 'https://salon-backend-v98o.onrender.com'; // dev: your local IP
// export const BASE_URL = 'https://your-salon-backend.onrender.com'; // production

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const sendOTP    = (phone)       => api.post('/auth/send-otp', { phone });
export const verifyOTP  = (phone, otp, name, role) =>
  api.post('/auth/verify-otp', { phone, otp, name, role });
export const updateProfile = (data)     => api.put('/auth/update-profile', data);
export const getMe         = ()         => api.get('/auth/me');

// ─── Salons ───────────────────────────────────────────────────────────────────
export const getNearbySalons = (lat, lng, radius = 5000) =>
  api.get('/salons/nearby', { params: { lat, lng, radius } });
export const getSalonDetail = (salonId) => api.get(`/salons/${salonId}`);

// ─── Barbers ──────────────────────────────────────────────────────────────────
export const getBarberSlots = (barberId, date, serviceDuration) =>
  api.get(`/barbers/${barberId}/slots`, {
    params: { date, service_duration: serviceDuration },
  });

// ─── Services ─────────────────────────────────────────────────────────────────
export const getSalonServices = (salonId) => api.get(`/services/salon/${salonId}`);
export const getServicePricing = (serviceId, barberId) =>
  api.get(`/services/${serviceId}/pricing`, {
    params: barberId ? { barber_id: barberId } : {},
  });

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const createBooking = (data) => api.post('/bookings', data);
export const getMyBookings = ()     => api.get('/bookings/my');
export const getQueueStatus = (bookingId) => api.get(`/bookings/${bookingId}/queue`);
export const cancelBooking  = (bookingId, reason) =>
  api.delete(`/bookings/${bookingId}`, { data: { reason } });
