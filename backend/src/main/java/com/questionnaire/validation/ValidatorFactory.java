package com.questionnaire.validation;

import com.questionnaire.model.QuestionType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Factory til at returnere korrekt validator baseret på question type
 * Polymorphism pattern
 */
@Component
public class ValidatorFactory {
    
    private final TextAnswerValidator textValidator;
    private final NumericAnswerValidator numericValidator;
    private final TimeAnswerValidator timeValidator;
    private final MultipleChoiceAnswerValidator multipleChoiceValidator;
    
    @Autowired
    public ValidatorFactory(TextAnswerValidator textValidator,
                           NumericAnswerValidator numericValidator,
                           TimeAnswerValidator timeValidator,
                           MultipleChoiceAnswerValidator multipleChoiceValidator) {
        this.textValidator = textValidator;
        this.numericValidator = numericValidator;
        this.timeValidator = timeValidator;
        this.multipleChoiceValidator = multipleChoiceValidator;
    }
    
    /**
     * Returnerer korrekt validator baseret på question type
     */
    public AnswerValidator getValidator(QuestionType type) {
        switch (type) {
            case text:
                return textValidator;
            case numeric:
            case slider:
                return numericValidator;
            case time_picker:
                return timeValidator;
            case multiple_choice:
            case multiple_choice_multiple:
                return multipleChoiceValidator;
            default:
                // Default validator (ingen validering)
                return (question, answer) -> {};
        }
    }
}






