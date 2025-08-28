import { Fragment } from 'react';

import { Container } from '@/components/container';
import { Finance } from '../light-sidebar/blocks/finance/Finance';

const FinancePage = () => {
  return (
    <Fragment>  
      <Container width="fluid">
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
            <div className="lg:col-span-3">
                <Finance />
            </div>
        </div>
      </Container>
    </Fragment>
  );
};

export { FinancePage }; 