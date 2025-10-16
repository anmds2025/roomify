/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useCallback, Fragment, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { Column, ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataGrid, KeenIcon, TDataGridSelectedRowIds } from '@/components';
import { IRoomData } from './RoomsData';
import moment from 'moment';
import { ModalConfirmDelete } from '@/partials/modals/confirm/ModalConfirmDelete';
import { ModalUpdateRoom } from '@/partials/modals/room/ModalUpdateRoom';
import { useRoomManagement } from '@/hooks/useRoomManagement';
import { useHomeManagement } from '@/hooks/useHomeManagement';
import { IOption } from '@/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TenantManagementDrawer } from '@/components/TenantManagementDrawer';
import { TenantFormModal } from '@/components/TenantFormModal';
import { ITenantData, ITenantFormData } from '@/types/tenant';
import { useTenant } from '@/hooks/useTenant';
import { ModalCreateContract } from '@/partials/modals/room/ModalCreateContract';
import { IHomeData } from '../homes';

import { MoneySlipManagementDrawer } from '@/components/MoneySlipManagementDrawer';
import { IMoneySlipData, IMoneySlipFormData } from '@/types/moneySlip';
import { MoneySlipFormModal } from '@/components/MoneySlipFormModal';
import { useMoneySlip } from '@/hooks/useMoneySlip';
import { useContract } from '@/hooks/useContract';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@/components/modal';
import { BulkMoneySlipModal } from '@/components/BulkMoneySlipModal';
// Component cho search input
const SearchInput = React.memo(({ value, onChange, placeholder }: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <div className="input input-sm max-w-48">
    <KeenIcon icon="magnifier" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
));

// Component cho action buttons
const ActionButtons = React.memo(({ onAddNew, onRefresh, isLoading }: { 
  onAddNew: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}) => (
  <div className="flex gap-2">
    <button 
      onClick={onRefresh}
      disabled={isLoading}
      className="btn btn-sm btn-light gap-1 items-center rounded-lg"
      style={{minWidth: "80px"}}
    >
      <KeenIcon icon="refresh" />
      {isLoading ? 'Đang tải...' : 'Làm mới'}
    </button>
    <button 
      onClick={onAddNew} 
      className="btn btn-sm btn-primary badge badge-outline badge-primary gap-1 items-center rounded-lg"
      style={{minWidth: "90px"}}
    >
      <KeenIcon icon="add-notepad" />
      Thêm mới
    </button>
  </div>
));

// Component cho status badge
const StatusBadge = React.memo(({ status }: { status: string }) => {
  const getStatusStyles = (status: string) => {
    const baseClass = 'capitalize px-2 py-1 rounded-2xl font-[400] text-sm inline-block w-[120px] text-center';
    
    switch (status) {
      case 'Đang trống':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'Đang đăng':
        return `${baseClass} bg-blue-100 text-blue-800`;
      case 'Đã ẩn':
        return `${baseClass} bg-gray-100 text-gray-800`;
      case 'Đã cho thuê':
        return `${baseClass} bg-orange-100 text-orange-800`;
      default:
        return `${baseClass} bg-gray-300 text-black`;
    }
  };

  return <div className={getStatusStyles(status)}>{status}</div>;
});

