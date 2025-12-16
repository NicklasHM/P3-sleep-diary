package com.questionnaire.utils;

/**
 * Hjælper til beregning af rækkefølge for conditional (child) spørgsmål,
 * så alle børn af et spørgsmål får entydige order-værdier tæt på forælderen.
 */
public final class QuestionOrderUtil {

    private QuestionOrderUtil() {
        // Utility class
    }

    /**
     * Beregn order-værdi til et child-spørgsmål.
     * Eksempel: parent=1, childIndex=1 -> 101; parent=2, childIndex=3 -> 203.
     *
     * @param parentOrder det order-tal forælder-spørgsmålet har
     * @param childIndex  løbenummer for barnet (1-baseret)
     * @return entydigt order-tal for barnet
     */
    public static int childOrder(int parentOrder, int childIndex) {
        return parentOrder * 100 + childIndex;
    }
}








