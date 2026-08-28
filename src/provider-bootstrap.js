// TARA startup guard.
// The legacy AI router constructs provider clients during module load.
// Keep the web service bootable when optional AI credentials are absent;
// real credentials still take precedence and are used normally.
const PLACEHOLDER = "__TARA_PROVIDER_NOT_CONFIGURED__";

if (!process.env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = PLACEHOLDER;
if (!process.env.GROQ_API_KEY) process.env.GROQ_API_KEY = PLACEHOLDER;
if (!process.env.OPENROUTER_API_KEY) process.env.OPENROUTER_API_KEY = PLACEHOLDER;
