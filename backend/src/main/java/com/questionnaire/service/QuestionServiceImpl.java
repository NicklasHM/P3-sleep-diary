package com.questionnaire.service;

import com.questionnaire.model.Question;
import com.questionnaire.model.QuestionBuilder;
import com.questionnaire.model.QuestionOption;
import com.questionnaire.model.QuestionOptionBuilder;
import com.questionnaire.model.ConditionalChild;
import com.questionnaire.repository.QuestionRepository;
import com.questionnaire.service.interfaces.IQuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.questionnaire.utils.QuestionOrderUtil.childOrder;

@Service
public class QuestionServiceImpl implements IQuestionService {

    private final QuestionRepository questionRepository;

    @Autowired
    public QuestionServiceImpl(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public Question createQuestion(Question question) {
        // Sæt ID til null for at sikre at MongoDB genererer en ny ID
        question.setId(null);
        
        // Valider spørgsmålet før oprettelse
        question.validate();
        
        return questionRepository.save(question);
    }

    public Question updateQuestion(String id, Question questionDetails) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Spørgsmål ikke fundet"));

        // Brug domain logic fra Question-klassen
        question.updateFrom(questionDetails);

        Question saved = questionRepository.save(question);

        // Hvis parent order er ændret, skal conditional børn følge med i ny 100-baseret rækkefølge
        reassignConditionalChildOrders(saved);

        return saved;
    }

    public void deleteQuestion(String id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Spørgsmål ikke fundet"));

        // Brug domain logic fra Question-klassen
        question.validateUpdate();

        // Soft delete: sæt deletedAt i stedet for at slette
        question.setDeletedAt(new Date());
        questionRepository.save(question);
    }

    public Question findById(String id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Spørgsmål ikke fundet"));
    }

    public Question findById(String id, String language) {
        Question question = findById(id);
        return translateQuestion(question, language);
    }
    
    // Find spørgsmål uanset om det er slettet eller ej (til besvarelser)
    public Question findByIdIncludingDeleted(String id) {
        Optional<Question> question = questionRepository.findById(id);
        if (question.isPresent()) {
            return question.get();
        }
        throw new RuntimeException("Spørgsmål ikke fundet");
    }
    
    public Question findByIdIncludingDeleted(String id, String language) {
        Question question = findByIdIncludingDeleted(id);
        return translateQuestion(question, language);
    }

    public List<Question> findByQuestionnaireId(String questionnaireId) {
        // Denne metode returnerer kun aktive spørgsmål (deletedAt == null)
        // pga. query i repository
        return questionRepository.findByQuestionnaireIdOrderByOrderAsc(questionnaireId);
    }

    public List<Question> findByQuestionnaireId(String questionnaireId, String language) {
        List<Question> questions = findByQuestionnaireId(questionnaireId);
        return questions.stream()
                .map(q -> translateQuestion(q, language))
                .collect(java.util.stream.Collectors.toList());
    }
    
    // Find alle spørgsmål inkl. slettede (til visning af besvarelser)
    public List<Question> findByQuestionnaireIdIncludingDeleted(String questionnaireId) {
        return questionRepository.findAllByQuestionnaireIdIncludingDeleted(questionnaireId);
    }
    
    public List<Question> findByQuestionnaireIdIncludingDeleted(String questionnaireId, String language) {
        List<Question> questions = findByQuestionnaireIdIncludingDeleted(questionnaireId);
        return questions.stream()
                .map(q -> translateQuestion(q, language))
                .collect(java.util.stream.Collectors.toList());
    }

    // Hjælpemetode til at oversætte spørgsmål baseret på sprog
    public Question translateQuestion(Question question, String language) {
        // Brug Builder pattern til at kopiere og oversætte
        QuestionBuilder builder = QuestionBuilder.from(question).withLanguage(language);
        
        // Oversæt options hvis de findes
        if (question.getOptions() != null) {
            List<QuestionOption> translatedOptions = question.getOptions().stream()
                    .map(option -> QuestionOptionBuilder.from(option).withLanguage(language).build())
                    .collect(Collectors.toList());
            builder.options(translatedOptions);
        }
        
        return builder.build();
    }

