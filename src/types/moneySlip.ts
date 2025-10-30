export interface IMoneySlipData {
  _id?: {
    $oid: string;
  };
  pk?: string;
  user_pkA: string;
  user_pkB: string;
  user_nameA: string;
  user_nameB: string;
  room_pk: string;
  home_pk?: string;
  room_name: string;
  month: string;
  price: string;
  totalPrice: string;
  moneySlip_path : string;
  path_Delete : string;
  timeUpdate?: {
    $date: string;
  };
  isDeleted?: boolean;
}

export interface IDataResponseMoneySlip {
  num_pages: number;
  currentPage: number;
  totalObject: number;
  has_next: boolean;
  has_previous: boolean;
  objects: IMoneySlipData[];
}

export interface IMoneySlipFormData {
  monthNumber: string;
  today: string;

  user_pkA: string;
  name_a: string;
  user_pkB: string;
  name_b: string;

  deposit: string;
  priceDebt: string;

  room_pk: string;

  numPerson: string;
  numBank: string;
  nameBank: string;
  addressBank: string;

  numElectricityNew: string;
  numElectricityOld: string;
  numWaterNew: string;
  numWaterOld: string;
  imageQR: string;
} 