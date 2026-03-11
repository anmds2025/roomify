import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Container } from '@/components/container';
import { useUser } from '@/hooks/useUser';
import { useAuthContext } from '@/auth';
import { KeenIcon } from '@/components';

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

const PointManagementPage = () => {
  const { currentUser } = useAuthContext();
  const { getRechargePackages, createRecharge, getRechargeTransactions, getCurrentUser, isLoading } = useUser();

  const [packages, setPackages] = useState<Array<{ code: string; name: string; amount_vnd: number; point_value: number; bonus?: string }>>([]);
  const [transactions, setTransactions] = useState<Array<{ _id: { $oid: string }; package_name: string; amount_vnd: number; point_value: number; status: string; transaction_code: string; checkout_url?: string }>>([]);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const hasLoadedRef = useRef(false);

  const loadData = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const [pkgData, txData] = await Promise.all([
        getRechargePackages(),
        getRechargeTransactions()
      ]);
      setPackages(pkgData || []);
      setTransactions(txData || []);
    } finally {
      setIsPageLoading(false);
    }
  }, [getRechargePackages, getRechargeTransactions]);

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;
    loadData();
    getCurrentUser();
  }, [getCurrentUser, loadData]);

  const handleRecharge = useCallback(
    async (packageCode: string) => {
      const response = await createRecharge(packageCode);
      if (response?.checkout_url && response?.form_payload) {
        const form = document.createElement('form');
        form.action = response.checkout_url;
        form.method = 'POST';
        
        // Phân biệt thiết bị
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        form.target = '_self';
        // Thêm các field
        const orderedFields = [
          'merchant',
          'currency',
          'order_amount',
          'operation',
          'order_description',
          'order_invoice_number',
          'customer_id',
          'success_url',
          'error_url',
          'cancel_url',
          'signature',
        ];

        orderedFields.forEach((field) => {
          if (!(field in response.form_payload!)) {
            return;
          }
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = field;
          input.value = String(response.form_payload?.[field] ?? '');
          form.appendChild(input);
        });

        // Submit form ngay lập tức, không dùng setTimeout
        document.body.appendChild(form);
        form.submit();
        
        // Xóa form sau khi submit (dùng setTimeout ngắn để đảm bảo form đã được xử lý)
        setTimeout(() => {
          document.body.removeChild(form);
        }, 0);
      }
      await loadData();
    },
    [createRecharge, loadData]
  );

  const pointBalance = useMemo(() => currentUser?.point_balance || 0, [currentUser?.point_balance]);
  const totalRecharged = useMemo(() => currentUser?.total_recharged_vnd || 0, [currentUser?.total_recharged_vnd]);

  return (
    <Fragment>
      <Container width="fluid">
        <div className="space-y-6">
          <div className="card p-6 rounded-xl border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Quản lý điểm</h2>
                <p className="text-sm text-gray-500 mt-1">Nạp điểm qua SePay và theo dõi lịch sử giao dịch.</p>
              </div>
              <button
                type="button"
                onClick={loadData}
                className="btn btn-sm btn-light"
                disabled={isPageLoading}
              >
                <KeenIcon icon="refresh" />
                Làm mới
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="text-sm text-blue-700">Số điểm hiện tại</div>
                <div className="text-3xl font-bold text-blue-800 mt-1">{pointBalance} điểm</div>
                <div className="text-xs text-blue-600 mt-1">Tỷ lệ quy đổi cơ bản: 1.000đ = 1 điểm</div>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-sm text-emerald-700">Tổng tiền đã nạp</div>
                <div className="text-3xl font-bold text-emerald-800 mt-1">{totalRecharged.toLocaleString('vi-VN')} đ</div>
                <div className="text-xs text-emerald-600 mt-1">Bạn có thể nạp theo các gói khuyến nghị bên dưới</div>
              </div>
            </div>
          </div>

          <div className="card p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn gói nạp điểm</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {packages.map((pkg) => (
                <div key={pkg.code} className="rounded-lg border border-gray-200 p-4 bg-white hover:shadow-sm transition-all">
                  <div className="text-base font-semibold text-gray-900">{pkg.name}</div>
                  <div className="text-sm text-gray-500 mt-1">{pkg.amount_vnd.toLocaleString('vi-VN')} đ</div>
                  <div className="text-2xl font-bold text-primary mt-3">{pkg.point_value} điểm</div>
                  {pkg.bonus && <div className="text-xs text-gray-500 mt-2">{pkg.bonus}</div>}
                  <button
                    type="button"
                    onClick={() => handleRecharge(pkg.code)}
                    className="btn btn-sm btn-primary w-full mt-4"
                    disabled={isLoading || isPageLoading}
                  >
                    Nạp ngay
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử giao dịch</h3>

            {transactions.length === 0 ? (
              <div className="text-sm text-gray-500 py-8 text-center">Chưa có giao dịch nạp điểm nào.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-auto w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="py-3 pr-4">Mã giao dịch</th>
                      <th className="py-3 pr-4">Gói nạp</th>
                      <th className="py-3 pr-4">Số tiền</th>
                      <th className="py-3 pr-4">Điểm</th>
                      <th className="py-3 pr-4">Trạng thái</th>
                      <th className="py-3 pr-0">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((item) => (
                      <tr key={item._id.$oid} className="border-b border-gray-100">
                        <td className="py-3 pr-4 font-medium text-gray-800">{item.transaction_code}</td>
                        <td className="py-3 pr-4">{item.package_name}</td>
                        <td className="py-3 pr-4">{item.amount_vnd.toLocaleString('vi-VN')} đ</td>
                        <td className="py-3 pr-4">{item.point_value}</td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${statusClassMap[item.status] || statusClassMap.pending}`}>
                            {statusLabelMap[item.status] || item.status}
                          </span>
                        </td>
                        <td className="py-3 pr-0">
                          {item.status === 'pending' && item.checkout_url ? (
                            <button
                              type="button"
                              onClick={() => window.open(item.checkout_url, '_blank', 'noopener,noreferrer')}
                              className="btn btn-xs btn-light"
                            >
                              Thanh toán
                            </button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export { PointManagementPage };





