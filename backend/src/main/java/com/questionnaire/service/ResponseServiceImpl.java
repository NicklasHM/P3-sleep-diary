package com.questionnaire.service;

import com.questionnaire.exception.ResponseAlreadyExistsException;
import com.questionnaire.exception.ValidationException;
import com.questionnaire.model.Question;
import com.questionnaire.model.Questionnaire;
import com.questionnaire.model.QuestionnaireType;
import com.questionnaire.model.ResolvedQuestionnaire;
import com.questionnaire.model.Response;
import com.questionnaire.model.SleepParameters;
import com.questionnaire.repository.QuestionRepository;
import com.questionnaire.repository.ResponseRepository;
import com.questionnaire.constants.QuestionnaireConstants;
import com.questionnaire.service.interfaces.IQuestionService;
import com.questionnaire.service.interfaces.IQuestionnaireService;
import com.questionnaire.service.interfaces.IResponseService;
import com.questionnaire.service.interfaces.IResponseValidationService;
import com.questionnaire.service.interfaces.ISleepParameterCalculator;
import com.questionnaire.strategy.DefaultConditionalLogic;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
public class ResponseServiceImpl implements IResponseService {

    private static final Logger logger = LoggerFactory.getLogger(ResponseServiceImpl.class);

    private final ResponseRepository responseRepository;
    private final QuestionRepository questionRepository;
    private final ISleepParameterCalculator sleepParameterCalculator;
    private final IQuestionnaireService questionnaireService;
    private final IQuestionService questionService;
    private final IResponseValidationService responseValidationService;
    private final DefaultConditionalLogic conditionalLogicStrategy;
    private final QuestionnaireResolver questionnaireResolver;

    @Autowired
    public ResponseServiceImpl(ResponseRepository responseRepository,
                              QuestionRepository questionRepository,
                              ISleepParameterCalculator sleepParameterCalculator,
                              IQuestionnaireService questionnaireService,
                              IQuestionService questionService,
                              IResponseValidationService responseValidationService,
                              DefaultConditionalLogic conditionalLogicStrategy,
                              QuestionnaireResolver questionnaireResolver) {
        this.responseRepository = responseRepository;
        this.questionRepository = questionRepository;
        this.sleepParameterCalculator = sleepParameterCalculator;
        this.questionnaireService = questionnaireService;
        this.questionService = questionService;
        this.responseValidationService = responseValidationService;
        this.conditionalLogicStrategy = conditionalLogicStrategy;
        this.questionnaireResolver = questionnaireResolver;
    }

    public Response saveResponse(String userId, String questionnaireId, Map<String, Object> answers) {
        // Resolve questionnaire ID og type
        ResolvedQuestionnaire resolved = resolveQuestionnaire(questionnaireId);
        if (resolved == null) {
            throw new RuntimeException("Kunne ikke finde spørgeskema: " + questionnaireId);
        }
        
        // Valider at der ikke allerede er en response i dag
        validateNoDuplicateResponse(userId, resolved.getQuestionnaireType());
        
        // Valider svar før vi gemmer
        responseValidationService.validateResponse(resolved.getQuestionnaireId(), answers);
        
        // Opret response med søvnparametre hvis nødvendigt
        Response response = createResponseWithSleepParameters(userId, resolved, answers);
        
        return responseRepository.save(response);
    }
    
    /**
     * Resolver questionnaire ID til faktisk ID og type
     */
    private ResolvedQuestionnaire resolveQuestionnaire(String questionnaireId) {
        return questionnaireResolver.resolveQuestionnaireId(questionnaireId);
    }
    
    /**
     * Validerer at der ikke allerede er en response for denne questionnaire type i dag
     */
    private void validateNoDuplicateResponse(String userId, QuestionnaireType questionnaireType) {
        if (hasResponseForToday(userId, questionnaireType)) {
            throw new ResponseAlreadyExistsException("Dette spørgeskema er allerede besvaret i dag");
        }
    }
    
    /**
     * Opretter Response og beregner søvnparametre hvis det er morgenskema
     */
    private Response createResponseWithSleepParameters(String userId, ResolvedQuestionnaire resolved, Map<String, Object> answers) {
        Response response = new Response(userId, resolved.getQuestionnaireId(), resolved.getQuestionnaireType(), answers);
        
        // Hvis det er morgenskema, beregn søvnparametre
        if (resolved.getQuestionnaireType() == QuestionnaireType.morning) {
            SleepParameters sleepParams = sleepParameterCalculator.calculate(answers, resolved.getQuestionnaireId());
            response.setSleepParameters(sleepParams);
        }
        
        return response;
    }

    public Question getNextQuestion(String questionnaireId, Map<String, Object> currentAnswers, String currentQuestionId) {
        return getNextQuestion(questionnaireId, currentAnswers, currentQuestionId, "da");
    }

