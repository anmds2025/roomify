export interface MoneyData {
  _id?: {
    $oid: string;
  };
  pk?: string;
  moneySlip_pk: string;
  room_pk: string;
  home_pk: string;
  type: string;
  total: number;
  month: string;
  status: string;
  timeCreate?: {
    $date: string;
  };
  timeUpdate?: {
    $date: string;
  };
  isDeleted?: boolean;
}

export interface MoneyListResponse {
  num_pages: number;
  currentPage: number;
  totalObject: number;
  has_next: boolean;
  has_previous: boolean;
  objects: MoneyData[];
}

export interface GetMoneyListPayload {
  user_pk: string;
  home_pk?: string;
  room_pk?: string;
  type?: string;
  month?: string;
  page?: number;
  limit?: number;
  token: string;
}

// Constants for money types - mapping với API backend
export const TYPE_MONEY = {
  ROOM: 'Phòng',
  ELECTRICITY: 'Điện',
  WATER: 'Nước',
  PARKING: 'Xe',
  OTHER: 'Khác'
} as const;

export const STATUS_MONEY = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
} as const;
