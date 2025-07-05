# E2B Report Generation Application - Claude Development Guide

## Project Overview

This is a full-stack web application for generating E2B(R3) Individual Case Safety Reports (ICSRs). The application features a NestJS backend with TypeORM and SQLite, and an Angular frontend with Tailwind CSS styling.

## Architecture

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: SQLite with TypeORM
- **Authentication**: JWT with Passport.js
- **File Storage**: Encrypted filesystem storage
- **API Documentation**: Swagger/OpenAPI

### Frontend (Angular)
- **Framework**: Angular with TypeScript
- **Styling**: Tailwind CSS
- **Forms**: Reactive Forms
- **Routing**: Angular Router
- **HTTP**: Angular HTTP Client

## Key Implementation Details

### Security
- Reports are encrypted using AES encryption via crypto-js
- Encryption keys are stored in SQLite database
- JWT tokens for user authentication
- CORS enabled for localhost:4200

### E2B(R3) Compliance
- XML generation based on ICH E2B(R3) specification
- All major data elements implemented
- Proper XML schema structure
- Validation for required fields

### File Structure
```
e2b-app/
├── backend/src/
│   ├── auth/              # Authentication module
│   ├── users/             # User management
│   ├── reports/           # E2B reports handling
│   ├── database/          # Database config
│   └── main.ts            # Application entry point
├── frontend/src/app/
│   ├── auth/              # Login/Register components
│   ├── dashboard/         # Main form component
│   ├── reports/           # Reports list/detail
│   ├── services/          # API services
│   └── models/            # TypeScript interfaces
└── docs/                  # E2B specification files
```

## Development Commands

### Root Level
- `npm run dev` - Start both backend and frontend
- `npm install` - Install concurrently dependency

### Backend
- `npm run start:dev` - Development mode with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Production mode

### Frontend
- `npm start` - Development server (port 4200)
- `npm run build` - Build for production
- `npm run watch` - Build with file watching

## Database Schema

### Users Table
- id (Primary Key)
- email (Unique)
- password (Hashed with bcrypt)
- firstName, lastName
- createdAt, updatedAt
- isActive

### Reports Table
- id (Primary Key)
- title
- xmlContent (empty - actual content in encrypted file)
- encryptionKey (for decrypting file)
- filename (encrypted file name)
- metadata (JSON - form data)
- userId (Foreign Key)
- createdAt, updatedAt

## Key Features Implemented

1. **User Registration/Authentication**
   - JWT-based authentication
   - Password hashing with bcrypt
   - Auth guards and interceptors

2. **E2B Report Generation**
   - Comprehensive form with all E2B data elements
   - Real-time validation
   - XML generation from form data

3. **Report Management**
   - Paginated reports list
   - View detailed report information
   - Download reports as XML
   - Delete reports with confirmation

4. **Encrypted Storage**
   - Reports encrypted with unique keys
   - Keys stored in database
   - Filesystem storage for encrypted files

5. **UI/UX**
   - Responsive design with Tailwind CSS
   - Toggleable navigation menu
   - Form validation feedback
   - Loading states and error handling

## Environment Configuration

### Backend Environment Variables
- `JWT_SECRET` - JWT signing secret (optional, defaults to 'secretKey')
- `PORT` - Server port (optional, defaults to 3000)

### Frontend Environment Files
- `environment.ts` - Development config
- `environment.prod.ts` - Production config

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Reports Management
- `GET /reports?page=1&limit=10` - Get paginated reports
- `POST /reports` - Create new report
- `GET /reports/:id` - Get specific report
- `PUT /reports/:id` - Update report
- `DELETE /reports/:id` - Delete report
- `GET /reports/:id/download` - Download XML file

## Testing Commands

### Backend Testing
- `npm test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:cov` - Run tests with coverage

### Frontend Testing
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode

## Common Development Tasks

### Adding New E2B Fields
1. Update `ReportData` interface in `models/report.model.ts`
2. Add form controls in `dashboard.component.ts`
3. Update form template in `dashboard.component.html`
4. Modify XML generation in `reports.service.ts`
5. Update report detail view in `report-detail.component.html`

### Database Changes
1. Modify entity files in backend
2. Run TypeORM synchronization (automatic in dev mode)
3. Update DTOs and interfaces as needed

### Adding New API Endpoints
1. Add method to appropriate service
2. Add route to controller
3. Update Swagger documentation
4. Add corresponding frontend service method

## Troubleshooting

### Backend Issues
- Check SQLite database permissions
- Verify JWT secret configuration
- Ensure reports directory exists and is writable
- Check TypeORM synchronization settings

### Frontend Issues
- Verify backend is running on port 3000
- Check CORS configuration
- Ensure Angular CLI is properly installed
- Verify environment configuration

### Database Issues
- Delete `e2b_reports.db` to reset database
- Check entity synchronization settings
- Verify TypeORM configuration

## Future Enhancements

Potential areas for improvement:
- User profile management
- Report templates/presets
- Bulk report operations
- Advanced search and filtering
- Report history and versioning
- Email notifications
- Multi-language support
- Advanced validation rules
- Integration with regulatory systems
- Audit logging

## Dependencies

### Backend Key Dependencies
- @nestjs/core, @nestjs/common
- @nestjs/typeorm, typeorm, sqlite3
- @nestjs/jwt, @nestjs/passport
- bcryptjs, crypto-js
- class-validator, class-transformer

### Frontend Key Dependencies
- @angular/core, @angular/common
- @angular/forms, @angular/router
- @angular/common/http
- tailwindcss
- rxjs

## Build and Deployment

### Production Build
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build

# Combined (from root)
npm run build
```

### Deployment Considerations
- Set production environment variables
- Configure proper CORS origins
- Use HTTPS in production
- Set up proper file storage
- Configure database for production use
- Enable gzip compression
- Set up logging and monitoring