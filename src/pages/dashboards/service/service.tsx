import { Fragment } from 'react';

import { Container } from '@/components/container';
import { Service } from '../light-sidebar/blocks/service';

const ServicePage = () => {
  return (
    <Fragment>  
      <Container>
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
            <div className="lg:col-span-3">
                <Service />
            </div>
        </div>
      </Container>
    </Fragment>
  );
};

export { ServicePage };
