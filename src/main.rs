use axum::{
    routing::get,
    Router,
    Json,
    http::{HeaderValue, Method, header},
};
use serde::Serialize;
use tower_http::cors::CorsLayer;
use rand::{Rng, thread_rng};
use std::sync::{Arc, Mutex};

#[derive(Serialize)]
struct JokeResponse {
    joke: String,
}

struct JokeState {
    all_jokes: Vec<&'static str>,
    available_jokes: Vec<&'static str>,
}

impl JokeState {
    fn new(jokes: Vec<&'static str>) -> Self {
        Self {
            available_jokes: jokes.clone(),
            all_jokes: jokes,
        }
    }

    fn get_random_joke(&mut self) -> String {
        if self.available_jokes.is_empty() {
            println!("Refilling joke pool...");
            self.available_jokes = self.all_jokes.clone();
        }
        
        let index = thread_rng().gen_range(0..self.available_jokes.len());
        let joke = self.available_jokes.swap_remove(index);
        println!("Jokes remaining: {}", self.available_jokes.len());
        joke.to_string()
    }
}

#[tokio::main]
async fn main() {
    let jokes = vec![
        "Why don't programmers like nature? It has too many bugs.",
        "Why did the programmer quit his job? Because he didn't get arrays.",
        "What do you call a dad who's fallen through the ice? A POPsicle!",
        "Why did the scarecrow win an award? Because he was outstanding in his field!",
        "Why don't eggs tell jokes? They'd crack up!",
        "What did the coffee report to the police? A mugging!",
        "What do you call a fake noodle? An impasta!",
        "Why did the math book look so sad? Because it had too many problems.",
        "What do you call a bear with no teeth? A gummy bear!",
        "What do you call a can opener that doesn't work? A can't opener!",
    ];

    let joke_state = Arc::new(Mutex::new(JokeState::new(jokes)));

    let app = Router::new()
        .route("/joke", get(move || {
            let joke_state = joke_state.clone();
            async move {
                let joke = joke_state.lock().unwrap().get_random_joke();
                Json(JokeResponse { joke })
            }
        }))
        .layer(
            CorsLayer::new()
                .allow_origin("http://localhost:8080".parse::<HeaderValue>().unwrap())
                .allow_methods([Method::GET])
                .allow_headers(["Content-Type", "Accept"])
        );

    println!("Server running on http://localhost:3000");
    axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
