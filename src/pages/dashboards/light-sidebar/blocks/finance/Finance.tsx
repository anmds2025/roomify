import { useMemo, useState } from 'react';
import ApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
// Use ApexOptions directly for flexible chart types (bar, area, etc.)
import { KeenIcon } from '@/components';

type ViewMode = 'month' | 'year';

interface Building {
  id: string;
  name: string;
}

// Mock buildings
const BUILDINGS: Building[] = [
  { id: 'b1', name: 'Tòa nhà A' },
  { id: 'b2', name: 'Tòa nhà B' },
  { id: 'b3', name: 'Tòa nhà C' }
];

// Mock finance data generator per building
const generateFinanceData = (seed: number) => {
  const rand = (min: number, max: number, i: number) =>
    Math.floor(min + ((Math.sin(seed + i) + 1) / 2) * (max - min));

  // 12 months
  const revenueRoom = Array.from({ length: 12 }, (_, i) => rand(20, 120, i));
  const revenueElectricity = Array.from({ length: 12 }, (_, i) => rand(5, 30, i + 2));
  const revenueWater = Array.from({ length: 12 }, (_, i) => rand(3, 20, i + 4));
  const revenueParking = Array.from({ length: 12 }, (_, i) => rand(2, 15, i + 6));
  const revenueOther = Array.from({ length: 12 }, (_, i) => rand(0, 25, i + 8));
  const revenue = revenueRoom.map((v, i) => v + revenueElectricity[i] + revenueWater[i] + revenueParking[i] + revenueOther[i]);
  const expense = Array.from({ length: 12 }, (_, i) => rand(30, 120, i + 5));

  return { revenue, expense, revenueRoom, revenueElectricity, revenueWater, revenueParking, revenueOther };
};

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const toCurrency = (n: number) => `${n.toLocaleString('vi-VN')} VND`;

