import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { responseAPI } from '../../services/api';
import type { Question } from '../../types';
import { getRelevantQuestions } from './utils';

interface LocationState {
  answers: Record<string, any>;
  questionnaireId: string;
  type: string;
  allQuestions: Question[];
}

export const useQuestionnaireReview = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Hvis der ikke er state, redirect tilbage til dashboard
  useEffect(() => {
    if (!state || !state.answers || !state.allQuestions) {
      navigate('/citizen');
    }
  }, [state, navigate]);

  if (!state || !state.answers || !state.allQuestions) {
    return {
      isValid: false,
      answers: {},
      questionnaireId: '',
      type: '',
      allQuestions: [],
      relevantQuestions: [],
      saving: false,
      error: '',
      handleEdit: () => {},
      handleSaveAndSubmit: async () => {},
      handleBack: () => {},
    };
  }

  const { answers, questionnaireId, type, allQuestions } = state;

  const handleEdit = (questionId: string) => {
    navigate(`/citizen/questionnaire/${type}`, {
      state: { editQuestionId: questionId, answers, questionnaireId }
    });
  };

  const handleSaveAndSubmit = async () => {
    try {
      setSaving(true);
      setError('');

      await responseAPI.saveResponse({
        questionnaireId: questionnaireId || type,
        answers,
      });
      
      navigate('/citizen');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || t('questionnaire.couldNotSave');
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(`/citizen/questionnaire/${type}`, {
      state: { answers, questionnaireId }
    });
  };

  const relevantQuestions = getRelevantQuestions(allQuestions);

  return {
    isValid: true,
    answers,
    questionnaireId,
    type,
    allQuestions,
    relevantQuestions,
    saving,
    error,
    handleEdit,
    handleSaveAndSubmit,
    handleBack,
  };
};

