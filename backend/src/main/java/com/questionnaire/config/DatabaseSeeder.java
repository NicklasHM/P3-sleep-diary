package com.questionnaire.config;

import com.questionnaire.model.*;
import com.questionnaire.repository.QuestionRepository;
import com.questionnaire.repository.QuestionnaireRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

import static com.questionnaire.utils.QuestionOrderUtil.childOrder;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private QuestionnaireRepository questionnaireRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Override
    public void run(String... args) throws Exception {
        // Opret morgenskema hvis det ikke findes
        Questionnaire morningQuestionnaire = questionnaireRepository.findByType(QuestionnaireType.morning)
                .orElseGet(() -> {
                    Questionnaire q = new Questionnaire(QuestionnaireType.morning, "Morgenskema");
                    return questionnaireRepository.save(q);
                });

        // Seed morgenskema idempotent (opret manglende spørgsmål og opdater felter)
        seedMorningQuestions(morningQuestionnaire.getId());

        // Opret aftenskema hvis det ikke findes (tomt, kan redigeres af rådgivere)
        questionnaireRepository.findByType(QuestionnaireType.evening)
                .orElseGet(() -> {
                    Questionnaire q = new Questionnaire(QuestionnaireType.evening, "Aftenskema");
                    return questionnaireRepository.save(q);
                });
    }

    private void seedMorningQuestions(String questionnaireId) {
        upsertQ1(questionnaireId);
        upsertQ1Child(questionnaireId);
        upsertQ2(questionnaireId);
        upsertQ3(questionnaireId);
        upsertQ4(questionnaireId);
        upsertQ5(questionnaireId);
        upsertQ6(questionnaireId);
        upsertQ7(questionnaireId);
        upsertQ8(questionnaireId);
        linkQ6Children(questionnaireId);
        upsertQ9(questionnaireId);  // renummereret til 7
        upsertQ10(questionnaireId); // renummereret til 8
        upsertQ11(questionnaireId); // renummereret til 9
    }

    private Question findExisting(String questionnaireId, int order) {
        return questionRepository.findByQuestionnaireIdAndOrder(questionnaireId, order).orElse(null);
    }

    private QuestionOption opt(String id, String da, String en, boolean isOther) {
        QuestionOption o = new QuestionOption();
        o.setId(id);
        o.setTextDa(da);
        o.setTextEn(en);
        o.setText(da); // fallback
        o.setIsOther(isOther);
        return o;
    }

    private void upsertQ1(String questionnaireId) {
        Question q = findExisting(questionnaireId, 1);
        if (q == null) {
            q = new Question(questionnaireId,
                    "Tog du nogen form for medicin eller kosttilskud for at hjælpe dig med at sove?",
                    QuestionType.multiple_choice, true, 1);
        }
        q.setTextDa("Tog du nogen form for medicin eller kosttilskud for at hjælpe dig med at sove?");
        q.setTextEn("Did you take any form of medicine or dietary supplements to help you sleep?");
        List<QuestionOption> options = new ArrayList<>();
        options.add(opt("med_no", "Nej", "No", false));
        options.add(opt("med_yes", "Ja", "Yes", false));
        q.setOptions(options);
        questionRepository.save(q);
    }

    private void upsertQ1Child(String questionnaireId) {
        int childOrderValue = childOrder(1, 1); // første child til Q1
        Question child = questionRepository.findByQuestionnaireIdAndOrder(questionnaireId, childOrderValue)
                .filter(q -> q.getType() == QuestionType.multiple_choice_multiple && Boolean.TRUE.equals(q.isLocked()))
                .orElse(null);
        if (child == null) {
            child = new Question(questionnaireId,
                    "Hvilken type medicin eller kosttilskud?",
                    QuestionType.multiple_choice_multiple, true, childOrderValue);
        }
        child.setTextDa("Hvilken type medicin eller kosttilskud?");
        child.setTextEn("What type of medicine or dietary supplement?");
        List<QuestionOption> childOptions = new ArrayList<>();
        childOptions.add(opt("med_sleeping_pill", "Sovemedicin", "Sleeping medication", false));
        childOptions.add(opt("med_melatonin", "Melatonin piller", "Melatonin pills", false));
        childOptions.add(opt("med_other", "Andet", "Other", true));
        child.setOptions(childOptions);
        child = questionRepository.save(child);

        Question parent = findExisting(questionnaireId, 1);
        if (parent != null) {
            List<ConditionalChild> ccs = new ArrayList<>();
            ccs.add(new ConditionalChild("med_yes", child.getId()));
            parent.setConditionalChildren(ccs);
            questionRepository.save(parent);
        }
    }

    private void upsertQ2(String questionnaireId) {
        Question q = findExisting(questionnaireId, 2);
        if (q == null) {
            q = new Question(questionnaireId,
                    "Hvad foretog du dig de sidste par timer inden du gik i seng?",
                    QuestionType.text, true, 2);
        }
        q.setTextDa("Hvad foretog du dig de sidste par timer inden du gik i seng?");
        q.setTextEn("What did you do in the last few hours before going to bed?");
        q.setMaxLength(200);
        questionRepository.save(q);
    }

    private void upsertQ3(String questionnaireId) {
        Question q = findExisting(questionnaireId, 3);
        if (q == null) {
            q = new Question(questionnaireId,
                    "I går gik jeg i seng klokken:",
                    QuestionType.time_picker, true, 3);
        }
        q.setTextDa("I går gik jeg i seng klokken:");
        q.setTextEn("Yesterday I went to bed at:");
        questionRepository.save(q);
    }

    private void upsertQ4(String questionnaireId) {
        Question q = findExisting(questionnaireId, 4);
        if (q == null) {
            q = new Question(questionnaireId,
                    "Jeg slukkede lyset klokken:",
                    QuestionType.time_picker, true, 4);
        }
        q.setTextDa("Jeg slukkede lyset klokken:");
        q.setTextEn("I turned off the light at:");
        questionRepository.save(q);
    }

    private void upsertQ5(String questionnaireId) {
        Question q = findExisting(questionnaireId, 5);
        if (q == null) {
            q = new Question(questionnaireId,
                    "Efter jeg slukkede lyset, sov jeg ca. efter (minutter):",
                    QuestionType.numeric, true, 5);
        }
        q.setTextDa("Efter jeg slukkede lyset, sov jeg ca. efter (minutter):");
        q.setTextEn("After I turned off the light, I fell asleep approximately after (minutes):");
        questionRepository.save(q);
    }

    private void upsertQ6(String questionnaireId) {
        Question q = findExisting(questionnaireId, 6);
        if (q == null) {
            q = new Question(questionnaireId,
                    "Vågnede du i løbet af natten?",
                    QuestionType.multiple_choice, true, 6);
        }
        q.setTextDa("Vågnede du i løbet af natten?");
        q.setTextEn("Did you wake up during the night?");
        List<QuestionOption> options = new ArrayList<>();
        options.add(opt("wake_no", "Nej", "No", false));
        options.add(opt("wake_yes", "Ja", "Yes", false));
        q.setOptions(options);
        questionRepository.save(q);
    }

    private void upsertQ7(String questionnaireId) {
        int order = childOrder(6, 1); // første child til Q6
        Question q = findExisting(questionnaireId, order);
        if (q == null) {
            q = new Question(questionnaireId,
                    "Hvor mange gange?",
                    QuestionType.numeric, true, order);
        }
        q.setTextDa("Hvor mange gange?");
        q.setTextEn("How many times?");
        questionRepository.save(q);
    }

    private void upsertQ8(String questionnaireId) {
        int order = childOrder(6, 2); // andet child til Q6
        Question q = findExisting(questionnaireId, order);
        if (q == null) {
            q = new Question(questionnaireId,
                    "Hvor mange minutter?",
                    QuestionType.numeric, true, order);
        }
        q.setTextDa("Hvor mange minutter?");
        q.setTextEn("How many minutes?");
        questionRepository.save(q);
    }

    private void linkQ6Children(String questionnaireId) {
        Question parent = findExisting(questionnaireId, 6);
        Question child1 = findExisting(questionnaireId, childOrder(6, 1));
        Question child2 = findExisting(questionnaireId, childOrder(6, 2));
        if (parent != null && child1 != null && child2 != null) {
            List<ConditionalChild> ccs = new ArrayList<>();
            ccs.add(new ConditionalChild("wake_yes", child1.getId()));
            ccs.add(new ConditionalChild("wake_yes", child2.getId()));
            parent.setConditionalChildren(ccs);
            questionRepository.save(parent);
        }
    }

    private void upsertQ9(String questionnaireId) {
        Question q = findExisting(questionnaireId, 7); // renummereret
        if (q == null) {
            q = new Question(questionnaireId,
                    "I morges vågnede jeg klokken?",
                    QuestionType.time_picker, true, 7);
        }
        q.setTextDa("I morges vågnede jeg klokken?");
        q.setTextEn("This morning I woke up at:");
        questionRepository.save(q);
    }

    private void upsertQ10(String questionnaireId) {
        Question q = findExisting(questionnaireId, 8); // renummereret
        if (q == null) {
            q = new Question(questionnaireId,
                    "Og jeg stod op klokken?",
                    QuestionType.time_picker, true, 8);
        }
        q.setTextDa("Og jeg stod op klokken?");
        q.setTextEn("And I got out of bed at:");
        questionRepository.save(q);
    }

    private void upsertQ11(String questionnaireId) {
        Question q = findExisting(questionnaireId, 9); // renummereret
        if (q == null) {
            q = new Question(questionnaireId,
                    "Et par timer efter jeg stod op følte jeg mig? (1–5)",
                    QuestionType.slider, true, 9);
        }
        q.setTextDa("Et par timer efter jeg stod op følte jeg mig? (1–5)");
        q.setTextEn("A few hours after I got up, I felt? (1–5)");
        q.setMinValue(1);
        q.setMaxValue(5);
        questionRepository.save(q);
    }

}
