import { IRoleData } from '@/pages/dashboards/light-sidebar/blocks/users/UsersData';
import axios from 'axios';

// Base API URL
const API_URL = import.meta.env.VITE_APP_API_URL;
const ROLE_URL = `${API_URL}/role`;


// Lấy tất cả các Role
export const getRolesApi = async (): Promise<IRoleData[]> => {
  const response = await axios.get<IRoleData[]>(ROLE_URL);
  return response.data;
};


export const createRoleApi = async (
  data: Omit<IRoleData, 'id'>
): Promise<IRoleData> => {
  const response = await axios.post<IRoleData>(ROLE_URL, data);
  return response.data;
};

export const updateRoleApi = async (
  data: IRoleData
): Promise<IRoleData> => {
  const response = await axios.patch<IRoleData>(
    ROLE_URL, 
    data,
  );
  return response.data;
};

export const deleteRoleApi = async (data: { id: string }): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(
    ROLE_URL, 
    { data } 
  );
  return response.data;
};
