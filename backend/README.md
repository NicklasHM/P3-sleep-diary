# Questionnaire Platform - Backend

Backend implementation in Java 17 with Spring Boot 3.2.0 and MongoDB.

## Requirements

- Java 17 or newer
- Maven 3.6+
- MongoDB (cloud or local)

## Setup

1. Create a `.env` file in the `backend/` directory with the following keys (place the file in `backend/`, UTF-8 without BOM):

```env
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret-key-minimum-32-characters-long
JWT_EXPIRATION=86400000
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Note:** `JWT_SECRET` must be at least 32 characters long (256 bits) for security. `JWT_EXPIRATION` is in milliseconds (default: 86400000 = 24 hours).

2. Build the project:

```bash
cd backend
mvn clean install
```

3. Run the application:

```bash
mvn spring-boot:run
```

The backend runs on `http://localhost:8080`

**Dotenv loading:** `MongoConfig` first tries environment variables, then `.env` in `backend/`. The file must be in the same directory as `pom.xml` and must not contain BOM.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
  - Request body: `{ "username": string, "password": string }`
  - Returns: `{ "token": string, "username": string, "fullName": string, "role": string }`
- `POST /api/auth/register` - Register user
  - Request body: `{ "username": string, "password": string, "firstName": string, "lastName": string, "role": "BORGER" | "RÅDGIVER" }`
  - Returns: `{ "token": string, "username": string, "fullName": string, "role": string }`
- `GET /api/auth/check-username?username={username}` - Check if username exists
  - Returns: `{ "exists": boolean }`

### Questionnaires
- `GET /api/questionnaires/{type}` - Get questionnaire (morning/evening)
  - Path parameter: `type` = "morning" | "evening"
  - Returns: Questionnaire object with metadata
- `GET /api/questionnaires/{type}/start` - Start questionnaire (returns first question)
  - Path parameter: `type` = "morning" | "evening"
  - Query parameter: `language` = "da" | "en" (default: "da")
  - Returns: Array with first question

### Questions
- `GET /api/questions/{id}` - Get question by ID
  - Query parameters: `language` = "da" | "en" (default: "da"), `includeDeleted` = "true" | "false" (default: "false")
  - Returns: Question object
- `GET /api/questions?questionnaireId={id}` - Get all questions for a questionnaire
  - Query parameters: `questionnaireId` (required), `language` = "da" | "en" (default: "da"), `includeDeleted` = "true" | "false" (default: "false")
  - Returns: Array of questions
- `POST /api/questions` - Create question (evening questionnaire only)
  - Request body: Question object
  - Returns: Created question
- `PUT /api/questions/{id}` - Update question (403 if locked)
  - Request body: Question object
  - Returns: Updated question
- `DELETE /api/questions/{id}` - Delete question (soft delete, 403 if locked)
  - Returns: 204 No Content
- `POST /api/questions/{id}/conditional` - Add conditional child question
  - Request body: `{ "optionId": string, "childQuestionId": string }`
  - Returns: Updated parent question
- `DELETE /api/questions/{id}/conditional` - Remove conditional child
  - Request body: `{ "optionId": string, "childQuestionId": string }`
  - Returns: Updated parent question
- `PUT /api/questions/{id}/conditional/order` - Update conditional children order
  - Request body: `{ "optionId": string, "childQuestionIds": string[] }`
  - Returns: Updated parent question

### Responses
- `POST /api/responses` - Save response
  - Request body: `{ "questionnaireId": string, "answers": { [questionId]: answerValue } }`
  - Requires authentication
  - Returns: Saved response with calculated sleep parameters (if morning questionnaire)
- `POST /api/responses/next` - Get next question
  - Request body: `{ "questionnaireId": string, "currentAnswers": { [questionId]: answerValue }, "currentQuestionId": string }`
  - Query parameter: `language` = "da" | "en" (default: "da")
  - Returns: Next question or 204 No Content if no more questions
- `GET /api/responses?userId={id}&questionnaireId={id}` - Get responses
  - Query parameters: `userId` (required), `questionnaireId` (optional)
  - Returns: Array of responses
- `GET /api/responses/check-today?questionnaireType={type}` - Check if response exists for today
  - Query parameter: `questionnaireType` = "morning" | "evening"
  - Requires authentication
  - Returns: `{ "hasResponse": boolean }`

### Users
- `GET /api/users` - Get all users (advisor only)
  - Returns: Array of UserDto objects
- `GET /api/users/citizens` - Get all citizens (advisor only)
  - Returns: Array of UserDto objects with advisor information
- `GET /api/users/advisors` - Get all advisors (advisor only)
  - Returns: Array of UserDto objects
- `GET /api/users/{id}/sleep-data` - Get sleep parameters for user
  - Returns: `{ "sleepData": [{ "responseId": string, "createdAt": Date, "sleepParameters": { "SOL": number, "WASO": number, "TIB": string, "TIBMinutes": number, "TST": string, "TSTMinutes": number } }] }`
