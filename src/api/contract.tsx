import axios from 'axios';
import { getStoredUser } from '.';

// Base API URL
const API_URL = import.meta.env.VITE_APP_API_URL;
const SIGN_CONTRACT_URL = `${API_URL}/contract/sign`;

export interface SignContractPayload {
  pk: string;
  image_a?: string;
  image_b?: string;
  token: string;
}

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
  const user = getStoredUser();
  if (!user?.token) {
    throw new Error('User not authenticated');
  }

  // Lấy chữ ký của current user (chủ trọ)
  const currentUserSignature = (user as any)?.image_signature;
  if (!currentUserSignature) {
    throw new Error('Chủ trọ chưa có chữ ký. Vui lòng thêm chữ ký trong phần cập nhật thông tin cá nhân.');
  }

  const payload: SignContractPayload = {
    pk: contractId,
    image_a: currentUserSignature, // Chữ ký của chủ trọ
    image_b: signatureImageUrl,    // Chữ ký của khách
    token: user.token
  };

  return await signContractApi(payload);
}; 