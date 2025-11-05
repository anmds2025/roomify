/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useCallback, Fragment, useState } from 'react';
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

interface IUpdateReadingModal {
  isOpen: boolean;
  onClose: () => void;
  data: IWaterData | null;
  onSave: (newReading: number) => Promise<void>;
}

const DataWater = () => {
  const { enqueueSnackbar } = useSnackbar();
  const homeManagement = useHomeManagement();
  const { filteredData, isLoading, fetchRoomsByHome } = useRoomManagement();
  const { updateDataRoom } = useRoom();

  const [homeOptions, setHomeOptions] = useState<IOption[]>([]);
  const [selectedHome, setSelectedHome] = useState<string>('');
  const [waterData, setWaterData] = useState<IWaterData[]>([]);
  const [modalData, setModalData] = useState<{ isOpen: boolean; data: IWaterData | null }>({
    isOpen: false,
    data: null,
  });

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

  // Định nghĩa cột bảng
  const columns = useMemo<ColumnDef<IWaterData>[]>(
    () => [
      {
        accessorKey: 'roomCode',
        header: 'Tên phòng',
      },
      {
        accessorKey: 'oldReading',
        header: 'Số cũ',
      },
      {
        accessorKey: 'newReading',
        header: 'Số mới',
      },
      {
        accessorKey: 'consumption',
        header: 'Tiêu thụ',
      },
      {
        accessorKey: 'unitPrice',
        header: 'Đơn giá',
        cell: ({ row }) => {
          const value = row.original.unitPrice || 0;
          return `${value.toLocaleString('vi-VN')} VND`;
        },
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
    []
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
              className="max-w-xs"
            />
          </div>

          {/* Bảng danh sách phòng */}
          {selectedHome && (
            <DataGrid
              columns={columns}
              data={waterData}
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