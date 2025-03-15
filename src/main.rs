mod state;

use axum::{
    extract::State,
    http::{Method, HeaderValue},
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use shuttle_openai::async_openai::{
    types::{ChatCompletionRequestSystemMessageArgs, ChatCompletionRequestUserMessageArgs, CreateChatCompletionRequestArgs},
    Client, config::OpenAIConfig,
};
use state::AppState;
use tower_http::cors::{CorsLayer, Any};
use tower_http::services::{ServeDir, ServeFile};
use tracing::info;

#[derive(Serialize, Deserialize)]
struct JokeResponse {
    joke: String,
}

async fn generate_dad_joke(State(state): State<AppState>) -> Json<JokeResponse> {
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
            return Json(JokeResponse {
                joke: "Why did the API call fail? Because it couldn't handle the dad joke pressure!".to_string()
            });
        }
    };
    info!("Received response from OpenAI");

    let joke = response.choices[0]
        .message
        .content
        .clone()
        .unwrap_or_else(|| "Why did the API call fail? Because it couldn't handle the dad joke pressure!".to_string());

    Json(JokeResponse { joke })
}

async fn health_check() -> &'static str {
    "OK"
}

#[shuttle_runtime::main]
async fn main(
    #[shuttle_openai::OpenAI(api_key = "{secrets.OPENAI_API_KEY}")] openai: Client<OpenAIConfig>,
) -> shuttle_axum::ShuttleAxum {
    let state = AppState::new(openai);
    
    // Configure CORS as specified in the memory
    let cors = CorsLayer::new()
        .allow_origin("http://localhost:8080".parse::<HeaderValue>().unwrap())
        .allow_methods([Method::GET])
        .allow_headers(Any);

    // API routes with CORS
    let router = Router::new()
        .route("/joke", get(generate_dad_joke))
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

