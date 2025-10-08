# Ticketing System

A full-stack IT support ticketing system built with Spring Boot (backend) and Next.js (frontend). This application allows users to create, manage, and track support tickets with role-based access control.

## Features

- User authentication and authorization with JWT
- Role-based access control (User, Support Agent, Admin)
- Ticket creation and management
- Comment system for ticket discussions
- File attachments for tickets
- Ticket status tracking (Open → In Progress → Resolved → Closed)
- Ticket priority levels (Low, Medium, High, Urgent)
- Search and filter tickets
- Rating system for resolved tickets

### User Roles & Permissions

#### 1. **USER (Regular User)**
**Can:**
- Register and login to the system
- Create new support tickets
- View their own tickets only
- Add comments to their own tickets
- Update status of their own tickets
- Upload attachments to their own tickets
- Rate tickets after resolution
- Search through their own tickets

**Cannot:**
- View other users' tickets
- Assign tickets to support agents
- Access admin panel
- Manage other users

**Typical Use Case:** End users who need IT support or have customer service issues

---

#### 2. **SUPPORT_AGENT (Support Agent)**
**Can:**
- Everything a USER can do, plus:
- View tickets assigned to them
- View tickets they created
- Assign tickets to other support agents
- Change status of tickets assigned to them
- Add comments to tickets they have access to
- Upload attachments to tickets they manage

**Cannot:**
- View all tickets in the system (only their own and assigned ones)
- Access admin panel
- Create, modify, or delete users
- Force reassign tickets they don't have access to

**Typical Use Case:** IT support staff, customer service representatives who handle and resolve tickets

---

#### 3. **ADMIN (Administrator)**
**Can:**
- Everything a SUPPORT_AGENT can do, plus:
- View ALL tickets in the system
- Assign/reassign any ticket to any support agent
- Force close or reopen any ticket
- Access the Admin Panel
- Create new users (User, Support Agent, or Admin)
- Modify user roles
- Delete users from the system
- View user management dashboard
- Override any ticket actions

**Cannot:**
- (Admins have full access to all features)

**Typical Use Case:** System administrators, IT managers who oversee the entire support system

---

## Tech Stack

### Backend
- **Java 17**
- **Spring Boot 3.5.6**
- **Spring Security** (JWT-based authentication)
- **Spring Data JPA** (Database operations)
- **PostgreSQL** (Database)
- **Maven** (Build tool)

### Frontend
- **Next.js 14** (React framework with App Router)
- **TypeScript**
- **Tailwind CSS** (Styling)
- **Axios** (HTTP client)
- **Zustand** (State management)
- **React Hot Toast** (Notifications)

---

## Prerequisites

- **Java 17** or higher
- **Node.js 18** or higher
- **PostgreSQL 12** or higher
- **Maven 3.6** or higher

---

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ticketing-system
```

### 2. Database Setup

Create a PostgreSQL database:
```sql
CREATE DATABASE ticketing_db;
```

### 3. Backend Setup

Navigate to backend folder:
```bash
cd backend
```

Update `src/main/resources/application.properties` with your database credentials:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ticketing_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

Build and run:
```bash
mvn clean install
mvn spring-boot:run
```

The backend will start at `http://localhost:8080`

### 4. Frontend Setup

Navigate to frontend folder:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Create `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Run development server:
```bash
npm run dev
```

The frontend will start at `http://localhost:3000`

## Default Users & Getting Started

### Creating Your First Admin User

1. Register a new user through the application at `http://localhost:3000/register`
2. By default, new users are created with the **USER** role
3. To make this user an **ADMIN**, manually update the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'youremail@example.com';
```

4. Logout and login again to apply the role change

### Creating Support Agents

Once you have an admin account:
1. Login as admin
2. Navigate to Admin Panel (link in navbar)
3. Click "Create New User"
4. Fill in details and select role as "Support Agent"
5. The new support agent can now login with those credentials

## User Workflows

### As a Regular User:
1. Register/Login → Dashboard
2. Click "Create New Ticket"
3. Fill in subject, description, and priority
4. View ticket status and add comments
5. Upload attachments if needed
6. Once resolved, rate the ticket resolution

### As a Support Agent:
1. Login → View assigned tickets
2. Update ticket status as you work on it
3. Add comments to communicate with users
4. Mark as resolved when complete

### As an Admin:
1. Login → View all tickets
2. Access Admin Panel to manage users
3. Assign tickets to support agents
4. Create new support agents
5. Monitor overall ticket status
6. Override any ticket actions if needed

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Tickets
- `GET /api/tickets` - Get user's tickets
- `GET /api/tickets/{id}` - Get ticket details
- `POST /api/tickets` - Create new ticket
- `PUT /api/tickets/{id}/status` - Update ticket status
- `PUT /api/tickets/{id}/assign` - Assign ticket
- `POST /api/tickets/{id}/rate` - Rate ticket
- `POST /api/tickets/{id}/comments` - Add comment
- `GET /api/tickets/{id}/comments` - Get comments
- `GET /api/tickets/search?query=` - Search tickets
- `GET /api/tickets/filter/status?status=` - Filter by status
- `GET /api/tickets/filter/priority?priority=` - Filter by priority

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/{id}/role?role=` - Update user role
- `DELETE /api/admin/users/{id}` - Delete user

### Files
- `POST /api/files/upload/{ticketId}` - Upload file
- `GET /api/files/download/{attachmentId}` - Download file

## Security

- JWT-based authentication
- Role-based access control
- Password encryption using BCrypt
- CORS configuration for frontend-backend communication
- Secure file upload/download