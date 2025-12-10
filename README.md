# Questionnaire Platform

A web-based platform for daily sleep and wellness tracking through morning and evening questionnaires. Citizens can complete questionnaires while advisors can view responses and edit the evening questionnaire.

## Overview

The platform consists of two main questionnaires:
- **Morning Questionnaire** - Locked, non-editable, used for sleep parameter calculations
- **Evening Questionnaire** - Editable by advisors, supports conditional logic

## Features

### Citizen Features
- User authentication (login/registration)
- Daily morning and evening questionnaire completion
- Wizard-style interface (one question at a time)
- Conditional logic support in evening questionnaire
- Automatic sleep parameter calculation from morning responses
- Review of submitted responses
- View calculated sleep parameters

### Advisor Features
- User authentication
- Overview of all citizens and their responses
- Search and filter citizens
- Period-based filtering of responses
- Sleep parameter visualization with charts and color coding
- Edit evening questionnaire:
  - Add, edit, and delete questions
  - Drag-and-drop reordering
  - Add answer options
  - Create conditional follow-up questions
  - Color coding of questions
  - Validation rules (min/max values, length, etc.)
- Assign advisors to citizens
- Read-only view of locked morning questionnaire
- Soft delete of questions (can be restored)

## Teknologi Stack

### Backend
- Java 17
- Spring Boot 3.2.0
- Spring Data MongoDB
- Spring Security (JWT authentication)
- MongoDB
- Lombok (reduces boilerplate code)
- Dotenv (environment variable handling)

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Axios
- @dnd-kit (drag-and-drop)
- Recharts (charts and visualization)
- i18next (internationalization - Danish/English)

## Project Structure

```
Projekt/
├── backend/          # Spring Boot backend
│   ├── src/main/java/com/questionnaire/
│   │   ├── config/          # Configuration (MongoDB, JWT, Rate Limiting)
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── exception/       # Exception handling
│   │   ├── factory/         # Factory pattern implementation
│   │   ├── model/           # Domain entities
│   │   ├── repository/      # MongoDB repositories
│   │   ├── security/        # JWT and Spring Security
│   │   ├── service/         # Business logic
│   │   ├── strategy/        # Strategy pattern implementation
│   │   ├── utils/           # Utility classes
│   │   └── validation/      # Validation (Template Method pattern)
│   └── src/test/java/       # Test classes
├── frontend/         # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── features/         # Feature-based modules
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service layer
│   │   ├── context/          # React contexts (Auth, Theme, Language, Toast)
│   │   ├── routing/          # Routing configuration
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Utility functions
│   │   └── i18n/             # Internationalization
│   └── public/               # Static assets
└── README.md         # This file
```

## Getting Started

### Prerequisites
- Java 17 or newer
- Maven 3.6+
- Node.js 20+
- MongoDB (cloud or local)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a `.env` file with the following content:
```env
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret-key-minimum-32-characters
JWT_EXPIRATION=86400000
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Note:** `JWT_SECRET` must be at least 32 characters long (256 bits) for security. `JWT_EXPIRATION` is in milliseconds (default: 86400000 = 24 hours).

3. Build the project:
```bash
mvn clean install
```

4. Run the application:
```bash
mvn spring-boot:run
```

The backend will run on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

For production build:
```bash
npm run build
```

The frontend will run on `http://localhost:3000` (proxy for `/api` to `http://localhost:8080`)

For production, the API URL can be set via `VITE_API_URL` (e.g., in `.env.production`):
```env
VITE_API_URL=http://your-server-ip/api
```

## API Documentation

See [backend/README.md](backend/README.md) for detailed API endpoint documentation.

## Testing

### Backend Tests
- `mvn test` - Run all tests
- `mvn test -Dtest=*IntegrationTest` - Run all integration tests
- `mvn test -Dtest=QuestionnaireSystemTest` - Run system test
- `mvn test -Dtest=*UnitTest` - Run all unit tests

### Frontend Linting
- `npm run lint` - Run ESLint

See [backend/src/test/README.md](backend/src/test/README.md) for details on test structure.

## Design Patterns

The project implements several OOP design patterns:

### Backend
- **Factory Pattern** - `ValidatorFactory` to create validators based on question type
- **Strategy Pattern** - `ConditionalLogicStrategy` and `DefaultConditionalLogic` for conditional logic
- **Template Method Pattern** - `QuestionnaireValidator` (abstract) and `UnifiedQuestionnaireValidator` (concrete implementation)
- **Builder Pattern** - `QuestionBuilder` and `QuestionOptionBuilder` to build complex objects
- **Inheritance** - `BaseEntity` as base class for all entities, `Validatable` interface

### Frontend
- **Context Pattern** - React Contexts for Auth, Theme, Language, and Toast
- **Custom Hooks** - Feature-specific hooks for logic separation
- **Component Composition** - Reusable components

## Features in Detail

### Internationalization (i18n)
The platform supports both Danish and English. The language can be changed via the language selector in the UI.

### Rate Limiting
The backend implements rate limiting (60 requests per minute) to protect against abuse.

### Soft Delete
Questions can be soft-deleted (marked as deleted without being removed from the database), making it possible to restore them.

### Color Coding
Advisors can add color coding to questions to visualize data (green/yellow/red based on values).

### Sleep Parameters
The platform automatically calculates the following sleep parameters from morning responses:
- **SOL** (Sleep Onset Latency) - Time from bedtime to falling asleep
- **WASO** (Wake After Sleep Onset) - Total time awake after sleep onset
- **TIB** (Time in Bed) - Time in bed from bedtime to getting up
- **TST** (Total Sleep Time) - Calculated as TIB - SOL - WASO

## License

This project is part of an Aalborg University course project.




