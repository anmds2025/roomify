import axios from 'axios';
import { createFormData, getStoredUser } from '.';

// Base API URL
const API_URL = import.meta.env.VITE_APP_API_URL;
const SIGN_CONTRACT_URL = `${API_URL}/contract/sign`;

export interface SignContractPayload {
  pk: string;
  image_a?: string;
  image_b?: string;
}

export interface DeleteContractPayload {
  pk: string;
  token: string;
}

const ENDPOINTS = {
  DELETE_CONTRACT: `${API_URL}/contract/delete`,
} as const;

const FORM_DATA_HEADERS = {
  'Content-Type': 'multipart/form-data',
} as const;

export const signContractApi = async (payload: SignContractPayload): Promise<boolean> => {
  const formData = new FormData();
  
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  });

  const response = await axios.post<{ success: boolean }>(
    SIGN_CONTRACT_URL,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.success;
};

export const signContract = async (contractId: string, signatureImageUrl: string): Promise<boolean> => {

  const payload: SignContractPayload = {
    pk: contractId,
    image_a: '', // Chữ ký của chủ trọ
    image_b: signatureImageUrl,    // Chữ ký của khách
  };

  return await signContractApi(payload);
}; 

// Delete user client
export const deleteContract = async (payload: DeleteContractPayload): Promise<any> => {
  try {
    const formData = createFormData(payload);
    const response = await axios.post(ENDPOINTS.DELETE_CONTRACT, formData, {
      headers: FORM_DATA_HEADERS,
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting data:', error);
    throw error;
  }
};