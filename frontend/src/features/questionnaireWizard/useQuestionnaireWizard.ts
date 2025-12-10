import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation, type TFunction } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { questionnaireAPI, questionAPI, responseAPI } from '../../services/api';
import type { Question } from '../../types';

type UseQuestionnaireWizardResult = {
  type?: string;
  language: string;
  currentQuestion: Question | null;
  questionnaireId: string | null;
  allQuestions: Question[];
  conditionalQuestions: Question[];
  answers: Record<string, any>;
  loading: boolean;
  saving: boolean;
  error: string;
  questionHistory: string[];
  currentAnswer: any;
  canProceed: boolean;
  progress: { current: number; total: number; percentage: number };
  relevantQuestions: Question[];
  questionWithMinTime: Question;
  handleAnswer: (value: any) => Promise<void>;
  setAnswerForQuestion: (questionId: string, value: any) => void;
  handleNext: () => Promise<void>;
  handlePrevious: () => void;
  saveResponse: () => Promise<void>;
  handleBack: () => void;
  navigateToQuestion: (questionId: string) => Promise<void>;
  isLastQuestion: () => boolean;
  getConditionalChildQuestionIds: () => Set<string>;
  validateAnswer: (answer: any, question: Question) => boolean;
  hasPrevious: boolean;
};

