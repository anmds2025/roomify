import { type LanguageCodeType } from '@/i18n';

export interface AuthModel {
  user: UserModel;
}

export interface UserModel {
  _id: { $oid: string };
  phone: string;
  email: string;
  fullname: string;
  address: string;
  nameLogin: string;
  level: string;
  timeUpdate: { $date: number }; 
  cccd_code: string;
  cccd_address: string;
  cccd_day: string; 
  isDeleted: boolean;
  token: string;
  avatar?: string;
  image_QR?: string;
  image_signature?: string;
}

export interface IOption {
  label: string;
  value: string|number;
}
