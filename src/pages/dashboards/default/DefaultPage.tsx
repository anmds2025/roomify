import { useLayout } from '@/providers';
import { LightSidebarPage, Demo2Page } from '../';

const DefaultPage = () => {
  const { currentLayout } = useLayout();

  if (currentLayout?.name === 'demo1-layout') {
    return <LightSidebarPage />;
  } else if (currentLayout?.name === 'demo2-layout') {
    return <Demo2Page />;
  } else {
    return <></>;
  }
};

export { DefaultPage };
