import { ReactElement, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { DefaultPage, DarkSidebarPage } from '@/pages/dashboards';
import {
  ProfileActivityPage,
  ProfileBloggerPage,
  CampaignsCardPage,
  CampaignsListPage,
  ProjectColumn2Page,
  ProjectColumn3Page,
  ProfileCompanyPage,
  ProfileCreatorPage,
  ProfileCRMPage,
  ProfileDefaultPage,
  ProfileEmptyPage,
  ProfileFeedsPage,
  ProfileGamerPage,
  ProfileModalPage,
  ProfileNetworkPage,
  ProfileNFTPage,
  ProfilePlainPage,
  ProfileTeamsPage,
  ProfileWorksPage
} from '@/pages/public-profile';
import {
  AccountActivityPage,
  AccountAllowedIPAddressesPage,
  AccountApiKeysPage,
  AccountAppearancePage,
  AccountBackupAndRecoveryPage,
  AccountBasicPage,
  AccountCompanyProfilePage,
  AccountCurrentSessionsPage,
  AccountDeviceManagementPage,
  AccountEnterprisePage,
  AccountGetStartedPage,
  AccountHistoryPage,
  AccountImportMembersPage,
  AccountIntegrationsPage,
  AccountInviteAFriendPage,
  AccountMembersStarterPage,
  AccountNotificationsPage,
  AccountOverviewPage,
  AccountPermissionsCheckPage,
  AccountPermissionsTogglePage,
  AccountPlansPage,
  AccountPrivacySettingsPage,
  AccountRolesPage,
  AccountSecurityGetStartedPage,
  AccountSecurityLogPage,
  AccountSettingsEnterprisePage,
  AccountSettingsModalPage,
  AccountSettingsPlainPage,
  AccountSettingsSidebarPage,
  AccountTeamInfoPage,
  AccountTeamMembersPage,
  AccountTeamsPage,
  AccountTeamsStarterPage,
  AccountUserProfilePage
} from '@/pages/account';
import {
  NetworkAppRosterPage,
  NetworkMarketAuthorsPage,
  NetworkAuthorPage,
  NetworkGetStartedPage,
  NetworkMiniCardsPage,
  NetworkNFTPage,
  NetworkSocialPage,
  NetworkUserCardsTeamCrewPage,
  NetworkSaasUsersPage,
  NetworkStoreClientsPage,
  NetworkUserTableTeamCrewPage,
  NetworkVisitorsPage
} from '@/pages/network';

import { AuthPage, useAuthContext } from '../auth';
import { RequireAuth } from '../auth/RequireAuth';
import { Demo1Layout, DemoLayout } from '../layouts/demo1';
import { ErrorsRouting } from '../errors';
import { useLoaders } from '../providers/LoadersProvider';
import { AuthenticationWelcomeMessagePage } from '@/pages/authentication/welcome-message/AuthenticationWelcomeMessagePage';
import { AuthenticationAccountDeactivatedPage } from '@/pages/authentication/account-deactivated/AuthenticationAccountDeactivatedPage';
import { AuthenticationGetStartedPage } from '@/pages/authentication/get-started/AuthenticationGetStartedPage';
import { toast } from 'react-toastify';
import { UsersPage } from '@/pages/dashboards/users/UsersPage';
import { FinancePage } from '@/pages/dashboards/finance/FinancePage';
import { MoneySlipPage } from '@/pages/dashboards/money-slip/MoneySlipPage';
import { HomesPage } from '@/pages/dashboards/homes/HomesPage';
import { RoomPage } from '@/pages/dashboards/rooms/RoomPage';
import { ContractSigningPage } from '@/pages/contract-signing/ContractSigningPage';
import { ExpensePage } from '@/pages/dashboards/finance/ExpensePage';
import { DepositPage } from '@/pages/dashboards/deposit/DepositPage';
import { InteriorPage } from '@/pages/dashboards/interior/InteriorPage';
import { DataElectricity } from '@/pages/dashboards/light-sidebar/blocks/data/DataElectricity';
import { DataElectricityPage } from '@/pages/dashboards/data/DataElectricityPage';
import { DataWaterPage } from '@/pages/dashboards/data/DataWaterPage';

const AppRouting = (): ReactElement => {
  const { setProgressBarLoader } = useLoaders();
  const { verify, currentUser, logout, setCurrentUser } = useAuthContext();
  const [previousLocation, setPreviousLocation] = useState('');
  const location = useLocation();
  const path = location.pathname.trim();

  const init = async () => {
    setProgressBarLoader(true);
    if (!currentUser) {
      const userLocalStorage = localStorage.getItem('user');
      if (userLocalStorage) {
        const user = JSON.parse(userLocalStorage);
        setCurrentUser(user); 
      }
      else
      {
        console.error('User is not authenticated or session expired.');
        logout();
        return; 
      }
    }
    if (Array.isArray(currentUser?.level)) {
      toast.error("Bạn chưa được cấp quyền, vui lòng thông báo đến Admin")
      logout(); 
    }

    try {
      if (verify) {
        await verify();
      }
    } catch {
      throw new Error('Something went wrong!');
    } finally {
      setPreviousLocation(path);
      if (path === previousLocation) {
        setPreviousLocation('');
      }
    }
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    setProgressBarLoader(false);

    // Scroll to page top on route change if URL does not contain a hash
    if (!CSS.escape(window.location.hash)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previousLocation]);

  interface RedirectToFirstAllowedPageProps {
    level: string;
  }
  
  const RedirectToFirstAllowedPage: React.FC<RedirectToFirstAllowedPageProps> = ({ level }) => {
    switch (level) {
      case 'Root':
        return <Navigate to="/users" replace />;
      case 'Admin':
        return <Navigate to="/homes" replace />;
      default:
        return <Navigate to="/homes" replace />;
    }
  };
  return (
    <Routes>
       <Route element={<RequireAuth allowedLelves={['Root', 'Admin', 'Customer']} />}>
        <Route element={<Demo1Layout />}>
          <Route
            path="/"
            element={<RedirectToFirstAllowedPage level={currentUser?.level || ""} />}
          />

          <Route element={<RequireAuth allowedLelves={['Root']} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>

          <Route element={<RequireAuth allowedLelves={['Root', 'Admin', 'Customer']} />}>
            <Route path="/homes" element={<HomesPage />} />
            <Route path="/deposit" element={<DepositPage />} />
          </Route>

          <Route element={<RequireAuth allowedLelves={['Root', 'Admin', 'Customer']} />}>
            <Route path="/data-electricity" element={<DataElectricityPage />} />
            <Route path="/data-water" element={<DataWaterPage />} />
          </Route>

          <Route element={<RequireAuth allowedLelves={['Root', 'Admin', 'Customer']} />}>
            <Route path="/rooms" element={<RoomPage />} />
            <Route path="/interior" element={<InteriorPage />} />
          </Route>

          <Route element={<RequireAuth allowedLelves={['Root', 'Admin', 'Customer']} />}>
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/expense" element={<ExpensePage />} />
            <Route path="/money-slips" element={<MoneySlipPage />} />
          </Route>

          <Route path="/account/home/user-profile" element={<AccountUserProfilePage />} />
          <Route path="/profile" element={<AccountUserProfilePage />} />
          
          {/* <Route element={<RequireAuth allowedRoles={[]} />}>
            <Route path="/info" element={<InfoPage />} />
            <Route path="/link" element={<LinkPage />} />
            <Route path="/service" element={<ServicePage />} />
            <Route path="/detail-service" element={<DetailService />} />
          </Route> */}


          <Route path="/dark-sidebar" element={<DarkSidebarPage />} />
          <Route path="/public-profile/profiles/default" element={<ProfileDefaultPage />} />
          <Route path="/public-profile/profiles/creator" element={<ProfileCreatorPage />} />
          <Route path="/public-profile/profiles/company" element={<ProfileCompanyPage />} />
          <Route path="/public-profile/profiles/nft" element={<ProfileNFTPage />} />
          <Route path="/public-profile/profiles/blogger" element={<ProfileBloggerPage />} />
          <Route path="/public-profile/profiles/crm" element={<ProfileCRMPage />} />
          <Route path="/public-profile/profiles/gamer" element={<ProfileGamerPage />} />
          <Route path="/public-profile/profiles/feeds" element={<ProfileFeedsPage />} />
          <Route path="/public-profile/profiles/plain" element={<ProfilePlainPage />} />
          <Route path="/public-profile/profiles/modal" element={<ProfileModalPage />} />
          <Route path="/public-profile/projects/3-columns" element={<ProjectColumn3Page />} />
          <Route path="/public-profile/projects/2-columns" element={<ProjectColumn2Page />} />
          <Route path="/public-profile/works" element={<ProfileWorksPage />} />
          <Route path="/public-profile/teams" element={<ProfileTeamsPage />} />
          <Route path="/public-profile/network" element={<ProfileNetworkPage />} />
          <Route path="/public-profile/activity" element={<ProfileActivityPage />} />
          <Route path="/public-profile/campaigns/card" element={<CampaignsCardPage />} />
          <Route path="/public-profile/campaigns/list" element={<CampaignsListPage />} />
          <Route path="/public-profile/empty" element={<ProfileEmptyPage />} />
          <Route path="/account/home/get-started" element={<AccountGetStartedPage />} />
          <Route path="/account/home/company-profile" element={<AccountCompanyProfilePage />} />
          <Route path="/account/home/settings-sidebar" element={<AccountSettingsSidebarPage />} />
          <Route
            path="/account/home/settings-enterprise"
            element={<AccountSettingsEnterprisePage />}
          />
          <Route path="/account/home/settings-plain" element={<AccountSettingsPlainPage />} />
          <Route path="/account/home/settings-modal" element={<AccountSettingsModalPage />} />
          <Route path="/account/billing/basic" element={<AccountBasicPage />} />
          <Route path="/account/billing/enterprise" element={<AccountEnterprisePage />} />
          <Route path="/account/billing/plans" element={<AccountPlansPage />} />
          <Route path="/account/billing/history" element={<AccountHistoryPage />} />
          <Route path="/account/security/get-started" element={<AccountSecurityGetStartedPage />} />
          <Route path="/account/security/overview" element={<AccountOverviewPage />} />
          <Route
            path="/account/security/allowed-ip-addresses"
            element={<AccountAllowedIPAddressesPage />}
          />
          <Route
            path="/account/security/privacy-settings"
            element={<AccountPrivacySettingsPage />}
          />
          <Route
            path="/account/security/device-management"
            element={<AccountDeviceManagementPage />}
          />
          <Route
            path="/account/security/backup-and-recovery"
            element={<AccountBackupAndRecoveryPage />}
          />
          <Route
            path="/account/security/current-sessions"
            element={<AccountCurrentSessionsPage />}
          />
          <Route path="/account/security/security-log" element={<AccountSecurityLogPage />} />
          <Route path="/account/members/team-starter" element={<AccountTeamsStarterPage />} />
          <Route path="/account/members/teams" element={<AccountTeamsPage />} />
          <Route path="/account/members/team-info" element={<AccountTeamInfoPage />} />
          <Route path="/account/members/members-starter" element={<AccountMembersStarterPage />} />
          <Route path="/account/members/team-members" element={<AccountTeamMembersPage />} />
          <Route path="/account/members/import-members" element={<AccountImportMembersPage />} />
          <Route path="/account/members/roles" element={<AccountRolesPage />} />
          <Route
            path="/account/members/permissions-toggler"
            element={<AccountPermissionsTogglePage />}
          />
          <Route
            path="/account/members/permissions-check"
            element={<AccountPermissionsCheckPage />}
          />
          <Route path="/account/integrations" element={<AccountIntegrationsPage />} />
          <Route path="/account/notifications" element={<AccountNotificationsPage />} />
          <Route path="/account/api-keys" element={<AccountApiKeysPage />} />
          <Route path="/account/members/appearance" element={<AccountAppearancePage />} />
          <Route path="/account/members/invite-a-friend" element={<AccountInviteAFriendPage />} />
          <Route path="/account/activity" element={<AccountActivityPage />} />
          <Route path="/network/get-started" element={<NetworkGetStartedPage />} />
          <Route path="/network/user-cards/mini-cards" element={<NetworkMiniCardsPage />} />
          <Route path="/network/user-cards/team-crew" element={<NetworkUserCardsTeamCrewPage />} />
          <Route path="/network/user-cards/author" element={<NetworkAuthorPage />} />
          <Route path="/network/user-cards/nft" element={<NetworkNFTPage />} />
          <Route path="/network/user-cards/social" element={<NetworkSocialPage />} />
          <Route path="/network/user-table/team-crew" element={<NetworkUserTableTeamCrewPage />} />
          <Route path="/network/user-table/app-roster" element={<NetworkAppRosterPage />} />
          <Route path="/network/user-table/market-authors" element={<NetworkMarketAuthorsPage />} />
          <Route path="/network/user-table/saas-users" element={<NetworkSaasUsersPage />} />
          <Route path="/network/user-table/store-clients" element={<NetworkStoreClientsPage />} />
          <Route path="/network/user-table/visitors" element={<NetworkVisitorsPage />} />
          <Route path="/auth/welcome-message" element={<AuthenticationWelcomeMessagePage />} />
          <Route
            path="/auth/account-deactivated"
            element={<AuthenticationAccountDeactivatedPage />}
          />
          <Route path="/authentication/get-started" element={<AuthenticationGetStartedPage />} />        </Route>
      </Route>
      
      {/* Public contract signing page for customers - no auth required */}
              <Route path="/contract-signing/:contractId/:roomId" element={<ContractSigningPage />} />
      
      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
      <Route path="/default" element={<DemoLayout />} />
    </Routes>
  );
};

export { AppRouting };
