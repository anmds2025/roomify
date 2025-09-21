import { Fragment } from 'react';

import { Container } from '@/components/container';
import { Expense } from '../light-sidebar/blocks/finance/Expense';
import { Interior } from '../light-sidebar/blocks/interior/Interior';

const InteriorPage = () => {
  return (
    <Fragment>  
      <Container width="fluid">
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
            <div className="lg:col-span-3">
                <Interior />
            </div>
        </div>
      </Container>
    </Fragment>
  );
};

export { InteriorPage }; 