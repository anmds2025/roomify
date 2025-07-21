import { IHomeData, IDataResponseHome } from '@/pages/dashboards/light-sidebar/blocks/homes/HomesData';
import axios from 'axios';
import { createFormData, getStoredUser } from '.';
import { UserModel } from '@/auth';

// Base API URL
const API_URL = import.meta.env.VITE_APP_API_URL;
const GET_HOMES_URL = `${API_URL}/home/gets`;
const UPDATE_HOME_URL = `${API_URL}/home/update`;
const DELETE_HOME_URL = `${API_URL}/home/delete`;

export interface UpdateHomePayload {
  pk?: string;
  phone: string;
  home_name: string;
  numBank?: string;
  nameBank?: string;
  addressBank?: string;
  address?: string;
  electricity_price?: string;
  water_price?: string;
  service_price?: string;
  junk_price?: string;
  car_price?: string;
  typeWater?: string;
  imageQR?: string;
}

export const getHomesApi = async (user: UserModel): Promise<IHomeData[]> => {
  const formData = createFormData({
    token: user?.token,
    user_pk: user?._id.$oid
  });

  const response = await axios.post<IDataResponseHome>(
    GET_HOMES_URL,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.objects;
};

export const updateHomeApi = async (payload: UpdateHomePayload, user: UserModel): Promise<boolean> => {
  const extendedPayload = {
    ...payload,
    token: user?.token,
  };
  const formData = createFormData(extendedPayload);

  const response = await axios.post<{ success: boolean }>(
    UPDATE_HOME_URL,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.success;
};

// Tạm thời ẩn chức năng delete vì backend chưa có endpoint
// export const deleteHomeApi = async (
//   pk: string,
//   user: UserModel
// ): Promise<boolean> => {
//   const formData = createFormData({
//     pk,
//     token: user?.token,
//   });

//   const response = await axios.post<{ success: boolean }>(
//     DELETE_HOME_URL,
//     formData,
//     {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     }
//   );

//   return response.data.success;
// }; 