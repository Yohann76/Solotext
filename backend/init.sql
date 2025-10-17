-- Script d'initialisation de la base de données SoloText
-- Ce script s'exécute automatiquement au premier démarrage de PostgreSQL

-- Table Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Subscriptions (abonnements Stripe)
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    start_date TIMESTAMP NOT NULL,
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Analyses (analyses de textes)
CREATE TABLE IF NOT EXISTS analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analyzed_at TIMESTAMP NOT NULL,
    source_text TEXT NOT NULL,
    duplicate_percent DECIMAL(5,2) CHECK (duplicate_percent >= 0 AND duplicate_percent <= 100),
    status VARCHAR(50) NOT NULL DEFAULT 'waiting_for_process' CHECK (status IN (
        'waiting_for_process',
        'insufficient_user_credit',
        'sentence_segmentation_in_progress',
        'sentence_segmentation_completed',
        'sentence_segmentation_error',
        'sentence_analysis_in_progress',
        'sentence_analysis_completed',
        'sentence_analysis_error',
        'analysis_completed'
    )),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Sentences (phrases analysées)
CREATE TABLE IF NOT EXISTS sentences (
    id SERIAL PRIMARY KEY,
    analysis_id INTEGER NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    sentence_text TEXT NOT NULL,
    source_url TEXT,
    is_duplicate BOOLEAN NOT NULL DEFAULT FALSE,
    is_test BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table API Calls (comptage des appels API par utilisateur)
CREATE TABLE IF NOT EXISTS api_calls (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    api_provider VARCHAR(50) NOT NULL,
    api_endpoint VARCHAR(100),
    call_count INTEGER NOT NULL DEFAULT 1,
    call_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, api_provider, call_date)
);

-- Insérer des données d'exemple
INSERT INTO users (email, google_id) VALUES 
    ('jean@example.com', 'google_123456789'),
    ('marie@example.com', 'google_987654321')
ON CONFLICT (email) DO NOTHING;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_analyzed_at ON analyses(analyzed_at);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status);
CREATE INDEX IF NOT EXISTS idx_sentences_analysis_id ON sentences(analysis_id);
CREATE INDEX IF NOT EXISTS idx_sentences_is_duplicate ON sentences(is_duplicate);
CREATE INDEX IF NOT EXISTS idx_api_calls_user_id ON api_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_api_calls_provider ON api_calls(api_provider);
CREATE INDEX IF NOT EXISTS idx_api_calls_date ON api_calls(call_date);
CREATE INDEX IF NOT EXISTS idx_api_calls_user_provider_date ON api_calls(user_id, api_provider, call_date);
