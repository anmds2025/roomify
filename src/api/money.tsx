import axios from 'axios';
import { createFormData } from '.';
import { MoneyData, MoneyListResponse, GetMoneyListPayload } from '@/types/money';

// Constants
const API_URL = import.meta.env.VITE_APP_API_URL;
const ENDPOINTS = {
  GET_MONEY_LIST: `${API_URL}/money/gets`,
} as const;

const FORM_DATA_HEADERS = {
  'Content-Type': 'multipart/form-data',
} as const;

// Get money list
export const getMoneyList = async (payload: GetMoneyListPayload): Promise<MoneyListResponse> => {
  try {
    const formData = createFormData(payload);
    const response = await axios.post(ENDPOINTS.GET_MONEY_LIST, formData, {
      headers: FORM_DATA_HEADERS,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching money data:', error);
    throw error;
  }
};
export type { GetMoneyListPayload };