const Finance = () => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(BUILDINGS[0].id);
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const data = useMemo(() => {
    const index = BUILDINGS.findIndex((b) => b.id === selectedBuildingId);
    return generateFinanceData(index + 1);
  }, [selectedBuildingId]);

  const totals = useMemo(() => {
    const totalRevenue = data.revenue.reduce((a, b) => a + b, 0);
    const totalExpense = data.expense.reduce((a, b) => a + b, 0);
    const profit = totalRevenue - totalExpense;
    const cashFlow = profit; // simplified for mock
    const room = data.revenueRoom.reduce((a, b) => a + b, 0);
    const elec = data.revenueElectricity.reduce((a, b) => a + b, 0);
    const water = data.revenueWater.reduce((a, b) => a + b, 0);
    const park = data.revenueParking.reduce((a, b) => a + b, 0);
    const other = data.revenueOther.reduce((a, b) => a + b, 0);
    return { totalRevenue, totalExpense, profit, cashFlow, room, elec, water, park, other };
  }, [data]);

  const monthlyOptions: ApexOptions = useMemo(() => ({
    series: [
      { name: 'Doanh thu', data: data.revenue },
      { name: 'Chi phí', data: data.expense }
    ],
    chart: { type: 'bar', height: 420, width: '100%', toolbar: { show: false } },
    plotOptions: {
      bar: { columnWidth: '45%', borderRadius: 6 }
    },
    dataLabels: { enabled: false },
    legend: { position: 'top' },
    colors: ['var(--tw-primary)', 'var(--tw-danger)'],
    xaxis: {
      categories: months,
      axisTicks: { show: false },
      axisBorder: { show: false },
      labels: { style: { colors: 'var(--tw-gray-500)', fontSize: '12px' } }
    },
    yaxis: {
      labels: {
        style: { colors: 'var(--tw-gray-500)', fontSize: '12px' },
        formatter: (v: number) => `${v}k`
      }
    },
    tooltip: { enabled: true, y: { formatter: (v: number) => `${v}k VND` } }
  }), [data]);

  const yearlyOptions: ApexOptions = useMemo(() => ({
    series: [
      { name: 'Doanh thu', data: data.revenue },
      { name: 'Chi phí', data: data.expense },
      { name: 'Lợi nhuận', data: data.revenue.map((v, i) => v - data.expense[i]) }
    ],
    chart: { type: 'line', height: 420, width: '100%', toolbar: { show: false } },
    colors: ['var(--tw-primary)', 'var(--tw-danger)', 'var(--tw-success)'],
    stroke: {
      curve: 'straight',
      width: 3,
      colors: ['var(--tw-primary)', 'var(--tw-danger)', 'var(--tw-success)']
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      colors: ['var(--tw-primary)', 'var(--tw-danger)', 'var(--tw-success)'],
      strokeColors: ['var(--tw-primary)', 'var(--tw-danger)', 'var(--tw-success)']
    },
    dataLabels: { enabled: false },
    legend: { show: true, position: 'top' },
    xaxis: {
      categories: months,
      axisTicks: { show: false },
      axisBorder: { show: false },
      labels: { style: { colors: 'var(--tw-gray-500)', fontSize: '12px' } }
    },
    yaxis: {
      labels: {
        style: { colors: 'var(--tw-gray-500)', fontSize: '12px' },
        formatter: (v: number) => `${v}k`
      }
    },
    tooltip: { enabled: true, y: { formatter: (v: number) => `${v}k VND` } }
  }), [data]);

  return (
    <div className="grid gap-5 lg:gap-7.5">
      <div className="card">
        <div className="card-header flex-wrap gap-3">
          <h3 className="card-title">Quản lý tài chính</h3>
          <div className="flex items-center gap-3 ml-auto">
            <select
              className="select select-sm w-56"
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
            >
              {BUILDINGS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <div className="btn-group btn-group-sm">
              <button
                className={`btn ${viewMode === 'month' ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setViewMode('month')}
              >
                Tháng
              </button>
              <button
                className={`btn ${viewMode === 'year' ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setViewMode('year')}
              >
                Năm
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="card">
              <div className="card-body flex items-center justify-between">
                <div>
                  <div className="text-2xl font-semibold">{toCurrency(totals.profit * 1000)}</div>
                  <div className="text-2sm text-gray-500">Lợi nhuận</div>
                </div>
                <KeenIcon icon="chart-line-up" className="text-success text-3xl" />
              </div>
            </div>
            <div className="card">
              <div className="card-body flex items-center justify-between">
                <div>
                  <div className="text-2xl font-semibold">{toCurrency(totals.totalRevenue * 1000)}</div>
                  <div className="text-2sm text-gray-500">Tổng doanh thu</div>
                </div>
                <KeenIcon icon="chart-column" className="text-primary text-3xl" />
              </div>
            </div>
            <div className="card">
              <div className="card-body flex items-center justify-between">
                <div>
                  <div className="text-2xl font-semibold">{toCurrency(totals.totalExpense * 1000)}</div>
                  <div className="text-2sm text-gray-500">Tổng chi phí</div>
                </div>
                <KeenIcon icon="money-down" className="text-danger text-3xl" />
              </div>
            </div>
            <div className="card">
              <div className="card-body flex items-center justify-between">
                <div>
                  <div className="text-2xl font-semibold">{toCurrency(totals.room * 1000)}</div>
                  <div className="text-2sm text-gray-500">Doanh thu từ phòng</div>
                </div>
                <KeenIcon icon="home-2" className="text-primary text-3xl" />
              </div>
            </div>
            <div className="card">
              <div className="card-body flex items-center justify-between">
                <div>
                  <div className="text-2xl font-semibold">{toCurrency(totals.elec * 1000)}</div>
                  <div className="text-2sm text-gray-500">Doanh thu tiền điện</div>
                </div>
                <KeenIcon icon="flash" className="text-warning text-3xl" />
              </div>
            </div>
            <div className="card">
              <div className="card-body flex items-center justify-between">
                <div>
                  <div className="text-2xl font-semibold">{toCurrency(totals.water * 1000)}</div>
                  <div className="text-2sm text-gray-500">Doanh thu tiền nước</div>
                </div>
                <KeenIcon icon="drop" className="text-info text-3xl" />
              </div>
            </div>
            <div className="card">
              <div className="card-body flex items-center justify-between">
                <div>
                  <div className="text-2xl font-semibold">{toCurrency(totals.park * 1000)}</div>
                  <div className="text-2sm text-gray-500">Doanh thu gửi xe</div>
                </div>
                <KeenIcon icon="car" className="text-success text-3xl" />
              </div>
            </div>
            <div className="card">
              <div className="card-body flex items-center justify-between">
                <div>
                  <div className="text-2xl font-semibold">{toCurrency(totals.other * 1000)}</div>
                  <div className="text-2sm text-gray-500">Doanh thu khác</div>
                </div>
                <KeenIcon icon="dots-vertical" className="text-gray-500 text-3xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 items-stretch">
        <div className="card h-full">
          <div className="card-header">
            <h3 className="card-title">
              {viewMode === 'month' ? 'Biểu đồ doanh thu & chi phí (12 tháng)' : 'Xu hướng tài chính theo năm'}
            </h3>
          </div>
          <div className="card-body px-3 py-1 flex items-end">
            {viewMode === 'month' ? (
              <div className="w-full">
                <ApexChart
                  id="finance_monthly"
                  options={monthlyOptions as ApexOptions}
                  series={monthlyOptions.series}
                  type="bar"
                  height={420}
                  width={'100%'}
                />
              </div>
            ) : (
              <div className="w-full">
                <ApexChart
                  id="finance_yearly"
                  options={yearlyOptions as ApexOptions}
                  series={yearlyOptions.series}
                  type="line"
                  height={420}
                  width={'100%'}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Finance };


