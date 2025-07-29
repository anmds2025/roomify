import { IDataResponseTenant, ITenantData, ITenantFormData } from '@/types/tenant';
import axios from 'axios';
import { createFormData } from '.';

// Constants
const API_URL = import.meta.env.VITE_APP_API_URL;
const ENDPOINTS = {
  GET_USER_CLIENT_LIST: `${API_URL}/userClient/gets`,
  UPDATE_USER_CLIENT: `${API_URL}/userClient/update`,
  DELETE_USER_CLIENT: `${API_URL}/userClient/delete`,
} as const;

const FORM_DATA_HEADERS = {
  'Content-Type': 'multipart/form-data',
} as const;

export interface GetUserClientListPayload {
  _room_pk: string;
  page?: number;
  limit?: number;
  token: string;
}

export interface UpdateTenantPayload extends ITenantFormData {
  pk?: string;
  room_pk: string;
  token: string;
}

export interface DeleteTenantPayload {
  pk: string;
  token: string;
}

// Get user client list
export const getUserClientList = async (payload: GetUserClientListPayload): Promise<IDataResponseTenant> => {
  try {
    const formData = createFormData(payload);
    const response = await axios.post(ENDPOINTS.GET_USER_CLIENT_LIST, formData, {
      headers: FORM_DATA_HEADERS,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user clients:', error);
    throw error;
  }
};

// Update user client (create or update)
export const updateUserClient = async (payload: UpdateTenantPayload): Promise<any> => {
  try {
    const formData = createFormData(payload);
    const response = await axios.post(ENDPOINTS.UPDATE_USER_CLIENT, formData, {
      headers: FORM_DATA_HEADERS,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user client:', error);
    throw error;
  }
};

// Delete user client
export const deleteUserClient = async (payload: DeleteTenantPayload): Promise<any> => {
  try {
    const formData = createFormData(payload);
    const response = await axios.post(ENDPOINTS.DELETE_USER_CLIENT, formData, {
      headers: FORM_DATA_HEADERS,
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting user client:', error);
    throw error;
  }
}; 