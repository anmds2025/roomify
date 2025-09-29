import axios from 'axios';
import { createFormData, ExpenseResponse, GetExpensePayload, getStoredUser } from '.';
import { UserModel } from '@/auth';
import { IHomeData } from '@/pages/dashboards/light-sidebar/blocks/homes';

// Base API URL
const API_URL = import.meta.env.VITE_APP_API_URL;
const GET_EXPENSES_URL = `${API_URL}/expense/gets`;
const UPDATE_EXPENSE_URL = `${API_URL}/expense/update`;
const DELETE_EXPENSE_URL = `${API_URL}/expense/delete`;

export interface IExpenseData {
  _id: { $oid: string };
  pk: string
  user_pk: string;
  home_pk: string;
  title: string;
  total: number;
  month: string;
  image: string;
  timeUpdate: { $date: number }; 
  timeCreate: { $date: number }; 
}

export interface IDataResponseExpense {
  objects : IExpenseData[]
}


export interface UpdateExpensePayload {
  pk: string
  user_pk: string;
  home_pk: string;
  title: string;
  total: number;
  month: string;
  image: string;
}

export interface ModalUpdateExpenseProps {
  open: boolean;
  onClose: () => void;
  expense: IExpenseData;  
  homeData: IHomeData[],
  fetchExpense: () => void; 
}

const FORM_DATA_HEADERS = {
  'Content-Type': 'multipart/form-data',
} as const;

export const getExpensesApi = async (user: UserModel): Promise<IExpenseData[]> => {
  const formData = createFormData({
    user_pk: user?._id?.$oid,
    token: user?.token,
  });

  const response = await axios.post<IDataResponseExpense>(
    GET_EXPENSES_URL,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.objects;
};

export const getFilterExpensesApi = async (payload: GetExpensePayload): Promise<ExpenseResponse> => {
  try {
    const formData = createFormData(payload);
    const response = await axios.post(GET_EXPENSES_URL, formData, {
      headers: FORM_DATA_HEADERS,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching money data:', error);
    throw error;
  }
};

export const updateExpenseApi = async (payload: UpdateExpensePayload, user: UserModel): Promise<boolean> => {
  const extendedPayload = {
    ...payload,
    token: user?.token,
  };
  const formData = createFormData(extendedPayload);

  const response = await axios.post<{ success: boolean }>(
    UPDATE_EXPENSE_URL,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.success;
};

export const deleteExpenseApi = async (
  pk: string,
  user: UserModel
): Promise<boolean> => {
  const formData = createFormData({
    pk, 
    token: user?.token,
  });

  const response = await axios.post<{ success: boolean }>(
    DELETE_EXPENSE_URL,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.success; 
};
