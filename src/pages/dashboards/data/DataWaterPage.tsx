import { Fragment } from 'react';
import { Link } from 'react-router-dom';

import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading } from '@/layouts/demo1/toolbar';
import { Rooms } from '../light-sidebar/blocks/rooms';
import { DataWater } from '../light-sidebar/blocks/data/DataWater';

const DataWaterPage = () => {
  return (
    <Fragment>  
      <Container width="fluid">
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
            <div className="lg:col-span-3">
                <DataWater />
            </div>
        </div>
      </Container>
    </Fragment>
  );
};

export { DataWaterPage }; 