- `PUT /api/users/{citizenId}/assign-advisor` - Assign advisor to citizen
  - Request body: `{ "advisorId": string | null }` (optional, null to unassign)
  - Returns: Updated UserDto with advisor information

## Database Seeding

On startup, the morning questionnaire is automatically seeded with 9 locked questions via `DatabaseSeeder`. These questions are locked (`isLocked = true`) and cannot be edited or deleted.

## Security

- JWT token authentication
- Password hashing with BCrypt
- CORS configured via `CORS_ALLOWED_ORIGINS` environment variable
- Role-based access control (BORGER/RÅDGIVER)
- Locked questions cannot be modified (403 Forbidden)
- Rate limiting: 60 requests per minute (except auth endpoints)
- Global exception handling with structured error handling

## Project Structure

```
backend/
├── src/main/java/com/questionnaire/
│   ├── config/          # Configuration (MongoDB, JWT, Rate Limiting, Seeder)
│   ├── constants/       # Constants
│   ├── controller/      # REST controllers
│   ├── dto/             # Data Transfer Objects
│   ├── exception/       # Exception handling
│   ├── factory/         # Factory pattern (QuestionFactory, ValidatorFactory)
│   ├── model/           # Domain entities (BaseEntity, Question, Response, User, etc.)
│   ├── repository/      # MongoDB repositories
│   ├── security/        # JWT and Spring Security
│   ├── service/         # Business logic (interfaces and implementations)
│   ├── strategy/        # Strategy pattern (ConditionalLogicStrategy)
│   ├── utils/           # Utility classes (AnswerParser, QuestionOrderUtil)
│   └── validation/      # Validation (Template Method pattern, AnswerValidators)
├── src/test/java/       # Test classes (unit, integration)
└── pom.xml
```

## Environment Variables

The application uses environment variables or a `.env` file for configuration:

- `MONGODB_URI` - MongoDB connection string (required)
- `JWT_SECRET` - Secret key for JWT tokens, minimum 32 characters (required)
- `JWT_EXPIRATION` - Token expiration time in milliseconds (optional, default: 86400000 = 24 hours)
- `CORS_ALLOWED_ORIGINS` - Comma-separated list of allowed origins (optional, default: localhost)

**Note:** The `.env` file must be in the `backend/` directory and be in UTF-8 format without BOM.

## Building for Production

```bash
mvn clean package -DskipTests
```

This creates a JAR file at `target/questionnaire-platform-1.0.0.jar` which can be run with:

```bash
java -jar target/questionnaire-platform-1.0.0.jar
```

Example of running with environment variables (replace values with your own):
```bash
MONGODB_URI=<your-uri> JWT_SECRET=<your-secret-key> \
JWT_EXPIRATION=86400000 CORS_ALLOWED_ORIGINS=http://localhost:3000 \
java -jar target/questionnaire-platform-1.0.0.jar
```

## Design Patterns

The backend implements several OOP design patterns:

### Factory Pattern
- **ValidatorFactory** - Creates AnswerValidator based on question type
- **QuestionFactory** - Creates Question objects with correct configuration

### Strategy Pattern
- **ConditionalLogicStrategy** - Interface for conditional logic
- **DefaultConditionalLogic** - Standard implementation of conditional logic

### Template Method Pattern
- **QuestionnaireValidator** (abstract) - Defines algorithm structure
- **UnifiedQuestionnaireValidator** - Concrete implementation with specific steps

### Builder Pattern
- **QuestionBuilder** - Builds complex Question objects
- **QuestionOptionBuilder** - Builds QuestionOption objects

### Inheritance
- **BaseEntity** - Base class for all entities with common fields (id, createdAt, updatedAt)

## Features

### Soft Delete
Questions can be soft-deleted (marked as deleted via `deletedAt` field) instead of being removed from the database. This makes it possible to restore questions.

### Multi-language Support
Questions support both Danish (`textDa`) and English (`textEn`). API endpoints accept `language` query parameter.

### Color Coding
Questions can have color coding configured via `colorCodeGreenMin/Max`, `colorCodeYellowMin/Max`, and `colorCodeRedMin/Max` fields. This is used for visualization in the frontend.

### Validation Rules
Questions can have validation rules:
- `minValue` / `maxValue` - For numeric and slider
- `minLength` / `maxLength` - For text
- `minTime` / `maxTime` - For time_picker

### Sleep Parameter Calculation
Sleep parameters are automatically calculated from morning responses:
- **SOL** (Sleep Onset Latency) - Time from bedtime to falling asleep
- **WASO** (Wake After Sleep Onset) - Total time awake after sleep onset
- **TIB** (Time in Bed) - Time in bed from bedtime to getting up
- **TST** (Total Sleep Time) - Calculated as TIB - SOL - WASO

Parameters are calculated on-the-fly when requested via the `/api/users/{id}/sleep-data` endpoint.
