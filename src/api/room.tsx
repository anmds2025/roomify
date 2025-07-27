import { IRoomData, IDataResponseRoom } from '@/pages/dashboards/light-sidebar/blocks/rooms/RoomsData';
import axios from 'axios';
import { createFormData, getStoredUser } from '.';
import { UserModel } from '@/auth';

// Base API URL
const API_URL = import.meta.env.VITE_APP_API_URL;
const GET_ROOMS_URL = `${API_URL}/room/getMyRoom`;
const UPDATE_ROOM_URL = `${API_URL}/room/update`;
const DELETE_ROOM_URL = `${API_URL}/room/delete`;

export interface UpdateRoomPayload {
  pk?: string;
  room_name: string;
  price: number;
  size: number;
  // address: string;
  note?: string;
  token: string;
}

export const getRoomsApi = async (user: UserModel): Promise<IRoomData[]> => {
  try {
    const formData = createFormData({
      user_pk: user._id?.$oid || '',
      token: user.token || ''
    });
    
    const response = await axios.post<IDataResponseRoom>(GET_ROOMS_URL, formData);
    
    // Kiểm tra response structure
    if (response.data && response.data.objects) {
      return response.data.objects;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn('Unexpected response structure:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

export const updateRoomApi = async (payload: UpdateRoomPayload, user: UserModel): Promise<boolean> => {
  try {
    const formData = createFormData({
      ...payload,
      token: user.token || ''
    });

    const response = await axios.post(UPDATE_ROOM_URL, formData);
    return response.status === 200;
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
};

export const deleteRoomApi = async (pk: string, user: UserModel): Promise<boolean> => {
  try {
    const formData = createFormData({
      pk,
      token: user.token || ''
    });

    const response = await axios.post(DELETE_ROOM_URL, formData);
    return response.status === 200;
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
}; 