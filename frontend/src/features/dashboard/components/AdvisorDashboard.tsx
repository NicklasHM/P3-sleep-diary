import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import DashboardHeader from './DashboardHeader';
import DashboardCard from './DashboardCard';
import '../../../pages/Dashboard.css';

const AdvisorDashboard = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <DashboardHeader
        title={t('dashboard.advisor.title')}
        showLogout
        onLogout={logout}
        extraActions={<span>{t('dashboard.advisor.welcome', { fullName: user?.fullName || user?.username })}</span>}
      />

      <div className="container">
        <div className="dashboard-grid">
          <DashboardCard
            title={`👥 ${t('dashboard.advisor.citizens')}`}
            description={t('dashboard.advisor.citizensDescription')}
            buttonText={t('dashboard.advisor.citizensButton')}
            onClick={() => navigate('/advisor/users')}
          />

          <DashboardCard
            title={`🌅 ${t('dashboard.advisor.morningQuestionnaire')}`}
            description={t('dashboard.advisor.morningDescription')}
            buttonText={t('dashboard.advisor.morningButton')}
            onClick={() => navigate('/advisor/questionnaire/morning')}
          />

          <DashboardCard
            title={`🌙 ${t('dashboard.advisor.eveningQuestionnaire')}`}
            description={t('dashboard.advisor.eveningDescription')}
            buttonText={t('dashboard.advisor.eveningButton')}
            onClick={() => navigate('/advisor/questionnaire/evening')}
          />
        </div>
      </div>
    </div>
  );
};

export default AdvisorDashboard;

