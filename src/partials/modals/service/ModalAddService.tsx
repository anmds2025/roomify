import { forwardRef, useState } from 'react';
import { Modal, ModalContent, ModalBody, ModalHeader } from '@/components/modal';
import { KeenIcon } from '@/components';
interface ModalAddProps {
  open: boolean;
  onClose: () => void;
}

const ModalAddService = forwardRef<HTMLDivElement, ModalAddProps>(({ open, onClose }) => {
  const [valueName, setValueName] = useState("");
  const [valueRoute, setValueRoute] = useState("");
  const [valuePrice, setValuePrice] = useState("");

  const handleClose = () => {
    setValueName('');
    setValueRoute('');
    setValuePrice('');
    setValueDescribe('');
    onClose()
  };

  const [valueDescribe, setValueDescribe] = useState('');
  const maxLength = 200;

  const handleChangeDescribe = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setValueDescribe(value);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalContent className="max-w-[600px] top-[15%]">
        <ModalHeader className="py-4 px-5">
          <div className='text-[#1A2B49] text-lg font-semibold'>Thêm dịch vụ</div>
          <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="py-4 px-5">
          <div className='flex gap-2 flex-col'>
            <div className='text-sm text-[#1A2B49] font-medium'>Tên dịch vụ</div>
            <div className="input w-full text-base">
              <input
                style={{color: '#1A2B49', padding: '0.5rem 0'}}
                type="text"
                placeholder="Tên dịch vụ"
                value={valueName}
                onChange={(e) => setValueName(e.target.value)} 
              />
            </div>
          </div>
          <div className='flex gap-4 mt-2'>
            <div className='flex gap-2 flex-col'>
              <div className='text-sm text-[#1A2B49] font-medium'>Lộ trình</div>
              <div className="input w-[163px] text-base">
                <input
                  style={{color: '#1A2B49', padding: '0.5rem 0'}}
                  type="text"
                  placeholder="Lộ trình"
                  value={valueRoute}
                  onChange={(e) => setValueRoute(e.target.value)} 
                />
              </div>
            </div>

            <div className='flex gap-2 flex-col w-full'>
              <div className='text-sm text-[#1A2B49] font-medium'>Giá tiền</div>
              <div className="input w-full text-base">
                <input
                  style={{color: '#1A2B49', padding: '0.5rem 0'}}
                  type="text"
                  placeholder="Giá tiền"
                  value={valuePrice}
                  onChange={(e) => setValuePrice(e.target.value)} 
                />
              </div>
            </div>
          </div>

          <div className='flex gap-2 flex-col mt-2'>
            <div className='text-sm text-[#1A2B49] font-medium'>Mô tả</div>
            <div className="textarea w-full text-base relative">
              <textarea
                value={valueDescribe}
                onChange={handleChangeDescribe}
                style={{
                  color: '#878787',
                  width: '100%',
                  height: '100%',
                  border: '0px solid #ccc', 
                  outline: 'none', 
                  fontWeight: 400
                }}
                onFocus={(e) => e.target.style.border = '0px solid transparent'} 
                onBlur={(e) => e.target.style.border = '0px solid #ccc'}
              />
              <div className="absolute bottom-2 right-6 text-base text-[#878787] font-[400]">
                {valueDescribe.length}/{maxLength}
              </div>
            </div>
          </div>
          
          <div className='w-full flex gap-2 justify-end pt-4'>
            <button onClick={handleClose} className='py-2 px-3 border border-[#F4F4F4] rounded text-base font-bold text-[#1A2B49]'>Hủy bỏ</button>
            <button onClick={handleClose} className='py-2 px-3 border border-[#F4F4F4] rounded text-base font-bold bg-[#404041] text-white'>Thêm</button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export { ModalAddService };
