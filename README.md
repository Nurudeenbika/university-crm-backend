# University CRM Backend

A scalable University Customer Relationship Management system built with NestJS, featuring role-based access control, course lifecycle workflows, AI integrations, and real-time notifications.

## Features

- 🔐 **Authentication & Authorization**: JWT-based auth with role-based access control
- 📚 **Course Management**: Complete course lifecycle management
- 📝 **Assignment System**: File uploads, grading, and automated grade calculation
- 🤖 **AI Integration**: Course recommendations and syllabus generation
- 🔔 **Real-time Notifications**: WebSocket-based notifications
- 📄 **Document Generation**: PDF transcript generation
- 🐳 **Containerized**: Full Docker support with docker-compose

## Technology Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Cache/Sessions**: Redis
- **Authentication**: JWT
- **File Upload**: Multer
- **AI Integration**: OpenAI API
- **Real-time**: WebSockets
- **Documentation**: Swagger/OpenAPI

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (if running locally)

### Docker Setup (Recommended)

1. Clone the repository:

```bash
git clone <repository-url>
cd university-crm-backend
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Update the `.env` file with your configurations:

```bash
# Required: Change the JWT secret
JWT_SECRET=your-super-secret-jwt-key-here

# Optional: Add OpenAI API key for AI features
OPENAI_API_KEY=your-openai-api-key
```

4. Start the application:

```bash
docker-compose up --build
```

The application will be available at `http://localhost:3000`

### Local Development Setup

1. Install dependencies:

```bash
npm install
```

2. Set up PostgreSQL database:

```bash
# Create database
createdb university_crm
```

3. Copy and configure environment:

```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Run database migrations:

```bash
npm run migration:run
```

5. Start the development server:

```bash
npm run start:dev
```

## API Documentation

Once the application is running, access the Swagger documentation at:

- **Development**: http://localhost:3000/api/docs
- **Production**: https://your-domain.com/api/docs

## Default Users

The system creates default users for testing:

### Admin User

- **Email**: admin@university.edu
- **Password**: admin123
- **Role**: Admin

### Lecturer User

- **Email**: lecturer@university.edu
- **Password**: lecturer123
- **Role**: Lecturer

### Student User

- **Email**: student@university.edu
- **Password**: student123
- **Role**: Student

## Core API Endpoints

### Authentication

```
POST /auth/register    # Register new user
POST /auth/login       # User login
GET  /auth/profile     # Get current user profile
```

### Courses

```
GET    /courses           # List all courses
POST   /courses           # Create course (Lecturer/Admin)
GET    /courses/:id       # Get course details
PUT    /courses/:id       # Update course
DELETE /courses/:id       # Delete course (Admin)
```

### Enrollments

```
POST   /enrollments                 # Enroll in course
GET    /enrollments                 # List user enrollments
PUT    /enrollments/:id/approve     # Approve enrollment (Admin)
PUT    /enrollments/:id/reject      # Reject enrollment (Admin)
DELETE /enrollments/:id             # Drop course
```

### Assignments

```
POST /assignments              # Submit assignment
GET  /assignments              # List assignments
PUT  /assignments/:id/grade    # Grade assignment (Lecturer)
GET  /assignments/course/:id   # Get course assignments
```

### AI Services

```
POST /ai/recommend    # Get course recommendations
POST /ai/syllabus     # Generate course syllabus
```

## Role-Based Access Control

### Student Role

- Enroll in courses
- Submit assignments
- View grades and transcripts
- Receive notifications

### Lecturer Role

- Create and manage courses
- Upload syllabus documents
- Grade student assignments
- View course analytics

### Admin Role

- Manage all users
- Approve/reject enrollments
- Assign lecturers to courses
- Generate system reports

## File Upload

The system supports file uploads for:

- **Syllabus**: PDF, DOCX (Lecturers)
- **Assignments**: PDF, DOCX, images (Students)

**File Limits**:

- Maximum size: 10MB
- Supported formats: PDF, DOCX, DOC, JPG, JPEG, PNG, GIF, TXT

## AI Features

### Course Recommendations

- Analyzes student interests and history
- Suggests relevant courses
- Considers prerequisite requirements

### Syllabus Generation

- Auto-generates course syllabus
- Based on course topic and level
- Customizable templates

**Note**: If no OpenAI API key is provided, the system uses mock responses for demonstration.

## Real-time Features

### WebSocket Events

- Grade updates
- Enrollment status changes
- Assignment submissions
- Course announcements

Connect to WebSocket at: `ws://localhost:3000/notifications`

## Database Schema

### Core Tables

- `users` - User accounts and profiles
- `courses` - Course information
- `enrollments` - Student-course relationships
- `assignments` - Assignment submissions and grades

See [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) for detailed schema.

## Environment Variables

| Variable         | Description        | Default        |
| ---------------- | ------------------ | -------------- |
| `NODE_ENV`       | Environment mode   | development    |
| `PORT`           | Server port        | 3000           |
| `DB_HOST`        | Database host      | localhost      |
| `DB_PORT`        | Database port      | 5433           |
| `DB_USERNAME`    | Database username  | postgres       |
| `DB_PASSWORD`    | Database password  | password       |
| `DB_NAME`        | Database name      | university_crm |
| `JWT_SECRET`     | JWT signing secret | **Required**   |
| `JWT_EXPIRES_IN` | Token expiration   | 24h            |
| `OPENAI_API_KEY` | OpenAI API key     | Optional       |

## Development Commands

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start in debug mode

# Building
npm run build              # Build for production
npm run start:prod         # Start production build

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Generate coverage report

# Database
npm run migration:generate # Generate new migration
npm run migration:run      # Run pending migrations
npm run migration:revert   # Revert last migration

# Code Quality
npm run lint               # Lint code
npm run format             # Format code with Prettier
```

## Docker Commands

```bash
# Development
docker-compose up --build    # Build and start all services
docker-compose down          # Stop all services

# Production
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs backend
docker-compose logs postgres

# Execute commands in container
docker-compose exec backend npm run migration:run
```

## Deployment

### Using Docker Compose (Recommended)

1. Set up production environment:

```bash
cp .env.example .env.production
# Configure production values
```

2. Deploy:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

1. Build the application:

```bash
npm run build
```

2. Set up production database and run migrations:

```bash
npm run migration:run
```

3. Start the application:

```bash
npm run start:prod
```

## Health Checks

- **Health Check**: `GET /health`
- **Database Check**: `GET /health/db`
- **Redis Check**: `GET /health/redis`

## Monitoring & Logging

- Application logs are written to console
- Database query logging in development
- Error tracking with stack traces
- Performance metrics available

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- File upload restrictions
- CORS configuration
- Rate limiting (configurable)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## Troubleshooting

### Common Issues

**Database Connection Issues**:

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View database logs
docker-compose logs postgres
```

**File Upload Issues**:

```bash
# Ensure uploads directory exists
mkdir -p uploads
chmod 755 uploads
```

**JWT Token Issues**:

- Ensure `JWT_SECRET` is set in environment
- Check token expiration settings
- Verify token format in requests

### Getting Help

- Check the API documentation at `/api/docs`
- Review error logs in console
- Ensure all environment variables are set
- Verify database connectivity

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- Create an issue on GitHub
- Check the documentation
- Review the API endpoints in Swagger

---

**Happy coding! 🚀**
