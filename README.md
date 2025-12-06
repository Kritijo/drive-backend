# Drive-backend

This is the backend for a mini drive application built with Node.js, Express, and Prisma.
It provides APIs for folder and file management, including uploading, listing, editing, and deleting folders and files.

## Features

- Upload folders and files
- List contents of folders
- Edit folder names
- Delete folders and their contents (recursively)
- User authentication and authorization

## Technologies Used

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- Multer for file uploads
- Passport Local strategy and Google strategy for authentication

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/Kritijo/drive-backend.git
   ```
2. Navigate to the project directory:
   ```bash
   cd drive-backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up the database:
   - Ensure you have PostgreSQL installed and running.
   - Create a new database for the application.
   - Configure the database connection in the `.env` file.
5. Create a `.env` file in the root directory and add the following environment variables:
   ```
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    SESSION_SECRET="your_session_secret"
    GOOGLE_CLIENT_ID="your_google_client_id"
    GOOGLE_CLIENT_SECRET="your_google_client_secret"
    GOOGLE_CALLBACK_URL="http://localhost:3000/oauth/google/callback"
   ```
6. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```
7. Start the server:
   ```bash
   npm run start
   ```
8. The server will be running at `http://localhost:3000`.

## API Endpoints

- `POST /folder`: Upload a new folder
- `GET /folder` : List root folder items
- `GET /folder/:folderId`: List items in a folder
- `PUT /folder/:folderId`: Edit a folder's name
- `DELETE /folder/:folderId`: Delete a folder and its contents
- `POST /file`: Upload a new file
- `GET /file/:fileId/download`: Download a file
- `DELETE /file/:fileId`: Delete a file
- `POST /auth/signup`: Register a new user
- `POST /auth/login`: Login a user
- `GET /auth/logout`: Logout a user
- `GET /oauth/google`: Google OAuth login
- `GET /oauth/google/callback`: Google OAuth callback

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.
