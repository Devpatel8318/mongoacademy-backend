# Mongo Academy Backend

## Description

This backend service provides a platform for practicing **MongoDB queries**. It allows users to practice CRUD operations, aggregate queries, and more. The platform includes authentication via **Google OAuth** and **email/password** and is powered by a **TypeScript** backend built with **Koa.js**.

This project uses **Docker Compose** for local development with a Redis service for caching, and **GitHub Actions** for **Continuous Integration (CI)** and **Continuous Deployment (CD)** to automate deployments.

---
## 🔧 Technologies Used

* **Backend:** Koa.js (with TypeScript)
* **Database:** MongoDB
* **Authentication:** JWT (Access & Refresh tokens), Google OAuth, Email/Password
* **Caching:** Redis
* **Queues:** AWS SQS (for async task processing)
* **WebSockets:** For real-time notifications
* **Hosting:** AWS Elastic Beanstalk
* **Infrastructure:** AWS VPC, CloudFront, Secrets Manager, ACM (SSL certificates)
* **Version Control:** GitHub
* **CI/CD:** GitHub Actions

---

## 🧰 Local Development Setup with Docker

### Prerequisites:

1. **Docker**: Ensure Docker is installed and running on your machine. [Install Docker](https://www.docker.com/get-started).

### 1. Clone the repository:

### 2. Set Up the Environment Variables

Before starting the services, ensure you have the `.env.development` file in your project’s root directory with the following content (modify values as needed):

```bash
NODE_ENV
BACKEND_PORT
MONGODB_URL
MONGODB_READ_ONLY_URL
MONGODB_DB_NAME
MONGODB_READ_ONLY_DB_NAME
JWT_SECRET
USER_FRONTEND_URL
ACCESS_TOKEN_COOKIE_NAME
REFRESH_TOKEN_COOKIE_NAME
DEFAULT_CONCURRENCY
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
MONGOACADEMY_REST_TO_QUERYPROCESSOR_QUEUE_URL
CLOUDFRONT_URL
CLOUDFRONT_KEY_PAIR_ID
CLOUDFRONT_PRIVATE_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
ENCRYPTION_KEY
JWT_ISSUER
DO_NOT_CACHE
GITHUB_TOKEN
SENDGRID_API_KEY
```

### 3. Start the Services

Use **Docker Compose** to build and start your backend service along with Redis:

```bash
yarn up
```

* This will:

  * Build the **backend** container with the development target.
  * Start the **Redis** container.
  * Expose the backend on port `9050` and Redis on port `6379`.
  * Load the environment variables from `.env.development`.

### 4. Access the Application

Once the containers are up and running, you can access the backend service via `http://localhost:PORT`. Redis will be running on `localhost:6379`.


## 📝 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.

---

## ❓ Contributing

At this time, we are **not accepting contributions**. Please feel free to use the code for personal or educational purposes only.

---

### 📬 Contact

For any questions, suggestions, or feedback, please contact:

* **Email:** [devpatelm8318@gmail.com](mailto:devpatelm8318@gmail.com)