    public Question getNextQuestion(String questionnaireId, Map<String, Object> currentAnswers, String currentQuestionId, String language) {
        // Konverter "morning"/"evening" til faktisk questionnaire ID hvis nødvendigt
        String actualQuestionnaireId = questionnaireId;
        if (QuestionnaireConstants.QUESTIONNAIRE_TYPE_MORNING.equals(questionnaireId)) {
            Questionnaire questionnaire = questionnaireService.getQuestionnaireByType(QuestionnaireType.morning);
            actualQuestionnaireId = questionnaire.getId();
        } else if (QuestionnaireConstants.QUESTIONNAIRE_TYPE_EVENING.equals(questionnaireId)) {
            Questionnaire questionnaire = questionnaireService.getQuestionnaireByType(QuestionnaireType.evening);
            actualQuestionnaireId = questionnaire.getId();
        }
        
        // Valider svar før vi går videre til næste spørgsmål
        responseValidationService.validateResponse(actualQuestionnaireId, currentAnswers);
        
        List<Question> allQuestions = questionRepository.findByQuestionnaireIdOrderByOrderAsc(actualQuestionnaireId);
        
        // Find nuværende spørgsmål
        Question currentQuestion = null;
        for (Question q : allQuestions) {
            if (q.getId().equals(currentQuestionId)) {
                currentQuestion = q;
                break;
            }
        }

        if (currentQuestion == null) {
            return null;
        }

        // Brug QuestionService til at finde root spørgsmål (ikke conditional children)
        List<Question> rootQuestions = questionService.findRootQuestions(allQuestions);

        // Find nuværende spørgsmåls order værdi
        int currentOrder = currentQuestion.getOrder();

        // Find næste root spørgsmål med højere order værdi
        Question nextRootQuestion = null;
        for (Question q : rootQuestions) {
            int questionOrder = q.getOrder();
            if (questionOrder > currentOrder) {
                // Tjek om spørgsmålet skal vises baseret på conditional logic
                Question evaluatedQuestion = evaluateConditionalLogic(q, currentAnswers, allQuestions, currentQuestionId);
                if (evaluatedQuestion != null) {
                    nextRootQuestion = q;
                    break;
                }
            }
        }

        if (nextRootQuestion != null) {
            // Oversæt spørgsmålet baseret på sprog
            return questionService.translateQuestion(nextRootQuestion, language);
        }

        logger.debug("No more questions found for questionnaire: {}", questionnaireId);
        return null; // Ingen flere spørgsmål
    }

    private Question evaluateConditionalLogic(Question question, Map<String, Object> answers, List<Question> allQuestions, String currentQuestionId) {
        // Brug unified conditional logic strategy
        return conditionalLogicStrategy.shouldShow(question, answers, allQuestions, currentQuestionId);
    }

    public List<Response> getResponsesByUserId(String userId) {
        return responseRepository.findByUserId(userId);
    }

    public List<Response> getResponsesByUserIdAndQuestionnaireId(String userId, String questionnaireId) {
        return responseRepository.findByUserIdAndQuestionnaireId(userId, questionnaireId);
    }

    public SleepParameters calculateSleepParameters(String responseId) {
        Response response = responseRepository.findById(responseId)
                .orElseThrow(() -> new ValidationException("Besvarelse ikke fundet"));

        if (response.getQuestionnaireType() != QuestionnaireType.morning) {
            throw new ValidationException("Søvnparametre kan kun beregnes for morgenskema");
        }

        // Genberegn altid søvnparametre for at sikre korrekt beregning
        // Dette sikrer at eventuelle rettelser i beregningen anvendes
        SleepParameters params = sleepParameterCalculator.calculate(response.getAnswers(), response.getQuestionnaireId());
        response.setSleepParameters(params);
        responseRepository.save(response);
        return params;
    }
    
    public List<Response> getResponsesByUserIdAndQuestionnaireType(String userId, QuestionnaireType type) {
        return responseRepository.findByUserIdAndQuestionnaireType(userId, type);
    }

    /**
     * Tjekker om en bruger allerede har besvaret et spørgeskema i dag (baseret på dansk tid)
     */
    public boolean hasResponseForToday(String userId, QuestionnaireType questionnaireType) {
        // Få dansk tid (CET/CEST)
        ZoneId copenhagenZone = ZoneId.of(QuestionnaireConstants.COPENHAGEN_TIMEZONE);
        LocalDate today = LocalDate.now(copenhagenZone);
        
        // Start og slut af dagen i dansk tid (00:00:00 til 00:00:00 næste dag)
        ZonedDateTime startOfDay = today.atStartOfDay(copenhagenZone);
        ZonedDateTime endOfDay = today.plusDays(1).atStartOfDay(copenhagenZone);
        
        // Konverter til Date for MongoDB query
        Date startDate = Date.from(startOfDay.toInstant());
        Date endDate = Date.from(endOfDay.toInstant());
        
        List<Response> responses = responseRepository.findByUserIdAndQuestionnaireTypeAndDateRange(
            userId, questionnaireType, startDate, endDate
        );
        
        return !responses.isEmpty();
    }

    // Validering er flyttet til ResponseValidationService
    // Alle valideringsmetoder er fjernet - brug responseValidationService.validateResponse() i stedet
}

