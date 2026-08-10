/**
 * Property Service
 * CRUD operations and verification for properties.
 */
import api from './api';

/**
 * Get all properties with optional filters and pagination.
 * @param {Object} params - { state, city, landType, verificationStatus, page, limit, owner }
 * @returns {{ properties, pagination }}
 */
export const getProperties = async (params = {}) => {
  const { data } = await api.get('/properties', { params });
  return data.data; // { properties, pagination }
};

/**
 * Get a single property by MongoDB _id.
 * @param {string} id
 * @returns {Object} Property document (populated owner).
 */
export const getPropertyById = async (id) => {
  const { data } = await api.get(`/properties/${id}`);
  return data.data;
};

/**
 * Create a new property (multipart form data with images + documents).
 * @param {FormData} formData
 * @returns {Object} Created property document.
 */
export const createProperty = async (formData) => {
  const { data } = await api.post('/properties', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

/**
 * Update a property.
 * @param {string} id
 * @param {FormData|Object} payload
 * @returns {Object} Updated property document.
 */
export const updateProperty = async (id, payload) => {
  const isFormData = payload instanceof FormData;
  const { data } = await api.put(`/properties/${id}`, payload, {
    ...(isFormData && { headers: { 'Content-Type': 'multipart/form-data' } }),
  });
  return data.data;
};

/**
 * Delete a property.
 * @param {string} id
 */
export const deleteProperty = async (id) => {
  await api.delete(`/properties/${id}`);
};

/**
 * Verify or reject a property (officer/admin).
 * @param {string} id
 * @param {'verified'|'rejected'} verificationStatus
 * @returns {Object} Updated property document.
 */
export const verifyProperty = async (id, verificationStatus) => {
  const { data } = await api.put(`/properties/${id}/verify`, { verificationStatus });
  return data.data;
};
