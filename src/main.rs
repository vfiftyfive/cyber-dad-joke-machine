mod state;

use axum::{
    extract::State,
    http::{HeaderValue, Method, StatusCode},
    routing::get,
    Json, Router,
};
use serde::ser::{SerializeStruct, Serializer};
use serde::{Deserialize, Serialize};
use shuttle_openai::async_openai::{
    config::OpenAIConfig,
    types::{
        ChatCompletionRequestSystemMessageArgs, ChatCompletionRequestUserMessageArgs,
        CreateChatCompletionRequestArgs,
    },
    Client,
};
use sqlx::{FromRow, PgPool};
use state::AppState;
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::{ServeDir, ServeFile};
use tracing::{debug, error, info, instrument};

#[derive(Serialize, Deserialize)]
struct JokeResponse {
    joke: String,
    id: Option<i32>,
}

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
        let date_string = self
            .created_at
            .format(&time::format_description::well_known::Rfc3339)
            .unwrap_or_default();
        state.serialize_field("created_at", &date_string)?;

        state.end()
    }
}

#[instrument(skip(state), level = "debug")]
async fn generate_dad_joke(
    State(state): State<AppState>,
) -> Result<Json<JokeResponse>, (StatusCode, String)> {
    info!("Generating new dad joke");

    // Create the messages for the OpenAI request
    let messages = vec![
    ChatCompletionRequestSystemMessageArgs::default()
        .content("You are a creative dad joke generator specializing in unique, clever wordplay. Each joke should be original and avoid common dad joke patterns. Respond with ONLY the joke text, no additional commentary. Keep it family-friendly and concise (1-2 sentences)")
        .build()
        .unwrap()
        .into(),
    ChatCompletionRequestUserMessageArgs::default()
        .content("Generate a clever dad joke")
        .build()
        .unwrap()
        .into(),
];

    // Creating the request using builder pattern
    let request = CreateChatCompletionRequestArgs::default()
        .model("gpt-3.5-turbo")
        .temperature(1.2)
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
                joke:
                    "Why did the API call fail? Because it couldn't handle the dad joke pressure!"
                        .to_string(),
                id: None,
            }));
        }
    };
    info!("Received response from OpenAI");

    let joke_text = response.choices[0]
        .message
        .content
        .clone()
        .unwrap_or_else(|| {
            "Why did the API call fail? Because it couldn't handle the dad joke pressure!"
                .to_string()
        });

    // Save the joke to the database
    let joke_id = match save_joke_to_db(&state, &joke_text).await {
        Ok(id) => {
            info!("Saved joke with ID: {}", id);
            Some(id)
        }
        Err(e) => {
            error!("Failed to save joke: {}", e);
            None
        }
    };

    Ok(Json(JokeResponse {
        joke: joke_text,
        id: joke_id,
    }))
}

#[instrument]
async fn health_check() -> &'static str {
    debug!("Health check requested");
    "OK"
}

#[instrument(skip(state), fields(joke_length = joke_text.len()), level = "debug")]
async fn save_joke_to_db(state: &AppState, joke_text: &str) -> Result<i32, sqlx::Error> {
    // Insert the joke into the database
    debug!("Saving joke to database");
    let record = sqlx::query_as::<_, JokeRecord>(
        "INSERT INTO jokes (joke_text) VALUES ($1) RETURNING id, joke_text, created_at",
    )
    .bind(joke_text)
    .fetch_one(&state.pool)
    .await?;

    Ok(record.id)
}

#[instrument(skip(state), level = "debug")]
async fn get_recent_jokes(
    State(state): State<AppState>,
) -> Result<Json<Vec<JokeRecord>>, (StatusCode, String)> {
    info!("Retrieving recent jokes");
    match sqlx::query_as::<_, JokeRecord>(
        "SELECT id, joke_text, created_at FROM jokes ORDER BY created_at DESC LIMIT 10",
    )
    .fetch_all(&state.pool)
    .await
    {
        Ok(jokes) => {
            info!(
                joke_count = jokes.len(),
                "Successfully retrieved recent jokes"
            );
            Ok(Json(jokes))
        }
        Err(e) => {
            error!(error = %e, "Failed to retrieve recent jokes");
            Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
        }
    }
}

#[shuttle_runtime::main]
async fn main(
    #[shuttle_shared_db::Postgres] pool: PgPool,
    #[shuttle_openai::OpenAI(api_key = "{secrets.OPENAI_API_KEY}")] openai: Client<OpenAIConfig>,
) -> shuttle_axum::ShuttleAxum {
    info!(
        version = env!("CARGO_PKG_VERSION"),
        "Starting Cyber Dad Joke Machine"
    );
    debug!("OpenAI client and database pool initialized");
    let state = AppState::new(openai, pool);

    // Initialize database
    info!("Initializing database");
    state.seed().await;
    debug!("Database initialization completed");

    // Configure CORS
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

    info!("Cyber Dad Joke Machine server initialized and ready");
    Ok(router.into())
}
