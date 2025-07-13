import { Fragment, useState } from 'react';
import { Container } from '@/components/container';
import { Toolbar, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { PageNavbar } from '@/pages/account';
import { AccountUserProfileContent } from '.';
import { useLayout } from '@/providers';
import { ModalUpdateProfile } from '@/partials/modals/profile/ModalUpdateProfile';
import { useAuthContext } from '@/auth';

const AccountUserProfilePage = () => {
  const { currentLayout } = useLayout();
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const { currentUser } = useAuthContext();

  return (
    <Fragment>
      <PageNavbar />

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
            <AccountUserProfileContent />
          </div>
        </div>
      </Container>
      <ModalUpdateProfile
        open={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
        user={currentUser!}
      />
    </Fragment>
  );
};

export { AccountUserProfilePage };
