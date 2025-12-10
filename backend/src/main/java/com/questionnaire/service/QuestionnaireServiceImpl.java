package com.questionnaire.service;

import com.questionnaire.model.Question;
import com.questionnaire.model.Questionnaire;
import com.questionnaire.model.QuestionnaireType;
import com.questionnaire.repository.QuestionRepository;
import com.questionnaire.repository.QuestionnaireRepository;
import com.questionnaire.service.interfaces.IQuestionService;
import com.questionnaire.service.interfaces.IQuestionnaireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QuestionnaireServiceImpl implements IQuestionnaireService {

    private final QuestionnaireRepository questionnaireRepository;
    private final QuestionRepository questionRepository;
    private final IQuestionService questionService;

    @Autowired
    public QuestionnaireServiceImpl(QuestionnaireRepository questionnaireRepository,
                                   QuestionRepository questionRepository,
                                   IQuestionService questionService) {
        this.questionnaireRepository = questionnaireRepository;
        this.questionRepository = questionRepository;
        this.questionService = questionService;
    }

    public Questionnaire getQuestionnaireByType(QuestionnaireType type) {
        return questionnaireRepository.findByType(type)
                .orElseThrow(() -> new RuntimeException("Questionnaire mangler: " + type));
    }

    public List<Question> getQuestionsByQuestionnaireId(String questionnaireId) {
        return questionRepository.findByQuestionnaireIdOrderByOrderAsc(questionnaireId);
    }

    public List<Question> getQuestionsByQuestionnaireId(String questionnaireId, String language) {
        List<Question> questions = getQuestionsByQuestionnaireId(questionnaireId);
        // Oversæt spørgsmål baseret på sprog
        return questions.stream()
                .map(q -> questionService.translateQuestion(q, language))
                .collect(java.util.stream.Collectors.toList());
    }

    public Questionnaire createQuestionnaire(QuestionnaireType type, String name) {
        Questionnaire questionnaire = new Questionnaire(type, name);
        return questionnaireRepository.save(questionnaire);
    }

    public Optional<Questionnaire> findByType(QuestionnaireType type) {
        return questionnaireRepository.findByType(type);
    }

    public Optional<Questionnaire> findById(String id) {
        return questionnaireRepository.findById(id);
    }
}






