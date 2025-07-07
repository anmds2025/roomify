import { Fragment } from 'react';
import { Container } from '@/components/container';
import { AccountUserProfileContent } from '.';
import { useLayout } from '@/providers';

const AccountUserProfilePage = () => {
  const { currentLayout } = useLayout();

  return (
    <Fragment>  
      <Container>
      <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
          <div className="lg:col-span-3 w-full">
            <AccountUserProfileContent />
          </div>
      </div>
      </Container>
    </Fragment>
  );
};

export { AccountUserProfilePage };
