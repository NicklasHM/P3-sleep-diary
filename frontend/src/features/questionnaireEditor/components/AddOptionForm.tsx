import React from 'react';
import { useTranslation } from 'react-i18next';

interface AddOptionFormProps {
  newOptionText: string;
  newOptionTextEn: string;
  onTextChange: (text: string) => void;
  onTextEnChange: (textEn: string) => void;
  onAdd: () => void;
  hasOtherOption: boolean;
  onAddOther: () => void;
}

const AddOptionForm: React.FC<AddOptionFormProps> = ({
  newOptionText,
  newOptionTextEn,
  onTextChange,
  onTextEnChange,
  onAdd,
  hasOtherOption,
  onAddOther,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="add-option" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input
          type="text"
          value={newOptionText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={t('editor.newOption') + ' (Dansk)'}
          className="form-input"
          onKeyPress={(e) => e.key === 'Enter' && onAdd()}
        />
        <input
          type="text"
          value={newOptionTextEn}
          onChange={(e) => onTextEnChange(e.target.value)}
          placeholder={t('editor.newOption') + ' (English)'}
          className="form-input"
          onKeyPress={(e) => e.key === 'Enter' && onAdd()}
        />
        <button onClick={onAdd} className="btn btn-primary">
          {t('common.add')}
        </button>
      </div>
      <div style={{ marginTop: '8px' }}>
        <button 
          onClick={onAddOther} 
          className="btn btn-secondary"
          disabled={hasOtherOption}
        >
          {t('editor.addOtherOption')}
        </button>
      </div>
    </>
  );
};

export default AddOptionForm;

