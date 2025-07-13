import { Fragment } from 'react';
import { Link } from 'react-router-dom';

import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading } from '@/layouts/demo1/toolbar';
import { Users } from '../light-sidebar';

const UsersPage = () => {
  return (
    <Fragment>  
      <Container width="fluid">
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
            <div className="lg:col-span-3">
                <Users />
            </div>
        </div>
      </Container>
    </Fragment>
  );
};

export { UsersPage };
