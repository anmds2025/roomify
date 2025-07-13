
import { IChangePasswordData, IDataResponseUser, IUserData, IUserRoleData } from '@/pages/dashboards/light-sidebar/blocks/users/UsersData';
import axios from 'axios';
import { createFormData, getStoredUser } from '.';
import { UserModel } from '@/auth';

// Base API URL
const API_URL = import.meta.env.VITE_APP_API_URL;
const GET_USER_URL = `${API_URL}/user/gets`;
const DELETE_USER_URL = `${API_URL}/user/delete`;
const UPDATE_USER_URL = `${API_URL}/user/update`;
const USER_ROLE_URL = `${API_URL}/userRoles`;
const UPDATE_PROFILE_URL = `${API_URL}/update-profile`;
const CHANGEPASSWORD_URL = `${API_URL}/user/changePassword`;
const CHECK_MAIL_PASSWORD = `${API_URL}/send-mail-check-password`;
const SEND_NEW_PASSWORD = `${API_URL}/send-mail-new-password`;

export interface UpdateUserPayload {
  pk: string
  phone: string;
  email: string;
  fullname: string;
  address: string;
  level: string;
  typeLogin: string;
}

export const getUserApi = async (user : UserModel): Promise<IUserData[]> => {
  const formData = createFormData({
    level: user?.level,
    token: user?.token,
  });

  const response = await axios.post<IDataResponseUser>(
    GET_USER_URL,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.objects;
};

export const updateUserApi = async (payload: UpdateUserPayload, user : UserModel): Promise<boolean> => {
  const extendedPayload = {
    ...payload,
     token: user?.token,
  };
  const formData = createFormData(extendedPayload);

  const response = await axios.post<{ success: boolean }>(
    UPDATE_USER_URL,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.success;
};

export const deleteUserApi = async (
  pk: string,
  user: UserModel
): Promise<boolean> => {
  const formData = createFormData({
    pk, 
    token: user?.token,
    level: user?.level,
  });

  const response = await axios.post<{ success: boolean }>(
    DELETE_USER_URL,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.success; 
};

export const changePasswordApi = async (
  data: Omit<IChangePasswordData, 'id'>
): Promise<IChangePasswordData> => {
  const response = await axios.post<IChangePasswordData>(
    CHANGEPASSWORD_URL, 
    data,
  );
  return response.data;
};

export const sendMailCheckPasswordApi = async (
  email: string
): Promise<any> => {
  const response = await axios.post(CHECK_MAIL_PASSWORD, { email });
  return response.data;
};

export const sendMailNewPasswordApi = async (
 email: string, token: string
): Promise<any> => {
  const response = await axios.post(SEND_NEW_PASSWORD, { email, token });
  return response.data;
};

