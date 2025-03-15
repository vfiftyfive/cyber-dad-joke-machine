mod state;

use axum::{
    extract::State,
    http::{Method, HeaderValue, StatusCode},
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use shuttle_openai::async_openai::{
    types::{ChatCompletionRequestSystemMessageArgs, ChatCompletionRequestUserMessageArgs, CreateChatCompletionRequestArgs},
    Client, config::OpenAIConfig,
};
use sqlx::{FromRow, PgPool};
use state::AppState;
use tower_http::cors::{CorsLayer, Any};
use tower_http::services::{ServeDir, ServeFile};
use tracing::{info, error};
use time;

#[derive(Serialize, Deserialize)]
struct JokeResponse {
    joke: String,
    id: Option<i32>,
}

use serde::ser::{SerializeStruct, Serializer};

#[derive(FromRow)]
struct JokeRecord {
    pub id: i32,
    pub joke_text: String,
    pub created_at: time::OffsetDateTime,
}

impl Serialize for JokeRecord {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state = serializer.serialize_struct("JokeRecord", 3)?;
        state.serialize_field("id", &self.id)?;
        state.serialize_field("joke_text", &self.joke_text)?;
        
        // Format the date as an ISO 8601 string that JavaScript can parse
        let date_string = self.created_at.format(&time::format_description::well_known::Rfc3339).unwrap_or_default();
        state.serialize_field("created_at", &date_string)?;
        
        state.end()
    }
}

async fn generate_dad_joke(State(state): State<AppState>) -> Result<Json<JokeResponse>, (StatusCode, String)> {
    info!("Generating new dad joke");
    
    // Create message vector
    let mut messages = Vec::new();
    
    // Add system message
    messages.push(
        ChatCompletionRequestSystemMessageArgs::default()
            .content("You are a creative dad joke generator specializing in unique, clever wordplay. Each joke should be original and avoid common dad joke patterns. Respond with ONLY the joke text, no additional commentary. Keep it family-friendly and concise (1-2 sentences)")
            .build()
            .unwrap()
            .into()
    );
    
    // Add user message
    messages.push(
        ChatCompletionRequestUserMessageArgs::default()
            .content("Generate a clever dad joke")
            .build()
            .unwrap()
            .into()
    );
    
    // Creating the request using builder pattern
    let request = CreateChatCompletionRequestArgs::default()
        .model("gpt-3.5-turbo")
        .temperature(0.9) // Using 0.9 for more creativity as specified in memory
        .max_tokens(100_u16)
        .messages(messages)
        .build()
        .unwrap();

    info!("Sending request to OpenAI...");
    let response = match state.openai_client.chat().create(request).await {
        Ok(resp) => resp,
        Err(e) => {
            info!("Error from OpenAI: {:?}", e);
            return Ok(Json(JokeResponse {
                joke: "Why did the API call fail? Because it couldn't handle the dad joke pressure!".to_string(),
                id: None
            }));
        }
    };
    info!("Received response from OpenAI");

    let joke_text = response.choices[0]
        .message
        .content
        .clone()
        .unwrap_or_else(|| "Why did the API call fail? Because it couldn't handle the dad joke pressure!".to_string());
    
    // Save the joke to the database
    let joke_id = match save_joke_to_db(&state, &joke_text).await {
        Ok(id) => {
            info!("Saved joke with ID: {}", id);
            Some(id)
        },
        Err(e) => {
            error!("Failed to save joke: {}", e);
            None
        }
    };

    Ok(Json(JokeResponse { joke: joke_text, id: joke_id }))
}

async fn health_check() -> &'static str {
    "OK"
}

async fn save_joke_to_db(state: &AppState, joke_text: &str) -> Result<i32, sqlx::Error> {
    // Insert the joke into the database
    let record = sqlx::query_as::<_, JokeRecord>(
        "INSERT INTO jokes (joke_text) VALUES ($1) RETURNING id, joke_text, created_at"
    )
    .bind(joke_text)
    .fetch_one(&state.pool)
    .await?;
    
    Ok(record.id)
}

async fn get_recent_jokes(State(state): State<AppState>) -> Result<Json<Vec<JokeRecord>>, (StatusCode, String)> {
    match sqlx::query_as::<_, JokeRecord>("SELECT id, joke_text, created_at FROM jokes ORDER BY created_at DESC LIMIT 10")
        .fetch_all(&state.pool)
        .await
    {
        Ok(jokes) => Ok(Json(jokes)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

#[shuttle_runtime::main]
async fn main(
    #[shuttle_shared_db::Postgres] pool: PgPool,
    #[shuttle_openai::OpenAI(api_key = "{secrets.OPENAI_API_KEY}")] openai: Client<OpenAIConfig>,
) -> shuttle_axum::ShuttleAxum {
    let state = AppState::new(openai, pool);
    
    // Initialize database
    state.seed().await;
    
    // Configure CORS as specified in the memory
    let cors = CorsLayer::new()
        .allow_origin("http://localhost:8080".parse::<HeaderValue>().unwrap())
        .allow_methods([Method::GET])
        .allow_headers(Any);

    // API routes with CORS
    let router = Router::new()
        .route("/joke", get(generate_dad_joke))
        .route("/jokes/recent", get(get_recent_jokes))
        .route("/health", get(health_check))
        .with_state(state)
        .layer(cors)
        .nest_service(
            "/",
            ServeDir::new("frontend/dist")
                .not_found_service(ServeFile::new("frontend/dist/index.html")),
        );

    info!("Starting Cyber Dad Joke Machine");
    Ok(router.into())
}