export const useQuestionnaireWizard = (t: TFunction, languageProp?: string): UseQuestionnaireWizardResult => {
  const { type } = useParams<{ type: string }>();
  const { language: languageCtx } = useLanguage();
  const language = languageProp || languageCtx;
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionnaireId, setQuestionnaireId] = useState<string | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [conditionalQuestions, setConditionalQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);
  const isInitialLoad = useRef(true);
  const previousLanguage = useRef<string>(language);

  useEffect(() => {
    isInitialLoad.current = true;
    const state = location.state as any;
    if (state?.answers && state?.questionnaireId) {
      setAnswers(state.answers);
      setQuestionnaireId(state.questionnaireId);
      if (state.editQuestionId) {
        const loadEditQuestion = async () => {
          try {
            setLoading(true);
            const question = await questionAPI.getQuestion(state.editQuestionId, language);
            setCurrentQuestion(question);
            if (question.questionnaireId && allQuestions.length === 0) {
              const allQuestionsData = await questionAPI.getQuestions(question.questionnaireId, language);
              setAllQuestions(allQuestionsData);
            }
            setQuestionHistory((prev) => {
              if (!prev.includes(question.id)) {
                return [...prev, question.id];
              }
              return prev;
            });
          } catch (err) {
            loadFirstQuestion();
          } finally {
            setLoading(false);
          }
        };
        loadEditQuestion();
      } else {
        loadFirstQuestion();
      }
    } else {
      loadFirstQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      previousLanguage.current = language;
      return;
    }

    if (previousLanguage.current !== language && currentQuestion && questionnaireId) {
      previousLanguage.current = language;
      i18n.changeLanguage(language);
      const reloadCurrentQuestion = async () => {
        try {
          const currentQuestionId = currentQuestion.id;
          const conditionalQuestionIds = conditionalQuestions.map((q) => q.id);

          const question = await questionAPI.getQuestion(currentQuestionId, language);
          setCurrentQuestion(question);

          const allQuestionsData = await questionAPI.getQuestions(questionnaireId, language);
          setAllQuestions(allQuestionsData);

          if (conditionalQuestionIds.length > 0) {
            const reloadedConditionals = await Promise.all(conditionalQuestionIds.map((id) => questionAPI.getQuestion(id, language)));
            reloadedConditionals.sort((a, b) => a.order - b.order);
            setConditionalQuestions(reloadedConditionals);
          }
        } catch (err) {
          // ignore
        }
      };
      reloadCurrentQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const loadFirstQuestion = async () => {
    try {
      setLoading(true);
      setConditionalQuestions([]);
      const questions = await questionnaireAPI.startQuestionnaire(type!, language);
      if (questions.length > 0) {
        const firstQuestion = questions[0];

        if (firstQuestion.questionnaireId) {
          setQuestionnaireId(firstQuestion.questionnaireId);
          const allQuestionsData = await questionAPI.getQuestions(firstQuestion.questionnaireId, language);
          setAllQuestions(allQuestionsData);

          const conditionalChildIds = new Set<string>();
          allQuestionsData.forEach((q) => {
            q.conditionalChildren?.forEach((cc) => {
              conditionalChildIds.add(cc.childQuestionId);
            });
          });
          const rootQuestions = allQuestionsData
            .filter((q) => q.id && !conditionalChildIds.has(q.id))
            .sort((a, b) => (a.order || 0) - (b.order || 0));

          if (rootQuestions.length > 0) {
            const actualFirstQuestion = rootQuestions[0];
            setCurrentQuestion(actualFirstQuestion);
            setQuestionHistory([actualFirstQuestion.id]);
          } else {
            setCurrentQuestion(firstQuestion);
            setQuestionHistory([firstQuestion.id]);
          }
        } else {
          setCurrentQuestion(firstQuestion);
          setQuestionHistory([firstQuestion.id]);
        }
      } else {
        setError(t('questionnaire.noQuestions'));
      }
    } catch (err: any) {
      setError(err.message || t('questionnaire.couldNotLoad'));
    } finally {
      setLoading(false);
    }
  };

  const getConditionalChildQuestionIds = (): Set<string> => {
    const conditionalChildIds = new Set<string>();
    for (const question of allQuestions) {
      if (question.conditionalChildren && question.conditionalChildren.length > 0) {
        question.conditionalChildren.forEach((cc) => {
          if (cc.childQuestionId) {
            conditionalChildIds.add(cc.childQuestionId);
          }
        });
      }
    }
    return conditionalChildIds;
  };

  const getRelevantQuestions = (): Question[] => {
    if (allQuestions.length === 0) return [];
    const conditionalChildIds = getConditionalChildQuestionIds();
    const mainQuestions = allQuestions.filter((q) => !conditionalChildIds.has(q.id));
    return mainQuestions.sort((a, b) => a.order - b.order);
  };

  const validateAnswer = (answer: any, question: Question): boolean => {
    if (answer === undefined || answer === null || answer === '') {
      return false;
    }
    if (question.type === 'text' && question.order === 2) {
      const text = answer.toString();
      if (text.trim().length === 0) return false;
      if (text.length > 200) return false;
    }
    if (question.order === 8 && question.type === 'numeric') {
      const question6 = allQuestions.find((q) => q.order === 6 && q.type === 'multiple_choice');
      if (question6) {
        const answer6 = answers[question6.id];
        if (answer6 !== undefined && answer6 !== null) {
          try {
            const optionId = typeof answer6 === 'object' && (answer6 as any)?.optionId ? (answer6 as any).optionId : answer6;
            const value8 = typeof answer === 'number' ? answer : parseInt(answer.toString(), 10);
            if (optionId === 'wake_no' && !isNaN(value8) && value8 > 0) {
              return false;
            }
          } catch (e) {
            // ignore parse errors
          }
        }
      }
    }
    if (question.type === 'multiple_choice' && typeof answer === 'object' && (answer as any).optionId) {
      const option = question.options?.find((opt) => opt.id === (answer as any).optionId);
      if (option?.isOther) {
        return (answer as any).customText !== undefined && (answer as any).customText !== null && (answer as any).customText.trim() !== '';
      }
    }
    if (question.type === 'multiple_choice_multiple' && Array.isArray(answer)) {
      const otherOption = question.options?.find((opt) => opt.isOther);
      if (otherOption) {
        const otherAnswer = answer.find(
          (val: any) => (typeof val === 'object' && val?.optionId === otherOption.id) || val === otherOption.id
        );
        if (otherAnswer && typeof otherAnswer === 'object' && otherAnswer.optionId === otherOption.id) {
          if (!otherAnswer.customText || otherAnswer.customText.trim() === '') {
            return false;
          }
        }
      }
    }
    return true;
  };

  const getConditionalQuestionsForAnswer = (question: Question, value: any) => {
    if (
      (question.type === 'multiple_choice' || question.type === 'multiple_choice_multiple') &&
      question.conditionalChildren
    ) {
      let selectedOptionIds: string[] = [];
      if (Array.isArray(value)) {
        selectedOptionIds = value.map((val: any) => (typeof val === 'object' && val?.optionId ? val.optionId : val));
      } else if (value) {
        selectedOptionIds = [typeof value === 'object' && (value as any)?.optionId ? (value as any).optionId : value];
      }
      return question.conditionalChildren.filter((cc) => selectedOptionIds.includes(cc.optionId));
    }
    return [];
  };

  const handleAnswer = async (value: any) => {
    if (!currentQuestion) return;
    const updatedAnswers = await new Promise<Record<string, any>>((resolve) => {
      setAnswers((prev) => {
        const newAnswers = {
          ...prev,
          [currentQuestion.id]: value
        };
        if (currentQuestion.order === 3 && currentQuestion.type === 'time_picker' && value) {
          const question4 = allQuestions.find((q) => q.order === 4 && q.type === 'time_picker');
          if (question4) {
            const previousAnswer3 = prev[currentQuestion.id];
            const currentAnswer4 = prev[question4.id];
            if (!currentAnswer4 || (previousAnswer3 && currentAnswer4.toString().trim() === previousAnswer3.toString().trim())) {
              newAnswers[question4.id] = value;
            }
          }
        }
        if (currentQuestion.order === 9 && currentQuestion.type === 'time_picker' && value) {
          const question10 = allQuestions.find((q) => q.order === 10 && q.type === 'time_picker');
          if (question10) {
            const previousAnswer9 = prev[currentQuestion.id];
            const currentAnswer10 = prev[question10.id];
            if (!currentAnswer10 || (previousAnswer9 && currentAnswer10.toString().trim() === previousAnswer9.toString().trim())) {
              newAnswers[question10.id] = value;
            }
          }
        }
        resolve(newAnswers);
        return newAnswers;
      });
    });

    setError('');

    if (currentQuestion.order === 4 && currentQuestion.type === 'time_picker') {
      const lightOffTimeError = validateLightOffTimeWithAnswers(updatedAnswers);
      if (lightOffTimeError) setError(lightOffTimeError);
    }
    if (currentQuestion.order === 3 && currentQuestion.type === 'time_picker') {
      const lightOffTimeError = validateLightOffTimeWithAnswers(updatedAnswers);
      if (lightOffTimeError) setError(lightOffTimeError);
    }
    if (currentQuestion.order === 10 && currentQuestion.type === 'time_picker') {
      const wakeTimeError = validateWakeTimesWithAnswers(updatedAnswers);
      if (wakeTimeError) setError(wakeTimeError);
    }
    if (currentQuestion.order === 9 && currentQuestion.type === 'time_picker') {
      const wakeTimeError = validateWakeTimesWithAnswers(updatedAnswers);
      if (wakeTimeError) setError(wakeTimeError);
    }

    if (currentQuestion.conditionalChildren) {
      const matchingConditionals = getConditionalQuestionsForAnswer(currentQuestion, value);
      if (matchingConditionals.length > 0) {
        try {
          const childQuestions = await Promise.all(matchingConditionals.map((cc) => questionAPI.getQuestion(cc.childQuestionId, language)));
          childQuestions.sort((a, b) => a.order - b.order);
          setConditionalQuestions(childQuestions);
        } catch (err) {
          setConditionalQuestions([]);
        }
      } else {
        setConditionalQuestions([]);
      }
    } else {
      setConditionalQuestions([]);
    }
  };

  const getRelevantQuestionsProgress = (): { current: number; total: number; percentage: number } => {
    const relevantQuestions = getRelevantQuestions();
    const total = relevantQuestions.length;
    let answered = 0;
    for (const question of relevantQuestions) {
      if (validateAnswer(answers[question.id], question)) {
        answered++;
      }
    }
    return {
      current: answered,
      total,
      percentage: total > 0 ? Math.round((answered / total) * 100) : 0
    };
  };

  const navigateToQuestion = async (questionId: string) => {
    if (!questionnaireId || !currentQuestion) return;
    if (questionId === currentQuestion.id) return;
    try {
      const question = await questionAPI.getQuestion(questionId, language);
      setCurrentQuestion(question);
      if (question.order === 8 && question.type === 'numeric') {
        const question6 = allQuestions.find((q) => q.order === 6 && q.type === 'multiple_choice');
        if (question6) {
          const answer6 = answers[question6.id];
          if (answer6 !== undefined && answer6 !== null) {
            const optionId = typeof answer6 === 'object' && (answer6 as any)?.optionId ? (answer6 as any).optionId : answer6;
            if (optionId === 'wake_no') {
              setAnswers((prev) => ({
                ...prev,
                [question.id]: 0
              }));
            } else {
              const currentAnswer8 = answers[question.id];
              if (currentAnswer8 === 0) {
                setAnswers((prev) => {
                  const newAnswers = { ...prev };
                  delete newAnswers[question.id];
                  return newAnswers;
                });
              }
            }
          }
        }
      }
      setQuestionHistory((prev) => {
        if (!prev.includes(questionId)) {
          return [...prev, questionId];
        }
        return prev;
      });

      if (question.conditionalChildren && question.conditionalChildren.length > 0) {
        const answer = answers[question.id];
        if (answer !== undefined && answer !== null && answer !== '') {
          const matchingConditionals = getConditionalQuestionsForAnswer(question, answer);
          if (matchingConditionals.length > 0) {
            const childQuestions = await Promise.all(
              matchingConditionals.map((cc) => questionAPI.getQuestion(cc.childQuestionId, language))
            );
            childQuestions.sort((a, b) => a.order - b.order);
            setConditionalQuestions(childQuestions);
          } else {
            setConditionalQuestions([]);
          }
        } else {
          setConditionalQuestions([]);
        }
      } else {
        setConditionalQuestions([]);
      }

      if (question.type === 'time_picker') {
        if (question.order === 3 || question.order === 4) {
          const lightOffTimeError = validateLightOffTimeWithAnswers(answers);
          if (lightOffTimeError) setError(lightOffTimeError);
          else setError('');
        } else if (question.order === 9 || question.order === 10) {
          const wakeTimeError = validateWakeTimesWithAnswers(answers);
          if (wakeTimeError) setError(wakeTimeError);
          else setError('');
        } else {
          setError('');
        }
      } else {
        setError('');
      }
    } catch (err) {
      setError(t('questionnaire.couldNotLoad'));
    }
  };

  const getPreviousQuestion = (): Question | null => {
    if (!currentQuestion) return null;
    const relevantQuestions = getRelevantQuestions();
    if (relevantQuestions.length === 0) return null;
    const currentIndex = relevantQuestions.findIndex((q) => q.id === currentQuestion.id);
    if (currentIndex <= 0) return null;
    return relevantQuestions[currentIndex - 1];
  };

  const validateLightOffTimeWithAnswers = (answersToValidate: Record<string, any>): string | null => {
    if (type !== 'morning') return null;
    const wentToBedQuestion = allQuestions.find((q) => q.order === 3 && q.type === 'time_picker');
    const lightOffQuestion = allQuestions.find((q) => q.order === 4 && q.type === 'time_picker');
    if (!wentToBedQuestion || !lightOffQuestion) return null;
    const wentToBedAnswer = answersToValidate[wentToBedQuestion.id];
    const lightOffAnswer = answersToValidate[lightOffQuestion.id];
    if (!wentToBedAnswer || !lightOffAnswer) return null;
    try {
      const bedTime = wentToBedAnswer.toString().trim();
      const lightOffTime = lightOffAnswer.toString().trim();
      if (!/^\d{2}:\d{2}$/.test(bedTime) || !/^\d{2}:\d{2}$/.test(lightOffTime)) return null;
      const [bedH, bedM] = bedTime.split(':').map(Number);
      const [lightH, lightM] = lightOffTime.split(':').map(Number);
      if (isNaN(bedH) || isNaN(bedM) || isNaN(lightH) || isNaN(lightM)) return null;
      const bedTotal = bedH * 60 + bedM;
      const lightTotal = lightH * 60 + lightM;
      if (lightTotal < bedTotal) {
        return t('questionnaire.lightOffTimeError', { lightOffTime, bedTime });
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const validateSleepTimes = (): string | null => {
    const wentToBedQuestion = allQuestions.find((q) => q.order === 3 && q.type === 'time_picker');
    const fellAsleepQuestion = allQuestions.find((q) => q.order === 5);
    if (!wentToBedQuestion || !fellAsleepQuestion) return null;
    const wentToBedAnswer = answers[wentToBedQuestion.id];
    const fellAsleepAnswer = answers[fellAsleepQuestion.id];
    if (!wentToBedAnswer || !fellAsleepAnswer) return null;
    try {
      const bedTime = wentToBedAnswer.toString().trim();
      const sleepTimeStr = fellAsleepAnswer.toString().trim();
      if (fellAsleepQuestion.type === 'time_picker' && sleepTimeStr.includes(':')) {
        const [bedH, bedM] = bedTime.split(':').map(Number);
        const [sleepH, sleepM] = sleepTimeStr.split(':').map(Number);
        const bedTotal = bedH * 60 + bedM;
        const sleepTotal = sleepH * 60 + sleepM;
        if (sleepTotal < bedTotal) {
          return t('questionnaire.sleepTimeError', { sleepTime: sleepTimeStr, bedTime });
        }
      } else if (fellAsleepQuestion.type === 'numeric') {
        const minutes = typeof fellAsleepAnswer === 'number' ? fellAsleepAnswer : parseInt(sleepTimeStr, 10);
        if (isNaN(minutes) || minutes < 0) {
          return t('questionnaire.sleepTimeErrorMinutes');
        }
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const validateWakeTimesWithAnswers = (answersToValidate: Record<string, any>): string | null => {
    const wokeUpQuestion = allQuestions.find((q) => q.order === 9 && q.type === 'time_picker');
    const gotOutOfBedQuestion = allQuestions.find((q) => q.order === 10 && q.type === 'time_picker');
    if (!wokeUpQuestion || !gotOutOfBedQuestion) return null;
    const wokeUpAnswer = answersToValidate[wokeUpQuestion.id];
    const gotOutOfBedAnswer = answersToValidate[gotOutOfBedQuestion.id];
    if (!wokeUpAnswer || !gotOutOfBedAnswer) return null;
    try {
      const wakeTime = wokeUpAnswer.toString().trim();
      const outOfBedTime = gotOutOfBedAnswer.toString().trim();
      const [wakeH, wakeM] = wakeTime.split(':').map(Number);
      const [outH, outM] = outOfBedTime.split(':').map(Number);
      const wakeTotal = wakeH * 60 + wakeM;
      const outTotal = outH * 60 + outM;
      if (outTotal < wakeTotal) {
        return t('questionnaire.wakeTimeError', { wakeTime, outOfBedTime });
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const validateQuestion6 = (): string | null => {
    if (type !== 'morning') return null;
    const question6 = allQuestions.find((q) => q.order === 6 && q.type === 'multiple_choice');
    const question7 = allQuestions.find((q) => q.order === 7 && q.type === 'numeric');
    const question8 = allQuestions.find((q) => q.order === 8 && q.type === 'numeric');
    if (!question6 || !question7 || !question8) return null;
    const answer6 = answers[question6.id];
    if (answer6 === undefined || answer6 === null) return null;
    try {
      const optionId = typeof answer6 === 'object' && (answer6 as any)?.optionId ? (answer6 as any).optionId : answer6;
      if (optionId === 'wake_yes') {
        const answer7 = answers[question7.id];
        const answer8 = answers[question8.id];
        if (answer7 === undefined || answer7 === null || answer7 === '') {
          return t('questionnaire.question6Missing', { value5: 1, question6Order: question7.order });
        }
        if (answer8 === undefined || answer8 === null || answer8 === '') {
          return t('questionnaire.question6Missing', { value5: 1, question6Order: question8.order });
        }
        const value7 = typeof answer7 === 'number' ? answer7 : parseInt(answer7.toString(), 10);
        const value8 = typeof answer8 === 'number' ? answer8 : parseInt(answer8.toString(), 10);
        if (isNaN(value7) || isNaN(value8)) {
          return t('questionnaire.question6Missing', { value5: 1, question6Order: question7.order });
        }
        if (value7 >= 1 && value8 === 0) {
          return t('questionnaire.question6Error', { value5: value7 });
        }
      } else if (optionId === 'wake_no') {
        const answer8 = answers[question8.id];
        if (answer8 !== undefined && answer8 !== null && answer8 !== '') {
          const value8 = typeof answer8 === 'number' ? answer8 : parseInt(answer8.toString(), 10);
          if (!isNaN(value8) && value8 > 0) {
            return t('questionnaire.question6Error', { value5: 0 });
          }
        }
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const handleNext = async () => {
    if (!currentQuestion) return;
    try {
      setSaving(true);
      setError('');
      const unansweredConditionals = conditionalQuestions.filter((q) => !validateAnswer(answers[q.id], q));
      if (unansweredConditionals.length > 0) {
        setError(t('questionnaire.mustAnswerAll'));
        setSaving(false);
        return;
      }
      const lightOffTimeError = validateLightOffTimeWithAnswers(answers);
      if (lightOffTimeError) {
        setError(lightOffTimeError);
        setSaving(false);
        return;
      }
      const sleepTimeError = validateSleepTimes();
      if (sleepTimeError) {
        setError(sleepTimeError);
        setSaving(false);
        return;
      }
      const wakeTimeError = validateWakeTimesWithAnswers(answers);
      if (wakeTimeError) {
        setError(wakeTimeError);
        setSaving(false);
        return;
      }

      const currentAnswer = answers[currentQuestion.id];
      const currentAnswers = {
        ...answers,
        [currentQuestion.id]: currentAnswer
      };
      conditionalQuestions.forEach((q) => {
        if (answers[q.id] !== undefined) {
          currentAnswers[q.id] = answers[q.id];
        }
      });
      if (currentQuestion.order === 6 && currentQuestion.type === 'multiple_choice') {
        const optionId =
          typeof currentAnswer === 'object' && (currentAnswer as any)?.optionId ? (currentAnswer as any).optionId : currentAnswer;
        if (optionId === 'wake_no') {
          const question8 = allQuestions.find((q) => q.order === 8 && q.type === 'numeric');
          if (question8) {
            currentAnswers[question8.id] = 0;
          }
        }
      }

      const nextQuestion = await responseAPI.getNextQuestion(
        {
          questionnaireId: questionnaireId || type!,
          currentQuestionId: currentQuestion.id,
          currentAnswers
        },
        language
      );

      if (nextQuestion) {
        setCurrentQuestion(nextQuestion);
        setQuestionHistory((prev) => {
          if (!prev.includes(nextQuestion.id)) {
            return [...prev, nextQuestion.id];
          }
          return prev;
        });
        setConditionalQuestions([]);
        setError('');
        if (!questionnaireId && nextQuestion.questionnaireId) {
          setQuestionnaireId(nextQuestion.questionnaireId);
        }
        if (
          allQuestions.length === 0 ||
          (nextQuestion.questionnaireId && (!questionnaireId || nextQuestion.questionnaireId !== questionnaireId))
        ) {
          const allQuestionsData = await questionAPI.getQuestions(nextQuestion.questionnaireId || questionnaireId!, language);
          setAllQuestions(allQuestionsData);
        }
      } else {
        const finalAnswers = {
          ...answers,
          [currentQuestion.id]: currentAnswer
        };
        conditionalQuestions.forEach((q) => {
          if (answers[q.id] !== undefined) {
            finalAnswers[q.id] = answers[q.id];
          }
        });

        let finalAllQuestions = allQuestions;
        if (finalAllQuestions.length === 0 && questionnaireId) {
          finalAllQuestions = await questionAPI.getQuestions(questionnaireId, language);
          setAllQuestions(finalAllQuestions);
        }

        navigate('/citizen/questionnaire/review', {
          state: {
            answers: finalAnswers,
            questionnaireId: questionnaireId || type!,
            type: type!,
            allQuestions: finalAllQuestions.length > 0 ? finalAllQuestions : allQuestions
          }
        });
      }
    } catch (err: any) {
      if (err.response?.status === 204) {
        const finalAnswers = {
          ...answers,
          [currentQuestion.id]: answers[currentQuestion.id]
        };
        conditionalQuestions.forEach((q) => {
          if (answers[q.id] !== undefined) {
            finalAnswers[q.id] = answers[q.id];
          }
        });

        let finalAllQuestions = allQuestions;
        if (finalAllQuestions.length === 0 && questionnaireId) {
          finalAllQuestions = await questionAPI.getQuestions(questionnaireId, language);
          setAllQuestions(finalAllQuestions);
        }

        navigate('/citizen/questionnaire/review', {
          state: {
            answers: finalAnswers,
            questionnaireId: questionnaireId || type!,
            type: type!,
            allQuestions: finalAllQuestions.length > 0 ? finalAllQuestions : allQuestions
          }
        });
      } else {
        const errorMessage = err.response?.data?.error || err.message || t('questionnaire.couldNotGetNext');
        setError(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const isLastQuestion = (): boolean => {
    if (!currentQuestion || allQuestions.length === 0) return false;
    const relevantQuestions = getRelevantQuestions();
    if (relevantQuestions.length === 0) return false;
    const conditionalChildIds = getConditionalChildQuestionIds();
    const isCurrentQuestionConditional = conditionalChildIds.has(currentQuestion.id);
    let mainQuestion: Question | undefined;
    if (isCurrentQuestionConditional) {
      for (const q of relevantQuestions) {
        if (q.conditionalChildren) {
          const hasThisConditional = q.conditionalChildren.some((cc) => cc.childQuestionId === currentQuestion.id);
          if (hasThisConditional) {
            mainQuestion = q;
            break;
          }
        }
      }
    } else {
      mainQuestion = currentQuestion;
    }
    if (!mainQuestion) return false;
    const currentOrder = mainQuestion.order || 0;
    const hasMoreMainQuestions = relevantQuestions.some((q) => (q.order || 0) > currentOrder);
    if (hasMoreMainQuestions) return false;
    if (isCurrentQuestionConditional) {
      const parentConditionals = mainQuestion.conditionalChildren || [];
      if (parentConditionals.length === 0) return true;
      const answer = answers[mainQuestion.id];
      if (!answer) return false;
      let selectedOptionIds: string[] = [];
      if (Array.isArray(answer)) {
        selectedOptionIds = answer.map((val: any) => (typeof val === 'object' && val?.optionId ? val.optionId : val));
      } else if (typeof answer === 'object' && (answer as any)?.optionId) {
        selectedOptionIds = [(answer as any).optionId];
      } else if (answer) {
        selectedOptionIds = [answer];
      }
      const matchingConditionals = parentConditionals.filter((cc) => selectedOptionIds.includes(cc.optionId));
      if (matchingConditionals.length === 0) return true;
      const conditionalQuestionIds = matchingConditionals.map((cc) => cc.childQuestionId);
      const currentConditionalIndex = conditionalQuestionIds.indexOf(currentQuestion.id);
      return currentConditionalIndex === conditionalQuestionIds.length - 1;
    }
    if (conditionalQuestions.length > 0) return false;
    if (mainQuestion.conditionalChildren && mainQuestion.conditionalChildren.length > 0) {
      const answer = answers[mainQuestion.id];
      if (answer) {
        let selectedOptionIds: string[] = [];
        if (Array.isArray(answer)) {
          selectedOptionIds = answer.map((val: any) => (typeof val === 'object' && val?.optionId ? val.optionId : val));
        } else if (typeof answer === 'object' && (answer as any)?.optionId) {
          selectedOptionIds = [(answer as any).optionId];
        } else if (answer) {
          selectedOptionIds = [answer];
        }
        const matchingConditionals = mainQuestion.conditionalChildren.filter((cc) => selectedOptionIds.includes(cc.optionId));
        if (matchingConditionals.length > 0) {
          return false;
        }
      }
    }
    return true;
  };

  const handlePrevious = () => {
    const previousQuestion = getPreviousQuestion();
    if (previousQuestion) {
      navigateToQuestion(previousQuestion.id);
    }
  };

  const handleBack = () => {
    navigate('/citizen');
  };

  const validateWakeTimes = (): string | null => validateWakeTimesWithAnswers(answers);
  const validateLightOffTime = (): string | null => validateLightOffTimeWithAnswers(answers);

  const saveResponse = async () => {
    try {
      setSaving(true);
      setError('');
      const lightOffTimeError = validateLightOffTime();
      if (lightOffTimeError) {
        setError(lightOffTimeError);
        setSaving(false);
        return;
      }
      const sleepTimeError = validateSleepTimes();
      if (sleepTimeError) {
        setError(sleepTimeError);
        setSaving(false);
        return;
      }
      const wakeTimeError = validateWakeTimes();
      if (wakeTimeError) {
        setError(wakeTimeError);
        setSaving(false);
        return;
      }
      const question6Error = validateQuestion6();
      if (question6Error) {
        setError(question6Error);
        setSaving(false);
        const question7 = allQuestions.find((q) => q.order === 7 && q.type === 'numeric');
        const question8 = allQuestions.find((q) => q.order === 8 && q.type === 'numeric');
        if (question6Error.includes('questionnaire.question6Missing')) {
          const targetQuestion = question7 && !answers[question7.id] ? question7 : question8;
          if (targetQuestion) {
            setTimeout(() => {
              navigateToQuestion(targetQuestion.id);
            }, 100);
          }
        }
        return;
      }
      await responseAPI.saveResponse({
        questionnaireId: questionnaireId || type!,
        answers
      });
      navigate('/citizen');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || t('questionnaire.couldNotSave');
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getQuestionWithDynamicMinTime = (question: Question): Question => {
    if (type !== 'morning') {
      return question;
    }
    const formatTimeString = (timeValue: any): string | undefined => {
      if (!timeValue) return undefined;
      const timeStr = timeValue.toString().trim();
      if (/^\d{2}:\d{2}$/.test(timeStr)) {
        return timeStr;
      }
      return undefined;
    };
    if (question.order === 4 && question.type === 'time_picker') {
      const question3 = allQuestions.find((q) => q.order === 3 && q.type === 'time_picker');
      if (question3) {
        const answer3 = answers[question3.id];
        const formattedTime = formatTimeString(answer3);
        if (formattedTime) {
          return { ...question, minTime: formattedTime };
        }
      }
    }
    if (question.order === 10 && question.type === 'time_picker') {
      const question9 = allQuestions.find((q) => q.order === 9 && q.type === 'time_picker');
      if (question9) {
        const answer9 = answers[question9.id];
        const formattedTime = formatTimeString(answer9);
        if (formattedTime) {
          return { ...question, minTime: formattedTime };
        }
      }
    }
    return question;
  };

  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;
  const canProceed = currentQuestion ? validateAnswer(currentAnswer, currentQuestion) : false;
  const progress = getRelevantQuestionsProgress();
  const relevantQuestions = getRelevantQuestions();
  const questionWithMinTime = currentQuestion ? getQuestionWithDynamicMinTime(currentQuestion) : ({} as Question);

  return {
    type,
    language,
    currentQuestion,
    questionnaireId,
    allQuestions,
    conditionalQuestions,
    answers,
    loading,
    saving,
    error,
    questionHistory,
    currentAnswer,
    canProceed,
    progress,
    relevantQuestions,
    questionWithMinTime,
    handleAnswer,
    setAnswerForQuestion: (questionId: string, value: any) =>
      setAnswers((prev) => ({
        ...prev,
        [questionId]: value
      })),
    handleNext,
    handlePrevious,
    saveResponse,
    handleBack,
    navigateToQuestion,
    isLastQuestion,
    getConditionalChildQuestionIds,
    validateAnswer,
    hasPrevious: !!getPreviousQuestion()
  };
};

export default useQuestionnaireWizard;

