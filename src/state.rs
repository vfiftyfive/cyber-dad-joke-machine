use shuttle_openai::async_openai::{config::OpenAIConfig, Client};
use sqlx::PgPool;
use tracing::info;

#[derive(Clone)]
pub struct AppState {
    pub openai_client: Client<OpenAIConfig>,
    pub pool: PgPool,
}

impl AppState {
    pub fn new(openai_client: Client<OpenAIConfig>, pool: PgPool) -> Self {
        Self { openai_client, pool }
    }
    
    pub async fn seed(&self) {
        // Run migrations to ensure table exists
        info!("Running database migrations");
        match sqlx::migrate!().run(&self.pool).await {
            Ok(_) => info!("Migrations completed successfully"),
            Err(e) => panic!("Failed to run migrations: {}", e),
        }
    }
}
