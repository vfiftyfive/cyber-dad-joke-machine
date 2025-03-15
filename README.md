# Cyber Dad Joke Machine

A web application that generates dad jokes using OpenAI's GPT-3.5-turbo model. Built with Rust (Axum) for the backend and React + TypeScript for the frontend.

## Technologies Used

### Backend
- Rust
- Axum web framework
- OpenAI API (GPT-3.5-turbo)
- Shuttle for deployment

### Frontend
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Local Development

### Setup

1. Install Rust and Cargo
2. Install Shuttle CLI:
```bash
curl -sSfL https://www.shuttle.dev/install | bash
```

3. Create a `Secrets.toml` file in the project root and add your OpenAI API key:
```toml
OPENAI_API_KEY = "your-api-key-here"
```

4. Install frontend dependencies:
```bash
cd frontend
npm install
```

5. Build the frontend:
```bash
npm run build
```

6. Run the application locally:
```bash
# From the project root
shuttle run
```

The application will be available at:
- Frontend (dev): http://localhost:8080
- Backend API: http://localhost:8000/joke

## Development Workflow

1. For frontend development:
```bash
cd frontend
npm run dev
```
This will run the frontend on port 8080 and make API requests to the backend on port 8000.

2. After making frontend changes, build the frontend:
```bash
cd frontend
npm run build
```

3. The backend will automatically serve the latest built frontend files.

## Deployment

1. Login to Shuttle:
```bash
shuttle login
```

2. Initialize your project (first time only):
```bash
shuttle init
```

3. Build the frontend for production:
```bash
cd frontend
npm run build
cd ..
```

4. Deploy the application:
```bash
shuttle deploy
```

Once deployed, your application will be available at `https://cyber-dad-joke-machine-<nonce>.shuttleapp`

The deployment includes both the backend API and the frontend application, served from the same origin.

## Security Notes

- The OpenAI API key is stored securely using Shuttle's secret management system
- CORS is configured to allow requests only from localhost:8080 in development
- API keys and sensitive data are never committed to the repository
- Environment-based configuration ensures proper separation of development and production settings
- In production, frontend and backend are served from the same origin, eliminating CORS concerns
