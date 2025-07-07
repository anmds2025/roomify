import { Fragment } from 'react';

import { Container } from '@/components/container';

const InfoPage = () => {
  return (
    <Fragment>  
      <Container>
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
            <div className="lg:col-span-3">
            </div>
        </div>
      </Container>
    </Fragment>
  );
};

export { InfoPage };
