export interface IDepositData {
  _id?: {
    $oid: string;
  };
  pk?: string;
  user_pkA: string;
  user_pkB: string;
  user_nameA: string;
  user_nameB: string;
  home_pk: string;
  home_name: string;
  room_pk: string;
  room_name: string;
  address: string;
  price: string;
  deposit: string;
  deposit_path: string;
  path_Delete : string;
  keepRoomDate?: {
    $date: string;
  };
  valueDate?: {
    $date: string;
  };
  timeUpdate?: {
    $date: string;
  };
  isDeleted?: boolean;
}

export interface IDataResponseDeposit {
  num_pages: number;
  currentPage: number;
  totalObject: number;
  has_next: boolean;
  has_previous: boolean;
  objects: IDepositData[];
}

export interface IDepositFormData {
  today: string;

  user_pkA: string;
  user_pkB: string;

  room_pk: string;

  addressCreate: string;
  deposit: string;
  keepRoomDate: string;
  valueDate: string;
  keepRoomDateSave: string;
  valueDateSave: string;
} 