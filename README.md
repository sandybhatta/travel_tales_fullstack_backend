# Travel Tales Backend

This repository houses the **backend API** for **Travel Tales**, a comprehensive travel storytelling platform. It provides a robust, RESTful interface for users to document their journeys, manage trips, and interact with a global community of travelers.

Built with performance, scalability, and maintainability in mind, this backend follows the **MVC architecture** and leverages industry-standard security practices.

---

## 1. Project Overview

**Travel Tales** is designed to be the go-to platform for travelers to share their experiences. The backend services support:
*   **User Management**: Secure registration, authentication, and profile management.
*   **Trip Planning**: Creation and management of collaborative trips.
*   **Storytelling**: Rich post creation with media uploads.
*   **Social Interaction**: Commenting, liking, and following capabilities.
*   **Search**: Advanced search functionality for users, trips, and posts.

This API serves as the backbone for the Travel Tales frontend, handling all data persistence, business logic, and third-party integrations (Cloudinary, Brevo).

---

## 2. Architecture Overview

The project follows a modular **Model-View-Controller (MVC)** pattern to ensure separation of concerns.

```mermaid
graph TD
    Client[Client (Frontend)] <-->|HTTP Requests| Middleware[Express Middleware]
    Middleware <-->|Routing| Routes[API Routes]
    Routes <-->|Business Logic| Controllers[Controllers]
    
    subgraph Data Layer
        Controllers <-->|Data Access| Models[Mongoose Models]
        Models <-->|Query/Save| DB[(MongoDB)]
    end
    
    subgraph Services
        Controllers -->|File Upload| Cloudinary[Cloudinary]
        Controllers -->|Email| Brevo[Brevo API]
    end
```

**Flow**:
1.  **Request**: Client sends an HTTP request.
2.  **Middleware**: Handles CORS, JSON parsing, and Authentication checks.
3.  **Router**: Routes the request to the appropriate controller.
4.  **Controller**: Executes business logic, calls Services (Email/Image), and interacts with Models.
5.  **Model**: Defines data schema and interacts with MongoDB.
6.  **Response**: JSON data sent back to the client.

---

## 3. Features

*   **Secure Authentication**: JWT-based stateless authentication with secure password hashing.
*   **Trip Management**: CRUD operations for trips, including visibility settings (public/private).
*   **Media Handling**: Efficient image uploads and storage using Cloudinary.
*   **Social Engagement**: Nested commenting system, likes, and user following.
*   **Advanced Search**: Global search across users, trips, and posts with history tracking.
*   **Email Notifications**: Transactional emails for account verification and updates using Brevo.
*   **Scheduled Tasks**: Automated jobs (via `node-cron`) for trip status management.
*   **Security**: Rate limiting, CORS configuration, and data sanitization.

---

## 4. Tech Stack

