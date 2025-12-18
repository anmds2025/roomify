/* eslint-disable prettier/prettier */
import { useEffect, useMemo, Fragment, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useSnackbar } from 'notistack';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid, KeenIcon } from '@/components';
import { useHomeManagement, useRoom, useRoomManagement } from '@/hooks';
import { IOption } from '@/auth';
import Select from 'react-select';
import ModalUpdateReading from '@/partials/modals/data/ModalUpdateReading';

interface IWaterData {
  id: string;
  roomCode: string;
  oldReading: number;
  newReading: number | null;
  consumption: number;
  unitPrice: number;
  total: number;
}


const DataWater = () => {
  const { enqueueSnackbar } = useSnackbar();
  const homeManagement = useHomeManagement();
  const { filteredData, fetchRoomsByHome } = useRoomManagement();
  const { updateDataRoom } = useRoom();

  const [homeOptions, setHomeOptions] = useState<IOption[]>([]);
  const [selectedHome, setSelectedHome] = useState<string>('');
  const [waterData, setWaterData] = useState<IWaterData[]>([]);
  const [modalData, setModalData] = useState<{ isOpen: boolean; data: IWaterData | null }>({
    isOpen: false,
    data: null,
  });
  const [editingCell, setEditingCell] = useState<{ id: string; field: 'oldReading' | 'newReading' } | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  // Styles cho react-select (đẹp và thân thiện mobile)
  const selectStyles = useMemo(() => ({
    control: (base: any, state: any) => ({
      ...base,
      minHeight: 36,
      height: 36,
      borderRadius: 8,
      borderColor: state.isFocused ? '#3b82f6' : base.borderColor,
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59,130,246,0.2)' : 'none',
      '&:hover': { borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1' }
    }),
    valueContainer: (base: any) => ({
      ...base,
      padding: '0 8px'
    }),
    indicatorsContainer: (base: any) => ({
      ...base,
      height: 36
    }),
    dropdownIndicator: (base: any) => ({ ...base, padding: 6 }),
    clearIndicator: (base: any) => ({ ...base, padding: 6 }),
    menu: (base: any) => ({ ...base, zIndex: 50 })
  }), []);

  // Load danh sách tòa nhà khi vào trang
  useEffect(() => {
    homeManagement.fetchHomes();
  }, []);

  // Cập nhật danh sách options cho select
  useEffect(() => {
    if (homeManagement.data?.length) {
      const options = homeManagement.data
        .filter((item) => item.typeWater !== 'month') // 👉 chỉ lấy tòa nhà có typeWater khác 'month'
        .map((item) => ({
          label: item.home_name,
          value: String(item._id?.$oid || ''),
        }));
      setHomeOptions(options);
    }
  }, [homeManagement.data]);

  // Fetch danh sách phòng theo tòa nhà
  useEffect(() => {
    const fetchRooms = async () => {
      if (!selectedHome) return;
      try {
        await fetchRoomsByHome(selectedHome);
      } catch {
        enqueueSnackbar('Không thể tải danh sách phòng', { variant: 'error' });
      }
    };
    fetchRooms();
  }, [selectedHome]);

  // Khi filteredData thay đổi → tạo danh sách nước năng
  useEffect(() => {
    if (!filteredData || filteredData.length === 0) {
      setWaterData([]);
      return;
    }

    const newData: IWaterData[] = filteredData.map((room) => {
      const oldReading = Number(room.numWaterOld) || 0;
      const newReading = Number(room.numWaterNew) || 0;
      const unitPrice = Number(room.water_price) || 0;
      const consumption = newReading > oldReading ? newReading - oldReading : 0;
      const total = consumption * unitPrice;

      return {
        id: room._id?.$oid || '',
        roomCode: room.room_name || '',
        oldReading,
        newReading,
        consumption,
        unitPrice,
        total,
      };
    });

    setWaterData(newData);
  }, [filteredData]);

  // Mở modal cập nhật chỉ số nước
  const openEditModalHandler = (data: IWaterData) => {
    setModalData({ isOpen: true, data });
  };

  // Cập nhật chỉ số nước trong state
  const handleUpdateReading = async (newReading: string, oldReading: string) => {
    if (!modalData.data) return;
    try {
      const id = modalData.data.id;
      const payload = {
        room_pk: id,
        type: 'water',
        newData : newReading,
        oldData: oldReading,
      }
      await updateDataRoom(payload);
      fetchRoomsByHome(selectedHome);
      enqueueSnackbar('Cập nhật thành công', { variant: 'success' });
    } catch {
      enqueueSnackbar('Không thể cập nhật chỉ số nước', { variant: 'error' });
    }
  };

  // Xử lý khi click vào ô để chỉnh sửa inline
  const handleCellClick = (id: string, field: 'oldReading' | 'newReading', currentValue: number | null) => {
    setEditingCell({ id, field });
    setTempValue(String(currentValue || 0));
  };

  // Xử lý khi blur (bấm ra ngoài) để lưu dữ liệu
  const handleCellBlur = async (id: string, field: 'oldReading' | 'newReading') => {
    if (!editingCell) return;

    const room = waterData.find((r) => r.id === id);
    if (!room) return;

    const newValue = Number(tempValue) || 0;
    const oldValue = field === 'oldReading' ? room.oldReading : room.newReading;

    // Nếu giá trị không thay đổi, không cần gọi API
    if (newValue === oldValue) {
      setEditingCell(null);
      return;
    }

    try {
      const payload = {
        room_pk: id,
        type: 'water',
        newData: field === 'newReading' ? String(newValue) : String(room.newReading || 0),
        oldData: field === 'oldReading' ? String(newValue) : String(room.oldReading),
      };
      await updateDataRoom(payload);
      await fetchRoomsByHome(selectedHome);
      enqueueSnackbar('Cập nhật thành công', { variant: 'success' });
    } catch {
      enqueueSnackbar('Không thể cập nhật chỉ số nước', { variant: 'error' });
    } finally {
      setEditingCell(null);
    }
  };

  // Xử lý khi nhấn Enter/Esc trong input
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>, id: string, field: 'oldReading' | 'newReading') => {
    if (e.key === 'Enter') {
      (e.currentTarget as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Định nghĩa cột bảng
  const columns = useMemo<ColumnDef<IWaterData>[]>(
    () => [
      {
        accessorKey: 'roomCode',
        header: 'Tên phòng',
        meta: { className: 'min-w-[140px]', cellClassName: 'min-w-[140px]' }
      },
      {
        accessorKey: 'oldReading',
        header: 'Số cũ',
        cell: ({ row }) => {
          const isEditing = editingCell?.id === row.original.id && editingCell?.field === 'oldReading';
          return isEditing ? (
            <input
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={() => handleCellBlur(row.original.id, 'oldReading')}
              onKeyDown={(e) => handleKeyDown(e, row.original.id, 'oldReading')}
              autoFocus
              className="input input-sm w-full max-w-[100px] border border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          ) : (
            <div
              onClick={() => handleCellClick(row.original.id, 'oldReading', row.original.oldReading)}
              className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
              title="Click để chỉnh sửa"
            >
              {row.original.oldReading}
            </div>
          );
        },
        meta: { className: 'min-w-[100px] whitespace-nowrap', cellClassName: 'min-w-[100px] whitespace-nowrap' }
      },
      {
        accessorKey: 'newReading',
        header: 'Số mới',
        cell: ({ row }) => {
          const isEditing = editingCell?.id === row.original.id && editingCell?.field === 'newReading';
          return isEditing ? (
            <input
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={() => handleCellBlur(row.original.id, 'newReading')}
              onKeyDown={(e) => handleKeyDown(e, row.original.id, 'newReading')}
              autoFocus
              className="input input-sm w-full max-w-[100px] border border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          ) : (
            <div
              onClick={() => handleCellClick(row.original.id, 'newReading', row.original.newReading)}
              className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
              title="Click để chỉnh sửa"
            >
              {row.original.newReading}
            </div>
          );
        },
        meta: { className: 'min-w-[100px] whitespace-nowrap', cellClassName: 'min-w-[100px] whitespace-nowrap' }
      },
      {
        accessorKey: 'consumption',
        header: 'Tiêu thụ',
        meta: { className: 'hidden md:table-cell min-w-[100px]', cellClassName: 'hidden md:table-cell min-w-[100px]' }
      },
      {
        accessorKey: 'unitPrice',
        header: 'Đơn giá',
        cell: ({ row }) => {
          const value = row.original.unitPrice || 0;
          return `${value.toLocaleString('vi-VN')} VND`;
        },
        meta: { className: 'hidden md:table-cell min-w-[120px]', cellClassName: 'hidden md:table-cell min-w-[120px]' }
      },
      {
        accessorKey: 'total',
        header: 'Thành tiền',
        cell: ({ row }) => {
          const value = row.original.total || 0;
          return `${value.toLocaleString('vi-VN')} VND`;
        },
      },
      {
        id: 'edit',
        header: '',
        cell: ({ row }) => (
          <button
            className="btn btn-sm btn-icon btn-clear btn-light"
            onClick={() => openEditModalHandler(row.original)}
          >
            <KeenIcon icon="notepad-edit" />
          </button>
        ),
      },
    ],
    [editingCell, tempValue]
  );

  return (
    <Fragment>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quản lý chỉ số nước (chỉ dành cho tòa nhà tính nước theo chỉ số)</h3>
        </div>

        <div className="card-body">
          {/* Chọn tòa nhà */}
          <div className="mb-4">
            <label className="label">
              <span className="label-text">Chọn tòa nhà</span>
            </label>
            <Select
              value={homeOptions.find((opt) => opt.value === selectedHome) || null}
              onChange={(option) => setSelectedHome(String(option?.value || ''))}
              options={homeOptions}
              placeholder="Chọn tòa nhà..."
              className="w-full sm:max-w-64"
              styles={selectStyles}
              theme={(theme) => ({
                ...theme,
                borderRadius: 8,
                colors: {
                  ...theme.colors,
                  primary: '#3b82f6',
                  primary25: '#DBEAFE',
                  neutral20: '#cbd5e1',
                  neutral30: '#94a3b8',
                },
              })}
            />
          </div>

          {/* Bảng danh sách phòng */}
          {selectedHome && (
            <DataGrid
              columns={columns}
              data={waterData}
              tableSpacing="xs"
              paginationSize={20}
              paginationSizes={[5, 10, 20, 50, 100]}
              saveState
              saveStateId="Water-grid"
            />
          )}
        </div>
      </div>

      {/* Modal cập nhật */}
      <ModalUpdateReading
        isOpen={modalData.isOpen}
        onClose={() => setModalData({ isOpen: false, data: null })}
        data={modalData.data}
        onSave={handleUpdateReading}
      />
    </Fragment>
  );
};

export { DataWater };