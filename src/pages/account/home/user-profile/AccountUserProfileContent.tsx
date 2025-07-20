import { UserModel } from '@/auth';
import { PersonalInfo } from './blocks';

interface AccountUserProfileContentProps {
  user: UserModel;
  onDone: () => void
}

const AccountUserProfileContent: React.FC<AccountUserProfileContentProps> = ({ user, onDone }) => {
  return (
    <div className="grid grid-cols-1 gap-5 lg:gap-7.5">
      <div className="col-span-1">
        <div className="grid gap-5 lg:gap-7.5">
          <PersonalInfo user={user} onDone={onDone}/>
        </div>
      </div>
    </div>
  );
};

export { AccountUserProfileContent };
