export interface ITenantData {
  _id?: {
    $oid: string;
  };
  pk?: string;
  phone: string;
  email: string;
  name: string;
  cccd_code: string;
  cccd_address: string;
  cccd_day: string;
  room_pk: string;
  home_pk?: string;
  timeUpdate?: {
    $date: string;
  };
  isDeleted?: boolean;
}

export interface IDataResponseTenant {
  num_pages: number;
  currentPage: number;
  totalObject: number;
  has_next: boolean;
  has_previous: boolean;
  objects: ITenantData[];
}

export interface ITenantFormData {
  room_pk: string;
  name: string;
  phone: string;
  email: string;
  cccd_code: string;
  cccd_day: string;
  cccd_address: string;
} 