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

### Backend Setup

1. Install Rust and Cargo
2. Install Shuttle CLI:
```bash
cargo install cargo-shuttle
```

3. Create a `Secrets.toml` file in the project root and add your OpenAI API key:
```toml
OPENAI_API_KEY = "your-api-key-here"
```

4. Run the backend locally:
```bash
cargo shuttle run
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Deployment

### Backend Deployment with Shuttle

1. Login to Shuttle:
```bash
cargo shuttle login
```

2. Initialize your project (first time only):
```bash
cargo shuttle init
```

3. Add your OpenAI API key to Shuttle secrets:
```bash
cargo shuttle secrets set OPENAI_API_KEY=your-api-key-here
```

4. Deploy your application:
```bash
cargo shuttle deploy
```

Once deployed, your backend will be available at `https://cyber-dad-joke-machine.shuttleapp.rs`

### Frontend Deployment

The frontend can be deployed to any static hosting service like Netlify, Vercel, or GitHub Pages. Make sure to set the `NODE_ENV` to 'production' during build to use the correct backend URL.

## Security Notes

- The OpenAI API key is stored securely using Shuttle's secret management system
- CORS is configured to allow requests only from specified origins
- API keys and sensitive data are never committed to the repository
- Environment-based configuration ensures proper separation of development and production settings
