# E2B(R3) Report Generation Application

A comprehensive web application for generating, managing, and storing Individual Case Safety Reports (ICSRs) in E2B(R3) format. Built with Angular frontend and NestJS backend.

## Features

- **User Authentication**: Secure login and registration system
- **E2B Report Generation**: Interactive form for creating E2B(R3) compliant XML reports
- **FDA Validation**: Built-in validation using FDA's E2B validator API
- **Dual View Mode**: Toggle between human-readable and XML view for reports
- **Encrypted Storage**: Reports are stored encrypted on the filesystem with decryption keys in SQLite
- **Report Management**: View, edit, delete, and download reports
- **Auto-navigation**: Automatically redirect to report details after creation
- **Pretty Interface**: Clean, responsive design using Tailwind CSS
- **Paginated Reports List**: Organized view of all user reports
- **Toggleable Menu**: Easy navigation between sections

## Technology Stack

### Backend
- **NestJS**: Node.js framework for scalable server-side applications
- **TypeORM**: Object-relational mapping for database interactions
- **SQLite**: Lightweight database for metadata storage
- **Passport.js**: Authentication middleware
- **JWT**: JSON Web Tokens for session management
- **Crypto-JS**: Encryption library for secure report storage
- **Swagger**: API documentation

### Frontend
- **Angular**: Modern web application framework
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **Reactive Forms**: Form handling and validation
- **Angular Router**: Client-side routing
- **HTTP Client**: API communication

## Project Structure

```
e2b-app/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── reports/        # E2B reports handling
│   │   ├── database/       # Database configuration
│   │   └── common/         # Shared utilities
│   ├── reports/            # Encrypted report files
│   └── e2b_reports.db      # SQLite database
├── frontend/               # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── dashboard/  # Main report creation form
│   │   │   ├── reports/    # Report management
│   │   │   ├── services/   # API services
│   │   │   └── models/     # TypeScript interfaces
│   │   └── environments/   # Environment configuration
└── docs/                   # E2B(R3) specification documents
```

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd e2b-app/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm run start:dev
   ```

   The backend will be available at `http://localhost:3000`
   API documentation will be available at `http://localhost:3000/api`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd e2b-app/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:4200`

### Complete Application Setup

From the root directory, you can start both backend and frontend simultaneously:

```bash
cd e2b-app
npm install
npm run dev
```

## Usage

### Getting Started

1. **Register an Account**:
   - Navigate to `http://localhost:4200`
   - Click "Create a new account"
   - Fill in your details and register

2. **Create Your First Report**:
   - After logging in, you'll be taken to the main dashboard
   - Fill out the E2B report form with required information:
     - Basic information (title, country)
     - Reporter information (contact details)
     - Patient information (demographics)
     - Adverse reaction details
     - Drug information
     - Seriousness criteria
   - Click "Create E2B Report" to generate the XML

3. **Manage Reports**:
   - After creating a report, you'll be automatically redirected to the report details page
   - Toggle between "Human View" and "XML View" to see different formats
   - Use the "Validate with FDA" button to check FDA compliance
   - Download the report as XML or copy XML to clipboard
   - Click "View My Reports" to see all your reports
   - Use the reports list to view, edit, download, or delete reports
   - Click "Menu" in the navigation to access different sections

### E2B Report Fields

The application supports all major E2B(R3) data elements including:

- **Reporter Information**: Name, organization, contact details
- **Patient Demographics**: Initials, age, sex, weight, height
- **Adverse Event Details**: Description, dates, duration, outcome
- **Drug Information**: Product name, dosage, route, dates
- **Seriousness Criteria**: Death, life-threatening, hospitalization, etc.

### Security Features

- **User Authentication**: JWT-based secure authentication
- **Encrypted Storage**: All E2B reports are encrypted using AES encryption
- **Access Control**: Users can only access their own reports
- **Secure API**: All endpoints require authentication except registration/login

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Reports
- `GET /reports` - Get user's reports (paginated)
- `POST /reports` - Create new report
- `GET /reports/:id` - Get specific report
- `PUT /reports/:id` - Update report
- `DELETE /reports/:id` - Delete report
- `GET /reports/:id/download` - Download report as XML
- `POST /reports/:id/validate` - Validate report with FDA E2B validator

## Development

### Backend Development
```bash
cd backend
npm run start:dev      # Development mode with hot reload
npm run build          # Build for production
npm run start:prod     # Production mode
```

### Frontend Development
```bash
cd frontend
npm start              # Development mode
npm run build          # Build for production
npm run watch          # Build with file watching
```

### Database

The application uses SQLite for metadata storage. The database file `e2b_reports.db` is automatically created in the backend directory when the server starts.

### File Storage

E2B reports are stored as encrypted files in the `backend/reports/` directory. Each file is encrypted using a unique key stored in the database.

## Configuration

### Environment Variables

Backend environment variables (optional):
- `JWT_SECRET`: Secret key for JWT tokens (defaults to 'secretKey')
- `PORT`: Server port (defaults to 3000)

Frontend environment configuration in `src/environments/`:
- `environment.ts`: Development configuration
- `environment.prod.ts`: Production configuration

## Troubleshooting

### Common Issues

1. **Backend fails to start**:
   - Ensure Node.js version is 18 or higher
   - Check if port 3000 is available
   - Delete `node_modules` and run `npm install` again

2. **Frontend fails to start**:
   - Ensure Angular CLI is installed: `npm install -g @angular/cli`
   - Check if port 4200 is available
   - Verify backend is running on port 3000

3. **CORS issues**:
   - Ensure backend CORS is configured for `http://localhost:4200`
   - Check network configuration

4. **Database issues**:
   - Delete `e2b_reports.db` to reset the database
   - Ensure write permissions in the backend directory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## E2B(R3) Compliance

This application generates E2B(R3) compliant XML files based on the ICH E2B(R3) specification. The generated reports include all required data elements and follow the proper XML schema structure for regulatory submission.

### Validation
- **FDA E2B Validator Integration**: Built-in integration with FDA's official E2B validator API
- **Real-time Validation**: Validate reports directly from the application interface
- **Error Reporting**: Detailed validation error messages with specific element references
- **DTD Compliance**: XML structure follows the official E2B DTD specification

### XML Features
- **Proper DTD Declaration**: Includes required DOCTYPE declaration for FDA compliance
- **Element Filtering**: Only includes FDA-recognized E2B elements to prevent validation errors
- **XML Escaping**: Proper handling of special characters in XML content
- **Date Formatting**: Correct E2B date/time formatting (CCYYMMDD and CCYYMMDDHHMMSS)

For more information about E2B(R3) standards, refer to the documentation in the `docs/` directory.