const Rooms = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [homeOptions, setHomeOptions] = useState<IOption[]>([]);
  const [homeData, setHomeData] = useState<IHomeData[]>([]);
  const {
    // State
    data,
    filteredData,
    searchTerm,
    pagination,
    isLoading,
    roomUpdate,
    homeSelect,
    roomId,
    openDeleteModal,
    openEditModal,
    openCreateContractModal,
    emptyRoom,
    emptyHome,
    
    // Actions
    fetchRooms,
    filterData,
    updateSearchTerm,
    updatePagination,
    
    // Modal handlers
    openDeleteModalHandler,
    closeDeleteModalHandler,
    deleteRoomHandler,
    openEditModalHandler,
    openCreateContractModalHandler,
    closeEditModalHandler,
    closeCreateContractModalHandler,
    addNewRoomHandler,
    fnFilterCustom
  } = useRoomManagement();

  const homeManagement = useHomeManagement();
  const tenantAPI = useTenant();
  const moneySlipAPI = useMoneySlip();
  const contractAPI = useContract();

  // Tenant management state
  const [selectedRoom, setSelectedRoom] = useState<IRoomData | null>(null);
  const [tenants, setTenants] = useState<ITenantData[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMoneySlipOpen, setDrawerMoneySlipOpen] = useState(false);

  // Tenant form state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<ITenantData | null>(null);

  // Delete tenant confirmation state
  const [deleteTenantModalOpen, setDeleteTenantModalOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<ITenantData | null>(null);
  const [deleteMoneySlipModalOpen, setDeleteMoneySlipModalOpen] = useState(false);
  const [moneySlipToDelete, setMoneySlipToDelete] = useState<IMoneySlipData | null>(null);
  const [selectedHome, setSelectedHome] = useState<string>('all');

  const [deleteContractModalOpen, setDeleteContractModalOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string>('');

  const [moneySlips, setMoneySlips] = useState<IMoneySlipData[]>([]);
  const [isLoadingMoneySlips, setIsLoadingMoneySlips] = useState(false);
  const [formModalMoneySlipOpen, setFormModalMoneySlipOpen] = useState(false);

  // Bulk money slip state
  const [selectedRowIdsState, setSelectedRowIdsState] = useState<Set<string>>(new Set());
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    name: '',
    waterOld: '',
    waterNew: '',
    numPeo: '',
    debt: '',
    elecOld: '',
    elecNew: ''
  });
  const [bulkEntries, setBulkEntries] = useState<Record<string, {
    name: string;
    waterOld: string;
    waterNew: string;
    numPeo: string;
    debt: string;
    elecOld: string;
    elecNew: string;
  }>>({});

  const selectedRooms = useMemo(() => {
    if (!selectedRowIdsState || selectedRowIdsState.size === 0) return [] as IRoomData[];
    return Array.from(selectedRowIdsState)
      .map((id) => filteredData[Number(id)])
      .filter(Boolean);
  }, [selectedRowIdsState, filteredData]);

  useEffect(() => {
    fetchRooms();
    homeManagement.fetchHomes();
  }, []); 

  useEffect(() => {
    const options = homeManagement.data.map((item) => {
      return {
        label: item.home_name,
        value: item._id?.$oid
      } as IOption
    });
    setHomeData(homeManagement.data)
    setHomeOptions(options);
  }, [homeManagement.data]);

  useEffect(() => {
    filterData();
  }, [searchTerm, data]); // Chạy khi searchTerm hoặc data thay đổi

  // Tenant management handlers
  const handleViewTenants = useCallback(async (room: IRoomData) => {
    setSelectedRoom(room);
    setDrawerOpen(true);
    setIsLoadingTenants(true);

    fetchTenants(room._id?.$oid!)
  }, [tenantAPI, enqueueSnackbar]);

  const handleViewMoneySlip = useCallback(async (room: IRoomData) => {
    setSelectedRoom(room);
    setDrawerMoneySlipOpen(true);
    setIsLoadingMoneySlips(true);
    fetchTenants(room._id?.$oid!)
    fetchMoneySlips(room._id?.$oid!)
  }, [moneySlipAPI, enqueueSnackbar]);

  const fetchTenants = useCallback(async (roomId: string) => {
    try {
      setIsLoadingTenants(true);
      const response = await tenantAPI.fetchTenants(roomId);
      const data = response.objects || [];
      setTenants(data);
      return data;
    } catch (error) {
      console.error('Error fetching tenants:', error);
      enqueueSnackbar('Lỗi khi tải danh sách người thuê', { variant: 'error' });
      setTenants([]);
      return [];
    } finally {
      setIsLoadingTenants(false);
    }
  }, [enqueueSnackbar]);

  const fetchMoneySlips = useCallback(async (roomId: string) => {
    try {
      setIsLoadingMoneySlips(true);
      const response = await moneySlipAPI.fetchMoneySlips(roomId);
      const data = response.objects || [];
      setMoneySlips(data);
      return data;
    } catch (error) {
      console.error('Error fetching money slip:', error);
      enqueueSnackbar('Lỗi khi tải danh sách phiếu thu', { variant: 'error' });
      setMoneySlips([]);
      return [];
    } finally {
      setIsLoadingMoneySlips(false);
    }
  }, [enqueueSnackbar]);

  const handleViewContracts = useCallback(
    async (room: IRoomData) => {
      const fetchedTenants = await fetchTenants(room._id?.$oid!);

      const home = homeData.find(h => h._id?.$oid === room.home_pk);
      if (!home) {
        enqueueSnackbar(`Có lỗi xảy ra`, { variant: 'error' });
        return;
      }

      if (fetchedTenants.length === 0) {
        enqueueSnackbar(`Bạn chưa có người thuê, vui lòng tạo!`, { variant: 'error' });
        return;
      }

      if (room.contract_path && room.contract_pk) {
        window.open(`${import.meta.env.VITE_APP_SERVER_URL}${room.contract_path}`, '_blank');
      } else {
        openCreateContractModalHandler(room, home);
      }
    },
    [homeData, fetchTenants, enqueueSnackbar, openCreateContractModalHandler]
  );

  const handleAddMoneySlip = useCallback(() => {
    setFormModalMoneySlipOpen(true);
  }, []);

  const handleAddTenant = useCallback(() => {
    setEditingTenant(null);
    setFormModalOpen(true);
  }, []);

  // Helper function to refresh tenant list
  const refreshTenantList = useCallback(async (roomId: string) => {
    try {
      const response = await tenantAPI.fetchTenants(roomId);
      setTenants(response.objects || []);
    } catch (error) {
      console.error('Error refreshing tenant list:', error);
    }
  }, [tenantAPI]);

  const refreshMoneySlipList = useCallback(async (roomId: string) => {
    try {
      const response = await moneySlipAPI.fetchMoneySlips(roomId);
      setMoneySlips(response.objects || []);
    } catch (error) {
      console.error('Error refreshing money slip list:', error);
    }
  }, [moneySlipAPI]);

  const handleEditTenant = useCallback((tenant: ITenantData) => {
    setEditingTenant(tenant);
    setFormModalOpen(true);
  }, []);

  const handleTenantFormSubmit = useCallback(async (formData: ITenantFormData) => {
    if (!selectedRoom) return;

    try {
      if (editingTenant) {
        await tenantAPI.updateTenantInfo(editingTenant._id?.$oid!, selectedRoom._id?.$oid!, formData);
        enqueueSnackbar('Cập nhật thông tin người thuê thành công', { variant: 'success' });
      } else {
        await tenantAPI.createTenant(selectedRoom._id?.$oid!, formData);
        enqueueSnackbar('Thêm người thuê mới thành công', { variant: 'success' });
      }
      
      // Refresh tenant list
      await refreshTenantList(selectedRoom._id?.$oid!);
      
      setFormModalOpen(false);
      setEditingTenant(null);
    } catch (error) {
      console.error('Error saving tenant:', error);
      enqueueSnackbar('Lỗi khi lưu thông tin người thuê', { variant: 'error' });
      throw error;
    }
  }, [selectedRoom, editingTenant, tenantAPI, enqueueSnackbar, refreshTenantList]);

  const handleMoneySlipFormSubmit = useCallback(async (formData: IMoneySlipFormData) => {
    if (!selectedRoom) return;
    try {
     
      await moneySlipAPI.createMoneySlip(selectedRoom._id?.$oid!, formData);
      await refreshTenantList(selectedRoom._id?.$oid!);
      
      setFormModalOpen(false);
      setEditingTenant(null);
    } catch (error) {
      console.error('Error saving tenant:', error);
      enqueueSnackbar('Lỗi khi thêm phiếu thu tiền phòng', { variant: 'error' });
      throw error;
    }
  }, [selectedRoom, moneySlipAPI, enqueueSnackbar, refreshTenantList]);

  const handleDeleteTenant = useCallback((tenant: ITenantData) => {
    setTenantToDelete(tenant);
    setDeleteTenantModalOpen(true);
  }, []);

  const handleDeleteMoneySlip = useCallback((moneySlip: IMoneySlipData) => {
    setMoneySlipToDelete(moneySlip);
    setDeleteMoneySlipModalOpen(true);
  }, []);

  const handleConfirmDeleteMoneySlip = useCallback(async () => {
    if (!moneySlipToDelete || !selectedRoom) return;

    try {
      await moneySlipAPI.removeMoneySlip(moneySlipToDelete._id?.$oid!);
      enqueueSnackbar('Xóa phiếu thu thành công', { variant: 'success' });
      
      // Refresh money slip list
      await refreshMoneySlipList(selectedRoom._id?.$oid!);
    } catch (error) {
      console.error('Error deleting money slip:', error);
      enqueueSnackbar('Lỗi khi xóa phiếu thu', { variant: 'error' });
    } finally {
      setDeleteMoneySlipModalOpen(false);
      setMoneySlipToDelete(null);
    }
  }, [moneySlipToDelete, selectedRoom, moneySlipAPI, enqueueSnackbar, refreshMoneySlipList]);

  const handleDeleteContract = useCallback((contract_pk: string) => {
    setContractToDelete(contract_pk);
    setDeleteContractModalOpen(true);
  }, []);

  const handleConfirmDeleteContract = useCallback(async () => {
    if (!contractToDelete) return;
    try {
      await contractAPI.removeContract(contractToDelete);
      enqueueSnackbar('Xóa phiếu thu hợp đồng', { variant: 'success' });
      await fetchRooms();
    } catch (error) {
      console.error('Error deleting contract:', error);
      enqueueSnackbar('Lỗi khi xóa phiếu thu', { variant: 'error' });
    } finally {
      setDeleteContractModalOpen(false);
      setContractToDelete('');
    }
  }, [contractToDelete, selectedRoom, contractAPI, enqueueSnackbar]);

  const handleConfirmDeleteTenant = useCallback(async () => {
    if (!tenantToDelete || !selectedRoom) return;

    try {
      await tenantAPI.removeTenant(tenantToDelete._id?.$oid!);
      enqueueSnackbar('Xóa người thuê thành công', { variant: 'success' });
      
      // Refresh tenant list
      await refreshTenantList(selectedRoom._id?.$oid!);
    } catch (error) {
      console.error('Error deleting tenant:', error);
      enqueueSnackbar('Lỗi khi xóa người thuê', { variant: 'error' });
    } finally {
      setDeleteTenantModalOpen(false);
      setTenantToDelete(null);
    }
  }, [tenantToDelete, selectedRoom, tenantAPI, enqueueSnackbar, refreshTenantList]);

  const handleRefreshTenants = useCallback(async () => {
    if (!selectedRoom) return;
    
    setIsLoadingTenants(true);
    try {
      await refreshTenantList(selectedRoom._id?.$oid!);
    } catch (error) {
      console.error('Error refreshing tenants:', error);
      enqueueSnackbar('Lỗi khi tải danh sách người thuê', { variant: 'error' });
    } finally {
      setIsLoadingTenants(false);
    }
  }, [selectedRoom, refreshTenantList, enqueueSnackbar]);

  const handleRefreshMonenSlips = useCallback(async () => {
    if (!selectedRoom) return;
    setIsLoadingTenants(true);
    try {
      await refreshMoneySlipList(selectedRoom._id?.$oid!);
    } catch (error) {
      console.error('Error refreshing money slip:', error);
      enqueueSnackbar('Lỗi khi tải danh sách phiếu thu', { variant: 'error' });
    } finally {
      setIsLoadingTenants(false);
    }
  }, [selectedRoom, refreshMoneySlipList, enqueueSnackbar]);

  // Contract signing handlers
  const handleCopyContractLink = useCallback((room: IRoomData) => {
    // Use contract_pk if available, otherwise show error
    if (!room.contract_pk) {
      enqueueSnackbar('Phòng này chưa có hợp đồng. Vui lòng tạo hợp đồng trước!', { variant: 'error' });
      return;
    }
    
    const roomId = room.pk || room._id?.$oid;
    if (!roomId) {
      enqueueSnackbar('Không thể xác định thông tin phòng', { variant: 'error' });
      return;
    }
    
    const contractUrl = `${window.location.origin}/contract-signing/${room.contract_pk}/${roomId}`;
    
    navigator.clipboard.writeText(contractUrl).then(() => {
      enqueueSnackbar('Đã sao chép link ký hợp đồng!', { variant: 'success' });
    }).catch(() => {
      enqueueSnackbar('Không thể sao chép link', { variant: 'error' });
    });
  }, [enqueueSnackbar]);

  const handleGoToContractPage = useCallback((room: IRoomData) => {
    // Use contract_pk if available, otherwise show error
    if (!room.contract_pk) {
      enqueueSnackbar('Phòng này chưa có hợp đồng. Vui lòng tạo hợp đồng trước!', { variant: 'error' });
      return;
    }
    
    const roomId = room.pk || room._id?.$oid;
    if (!roomId) {
      enqueueSnackbar('Không thể xác định thông tin phòng', { variant: 'error' });
      return;
    }
    
    navigate(`/contract-signing/${room.contract_pk}/${roomId}`);
  }, [navigate]);

  // Table columns với useMemo để tối ưu performance
  const columns = useMemo<ColumnDef<IRoomData>[]>(
    () => [
      {
        accessorFn: (row) => row.room_name,
        id: 'room_name',
        header: () => 'Tên phòng',
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
          className: 'min-w-[150px]',
        }
      },
      {
        id: 'home_name',
        accessorFn: (row) => row.home_name,
        header: () => 'Tòa nhà',
        enableSorting: true,
        enableColumnFilter: true,
        enableHiding: false,
        cell: (info) => info.getValue() || '-',
        meta: {
          className: 'min-w-[200px]',
        },
        filterFn: (row, colId, filterValue) => {
          const value = row.getValue(colId);

          return String(value)?.toLowerCase().includes(filterValue.toLowerCase());
        }
      },
      // {
      //   accessorFn: (row) => row.user_name,
      //   id: 'user_name',
      //   header: () => 'Chủ phòng',
      //   enableSorting: true,
      //   cell: (info) => info.getValue(),
      //   meta: {
      //     className: 'min-w-[150px]',
      //   }
      // },
      {
        accessorFn: (row) => row.price,
        id: 'price',
        header: () => 'Giá thuê(đ)',
        enableSorting: true,
        cell: (info) => {
          const value = info.getValue() as number;
          return value ? `${value.toLocaleString()}` : '-';
        },
        meta: {
          className: 'min-w-[120px]',
        }
      },
      {
        accessorFn: (row) => row.size,
        id: 'size',
        header: () => 'Diện tích(m²)',
        enableSorting: true,
        cell: (info) => {
          const value = info.getValue() as number;
          return value ? `${value}` : '-';
        },
        meta: {
          className: 'min-w-[100px]',
        }
      },
      {
        accessorFn: (row) => row.status,
        id: 'status',
        header: () => 'Trạng thái',
        enableSorting: true,
        cell: (info) => <StatusBadge status={info.row.original.status} />,
        meta: {
          className: 'min-w-[120px]',
        }
      },
      {
        accessorFn: (row) => row.timeUpdate?.$date,
        id: 'timeUpdate',
        header: () => 'Ngày cập nhật',
        enableSorting: true,
        cell: (info) => {
          const date = info.getValue();
          return date ? moment(date).format('DD/MM/YYYY') : '-';
        },
        meta: {
          className: 'min-w-[150px]',
        }
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="btn btn-sm btn-icon btn-light btn-clear"
                aria-label="Thao tác"
              >
                <KeenIcon icon="dots-vertical" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={() => handleViewTenants(row.original)}
                className="flex items-center gap-2 cursor-pointer bg-white"
              >
                <KeenIcon icon="profile-circle" className="text-base" />
                <span>Người thuê</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleViewMoneySlip(row.original)}
                className="flex items-center gap-2 cursor-pointer bg-white"
              >
                <KeenIcon icon="dollar" className="text-base" />
                <span>Phiếu thu tiền</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleViewContracts(row.original)}
                className="flex items-center gap-2 cursor-pointer bg-white"
              >
                <KeenIcon icon="document" className="text-base" />
                <span>{row.original.contract_pk ? "Xem hợp đồng" : "Tạo hợp đồng"}</span>
              </DropdownMenuItem>
              {row.original.contract_pk && (
                <DropdownMenuItem 
                  onClick={() => handleDeleteContract(row.original.contract_pk || '')}
                  className="flex items-center gap-2 cursor-pointer bg-white"
                >
                  <KeenIcon icon="document" className="trash" />
                  <span>{"Xóa hợp đồng"}</span>
                </DropdownMenuItem>
              )}
              {!row.original.contract_signed && (
              <>
                <DropdownMenuItem 
                  onClick={() => handleCopyContractLink(row.original)}
                  className="flex items-center gap-2 cursor-pointer bg-white"
                >
                  <KeenIcon icon="copy" className="text-base" />
                  <span>Sao chép link ký hợp đồng</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleGoToContractPage(row.original)}
                  className="flex items-center gap-2 cursor-pointer bg-white"
                >
                  <KeenIcon icon="pencil" className="text-base" />
                  <span>Đi tới trang ký hợp đồng</span>
                </DropdownMenuItem>
              </>
              )}
              
              <DropdownMenuItem 
                onClick={() => openEditModalHandler(row.original)}
                className="flex items-center gap-2 cursor-pointer bg-white"
              >
                <KeenIcon icon="notepad-edit" className="text-base" />
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => openDeleteModalHandler(row.original)}
                className="flex items-center gap-2 cursor-pointer text-danger bg-white"
              >
                <KeenIcon icon="trash" className="text-base" />
                <span>Xóa</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        meta: {
          className: 'w-[60px]'
        }
      }
    ],
    [openEditModalHandler, openDeleteModalHandler, handleViewTenants, handleViewContracts, handleCopyContractLink, handleGoToContractPage]
  );

  const filterByHome = (value: string) => {
    if(value === 'all') return fnFilterCustom(data);

    const results = [...data].filter(item => {
      return item.home_pk === value
    }); 

    fnFilterCustom(results);
  }

  // Handlers
  const handleRowsSelectChange = useCallback((selectedRowIds: TDataGridSelectedRowIds) => {
    setSelectedRowIdsState(new Set(selectedRowIds));
    enqueueSnackbar(
      selectedRowIds.size > 0 ? `${selectedRowIds.size} phòng được chọn` : `Không có phòng nào được chọn`,
      { 
        variant: 'solid', 
        state: 'dark'
      }
    );
  }, []);

  const openBulkMoneySlip = useCallback(() => {
    if (selectedRooms.length === 0) {
      enqueueSnackbar('Vui lòng chọn ít nhất 1 phòng', { variant: 'error' });
      return;
    }
    // Initialize per-room entries (prefill from room if available)
    const initial: Record<string, any> = {};
    selectedRooms.forEach((room) => {
      const key = (room as any).pk || room._id?.$oid || String(room.room_name);
      initial[key] = {
        name: bulkForm.name || '',
        waterOld: (room as any)?.numWaterOld?.toString?.() || '',
        waterNew: '',
        numPeo: (room as any)?.numPeo?.toString?.() || '',
        debt: '0',
        elecOld: (room as any)?.numElectricityOld?.toString?.() || '',
        elecNew: ''
      };
    });
    setBulkEntries(initial);
    setBulkModalOpen(true);
  }, [selectedRooms, enqueueSnackbar]);

  const handlePaginationChange = useCallback((newPagination: PaginationState) => {
    updatePagination(newPagination);
  }, []);

  const fetchRoomsWithExtra = async () => {
    setSelectedHome('all')
    await fetchRooms(); // gọi fetchRooms cũ
    await homeManagement.fetchHomes(); // gọi hàm bổ sung
  };

  return (
    <Fragment>
      <div className="card card-grid h-full min-w-full">
        {/* Header */}
        <div className="card-header flex justify-end">
          <div className='flex gap-4'>
            <div className='max-h-[32px] min-w-48'>
              <Select
                value={selectedHome}
                onValueChange={(value) => {filterByHome(value), setSelectedHome(value)}}
              >
                <SelectTrigger className="max-h-[32px]">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem key={'null'} value="all">Tất cả</SelectItem>
                  {homeOptions?.map((option: IOption) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          
            <SearchInput
              value={searchTerm}
              onChange={updateSearchTerm}
              placeholder="Tìm kiếm"
            />
            <ActionButtons 
              onAddNew={addNewRoomHandler} 
              onRefresh={fetchRooms}
              isLoading={isLoading}
            />
            <button
              onClick={openBulkMoneySlip}
              disabled={selectedRooms.length === 0}
              className={`btn btn-sm gap-1 items-center rounded-lg ${selectedRooms.length === 0 ? 'btn-light' : 'btn-primary'}`}
              style={{minWidth: '180px'}}
            >
              <KeenIcon icon="dollar" />
              Tạo phiếu thu hàng loạt
            </button>
          </div>
        </div>

        {/* DataGrid */}
        <div className="card-body">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Đang tải dữ liệu...</div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-gray-500 mb-2">Không có dữ liệu phòng</div>
                <div className="text-sm text-gray-400">
                  {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Hãy thêm phòng mới'}
                </div>
              </div>
            </div>
          ) : (
            <DataGrid
              columns={columns}
              data={filteredData}
              rowSelect={true}
              paginationSize={20}
              paginationSizes={[5, 10, 20, 50, 100]}
              initialSorting={[{ id: 'room_name', desc: false }]}
              saveState={true}
              saveStateId="Rooms-grid"
              onRowsSelectChange={handleRowsSelectChange}
              onPaginationChange={handlePaginationChange}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <ModalConfirmDelete
        open={openDeleteModal}
        onClose={closeDeleteModalHandler}
        onConfirm={deleteRoomHandler}
        title="Xóa"
        message="Bạn có muốn xoá phòng này. Khi xác nhận thì sẽ không thể quay lại"
      />
      
      <ModalUpdateRoom 
        open={openEditModal} 
        onClose={closeEditModalHandler} 
        room={roomUpdate} 
        fetchRooms={fetchRoomsWithExtra}
        homeOptions={homeOptions}
      />

      <ModalCreateContract 
        open={openCreateContractModal} 
        onClose={closeCreateContractModalHandler} 
        room={roomUpdate} 
        home={homeSelect}
        fetchRooms={fetchRoomsWithExtra}
        userData={tenants}
      />

      {/* Tenant Management Drawer */}
      <TenantManagementDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        room={selectedRoom}
        tenants={tenants}
        isLoading={isLoadingTenants}
        onAddTenant={handleAddTenant}
        onEditTenant={handleEditTenant}
        onDeleteTenant={handleDeleteTenant}
        onRefresh={handleRefreshTenants}
      />

      {/* Tenant Form Modal */}
      <TenantFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleTenantFormSubmit}
        tenant={editingTenant}
        room={selectedRoom}
      />

      {/* Tenant Management Drawer */}
      <MoneySlipManagementDrawer
        open={drawerMoneySlipOpen}
        onClose={() => setDrawerMoneySlipOpen(false)}
        room={selectedRoom}
        moneySlips={moneySlips}
        isLoading={isLoadingMoneySlips}
        onAddMoneySlip={handleAddMoneySlip}
        onDeleteMoneySlip={handleDeleteMoneySlip}
        onRefresh={handleRefreshMonenSlips}
      />

      
      <MoneySlipFormModal
        onCreate={() => setDrawerMoneySlipOpen(false)}
        open={formModalMoneySlipOpen}
        onClose={() => setFormModalMoneySlipOpen(false)}
        onSubmit={handleMoneySlipFormSubmit}
        room={selectedRoom || {} as IRoomData}
        userData={tenants}
        home={homeData.find(item => item._id?.$oid === selectedRoom?.home_pk) || {} as IHomeData}
      />

      {/* Delete Tenant Confirmation Modal */}
      <ModalConfirmDelete
        open={deleteTenantModalOpen}
        onClose={() => setDeleteTenantModalOpen(false)}
        onConfirm={handleConfirmDeleteTenant}
        title="Xóa người thuê"
        message={`Bạn có chắc chắn muốn xóa "${tenantToDelete?.name}" khỏi phòng này?`}
      />

      <ModalConfirmDelete
        open={deleteMoneySlipModalOpen}
        onClose={() => setDeleteMoneySlipModalOpen(false)}
        onConfirm={handleConfirmDeleteMoneySlip}
        title="Xóa phiếu thu"
        message={`Bạn có chắc chắn muốn xóa phiếu thu này không?`}
      />

      <ModalConfirmDelete
        open={deleteContractModalOpen}
        onClose={() => setDeleteContractModalOpen(false)}
        onConfirm={handleConfirmDeleteContract}
        title="Xóa hợp đồng"
        message={`Bạn có chắc chắn muốn xóa hợp đồng này không?`}
      />

      {/* Bulk Money Slip Modal */}
      <BulkMoneySlipModal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        rooms={selectedRooms}
        onSave={(items) => {
          console.log('Bulk money slip draft list:', items);
          enqueueSnackbar(`Đã lưu ${items.length} phiếu thu nháp`, { variant: 'success' });
        }}
      />


    </Fragment>
  );
};

export { Rooms }; 