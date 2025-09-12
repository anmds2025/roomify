import { KeenIcon } from '@/components';
import {
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuSeparator,
  MenuArrow,
  MenuIcon
} from '@/components/menu';
import { ChangeEvent, Fragment, useState } from 'react';
import { toAbsoluteUrl } from '@/utils';
import { DropdownUserLanguages } from './DropdownUserLanguages';
import { Link } from 'react-router-dom';
import { useSettings } from '@/providers/SettingsProvider';
import { useAuthContext } from '@/auth';

const DropdownUser = ({ menuTtemRef = undefined }: { menuTtemRef?: React.RefObject<HTMLDivElement> }) => {
  const { settings, storeSettings } = useSettings();
  const { logout } = useAuthContext();
  const { currentUser } = useAuthContext();

  const handleThemeMode = (event: ChangeEvent<HTMLInputElement>) => {
    const newMode = event.target.checked ? 'dark' : 'light';
    storeSettings({
      mode: newMode
    });
    window.location.reload();
  };

  const handleSignOut = () => {
    storeSettings({
      mode: 'light'
    });
    logout()
  };

  const buildHeader = () => {
    return (
      <div className="flex items-center justify-between px-5 py-1.5 gap-1.5">
        <div className="flex items-center gap-2">
          <img
            className="size-9 rounded-full border-2 border-success"
            src={currentUser?.avatar ?? "https://my-bucket-kiai-image.s3.ap-southeast-1.amazonaws.com/uploads/user-default.png"}
            alt=""
          />
          <div className="flex flex-col gap-1.5">
            <Link
              to="/account/home/user-profile"
              className="text-sm text-gray-800 hover:text-primary font-semibold leading-none"
            >
              {currentUser?.fullname}
            </Link>
            <a
              href={`mailto:${currentUser?.email}`}
              className="text-xs text-gray-600 hover:text-primary font-medium leading-none"
            >
              {currentUser?.email}
            </a>
          </div>
        </div>
      </div>
    );
  };

  const buildMenu = () => {
    return (
      <Fragment>
        <MenuSeparator />
        <div className="flex flex-col">
          <MenuItem>
            <MenuLink path="/account/home/user-profile">
              <MenuIcon>
                <KeenIcon icon="profile-circle" />
              </MenuIcon>
              <MenuTitle>Hồ sơ cá nhân</MenuTitle>
            </MenuLink>
          </MenuItem>
          {/* <MenuItem>
            <MenuLink path="/account/home/settings-sidebar">
              <MenuIcon>
                <KeenIcon icon="setting-2" />
              </MenuIcon>
              <MenuTitle>Cài đặt</MenuTitle>
            </MenuLink>
          </MenuItem> */}
          {/* <MenuItem>
            <MenuLink path="/account/billing/basic">
              <MenuIcon>
                <KeenIcon icon="card" />
              </MenuIcon>
              <MenuTitle>Thanh toán</MenuTitle>
            </MenuLink>
          </MenuItem> */}
          <MenuSeparator />
          {/* <MenuItem>
            <MenuLink path="/help">
              <MenuIcon>
                <KeenIcon icon="question" />
              </MenuIcon>
              <MenuTitle>Trợ giúp</MenuTitle>
            </MenuLink>
          </MenuItem> */}
        </div>
      </Fragment>
    );
  };

  const buildFooter = () => {
    return (
      <div className="flex flex-col">
        <div className="menu-item mb-0.5">
          <div className="menu-link">
            <span className="menu-icon">
              <KeenIcon icon="moon" />
            </span>
            <span className="menu-title">Dark Mode</span>
            <label className="switch switch-sm">
              <input
                name="theme"
                type="checkbox"
                checked={settings.mode === 'dark'}
                onChange={handleThemeMode}
                value="1"
              />
            </label>
          </div>
        </div>

        <div className="menu-item px-4 py-1.5">
          <div onClick={handleSignOut} className="btn btn-sm btn-light justify-center">
            Sign Out
          </div>
        </div>
      </div>
    );
  };

  return (
    <MenuSub
      className="menu-default light:border-gray-300 w-[200px] md:w-[250px]"
      rootClassName="p-0"
    >
      {buildHeader()}
      {buildMenu()}
      {buildFooter()}
    </MenuSub>
  );
};

export { DropdownUser };
