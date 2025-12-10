package com.questionnaire.service;

import com.questionnaire.service.interfaces.IResponseValidationService;
import com.questionnaire.validation.UnifiedQuestionnaireValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Service til validering af response data
 * Uses unified validator for all questionnaires
 */
@Service
public class ResponseValidationServiceImpl implements IResponseValidationService {

    private final UnifiedQuestionnaireValidator questionnaireValidator;

    @Autowired
    public ResponseValidationServiceImpl(UnifiedQuestionnaireValidator questionnaireValidator) {
        this.questionnaireValidator = questionnaireValidator;
    }

    /**
     * Validerer alle svar mod spørgsmålernes min/max værdier og tidslogik
     * Uses unified validator for all questionnaire types
     */
    public void validateResponse(String questionnaireId, Map<String, Object> answers) {
        // Kald validator's validate metode
        questionnaireValidator.validate(questionnaireId, answers);
    }
}

