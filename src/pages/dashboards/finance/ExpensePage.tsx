import { Fragment } from 'react';

import { Container } from '@/components/container';
import { Finance } from '../light-sidebar/blocks/finance/Finance';
import { Expense } from '../light-sidebar/blocks/finance/Expense';

const ExpensePage = () => {
  return (
    <Fragment>  
      <Container width="fluid">
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
            <div className="lg:col-span-3">
                <Expense />
            </div>
        </div>
      </Container>
    </Fragment>
  );
};

export { ExpensePage }; 