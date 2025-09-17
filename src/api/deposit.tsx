import axios from 'axios';
import { createFormData } from '.';
import { IDataResponseDeposit, IDepositFormData } from '@/types/deposit';
import { toast } from 'react-toastify';

// Constants
const API_URL = import.meta.env.VITE_APP_API_URL;
const ENDPOINTS = {
  GET_DEPOSIT_LIST: `${API_URL}/deposit/gets`,
  UPDATE_DEPOSIT: `${API_URL}/deposit/create`,
  DELETE_DEPOSIT: `${API_URL}/deposit/delete`,
} as const;

const FORM_DATA_HEADERS = {
  'Content-Type': 'multipart/form-data',
} as const;

export interface GetDepositPayload {
  user_pk: string;
  hoom_pk: string;
  page?: number;
  limit?: number;
  token: string;
}

export interface UpdateDepositPayload extends IDepositFormData {
  pk?: string;
  token: string;
}

export interface DeleteDepositPayload {
  pk: string;
  token: string;
}

// Get list
export const getDepositList = async (payload: GetDepositPayload): Promise<IDataResponseDeposit> => {
  try {
    const formData = createFormData(payload);
    const response = await axios.post(ENDPOINTS.GET_DEPOSIT_LIST, formData, {
      headers: FORM_DATA_HEADERS,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const updateDeposit = async (payload: UpdateDepositPayload): Promise<any> => {
  try {
    const formData = createFormData(payload);
    const response = await axios.post(ENDPOINTS.UPDATE_DEPOSIT, formData, {
      headers: FORM_DATA_HEADERS,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating data:', error);
    throw error;
  }
};

export const deleteDeposit = async (payload: DeleteDepositPayload): Promise<any> => {
  try {
    const formData = createFormData(payload);
    const response = await axios.post(ENDPOINTS.DELETE_DEPOSIT, formData, {
      headers: FORM_DATA_HEADERS,
    });
    toast.success('Xóa thành công')
    return response.data;
  } catch (error) {
    console.error('Error deleting data:', error);
    throw error;
  }
}; 