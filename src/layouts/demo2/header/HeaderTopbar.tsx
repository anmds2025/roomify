import { useRef } from 'react';
import { KeenIcon } from '@/components/keenicons';
import { toAbsoluteUrl } from '@/utils';
import { Menu, MenuItem, MenuToggle } from '@/components';
import { DropdownUser } from '@/partials/dropdowns/user';
import { DropdownNotifications } from '@/partials/dropdowns/notifications';
import { DropdownChat } from '@/partials/dropdowns/chat';
import { useAuthContext } from '@/auth';

const HeaderTopbar = () => {
  const itemChatRef = useRef<any>(null);
  const itemNotificationsRef = useRef<any>(null);
  const itemUserRef = useRef<any>(null);
  const { currentUser } = useAuthContext();

  const handleDropdownChatShow = () => {
    window.dispatchEvent(new Event('resize'));
  };

  return (
    <div className="flex items-center gap-3.5">
      <Menu className="items-stretch">
        <MenuItem
          ref={itemNotificationsRef}
          toggle="dropdown"
          trigger="click"
          dropdownProps={{
            placement: 'bottom-end',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [115, 10] // [skid, distance]
                }
              }
            ]
          }}
        >
          <MenuToggle>
            <div className="btn btn-icon btn-icon-lg size-9 rounded-full hover:bg-gray-200 dropdown-open:bg-gray-200 text-gray-600">
              <KeenIcon icon="notification-on" />
            </div>
          </MenuToggle>
          {DropdownNotifications({ menuTtemRef: itemNotificationsRef })}
        </MenuItem>
      </Menu>

      <Menu className="items-stretch">
        <MenuItem
          ref={itemChatRef}
          onShow={handleDropdownChatShow}
          toggle="dropdown"
          trigger="click"
          dropdownProps={{
            placement: 'bottom-end',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [75, 10] // [skid, distance]
                }
              }
            ]
          }}
        >
          <MenuToggle>
            <div className="btn btn-icon btn-icon-lg size-9 rounded-full hover:bg-gray-200 dropdown-open:bg-gray-200 text-gray-600">
              <KeenIcon icon="messages" />
            </div>
          </MenuToggle>

          {DropdownChat({ menuTtemRef: itemChatRef })}
        </MenuItem>
      </Menu>

      <Menu className="items-stretch -me-2">
        <MenuItem
          ref={itemUserRef}
          toggle="dropdown"
          trigger="click"
          dropdownProps={{
            placement: 'bottom-end',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [20, 10] // [skid, distance]
                }
              }
            ]
          }}
        >
          <MenuToggle>
            <div className="flex items-center gap-2">
              <img
                className="size-8 rounded-full border-2 border-success"
                src={"https://my-bucket-kiai-image.s3.ap-southeast-1.amazonaws.com/uploads/user-default.png"}
                alt=""
              />
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-800 font-semibold leading-none">
                  {currentUser?.fullname}
                </span>
                <span className="text-xs text-gray-600 font-medium leading-none">
                  {currentUser?.level}
                </span>
              </div>
            </div>
          </MenuToggle>
          {DropdownUser({ menuTtemRef: itemUserRef })}
        </MenuItem>
      </Menu>
    </div>
  );
};

export { HeaderTopbar };
