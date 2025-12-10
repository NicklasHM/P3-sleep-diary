package com.questionnaire.unit.service;

import com.questionnaire.model.Question;
import com.questionnaire.repository.QuestionRepository;
import com.questionnaire.service.QuestionServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("QuestionServiceImpl unit-tests")
class QuestionServiceImplTest {

    @Mock
    private QuestionRepository questionRepository;

    @InjectMocks
    private QuestionServiceImpl questionService;

    @Test
    @DisplayName("createQuestion nulstiller id og kalder validate + save")
    void createQuestion_resetsIdAndSaves() {
        Question question = spy(new Question());
        doNothing().when(question).validate();
        when(questionRepository.save(any(Question.class))).thenAnswer(inv -> inv.getArgument(0));

        Question saved = questionService.createQuestion(question);

        verify(question).setId(null);
        verify(question).validate();
        verify(questionRepository).save(question);
        assertNull(saved.getId());
    }
}

