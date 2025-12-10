package com.questionnaire.validation;

import com.questionnaire.exception.ValidationException;
import com.questionnaire.model.Question;
import org.springframework.stereotype.Component;

/**
 * Validator for text answers
 */
@Component
public class TextAnswerValidator implements AnswerValidator {
    
    @Override
    public void validate(Question question, Object answer) throws ValidationException {
        String text = answer.toString();

        Integer maxLength = question.getMaxLength();
        if (maxLength != null && text.length() > maxLength) {
            throw new ValidationException(
                String.format("Teksten for '%s' må højst være %d tegn. Du indtastede %d tegn.",
                    question.getText(), maxLength, text.length())
            );
        }

        Integer minLength = question.getMinLength();
        if (minLength != null && text.trim().length() < minLength) {
            throw new ValidationException(
                String.format("Teksten for '%s' skal mindst være %d tegn.", question.getText(), minLength)
            );
        }

        if (text.trim().isEmpty()) {
            throw new ValidationException(
                String.format("Teksten for '%s' skal indeholde mindst 1 tegn.", question.getText())
            );
        }
    }
}



