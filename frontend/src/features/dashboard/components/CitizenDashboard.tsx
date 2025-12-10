import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import DashboardHeader from './DashboardHeader';
import DashboardCard from './DashboardCard';
import { useCitizenDashboard } from '../hooks/useCitizenDashboard';
import '../../../pages/Dashboard.css';

const CitizenDashboard = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { morningAnswered, eveningAnswered, loadingStatus } = useCitizenDashboard();

  return (
    <div className="dashboard">
      <DashboardHeader
        title={t('dashboard.citizen.title', { fullName: user?.fullName || user?.username })}
        showLogout
        onLogout={logout}
      />

      <div className="container">
        <div className="dashboard-grid">
          <DashboardCard
            title={`🌅 ${t('dashboard.citizen.morningQuestionnaire')}`}
            description={t('dashboard.citizen.morningDescription')}
            buttonText={t('dashboard.citizen.morningButton')}
            onClick={() => navigate('/citizen/questionnaire/morning')}
            disabled={morningAnswered === true}
          >
            {loadingStatus ? (
              <p>{t('common.loading')}</p>
            ) : morningAnswered ? (
              <p style={{ color: 'var(--text-secondary)', fontWeight: 'bold', marginTop: '1rem' }}>
                {t('dashboard.citizen.alreadyAnswered')}
              </p>
            ) : null}
          </DashboardCard>

          <DashboardCard
            title={`🌙 ${t('dashboard.citizen.eveningQuestionnaire')}`}
            description={t('dashboard.citizen.eveningDescription')}
            buttonText={t('dashboard.citizen.eveningButton')}
            onClick={() => navigate('/citizen/questionnaire/evening')}
            disabled={eveningAnswered === true}
          >
            {loadingStatus ? (
              <p>{t('common.loading')}</p>
            ) : eveningAnswered ? (
              <p style={{ color: 'var(--text-secondary)', fontWeight: 'bold', marginTop: '1rem' }}>
                {t('dashboard.citizen.alreadyAnswered')}
              </p>
            ) : null}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;

