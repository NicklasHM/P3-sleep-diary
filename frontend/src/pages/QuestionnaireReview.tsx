import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useQuestionnaireReview } from '../features/questionnaireReview/useQuestionnaireReview';
import ReviewHeader from '../features/questionnaireReview/components/ReviewHeader';
import ReviewQuestionCard from '../features/questionnaireReview/components/ReviewQuestionCard';
import './QuestionnaireReview.css';

const QuestionnaireReview = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  const reviewData = useQuestionnaireReview();

  if (!reviewData.isValid) {
    return null;
  }

  const {
    answers,
    type,
    allQuestions,
    relevantQuestions,
    saving,
    error,
    handleEdit,
    handleSaveAndSubmit,
    handleBack,
  } = reviewData;

  return (
    <div className="review-container">
      <ReviewHeader
        t={t}
        theme={theme}
        toggleTheme={toggleTheme}
        type={type}
        onBack={handleBack}
      />

      <div className="review-content">
        <div className="review-intro">
          <p>{t('review.intro')}</p>
        </div>

        <div className="review-questions">
          {relevantQuestions.map((question, index) => (
            <ReviewQuestionCard
              key={question.id}
              t={t}
              language={language}
              question={question}
              answer={answers[question.id]}
              index={index}
              allQuestions={allQuestions}
              answers={answers}
              onEdit={handleEdit}
            />
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="review-actions">
          <button
            onClick={handleBack}
            className="btn btn-secondary"
            disabled={saving}
          >
            {t('common.back')}
          </button>
          <button
            onClick={handleSaveAndSubmit}
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? t('common.saving') : t('review.saveAndSubmit')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireReview;
