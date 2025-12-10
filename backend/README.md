# Questionnaire Platform - Backend

Backend implementation in Java 17 with Spring Boot 3.2.0 and MongoDB.

## Requirements

- Java 17 or newer
- Maven 3.6+
- MongoDB (cloud or local)

## Setup

1. Create a `.env` file in the `backend/` directory with the following keys (placér filen i `backend/`, UTF-8 uden BOM):

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

**Dotenv indlæsning:** `MongoConfig` forsøger først environment variabler, derefter `.env` i `backend/`. Filen skal ligge i samme mappe som `pom.xml` og må ikke indeholde BOM.

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

Ved opstart seedes morgen spørgeskemaet automatisk med 9 låste spørgsmål via `DatabaseSeeder`. Disse spørgsmål er låste (`isLocked = true`) og kan ikke redigeres eller slettes.

## Security

- JWT token authentication
- Password hashing med BCrypt
- CORS konfigureret via `CORS_ALLOWED_ORIGINS` miljøvariabel
- Role-based access control (BORGER/RÅDGIVER)
- Låste spørgsmål kan ikke modificeres (403 Forbidden)
- Rate limiting: 60 requests per minut (undtaget auth endpoints)
- Global exception handling med struktureret fejlhåndtering

## Projekt Struktur

```
backend/
├── src/main/java/com/questionnaire/
│   ├── config/          # Konfiguration (MongoDB, JWT, Rate Limiting, Seeder)
│   ├── constants/       # Konstanter
│   ├── controller/      # REST controllers
│   ├── dto/             # Data Transfer Objects
│   ├── exception/       # Exception håndtering
│   ├── factory/         # Factory pattern (QuestionFactory, ValidatorFactory)
│   ├── model/           # Domain entities (BaseEntity, Question, Response, User, osv.)
│   ├── repository/      # MongoDB repositories
│   ├── security/        # JWT og Spring Security
│   ├── service/         # Business logic (interfaces og implementeringer)
│   ├── strategy/        # Strategy pattern (ConditionalLogicStrategy)
│   ├── utils/           # Utility klasser (AnswerParser, QuestionOrderUtil)
│   └── validation/      # Validering (Template Method pattern, AnswerValidators)
├── src/test/java/       # Test klasser (unit, integration, system)
└── pom.xml
```

## Miljøvariabler

Applikationen bruger miljøvariabler eller en `.env` fil til konfiguration:

- `MONGODB_URI` - MongoDB connection string (påkrævet)
- `JWT_SECRET` - Hemmelig nøgle til JWT tokens, minimum 32 tegn (påkrævet)
- `JWT_EXPIRATION` - Token udløbstid i millisekunder (valgfri, standard: 86400000 = 24 timer)
- `CORS_ALLOWED_ORIGINS` - Kommasepareret liste over tilladte origins (valgfri, standard: localhost)

**Bemærk:** `.env` filen skal ligge i `backend/` mappen og være i UTF-8 format uden BOM.

## Bygning til Production

```bash
mvn clean package -DskipTests
```

Dette opretter en JAR fil i `target/questionnaire-platform-1.0.0.jar` som kan køres med:

```bash
java -jar target/questionnaire-platform-1.0.0.jar
```

Eksempel på kørsel med miljøvariabler (erstatt værdier med egne):
```bash
MONGODB_URI=<din-uri> JWT_SECRET=<din-hemmelige-nøgle> \
JWT_EXPIRATION=86400000 CORS_ALLOWED_ORIGINS=http://localhost:3000 \
java -jar target/questionnaire-platform-1.0.0.jar
```

## Design Patterns

Backend implementerer flere OOP design patterns:

### Factory Pattern
- **ValidatorFactory** - Opretter AnswerValidator baseret på spørgsmålstype
- **QuestionFactory** - Opretter Question objekter med korrekt konfiguration

### Strategy Pattern
- **ConditionalLogicStrategy** - Interface for betinget logik
- **DefaultConditionalLogic** - Standard implementering af betinget logik

### Template Method Pattern
- **QuestionnaireValidator** (abstract) - Definerer algoritme struktur
- **UnifiedQuestionnaireValidator** - Konkret implementering med specifikke steps

### Builder Pattern
- **QuestionBuilder** - Bygger komplekse Question objekter
- **QuestionOptionBuilder** - Bygger QuestionOption objekter

### Inheritance
- **BaseEntity** - Base klasse for alle entities med fælles felter (id, createdAt, updatedAt)
- **Validatable** - Interface for validering

## Features

### Soft Delete
Spørgsmål kan soft-deletes (markeres som slettet via `deletedAt` felt) i stedet for at blive fjernet fra databasen. Dette gør det muligt at gendanne spørgsmål.

### Multi-language Support
Spørgsmål understøtter både dansk (`textDa`) og engelsk (`textEn`). API endpoints accepterer `language` query parameter.

### Color Coding
Spørgsmål kan have farvekodning konfigureret via `colorCodeGreenMin/Max`, `colorCodeYellowMin/Max`, og `colorCodeRedMin/Max` felter. Dette bruges til visualisering i frontend.

### Validation Rules
Spørgsmål kan have valideringsregler:
- `minValue` / `maxValue` - For numeric og slider
- `minLength` / `maxLength` - For text
- `minTime` / `maxTime` - For time_picker

### Sleep Parameter Calculation
Søvnparametre beregnes automatisk fra morgenresponser:
- **SOL** (Sleep Onset Latency) - Tid fra sengetid til indsovning
- **WASO** (Wake After Sleep Onset) - Total tid vågen efter indsovning
- **TIB** (Time in Bed) - Tid i seng fra sengetid til opstigning
- **TST** (Total Sleep Time) - Beregnet som TIB - SOL - WASO

Parametrene beregnes on-the-fly når de anmodes via `/api/users/{id}/sleep-data` endpoint.
