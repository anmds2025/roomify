import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@/components/modal';
import { KeenIcon } from '@/components';
import { IRoomData } from '@/pages/dashboards/light-sidebar/blocks/rooms/RoomsData';
import { toast } from 'react-toastify';
import { useMoneySlip } from '@/hooks';
import LoadingOverlay from './LoadingOverlay';
import { MoneySlipItem } from '@/api';

export interface TBulkMoneySlipEntry {
  waterOld: string;
  waterNew: string;
  numPeo: string;
  debt: string;
  elecOld: string;
  elecNew: string;
  nameB: string;
}

export interface TBulkMoneySlipItem {
  pk: string;
  waterOld: string;
  waterNew: string;
  numPeo: string;
  debt: string;
  elecOld: string;
  elecNew: string;
}

interface BulkMoneySlipModalProps {
  open: boolean;
  onClose: () => void;
  rooms: IRoomData[];
  onSave: (items: TBulkMoneySlipItem[]) => void;
}

const BulkMoneySlipModal: React.FC<BulkMoneySlipModalProps> = ({ open, onClose, rooms, onSave }) => {
  const initialEntries = useMemo(() => {
    const map: Record<string, TBulkMoneySlipEntry> = {};
    rooms.forEach((room) => {
      const pk = (room as any).pk || room._id?.$oid || String(room.room_name);
      map[pk] = {
        waterOld: (room as any)?.numWaterOld?.toString?.() || '',
        waterNew: '',
        numPeo: (room as any)?.numPeo?.toString?.() || '',
        debt: '0',
        elecOld: (room as any)?.numElectricityOld?.toString?.() || '',
        elecNew: '',
        nameB: (room as any)?.userB_name?.toString?.() || ''
      };
    });
    return map;
  }, [rooms]);
  const { createMoneySlipMany } = useMoneySlip();
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<Record<string, TBulkMoneySlipEntry>>({});
  const [selectedMonth, setSelectedMonth] = useState(''); 

  useEffect(() => {
    if (open) {
      setEntries(initialEntries);
      setSelectedMonth('')
    }
  }, [open, initialEntries]);

  const handleChange = useCallback((pk: string, field: keyof TBulkMoneySlipEntry, value: string) => {
    setEntries((prev) => ({
      ...prev,
      [pk]: { ...(prev[pk] || {} as TBulkMoneySlipEntry), [field]: value }
    }));
  }, []);

  const isValid = useMemo(() => {
    return rooms.every((room) => {
      const pk = (room as any).pk || room._id?.$oid as string;
      const e = entries[pk];
      if (!e) return false;

      // Chỉ kiểm tra waterNew nếu typeWater khác 'month'
      const waterValid = room.typeWater === 'month' ? true : Boolean(e.waterNew?.trim());
      const elecValid = Boolean(e.elecNew?.trim());

      return waterValid && elecValid;
    });
  }, [rooms, entries]);

  const handleUpdate = useCallback(async () => {
    if (!selectedMonth) {
      toast.error('Vui lòng điền tháng thu');
      return;
    }
    const list: MoneySlipItem[] = rooms.map((room) => {
      const pk = (room as any).pk || room._id?.$oid as string;
      const e = entries[pk] || { waterOld: '', waterNew: '', numPeo: '', debt: '', elecOld: '', elecNew: '' };
      return {
        pk,
        waterOld: e.waterOld,
        waterNew: e.waterNew,
        numPeo: e.numPeo,
        debt: e.debt,
        elecOld: e.elecOld,
        elecNew: e.elecNew,
        nameB: e.nameB
      };
    });
    const today = new Date().toLocaleDateString('vi-VN');
    try {
      toast.success('Đang tạo phiếu thu hàng loạt, bạn vui lòng chờ');
      setLoading(true);
      onClose()
      try {
        await createMoneySlipMany(today, selectedMonth, list); 
        toast.success('Tạo phiếu thu hàng loạt thành công!');
        onClose()
        window.location.reload();
      } catch (error) {
        toast.error('Có lỗi khi tạo phiếu thu hàng loạt');
      } finally {
        setLoading(false);
      }
    } catch (error) {
      toast.error('Có lỗi khi tạo phiếu thu hàng loạt');
    }
  }, [rooms, entries, onSave, onClose, selectedMonth]);

  return (
    <>
      <LoadingOverlay
        title='Đang tạo phiếu thu hàng loạt, vui lòng chờ...'
        visible={loading}
        maxSeconds={300}
        onTimeout={() => {
          setLoading(false);
        }}
      />
      <Modal open={open} onClose={onClose} zIndex={1400}>
        <ModalContent className="max-w-5xl w-full mx-4">
          <ModalHeader>
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold">Tạo phiếu thu hàng loạt</h3>
              <button onClick={onClose} className="btn btn-sm btn-icon btn-light">
                <KeenIcon icon="cross" />
              </button>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="mb-4">
              <label className="label">
                <span className="label-text">Nhập tháng</span>
              </label>
              <input
                type="number"
                className="input input-sm input-bordered"
                value={selectedMonth}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 1 && value <= 12) {
                    setSelectedMonth(value.toString());
                  }
                }}
                min={1}
                max={12}
              />
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              {rooms.map((room) => {
                const pk = (room as any).pk || room._id?.$oid as string;
                const entry = entries[pk] || { waterOld: '', waterNew: '', numPeo: '', debt: '', elecOld: '', elecNew: '', nameB: '' };
                return (
                  <div key={pk} className="mb-5 p-3 rounded-lg border border-gray-200">
                    <div className="font-medium mb-3">{room.room_name} - {room.home_name}</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="form-control">
                        <label className="label"><span className="label-text">Số người</span></label>
                        <input className="input input-sm input-bordered" value={entry.numPeo} onChange={(e) => handleChange(pk, 'numPeo', e.target.value)} />
                      </div>
                      <div className="form-control">
                        <label className="label"><span className="label-text">Tên người thuê</span></label>
                        <input className="input input-sm input-bordered" value={entry.nameB} onChange={(e) => handleChange(pk, 'nameB', e.target.value)} />
                      </div>
                      {room.typeWater != "month" && (
                        <>
                          <div className="form-control">
                            <label className="label"><span className="label-text">Nước cũ</span></label>
                            <input className="input input-sm input-bordered" value={entry.waterOld} onChange={(e) => handleChange(pk, 'waterOld', e.target.value)}/>
                          </div>
                          <div className="form-control">
                            <label className="label"><span className="label-text">Nước mới</span></label>
                            <input required className={`input input-sm input-bordered ${!entry.waterNew?.trim() ? 'input-error' : ''}`} value={entry.waterNew} onChange={(e) => handleChange(pk, 'waterNew', e.target.value)} />
                          </div>
                        </>
                      )}
                      <div className="form-control">
                        <label className="label"><span className="label-text">Điện cũ</span></label>
                        <input className="input input-sm input-bordered" value={entry.elecOld} onChange={(e) => handleChange(pk, 'elecOld', e.target.value)}/>
                      </div>
                      <div className="form-control">
                        <label className="label"><span className="label-text">Điện mới</span></label>
                        <input required className={`input input-sm input-bordered ${!entry.elecNew?.trim() ? 'input-error' : ''}`} value={entry.elecNew} onChange={(e) => handleChange(pk, 'elecNew', e.target.value)}/>
                      </div>
                      <div className="form-control md:col-span-3 col-span-2">
                        <label className="label"><span className="label-text">Nợ</span></label>
                        <input className="input input-sm input-bordered" value={entry.debt} onChange={(e) => handleChange(pk, 'debt', e.target.value)}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Đã chọn {rooms.length} phòng. Bấm "Tạo hàng loạt" để tạo
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn btn-sm btn-light" onClick={onClose}>Hủy</button>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleUpdate}
                disabled={!isValid}
              >
                Tạo hàng loạt
              </button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export { BulkMoneySlipModal };


