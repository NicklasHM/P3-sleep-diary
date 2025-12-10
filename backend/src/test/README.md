# Test Documentation

This document describes the test structure for the Questionnaire Platform project.

## Test Struktur

Tests er organiseret i tre kategorier:

```
src/test/java/com/questionnaire/
├── unit/                          # Unit tests (isoleret, mocked dependencies)
│   ├── utils/
│   │   ├── AnswerParserTest.java
│   │   └── QuestionOrderUtilTest.java
│   ├── service/
│   │   ├── SleepDataExtractorTest.java
│   │   ├── QuestionServiceImplTest.java
│   │   ├── QuestionnaireServiceImplTest.java
│   │   └── ResponseServiceImplTest.java
│   └── strategy/
│       └── DefaultConditionalLogicTest.java
│
├── integration/                   # Smalle integrationstests (max 2–3 beans)
│   ├── flow/
│   │   └── ResponseServiceIntegrationTest.java   # Response flow test
│   ├── response/
│   │   └── ResponseServiceIntegrationTest.java   # ResponseService med mocked deps
│   └── validation/
│       ├── QuestionnaireValidatorIntegrationTest.java    # UnifiedQuestionnaireValidator med mock repo
│       └── TemplateMethodPatternIntegrationTest.java
│
└── system/                        # System/E2E test
    └── QuestionnaireSystemTest.java
```

## Test Categories

### 1. Unit Tests (`unit/`)

**Formål:** Test isolerede klasser og metoder uden dependencies.

**Eksempler:**
- `AnswerParserTest` - Tester parsing af forskellige datatyper
- `SleepDataExtractorTest` - Tester ekstraktion af søvndata
- `QuestionServiceImplTest` - Tester QuestionService logik
- `QuestionnaireServiceImplTest` - Tester QuestionnaireService logik
- `ResponseServiceImplTest` - Tester ResponseService logik
- `QuestionOrderUtilTest` - Tester spørgsmålsordning utility
- `DefaultConditionalLogicTest` - Tester betinget logik strategi

**Kør tests:**
```bash
mvn test -Dtest=AnswerParserTest
mvn test -Dtest=SleepDataExtractorTest
mvn test -Dtest=*UnitTest  # Kør alle unit tests
```

### 2. Integration Tests (`integration/`) – smalle slices

**Krav:** Max ~2–3 metoder/beans involveret. Resten stubbes/mockes.

**Tests:**
- `ResponseServiceIntegrationTest` (flow/) – ResponseService flow test; verifierer validate+save flow.
- `ResponseServiceIntegrationTest` (response/) – ResponseService + mocks af afhængigheder.
- `QuestionnaireValidatorIntegrationTest` – UnifiedQuestionnaireValidator med lille datasæt + mock repo.
- `TemplateMethodPatternIntegrationTest` – Template Method flow (validator + repo).

**Kør tests:**
```bash
# Alle integrationstests
mvn test -Dtest=*IntegrationTest

# Specifik test
mvn test -Dtest=ResponseServiceIntegrationTest
mvn test -Dtest=QuestionnaireValidatorIntegrationTest
```

## Kør Alle Tests

```bash
# Kør alle tests
mvn test

# Kør specifik kategori
mvn test -Dtest=*UnitTest
mvn test -Dtest=*IntegrationTest
mvn test -Dtest=*SystemTest
```

## OOP Principper Testet

### Factory Pattern
- **Hvor:** `ValidatorFactory`
- **Tests:** `QuestionnaireValidatorIntegrationTest`
- **Demonstrerer:** Centraliseret oprettelse af AnswerValidator baseret på spørgsmålstype

### Template Method Pattern
- **Hvor:** `QuestionnaireValidator` (abstract) + `UnifiedQuestionnaireValidator`
- **Tests:** `TemplateMethodPatternIntegrationTest`, `QuestionnaireValidatorIntegrationTest`
- **Demonstrerer:** Base klasse definerer algoritme; unified subclass leverer specifikke steps

### Strategy Pattern
- **Hvor:** `ConditionalLogicStrategy` + `DefaultConditionalLogic`
- **Tests:** `DefaultConditionalLogicTest`
- **Demonstrerer:** Interchangeable algoritmer for betinget logik

### Polymorphism
- **Hvor:** Strategy/Validator interfaces
- **Tests:** Alle integration tests
- **Demonstrerer:** Samme interface, forskellige implementeringer; udvidbar

### Inheritance
- **Hvor:** `BaseEntity` base klasse, `Validatable` interface
- **Tests:** Alle tests der bruger entities
- **Demonstrerer:** Code reuse og konsistent struktur

## Test Best Practices

1. **Brug `@DisplayName`** for læsbare test navne
2. **Arrange-Act-Assert (AAA)** struktur i alle tests
3. **Én assertion per test** når muligt
4. **Test både happy path og edge cases**
5. **Brug `@BeforeEach`** til setup
6. **Brug `@ExtendWith(MockitoExtension.class)`** for Mockito tests
7. **Isoler tests** - ingen dependencies mellem tests
8. **Mock eksterne dependencies** i unit tests
9. **Brug `@SpringBootTest`** for integration tests
10. **Brug `MockMvc`** for system/E2E tests

## Test Coverage

Tests fokuserer på:
- ✅ OOP principper (Strategy, Factory, Template Method, Inheritance, Polymorphism)
- ✅ Integration mellem komponenter
- ✅ End-to-end flows
- ✅ Fejlhåndtering
- ✅ Validering af svar
- ✅ Beregning af søvnparametre
- ✅ Betinget logik
- ✅ Spørgsmålsordning og flow

## Test Isolation og Cleanup

Tests implementerer automatisk cleanup for at sikre test isolation:

- **ResponseServiceIntegrationTest**: Sletter alle responses og test brugere efter hver test
- **QuestionnaireSystemTest**: Sletter test brugere efter hver test
- Dette sikrer at test data ikke forurener produktionsmiljøet eller vises i UI'et

**Vigtigt**: Test brugeren (`testuser`) slettes automatisk efter hver test kørsel, så den ikke vises i UI'et.

## Noter

- Integration tests kræver Spring Boot context (brug `@SpringBootTest`)
- System test kræver MockMvc for API testning
- Nogle tests kan kræve database setup (MongoDB)
- Tests kan justeres baseret på faktisk database struktur
- **Test data cleanup**: Alt test data (responses og test brugere) slettes automatisk efter tests
- Tests bruger Mockito til mocking af dependencies
- Tests følger AAA (Arrange-Act-Assert) pattern
- Alle tests er isolerede og kan køres i vilkårlig rækkefølge
