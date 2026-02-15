CREATE TABLE IF NOT EXISTS ai_models (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    model_id VARCHAR(100) NOT NULL, -- e.g., "deepseek/deepseek-r1:free"
    provider VARCHAR(50) DEFAULT 'openrouter',
    category VARCHAR(50) NOT NULL, -- 'coder', 'planner', 'general', 'vision', 'analyst'
    context_window INT DEFAULT 4096,
    is_active BOOLEAN DEFAULT TRUE,
    is_free BOOLEAN DEFAULT FALSE,
    cost_per_1k_input DECIMAL(10, 6) DEFAULT 0,
    cost_per_1k_output DECIMAL(10, 6) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default free models
INSERT INTO ai_models (id, name, model_id, provider, category, context_window, is_active, is_free, description) VALUES
('coder_default', 'Axum (Code)', 'deepseek/deepseek-r1:free', 'openrouter', 'coder', 16384, TRUE, TRUE, 'DeepSeek R1 for coding and logic'),
('planner_default', 'Zara Yacob (Plan)', 'deepseek/deepseek-r1:free', 'openrouter', 'planner', 16384, TRUE, TRUE, 'DeepSeek R1 for planning'),
('general_default', 'Gera (General)', 'meta-llama/llama-3-8b-instruct:free', 'openrouter', 'general', 8192, TRUE, TRUE, 'Llama 3 8B for general tasks'),
('fast_default', 'Tiwis (Fast)', 'google/gemini-2.0-flash-exp:free', 'openrouter', 'fast', 32768, TRUE, TRUE, 'Gemini Flash for speed'),
('vision_default', 'Saba (Vision)', 'qwen/qwen-2-vl-7b-instruct:free', 'openrouter', 'vision', 4096, TRUE, TRUE, 'Qwen VL for image analysis'),
('marketing_default', 'Lalibela (Marketing)', 'huggingfaceh4/zephyr-7b-beta:free', 'openrouter', 'marketing', 4096, TRUE, TRUE, 'Zephyr for creative writing'),
('analyst_default', 'Abay (Analyst)', 'microsoft/phi-3-medium-128k-instruct:free', 'openrouter', 'analyst', 128000, TRUE, TRUE, 'Phi-3 for data analysis')
ON DUPLICATE KEY UPDATE name=VALUES(name);
