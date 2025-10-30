import axios from 'axios';
import { createFormData } from '.';
import { IDataResponseMoneySlip, IMoneySlipFormData } from '@/types/moneySlip';

// Constants
const API_URL = import.meta.env.VITE_APP_API_URL;
const ENDPOINTS = {
  GET_MONEY_SLIP_LIST: `${API_URL}/moneySlip/gets`,
  UPDATE_MONEY_SLIP: `${API_URL}/moneySlip/create`,
  CREATE_MONEY_SLIP_MANY: `${API_URL}/moneySlip/createMany`,
  DELETE_MONEY_SLIP: `${API_URL}/moneySlip/delete`,
} as const;

const FORM_DATA_HEADERS = {
  'Content-Type': 'multipart/form-data',
} as const;

export interface GetMoneySlipListPayload {
  room_pk: string;
  page?: number;
  limit?: number;
  token: string;
  user_pk: string;
}

export interface UpdateMoneySlipPayload extends IMoneySlipFormData {
  pk?: string;
  room_pk: string;
  token: string;
}

export interface MoneySlipItem {
  pk: string;
  elecOld: string;
  elecNew: string;
  waterOld?: string;
  waterNew?: string;
  numPeo: string;
  debt: string;
  nameB: string;
}


export interface CreateMoneySlipPayloadMany {
  token: string;
  today: string;
  monthNumber: string;
  list_data: MoneySlipItem[];
}

export interface DeleteMoneySlipPayload {
  pk: string;
  token: string;
}

// Get list
export const getMoneySlipList = async (payload: GetMoneySlipListPayload): Promise<IDataResponseMoneySlip> => {
  try {
    const formData = createFormData(payload);
    const response = await axios.post(ENDPOINTS.GET_MONEY_SLIP_LIST, formData, {
      headers: FORM_DATA_HEADERS,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// (create or update)
export const updateMoneySlip = async (payload: UpdateMoneySlipPayload): Promise<any> => {
  try {
    const formData = createFormData(payload);
    const response = await axios.post(ENDPOINTS.UPDATE_MONEY_SLIP, formData, {
      headers: FORM_DATA_HEADERS,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating data:', error);
    throw error;
  }
};

export const createMoneySlipManyApi = async (payload: CreateMoneySlipPayloadMany): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("list_data", JSON.stringify(payload.list_data)); // quan trọng
    formData.append("today", payload.today);
    formData.append("monthNumber", payload.monthNumber);
    formData.append("token", payload.token);
    const response = await axios.post(ENDPOINTS.CREATE_MONEY_SLIP_MANY, formData, {
      headers: FORM_DATA_HEADERS,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating data:', error);
    throw error;
  }
};

// Delete user client
export const deleteMoneySlip = async (payload: DeleteMoneySlipPayload): Promise<any> => {
  try {
    const formData = createFormData(payload);
    const response = await axios.post(ENDPOINTS.DELETE_MONEY_SLIP, formData, {
      headers: FORM_DATA_HEADERS,
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting data:', error);
    throw error;
  }
}; 