import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import { ROUTES } from '../constants/routes';
import LoginPage from '../pages/LoginPage';
import CitizenDashboard from '../pages/CitizenDashboard';
import AdvisorDashboard from '../pages/AdvisorDashboard';
import QuestionnaireWizard from '../features/questionnaireWizard/components/QuestionnaireWizard';
import QuestionnaireReview from '../pages/QuestionnaireReview';
import AdvisorQuestionnaireEditor from '../pages/AdvisorQuestionnaireEditor';
import AdvisorUserOverview from '../pages/AdvisorUserOverview';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route
        path={ROUTES.CITIZEN_DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={['BORGER']}>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${ROUTES.CITIZEN_QUESTIONNAIRE}/:type`}
        element={
          <ProtectedRoute allowedRoles={['BORGER']}>
            <QuestionnaireWizard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CITIZEN_QUESTIONNAIRE_REVIEW}
        element={
          <ProtectedRoute allowedRoles={['BORGER']}>
            <QuestionnaireReview />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADVISOR_DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={['RÅDGIVER']}>
            <AdvisorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADVISOR_USERS}
        element={
          <ProtectedRoute allowedRoles={['RÅDGIVER']}>
            <AdvisorUserOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${ROUTES.ADVISOR_QUESTIONNAIRE}/:type`}
        element={
          <ProtectedRoute allowedRoles={['RÅDGIVER']}>
            <AdvisorQuestionnaireEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ROOT}
        element={
          user?.role === 'BORGER' ? (
            <Navigate to={ROUTES.CITIZEN_DASHBOARD} replace />
          ) : user?.role === 'RÅDGIVER' ? (
            <Navigate to={ROUTES.ADVISOR_DASHBOARD} replace />
          ) : (
            <Navigate to={ROUTES.LOGIN} replace />
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes;

