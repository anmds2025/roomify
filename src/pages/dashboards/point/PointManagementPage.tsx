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

// Thứ tự ưu tiên của gói (thấp -> cao)
const PACKAGE_ORDER: Record<string, number> = {
  free: 0,
  basic: 1,
  standard: 2,
  premium: 3,
  enterprise: 4,
};

const PointManagementPage = () => {
  const { currentUser } = useAuthContext();
  const { getRechargePackages, createRecharge, getRechargeTransactions, getCurrentUser, isLoading, getRoomPackagesInfo, buyRoomPackage, payRoomFee } = useUser();

  const [packages, setPackages] = useState<Array<{ code: string; name: string; amount_vnd: number; point_value: number; bonus?: string }>>([]);
  const [roomPackagesMap, setRoomPackagesMap] = useState<Record<string, any>>({});
  const [transactions, setTransactions] = useState<Array<{ _id: { $oid: string }; package_name: string; amount_vnd: number; point_value: number; status: string; transaction_code: string; checkout_url?: string }>>([]);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const hasLoadedRef = useRef(false);

  const loadData = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const [pkgData, txData, roomPkgs] = await Promise.all([
        getRechargePackages(),
        getRechargeTransactions(),
        getRoomPackagesInfo()
      ]);
      setPackages(pkgData || []);
      setTransactions(txData || []);
      setRoomPackagesMap(roomPkgs || {});
    } finally {
      setIsPageLoading(false);
    }
  }, [getRechargePackages, getRechargeTransactions, getRoomPackagesInfo]);

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
          'payment_method',
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

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-6">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="text-sm text-blue-700">Số điểm hiện tại</div>
                <div className="text-3xl font-bold text-blue-800 mt-1">{pointBalance} điểm</div>
                <div className="text-xs text-blue-600 mt-1">Tỷ lệ quy đổi cơ bản: 1.000đ = 1 điểm</div>
              </div>
              {/* <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-sm text-emerald-700">Tổng tiền đã nạp</div>
                <div className="text-3xl font-bold text-emerald-800 mt-1">{totalRecharged.toLocaleString('vi-VN')} đ</div>
                <div className="text-xs text-emerald-600 mt-1">Bạn có thể nạp theo các gói khuyến nghị bên dưới</div>
              </div> */}
            </div>
          </div>

          {/* ===== SECTION: Khôi phục tài khoản (chỉ hiện khi bị khóa) ===== */}
          {currentUser?.is_blocked && (() => {
            const currentPkgCode = currentUser?.room_package || 'free';
            const currentPkg = roomPackagesMap[currentPkgCode];
            const currentPkgPrice: number = currentPkg?.price ?? 0;
            const pointBalance = currentUser?.point_balance || 0;

            // So sánh theo price: gói có giá >= gói hiện tại (gia hạn hoặc nâng cấp)
            // Fallback: nếu tất cả price đều bằng nhau thì dùng pkg.order nếu có
            const eligiblePackages = Object.entries(roomPackagesMap)
              .filter(([, pkg]: [string, any]) => (pkg.price ?? 0) >= currentPkgPrice)
              .sort(([, a]: [string, any], [, b]: [string, any]) => (a.price ?? 0) - (b.price ?? 0));

            return (
              <div className="card p-6 rounded-xl border-2 border-red-400 bg-red-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-700">Khôi phục tài khoản</h3>
                    <p className="text-sm text-red-600">Gia hạn hoặc nâng cấp gói để mở khóa tài khoản ngay</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {eligiblePackages.map(([code, pkg]: [string, any]) => {
                    const isCurrentPkg = code === currentPkgCode;
                    const canAfford = pointBalance >= (pkg.price || 0);
                    return (
                      <div
                        key={code}
                        className={`rounded-xl border-2 p-4 bg-white transition-all ${
                          isCurrentPkg
                            ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
                            : 'border-gray-200 hover:shadow-sm'
                        }`}
                      >
                        {isCurrentPkg && (
                          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block mb-2 font-medium">
                            Gói hiện tại
                          </div>
                        )}
                        {!isCurrentPkg && (pkg.price ?? 0) > currentPkgPrice && (
                          <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded inline-block mb-2 font-medium">
                            ⬆ Nâng cấp
                          </div>
                        )}
                        <div className="text-base font-semibold text-gray-900">{pkg.name}</div>
                        <div className="text-sm text-gray-500 mt-1">Tối đa {pkg.max} phòng</div>
                        <div className={pkg.price > 0 ? 'text-2xl font-bold text-primary mt-2' : 'text-xl font-bold text-gray-500 mt-2'}>
                          {pkg.price > 0 ? `${pkg.price} điểm` : 'Miễn phí'}
                        </div>
                        {!canAfford && pkg.price > 0 && (
                          <div className="text-xs text-red-500 mt-1">Cần thêm {pkg.price - pointBalance} điểm</div>
                        )}
                        <button
                          type="button"
                          onClick={async () => {
                            const label = isCurrentPkg ? 'gia hạn' : `nâng cấp lên ${pkg.name}`;
                            if (window.confirm(`Bạn có chắc muốn ${label} (giá ${pkg.price} điểm)?`)) {
                              if (isCurrentPkg) {
                                await payRoomFee();
                              } else {
                                await buyRoomPackage(code);
                              }
                              await loadData();
                            }
                          }}
                          className={`btn btn-sm w-full mt-4 ${
                            !canAfford && pkg.price > 0
                              ? 'btn-light opacity-50 cursor-not-allowed'
                              : isCurrentPkg
                              ? 'btn-primary'
                              : 'btn-primary'
                          }`}
                          disabled={isLoading || isPageLoading || (!canAfford && pkg.price > 0)}
                        >
                          {isCurrentPkg ? '🔄 Gia hạn gói này' : '⬆ Nâng cấp'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Các gói duy trì phòng</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {Object.entries(roomPackagesMap)
                .sort(([, a]: [string, any], [, b]: [string, any]) => (a.price ?? 0) - (b.price ?? 0))
                .map(([code, pkg]: [string, any]) => {
                  const currentPkgCode = currentUser?.room_package || 'free';
                  const currentPkgPrice = roomPackagesMap[currentPkgCode]?.price ?? 0;
                  const isCurrentPkg = currentPkgCode === code;
                  const isDowngrade = (pkg.price ?? 0) < currentPkgPrice;

                  return (
                    <div key={code} className={`rounded-lg border p-4 bg-white hover:shadow-sm transition-all ${
                      isCurrentPkg ? 'border-blue-500 shadow-md ring-2 ring-blue-200' :
                      isDowngrade ? 'border-gray-100 bg-gray-50 opacity-60' :
                      'border-gray-200'
                    }`}>
                      {isCurrentPkg && (
                        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block mb-2 font-medium">Gói hiện tại</div>
                      )}
                      {isDowngrade && !isCurrentPkg && (
                        <div className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded inline-block mb-2 font-medium">Không thể hạ cấp</div>
                      )}
                      <div className="text-base font-semibold text-gray-900">{pkg.name}</div>
                      <div className="text-sm text-gray-500 mt-1">Tối đa {pkg.max} phòng</div>
                      <div className={pkg.price > 0 ? 'text-2xl font-bold text-primary mt-3' : 'text-xl font-bold text-gray-500 mt-3'}>
                        {pkg.price > 0 ? `${pkg.price} điểm` : 'Miễn phí'}
                      </div>
                      {pkg.price > 0 && <div className="text-xs text-gray-500 mt-2">Tính phí hàng tháng</div>}
                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm(`Bạn có chắc muốn chuyển đổi sang ${pkg.name} (giá ${pkg.price} điểm)?`)) {
                            await buyRoomPackage(code);
                            await loadData();
                          }
                        }}
                        className={`btn btn-sm w-full mt-4 ${isCurrentPkg || isDowngrade ? 'btn-light' : 'btn-primary'}`}
                        disabled={isLoading || isPageLoading || isCurrentPkg || isDowngrade}
                      >
                        {isCurrentPkg ? 'Đang dùng' : isDowngrade ? 'Không khả dụng' : 'Mua gói này'}
                      </button>
                    </div>
                  );
                })}
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





