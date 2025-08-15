import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Drawer } from '@/components/drawer';
import { KeenIcon } from '@/components';
import { IRoomData } from '@/pages/dashboards/light-sidebar/blocks/rooms/RoomsData';
import { ITenantData } from '@/types/tenant';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { IMoneySlipData } from '@/types/moneySlip';

interface MoneySlipManagementDrawerProps {
  open: boolean;
  onClose: () => void;
  room: IRoomData | null;
  moneySlips: IMoneySlipData[];
  isLoading: boolean;
  onAddMoneySlip: () => void;
  // onEditMoneySlip: (moneySlip: IMoneySlipData) => void;
  // onDeleteMoneySlip: (moneySlip: IMoneySlipData) => void;
  onRefresh: () => void;
}

// const SearchInput = React.memo(({ value, onChange }: {
//   value: string;
//   onChange: (value: string) => void;
// }) => (
//   <div className="input input-sm">
//     <KeenIcon icon="magnifier" />
//     <input
//       type="text"
//       placeholder="Tìm kiếm tháng"
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//       className="grow"
//     />
//   </div>
// ));

// SearchInput.displayName = 'SearchInput';

const MoneySlipCard = React.memo(({ 
  moneySlip, 
}: {
  moneySlip: IMoneySlipData;
}) => (
  <div className="card border border-gray-200 hover:shadow-md transition-shadow">
    <div className="card-body p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="size-10 bg-primary-light rounded-full flex items-center justify-center">
              <KeenIcon icon="dollar" className="text-primary text-lg" />
            </div>
          </div>
        </div>
        
        {/* Action Buttons - Direct access */}
        <div className="flex items-center gap-1">
          <button 
             onClick={() => {
              window.open(
                `${import.meta.env.VITE_APP_SERVER_URL}${moneySlip.moneySlip_path}`,
                "_blank"
              );
            }}
            className="btn btn-sm btn-icon btn-light transition-colors"
            title="Xem phiếu thu"
            aria-label={`Xem phiếu thu`}
          >
            <KeenIcon icon="eye" className="text-sm" />
          </button>
          <button 
            // onClick={() => onDelete(tenant)}
            className="btn btn-sm btn-icon btn-danger hover:bg-danger-dark transition-colors"
            title="Xóa người thuê"
            // aria-label={`Xóa người thuê ${tenant.name}`}
          >
            <KeenIcon icon="trash" className="text-sm" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Phòng:</span>
          <span className="font-medium">{moneySlip.room_name || ''}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Người thuê:</span>
          <span className="font-medium">{moneySlip.user_nameB || ''}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Tổng tiền:</span>
          <span className="font-medium">{moneySlip.totalPrice || ''}</span>
        </div>
        {moneySlip.timeUpdate && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Cập nhật:</span>
            <span className="font-medium">
              {format(new Date(moneySlip.timeUpdate.$date), 'dd/MM/yyyy', { locale: vi })}
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
));

MoneySlipCard.displayName = 'MoneySlipCard';

export const MoneySlipManagementDrawer: React.FC<MoneySlipManagementDrawerProps> = ({
  open,
  onClose,
  room,
  moneySlips,
  isLoading,
  onAddMoneySlip,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Optimized search handler
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Filter tenants based on search term
  const filteredMoneySlips = useMemo(() => {
    if (!searchTerm.trim()) return moneySlips;
    
    const searchLower = searchTerm.toLowerCase();
    return moneySlips.filter(moneySlip => 
      moneySlip.user_nameB.includes(searchTerm)
    );
  }, [moneySlips, searchTerm]);

  // Reset search when drawer closes
  useEffect(() => {
    if (!open && searchTerm) {
      setSearchTerm('');
    }
  }, [open, searchTerm]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      disableEnforceFocus={true} // Fix focus conflict với modal
      disableAutoFocus={true}    // Prevent auto focus when modal opens
      disableRestoreFocus={true} // Prevent focus restore issues
      PaperProps={{
        sx: { 
          width: { xs: '100%', sm: 480, md: 600, lg: 800 },
          zIndex: 1300 // Đảm bảo drawer có z-index thấp hơn modal (1400)
        }
      }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <KeenIcon icon="profile-circle" className="text-xl" />
            <div>
              <h2 className="text-lg font-semibold">Danh sách phiếu thu</h2>
              <p className="text-sm text-gray-600">
                {room?.room_name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-sm btn-icon btn-light"
          >
            <KeenIcon icon="cross" />
          </button>
        </div>

        {/* Search and Actions */}
        <div className="p-5 border-b border-gray-200 space-y-4">
          {/* <SearchInput value={searchTerm} onChange={handleSearchChange} /> */}
          
          <div className="flex gap-2">
            <button 
              onClick={onAddMoneySlip}
              className="btn btn-sm btn-primary flex items-center gap-2 hover:bg-primary-dark transition-colors"
            >
              <KeenIcon icon="plus" />
              Thêm phiếu thu
            </button>
            <button 
              onClick={onRefresh}
              disabled={isLoading}
              className="btn btn-sm btn-light flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              <KeenIcon icon="refresh" className={isLoading ? 'animate-spin' : ''} />
              {isLoading ? 'Đang tải...' : 'Làm mới'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải danh sách người thuê...</p>
              </div>
            </div>
          ) : filteredMoneySlips.length === 0 ? (
            <div className="text-center py-12">
              <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeenIcon icon="profile-circle" className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có phiếu thu'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Thử tìm kiếm với từ khóa khác' 
                  : 'Phòng này chưa có phiếu thu nào nào.'
                }
              </p>
              {!searchTerm && (
                <button 
                  onClick={onAddMoneySlip}
                  className="btn btn-primary"
                >
                  Thêm phiếu thu đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Tìm thấy {filteredMoneySlips.length} phiếu thu
                </p>
              </div>
              
              <div className="space-y-3">
                {filteredMoneySlips.map((moneySlip) => (
                  <MoneySlipCard
                    key={moneySlip._id?.$oid || moneySlip.pk}
                    moneySlip={moneySlip}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};

MoneySlipManagementDrawer.displayName = 'MoneySlipManagementDrawer'; 