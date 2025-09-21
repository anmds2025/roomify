import axios from 'axios';
import { createFormData, ExpenseResponse, GetExpensePayload, getStoredUser } from '.';
import { UserModel } from '@/auth';
import { IHomeData } from '@/pages/dashboards/light-sidebar/blocks/homes';

// Base API URL
const API_URL = import.meta.env.VITE_APP_API_URL;
const GET_INTERIORS_URL = `${API_URL}/interior/gets`;
const UPDATE_INTERIOR_URL = `${API_URL}/interior/update`;
const DELETE_INTERIOR_URL = `${API_URL}/interior/delete`;

export interface InteriorData {
  _id: { $oid: string };
  pk: string
  user_pk: string;
  name: string;
  price: number;
  timeUpdate: { $date: number }; 
}

export interface IDataResponsInterior {
  objects : InteriorData[]
}


export interface UpdateInteriorPayload {
  pk: string
  user_pk: string;
  name: string;
  price: number;
}

export interface ModalUpdateInteriorProps {
  open: boolean;
  onClose: () => void;
  interior: InteriorData;  
  fetchInterior:  () => void; 
}

export interface GetInteriorPayload {
  user_pk: string;
  home_pk?: string;
  month?: string;
  token: string;
}

export interface InteriorResponse {
  num_pages: number;
  currentPage: number;
  totalObject: number;
  has_next: boolean;
  has_previous: boolean;
  objects: InteriorData[];
}

const FORM_DATA_HEADERS = {
  'Content-Type': 'multipart/form-data',
} as const;

export const getInteriorsApi = async (user: UserModel): Promise<InteriorData[]> => {
  const formData = createFormData({
    user_pk: user?._id?.$oid,
    token: user?.token,
  });

  const response = await axios.post<IDataResponsInterior>(
    GET_INTERIORS_URL,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.objects;
};

export const updateInteriorApi = async (payload: UpdateInteriorPayload, user: UserModel): Promise<boolean> => {
  const extendedPayload = {
    ...payload,
    token: user?.token,
  };
  const formData = createFormData(extendedPayload);

  const response = await axios.post<{ success: boolean }>(
    UPDATE_INTERIOR_URL,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.success;
};

export const deleteInteriorApi = async (
  pk: string,
  user: UserModel
): Promise<boolean> => {
  const formData = createFormData({
    pk, 
    token: user?.token,
  });

  const response = await axios.post<{ success: boolean }>(
    DELETE_INTERIOR_URL,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.success; 
};
