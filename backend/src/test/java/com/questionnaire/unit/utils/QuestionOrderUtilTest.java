package com.questionnaire.unit.utils;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static com.questionnaire.utils.QuestionOrderUtil.childOrder;
import static org.junit.jupiter.api.Assertions.assertEquals;

@DisplayName("QuestionOrderUtil Unit Tests")
class QuestionOrderUtilTest {

    @Test
    @DisplayName("Child order bør være parent*100 + childIndex")
    void childOrderComputesDeterministically() {
        assertEquals(101, childOrder(1, 1));
        assertEquals(102, childOrder(1, 2));
        assertEquals(203, childOrder(2, 3));
    }

    @Test
    @DisplayName("Child order fra forskellige forældre kolliderer ikke")
    void childOrderIsUniquePerParent() {
        assertEquals(101, childOrder(1, 1));
        assertEquals(201, childOrder(2, 1));
        assertEquals(301, childOrder(3, 1));
    }
}