    public Question addConditionalChild(String questionId, String optionId, String childQuestionId) {
        Question parent = findById(questionId);
        Question child = findById(childQuestionId);

        // Beregn næste child index for denne option
        int existingForOption = parent.getConditionalChildren() == null ? 0 :
                (int) parent.getConditionalChildren().stream()
                        .filter(cc -> optionId.equals(cc.getOptionId()))
                        .count();
        int desiredOrder = childOrder(parent.getOrder(), existingForOption + 1);

        // Opdater child order hvis nødvendigt
        if (child.getOrder() != desiredOrder) {
            child.setOrder(desiredOrder);
            questionRepository.save(child);
        }

        // Brug domain logic fra Question-klassen
        parent.addConditionalChild(optionId, childQuestionId);

        return questionRepository.save(parent);
    }

    public Question removeConditionalChild(String questionId, String optionId, String childQuestionId) {
        Question question = findById(questionId);
        
        // Brug domain logic fra Question-klassen
        question.removeConditionalChild(optionId, childQuestionId);
        
        return questionRepository.save(question);
    }

    public Question updateConditionalChildrenOrder(String questionId, String optionId, List<String> childQuestionIds) {
        Question parent = findById(questionId);

        // Brug domain logic fra Question-klassen
        parent.updateConditionalChildrenOrder(optionId, childQuestionIds);

        // Re-assign order til børn baseret på ny rækkefølge
        for (int i = 0; i < childQuestionIds.size(); i++) {
            String childId = childQuestionIds.get(i);
            Optional<Question> childOpt = questionRepository.findById(childId);
            if (childOpt.isPresent()) {
                Question child = childOpt.get();
                int desiredOrder = childOrder(parent.getOrder(), i + 1);
                if (child.getOrder() != desiredOrder) {
                    child.setOrder(desiredOrder);
                    questionRepository.save(child);
                }
            }
        }

        return questionRepository.save(parent);
    }

    /**
     * Finder alle root spørgsmål (ikke conditional children) for et questionnaire
     * @param questions Alle spørgsmål i questionnaire
     * @return Liste af root spørgsmål sorteret efter order
     */
    public List<Question> findRootQuestions(List<Question> questions) {
        // Find alle conditional child IDs (spørgsmål der er conditional children)
        java.util.Set<String> conditionalChildIds = new java.util.HashSet<>();
        for (Question q : questions) {
            if (q.getConditionalChildren() != null) {
                for (com.questionnaire.model.ConditionalChild cc : q.getConditionalChildren()) {
                    if (cc.getChildQuestionId() != null) {
                        conditionalChildIds.add(cc.getChildQuestionId());
                    }
                }
            }
        }
        
        // Filtrer conditional children fra og sorter efter order
        List<Question> rootQuestions = new java.util.ArrayList<>();
        for (Question q : questions) {
            if (!conditionalChildIds.contains(q.getId())) {
                rootQuestions.add(q);
            }
        }
        
        // Sorter efter order
        rootQuestions.sort((a, b) -> Integer.compare(a.getOrder(), b.getOrder()));
        
        return rootQuestions;
    }

    /**
     * Sikrer at alle conditional child-spørgsmål får korrekt order baseret på forælderens order.
     * Eksempel: parent order 2 → børn bliver 201, 202, ... i rækkefølge pr. option.
     */
    private void reassignConditionalChildOrders(Question parent) {
        if (parent.getConditionalChildren() == null || parent.getConditionalChildren().isEmpty()) {
            return;
        }

        // Bevar den lagrede rækkefølge pr. optionId
        java.util.Map<String, java.util.List<String>> childrenPerOption = new java.util.LinkedHashMap<>();
        for (ConditionalChild cc : parent.getConditionalChildren()) {
            childrenPerOption
                .computeIfAbsent(cc.getOptionId(), k -> new java.util.ArrayList<>())
                .add(cc.getChildQuestionId());
        }

        // Re-beregn order for hvert barn i den rækkefølge de står i
        for (java.util.Map.Entry<String, java.util.List<String>> entry : childrenPerOption.entrySet()) {
            java.util.List<String> childIds = entry.getValue();
            for (int i = 0; i < childIds.size(); i++) {
                String childId = childIds.get(i);
                Optional<Question> childOpt = questionRepository.findById(childId);
                if (childOpt.isPresent()) {
                    Question child = childOpt.get();
                    int desiredOrder = childOrder(parent.getOrder(), i + 1);
                    if (child.getOrder() != desiredOrder) {
                        child.setOrder(desiredOrder);
                        questionRepository.save(child);
                    }
                }
            }
        }
    }
}

