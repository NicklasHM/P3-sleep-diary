package com.questionnaire.model;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "questionnaires")
public class Questionnaire extends BaseEntity {
    private QuestionnaireType type;
    
    private String name;

    public Questionnaire() {
        super();
    }

    public Questionnaire(QuestionnaireType type, String name) {
        super();
        this.type = type;
        this.name = name;
    }

    // Getters and Setters
    public QuestionnaireType getType() {
        return type;
    }

    public void setType(QuestionnaireType type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}







