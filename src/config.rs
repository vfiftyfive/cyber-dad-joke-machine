use config::{Config, ConfigError};
use serde::Deserialize;
use std::env;

#[derive(Debug, Deserialize)]
pub struct Settings {
    pub openai_api_key: String,
}

impl Settings {
    pub fn new() -> Result<Self, ConfigError> {
        // Load .env file if it exists
        dotenv::dotenv().ok();

        let config = Config::builder()
            // Start with default settings
            .set_default("openai_api_key", "")?
            // Add settings from environment variables (with prefix "APP_")
            .add_source(config::Environment::default().prefix("APP"))
            // Try to get the API key directly from OPENAI_API_KEY env var
            .build()?;

        // If OPENAI_API_KEY is set directly in env, use that
        let openai_api_key = match env::var("OPENAI_API_KEY") {
            Ok(key) => key,
            Err(_) => config.get_string("openai_api_key")?,
        };

        Ok(Settings { openai_api_key })
    }
}
