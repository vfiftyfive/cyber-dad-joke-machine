mod config;

use axum::{
    routing::get,
    Router,
    Json,
    http::{HeaderValue, Method, header},
    extract::State,
};
use async_openai::{Client, config::OpenAIConfig, types::{CreateChatCompletionRequestArgs, ChatCompletionRequestMessage, Role}};
use serde::Serialize;
use tower_http::cors::CorsLayer;
use std::sync::Arc;

#[derive(Serialize)]
struct JokeResponse {
    joke: String,
}

struct AppState {
    openai_client: Client<OpenAIConfig>,
}

async fn generate_dad_joke(State(state): State<Arc<AppState>>) -> Json<JokeResponse> {
    println!("Generating new dad joke...");
    let request = CreateChatCompletionRequestArgs::default()
        .model("gpt-3.5-turbo")
        .messages([
            ChatCompletionRequestMessage {
                role: Role::System,
                content: Some("You are a dad joke generator. Generate a short, family-friendly dad joke. \
                         Respond with ONLY the joke text, no additional commentary or formatting. \
                         The joke should be no more than 2 sentences long.".to_string()),
                name: None,
                function_call: None,
            },
            ChatCompletionRequestMessage {
                role: Role::User,
                content: Some("Generate a dad joke".to_string()),
                name: None,
                function_call: None,
            }
        ])
        .max_tokens(100_u16)
        .temperature(0.7)
        .build()
        .expect("Failed to build request");

    println!("Sending request to OpenAI...");
    let response = match state.openai_client.chat().create(request).await {
        Ok(resp) => resp,
        Err(e) => {
            println!("Error from OpenAI: {:?}", e);
            return Json(JokeResponse {
                joke: "Why did the API call fail? Because it couldn't handle the dad joke pressure!".to_string()
            });
        }
    };
    println!("Received response from OpenAI");

    let joke = response.choices[0]
        .message
        .content
        .clone()
        .unwrap_or_else(|| "Why did the API call fail? Because it couldn't handle the dad joke pressure!".to_string());

    Json(JokeResponse { joke })
}

#[tokio::main]
async fn main() {
    // Load configuration
    let settings = config::Settings::new().expect("Failed to load configuration");
    
    // Initialize OpenAI client
    let config = OpenAIConfig::new().with_api_key(settings.openai_api_key);
    let openai_client = Client::with_config(config);
    let app_state = Arc::new(AppState { openai_client });

    let app = Router::new()
        .route("/joke", get(generate_dad_joke))
        .with_state(app_state)
        .layer(
            CorsLayer::new()
                .allow_origin("http://localhost:8080".parse::<HeaderValue>().unwrap())
                .allow_methods([Method::GET])
                .allow_headers([header::CONTENT_TYPE, header::ACCEPT])
        );

    println!("Server running on http://localhost:3000");
    axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
