import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import QuestionInput from '../../../features/questionInput/components/QuestionInput';
import QuestionnaireWizardSkeleton from './QuestionnaireWizardSkeleton';
import WizardHeader from './WizardHeader';
import WizardProgress from './WizardProgress';
import ConditionalQuestions from './ConditionalQuestions';
import useQuestionnaireWizard from '../useQuestionnaireWizard';
import './QuestionnaireWizard.css';

const QuestionnaireWizard = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const {
    type,
    currentQuestion,
    conditionalQuestions,
    answers,
    allQuestions,
    loading,
    saving,
    error,
    handleBack,
    handleAnswer,
    setAnswerForQuestion,
    handleNext,
    handlePrevious,
    isLastQuestion,
    canProceed,
    relevantQuestions,
    questionWithMinTime,
    currentAnswer,
    questionHistory,
    getConditionalChildQuestionIds,
    navigateToQuestion,
    validateAnswer,
    hasPrevious
  } = useQuestionnaireWizard(t, language);

  if (loading) {
    return <QuestionnaireWizardSkeleton />;
  }

  if (!currentQuestion) {
    return (
      <div className="wizard-container">
        <div className="wizard-error">
          <p>{error || t('questionnaire.noQuestions')}</p>
          <button onClick={handleBack} className="btn btn-primary">
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  // Opdater question objekt med dynamisk minTime baseret på answers
  return (
    <div className="wizard-container">
      <WizardHeader
        title={type === 'morning' ? `🌅 ${t('questionnaire.morning')}` : `🌙 ${t('questionnaire.evening')}`}
        onCancel={handleBack}
        theme={theme}
        toggleTheme={toggleTheme}
        cancelLabel={t('common.cancel')}
        themeTooltip={theme === 'light' ? t('theme.toggleDark') : t('theme.toggleLight')}
      />

      <WizardProgress
        questions={relevantQuestions}
        currentQuestion={currentQuestion}
        answers={answers}
        validateAnswer={validateAnswer}
        getConditionalChildQuestionIds={getConditionalChildQuestionIds}
        questionHistory={questionHistory}
        navigateToQuestion={navigateToQuestion}
        t={t}
      />

      <div className="wizard-content">
        <div className="wizard-question-card">
          <h2 className="wizard-question-text">{language === 'en' && currentQuestion.textEn ? currentQuestion.textEn : currentQuestion.textDa || currentQuestion.text}</h2>

          <div className="wizard-input-container">
            <QuestionInput
              question={questionWithMinTime}
              value={currentAnswer}
              onChange={handleAnswer}
              allQuestions={allQuestions}
              answers={answers}
              questionnaireType={type}
            />
          </div>

          {/* Vis conditional children hvis de findes */}
          <ConditionalQuestions
            questions={conditionalQuestions}
            answers={answers}
            allQuestions={allQuestions}
            onAnswer={(id, value) => setAnswerForQuestion(id, value)}
            language={language}
            questionnaireType={type}
          />

          {error && <div className="error-message">{error}</div>}

          <div className="wizard-actions">
            <button
              onClick={handlePrevious}
              className="btn btn-secondary"
              disabled={!hasPrevious || saving}
            >
              {t('common.previous')}
            </button>
            <button
              onClick={handleNext}
              className="btn btn-primary"
              disabled={!canProceed || saving}
            >
              {saving 
                ? t('common.saving') 
                : isLastQuestion() 
                  ? t('review.confirm') 
                  : t('common.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireWizard;








