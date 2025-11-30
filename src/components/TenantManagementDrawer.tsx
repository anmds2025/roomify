import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Drawer } from '@/components/drawer';
import { KeenIcon } from '@/components';
import { IRoomData } from '@/pages/dashboards/light-sidebar/blocks/rooms/RoomsData';
import { ITenantData } from '@/types/tenant';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface TenantManagementDrawerProps {
  open: boolean;
  onClose: () => void;
  room: IRoomData | null;
  tenants: ITenantData[];
  isLoading: boolean;
  onAddTenant: () => void;
  onEditTenant: (tenant: ITenantData) => void;
  onDeleteTenant: (tenant: ITenantData) => void;
  onRefresh: () => void;
}

const SearchInput = React.memo(({ value, onChange }: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="input input-sm w-full">
    <KeenIcon icon="magnifier" />
    <input
      type="text"
      placeholder="Tìm kiếm theo tên, SĐT..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="grow"
    />
  </div>
));

SearchInput.displayName = 'SearchInput';

const TenantCard = React.memo(({ 
  tenant, 
  onEdit, 
  onDelete 
}: {
  tenant: ITenantData;
  onEdit: (tenant: ITenantData) => void;
  onDelete: (tenant: ITenantData) => void;
}) => (
  <div className="card border border-gray-200 hover:shadow-md transition-shadow">
    <div className="card-body p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="size-10 bg-primary-light rounded-full flex items-center justify-center">
              <KeenIcon icon="profile-circle" className="text-primary text-lg" />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-gray-900">{tenant.name}</h3>
            <p className="text-xs text-gray-600">{tenant.phone}</p>
          </div>
        </div>
        
        {/* Action Buttons - Direct access */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onEdit(tenant)}
            className="btn btn-sm btn-icon btn-light transition-colors"
            title="Chỉnh sửa thông tin"
            aria-label={`Chỉnh sửa thông tin ${tenant.name}`}
          >
            <KeenIcon icon="notepad-edit" className="text-sm" />
          </button>
          <button 
            onClick={() => onDelete(tenant)}
            className="btn btn-sm btn-icon btn-danger hover:bg-danger-dark transition-colors"
            title="Xóa người thuê"
            aria-label={`Xóa người thuê ${tenant.name}`}
          >
            <KeenIcon icon="trash" className="text-sm" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Email:</span>
          <span className="font-medium">{tenant.email || 'Chưa có'}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">CCCD:</span>
          <span className="font-medium">{tenant.cccd_code || 'Chưa có'}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Ngày cấp:</span>
          <span className="font-medium">{tenant.cccd_day || 'Chưa có'}</span>
        </div>
        {tenant.timeUpdate && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Cập nhật:</span>
            <span className="font-medium">
              {format(new Date(tenant.timeUpdate.$date), 'dd/MM/yyyy', { locale: vi })}
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
));

TenantCard.displayName = 'TenantCard';

export const TenantManagementDrawer: React.FC<TenantManagementDrawerProps> = ({
  open,
  onClose,
  room,
  tenants,
  isLoading,
  onAddTenant,
  onEditTenant,
  onDeleteTenant,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Optimized search handler
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Filter tenants based on search term
  const filteredTenants = useMemo(() => {
    if (!searchTerm.trim()) return tenants;
    
    const searchLower = searchTerm.toLowerCase();
    return tenants.filter(tenant => 
      tenant.name.toLowerCase().includes(searchLower) ||
      tenant.phone.includes(searchTerm) ||
      tenant.email?.toLowerCase().includes(searchLower) ||
      tenant.cccd_code?.includes(searchTerm)
    );
  }, [tenants, searchTerm]);

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
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 z-20 bg-white">
          <div className="flex items-center gap-2">
            <KeenIcon icon="profile-circle" className="text-xl" />
            <div>
              <h2 className="text-lg font-semibold">Người thuê phòng</h2>
              <p className="text-sm text-gray-600">
                {room?.room_name} - {room?.home_name}
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
          <SearchInput value={searchTerm} onChange={handleSearchChange} />
          
          <div className="flex w-full flex-col sm:flex-row gap-2">
            <button 
              onClick={onAddTenant}
              className="btn btn-sm btn-primary flex items-center gap-2 hover:bg-primary-dark transition-colors w-full sm:w-auto"
            >
              <KeenIcon icon="plus" />
              Thêm người thuê
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
          ) : filteredTenants.length === 0 ? (
            <div className="text-center py-12">
              <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeenIcon icon="profile-circle" className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có người thuê'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Thử tìm kiếm với từ khóa khác' 
                  : 'Phòng này chưa có người thuê nào.'
                }
              </p>
              {!searchTerm && (
                <button 
                  onClick={onAddTenant}
                  className="btn btn-primary"
                >
                  Thêm người thuê đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Tìm thấy {filteredTenants.length} người thuê
                </p>
              </div>
              
              <div className="space-y-3">
                {filteredTenants.map((tenant) => (
                  <TenantCard
                    key={tenant._id?.$oid || tenant.pk}
                    tenant={tenant}
                    onEdit={onEditTenant}
                    onDelete={onDeleteTenant}
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

TenantManagementDrawer.displayName = 'TenantManagementDrawer'; 