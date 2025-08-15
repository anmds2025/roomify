export interface IRoomData {
  _id?: {
    $oid: string;
  };
  pk?: string;
  user_pk: string;
  user_name: string;
  userB_name?: string;
  numPeo?: number;
  owner_phone?: string;
  home_pk?: string;
  home_name?: string;
  room_name: string;
  room_name_slug?: string;
  numBank?: string;
  nameBank?: string;
  addressBank?: string;
  electricity_price?: number;
  water_price?: number;
  typeWater?: string;
  service_price?: number;
  junk_price?: number;
  car_price?: number;
  numWaterOld?: number;
  numElectricityOld?: number;
  price: number;
  size: number;
  type?: string;
  note?: string;
  deposit: number;
  address: string;
  imageQR?: string;
  imageDir?: string;
  imagePaths?: string[];
  temporary_residence?: string;
  contract_pk?: string;
  contract_path: string;
  timeCreate?: {
    $date: string;
  };
  timeUpdate?: {
    $date: string;
  };
  status: string;
  latitude?: string;
  longitude?: string;
  isDeleted?: boolean;
}

export interface IDataResponseRoom {
  objects: IRoomData[];
  total: number;
  page: number;
  limit: number;
} 