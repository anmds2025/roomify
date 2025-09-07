import { useMemo, useState, useEffect } from 'react';
import ApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { KeenIcon } from '@/components';
import { useMoney } from '@/hooks/useMoney';
import { useHome } from '@/hooks/useHome';
import { MoneyData, TYPE_MONEY } from '@/types/money';
import { IHomeData } from '@/pages/dashboards/light-sidebar/blocks/homes/HomesData';
import { IExpenseData } from '@/api/expense';
import { useExpense } from '@/hooks/useExpense';

type ViewMode = 'month' | 'year';

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const toCurrency = (n: number) => `${n.toLocaleString('vi-VN')} VND`;

const Finance = () => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [moneyData, setMoneyData] = useState<MoneyData[]>([]);
  const [expenseData, setExpenseData] = useState<IExpenseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [homes, setHomes] = useState<IHomeData[]>([]);
  const [homesLoading, setHomesLoading] = useState(false);

  const { getMoneyListData } = useMoney();
  const { getFilterExpenses } = useExpense();
  const { getHomes } = useHome();
  

  // Get current month in format "M/YYYY" to match API format
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getMonth() + 1}/${now.getFullYear()}`;
  };

  // Fetch homes data
  const fetchHomes = async () => {
    try {
      setHomesLoading(true);
      const homesData = await getHomes();
      setHomes(homesData);
      // Set "Tất cả tòa nhà" as default (empty string)
      if (!selectedBuildingId) {
        setSelectedBuildingId('');
      }
    } catch (error) {
      console.error('Error fetching homes:', error);
      setHomes([]);
    } finally {
      setHomesLoading(false);
    }
  };

  // Fetch money data from API
  const fetchMoneyData = async () => {
    try {
      setLoading(true);
      const payload = {
        home_pk: selectedBuildingId || undefined,
        month: selectedMonth || getCurrentMonth(),
        type: 'All'
      };

      const response = await getMoneyListData(payload);
      setMoneyData(response.objects || []);
    } catch (error) {
      console.error('Error fetching money data:', error);
      // Fallback to mock data if API fails
      setMoneyData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseData = async () => {
    try {
      setLoading(true);
      const payload = {
        home_pk: selectedBuildingId || 'all',
        month: selectedMonth || getCurrentMonth(),
      };

      const response = await getFilterExpenses(payload);
      setExpenseData(response.objects || []);
    } catch (error) {
      console.error('Error fetching expense data:', error);
      // Fallback to mock data if API fails
      setExpenseData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch homes when component mounts
  useEffect(() => {
    fetchHomes();
  }, []);

  // Fetch money data when dependencies change
  useEffect(() => {
    fetchMoneyData();
    fetchExpenseData()
  }, [selectedBuildingId, selectedMonth]);

  // Process API data to generate chart data
  const processMoneyData = (data: MoneyData[]) => {
    // Calculate totals by type (not by month)
    let totalRoom = 0;
    let totalElectricity = 0;
    let totalWater = 0;
    let totalParking = 0;
    let totalOther = 0;
    let totalRevenue = 0;

    // Group data by month
    const monthlyDataMap = new Map<string, {
      revenue: number;
      expense: number;
      revenueRoom: number;
      revenueElectricity: number;
      revenueWater: number;
      revenueParking: number;
      revenueOther: number;
    }>();

    data.forEach(item => {
      const amount = item.total || 0;
      totalRevenue += amount;
      
      // Parse month format "M/YYYY" to get month index (0-11)
      const monthParts = item.month.split('/');
      if (monthParts.length === 2) {
        const monthIndex = parseInt(monthParts[0]) - 1; // Convert to 0-based index
        if (monthIndex >= 0 && monthIndex < 12) {
          const monthKey = monthIndex.toString();
          
          if (!monthlyDataMap.has(monthKey)) {
            monthlyDataMap.set(monthKey, {
              revenue: 0,
              expense: 0,
              revenueRoom: 0,
              revenueElectricity: 0,
              revenueWater: 0,
              revenueParking: 0,
              revenueOther: 0
            });
          }
          
          const monthData = monthlyDataMap.get(monthKey)!;
          
          // Categorize by type
          switch (item.type) {
            case TYPE_MONEY.ROOM:
              monthData.revenueRoom += amount;
              monthData.revenue += amount;
              totalRoom += amount;
              break;
            case TYPE_MONEY.ELECTRICITY:
              monthData.revenueElectricity += amount;
              monthData.revenue += amount;
              totalElectricity += amount;
              break;
            case TYPE_MONEY.WATER:
              monthData.revenueWater += amount;
              monthData.revenue += amount;
              totalWater += amount;
              break;
            case TYPE_MONEY.PARKING:
              monthData.revenueParking += amount;
              monthData.revenue += amount;
              totalParking += amount;
              break;
            case TYPE_MONEY.OTHER:
              monthData.revenueOther += amount;
              monthData.revenue += amount;
              totalOther += amount;
              break;
          }
        }
      }
    });

    // Create arrays for 12 months, only showing data for months that have data
    const revenue = Array(12).fill(0);
    const expense = Array(12).fill(0);
    const revenueRoom = Array(12).fill(0);
    const revenueElectricity = Array(12).fill(0);
    const revenueWater = Array(12).fill(0);
    const revenueParking = Array(12).fill(0);
    const revenueOther = Array(12).fill(0);

    // Fill in actual data for months that have data
    monthlyDataMap.forEach((monthData, monthKey) => {
      const monthIndex = parseInt(monthKey);
      revenue[monthIndex] = monthData.revenue;
      expense[monthIndex] = monthData.expense;
      revenueRoom[monthIndex] = monthData.revenueRoom;
      revenueElectricity[monthIndex] = monthData.revenueElectricity;
      revenueWater[monthIndex] = monthData.revenueWater;
      revenueParking[monthIndex] = monthData.revenueParking;
      revenueOther[monthIndex] = monthData.revenueOther;
    });

    return {
      revenue,
      expense,
      revenueRoom,
      revenueElectricity,
      revenueWater,
      revenueParking,
      revenueOther,
      // Add totals for direct use
      totals: {
        totalRevenue,
        totalRoom,
        totalElectricity,
        totalWater,
        totalParking,
        totalOther
      }
    };
  };

  const data = useMemo(() => {
    if (moneyData.length > 0) {
      return processMoneyData(moneyData);
    }
    // Return zero data when no API data
    return {
      revenue: Array(12).fill(0),
      expense: Array(12).fill(0),
      revenueRoom: Array(12).fill(0),
      revenueElectricity: Array(12).fill(0),
      revenueWater: Array(12).fill(0),
      revenueParking: Array(12).fill(0),
      revenueOther: Array(12).fill(0)
    };
  }, [moneyData, selectedBuildingId, homes]);

  const totals = useMemo(() => {
    const totalExpense = expenseData.reduce((sum, exp) => sum + (exp.total || 0), 0);
    if (moneyData.length > 0 && 'totals' in data) {
      // Use direct totals from API data
      const apiTotals = (data as any).totals;
      const totalRevenue = apiTotals.totalRevenue;
      const profit = totalRevenue - totalExpense;
      
      return {
        totalRevenue,
        totalExpense,
        profit,
        cashFlow: profit,
        room: apiTotals.totalRoom,
        elec: apiTotals.totalElectricity,
        water: apiTotals.totalWater,
        park: apiTotals.totalParking,
        other: apiTotals.totalOther
      };
    }
    
    // Fallback to calculated totals
    const totalRevenue = data.revenue.reduce((a, b) => a + b, 0);
    const profit = totalRevenue - totalExpense;
    const room = data.revenueRoom.reduce((a, b) => a + b, 0);
    const elec = data.revenueElectricity.reduce((a, b) => a + b, 0);
    const water = data.revenueWater.reduce((a, b) => a + b, 0);
    const park = data.revenueParking.reduce((a, b) => a + b, 0);
    const other = data.revenueOther.reduce((a, b) => a + b, 0);
    
    return { totalRevenue, totalExpense, profit, cashFlow: profit, room, elec, water, park, other };
  }, [data, moneyData, expenseData]);

  const monthlyOptions: ApexOptions = useMemo(() => {
    // Filter out months with no data for better chart display
    const expenseByMonth = months.map((_, monthIndex) =>
      expenseData.reduce((sum, exp) => {
        if (exp.month) {
          const [m, y] = exp.month.split('/').map(Number);
          if (m - 1 === monthIndex) {
            return sum + Number(exp.total || 0);
          }
        }
        return sum;
      }, 0)
    );

    const monthsWithData = months.filter(
      (_, index) => data.revenue[index] > 0 || expenseByMonth[index] > 0
    );
    const revenueWithData = data.revenue.filter((value, index) => data.revenue[index] > 0 || data.expense[index] > 0);
    const expenseWithData = expenseByMonth.filter(
      (_, index) => data.revenue[index] > 0 || expenseByMonth[index] > 0
    );

    return {
      series: [
        { name: 'Doanh thu', data: revenueWithData },
        { name: 'Chi phí', data: expenseWithData }
      ],
      chart: { type: 'bar', height: 420, width: '100%', toolbar: { show: false } },
      plotOptions: {
        bar: { columnWidth: '45%', borderRadius: 6 }
      },
      dataLabels: { enabled: false },
      legend: { position: 'top' },
      colors: ['var(--tw-primary)', 'var(--tw-danger)'],
      xaxis: {
        categories: monthsWithData,
        axisTicks: { show: false },
        axisBorder: { show: false },
        labels: { style: { colors: 'var(--tw-gray-500)', fontSize: '12px' } }
      },
      yaxis: {
        labels: {
          style: { colors: 'var(--tw-gray-500)', fontSize: '12px' },
          formatter: (v: number) => `${(v / 1000000).toFixed(1)}M`
        }
      },
      tooltip: { enabled: true, y: { formatter: (v: number) => `${v.toLocaleString('vi-VN')} VND` } }
    };
  }, [data, expenseData, viewMode]);

  const yearlyOptions: ApexOptions = useMemo(() => {
    // Filter out months with no data for better chart display
    const expenseByMonth = months.map((_, monthIndex) =>
      expenseData.reduce((sum, exp) => {
        if (exp.month) {
          const [m, y] = exp.month.split('/').map(Number);
          if (m - 1 === monthIndex) {
            return sum + (Number(exp.total) || 0);
          }
        }
        return sum;
      }, 0)
    );

    const monthsWithData = months.filter(
      (_, index) => data.revenue[index] > 0 || expenseByMonth[index] > 0
    );
    const revenueWithData = data.revenue.filter((value, index) => data.revenue[index] > 0 || data.expense[index] > 0);
    const expenseWithData = expenseByMonth.filter(
      (_, index) => data.revenue[index] > 0 || expenseByMonth[index] > 0
    );
    const profitWithData = data.revenue
      .map((v, i) => v - expenseByMonth[i])
      .filter((_, index) => data.revenue[index] > 0 || expenseByMonth[index] > 0);

    return {
      series: [
        { name: 'Doanh thu', data: revenueWithData },
        { name: 'Chi phí', data: expenseWithData },
        { name: 'Lợi nhuận', data: profitWithData }
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
        categories: monthsWithData,
        axisTicks: { show: false },
        axisBorder: { show: false },
        labels: { style: { colors: 'var(--tw-gray-500)', fontSize: '12px' } }
      },
      yaxis: {
        labels: {
          style: { colors: 'var(--tw-gray-500)', fontSize: '12px' },
          formatter: (v: number) => `${(v / 1000000).toFixed(1)}M`
        }
      },
      tooltip: { enabled: true, y: { formatter: (v: number) => `${v.toLocaleString('vi-VN')} VND` } }
    };
  }, [data, expenseData, viewMode]);

  // Generate month options for the last 12 months
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getMonth() + 1}/${date.getFullYear()}`; // Match API format
      const label = `${date.getMonth() + 1}/${date.getFullYear()}`;
      options.push({ value, label });
    }
    return options;
  };

  return (
    <div className="grid gap-5 lg:gap-7.5">
      <div className="card">
        <div className="card-header flex-wrap gap-3">
          <h3 className="card-title">Quản lý tài chính</h3>
          <div className="flex items-center gap-3 ml-auto">
            <select
              className="select select-sm w-40"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="All">Tất cả tháng</option>
              {generateMonthOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              className="select select-sm w-56"
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
              disabled={homesLoading}
            >
              {homesLoading ? (
                <option>Đang tải tòa nhà...</option>
              ) : homes.length === 0 ? (
                <option>Không có tòa nhà nào</option>
              ) : (
                <>
                  <option value="">Tất cả tòa nhà</option>
                  {homes.map((home) => (
                    <option key={home.pk || home._id?.$oid} value={home.pk || home._id?.$oid}>
                      {home.home_name}
                    </option>
                  ))}
                </>
              )}
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
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
            </div>
          )}
          
          {!loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="card">
                <div className="card-body flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-semibold">{toCurrency(totals.profit)}</div>
                    <div className="text-2sm text-gray-500">Lợi nhuận</div>
                  </div>
                  <KeenIcon icon="chart-line-up" className="text-success text-3xl" />
                </div>
              </div>
              <div className="card">
                <div className="card-body flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-semibold">{toCurrency(totals.totalRevenue)}</div>
                    <div className="text-2sm text-gray-500">Tổng doanh thu</div>
                  </div>
                  <KeenIcon icon="chart-column" className="text-primary text-3xl" />
                </div>
              </div>
              <div className="card">
                <div className="card-body flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-semibold">{toCurrency(totals.totalExpense)}</div>
                    <div className="text-2sm text-gray-500">Tổng chi phí</div>
                  </div>
                  <KeenIcon icon="money-down" className="text-danger text-3xl" />
                </div>
              </div>
              <div className="card">
                <div className="card-body flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-semibold">{toCurrency(totals.room)}</div>
                    <div className="text-2sm text-gray-500">Doanh thu từ phòng</div>
                  </div>
                  <KeenIcon icon="home-2" className="text-primary text-3xl" />
                </div>
              </div>
              <div className="card">
                <div className="card-body flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-semibold">{toCurrency(totals.elec)}</div>
                    <div className="text-2sm text-gray-500">Doanh thu tiền điện</div>
                  </div>
                  <KeenIcon icon="flash" className="text-warning text-3xl" />
                </div>
              </div>
              <div className="card">
                <div className="card-body flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-semibold">{toCurrency(totals.water)}</div>
                    <div className="text-2sm text-gray-500">Doanh thu tiền nước</div>
                  </div>
                  <KeenIcon icon="drop" className="text-info text-3xl" />
                </div>
              </div>
              <div className="card">
                <div className="card-body flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-semibold">{toCurrency(totals.park)}</div>
                    <div className="text-2sm text-gray-500">Doanh thu gửi xe</div>
                  </div>
                  <KeenIcon icon="car" className="text-success text-3xl" />
                </div>
              </div>
              <div className="card">
                <div className="card-body flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-semibold">{toCurrency(totals.other)}</div>
                    <div className="text-2sm text-gray-500">Doanh thu khác</div>
                  </div>
                  <KeenIcon icon="dots-vertical" className="text-gray-500 text-3xl" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-5 items-stretch">
        <div className="card h-full">
          <div className="card-header">
            <h3 className="card-title">
              {viewMode === 'month' ? 'Biểu đồ doanh thu & chi phí theo tháng' : 'Xu hướng tài chính theo năm'}
            </h3>
          </div>
          <div className="card-body px-3 py-1 flex items-end">
            {loading ? (
              <div className="w-full flex justify-center items-center h-80">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : viewMode === 'month' ? (
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


