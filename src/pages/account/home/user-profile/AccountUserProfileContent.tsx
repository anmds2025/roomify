import { RecentUploads } from '@/pages/public-profile/profiles/default';
import {
  BasicSettings,
  CalendarAccounts,
  CommunityBadges,
  Connections,
  PersonalInfo,
  StartNow,
  Work
} from './blocks';

const AccountUserProfileContent = () => {
  return (
    <div className="grid grid-cols-1 gap-5 lg:gap-7.5">
      <div className="col-span-1">
        <div className="grid gap-5 lg:gap-7.5">
          <PersonalInfo />
        </div>
      </div>
    </div>
  );
};

export { AccountUserProfileContent };
