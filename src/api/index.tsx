import { UserModel } from "@/auth";

export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return formData;
};

export const getStoredUser = (): UserModel | null => {
  const userString = localStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
};