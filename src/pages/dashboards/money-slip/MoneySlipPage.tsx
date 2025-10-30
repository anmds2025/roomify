import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/container';
import { useHome } from '@/hooks/useHome';
import { useRoom } from '@/hooks/useRoom';
import { useMoneySlip } from '@/hooks/useMoneySlip';
import { IHomeData } from '@/pages/dashboards/light-sidebar/blocks/homes/HomesData';
import { IRoomData } from '@/pages/dashboards/light-sidebar/blocks/rooms/RoomsData';
import { IMoneySlipData } from '@/types/moneySlip';
import { KeenIcon } from '@/components';

const formatCurrency = (value?: string) => {
  if (!value) return '0 VND';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
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

  return options.reverse(); // 🔁 Đảo ngược để tháng mới nhất lên đầu
};

const MoneySlipPage = () => {
  const [homes, setHomes] = useState<IHomeData[]>([]);
  const [rooms, setRooms] = useState<IRoomData[]>([]);
  const [slips, setSlips] = useState<IMoneySlipData[]>([]);
  const [selectedHome, setSelectedHome] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [loadingHomes, setLoadingHomes] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingSlips, setLoadingSlips] = useState(false);

  const { getHomes } = useHome();
  const { getRooms } = useRoom();
  const { fetchMoneySlips } = useMoneySlip();

  const monthOptions = useMemo(() => getRecentMonthOptions(12), []);

  const filteredRooms = useMemo(() => {
    if (!selectedHome) return rooms;
    return rooms.filter((r) => (r.home_pk || '') === selectedHome);
  }, [rooms, selectedHome]);

  const filteredSlips = useMemo(() => {
    if (selectedMonth === 'All') return slips;
    return slips.filter((s) => (s.month || '').trim() === selectedMonth);
  }, [slips, selectedMonth]);

  const fetchAllHomes = useCallback(async () => {
    try {
      setLoadingHomes(true);
      const data = await getHomes();
      setHomes(data || []);
    } finally {
      setLoadingHomes(false);
    }
  }, [getHomes]);

  const fetchAllRooms = useCallback(async () => {
    try {
      setLoadingRooms(true);
      const data = await getRooms();
      setRooms(data || []);
    } finally {
      setLoadingRooms(false);
    }
  }, [getRooms]);

  const fetchSlipsForSelected = useCallback(async () => {
    try {
      setLoadingSlips(true);
      const targetRooms = filteredRooms;
      const results = await Promise.all(
        targetRooms.map(async (room) => {
          try {
            const res = await fetchMoneySlips(room.pk || '');
            // Optionally filter by month on client if selectedMonth != 'All'
            const list = (res.objects || []).map((s) => ({ ...s, room_name: room.room_name }));
            if (selectedMonth === 'All') return list;
            return list.filter((s) => (s.month || '').trim() === selectedMonth);
          } catch {
            return [] as IMoneySlipData[];
          }
        })
      );
      const flat = results.flat();
      setSlips(flat);
    } finally {
      setLoadingSlips(false);
    }
  }, [filteredRooms, fetchMoneySlips]);

  useEffect(() => {
    fetchAllHomes();
    fetchAllRooms();
  }, [fetchAllHomes, fetchAllRooms]);

  useEffect(() => {
    fetchSlipsForSelected();
  }, [fetchSlipsForSelected, selectedHome, selectedMonth, rooms]);

  const totalForMonth = useMemo(() => {
    return filteredSlips.reduce((sum, s) => {
      const n = Number(s.totalPrice || 0);
      return sum + (Number.isNaN(n) ? 0 : n);
    }, 0);
  }, [filteredSlips]);

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
                    <option key={m.value} value={m.value}>{m.label}</option>
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
                  onClick={() => fetchSlipsForSelected()}
                  disabled={loadingSlips || loadingRooms}
                >
                  <KeenIcon icon="refresh" className={loadingSlips ? 'animate-spin' : ''} />
                  Làm mới
                </button>
              </div>
            </div>
            <div className="card-body">
              {(loadingRooms || loadingSlips) && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  <span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
                </div>
              )}

              {!loadingRooms && !loadingSlips && (
                <>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
                    <div className="card">
                      <div className="card-body flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-semibold">{formatCurrency(String(totalForMonth))}</div>
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
                        <div key={s._id?.$oid || s.pk} className="card border border-gray-200 hover:shadow-md transition-shadow">
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


