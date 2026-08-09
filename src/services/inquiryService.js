import api from './api';

/**
 * Submit a new inquiry
 * @param {Object} inquiryData { propertyId, name, email, phone, subject, message }
 */
export const createInquiry = async (inquiryData) => {
  const response = await api.post('/inquiries', inquiryData);
  return response.data.data;
};

/**
 * Get all inquiries (supports filters: propertyId, status, myInquiries)
 * @param {Object} params { propertyId, status, myInquiries }
 */
export const getInquiries = async (params = {}) => {
  const response = await api.get('/inquiries', { params });
  return response.data.data;
};

/**
 * Get single inquiry details
 * @param {string} id
 */
export const getInquiryById = async (id) => {
  const response = await api.get(`/inquiries/${id}`);
  return response.data.data;
};

/**
 * Update inquiry status & officer response
 * @param {string} id
 * @param {Object} data { status, response }
 */
export const updateInquiryStatus = async (id, data) => {
  const response = await api.patch(`/inquiries/${id}`, data);
  return response.data.data;
};

/**
 * Delete an inquiry
 * @param {string} id
 */
export const deleteInquiry = async (id) => {
  const response = await api.delete(`/inquiries/${id}`);
  return response.data;
};
