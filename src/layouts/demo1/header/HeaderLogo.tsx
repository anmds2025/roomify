import { Link } from 'react-router-dom';
import { KeenIcon } from '@/components/keenicons';
import { toAbsoluteUrl } from '@/utils';

import { useDemo1Layout } from '../';

const HeaderLogo = () => {
  const { setMobileSidebarOpen, setMobileMegaMenuOpen, megaMenuEnabled } = useDemo1Layout();

  const handleSidebarOpen = () => {
    setMobileSidebarOpen(true);
  };

  const handleMegaMenuOpen = () => {
    setMobileMegaMenuOpen(true);
  };

  return (
    <div className="flex gap-1 lg:hidden items-center">
      <div className="flex items-center">
        <button
          type="button"
          className="btn btn-icon btn-light btn-clear btn-sm"
          onClick={handleSidebarOpen}
        >
          <KeenIcon icon="menu" />
        </button>

        {/* {megaMenuEnabled && (
          <button
            type="button"
            className="btn btn-icon btn-light btn-clear btn-sm"
            onClick={handleMegaMenuOpen}
          >
            <KeenIcon icon="burger-menu-2" />
          </button>
        )} */}
      </div>
    </div>
  );
};

export { HeaderLogo };
