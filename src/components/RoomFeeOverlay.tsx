import React from 'react';
import { useAuthContext } from '@/auth';
import { useUser } from '@/hooks/useUser';
import { useNavigate, useLocation } from 'react-router-dom';

export const RoomFeeOverlay = () => {
  const { currentUser } = useAuthContext();
  const { payRoomFee, isLoading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentUser) return null;

  const {
    is_blocked,
    days_overdue,
    amount_needed,
    active_room_count,
    point_balance = 0,
  } = currentUser;

  const handlePay = async () => {
    await payRoomFee();
  };

  const handleRecharge = () => {
    navigate('/point-management');
  };

  // ✅ BLOCKED -> full-screen overlay, chặn toàn bộ ứng dụng
  // Ngoại lệ: trang /point-management được phép dùng tự do để nạp điểm và gia hạn
  if (is_blocked && location.pathname !== '/point-management') {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center border border-red-200 w-[400px] max-w-[90vw] animate-[fadeInDown_0.3s_ease]">

          {/* Icon cảnh báo */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-red-600 mb-3">
            Tài khoản bị tạm khóa!
          </h2>

          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            Bạn đã trễ hạn thanh toán phí duy trì gói phòng quá <strong>3 ngày</strong>.
            <br />
            Gói hiện tại: <strong>{currentUser.room_package_name || 'Miễn phí'}</strong> ({active_room_count} phòng)
          </p>

          <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-5">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-gray-600">Phí cần thanh toán:</span>
              <strong className="text-red-600 text-base">{amount_needed} điểm</strong>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Số điểm hiện tại:</span>
              <strong className={point_balance < (amount_needed || 0) ? 'text-red-500' : 'text-green-600'}>
                {point_balance} điểm
              </strong>
            </div>
            {point_balance < (amount_needed || 0) && (
              <p className="text-red-500 text-xs mt-2 text-center">
                ⚠️ Không đủ điểm, vui lòng nạp thêm để tiếp tục sử dụng
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {point_balance >= (amount_needed || 0) ? (
              <button
                onClick={handlePay}
                className="bg-blue-600 px-6 py-3 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 shadow-md"
                disabled={isLoading}
              >
                {isLoading ? '⏳ Đang xử lý...' : '✅ Thanh toán ngay'}
              </button>
            ) : (
              <button
                onClick={handleRecharge}
                className="bg-green-600 px-6 py-3 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-md"
              >
                💳 Đi tới trang nạp điểm
              </button>
            )}
            <p className="text-xs text-gray-400">
              Mọi chức năng sẽ được khôi phục ngay sau khi thanh toán thành công.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ NOT BLOCKED -> chỉ hiện banner cảnh báo nếu đang trễ hạn
  if (!days_overdue || days_overdue <= 0) return null;

  return (
    <div className="bg-yellow-100 border-b border-yellow-300 text-yellow-800 px-4 py-3 fixed top-6 left-1/2 -translate-x-1/2 z-[9000] flex items-center justify-between shadow-sm rounded-lg">
      <div>
        <span className="font-bold mr-2">⚠️ Cảnh báo:</span>
        Bạn đang trễ hạn thanh toán phí duy trì phòng{' '}
        <strong>{days_overdue} ngày</strong>.
      </div>
    </div>
  );
};
