import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  DndContext,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { QuestionType } from '../types';
import AdvisorQuestionnaireEditorSkeleton from '../components/AdvisorQuestionnaireEditorSkeleton';
import { useQuestionnaireEditor } from '../features/questionnaireEditor/useQuestionnaireEditor';
import QuestionnaireEditorHeader from '../features/questionnaireEditor/components/QuestionnaireEditorHeader';
import SortableQuestionItem from '../features/questionnaireEditor/components/SortableQuestionItem';
import QuestionEditModal from '../features/questionnaireEditor/components/QuestionEditModal';
import './AdvisorQuestionnaireEditor.css';

const AdvisorQuestionnaireEditor = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const {
    questionnaire,
    questions,
    loading,
    error,
    setError,
    editingQuestion,
    setEditingQuestion,
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
  } = useQuestionnaireEditor();

  if (loading) {
    return <AdvisorQuestionnaireEditorSkeleton />;
  }

  return (
    <div className="editor-container">
      <QuestionnaireEditorHeader
        type={type || ''}
        isReadOnly={isReadOnly}
        onBack={() => navigate('/advisor')}
        onLogout={logout}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <div className="container">
        {error && (
          <div className="error-message" onClick={() => setError('')}>
            {error} ({t('common.close')})
          </div>
        )}

        {!isReadOnly && (
          <div className="editor-actions">
            <button
              onClick={() => {
                setShowAddQuestion(true);
                setEditingQuestion({
                  id: undefined as any,
                  questionnaireId: questionnaire!.id,
                  text: '',
                  type: 'text' as QuestionType,
                  isLocked: false,
                  order: questions.length + 1,
                });
              }}
              className="btn btn-primary"
            >
              {t('editor.addQuestion')}
            </button>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={rootQuestions.map((q) => q.id || `temp_${q.order}`)} strategy={verticalListSortingStrategy}>
            <div className="questions-list">
              {rootQuestions.map((question, index) => (
                <SortableQuestionItem
                  key={question.id || `temp_${question.order}_${index}`}
                  question={question}
                  isReadOnly={isReadOnly}
                  allQuestions={questions}
                  onEdit={() => setEditingQuestion(question)}
                  onEditChild={(childQuestion) => setEditingQuestion(childQuestion)}
                  onDelete={() => {
                    if (question.id) {
                      handleDeleteQuestion(question.id);
                    } else {
                      setError(t('editor.missingId'));
                    }
                  }}
                  onAddConditional={() => {}}
                  onRemoveConditional={handleRemoveConditional}
                  onMoveConditional={handleMoveConditional}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {editingQuestion && (
          <QuestionEditModal
            question={editingQuestion}
            onSave={handleSaveQuestion}
            onClose={() => {
              setEditingQuestion(null);
              setShowAddQuestion(false);
            }}
            allQuestions={questions}
            onAddConditional={() => {}}
            questionnaireType={type}
          />
        )}

        {deleteConfirmation && (
          <div className="modal-overlay" onClick={cancelDelete}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{t('editor.confirmDelete')}</h2>
              <div className="modal-actions">
                <button onClick={cancelDelete} className="btn btn-secondary">
                  {t('common.cancel')}
                </button>
                <button onClick={confirmDelete} className="btn btn-danger">
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvisorQuestionnaireEditor;
