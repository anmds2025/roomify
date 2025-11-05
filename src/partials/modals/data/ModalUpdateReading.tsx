/* eslint-disable prettier/prettier */
import React, { useState, useCallback, useEffect, forwardRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeenIcon } from '@/components';
import { toast } from 'react-toastify';
import { da } from 'date-fns/locale';

export interface IElectricityData {
  id: string;
  roomCode: string;
  oldReading: number;
  newReading: number | null;
  consumption: number;
  unitPrice: number;
  total: number;
}

export interface UpdateElecReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: IElectricityData | null;
  onSave: (newReading: string, oldReading: string) => Promise<void>;
}

const ModalUpdateReading = forwardRef<HTMLDivElement, UpdateElecReadingModalProps>(
  ({ isOpen, onClose, data, onSave }, ref) => {
    const [newReading, setNewReading] = useState<string>('');
    const [oldReading, setOldReading] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
      if (data) {
        setOldReading(data?.oldReading ? String(data.oldReading) : '');
        setNewReading(data?.newReading ? String(data.newReading) : '');
      }
    }, [data]);
    // Reset when modal opens/closes
    useEffect(() => {
      if (!isOpen) {
        setOldReading('');
        setNewReading('');
        setError(false);
      }
    }, [isOpen]);

    const handleClose = useCallback(() => {
      setNewReading('');
      setError(false);
      onClose();
    }, [onClose]);

    const handleSubmit = useCallback(async () => {
      if (!oldReading || isNaN(Number(oldReading))) {
        setError(true);
        toast.error('Vui lòng nhập chỉ số hợp lệ');
        return;
      }
      if (!newReading || isNaN(Number(newReading))) {
        setError(true);
        toast.error('Vui lòng nhập chỉ số hợp lệ');
        return;
      }
      if (Number(newReading) <= (data?.oldReading ?? 0)) {
        setError(true);
        toast.error('Chỉ số mới phải lớn hơn chỉ số cũ');
        return;
      }

      setIsSubmitting(true);
      try {
        await onSave(newReading, oldReading);
        toast.success('Cập nhật chỉ số thành công');
        handleClose();
      } catch (error) {
        toast.error('Không thể cập nhật chỉ số điện');
      } finally {
        setIsSubmitting(false);
      }
    }, [newReading, data, onSave, handleClose]);

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-900 p-4 rounded-lg" ref={ref}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <KeenIcon icon="bolt" className="w-5 h-5 text-yellow-500" />
              Cập nhật chỉ số điện
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Tên phòng
              </Label>
              <div className="text-gray-900 dark:text-gray-100 font-semibold">
                {data?.roomCode || '-'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Chỉ số cũ <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="Nhập chỉ số cũ"
                  value={oldReading}
                  onChange={(e) => {
                    setOldReading(e.target.value);
                    setError(false);
                  }}
                  className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Chỉ số mới <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="Nhập chỉ số mới"
                  value={newReading}
                  onChange={(e) => {
                    setNewReading(e.target.value);
                    setError(false);
                  }}
                  className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <span className="font-medium">Đơn giá:</span> {data?.unitPrice?.toLocaleString() || 0} đ/kWh
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-70"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

ModalUpdateReading.displayName = 'ModalUpdateReading';
export default ModalUpdateReading;
