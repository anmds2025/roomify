export interface IHomeData {
  _id?: {
    $oid: string;
  };
  pk?: string;
  user_pk: string;
  user_name: string;
  user_phone: string;
  home_name: string;
  home_name_slug?: string;
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
  timeCreate?: {
    $date: string;
  };
  timeUpdate?: {
    $date: string;
  };
  isDeleted?: boolean;
}

export interface IDataResponseHome {
  objects: IHomeData[];
  total: number;
  page: number;
  pageSize: number;
}

export interface IUpdateHomeData {
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