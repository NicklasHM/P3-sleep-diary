# Test Documentation

This document describes the test structure for the Questionnaire Platform project.

## Test Structure

Tests are organized in two categories:

```
src/test/java/com/questionnaire/
├── unit/                          # Unit tests (isolated, mocked dependencies)
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
└── integration/                   # Narrow integration tests (max 2–3 beans)
    ├── response/
    │   └── ResponseServiceIntegrationTest.java   # ResponseService with mocked deps
    └── validation/
        ├── QuestionnaireValidatorIntegrationTest.java    # UnifiedQuestionnaireValidator with mock repo
        └── TemplateMethodPatternIntegrationTest.java
```

## Test Categories

### 1. Unit Tests (`unit/`)

**Purpose:** Test isolated classes and methods without dependencies.

**Examples:**
- `AnswerParserTest` - Tests parsing of different data types
- `SleepDataExtractorTest` - Tests extraction of sleep data
- `QuestionServiceImplTest` - Tests QuestionService logic
- `QuestionnaireServiceImplTest` - Tests QuestionnaireService logic
- `ResponseServiceImplTest` - Tests ResponseService logic
- `QuestionOrderUtilTest` - Tests question ordering utility
- `DefaultConditionalLogicTest` - Tests conditional logic strategy

**Run tests:**
```bash
mvn test -Dtest=AnswerParserTest
mvn test -Dtest=SleepDataExtractorTest
mvn test -Dtest=*UnitTest  # Run all unit tests
```

### 2. Integration Tests (`integration/`) – narrow slices

**Requirements:** Max ~2–3 methods/beans involved. Rest are stubbed/mocked.

**Tests:**
- `ResponseServiceIntegrationTest` – ResponseService + mocks of dependencies.
- `QuestionnaireValidatorIntegrationTest` – UnifiedQuestionnaireValidator with small dataset + mock repo.
- `TemplateMethodPatternIntegrationTest` – Template Method flow (validator + repo).

**Run tests:**
```bash
# All integration tests
mvn test -Dtest=*IntegrationTest

# Specific test
mvn test -Dtest=ResponseServiceIntegrationTest
mvn test -Dtest=QuestionnaireValidatorIntegrationTest
```

## Run All Tests

```bash
# Run all tests
mvn test

# Run specific category
mvn test -Dtest=*UnitTest
mvn test -Dtest=*IntegrationTest
```

## OOP Principles Tested

### Factory Pattern
- **Where:** `ValidatorFactory`
- **Tests:** `QuestionnaireValidatorIntegrationTest`
- **Demonstrates:** Centralized creation of AnswerValidator based on question type

### Template Method Pattern
- **Where:** `QuestionnaireValidator` (abstract) + `UnifiedQuestionnaireValidator`
- **Tests:** `TemplateMethodPatternIntegrationTest`, `QuestionnaireValidatorIntegrationTest`
- **Demonstrates:** Base class defines algorithm; unified subclass provides specific steps

### Strategy Pattern
- **Where:** `ConditionalLogicStrategy` + `DefaultConditionalLogic`
- **Tests:** `DefaultConditionalLogicTest`
- **Demonstrates:** Interchangeable algorithms for conditional logic

### Polymorphism
- **Where:** Strategy/Validator interfaces
- **Tests:** All integration tests
- **Demonstrates:** Same interface, different implementations; extensible

### Inheritance
- **Where:** `BaseEntity` base class, `Validatable` interface
- **Tests:** All tests that use entities
- **Demonstrates:** Code reuse and consistent structure

## Test Best Practices

1. **Use `@DisplayName`** for readable test names
2. **Arrange-Act-Assert (AAA)** structure in all tests
3. **One assertion per test** when possible
4. **Test both happy path and edge cases**
5. **Use `@BeforeEach`** for setup
6. **Use `@ExtendWith(MockitoExtension.class)`** for Mockito tests
7. **Isolate tests** - no dependencies between tests
8. **Mock external dependencies** in unit tests
9. **Use `@SpringBootTest`** for integration tests

## Test Coverage

Tests focus on:
- ✅ OOP principles (Strategy, Factory, Template Method, Inheritance, Polymorphism)
- ✅ Integration between components
- ✅ End-to-end flows
- ✅ Error handling
- ✅ Answer validation
- ✅ Sleep parameter calculation
- ✅ Conditional logic
- ✅ Question ordering and flow

## Test Isolation and Cleanup

Tests implement automatic cleanup to ensure test isolation:

- **ResponseServiceIntegrationTest**: Deletes all responses and test users after each test
- This ensures that test data does not pollute the production environment or appear in the UI

**Important**: The test user (`testuser`) is automatically deleted after each test run, so it does not appear in the UI.

## Notes

- Integration tests require Spring Boot context (use `@SpringBootTest`)
- Some tests may require database setup (MongoDB)
- Tests can be adjusted based on actual database structure
- **Test data cleanup**: All test data (responses and test users) is automatically deleted after tests
- Tests use Mockito for mocking dependencies
- Tests follow AAA (Arrange-Act-Assert) pattern
- All tests are isolated and can be run in any order
