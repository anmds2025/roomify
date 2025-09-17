import { Fragment } from 'react';
import { Container } from '@/components/container';
import { Deposit } from '../light-sidebar/blocks/deposit/Deposit';

const DepositPage = () => {
  return (
    <Fragment>  
      <Container width="fluid">
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
            <div className="lg:col-span-3">
                <Deposit />
            </div>
        </div>
      </Container>
    </Fragment>
  );
};

export { DepositPage }; 