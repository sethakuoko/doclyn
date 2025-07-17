# Doclyn Spring Boot Backend

This is the Spring Boot backend for the Doclyn mobile application, handling user authentication and data management.

## Setup Instructions

### Prerequisites
- Java 24 or higher
- MySQL 8.0 or higher
- Maven

### Database Setup
1. Create the database in MySQL:
```sql
CREATE DATABASE IF NOT EXISTS DocylnDB;
USE DocylnDB;

CREATE TABLE IF NOT EXISTS users(
    id VARCHAR(200) PRIMARY KEY,
    fullName VARCHAR(100),
    email VARCHAR(100)
);
```

### Configuration
Update `src/main/resources/application.properties` with your MySQL credentials:
```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Running the Application
1. Navigate to the DoclynDB directory
2. Run: `mvn spring-boot:run`
3. The application will start on `http://localhost:8080`

## API Endpoints

### User Management

#### POST /api/users/login
Authenticates a user and saves/updates their information in the database.

**Request Body:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "message": "User login successful",
  "success": true,
  "id": "user_id",
  "email": "user@example.com",
  "fullName": "John Doe"
}
```

#### GET /api/users/health
Health check endpoint to verify the service is running.

**Response:**
```
User service is running!
```

## Project Structure

```
src/main/java/com/doclyn/Doclyn/
├── DoclynApplication.java      # Main application class
├── controller/
│   └── UserController.java     # REST endpoints
├── service/
│   └── UserService.java        # Business logic
├── repository/
│   └── UserRepository.java     # Data access layer
├── entity/
│   └── User.java              # Database entity
└── dto/
    ├── UserLoginRequest.java   # Request DTO
    └── UserLoginResponse.java  # Response DTO
```

## Features

- User authentication and session management
- Automatic user creation/update on login
- MySQL database integration
- RESTful API endpoints
- Cross-origin resource sharing (CORS) enabled
- Comprehensive error handling

## Dependencies

- Spring Boot 3.5.3
- Spring Data JPA
- MySQL Connector
- Lombok
- Spring Web 