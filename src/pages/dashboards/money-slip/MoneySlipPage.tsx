import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/container';
import { useHome } from '@/hooks/useHome';
import { useRoom } from '@/hooks/useRoom';
import { useMoneySlip } from '@/hooks/useMoneySlip';
import { IHomeData } from '@/pages/dashboards/light-sidebar/blocks/homes/HomesData';
import { IRoomData } from '@/pages/dashboards/light-sidebar/blocks/rooms/RoomsData';
import { IMoneySlipData } from '@/types/moneySlip';
import { KeenIcon } from '@/components';

const formatCurrency = (value?: string | number) => {
  if (value === undefined || value === null || value === '') return '0 VND';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toLocaleString('vi-VN')} VND`;
};

const getRecentMonthOptions = (pastMonths = 6, futureMonths = 12) => {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - pastMonths, 1);
  const totalMonths = pastMonths + futureMonths + 1;

  for (let i = 0; i < totalMonths; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const value = `${d.getMonth() + 1}/${d.getFullYear()}`;
    options.push({ value, label: value });
  }

  return options.reverse();
};

type NormalizedSlip = IMoneySlipData & {
  __id: string;       // normalized unique id
  home_pk?: string;   // đảm bảo tồn tại
  room_name?: string;
  month?: string;     // trimmed
  totalPrice?: string; // keep as string but normalized
};

const MoneySlipPage = () => {
  const [homes, setHomes] = useState<IHomeData[]>([]);
  const [rooms, setRooms] = useState<IRoomData[]>([]);
  const [slips, setSlips] = useState<NormalizedSlip[]>([]);
  const [selectedHome, setSelectedHome] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [loadingHomes, setLoadingHomes] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingSlips, setLoadingSlips] = useState(false);

  const { getHomes } = useHome();
  const { getRooms } = useRoom();
  const { fetchMoneySlips } = useMoneySlip();

  const monthOptions = getRecentMonthOptions();

  // Fetch homes
  const fetchAllHomes = useCallback(async () => {
    try {
      setLoadingHomes(true);
      const data = await getHomes();
      setHomes(data || []);
    } finally {
      setLoadingHomes(false);
    }
  }, [getHomes]);

  // Fetch rooms
  const fetchAllRooms = useCallback(async () => {
    try {
      setLoadingRooms(true);
      const data = await getRooms();
      setRooms(data || []);
    } finally {
      setLoadingRooms(false);
    }
  }, [getRooms]);

  // Normalize a slip object
  const normalizeSlip = (s: any, room: IRoomData): NormalizedSlip => {
    const id = (s._id?.$oid || s.pk || s.id || Math.random()).toString();
    const month = String(s.month ?? '').trim();
    const totalPrice = s.totalPrice !== undefined && s.totalPrice !== null ? String(s.totalPrice) : '0';
    return {
      ...s,
      __id: id,
      room_name: room.room_name,
      home_pk: room.home_pk,
      month,
      totalPrice,
    };
  };

  // Fetch all slips for all rooms, normalize and dedupe by __id
  const fetchAllSlips = useCallback(async () => {
    try {
      setLoadingSlips(true);

      // 🔹 Gọi 1 API duy nhất để lấy toàn bộ slips
      const res = await fetchMoneySlips(); // không cần truyền room.pk
      const objs = (res?.objects || []) as any[];

      // 🔹 Loại bỏ trùng theo __id
      const map = new Map<string, NormalizedSlip>();
      for (const slip of objs) {
        map.set(slip.__id, slip);
      }
      const unique = Array.from(map.values());

      // 🔹 Sắp xếp theo tháng giảm dần
      unique.sort((a, b) => {
        const parseMonth = (m?: string) => {
          if (!m) return new Date(0);
          const [mm, yyyy] = m.split('/');
          const month = Number(mm) - 1;
          const year = Number(yyyy);
          if (Number.isNaN(month) || Number.isNaN(year)) return new Date(0);
          return new Date(year, month, 1);
        };
        return +parseMonth(b.month) - +parseMonth(a.month);
      });

      setSlips(unique);
    } finally {
      setLoadingSlips(false);
    }
  }, [fetchMoneySlips]);

  // initial load homes + rooms
  useEffect(() => {
    fetchAllHomes();
    fetchAllRooms();
  }, [fetchAllHomes, fetchAllRooms]);

  // fetch slips once rooms are loaded
  useEffect(() => {
    if (rooms.length > 0) {
      fetchAllSlips();
    }
  }, [rooms, fetchAllSlips]);

  // filtered list derived from normalized slips
  const filteredSlips = useMemo(() => {
    let list = slips;
    if (selectedHome) {
      list = list.filter((s) => (s.home_pk || '') === selectedHome);
    }
    if (selectedMonth !== 'All') {
      const target = selectedMonth.trim();
      list = list.filter((s) => (s.month || '').trim() === target);
    }
    return list;
  }, [slips, selectedHome, selectedMonth]);

  const totalForMonth = useMemo(() => {
    return filteredSlips.reduce((sum, s) => {
      const n = Number(s.totalPrice || 0);
      return sum + (Number.isNaN(n) ? 0 : n);
    }, 0);
  }, [filteredSlips]);

  // debug
  // console.log('SLIPS', slips);
  // console.log('FILTERED', filteredSlips);

  return (
    <Fragment>
      <Container width="fluid">
        <div className="grid gap-5 lg:gap-7.5 items-stretch">
          <div className="card">
            <div className="card-header flex-wrap gap-3">
              <h3 className="card-title">Quản lý phiếu thu tiền</h3>
              <div className="ml-auto flex items-center gap-3">
                <select
                  className="select select-sm w-40"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="All">Tất cả tháng</option>
                  {monthOptions.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>

                <select
                  className="select select-sm w-56"
                  value={selectedHome}
                  onChange={(e) => setSelectedHome(e.target.value)}
                  disabled={loadingHomes}
                >
                  {loadingHomes ? (
                    <option>Đang tải tòa nhà...</option>
                  ) : homes.length === 0 ? (
                    <option>Không có tòa nhà nào</option>
                  ) : (
                    <>
                      <option value="">Tất cả tòa nhà</option>
                      {homes.map((h) => (
                        <option key={h.pk || h._id?.$oid} value={h.pk || h._id?.$oid}>
                          {h.home_name}
                        </option>
                      ))}
                    </>
                  )}
                </select>

                <button
                  className="btn btn-sm btn-light"
                  onClick={fetchAllSlips}
                  disabled={loadingSlips}
                >
                  <KeenIcon icon="refresh" className={loadingSlips ? 'animate-spin' : ''} />
                  Làm mới
                </button>
              </div>
            </div>

            <div className="card-body">
              {(loadingRooms || loadingSlips) ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  <span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
                    <div className="card">
                      <div className="card-body flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-semibold">{formatCurrency(totalForMonth)}</div>
                          <div className="text-2sm text-gray-500">Tổng tiền phiếu thu</div>
                        </div>
                        <KeenIcon icon="receipt" className="text-primary text-3xl" />
                      </div>
                    </div>
                    <div className="card">
                      <div className="card-body flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-semibold">{filteredSlips.length}</div>
                          <div className="text-2sm text-gray-500">Số phiếu</div>
                        </div>
                        <KeenIcon icon="note" className="text-success text-3xl" />
                      </div>
                    </div>
                  </div>

                  {filteredSlips.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <KeenIcon icon="receipt" className="text-2xl text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Không có phiếu thu</h3>
                      <p className="text-gray-600">Chọn tòa nhà và tháng để xem phiếu thu.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredSlips.map((s) => (
                        <div key={s.__id} className="card border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="card-body p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-semibold">{s.room_name}</div>
                              <a
                                className="btn btn-sm btn-light"
                                href={`${import.meta.env.VITE_APP_SERVER_URL}${s.moneySlip_path}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Xem
                              </a>
                            </div>
                            <div className="text-sm text-gray-600">Tháng: {s.month}</div>
                            <div className="text-sm text-gray-600">Người thuê: {s.user_nameB}</div>
                            <div className="text-sm font-medium mt-1">Tổng: {formatCurrency(s.totalPrice)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export { MoneySlipPage };
