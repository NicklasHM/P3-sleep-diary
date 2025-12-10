package com.questionnaire.integration.flow;

import com.questionnaire.exception.ValidationException;
import com.questionnaire.model.Question;
import com.questionnaire.model.QuestionType;
import com.questionnaire.model.Questionnaire;
import com.questionnaire.model.QuestionnaireType;
import com.questionnaire.model.Response;
import com.questionnaire.model.User;
import com.questionnaire.model.UserRole;
import com.questionnaire.repository.ResponseRepository;
import com.questionnaire.repository.UserRepository;
import com.questionnaire.service.interfaces.IQuestionnaireService;
import com.questionnaire.service.interfaces.IResponseService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Smal integrationstest for ResponseService mod repository og questionnaire-service.
 * Dækker kun lag der er nødvendige for at gemme/validere/beregne svar.
 */
@SpringBootTest
@DisplayName("ResponseService integrationstest (service + repo)")
class ResponseServiceIntegrationTest {

    @Autowired
    private IResponseService responseService;

    @Autowired
    private IQuestionnaireService questionnaireService;

    @Autowired
    private ResponseRepository responseRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private String questionnaireId;

    @BeforeEach
    void setUp() {
        deleteExistingTestUser();
        testUser = createTestUser();
        Questionnaire questionnaire = questionnaireService.getQuestionnaireByType(QuestionnaireType.morning);
        questionnaireId = questionnaire.getId();
    }

    @AfterEach
    void tearDown() {
        deleteExistingTestUser();
    }

    @Test
    @DisplayName("Gemmer validt response og persisterer svarene")
    void shouldPersistResponseWithValidAnswers() {
        Map<String, Object> answers = createValidMorningAnswers(questionnaireId);

        Response saved = responseService.saveResponse(testUser.getId(), questionnaireId, answers);

        assertNotNull(saved.getId());
        assertEquals(testUser.getId(), saved.getUserId());
        assertEquals(questionnaireId, saved.getQuestionnaireId());
        assertTrue(responseRepository.findById(saved.getId()).isPresent(), "Response skal persisteres");
    }

    @Test
    @DisplayName("Afviser ugyldige tider med ValidationException")
    void shouldRejectInvalidAnswers() {
        Map<String, Object> answers = createInvalidMorningAnswers(questionnaireId);

        assertThrows(ValidationException.class, () ->
            responseService.saveResponse(testUser.getId(), questionnaireId, answers)
        );
    }

    @Test
    @DisplayName("Beregner sleep parameters for gemt response")
    void shouldCalculateSleepParameters() {
        Map<String, Object> answers = createValidMorningAnswers(questionnaireId);
        Response saved = responseService.saveResponse(testUser.getId(), questionnaireId, answers);

        var sleepParameters = responseService.calculateSleepParameters(saved.getId());

        assertNotNull(sleepParameters, "Sleep parameters skal beregnes");
        assertTrue(sleepParameters.getTST() > 0, "Total sleep time skal være sat");
    }

    private Map<String, Object> createValidMorningAnswers(String qId) {
        List<Question> questions = questionnaireService.getQuestionsByQuestionnaireId(qId);
        Map<String, Object> answers = new HashMap<>();

        for (Question question : questions) {
            int order = question.getOrder();
            if (order == 1 && question.getType() == QuestionType.multiple_choice) {
                answers.put(question.getId(), "med_no");
            } else if (order == 2 && question.getType() == QuestionType.text) {
                answers.put(question.getId(), "Læste en bog");
            } else if (order == 3 && question.getType() == QuestionType.time_picker) {
                answers.put(question.getId(), "22:00");
            } else if (order == 4 && question.getType() == QuestionType.time_picker) {
                answers.put(question.getId(), "22:15");
            } else if (order == 5 && question.getType() == QuestionType.numeric) {
                answers.put(question.getId(), 20);
            } else if (order == 6 && question.getType() == QuestionType.multiple_choice) {
                answers.put(question.getId(), "wake_yes");
            } else if (order == 601 && question.getType() == QuestionType.numeric) {
                answers.put(question.getId(), 1);
            } else if (order == 602 && question.getType() == QuestionType.numeric) {
                answers.put(question.getId(), 10);
            } else if (order == 7 && question.getType() == QuestionType.time_picker) {
                answers.put(question.getId(), "07:00");
            } else if (order == 8 && question.getType() == QuestionType.time_picker) {
                answers.put(question.getId(), "07:30");
            } else if (order == 9 && question.getType() == QuestionType.slider) {
                answers.put(question.getId(), 3);
            }
        }
        return answers;
    }

    private Map<String, Object> createInvalidMorningAnswers(String qId) {
        List<Question> questions = questionnaireService.getQuestionsByQuestionnaireId(qId);
        Map<String, Object> answers = new HashMap<>();

        for (Question question : questions) {
            if (question.getOrder() == 3 && question.getType() == QuestionType.time_picker) {
                answers.put(question.getId(), "22:30");
            } else if (question.getOrder() == 4 && question.getType() == QuestionType.time_picker) {
                answers.put(question.getId(), "22:00"); // før gik i seng
            }
        }
        return answers;
    }

    private User createTestUser() {
        User user = new User();
        user.setUsername("testuser");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setPassword("testpassword123");
        user.setRole(UserRole.BORGER);
        return userRepository.save(user);
    }

    private void deleteExistingTestUser() {
        Optional<User> existingTestUser = userRepository.findByUsername("testuser");
        if (existingTestUser.isPresent()) {
            User existingUser = existingTestUser.get();
            List<Response> responses = responseRepository.findByUserId(existingUser.getId());
            if (!responses.isEmpty()) {
                responseRepository.deleteAll(responses);
            }
            userRepository.delete(existingUser);
        }
    }
}

