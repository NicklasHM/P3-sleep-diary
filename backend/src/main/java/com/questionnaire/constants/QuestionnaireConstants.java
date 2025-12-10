package com.questionnaire.constants;

/**
 * Constants for questionnaire system
 */
public class QuestionnaireConstants {
    
    // Question order constants for morning questionnaire (kun de anvendte)
    public static final int ORDER_3 = 3; // Gik i seng klokken
    public static final int ORDER_4 = 4; // Slukkede lyset klokken
    public static final int ORDER_5 = 5; // Faldt i søvn efter (minutter)
    public static final int ORDER_6 = 6;    // Vågnede du i løbet af natten? (multiple_choice)
    public static final int ORDER_601 = 601; // Hvor mange gange? (numeric) child til Q6
    public static final int ORDER_602 = 602; // Hvor mange minutter? (numeric - WASO) child til Q6
    public static final int ORDER_7 = 7;    // Vågnede klokken
    public static final int ORDER_8 = 8;    // Stod op klokken
    
    // Validation limits
    public static final int MIN_PASSWORD_LENGTH = 8;
    
    // Time format
    public static final String TIME_FORMAT = "HH:mm";
    
    // Copenhagen timezone
    public static final String COPENHAGEN_TIMEZONE = "Europe/Copenhagen";
    
    // Questionnaire type string constants
    public static final String QUESTIONNAIRE_TYPE_MORNING = "morning";
    public static final String QUESTIONNAIRE_TYPE_EVENING = "evening";
    
    // Private constructor to prevent instantiation
    private QuestionnaireConstants() {
        throw new UnsupportedOperationException("Constants class cannot be instantiated");
    }
}

