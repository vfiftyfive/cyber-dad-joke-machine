mod state;

use axum::{
    extract::State,
    http::{Method, HeaderValue},
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use shuttle_openai::async_openai::{
    types::{ChatCompletionRequestMessage, CreateChatCompletionRequest, Role},
    Client, config::OpenAIConfig,
};
use state::AppState;
use tower_http::cors::{CorsLayer, Any};
use tracing::info;

#[derive(Serialize, Deserialize)]
struct JokeResponse {
    joke: String,
}

async fn generate_dad_joke(State(state): State<AppState>) -> Json<JokeResponse> {
    info!("Generating new dad joke");
    
    // Creating the request as per the memory configuration
    let request = CreateChatCompletionRequest {
        model: "gpt-3.5-turbo".to_string(),
        messages: vec![
            ChatCompletionRequestMessage {
                role: Role::System,
                content: Some("You are a creative dad joke generator specializing in unique, clever wordplay. Each joke should be original and avoid common dad joke patterns. Respond with ONLY the joke text, no additional commentary. Keep it family-friendly and concise (1-2 sentences)".to_string()),
                name: None,
                function_call: None,
                tool_calls: None,
                tool_call_id: None,
            },
            ChatCompletionRequestMessage {
                role: Role::User,
                content: Some("Generate a clever dad joke".to_string()),
                name: None,
                function_call: None,
                tool_calls: None,
                tool_call_id: None,
            }
        ],
        temperature: Some(0.9), // Using 0.9 for more creativity as specified in memory
        max_tokens: Some(100),
        frequency_penalty: None,
        function_call: None,
        functions: None,
        logit_bias: None,
        logprobs: None,
        presence_penalty: None,
        response_format: None,
        seed: None,
        stop: None,
        stream: None,
        tool_choice: None,
        tools: None,
        top_logprobs: None,
        top_p: None,
        user: None,
    };

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

    let router = Router::new()
        .route("/joke", get(generate_dad_joke))
        .route("/health", get(health_check))
        .with_state(state)
        .layer(cors);

    info!("Starting Cyber Dad Joke Machine");
    Ok(router.into())
}

