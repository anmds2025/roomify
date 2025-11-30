/* eslint-disable prettier/prettier */
import { useEffect, useMemo, Fragment, useState } from 'react';
import { useSnackbar } from 'notistack';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid, KeenIcon } from '@/components';
import { useHomeManagement, useRoom, useRoomManagement } from '@/hooks';
import { IOption } from '@/auth';
import Select from 'react-select';
import ModalUpdateReading from '@/partials/modals/data/ModalUpdateReading';

interface IElectricityData {
  id: string;
  roomCode: string;
  oldReading: number;
  newReading: number | null;
  consumption: number;
  unitPrice: number;
  total: number;
}

interface IUpdateReadingModal {
  isOpen: boolean;
  onClose: () => void;
  data: IElectricityData | null;
  onSave: (newReading: number) => Promise<void>;
}

const DataElectricity = () => {
  const { enqueueSnackbar } = useSnackbar();
  const homeManagement = useHomeManagement();
  const { filteredData, isLoading, fetchRoomsByHome } = useRoomManagement();
  const { updateDataRoom } = useRoom();

  const [homeOptions, setHomeOptions] = useState<IOption[]>([]);
  const [selectedHome, setSelectedHome] = useState<string>('');
  const [electricityData, setElectricityData] = useState<IElectricityData[]>([]);
  const [modalData, setModalData] = useState<{ isOpen: boolean; data: IElectricityData | null }>({
    isOpen: false,
    data: null,
  });

  // Styles cho react-select (đẹp và đồng bộ, thân thiện mobile)
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
      const options = homeManagement.data.map((item) => ({
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

  // Khi filteredData thay đổi → tạo danh sách điện năng
  useEffect(() => {
    if (!filteredData || filteredData.length === 0) {
      setElectricityData([]);
      return;
    }

    const newData: IElectricityData[] = filteredData.map((room) => {
      const oldReading = Number(room.numElectricityOld) || 0;
      const newReading = Number(room.numElectricityNew) || 0;
      const unitPrice = Number(room.electricity_price) || 0;
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

    setElectricityData(newData);
  }, [filteredData]);

  // Mở modal cập nhật chỉ số điện
  const openEditModalHandler = (data: IElectricityData) => {
    setModalData({ isOpen: true, data });
  };

  // Cập nhật chỉ số điện trong state
  const handleUpdateReading = async (newReading: string, oldReading: string) => {
    if (!modalData.data) return;
    try {
      const id = modalData.data.id;
      const payload = {
        room_pk: id,
        type: 'electricity',
        newData : newReading,
        oldData: oldReading,
      }
      await updateDataRoom(payload);
      fetchRoomsByHome(selectedHome);
      enqueueSnackbar('Cập nhật thành công', { variant: 'success' });
    } catch {
      enqueueSnackbar('Không thể cập nhật chỉ số điện', { variant: 'error' });
    }
  };

  // Định nghĩa cột bảng
  const columns = useMemo<ColumnDef<IElectricityData>[]>(
    () => [
      {
        accessorKey: 'roomCode',
        header: 'Tên phòng',
        meta: { className: 'min-w-[140px]', cellClassName: 'min-w-[140px]' }
      },
      {
        accessorKey: 'oldReading',
        header: 'Số cũ',
        meta: { className: 'min-w-[100px] whitespace-nowrap', cellClassName: 'min-w-[100px] whitespace-nowrap' }
      },
      {
        accessorKey: 'newReading',
        header: 'Số mới',
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
        meta: { className: 'min-w-[140px] whitespace-nowrap', cellClassName: 'min-w-[140px] whitespace-nowrap' }
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
        meta: { className: 'w-[60px]', cellClassName: 'w-[60px]' }
      },
    ],
    []
  );

  return (
    <Fragment>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quản lý chỉ số điện</h3>
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
              data={electricityData}
              paginationSize={20}
              paginationSizes={[5, 10, 20, 50, 100]}
              saveState
              saveStateId="Electricity-grid"
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

export { DataElectricity };