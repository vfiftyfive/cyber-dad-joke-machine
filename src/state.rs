use shuttle_openai::async_openai::{config::OpenAIConfig, Client};

#[derive(Clone)]
pub struct AppState {
    pub openai_client: Client<OpenAIConfig>,
}

impl AppState {
    pub fn new(openai_client: Client<OpenAIConfig>) -> Self {
        Self { openai_client }
    }
}