*   **Runtime Environment**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/) (v5)
*   **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
*   **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/) & [bcrypt](https://www.npmjs.com/package/bcrypt)
*   **File Storage**: [Cloudinary](https://cloudinary.com/)
*   **Email Service**: [Brevo (formerly Sendinblue)](https://www.brevo.com/)
*   **Scheduling**: [node-cron](https://www.npmjs.com/package/node-cron)
*   **Validation**: [express-validator](https://express-validator.github.io/)

---

## 5. Folder Structure

The project is organized to promote scalability and ease of navigation:

```text
backend/
├── config/             # Database connection and environment configuration
├── Controllers/        # Business logic grouped by entity (Auth, Post, Trip, etc.)
├── cronJob/            # Scheduled tasks (e.g., trip completion)
├── emails/             # EJS templates for transactional emails
├── middlewares/        # Custom middleware (Auth protection, Multer upload)
├── models/             # Mongoose schemas and data models
├── routes/             # API route definitions
├── utils/              # Helper functions (Cloudinary upload, Email transport)
├── index.js            # Application entry point
└── package.json        # Dependencies and scripts
```

---

## 6. API Endpoints Overview

The API is accessible via `/api`. Below are the primary resource groups:

### 🔐 Auth & Users (`/api/auth`, `/api/user`)
*   **Authentication**: Register, Login, Verify OTP, Resend OTP.
*   **User Profile**: Get profile, Update profile, Change settings.
*   **Social Graph**: Follow/Unfollow users, Get followers/following.

### ✈️ Trips (`/api/trips`)
*   **Management**: Create, Edit, Delete trips.
*   **Discovery**: Get all trips, Get trip details, Filter by tag.
*   **Collaboration**: Invite users, Manage collaborators.
*   **Content**: Add posts/notes to trips.

### 📝 Posts & Comments (`/api/posts`, `/api/comment`)
*   **Posts**: Create post, Upload media, Like/Unlike, Delete.
*   **Comments**: Add comment, Reply (nested), Like comment.

### 🔍 Search (`/api/search`)
*   **Global Search**: Unified search for Users, Trips, and Posts.
*   **History**: Manage search history.

---

## 7. Authentication & Authorization Strategy

We use a **stateless JWT (JSON Web Token)** strategy for authentication.

1.  **Login/Register**: Upon successful credentials, the server signs a JWT containing the user's ID.
2.  **Token Transmission**: The client must send this token in the `Authorization` header (`Bearer <token>`) for protected routes.
3.  **Verification**: The `authMiddleware` verifies the token signature and expiration.
4.  **Authorization**: Specific routes check if the user is the owner of the resource (e.g., editing a trip) before allowing modification.

Passwords are **never** stored in plain text; they are hashed using `bcrypt` before storage.

---

## 8. Security Practices

*   **Environment Variables**: Sensitive keys (DB URI, API secrets) are stored in `.env` and never committed to version control.
*   **CORS Policy**: Strictly configured to allow requests only from trusted client origins (`CLIENT_URL`).
*   **Input Validation**: Usage of `express-validator` to sanitize and validate incoming request bodies.
*   **Error Handling**: Centralized error handling to prevent leaking stack traces to the client in production.
*   **Secure Headers**: HTTP headers are managed to prevent common vulnerabilities.

---

## 9. Environment Variables

To run this project, you need to configure the following variables in a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:5173
CLIENT_LIVE_URL=https://your-production-url.com

# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/traveltales

# Authentication
JWT_ACCESS_SECRET=your_super_secret_jwt_key

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Brevo (Email Service)
BREVO_API_KEY=your_brevo_api_key
```

---

## 10. How to Run the Project Locally

**Prerequisites**: Node.js (v18+) and MongoDB installed.

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/travel-tales-backend.git
    cd travel-tales-backend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    *   Create a `.env` file based on the section above.
    *   Fill in your credentials.

4.  **Start the Server**
    *   **Development Mode** (with hot reload):
        ```bash
        npm run dev
        ```
    *   **Production Mode**:
        ```bash
        npm start
        ```

5.  **Verify**: The server should be running at `http://localhost:5000`.

---

## 11. Error Handling Strategy

The application uses a consistent error handling mechanism. All errors are intercepted and formatted into a standard JSON response:

```json
{
  "success": false,
  "message": "Error description here",
  "stack": "Stack trace (only in development)"
}
```

This ensures the frontend can gracefully handle failures (e.g., showing toast notifications) without parsing inconsistent error formats.

---

## 12. Project Design Decisions

*   **Why MVC?**: Separating Models, Views (API responses), and Controllers allows for independent testing and easier code navigation. It prevents "God objects" where all logic lives in route files.
*   **Why Mongoose?**: Provides a schema-based solution to model application data, ensuring data integrity and validation at the application level before it hits the database.
*   **Middleware Approach**: We use middleware for cross-cutting concerns like Authentication and File Uploading to keep controllers clean and focused on business logic.

---

## 13. Future Improvements

*   **Testing**: Implement Unit and Integration tests using **Jest** and **Supertest**.
*   **Caching**: Integrate **Redis** to cache frequent queries (e.g., global search results) for improved performance.
*   **Real-time Features**: Add **Socket.io** for real-time notifications (likes, comments).
*   **API Documentation**: Integrate **Swagger/OpenAPI** for auto-generated API docs.

---

## 14. Final Notes

This backend is built to be **production-ready**. It handles edge cases, secures user data, and is structured to scale. If you are reviewing this code, pay attention to the `Controllers` folder to see the core business logic and `middlewares` to understand our security implementation.

**Thank you for checking out Travel Tales!**
