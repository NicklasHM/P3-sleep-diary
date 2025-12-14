package com.questionnaire.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

public class ResponseRequest {
    @NotBlank(message = "Questionnaire ID er påkrævet")
    private String questionnaireId;
    
    @NotNull(message = "Svar er påkrævet")
    private Map<String, Object> answers;

    public ResponseRequest() {}

    public String getQuestionnaireId() {
        return questionnaireId;
    }

    public void setQuestionnaireId(String questionnaireId) {
        this.questionnaireId = questionnaireId;
    }

    public Map<String, Object> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<String, Object> answers) {
        this.answers = answers;
    }
}












