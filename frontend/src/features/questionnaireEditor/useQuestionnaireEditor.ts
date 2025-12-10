import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { questionnaireAPI, questionAPI } from '../../services/api';
import type { Question, Questionnaire } from '../../types';

export const useQuestionnaireEditor = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { type } = useParams<{ type: string }>();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ questionId: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const isReadOnly = type === 'morning';

  useEffect(() => {
    loadQuestionnaire();
  }, [type, language]);

  const loadQuestionnaire = async () => {
    try {
      setLoading(true);
      const q = await questionnaireAPI.getQuestionnaire(type!);
      setQuestionnaire(q);

      // Load questions
      const questionsData = await questionAPI.getQuestions(q.id, language);
      
      // Cleanup: Fjern alle conditionalChildren med temp IDs
      for (const question of questionsData) {
        if (question.conditionalChildren && question.conditionalChildren.length > 0) {
          const hasTempIds = question.conditionalChildren.some(
            cc => cc.childQuestionId && cc.childQuestionId.startsWith('temp_')
          );
          
          if (hasTempIds && question.id) {
            // Fjern alle conditionalChildren med temp IDs
            for (const cc of question.conditionalChildren) {
              if (cc.childQuestionId && cc.childQuestionId.startsWith('temp_')) {
                try {
                  await questionAPI.removeConditionalChild(question.id, cc.optionId, cc.childQuestionId);
                } catch (err) {
                  // Ignorer fejl ved fjernelse af temp IDs
                }
              }
            }
          }
        }
      }
      
      // Reload questions efter cleanup
      const cleanedQuestions = await questionAPI.getQuestions(q.id, language);
      setQuestions(cleanedQuestions);
    } catch (err: any) {
      setError(err.message || t('editor.couldNotLoad'));
    } finally {
      setLoading(false);
    }
  };

  // Find root spørgsmål (spørgsmål der ikke er conditional children)
  const getRootQuestions = () => {
    const allChildQuestionIds = new Set<string>();
    questions.forEach(q => {
      q.conditionalChildren?.forEach(cc => {
        allChildQuestionIds.add(cc.childQuestionId);
      });
    });
    const rootQuestions = questions.filter(q => q.id && !allChildQuestionIds.has(q.id));
    // Sorter efter order for at sikre korrekt rækkefølge
    return rootQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const rootQuestions = getRootQuestions();

  const handleDragEnd = async (event: DragEndEvent) => {
    if (isReadOnly) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = rootQuestions.findIndex((q) => q.id === active.id);
    const newIndex = rootQuestions.findIndex((q) => q.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newRootQuestions = arrayMove(rootQuestions, oldIndex, newIndex);
    // Update order for root questions only
    const updatedRootQuestions = newRootQuestions.map((q, index) => ({
      ...q,
      order: index + 1,
    }));

    // Update order in backend
    try {
      for (const question of updatedRootQuestions) {
        if (!question.isLocked && question.id) {
          await questionAPI.updateQuestion(question.id, question);
        }
      }
      // Reload to get updated state
      const allQuestions = await questionAPI.getQuestions(questionnaire!.id, language);
      setQuestions(allQuestions);
    } catch (err: any) {
      setError(err.message || t('editor.couldNotUpdate'));
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (isReadOnly) return;
    if (!questionId || questionId.trim() === '') {
      setError(t('editor.missingId'));
      return;
    }
    // Vis bekræftelsesdialog
    setDeleteConfirmation({ questionId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    
    const questionId = deleteConfirmation.questionId;
    setDeleteConfirmation(null);

    try {
      await questionAPI.deleteQuestion(questionId);
      // Reload alle spørgsmål for at sikre korrekt state
      const allQuestions = await questionAPI.getQuestions(questionnaire!.id);
      setQuestions(allQuestions);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError(t('editor.lockedCannotDelete'));
      } else {
        setError(err.message || t('editor.couldNotDelete'));
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleSaveQuestion = async (question: Question) => {
    try {
      // Sikre at alle options har unikke IDs
      const questionToSave: Question = {
        ...question,
        options: question.options?.map((opt, index) => ({
          ...opt,
          id: opt.id || `opt_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        })),
      };

      // For nye spørgsmål (uden ID), ignorer conditional children - de skal tilføjes efter spørgsmålet er gemt
      if (!question.id || question.id.trim() === '') {
        // Create new - find højeste order værdi
        const rootQuestionsOnly = getRootQuestions();
        const maxOrder = rootQuestionsOnly.length > 0 
          ? Math.max(...rootQuestionsOnly.map(q => q.order || 0))
          : 0;
        
        // Fjern ID og conditionalChildren for nyt spørgsmål så MongoDB kan generere en ny
        const { id, conditionalChildren, ...questionWithoutId } = questionToSave;
        
        const newQuestion: Question = {
          ...questionWithoutId,
          questionnaireId: questionnaire!.id,
          isLocked: false,
          order: maxOrder + 1,
        } as Question;
        
        const created = await questionAPI.createQuestion(newQuestion);
        
        // Reload alle spørgsmål for at sikre korrekt state
        const allQuestions = await questionAPI.getQuestions(questionnaire!.id, language);
        setQuestions(allQuestions);
        
        setEditingQuestion(null);
        setShowAddQuestion(false);
        return;
      }

      // For eksisterende spørgsmål: Find nye conditional spørgsmål der skal oprettes (dem med tempId)
      const newConditionalQuestions: Array<{ question: Partial<Question>; optionId: string; tempId: string }> = [];
      const conditionalChildrenToSave: typeof questionToSave.conditionalChildren = [];
      
      // Hent nye conditional spørgsmål fra question state
      const newConditionalQuestionsFromState = (question as any).newConditionalQuestions || [];
      
      if (questionToSave.conditionalChildren) {
        for (const cond of questionToSave.conditionalChildren) {
          // Hvis childQuestionId starter med "temp_", er det et nyt spørgsmål
          if (cond.childQuestionId && cond.childQuestionId.startsWith('temp_')) {
            const newQ = newConditionalQuestionsFromState.find(
              (nq: any) => nq.tempId === cond.childQuestionId
            );
            if (newQ) {
              newConditionalQuestions.push({
                question: newQ,
                optionId: cond.optionId,
                tempId: cond.childQuestionId,
              });
            }
            // Ignorer hvis newConditionalQuestion ikke findes
          } else {
            conditionalChildrenToSave.push(cond);
          }
        }
      }

      if (question.id && question.id.trim() !== '') {
        // Update existing
        const existingQuestion = questions.find((q) => q.id === question.id);
        
        // Opret nye conditional spørgsmål først
        const tempIdToRealId: Record<string, string> = {};
        for (const newCondQ of newConditionalQuestions) {
          const { tempId, optionId, ...newQWithoutMeta } = newCondQ.question;
          const newQuestion: Question = {
            ...(newQWithoutMeta as Question),
            id: undefined as any,
            questionnaireId: questionnaire!.id,
            isLocked: false,
            // Child order just acts as placeholder; backend beregner korrekt order ved addConditionalChild
            order: 0,
          } as Question;
          
          const created = await questionAPI.createQuestion(newQuestion);
          if (created.id) {
            tempIdToRealId[newCondQ.tempId] = created.id;
          }
        }
        
        // Opdater conditional children med rigtige IDs (kun hvis alle nye spørgsmål er oprettet)
        const updatedConditionalChildren = [
          ...conditionalChildrenToSave,
          ...newConditionalQuestions
            .filter(ncq => tempIdToRealId[ncq.tempId]) // Kun inkluder hvis spørgsmålet blev oprettet
            .map(ncq => ({
              optionId: ncq.optionId,
              childQuestionId: tempIdToRealId[ncq.tempId],
            })),
        ];
        
        // Først: Fjern alle eksisterende conditional children (inkl. dem med temp IDs)
        if (existingQuestion && existingQuestion.conditionalChildren) {
          // Lav en kopi af listen for at undgå at modificere den mens vi itererer
          const conditionalsToRemove = [...existingQuestion.conditionalChildren];
          for (const existing of conditionalsToRemove) {
            try {
              await questionAPI.removeConditionalChild(
                question.id,
                existing.optionId,
                existing.childQuestionId
              );
            } catch (err) {
              // Ignorer fejl hvis conditional child ikke findes (fx hvis det er en temp ID)
            }
          }
        }
        
        // Vent lidt for at sikre at alle fjernelser er færdige
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Opdater spørgsmålet (uden conditional children - de håndteres separat)
        await questionAPI.updateQuestion(question.id, {
          ...questionToSave,
          conditionalChildren: [], // Sæt eksplicit til tom array
        });
        
        // Vent lidt for at sikre at opdateringen er færdig
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Tilføj alle conditional children igen med de rigtige IDs
        for (const cond of updatedConditionalChildren) {
          if (cond.childQuestionId && !cond.childQuestionId.startsWith('temp_')) {
            try {
              await questionAPI.addConditionalChild(
                question.id,
                cond.optionId,
                cond.childQuestionId
              );
            } catch (err) {
              // Ignorer fejl ved tilføjelse af conditional child
            }
          }
          // Skip conditional children med temp IDs
        }
        
        // Vent lidt for at sikre at alle tilføjelser er færdige
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Reload spørgsmålet direkte for at verificere at conditionalChildren er korrekt
        const updatedQuestion = await questionAPI.getQuestion(question.id, language);
        
        // Tjek om der stadig er temp IDs i conditionalChildren
        if (updatedQuestion.conditionalChildren) {
          const hasTempIds = updatedQuestion.conditionalChildren.some(
            cc => cc.childQuestionId && cc.childQuestionId.startsWith('temp_')
          );
          if (hasTempIds) {
            // Prøv at fjerne dem igen
            for (const cc of updatedQuestion.conditionalChildren) {
              if (cc.childQuestionId && cc.childQuestionId.startsWith('temp_')) {
                try {
                  await questionAPI.removeConditionalChild(question.id, cc.optionId, cc.childQuestionId);
                } catch (err) {
                  // Ignorer fejl
                }
              }
            }
            // Reload igen for at verificere
            await questionAPI.getQuestion(question.id, language);
          }
        }
        
        // Reload alle spørgsmål for at sikre korrekt state
        const allQuestions = await questionAPI.getQuestions(questionnaire!.id, language);
        setQuestions(allQuestions);
      }
      setEditingQuestion(null);
      setShowAddQuestion(false);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError(t('editor.lockedCannotEdit'));
      } else {
        setError(err.message || t('editor.couldNotSave'));
      }
    }
  };

  const handleRemoveConditional = async (questionId: string, optionId: string, childQuestionId: string) => {
    if (!questionId) {
      setError(t('editor.missingId'));
      return;
    }

    try {
      await questionAPI.removeConditionalChild(questionId, optionId, childQuestionId);
      
      // Reload alle spørgsmål for at sikre korrekt state
      const allQuestions = await questionAPI.getQuestions(questionnaire!.id);
      setQuestions(allQuestions);
    } catch (err: any) {
      setError(err.message || t('editor.couldNotRemoveConditional'));
    }
  };

  const handleMoveConditional = async (questionId: string, optionId: string, childQuestionId: string, direction: 'up' | 'down') => {
    if (!questionId) {
      setError(t('editor.missingId'));
      return;
    }

    try {
      const question = questions.find(q => q.id === questionId);
      if (!question || !question.conditionalChildren) return;

      const conditionalChildren = question.conditionalChildren.filter(cc => cc.optionId === optionId);
      const currentIndex = conditionalChildren.findIndex(cc => cc.childQuestionId === childQuestionId);
      
      if (currentIndex === -1) return;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= conditionalChildren.length) return;

      // Swap
      const newOrder = [...conditionalChildren];
      [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];

      const childQuestionIds = newOrder.map(cc => cc.childQuestionId);
      await questionAPI.updateConditionalChildrenOrder(questionId, optionId, childQuestionIds);
      
      // Reload alle spørgsmål for at sikre korrekt state
      const allQuestions = await questionAPI.getQuestions(questionnaire!.id);
      setQuestions(allQuestions);
    } catch (err: any) {
      setError(err.message || t('editor.couldNotMoveConditional'));
    }
  };

  return {
    questionnaire,
    questions,
    loading,
    error,
    setError,
    editingQuestion,
    setEditingQuestion,
    showAddQuestion,
    setShowAddQuestion,
    deleteConfirmation,
    sensors,
    isReadOnly,
    rootQuestions,
    handleDragEnd,
    handleDeleteQuestion,
    confirmDelete,
    cancelDelete,
    handleSaveQuestion,
    handleRemoveConditional,
    handleMoveConditional,
    type,
  };
};

