package com.questionnaire.integration.response;

import com.questionnaire.model.QuestionnaireType;
import com.questionnaire.model.ResolvedQuestionnaire;
import com.questionnaire.model.Response;
import com.questionnaire.model.SleepParameters;
import com.questionnaire.repository.QuestionRepository;
import com.questionnaire.repository.ResponseRepository;
import com.questionnaire.service.QuestionnaireResolver;
import com.questionnaire.service.ResponseServiceImpl;
import com.questionnaire.service.interfaces.IQuestionService;
import com.questionnaire.service.interfaces.IQuestionnaireService;
import com.questionnaire.service.interfaces.IResponseValidationService;
import com.questionnaire.service.interfaces.ISleepParameterCalculator;
import com.questionnaire.strategy.DefaultConditionalLogic;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Smal integrationstest: kun ResponseService + mocks af øvrige beans.
 * Dækker 2–3 metoder: resolve + validate + save (mocked repo).
 */
@SpringBootTest(classes = ResponseServiceImpl.class)
@DisplayName("ResponseService integrationstest (smal, mocked deps)")
class ResponseServiceIntegrationTest {

    @Autowired
    private ResponseServiceImpl responseService;

    @MockBean private ResponseRepository responseRepository;
    @MockBean private QuestionRepository questionRepository;
    @MockBean private ISleepParameterCalculator sleepParameterCalculator;
    @MockBean private IQuestionnaireService questionnaireService;
    @MockBean private IQuestionService questionService;
    @MockBean private IResponseValidationService responseValidationService;
    @MockBean private DefaultConditionalLogic conditionalLogicStrategy;
    @MockBean private QuestionnaireResolver questionnaireResolver;

    @Test
    @DisplayName("saveResponse kalder validate og persisterer via repository")
    void saveResponse_callsValidateAndSaves() {
        Map<String, Object> answers = new HashMap<>();
        answers.put("q1", "value");

        ResolvedQuestionnaire resolved = new ResolvedQuestionnaire("qid", QuestionnaireType.morning);
        when(questionnaireResolver.resolveQuestionnaireId("qid")).thenReturn(resolved);
        when(responseRepository.findByUserIdAndQuestionnaireTypeAndDateRange(anyString(), any(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(sleepParameterCalculator.calculate(anyMap(), eq("qid")))
                .thenReturn(new SleepParameters(1, 2, 3, 4));
        when(responseRepository.save(any(Response.class))).thenAnswer(inv -> inv.getArgument(0));

        Response result = responseService.saveResponse("user-1", "qid", answers);

        verify(responseValidationService).validateResponse("qid", answers);
        assertEquals("user-1", result.getUserId());
        assertEquals("qid", result.getQuestionnaireId());
        assertNotNull(result.getSleepParameters());
    }
}

