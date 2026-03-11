import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/container';
import { KeenIcon } from '@/components';
import { useUser } from '@/hooks';
import { AdminRechargeStats, AdminRechargeTransaction, PaginationInfo } from '@/api/user';

const statusLabelMap: Record<string, string> = {
  pending: 'Đang chờ',
  paid: 'Thành công',
  failed: 'Thất bại',
};

const statusClassMap: Record<string, string> = {
  pending: 'text-amber-600 bg-amber-50 border-amber-200',
  paid: 'text-green-600 bg-green-50 border-green-200',
  failed: 'text-red-600 bg-red-50 border-red-200',
};

const AdminRechargePage = () => {
  const { getAdminRechargeTransactions, getAdminRechargeStats } = useUser();
  
  // State for transactions
  const [transactions, setTransactions] = useState<AdminRechargeTransaction[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    page_size: 20,
    total_count: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  });
  const [stats, setStats] = useState<AdminRechargeStats | null>(null);
  
  // State for filters
  const [filters, setFilters] = useState({
    status: '',
    from_date: '',
    to_date: '',
    search: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  // Load transactions with filters
  const loadTransactions = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      // Gọi API không cần params vì API của bạn không nhận params
      const response = await getAdminRechargeTransactions();
      
      if (response) {
        // API trả về objects là mảng transactions
        setTransactions(response);
        
        // Tạo pagination info từ dữ liệu nhận được
        setPagination({
          current_page: 1,
          page_size: response.length || 20,
          total_count: response.length,
          total_pages: Math.ceil((response.length || 0) / 20),
          has_next: false,
          has_previous: false,
        });
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAdminRechargeTransactions]);

  // Load stats
  const loadStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      // Gọi API stats
      const data = await getAdminRechargeStats();
      
      if (data) {
        // API trả về objects là mảng stats, lấy phần tử đầu tiên
        setStats(data[0] || null);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsStatsLoading(false);
    }
  }, [getAdminRechargeStats]);

  // Initial load
  useEffect(() => {
    loadTransactions();
    loadStats();
  }, [loadTransactions, loadStats]);

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters (lọc phía client vì API chưa hỗ trợ filter)
  const applyFilters = () => {
    // Vì API không hỗ trợ filter, cần load lại và lọc client-side
    loadTransactions();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      from_date: '',
      to_date: '',
      search: '',
    });
    loadTransactions();
  };

  // Handle page change (phân trang client-side)
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPagination(prev => ({ ...prev, current_page: newPage }));
    }
  };

  // Filter transactions client-side
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(tx => tx.status === filters.status);
    }

    // Filter by search (transaction_code hoặc user phone)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.transaction_code?.toLowerCase().includes(searchLower) ||
        tx.user_info?.phone?.toLowerCase().includes(searchLower) ||
        tx.user_info?.full_name?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by date range
    if (filters.from_date) {
      const fromDate = new Date(filters.from_date).getTime();
      filtered = filtered.filter(tx => {
        const txDate = new Date(tx.timeCreate).getTime();
        return txDate >= fromDate;
      });
    }

    if (filters.to_date) {
      const toDate = new Date(filters.to_date).getTime() + 86400000; // +1 day
      filtered = filtered.filter(tx => {
        const txDate = new Date(tx.timeCreate).getTime();
        return txDate <= toDate;
      });
    }

    return filtered;
  }, [transactions, filters]);

  // Paginate transactions
  const paginatedTransactions = useMemo(() => {
    const start = (pagination.current_page - 1) * pagination.page_size;
    const end = start + pagination.page_size;
    return filteredTransactions.slice(start, end);
  }, [filteredTransactions, pagination.current_page, pagination.page_size]);

  // Update pagination info when filtered transactions change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total_count: filteredTransactions.length,
      total_pages: Math.ceil(filteredTransactions.length / prev.page_size),
      current_page: 1, // Reset to first page when filters change
    }));
  }, [filteredTransactions]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount?.toLocaleString('vi-VN') + ' đ';
  };

  // Format date
  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('vi-VN');
    } catch {
      return dateString;
    }
  };

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, tx) => sum + (tx.amount_vnd || 0), 0);
  }, [filteredTransactions]);

  const totalSuccessAmount = useMemo(() => {
    return filteredTransactions
      .filter(tx => tx.status === 'paid')
      .reduce((sum, tx) => sum + (tx.amount_vnd || 0), 0);
  }, [filteredTransactions]);

  return (
    <Fragment>
      <Container width="fluid">
        <div className="space-y-6">
          {/* Header */}
          <div className="card p-6 rounded-xl border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Quản lý nạp tiền</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Xem và quản lý tất cả giao dịch nạp tiền của người dùng
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    loadTransactions();
                    loadStats();
                  }}
                  className="btn btn-sm btn-light"
                  disabled={isLoading || isStatsLoading}
                >
                  <KeenIcon icon="refresh" />
                  Làm mới
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="text-sm text-gray-600">Tổng GD</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.total?.transactions?.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatCurrency(stats.total?.amount || 0)}
                  </div>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="text-sm text-blue-700">Hôm nay</div>
                  <div className="text-2xl font-bold text-blue-800 mt-1">
                    {stats.today?.transactions || 0}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {formatCurrency(stats.today?.amount || 0)}
                  </div>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="text-sm text-emerald-700">Hôm qua</div>
                  <div className="text-2xl font-bold text-emerald-800 mt-1">
                    {stats.yesterday?.transactions || 0}
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">
                    {formatCurrency(stats.yesterday?.amount || 0)}
                  </div>
                </div>
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                  <div className="text-sm text-purple-700">Tuần này</div>
                  <div className="text-2xl font-bold text-purple-800 mt-1">
                    {stats.this_week?.transactions || 0}
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    {formatCurrency(stats.this_week?.amount || 0)}
                  </div>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="text-sm text-amber-700">Tháng này</div>
                  <div className="text-2xl font-bold text-amber-800 mt-1">
                    {stats.this_month?.transactions || 0}
                  </div>
                  <div className="text-xs text-amber-600 mt-1">
                    {formatCurrency(stats.this_month?.amount || 0)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="card p-6 rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Trạng thái
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="select select-sm w-full"
                >
                  <option value="">Tất cả</option>
                  <option value="pending">Đang chờ</option>
                  <option value="paid">Thành công</option>
                  <option value="failed">Thất bại</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={filters.from_date}
                  onChange={(e) => handleFilterChange('from_date', e.target.value)}
                  className="input input-sm w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={filters.to_date}
                  onChange={(e) => handleFilterChange('to_date', e.target.value)}
                  className="input input-sm w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Tìm kiếm
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Mã GD, SĐT..."
                    className="input input-sm w-full"
                    onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  />
                  <button
                    onClick={applyFilters}
                    className="btn btn-sm btn-primary"
                    disabled={isLoading}
                  >
                    <KeenIcon icon="filter" />
                  </button>
                  <button
                    onClick={resetFilters}
                    className="btn btn-sm btn-light"
                    disabled={isLoading}
                  >
                    <KeenIcon icon="cross" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="card p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Danh sách giao dịch
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Tổng: {filteredTransactions.length} giao dịch)
                </span>
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Tổng tiền: <span className="font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  Thành công: <span className="font-bold text-emerald-700">{formatCurrency(totalSuccessAmount)}</span>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="text-sm text-gray-500 py-12 text-center">
                Đang tải...
              </div>
            ) : paginatedTransactions.length === 0 ? (
              <div className="text-sm text-gray-500 py-12 text-center">
                Không có giao dịch nào
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="table-auto w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-200">
                        <th className="py-3 pr-4">Thời gian</th>
                        <th className="py-3 pr-4">Mã GD</th>
                        <th className="py-3 pr-4">Người dùng</th>
                        <th className="py-3 pr-4">Gói</th>
                        <th className="py-3 pr-4">Số tiền</th>
                        <th className="py-3 pr-4">Điểm</th>
                        <th className="py-3 pr-4">Trạng thái</th>
                        <th className="py-3 pr-4">Mã thanh toán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTransactions.map((item) => (
                        <tr key={item._id?.$oid || item.transaction_code} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 pr-4 text-gray-600 text-xs">
                            {formatDateTime(item.timeCreate)}
                          </td>
                          <td className="py-3 pr-4 font-medium text-gray-800">
                            {item.transaction_code}
                          </td>
                          <td className="py-3 pr-4">
                            <div className="text-gray-800">{item.user_info?.phone || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{item.user_info?.full_name || ''}</div>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="text-gray-800">{item.package_name}</div>
                          </td>
                          <td className="py-3 pr-4 font-medium">
                            {formatCurrency(item.amount_vnd)}
                          </td>
                          <td className="py-3 pr-4">
                            {item.point_value}
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${statusClassMap[item.status] || ''}`}>
                              {statusLabelMap[item.status] || item.status}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-xs text-gray-500">
                            {item.sepay_payment_id || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Trang {pagination.current_page} / {pagination.total_pages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1 || isLoading}
                        className="btn btn-sm btn-light"
                      >
                        <KeenIcon icon="arrow-left" />
                        Trước
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.total_pages || isLoading}
                        className="btn btn-sm btn-light"
                      >
                        Sau
                        <KeenIcon icon="arrow-right" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export { AdminRechargePage };