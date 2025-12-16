import { useState } from 'react';
import type { Question, QuestionType } from '../../../types';

interface UseQuestionEditModalProps {
  question: Question;
  onSave: (question: Question) => void;
}

export const useQuestionEditModal = ({ question, onSave }: UseQuestionEditModalProps) => {
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState<Question>(() => {
    // Sikre at alle options har unikke IDs og bevar conditional children
    const q = { ...question } as any;
    if (q.options) {
      q.options = q.options.map((opt: any, index: number) => ({
        ...opt,
        id: opt.id || `opt_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
      }));
    }
    // Bevar conditional children hvis de findes
    if (question.conditionalChildren) {
      q.conditionalChildren = [...question.conditionalChildren];
    }
    // Bevar newConditionalQuestions hvis de findes (for nye spørgsmål)
    if ((question as any).newConditionalQuestions) {
      q.newConditionalQuestions = [...(question as any).newConditionalQuestions];
    }
    return q;
  });
  const [newOptionText, setNewOptionText] = useState('');
  const [newOptionTextEn, setNewOptionTextEn] = useState('');
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const [creatingNewConditional, setCreatingNewConditional] = useState<{ optionId: string } | null>(null);
  const [newConditionalQuestion, setNewConditionalQuestion] = useState<Partial<Question>>({
    text: '',
    type: 'text' as QuestionType,
    options: [],
  });
  const [newConditionalOptionText, setNewConditionalOptionText] = useState('');
  const [newConditionalOptionTextEn, setNewConditionalOptionTextEn] = useState('');

  const handleUpdate = (updates: Partial<Question>) => {
    setEditedQuestion({ ...editedQuestion, ...updates });
  };

  const handleSaveConfirm = () => {
    const questionToSave = {
      ...editedQuestion,
      newConditionalQuestions: (editedQuestion as any).newConditionalQuestions || [],
    };
    setShowSaveConfirmation(false);
    onSave(questionToSave as Question);
  };

  const handleAddOption = () => {
    if (!newOptionText.trim()) return;
    const newOption = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: newOptionText.trim(),
      textDa: newOptionText.trim(),
      textEn: newOptionTextEn.trim() || undefined,
    };
    handleUpdate({
      options: [...(editedQuestion.options || []), newOption],
    });
    setNewOptionText('');
    setNewOptionTextEn('');
  };

  const handleAddOtherOption = () => {
    const hasOtherOption = editedQuestion.options?.some(opt => opt.isOther);
    if (hasOtherOption) return;
    
    const otherOption = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: 'Andet',
      textDa: 'Andet',
      textEn: 'Other',
      isOther: true,
    };
    handleUpdate({
      options: [...(editedQuestion.options || []), otherOption],
    });
  };

  const handleRemoveOption = (optionId: string) => {
    handleUpdate({
      options: editedQuestion.options?.filter((opt) => opt.id !== optionId),
      conditionalChildren: editedQuestion.conditionalChildren?.filter(
        (cc) => cc.optionId !== optionId
      ),
    });
  };

  const getConditionalChildrenForOption = (optionId: string) => {
    return editedQuestion.conditionalChildren?.filter((cc) => cc.optionId === optionId) || [];
  };

  const handleRemoveConditional = (optionId: string, childQuestionId: string) => {
    handleUpdate({
      conditionalChildren: editedQuestion.conditionalChildren?.filter(
        (cc) => !(cc.optionId === optionId && cc.childQuestionId === childQuestionId)
      ),
    });
  };

  const handleAddConditionalToOption = (optionId: string, childQuestionId: string) => {
    const newConditional = {
      optionId,
      childQuestionId,
      order: (getConditionalChildrenForOption(optionId).length || 0) + 1,
    };
    handleUpdate({
      conditionalChildren: [...(editedQuestion.conditionalChildren || []), newConditional],
    });
  };

  const handleCreateNewConditional = () => {
    if (!creatingNewConditional || !(newConditionalQuestion.textDa || newConditionalQuestion.text)?.trim()) return;
    
    if ((newConditionalQuestion.type === 'multiple_choice' || newConditionalQuestion.type === 'multiple_choice_multiple') && 
        (!newConditionalQuestion.options || newConditionalQuestion.options.length === 0)) {
      return;
    }
    
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newConditional = {
      optionId: creatingNewConditional.optionId,
      childQuestionId: tempId,
      order: (getConditionalChildrenForOption(creatingNewConditional.optionId).length || 0) + 1,
    };
    
    const newQ = {
      ...newConditionalQuestion,
      tempId,
      optionId: creatingNewConditional.optionId,
      options: newConditionalQuestion.options?.map((opt, index) => ({
        ...opt,
        id: opt.id || `opt_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
      })),
    };
    
    setEditedQuestion((prev) => {
      const updated = {
        ...prev,
        conditionalChildren: [...(prev.conditionalChildren || []), newConditional],
        newConditionalQuestions: [
          ...((prev as any).newConditionalQuestions || []),
          newQ,
        ],
      };
      return updated;
    });
    
    setCreatingNewConditional(null);
    setNewConditionalQuestion({ text: '', type: 'text', options: [] });
    setNewConditionalOptionText('');
    setNewConditionalOptionTextEn('');
  };

  const handleAddOtherOptionToNewConditional = () => {
    const hasOther = newConditionalQuestion.options?.some((opt) => opt.isOther);
    if (hasOther) return;

    const otherOption = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: 'Andet',
      textDa: 'Andet',
      textEn: 'Other',
      isOther: true,
    };

    setNewConditionalQuestion({
      ...newConditionalQuestion,
      options: [...(newConditionalQuestion.options || []), otherOption],
    });
  };

  const handleAddConditionalOption = () => {
    if (newConditionalOptionText.trim()) {
      const newOption = {
        id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: newConditionalOptionText.trim(),
        textDa: newConditionalOptionText.trim(),
        textEn: newConditionalOptionTextEn.trim() || undefined,
      };
      setNewConditionalQuestion({
        ...newConditionalQuestion,
        options: [...(newConditionalQuestion.options || []), newOption],
      });
      setNewConditionalOptionText('');
      setNewConditionalOptionTextEn('');
    }
  };

  const handleCancelNewConditional = () => {
    setCreatingNewConditional(null);
    setNewConditionalQuestion({ text: '', type: 'text', options: [] });
    setNewConditionalOptionText('');
    setNewConditionalOptionTextEn('');
  };

  const handleUpdateOptionText = (optionId: string, field: 'textDa' | 'textEn', value: string) => {
    handleUpdate({
      options: editedQuestion.options?.map((opt) =>
        opt.id === optionId ? { ...opt, [field]: value, ...(field === 'textDa' ? { text: value } : {}) } : opt
      ),
    });
  };

  const handleUpdateOptionColorCode = (optionId: string, colorCode: 'green' | 'yellow' | 'red' | '') => {
    handleUpdate({
      options: editedQuestion.options?.map((opt) =>
        opt.id === optionId 
          ? { ...opt, colorCode: colorCode ? colorCode : undefined }
          : opt
      ),
    });
  };

  const handleUpdateNewConditionalQuestion = (updates: Partial<Question>) => {
    setNewConditionalQuestion({ ...newConditionalQuestion, ...updates });
  };

  const handleUpdateNewConditionalQuestionType = (newType: QuestionType) => {
    setNewConditionalQuestion({ 
      ...newConditionalQuestion, 
      type: newType,
      options: (newType === 'multiple_choice' || newType === 'multiple_choice_multiple') ? (newConditionalQuestion.options || []) : undefined,
    });
  };

  const handleUpdateNewConditionalOption = (index: number, field: 'textDa' | 'textEn', value: string) => {
    setNewConditionalQuestion({
      ...newConditionalQuestion,
      options: newConditionalQuestion.options?.map((o, i) =>
        i === index ? { ...o, [field]: value, ...(field === 'textDa' ? { text: value } : {}) } : o
      ),
    });
  };

  const handleRemoveNewConditionalOption = (index: number) => {
    setNewConditionalQuestion({
      ...newConditionalQuestion,
      options: newConditionalQuestion.options?.filter((_, i) => i !== index),
    });
  };

  return {
    editedQuestion,
    showSaveConfirmation,
    newOptionText,
    newOptionTextEn,
    expandedOption,
    creatingNewConditional,
    newConditionalQuestion,
    newConditionalOptionText,
    newConditionalOptionTextEn,
    setShowSaveConfirmation,
    setNewOptionText,
    setNewOptionTextEn,
    setExpandedOption,
    setCreatingNewConditional,
    setNewConditionalOptionText,
    setNewConditionalOptionTextEn,
    handleUpdate,
    handleSaveConfirm,
    handleAddOption,
    handleAddOtherOption,
    handleRemoveOption,
    getConditionalChildrenForOption,
    handleRemoveConditional,
    handleAddConditionalToOption,
    handleCreateNewConditional,
    handleAddOtherOptionToNewConditional,
    handleAddConditionalOption,
    handleCancelNewConditional,
    handleUpdateOptionText,
    handleUpdateOptionColorCode,
    handleUpdateNewConditionalQuestion,
    handleUpdateNewConditionalQuestionType,
    handleUpdateNewConditionalOption,
    handleRemoveNewConditionalOption,
  };
};








