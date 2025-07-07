import { Fragment } from 'react';

import { Container } from '@/components/container';
import { Service } from '../light-sidebar/blocks/service';
import { Profile } from '../light-sidebar/blocks/users/Profile';

const ProfilePage = () => {
  return (
    <Fragment>  
        <Container>
            <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
                <div className="lg:col-span-3">
                    <Profile />
                </div>
            </div>
        </Container>
    </Fragment>
  );
};

export { ProfilePage };
