
import { IChangePasswordData, IDataResponseUser, IUserData, IUserRoleData } from '@/pages/dashboards/light-sidebar/blocks/users/UsersData';
import axios from 'axios';
import { createFormData, getStoredUser } from '.';
import { UserModel } from '@/auth';

// Base API URL
const API_URL = import.meta.env.VITE_APP_API_URL;
const GET_ALL_USER_URL = `${API_URL}/user/gets`;
const GET_USER_URL = `${API_URL}/user/get`;
const DELETE_USER_URL = `${API_URL}/user/delete`;
const UPDATE_USER_URL = `${API_URL}/user/update`;
const USER_ROLE_URL = `${API_URL}/userRoles`;
const UPDATE_PROFILE_URL = `${API_URL}/user/update-profile`;
const CHANGEPASSWORD_URL = `${API_URL}/user/changePassword`;
// Forgot password (OTP)
// Backend: api/views/user.py -> MissPassword, CheckOTPPassword
const FORGOT_PASSWORD_SEND_OTP_URL = `${API_URL}/user/missPassword`;
const FORGOT_PASSWORD_VERIFY_OTP_URL = `${API_URL}/user/checkOTPPassword`;
const RECHARGE_PACKAGES_URL = `${API_URL}/user/recharge/packages`;
const CREATE_RECHARGE_URL = `${API_URL}/user/recharge/create`;
const RECHARGE_TRANSACTIONS_URL = `${API_URL}/user/recharge/transactions`;

export interface UpdateUserPayload {
  pk: string
  phone: string;
  email: string;
  fullname: string;
  address: string;
  level: string;
  typeLogin: string;
}

export interface UpdateProfilePayload {
  pk: string
  phone: string;
  fullname: string;
  address: string;
  cccd_code: string;
  cccd_address: string;
  cccd_day: string;
  avatar: string;
  image_QR: string;
  image_signature?: string;
}


export const getUserApi = async (user : UserModel): Promise<IUserData[]> => {
  const formData = createFormData({
    level: user?.level,
    token: user?.token,
  });

  const response = await axios.post<IDataResponseUser>(
    GET_ALL_USER_URL,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.objects || [];
};

export const getCurrentUserApi = async (user : UserModel): Promise<IUserData> => {
  const formData = createFormData({
    token: user?.token,
  });

  const response = await axios.post<IUserData>(
    GET_USER_URL,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
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

export const updateProfileUserApi = async (
  payload: UpdateProfilePayload,
  user: UserModel
): Promise<string> => {
  try {
    const extendedPayload = {
      ...payload,
      token: user?.token,
    };

    const formData = createFormData(extendedPayload);

    const response = await axios.post<{ Success: string }>(
      UPDATE_PROFILE_URL,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.Success; // đúng key viết hoa
  } catch (error) {
    console.error("API error:", error);
    throw new Error("API error");
  }
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

// Step 1: Send OTP to email
export const sendForgotPasswordOtpApi = async (email: string): Promise<any> => {
  // Backend expects multipart/form-data and param name: email
  const formData = createFormData({ email });
  const response = await axios.post(FORGOT_PASSWORD_SEND_OTP_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Step 2: Verify OTP -> backend will generate new password and send to email (current BE behavior)
export const verifyForgotPasswordOtpApi = async (otp: string): Promise<any> => {
  // Backend expects multipart/form-data and param name: otp
  const formData = createFormData({ otp });
  const response = await axios.post(FORGOT_PASSWORD_VERIFY_OTP_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export interface RechargePackage {
  code: string;
  name: string;
  amount_vnd: number;
  point_value: number;
  bonus?: string;
}

export interface CreateRechargeResponse {
  transaction_id: string;
  transaction_code: string;
  amount_vnd: number;
  point_value: number;
  status: string;
  checkout_url?: string;
  qr_url?: string;
  form_payload?: Record<string, string>;
}

export interface RechargeTransaction {
  _id: { $oid: string };
  package_code: string;
  package_name: string;
  amount_vnd: number;
  point_value: number;
  status: 'pending' | 'paid' | 'failed';
  transaction_code: string;
  checkout_url?: string;
  qr_url?: string;
  paid_at?: any;
  timeCreate?: any;
}

export const getRechargePackagesApi = async (): Promise<{ objects: RechargePackage[]; exchange_rate: string }> => {
  const response = await axios.post(RECHARGE_PACKAGES_URL, createFormData({}), {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const createRechargeApi = async (
  packageCode: string,
  user: UserModel
): Promise<CreateRechargeResponse> => {
  const formData = createFormData({
    token: user?.token,
    package_code: packageCode,
  });

  const response = await axios.post<CreateRechargeResponse>(CREATE_RECHARGE_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getRechargeTransactionsApi = async (
  user: UserModel
): Promise<{ objects: RechargeTransaction[] }> => {
  const formData = createFormData({
    token: user?.token,
  });

  const response = await axios.post<{ objects: RechargeTransaction[] }>(RECHARGE_TRANSACTIONS_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

