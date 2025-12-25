import { Fragment, useCallback, useEffect, useState } from 'react';
import { Container } from '@/components/container';
import { Toolbar, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { PageNavbar } from '@/pages/account';
import { AccountUserProfileContent } from '.';
import { useLayout } from '@/providers';
import { ModalUpdateProfile } from '@/partials/modals/profile/ModalUpdateProfile';
import { useAuthContext } from '@/auth';
import { useUser } from '@/hooks/useUser';
import { IUserData } from '@/pages/dashboards/light-sidebar';

const AccountUserProfilePage = () => {
  const { currentLayout } = useLayout();
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [user, setUser] = useState<IUserData>({} as IUserData);
  const { getCurrentUser } = useUser();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data || {} as IUserData); 
    } catch (error) {
      console.error('Lỗi khi lấy user:', error);
    }
  };

  const handleDoneUpdate = () => {
    setOpenProfileModal(false)
    fetchUser()
  }

  return (
    <Fragment>
      {currentLayout?.name === 'demo1-layout' && (
        <Container width="fluid">
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle text="Thông tin cá nhân" />
              <ToolbarDescription>
                Quản lý thông tin cá nhân và cài đặt tài khoản
              </ToolbarDescription>
            </ToolbarHeading>
          </Toolbar>
        </Container>
      )}

      <Container width="fluid">
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
          <div className="lg:col-span-3 w-full">
            <AccountUserProfileContent user={user} onDone={() => handleDoneUpdate()}/>
          </div>
        </div>
      </Container>
      <ModalUpdateProfile
        open={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
        user={user}
        onDone={() => handleDoneUpdate()}
      />
    </Fragment>
  );
};

export { AccountUserProfilePage };
