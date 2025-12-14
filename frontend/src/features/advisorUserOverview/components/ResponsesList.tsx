import React from 'react';
import type { Question, QuestionOption, Response } from '../../../types';
import {
  ColorCode,
  formatMinutesToTime,
  getColorClass,
  getSOLColor,
  getTIBColor,
  getTSTColor,
  getWASOColor,
  parseTimeToMinutes
} from '../utils';

type ResponsesListProps = {
  t: (key: string, vars?: Record<string, any>) => string;
  responses: Response[];
  questions: Map<string, Question>;
  sleepDataMap: Map<string, any>;
  expandedResponses: Set<string>;
  toggleResponse: (id: string) => void;
};

const ResponsesList: React.FC<ResponsesListProps> = ({
  t,
  responses,
  questions,
  sleepDataMap,
  expandedResponses,
  toggleResponse
}) => {
  const renderAnswer = (response: Response, questionId: string, answer: any) => {
    const question = questions.get(questionId);
    const questionText = question?.text || `Spørgsmål ${questionId}`;

    let displayAnswer = String(answer);
    let answerColor: ColorCode | null = null;

    if (question?.type === 'multiple_choice' && question.options) {
      let selectedOption: QuestionOption | undefined;

      if (typeof answer === 'object' && answer !== null && 'optionId' in answer && 'customText' in answer) {
        selectedOption = question.options.find((opt) => opt.id === (answer as any).optionId);
        if (selectedOption?.isOther) {
          displayAnswer = t('userOverview.otherAnswer', { text: (answer as any).customText || '' });
        } else if (selectedOption) {
          displayAnswer = selectedOption.text;
        }
      } else {
        selectedOption = question.options.find((opt) => opt.id === answer);
        if (selectedOption) {
          displayAnswer = selectedOption.text;
        }
      }

      if (response.questionnaireType === 'evening' && selectedOption?.colorCode) {
        answerColor = selectedOption.colorCode as ColorCode;
      }
    }

    if (question?.type === 'multiple_choice_multiple' && question.options) {
      let answerItems: any[] = [];
      if (Array.isArray(answer)) {
        answerItems = answer;
      } else if (typeof answer === 'string' && answer.includes(',')) {
        answerItems = answer.split(',').map((id) => id.trim());
      } else if (answer) {
        answerItems = [answer];
      }

      const optionTexts: string[] = [];
      const optionColorCodes: ColorCode[] = [];

      answerItems.forEach((item: any) => {
        let selectedOption: QuestionOption | undefined;

        if (typeof item === 'object' && item !== null && 'optionId' in item && 'customText' in item) {
          selectedOption = question.options?.find((opt) => opt.id === item.optionId);
          if (selectedOption?.isOther) {
            optionTexts.push(t('userOverview.otherAnswer', { text: item.customText || '' }));
          } else if (selectedOption) {
            optionTexts.push(selectedOption.text);
          }
        } else {
          selectedOption = question.options?.find((opt) => opt.id === item);
          if (selectedOption) {
            optionTexts.push(selectedOption.text);
          }
        }

        if (response.questionnaireType === 'evening' && selectedOption?.colorCode) {
          optionColorCodes.push(selectedOption.colorCode as ColorCode);
        }
      });

      if (optionTexts.length > 0) {
        displayAnswer = optionTexts.join(', ');
      }

      if (response.questionnaireType === 'evening' && optionColorCodes.length > 0) {
        if (optionColorCodes.includes('red')) {
          answerColor = 'red';
        } else if (optionColorCodes.includes('yellow')) {
          answerColor = 'yellow';
        } else {
          answerColor = 'green';
        }
      }
    }

    if (question && response.questionnaireType === 'evening') {
      const numValue = typeof answer === 'number' ? answer : parseFloat(String(answer));

      if (question.hasColorCode && !isNaN(numValue)) {
        const { colorCodeGreenMax, colorCodeGreenMin, colorCodeYellowMin, colorCodeYellowMax, colorCodeRedMin, colorCodeRedMax } = question;

        if (
          colorCodeGreenMin !== undefined &&
          colorCodeGreenMax !== undefined &&
          numValue >= colorCodeGreenMin &&
          numValue <= colorCodeGreenMax
        ) {
          answerColor = 'green';
        } else if (
          colorCodeYellowMin !== undefined &&
          colorCodeYellowMax !== undefined &&
          numValue >= colorCodeYellowMin &&
          numValue <= colorCodeYellowMax
        ) {
          answerColor = 'yellow';
        } else if (
          colorCodeRedMin !== undefined &&
          colorCodeRedMax !== undefined &&
          numValue >= colorCodeRedMin &&
          numValue <= colorCodeRedMax
        ) {
          answerColor = 'red';
        }
      }
    }

    const displayQuestionText = questionText.trim().endsWith(':') ? questionText.trim() : `${questionText}:`;

    return (
      <div key={questionId} className={`answer-item ${answerColor ? getColorClass(answerColor) : ''}`}>
        <strong>{displayQuestionText}</strong> {displayAnswer}
      </div>
    );
  };

  const renderSleepParameters = (response: Response) => {
    if (response.questionnaireType !== 'morning' || !sleepDataMap.has(response.id)) return null;

    const sleepParams = sleepDataMap.get(response.id)?.sleepParameters;
    if (!sleepParams) return null;

    const tibMinutes =
      typeof sleepParams.TIB === 'string'
        ? parseTimeToMinutes(sleepParams.TIB)
        : sleepParams.TIBMinutes || sleepParams.TIB || 0;
    const tstMinutes =
      typeof sleepParams.TST === 'string'
        ? parseTimeToMinutes(sleepParams.TST)
        : sleepParams.TSTMinutes || sleepParams.TST || 0;
    const solMinutes = sleepParams.SOL || 0;
    const wasoMinutes = sleepParams.WASO || 0;

    const solColor = getSOLColor(solMinutes);
    const wasoColor = getWASOColor(wasoMinutes);
    const tibColor = getTIBColor(tibMinutes);
    const tstColor = getTSTColor(tstMinutes, tibMinutes);

    return (
      <div className="response-sleep-parameters">
        <h4>{t('userOverview.sleepParametersTitle')}</h4>
        <div className="sleep-parameters-grid">
          <div className={`param-card ${getColorClass(solColor)}`}>
            <span className="param-label">SOL:</span>
            <span className="param-value">{solMinutes} min</span>
          </div>
          <div className={`param-card ${getColorClass(wasoColor)}`}>
            <span className="param-label">WASO:</span>
            <span className="param-value">{wasoMinutes} min</span>
          </div>
          <div className={`param-card ${getColorClass(tibColor)}`}>
            <span className="param-label">TIB:</span>
            <span className="param-value">
              {typeof sleepParams.TIB === 'string' ? sleepParams.TIB : formatMinutesToTime(tibMinutes)}
            </span>
          </div>
          <div className={`param-card ${getColorClass(tstColor)}`}>
            <span className="param-label">TST:</span>
            <span className="param-value">
              {typeof sleepParams.TST === 'string' ? sleepParams.TST : formatMinutesToTime(tstMinutes)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="responses-list">
      {responses.map((response) => {
        const isExpanded = expandedResponses.has(response.id);
        return (
          <div key={response.id} className="response-item">
            <div
              className="response-header clickable"
              onClick={(e) => {
                e.stopPropagation();
                toggleResponse(response.id);
              }}
            >
              <div className="response-header-left">
                <span className="response-type">
                  {response.questionnaireType === 'morning' ? t('userOverview.morning') : t('userOverview.evening')}
                </span>
                <span className="response-date">{new Date(response.createdAt).toLocaleString('da-DK')}</span>
              </div>
              <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
            </div>
            {isExpanded && (
              <div className="response-answers">
                {renderSleepParameters(response)}
                <h4>{t('userOverview.responses')}</h4>
                {Object.entries(response.answers).map(([questionId, ans]) => renderAnswer(response, questionId, ans))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ResponsesList;






