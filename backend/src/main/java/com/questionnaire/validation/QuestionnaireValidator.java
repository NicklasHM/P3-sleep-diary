package com.questionnaire.validation;

import com.questionnaire.model.Question;
import com.questionnaire.model.QuestionType;
import com.questionnaire.repository.QuestionRepository;
import com.questionnaire.service.QuestionFinder;
import com.questionnaire.service.interfaces.IQuestionnaireService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Abstract base class for questionnaire-specific validators
 * Implements template method pattern for validation
 */
public abstract class QuestionnaireValidator {
    
    protected final ValidatorFactory validatorFactory;
    protected final IQuestionnaireService questionnaireService;
    protected final QuestionFinder questionFinder;
    protected final QuestionRepository questionRepository;
    
    public QuestionnaireValidator(ValidatorFactory validatorFactory,
                                 IQuestionnaireService questionnaireService,
                                 QuestionFinder questionFinder,
                                 QuestionRepository questionRepository) {
        this.validatorFactory = validatorFactory;
        this.questionnaireService = questionnaireService;
        this.questionFinder = questionFinder;
        this.questionRepository = questionRepository;
    }
    
    /**
     * Template method for validation
     * Defines the algorithm structure
     */
    public final void validate(String questionnaireId, Map<String, Object> answers) {
        List<Question> questions = getQuestions(questionnaireId);
        validateBasicAnswers(questions, answers);
        validateSpecificRules(questions, answers, questionnaireId);
    }
    
    /**
     * Henter spørgsmål for questionnaire
     */
    protected List<Question> getQuestions(String questionnaireId) {
        return questionRepository.findByQuestionnaireIdOrderByOrderAsc(questionnaireId);
    }
    
    /**
     * Validerer grundlæggende svar (min/max værdier, formater, etc.)
     * Dette er fælles for alle questionnaire typer
     */
    protected void validateBasicAnswers(List<Question> questions, Map<String, Object> answers) {
        Map<String, ConditionalParent> conditionalIndex = buildConditionalIndex(questions);

        for (Question question : questions) {
            // Tjek om dette spørgsmål er et conditional child der ikke skal vises
            if (isConditionalChildThatShouldNotBeShown(question, conditionalIndex, answers)) {
                continue; // Spring over conditional children der ikke skal vises
            }
            
            Object answer = answers.get(question.getId());
            if (answer == null) continue;
            
            // Brug polymorphism pattern - få korrekt validator baseret på question type
            AnswerValidator validator = validatorFactory.getValidator(question.getType());
            
            if (question.getType() == QuestionType.text || 
                question.getType() == QuestionType.numeric || question.getType() == QuestionType.slider || 
                       question.getType() == QuestionType.time_picker || 
                       question.getType() == QuestionType.multiple_choice || 
                       question.getType() == QuestionType.multiple_choice_multiple) {
                // Brug validator for alle typer vi understøtter
                validator.validate(question, answer);
            }
        }
    }
    
    /**
     * Tjekker om et spørgsmål er et conditional child der ikke skal vises baseret på parent svar
     */
    private boolean isConditionalChildThatShouldNotBeShown(Question question, Map<String, ConditionalParent> conditionalIndex, Map<String, Object> answers) {
        ConditionalParent parentInfo = conditionalIndex.get(question.getId());
        if (parentInfo == null) {
            return false; // Ikke et conditional child
        }

        Object parentAnswer = answers.get(parentInfo.parentQuestion.getId());
        if (parentAnswer == null) {
            return true; // Parent er ikke besvaret, så child skal ikke vises
        }

        String parentOptionId = com.questionnaire.utils.AnswerParser.extractOptionId(parentAnswer);
        return parentOptionId == null || !parentOptionId.equals(parentInfo.optionId);
    }

    /**
     * Bygger et opslag fra child-question-id til parent og optionId for O(1) opslag i validering.
     */
    private Map<String, ConditionalParent> buildConditionalIndex(List<Question> questions) {
        Map<String, ConditionalParent> index = new HashMap<>();
        for (Question parentQuestion : questions) {
            if (parentQuestion.getConditionalChildren() == null) {
                continue;
            }
            for (com.questionnaire.model.ConditionalChild cc : parentQuestion.getConditionalChildren()) {
                if (cc.getChildQuestionId() != null) {
                    index.put(cc.getChildQuestionId(), new ConditionalParent(parentQuestion, cc.getOptionId()));
                }
            }
        }
        return index;
    }

    private static final class ConditionalParent {
        private final Question parentQuestion;
        private final String optionId;

        private ConditionalParent(Question parentQuestion, String optionId) {
            this.parentQuestion = parentQuestion;
            this.optionId = optionId;
        }
    }
    
    /**
     * Abstract method for questionnaire-specific validation rules
     * Must be implemented by subclasses
     */
    protected abstract void validateSpecificRules(List<Question> questions, Map<String, Object> answers, String questionnaireId);
}



