import { useResponsive, useScrollPosition } from '@/hooks';
import {
  AdvancedSettingsAddress,
  AdvancedSettingsAppearance,
  AdvancedSettingsNotifications,
  AdvancedSettingsPreferences,
  AuthEmail,
  AuthPassword,
  AuthSingleSingOn,
  AuthSocialSignIn,
  AuthTwoFactor,
  BasicSettings,
  DeleteAccount,
  ExternalServicesIntegrations,
  ExternalServicesManageApi
} from './blocks';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { Scrollspy } from '@/components/scrollspy/Scrollspy';
import { AccountSettingsSidebar } from '@/pages/account/home/settings-sidebar';

const AccountSettingsSidebarContent = () => {
  const desktopMode = useResponsive('up', 'lg');

  const scrollPosition = useScrollPosition();
  const [sidebarSticky, setSidebarSticky] = useState(false);

  const navBar = useRef<HTMLDivElement | null>(null);
  const parentRef = useRef(document);

  useEffect(() => {
    if (scrollPosition > 200) {
      setSidebarSticky(true);
    } else {
      setSidebarSticky(false);
    }
  }, [scrollPosition]);

  return (
    <div className="flex grow gap-5 lg:gap-7.5">
      {desktopMode && (
        <div className="w-[230px] shrink-0">
          <div
            ref={navBar}
            className={clsx(
              'w-[230px]',
              sidebarSticky && 'fixed top-[calc(var(--tw-header-height)+1.875rem)] z-10 left-auto'
            )}
          >
            <Scrollspy offset={110} targetRef={parentRef}>
              <AccountSettingsSidebar />
            </Scrollspy>
          </div>
        </div>
      )}

      <div className="flex flex-col items-stretch grow gap-5 lg:gap-7.5">
        <BasicSettings />

        <AuthEmail />

        <AuthPassword />

        <AuthSocialSignIn />

        <AuthSingleSingOn />

        <AuthTwoFactor />

        <AdvancedSettingsPreferences />

        <AdvancedSettingsAppearance title={''} />

        <AdvancedSettingsNotifications />

        <AdvancedSettingsAddress />

        <ExternalServicesManageApi title={''} switch={false} />

        <ExternalServicesIntegrations />

        <DeleteAccount />
      </div>
    </div>
  );
};

export { AccountSettingsSidebarContent };
