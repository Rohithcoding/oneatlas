/**
 * OneAtlas catalogue seed.
 *
 * Produces a deterministic, realistic dataset: labs, providers, models,
 * provider listings and benchmark scores. Run with `npm run db:seed`.
 */
import {
  PrismaClient,
  ModelType,
  BenchmarkCategory,
  type Model,
  type Benchmark,
} from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

const labs = [
  { slug: 'openai', name: 'OpenAI', description: 'American AI research company building frontier language, vision and speech models.', website: 'https://openai.com', country: 'United States', founded: 2015, color: '#10a37f' },
  { slug: 'anthropic', name: 'Anthropic', description: 'AI safety company behind the Claude family of assistant models.', website: 'https://anthropic.com', country: 'United States', founded: 2021, color: '#d97757' },
  { slug: 'google', name: 'Google', description: 'DeepMind and Google Research build Gemini, Gemma and a wide range of multimodal models.', website: 'https://deepmind.google', country: 'United States', founded: 1998, color: '#4285f4' },
  { slug: 'deepseek', name: 'DeepSeek', description: 'Chinese research lab known for efficient open-weight reasoning models.', website: 'https://deepseek.com', country: 'China', founded: 2023, color: '#4d6bfe' },
  { slug: 'meta', name: 'Meta', description: 'Meta AI develops the open-weight Llama family and multimodal research models.', website: 'https://ai.meta.com', country: 'United States', founded: 2013, color: '#0866ff' },
  { slug: 'mistral', name: 'Mistral AI', description: 'French AI company building efficient open and commercial models.', website: 'https://mistral.ai', country: 'France', founded: 2023, color: '#ff7000' },
  { slug: 'alibaba', name: 'Alibaba', description: 'The Qwen team at Alibaba Cloud publishes a large family of open multimodal models.', website: 'https://qwen.ai', country: 'China', founded: 1999, color: '#ff6a00' },
  { slug: 'xai', name: 'xAI', description: 'Elon Musk’s AI company building Grok models with real-time information access.', website: 'https://x.ai', country: 'United States', founded: 2023, color: '#111827' },
  { slug: 'moonshotai', name: 'Moonshot AI', description: 'Chinese lab behind the Kimi family of long-context assistant models.', website: 'https://moonshot.cn', country: 'China', founded: 2023, color: '#1f2937' },
  { slug: 'zhipuai', name: 'Zhipu AI', description: 'Chinese lab developing the GLM series of foundation models.', website: 'https://z.ai', country: 'China', founded: 2019, color: '#1e6fff' },
  { slug: 'cohere', name: 'Cohere', description: 'Enterprise-focused lab building language, embedding and reranking models.', website: 'https://cohere.com', country: 'Canada', founded: 2019, color: '#ff5a5f' },
  { slug: 'amazon', name: 'Amazon', description: 'Amazon’s Nova models are served through Amazon Bedrock.', website: 'https://aws.amazon.com', country: 'United States', founded: 1994, color: '#ff9900' },
  { slug: 'microsoft', name: 'Microsoft', description: 'Microsoft Research and Azure AI build Phi models and host frontier models.', website: 'https://microsoft.com', country: 'United States', founded: 1975, color: '#0078d4' },
  { slug: 'nvidia', name: 'NVIDIA', description: 'NVIDIA Research publishes open models for language, vision and robotics.', website: 'https://nvidia.com', country: 'United States', founded: 1993, color: '#76b900' },
  { slug: 'black-forest-labs', name: 'Black Forest Labs', description: 'German lab behind the FLUX family of image generation models.', website: 'https://bfl.ai', country: 'Germany', founded: 2024, color: '#18181b' },
  { slug: 'elevenlabs', name: 'ElevenLabs', description: 'Speech research company building expressive text-to-speech and voice agents.', website: 'https://elevenlabs.io', country: 'United Kingdom', founded: 2022, color: '#18181b' },
  { slug: 'perplexity', name: 'Perplexity', description: 'Search company building answer engines and retrieval-focused embedding models.', website: 'https://perplexity.ai', country: 'United States', founded: 2022, color: '#20808d' },
  { slug: 'inception', name: 'Inception Labs', description: 'Pioneer of diffusion-based language models with the Mercury family.', website: 'https://inceptionlabs.ai', country: 'United States', founded: 2024, color: '#7c3aed' },
  { slug: 'minimax', name: 'MiniMax', description: 'Chinese lab building large language models and multimodal agents.', website: 'https://minimax.io', country: 'China', founded: 2021, color: '#ff3b5c' },
  { slug: 'reflection', name: 'Reflection AI', description: 'Open-weight frontier lab focused on autonomous systems.', website: 'https://reflection.ai', country: 'United States', founded: 2024, color: '#6366f1' },
  { slug: 'thinking-machines', name: 'Thinking Machines', description: 'Research lab exploring new Transformer architectures and interpretability.', website: 'https://thinkingmachines.ai', country: 'United States', founded: 2024, color: '#f59e0b' },
  { slug: 'stability-ai', name: 'Stability AI', description: 'Open generative media lab behind Stable Diffusion.', website: 'https://stability.ai', country: 'United Kingdom', founded: 2019, color: '#8b5cf6' },
  { slug: 'ai21labs', name: 'AI21 Labs', description: 'Israeli lab building Jamba hybrid language models.', website: 'https://ai21.com', country: 'Israel', founded: 2017, color: '#00c2a8' },
  { slug: 'writer', name: 'Writer', description: 'Enterprise generative AI platform with its own Palmyra models.', website: 'https://writer.com', country: 'United States', founded: 2020, color: '#5b5bd6' },
];

const providers = [
  { slug: 'openai', name: 'OpenAI', category: 'Direct API', region: 'Global', color: '#10a37f', website: 'https://platform.openai.com' },
  { slug: 'anthropic', name: 'Anthropic', category: 'Direct API', region: 'Global', color: '#d97757', website: 'https://console.anthropic.com' },
  { slug: 'google-vertex', name: 'Google Vertex AI', category: 'Cloud', region: 'Global', color: '#4285f4', website: 'https://cloud.google.com/vertex-ai' },
  { slug: 'amazon-bedrock', name: 'Amazon Bedrock', category: 'Cloud', region: 'Global', color: '#ff9900', website: 'https://aws.amazon.com/bedrock' },
  { slug: 'azure', name: 'Azure AI Foundry', category: 'Cloud', region: 'Global', color: '#0078d4', website: 'https://azure.microsoft.com' },
  { slug: 'groq', name: 'Groq', category: 'Inference API', region: 'Global', color: '#f55036', website: 'https://groq.com' },
  { slug: 'together-ai', name: 'Together AI', category: 'Inference API', region: 'Global', color: '#7c3aed', website: 'https://together.ai' },
  { slug: 'fireworks-ai', name: 'Fireworks AI', category: 'Inference API', region: 'Global', color: '#ff5a1f', website: 'https://fireworks.ai' },
  { slug: 'deepinfra', name: 'DeepInfra', category: 'Inference API', region: 'Global', color: '#2563eb', website: 'https://deepinfra.com' },
  { slug: 'openrouter', name: 'OpenRouter', category: 'Router', region: 'Global', color: '#111827', website: 'https://openrouter.ai' },
  { slug: 'vercel-ai-gateway', name: 'Vercel AI Gateway', category: 'Router', region: 'Global', color: '#000000', website: 'https://vercel.com/ai-gateway' },
  { slug: 'cloudflare', name: 'Cloudflare Workers AI', category: 'Cloud', region: 'Global', color: '#f6821f', website: 'https://cloudflare.com' },
  { slug: 'cerebras', name: 'Cerebras', category: 'Inference API', region: 'Global', color: '#f97316', website: 'https://cerebras.ai' },
  { slug: 'sambanova', name: 'SambaNova', category: 'Inference API', region: 'Global', color: '#0ea5e9', website: 'https://sambanova.ai' },
  { slug: 'replicate', name: 'Replicate', category: 'Inference API', region: 'Global', color: '#111827', website: 'https://replicate.com' },
  { slug: 'baseten', name: 'Baseten', category: 'Inference API', region: 'Global', color: '#06b6d4', website: 'https://baseten.co' },
  { slug: 'nebius', name: 'Nebius', category: 'Cloud', region: 'EU', color: '#4f46e5', website: 'https://nebius.com' },
  { slug: 'siliconflow', name: 'SiliconFlow', category: 'Inference API', region: 'China', color: '#6366f1', website: 'https://siliconflow.cn' },
  { slug: 'novita', name: 'Novita AI', category: 'Inference API', region: 'Global', color: '#8b5cf6', website: 'https://novita.ai' },
  { slug: 'chutes', name: 'Chutes', category: 'Inference API', region: 'Global', color: '#14b8a6', website: 'https://chutes.ai' },
  { slug: 'minimax-api', name: 'MiniMax API', category: 'Direct API', region: 'China', color: '#ff3b5c', website: 'https://minimax.io' },
  { slug: 'moonshot-api', name: 'Moonshot AI API', category: 'Direct API', region: 'China', color: '#1f2937', website: 'https://moonshot.cn' },
  { slug: 'zhipu-api', name: 'Zhipu AI API', category: 'Direct API', region: 'China', color: '#1e6fff', website: 'https://z.ai' },
  { slug: 'mistral-api', name: 'Mistral API', category: 'Direct API', region: 'EU', color: '#ff7000', website: 'https://console.mistral.ai' },
  { slug: 'cohere-api', name: 'Cohere API', category: 'Direct API', region: 'Global', color: '#ff5a5f', website: 'https://dashboard.cohere.com' },
  { slug: 'hugging-face', name: 'Hugging Face', category: 'Model Hub', region: 'Global', color: '#ffd21e', website: 'https://huggingface.co' },
  { slug: 'ollama', name: 'Ollama Cloud', category: 'Inference API', region: 'Global', color: '#111827', website: 'https://ollama.com' },
  { slug: 'github-copilot', name: 'GitHub Copilot', category: 'Product', region: 'Global', color: '#24292f', website: 'https://github.com/features/copilot' },
  { slug: 'requesty', name: 'Requesty', category: 'Router', region: 'Global', color: '#0ea5e9', website: 'https://requesty.ai' },
  { slug: 'litellm', name: 'LiteLLM', category: 'Router', region: 'Global', color: '#2563eb', website: 'https://litellm.ai' },
  { slug: 'portkey', name: 'Portkey', category: 'Router', region: 'Global', color: '#7c3aed', website: 'https://portkey.ai' },
  { slug: 'nvidia-nim', name: 'NVIDIA NIM', category: 'Cloud', region: 'Global', color: '#76b900', website: 'https://nvidia.com/nim' },
  { slug: 'fal', name: 'Fal', category: 'Inference API', region: 'Global', color: '#facc15', website: 'https://fal.ai' },
  { slug: 'nearai', name: 'NEAR AI Cloud', category: 'Inference API', region: 'Global', color: '#0ea5e9', website: 'https://near.ai' },
  { slug: 'elevenlabs', name: 'ElevenLabs API', category: 'Direct API', region: 'Global', color: '#18181b', website: 'https://elevenlabs.io' },
  { slug: 'inception', name: 'Inception API', category: 'Direct API', region: 'Global', color: '#7c3aed', website: 'https://inceptionlabs.ai' },
  { slug: 'reflection', name: 'Reflection API', category: 'Direct API', region: 'Global', color: '#6366f1', website: 'https://reflection.ai' },
  { slug: 'thinking-machines', name: 'Thinking Machines API', category: 'Direct API', region: 'Global', color: '#f59e0b', website: 'https://thinkingmachines.ai' },
  { slug: 'ai21labs', name: 'AI21 API', category: 'Direct API', region: 'Global', color: '#00c2a8', website: 'https://ai21.com' },
  { slug: 'writer', name: 'Writer API', category: 'Direct API', region: 'Global', color: '#5b5bd6', website: 'https://writer.com' },
  { slug: 'perplexity', name: 'Perplexity API', category: 'Direct API', region: 'Global', color: '#20808d', website: 'https://perplexity.ai' },
];

const benchmarks: Array<{
  slug: string; name: string; category: BenchmarkCategory;
  description: string; maxScore: number; unit: string;
}> = [
  { slug: 'swe-bench-verified', name: 'SWE-bench Verified', category: BenchmarkCategory.CODING, description: 'Real GitHub issues from popular open-source repositories; measures the share of issues resolved by an autonomous agent.', maxScore: 100, unit: '%' },
  { slug: 'gpqa-diamond', name: 'GPQA Diamond', category: BenchmarkCategory.REASONING, description: 'Graduate-level biology, chemistry and physics questions written by domain experts.', maxScore: 100, unit: '%' },
  { slug: 'mmlu-pro', name: 'MMLU-Pro', category: BenchmarkCategory.REASONING, description: 'Expanded multi-task understanding benchmark with ten answer choices and harder reasoning questions.', maxScore: 100, unit: '%' },
  { slug: 'aime-2026', name: 'AIME 2026', category: BenchmarkCategory.MATH, description: 'Problems from the 2026 American Invitational Mathematics Examination.', maxScore: 100, unit: '%' },
  { slug: 'math-500', name: 'MATH-500', category: BenchmarkCategory.MATH, description: 'Five hundred competition mathematics problems spanning algebra through calculus.', maxScore: 100, unit: '%' },
  { slug: 'mmmu', name: 'MMMU', category: BenchmarkCategory.VISION, description: 'Multimodal understanding across college-level disciplines with diagrams, charts and images.', maxScore: 100, unit: '%' },
  { slug: 'arc-agi-2', name: 'ARC-AGI 2', category: BenchmarkCategory.AGENTIC, description: 'Abstract reasoning puzzles requiring compositional generalization from very few examples.', maxScore: 100, unit: '%' },
  { slug: 'livecodebench', name: 'LiveCodeBench', category: BenchmarkCategory.CODING, description: 'Contest programming problems collected continuously from competitive programming platforms.', maxScore: 100, unit: '%' },
  { slug: 'tau-bench', name: 'τ-bench', category: BenchmarkCategory.AGENTIC, description: 'Tool-using customer support agent benchmark measuring correct, policy-compliant actions.', maxScore: 100, unit: '%' },
  { slug: 'chatbot-arena', name: 'Chatbot Arena', category: BenchmarkCategory.LANGUAGE, description: 'Human preference Elo rating from blind pairwise comparisons across thousands of prompts.', maxScore: 2000, unit: 'Elo' },
];

// ---------------------------------------------------------------------------
// Model catalogue
// caps: r = reasoning, t = tool calling, v = vision, j = structured JSON,
//       o = open weights, f = free, d = deprecated
// ---------------------------------------------------------------------------

type Caps = string;
type ModelSeed = {
  name: string;
  lab: string;
  type?: ModelType;
  ctx?: number;
  out?: number;
  in?: number | null;
  price?: number | null;
  cache?: number | null;
  iq?: number | null;
  params?: string;
  license?: string;
  released: string;
  caps?: Caps;
  desc: string;
  providers?: string[];
};

const m = (
  name: string,
  lab: string,
  o: Omit<ModelSeed, 'name' | 'lab'>
): ModelSeed => ({ name, lab, ...o });

const models: ModelSeed[] = [
  // ---- OpenAI -------------------------------------------------------------
  m('GPT-6.2 Astra', 'openai', { ctx: 1_050_000, out: 128_000, in: 8, price: 40, cache: 2, iq: 96.4, released: '2026-11-17', caps: 'rtvj', desc: 'Flagship reasoning model for the hardest engineering, research and multimodal tasks. Offers configurable thinking effort and strong visual reasoning.', providers: ['openai', 'openrouter', 'azure', 'vercel-ai-gateway', 'requesty', 'litellm', 'portkey'] }),
  m('GPT-6.2 Astra Pro', 'openai', { ctx: 1_050_000, out: 128_000, in: 16, price: 80, cache: 4, iq: 97.1, released: '2026-11-17', caps: 'rtvj', desc: 'Astra with pro reasoning mode enabled. Spends substantially more thinking tokens per request for higher accuracy on high-stakes problems.' }),
  m('GPT-6.2 Sol', 'openai', { ctx: 1_050_000, out: 128_000, in: 2, price: 10, cache: 0.5, iq: 92.8, released: '2026-11-17', caps: 'rtvj', desc: 'Balanced frontier model delivering most of Astra quality at a quarter of the price for everyday production workloads.' }),
  m('GPT-6.2 Sol Pro', 'openai', { ctx: 1_050_000, out: 128_000, in: 4, price: 20, cache: 1, iq: 94.2, released: '2026-11-17', caps: 'rtvj', desc: 'Higher-effort variant of Sol for complex reasoning while staying cost-efficient.' }),
  m('GPT-6.1 Terra', 'openai', { ctx: 1_050_000, out: 128_000, in: 1, price: 5, cache: 0.25, iq: 89.5, released: '2026-10-26', caps: 'rtvj', desc: 'High-volume workhorse with a one-million-token context window and strong tool use.' }),
  m('GPT-6.1 Terra Pro', 'openai', { ctx: 1_050_000, out: 128_000, in: 1, price: 5, cache: 0.25, iq: 91.0, released: '2026-10-27', caps: 'rtvj', desc: 'Terra tuned for deeper reasoning on difficult agentic tasks.' }),
  m('GPT-6 Mini', 'openai', { ctx: 262_144, out: 65_536, in: 0.3, price: 1.2, cache: 0.06, iq: 83.6, released: '2026-09-12', caps: 'rtvj', desc: 'Compact, low-latency model designed for high-throughput chat and routing.' }),
  m('o7 Reasoning', 'openai', { ctx: 400_000, out: 100_000, in: 10, price: 38, cache: 2.5, iq: 95.8, released: '2026-08-04', caps: 'rtj', desc: 'Dedicated reasoning series optimized for science, math and multi-step analysis.' }),
  m('o7-mini', 'openai', { ctx: 200_000, out: 80_000, in: 1.5, price: 6, cache: 0.3, iq: 89.9, released: '2026-08-04', caps: 'rtj', desc: 'Smaller reasoning model for cost-sensitive analytical pipelines.' }),
  m('GPT-6.2 Astra (batch)', 'openai', { ctx: 1_050_000, out: 128_000, in: 4, price: 20, cache: 2, iq: 96.4, released: '2026-11-17', caps: 'rtvj', desc: 'Batch deployment of GPT-6.2 Astra at half price for asynchronous workloads.' }),
  m('text-embedding-4-large', 'openai', { type: ModelType.EMBEDDING, ctx: 8192, in: 0.13, iq: null, released: '2026-06-18', caps: '', desc: 'High-dimensional embedding model for retrieval, clustering and semantic search.', providers: ['openai', 'azure', 'openrouter'] }),
  m('Whisper 4 Turbo', 'openai', { type: ModelType.TRANSCRIPTION, ctx: 65_536, in: 0.006, iq: null, released: '2026-05-22', caps: '', desc: 'Robust multilingual speech-to-text with word-level timestamps and diarization.' }),
  m('GPT Image 3', 'openai', { type: ModelType.IMAGE, in: null, price: null, iq: null, released: '2026-10-02', caps: 'v', desc: 'Photorealistic image generation and editing with precise text rendering.', providers: ['openai', 'replicate', 'openrouter'] }),

  // ---- Anthropic ----------------------------------------------------------
  m('Claude Opus 5', 'anthropic', { ctx: 1_000_000, out: 131_000, in: 10, price: 50, cache: 1, iq: 96.8, released: '2026-09-30', caps: 'rtvj', desc: 'Frontier model for complex agentic coding, long-horizon research and high-stakes analysis.', providers: ['anthropic', 'amazon-bedrock', 'google-vertex', 'openrouter', 'vercel-ai-gateway', 'litellm'] }),
  m('Claude Sonnet 5', 'anthropic', { ctx: 1_000_000, out: 64_000, in: 3, price: 15, cache: 0.3, iq: 93.4, released: '2026-09-30', caps: 'rtvj', desc: 'Best balance of speed, intelligence and cost for production agents and coding assistants.' }),
  m('Claude Haiku 5', 'anthropic', { ctx: 200_000, out: 32_000, in: 0.8, price: 4, cache: 0.08, iq: 86.2, released: '2026-09-30', caps: 'rtvj', desc: 'Fastest Claude model for sub-second interactions, classification and routing.' }),
  m('Claude Opus 4.8', 'anthropic', { ctx: 200_000, out: 32_000, in: 5, price: 25, cache: 0.5, iq: 93.6, released: '2026-04-11', caps: 'rtvj', desc: 'Previous-generation flagship still widely used for demanding coding workloads.' }),
  m('Claude Sonnet 4.7', 'anthropic', { ctx: 200_000, out: 32_000, in: 3, price: 15, cache: 0.3, iq: 91.2, released: '2026-02-19', caps: 'rtvj', desc: 'Reliable mid-tier model with strong tool use and computer control.' }),
  m('Claude 3.7 Sonnet', 'anthropic', { ctx: 200_000, out: 32_000, in: 3, price: 15, cache: 0.3, iq: 86.9, released: '2025-02-24', caps: 'rtvj', desc: 'Early hybrid reasoning model that introduced configurable extended thinking.', providers: ['anthropic', 'amazon-bedrock', 'google-vertex', 'openrouter'] }),

  // ---- Google -------------------------------------------------------------
  m('Gemini 4 Neon', 'google', { ctx: 1_050_000, out: 1_050_000, in: 3, price: 15, cache: 0.4, iq: 94.7, released: '2026-11-18', caps: 'rtvj', desc: 'Fast mid-priced Gemini 4 model built for coding, agents and multimodal STEM work with configurable thinking depth.', providers: ['google-vertex', 'openrouter', 'vercel-ai-gateway', 'litellm'] }),
  m('Gemini 4 Carbon', 'google', { ctx: 2_000_000, out: 131_000, in: 6, price: 30, cache: 0.75, iq: 96.1, released: '2026-10-09', caps: 'rtvj', desc: 'Top-tier Gemini model with a two-million-token context window for repository-scale reasoning.' }),
  m('Gemini 4 Hydrogen', 'google', { ctx: 1_050_000, out: 65_536, in: 0.9, price: 3.5, cache: 0.2, iq: 89.8, released: '2026-10-09', caps: 'rtvj', desc: 'Efficient Gemini 4 entry point for high-volume multilingual and multimodal workloads.' }),
  m('Gemini 3.5 Pro', 'google', { ctx: 1_000_000, out: 65_536, in: 2, price: 12, cache: 0.25, iq: 92.3, released: '2026-04-02', caps: 'rtvj', desc: 'Previous flagship with strong reasoning and native image and video understanding.' }),
  m('Gemini 3.5 Flash', 'google', { ctx: 1_000_000, out: 65_536, in: 0.3, price: 2.5, cache: 0.06, iq: 87.4, released: '2026-04-02', caps: 'rtvj', desc: 'Low-latency multimodal model optimized for interactive applications at scale.' }),
  m('Gemini Omni 1.2 Flash', 'google', { ctx: 131_072, out: 65_536, in: 1.5, price: 9, cache: 0.38, iq: 85.0, released: '2026-11-05', caps: 'rtvj', desc: 'Omni model handling text, image and audio input in a single streaming interface.' }),
  m('Gemma 4 27B', 'google', { ctx: 262_144, out: 32_768, in: 0.15, price: 0.3, iq: 85.9, params: '27B', license: 'Gemma License', released: '2026-08-20', caps: 'rtvjo', desc: 'Open-weight multimodal model with strong reasoning for its size, tuned for a single GPU.', providers: ['google-vertex', 'ollama', 'together-ai', 'deepinfra'] }),
  m('Gemma 4 12B', 'google', { ctx: 131_072, out: 32_768, in: 0.05, price: 0.25, iq: 81.7, params: '12B', license: 'Gemma License', released: '2026-08-20', caps: 'rtvjo', desc: 'Small open model suitable for local development and edge deployment.' }),
  m('Gemini 2.5 Pro TTS', 'google', { type: ModelType.SPEECH, ctx: 32_768, in: 1, price: 20, iq: null, released: '2026-02-11', caps: '', desc: 'Expressive speech generation with natural language control of style, pace and tone.' }),

  // ---- DeepSeek -----------------------------------------------------------
  m('DeepSeek V4.1 Flash 1017', 'deepseek', { ctx: 1_050_000, out: 393_216, in: 0.15, price: 0.6, cache: 0.003, iq: 91.3, params: '685B A37B', license: 'MIT', released: '2026-10-17', caps: 'rtjo', desc: 'Sparse open-weight model offering frontier-level reasoning at a fraction of the cost of closed models.', providers: ['deepinfra', 'together-ai', 'fireworks-ai', 'chutes', 'openrouter', 'siliconflow', 'novita'] }),
  m('DeepSeek V4 Pro', 'deepseek', { ctx: 1_000_000, out: 131_072, in: 0.28, price: 0.28, cache: 0.14, iq: 93.9, params: '1T A64B', license: 'MIT', released: '2026-11-07', caps: 'rtjo', desc: 'Large flagship MoE model with native reasoning and very aggressive cached-input pricing.', providers: ['deepinfra', 'openrouter', 'chutes'] }),
  m('DeepSeek V4.1 Flash Cyber', 'deepseek', { ctx: 1_040_000, out: 1_040_000, in: 0.3, price: 1, cache: 0.007, iq: 90.4, params: '685B A37B', license: 'MIT', released: '2026-10-29', caps: 'rtjo', desc: 'Security-focused variant tuned for defensive analysis and code review.' }),
  m('DeepSeek V4 R2', 'deepseek', { ctx: 160_000, out: 65_536, in: 0.35, price: 1.4, iq: 94.5, params: '685B A37B', license: 'MIT', released: '2026-07-14', caps: 'rtjo', desc: 'Reasoning-focused release with extended deliberation on math and science.' }),
  m('DeepSeek Coder V4', 'deepseek', { ctx: 512_000, out: 131_072, in: 0.2, price: 0.8, iq: 90.9, params: '236B A21B', license: 'MIT', released: '2026-06-03', caps: 'rtjo', desc: 'Code-specialized model trained on repository-level data and fill-in-the-middle tasks.' }),
  m('DeepSeek V3.2', 'deepseek', { ctx: 163_840, out: 65_536, in: 0.28, price: 0.42, iq: 84.1, params: '671B A37B', license: 'MIT', released: '2025-09-29', caps: 'rtjo', desc: 'Widely deployed predecessor that popularized sparse attention for long context.' }),

  // ---- Meta ---------------------------------------------------------------
  m('Llama 5 Behemoth', 'meta', { ctx: 1_000_000, out: 131_072, in: 1.2, price: 4.5, iq: 94.0, params: '1.4T A128B', license: 'Llama 5 Community', released: '2026-08-12', caps: 'rtvjo', desc: 'Largest open-weight Llama model with native multimodality and long-context reasoning.', providers: ['together-ai', 'fireworks-ai', 'deepinfra', 'groq', 'openrouter', 'hugging-face'] }),
  m('Llama 5 70B', 'meta', { ctx: 262_144, out: 65_536, in: 0.35, price: 0.9, iq: 88.4, params: '70B', license: 'Llama 5 Community', released: '2026-08-12', caps: 'rtvjo', desc: 'Dense open model balancing capability and serving cost for self-hosting.' }),
  m('Llama 5 8B', 'meta', { ctx: 131_072, out: 32_768, in: 0.05, price: 0.1, iq: 79.2, params: '8B', license: 'Llama 5 Community', released: '2026-08-12', caps: 'rtvjo', desc: 'Small, fast open model for on-device and latency-sensitive use cases.' }),
  m('Llama 4 Maverick', 'meta', { ctx: 1_000_000, out: 131_072, in: 0.2, price: 0.6, iq: 86.7, params: '400B A17B', license: 'Llama 4 Community', released: '2025-04-05', caps: 'rtvjo', desc: 'Early multimodal MoE model with an unusually large context window for its class.' }),
  m('Muse Spark Open', 'meta', { ctx: 1_050_000, out: 131_072, in: 1.25, price: 4.25, cache: 0.15, iq: 90.7, params: '600B A40B', license: 'Llama 5 Community', released: '2026-10-15', caps: 'rtvjo', desc: 'Open research model exploring mixture-of-depths architectures for efficient reasoning.' }),

  // ---- Mistral ------------------------------------------------------------
  m('Mistral Large 3', 'mistral', { ctx: 262_144, out: 65_536, in: 2, price: 6, iq: 89.1, released: '2026-05-20', caps: 'rtvj', desc: 'Flagship commercial model with strong multilingual and coding performance.', providers: ['mistral-api', 'openrouter', 'azure', 'vercel-ai-gateway'] }),
  m('Mistral Medium 3.5', 'mistral', { ctx: 200_000, out: 65_536, in: 0.4, price: 1.2, iq: 85.3, released: '2026-06-30', caps: 'rtj', desc: 'Cost-effective model tuned for enterprise agents and function calling.' }),
  m('Mistral Small 4', 'mistral', { ctx: 131_072, out: 32_768, in: 0.1, price: 0.3, iq: 82.4, params: '24B', license: 'Apache 2.0', released: '2026-07-08', caps: 'rtvjo', desc: 'Compact open model for local assistants and high-volume tasks.' }),
  m('Codestral 3', 'mistral', { ctx: 256_000, out: 65_536, in: 0.3, price: 0.9, iq: 88.0, params: '32B', license: 'Mistral AI License', released: '2026-03-17', caps: 'rtjo', desc: 'Code completion and editing model supporting 80+ programming languages.' }),
  m('Voxtral TTS 3', 'mistral', { type: ModelType.SPEECH, in: 0.5, price: 4, iq: null, released: '2026-10-20', caps: '', desc: 'Multilingual text-to-speech with voice cloning and expressive control.' }),
  m('Voxtral Mini Transcribe 3', 'mistral', { type: ModelType.TRANSCRIPTION, ctx: 65_536, in: 0.003, iq: null, released: '2026-10-20', caps: '', desc: 'Fast multilingual transcription optimized for streaming and batch pipelines.' }),

  // ---- Alibaba / Qwen -----------------------------------------------------
  m('Qwen 3.8 Max', 'alibaba', { ctx: 262_144, out: 65_536, in: 1.2, price: 4, iq: 93.1, released: '2026-09-05', caps: 'rtvj', desc: 'Flagship Qwen model with strong Chinese and English reasoning and vision.', providers: ['openrouter', 'siliconflow', 'vercel-ai-gateway', 'moonshot-api'] }),
  m('Qwen 3.8 235B A22B', 'alibaba', { ctx: 262_144, out: 65_536, in: 0.2, price: 0.8, iq: 91.4, params: '235B A22B', license: 'Apache 2.0', released: '2026-08-28', caps: 'rtvjo', desc: 'Large open MoE model with competitive reasoning at low inference cost.' }),
  m('Qwen 3.8 32B', 'alibaba', { ctx: 262_144, out: 65_536, in: 0.08, price: 0.25, iq: 87.6, params: '32B', license: 'Apache 2.0', released: '2026-08-28', caps: 'rtvjo', desc: 'Dense open model that runs on a single workstation GPU.' }),
  m('Qwen 3.8 27B Abliterated', 'alibaba', { ctx: 262_144, out: 33_000, in: 0.04, price: 1.35, iq: 85.1, params: '27B', license: 'Apache 2.0', released: '2026-10-29', caps: 'rtjo', desc: 'Community-tuned Qwen variant with relaxed refusal behaviour.', providers: ['nearai', 'openrouter'] }),
  m('Qwen 3 Coder 480B', 'alibaba', { ctx: 262_144, out: 65_536, in: 0.6, price: 2.4, iq: 92.0, params: '480B A35B', license: 'Apache 2.0', released: '2026-02-02', caps: 'rtjo', desc: 'Code-specialized MoE model trained on large-scale repository data.' }),
  m('Qwen3 TTS 1.7B', 'alibaba', { type: ModelType.SPEECH, in: 20, iq: null, released: '2026-11-20', caps: '', desc: 'Multilingual speech synthesis across ten languages with nine preset voices.' }),
  m('Qwen3 Embedding 8B', 'alibaba', { type: ModelType.EMBEDDING, ctx: 32_768, in: 0.05, iq: null, released: '2025-06-04', caps: '', desc: 'Multilingual embedding model for retrieval and semantic similarity.' }),

  // ---- xAI ----------------------------------------------------------------
  m('Grok 5', 'xai', { ctx: 2_000_000, out: 131_072, in: 6, price: 30, iq: 95.2, released: '2026-09-18', caps: 'rtvj', desc: 'Frontier model with real-time web access and strong scientific reasoning.', providers: ['openrouter', 'vercel-ai-gateway', 'litellm'] }),
  m('Grok 5 Mini', 'xai', { ctx: 1_000_000, out: 65_536, in: 0.6, price: 2.4, iq: 88.9, released: '2026-09-18', caps: 'rtvj', desc: 'Fast, inexpensive variant for high-volume agent workloads.' }),
  m('Grok Code Fast 2', 'xai', { ctx: 256_000, out: 65_536, in: 0.2, price: 0.6, iq: 87.7, released: '2026-07-01', caps: 'rtj', desc: 'Low-latency coding model tuned for agentic editing and terminal work.' }),

  // ---- Moonshot / Kimi ----------------------------------------------------
  m('Kimi K3.1 Pro', 'moonshotai', { ctx: 1_050_000, out: 1_050_000, in: 4, price: 20, cache: 0.2, iq: 94.9, params: '1T A32B', license: 'Modified MIT', released: '2026-10-23', caps: 'rtjo', desc: 'Open-weight flagship with an enormous output budget for long-form reasoning and agentic work.', providers: ['moonshot-api', 'openrouter', 'fireworks-ai', 'chutes', 'vercel-ai-gateway'] }),
  m('Kimi K3.1 Flash', 'moonshotai', { ctx: 1_000_000, out: 262_144, in: 0.5, price: 2, cache: 0.05, iq: 90.2, params: '1T A32B', license: 'Modified MIT', released: '2026-10-23', caps: 'rtjo', desc: 'Faster and cheaper sibling of Kimi K3.1 Pro for production workloads.' }),
  m('Kimi K2.5', 'moonshotai', { ctx: 262_144, out: 65_536, in: 0.6, price: 2.5, iq: 90.1, params: '1T A32B', license: 'Modified MIT', released: '2026-01-28', caps: 'rtjo', desc: 'Agentic open model with strong tool use and code generation.' }),
  m('Kimi Linear 48B', 'moonshotai', { ctx: 1_000_000, out: 262_144, in: 0.2, price: 0.8, iq: 86.3, params: '48B', license: 'Apache 2.0', released: '2026-06-19', caps: 'rtjo', desc: 'Hybrid linear-attention model built for very long contexts at low cost.' }),

  // ---- Zhipu / GLM --------------------------------------------------------
  m('GLM 5.3 FlashX', 'zhipuai', { ctx: 1_050_000, out: 131_072, in: 0.37, price: 1.25, cache: 0.07, iq: 91.8, params: '744B A40B', license: 'MIT', released: '2026-11-02', caps: 'rtvjo', desc: 'Open flagship with strong coding and agent performance at low cost.', providers: ['zhipu-api', 'openrouter', 'vercel-ai-gateway', 'siliconflow'] }),
  m('GLM 5.3 Air', 'zhipuai', { ctx: 200_000, out: 65_536, in: 0.1, price: 0.4, iq: 86.5, params: '32B', license: 'MIT', released: '2026-11-02', caps: 'rtvjo', desc: 'Dense open model for local deployment and fast inference.' }),
  m('GLM 4.7', 'zhipuai', { ctx: 200_000, out: 65_536, in: 0.6, price: 2.2, iq: 88.2, params: '355B A32B', license: 'MIT', released: '2026-01-15', caps: 'rtjo', desc: 'Earlier open MoE model with strong Chinese language coverage.' }),

  // ---- Cohere -------------------------------------------------------------
  m('Command R+ 2026', 'cohere', { ctx: 256_000, out: 32_768, in: 2.5, price: 10, iq: 88.7, released: '2026-04-22', caps: 'rtj', desc: 'Enterprise retrieval-augmented generation model with grounded citations.', providers: ['cohere-api', 'azure', 'openrouter'] }),
  m('Cohere Rerank 5 Pro', 'cohere', { type: ModelType.RERANKING, ctx: 33_000, in: 2, iq: null, released: '2026-10-21', caps: '', desc: 'High-accuracy passage reranker for search and RAG pipelines.', providers: ['cohere-api', 'vercel-ai-gateway'] }),
  m('Cohere Rerank 5 Fast', 'cohere', { type: ModelType.RERANKING, ctx: 33_000, in: 0.6, iq: null, released: '2026-10-21', caps: '', desc: 'Low-latency reranker for high-throughput retrieval.', providers: ['cohere-api', 'vercel-ai-gateway'] }),
  m('Embed v4 English', 'cohere', { type: ModelType.EMBEDDING, ctx: 512, in: 0.1, iq: null, released: '2026-03-08', caps: '', desc: 'Dense English embedding model optimized for semantic search.' }),

  // ---- Amazon / Microsoft / NVIDIA ---------------------------------------
  m('Nova 3 Premier', 'amazon', { ctx: 1_000_000, out: 65_536, in: 3.5, price: 16, iq: 92.6, released: '2026-07-30', caps: 'rtvj', desc: 'Amazon’s most capable Nova model with native multimodal inputs on Bedrock.', providers: ['amazon-bedrock', 'openrouter'] }),
  m('Nova 3 Lite', 'amazon', { ctx: 512_000, out: 32_768, in: 0.2, price: 0.8, iq: 85.5, released: '2026-07-30', caps: 'rtvj', desc: 'Cost-efficient multimodal model for high-volume applications.', providers: ['amazon-bedrock'] }),
  m('Phi 6 reasoning', 'microsoft', { ctx: 128_000, out: 32_768, in: 0.4, price: 1.4, iq: 86.8, params: '14B', license: 'MIT', released: '2026-05-14', caps: 'rtjo', desc: 'Small language model with surprisingly strong math and logical reasoning.', providers: ['azure', 'hugging-face', 'ollama'] }),
  m('Nemotron 5 70B', 'nvidia', { ctx: 262_144, out: 65_536, in: 0.3, price: 0.9, iq: 88.6, params: '70B', license: 'NVIDIA Open Model', released: '2026-06-24', caps: 'rtjo', desc: 'Open model optimized for accelerated inference and enterprise data workloads.', providers: ['nvidia-nim', 'together-ai', 'deepinfra'] }),
  m('Nemotron Nano 9B', 'nvidia', { ctx: 128_000, out: 32_768, in: 0.05, price: 0.15, iq: 80.9, params: '9B', license: 'NVIDIA Open Model', released: '2026-06-24', caps: 'rtjo', desc: 'Efficient small model for edge and real-time assistant use cases.', providers: ['nvidia-nim', 'ollama'] }),

  // ---- Media models -------------------------------------------------------
  m('FLUX 3 Ultra', 'black-forest-labs', { type: ModelType.IMAGE, in: null, price: null, iq: null, released: '2026-08-19', caps: 'v', desc: 'Highest-fidelity text-to-image model with precise typography and complex composition.', providers: ['replicate', 'baseten', 'fal'] }),
  m('FLUX 3 Image Klein', 'black-forest-labs', { type: ModelType.IMAGE, in: null, price: null, iq: null, released: '2026-10-15', caps: 'v', desc: 'Fast, compact image generation model for interactive products.', providers: ['replicate', 'openrouter'] }),
  m('Stable Diffusion 4', 'stability-ai', { type: ModelType.IMAGE, in: null, price: null, iq: null, released: '2026-03-11', caps: 'vo', desc: 'Open image generation model with editable latent space and fine-tuned controls.', providers: ['replicate', 'hugging-face', 'baseten'] }),
  m('Eleven v4 Multilingual', 'elevenlabs', { type: ModelType.SPEECH, in: null, price: null, iq: null, released: '2026-07-16', caps: '', desc: 'Expressive multilingual speech synthesis with 70+ languages and voice cloning.', providers: ['elevenlabs', 'replicate'] }),
  m('Eleven Turbo 3', 'elevenlabs', { type: ModelType.SPEECH, in: null, price: null, iq: null, released: '2026-02-04', caps: '', desc: 'Low-latency voice model for conversational agents.', providers: ['elevenlabs'] }),

  // ---- Specialist labs ----------------------------------------------------
  m('Mercury 3', 'inception', { ctx: 1_000_000, out: 131_072, in: 0.1, price: 0.35, cache: 0.01, iq: 87.9, released: '2026-10-16', caps: 'rtj', desc: 'Diffusion-based language model that generates many tokens in parallel for very high throughput.', providers: ['inception', 'openrouter', 'vercel-ai-gateway'] }),
  m('Mercury Coder Mini', 'inception', { ctx: 200_000, out: 65_536, in: 0.05, price: 0.2, iq: 82.6, released: '2026-06-09', caps: 'rtj', desc: 'Fast diffusion code model tuned for completion and editing.' }),
  m('Beam 1.0 501B A23B', 'reflection', { ctx: 1_050_000, out: 131_072, in: 0, price: 0, cache: 0, iq: 91.5, params: '501B A23B', license: 'Apache 2.0', released: '2026-10-05', caps: 'rtvjo', desc: 'Open-weight frontier model released free of charge for research and commercial use.', providers: ['reflection', 'openrouter', 'chutes', 'fireworks-ai'] }),
  m('Inkling 2 Small', 'thinking-machines', { ctx: 1_050_000, out: 131_072, in: 0, price: 0, cache: 0, iq: 92.1, params: '26B A3.4B', license: 'Apache 2.0', released: '2026-11-05', caps: 'rtvjo', desc: 'Open-weight multimodal looped transformer that reuses middle layers for deeper computation.', providers: ['thinking-machines', 'openrouter', 'vercel-ai-gateway'] }),
  m('Inkling 2 Mini', 'thinking-machines', { ctx: 1_050_000, out: 65_536, in: 0.075, price: 0.3, iq: 87.2, params: '3.4B', license: 'Apache 2.0', released: '2026-11-21', caps: 'rtvjo', desc: 'Tiny looped transformer small enough to run on a laptop while remaining agent-capable.', providers: ['thinking-machines', 'openrouter'] }),
  m('Jamba 3 Ultra', 'ai21labs', { ctx: 1_000_000, out: 65_536, in: 1.5, price: 7, iq: 88.3, params: '400B A80B', license: 'AI21 License', released: '2026-05-06', caps: 'rtvj', desc: 'Hybrid Mamba-Transformer model with very long context and efficient memory use.', providers: ['ai21labs', 'amazon-bedrock', 'openrouter'] }),
  m('Palmyra X5', 'writer', { ctx: 200_000, out: 32_768, in: 1.8, price: 7, iq: 85.7, released: '2026-04-28', caps: 'rtj', desc: 'Enterprise model tuned for long-form business writing and grounded generation.', providers: ['writer', 'openrouter'] }),
  m('pplx-embed-v2-context-9b', 'perplexity', { type: ModelType.EMBEDDING, ctx: 131_072, in: 0.12, iq: null, released: '2026-11-20', caps: '', desc: 'Multimodal contextual embedding model for retrieval over text and visual documents.', providers: ['perplexity', 'openrouter'] }),
  m('pplx-embed-v2-context-0.6b', 'perplexity', { type: ModelType.EMBEDDING, ctx: 131_072, in: 0.02, iq: null, released: '2026-11-20', caps: '', desc: 'Compact contextual embedding model for high-volume search indexing.', providers: ['perplexity', 'openrouter'] }),
  m('MiniMax M3.1 Flash', 'minimax', { ctx: 1_000_000, out: 524_288, in: 0.15, price: 0.6, cache: 0.01, iq: 90.6, params: '230B A10B', license: 'Apache 2.0', released: '2026-10-19', caps: 'rtjo', desc: 'Extremely efficient open MoE model with a very large context and output window.', providers: ['minimax-api', 'openrouter', 'chutes', 'siliconflow'] }),
  m('MiniMax Speech 3', 'minimax', { type: ModelType.SPEECH, in: null, price: null, iq: null, released: '2026-08-08', caps: '', desc: 'Natural multilingual speech generation with granular emotion control.', providers: ['minimax-api', 'replicate'] }),
];

// ---------------------------------------------------------------------------
// Deterministic helpers
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20261123);
const rand = (min: number, max: number) => min + rng() * (max - min);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const DEFAULT_PROVIDERS = [
  'openrouter', 'together-ai', 'fireworks-ai', 'deepinfra', 'groq',
  'openai', 'anthropic', 'google-vertex', 'amazon-bedrock', 'azure',
  'vercel-ai-gateway', 'chutes', 'novita', 'nebius', 'litellm', 'requesty',
];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function main() {
  console.log('Resetting database...');
  await prisma.benchmarkScore.deleteMany();
  await prisma.modelProvider.deleteMany();
  await prisma.model.deleteMany();
  await prisma.benchmark.deleteMany();
  await prisma.lab.deleteMany();
  await prisma.provider.deleteMany();

  console.log(`Creating ${labs.length} labs, ${providers.length} providers, ${benchmarks.length} benchmarks...`);
  await prisma.lab.createMany({ data: labs });
  await prisma.provider.createMany({ data: providers });
  await prisma.benchmark.createMany({ data: benchmarks });

  const labRows = await prisma.lab.findMany();
  const providerRows = await prisma.provider.findMany();
  const benchmarkRows = await prisma.benchmark.findMany();
  const labBySlug = new Map(labRows.map((l) => [l.slug, l]));
  const providerBySlug = new Map(providerRows.map((p) => [p.slug, p]));

  console.log(`Creating ${models.length} models...`);
  const createdModels: Array<{ seed: ModelSeed; row: Model }> = [];

  for (const seed of models) {
    const lab = labBySlug.get(seed.lab);
    if (!lab) throw new Error(`Unknown lab: ${seed.lab}`);

    const caps = seed.caps ?? '';
    const row = await prisma.model.create({
      data: {
        slug: `${seed.lab}/${slugify(seed.name)}`,
        name: seed.name,
        labId: lab.id,
        type: seed.type ?? ModelType.TEXT,
        description: seed.desc,
        contextWindow: seed.ctx ?? null,
        maxOutput: seed.out ?? null,
        inputPrice: seed.in === undefined ? null : seed.in,
        outputPrice: seed.price === undefined ? null : seed.price,
        cachePrice: seed.cache ?? null,
        intelligence: seed.iq ?? null,
        parameters: seed.params ?? null,
        license: seed.license ?? null,
        reasoning: caps.includes('r'),
        toolCalling: caps.includes('t'),
        structuredOutput: caps.includes('j'),
        vision: caps.includes('v'),
        openWeights: caps.includes('o'),
        free: caps.includes('f') || seed.in === 0,
        deprecated: caps.includes('d'),
        releasedAt: new Date(`${seed.released}T00:00:00Z`),
        updatedAt: new Date(`${seed.released}T00:00:00Z`),
      },
    });
    createdModels.push({ seed, row });
  }

  console.log('Creating provider listings...');
  let listingCount = 0;
  for (const { seed, row } of createdModels) {
    const explicit = seed.providers ?? [];
    const chosen = explicit.length
      ? explicit
      : Array.from(new Set([pick(DEFAULT_PROVIDERS), pick(DEFAULT_PROVIDERS), ...Array.from({ length: Math.floor(rand(0, 4)) }, () => pick(DEFAULT_PROVIDERS))]));

    for (const slug of new Set(chosen)) {
      const provider = providerBySlug.get(slug);
      if (!provider) continue; // skip providers referenced but not in directory (e.g. fal, nearai)
      const multiplier = 1 + (rng() - 0.5) * 0.22;
      await prisma.modelProvider.create({
        data: {
          modelId: row.id,
          providerId: provider.id,
          inputPrice: row.inputPrice === null ? null : Number((row.inputPrice * multiplier).toFixed(4)),
          outputPrice: row.outputPrice === null ? null : Number((row.outputPrice * multiplier).toFixed(4)),
          cachePrice: row.cachePrice === null ? null : Number((row.cachePrice * multiplier).toFixed(4)),
          contextWindow: row.contextWindow,
          throughput: Math.round(rand(28, 480)),
          latencyMs: Math.round(rand(120, 1400)),
          available: rng() > 0.06,
        },
      });
      listingCount++;
    }
  }

  console.log('Creating benchmark scores...');
  let scoreCount = 0;
  for (const benchmark of benchmarkRows) {
    const candidates = createdModels
      .filter(({ row }) => row.intelligence !== null && benchmarkApplies(benchmark, row))
      .sort((a, b) => (b.row.intelligence ?? 0) - (a.row.intelligence ?? 0))
      .slice(0, benchmark.slug === 'chatbot-arena' ? 60 : 45);

    const ranked = candidates
      .map(({ row }) => ({
        row,
        score: Math.min(
          benchmark.maxScore,
          Math.max(
            benchmark.unit === 'Elo' ? 900 : 2,
            (row.intelligence ?? 0) * (benchmark.maxScore / 100) + rand(-4.5, 3.5) * (benchmark.unit === 'Elo' ? 12 : 1)
          ),
        ),
      }))
      .sort((a, b) => b.score - a.score);

    for (let i = 0; i < ranked.length; i++) {
      const { row, score } = ranked[i];
      await prisma.benchmarkScore.create({
        data: {
          modelId: row.id,
          benchmarkId: benchmark.id,
          score: Number(score.toFixed(benchmark.unit === 'Elo' ? 0 : 1)),
          rank: i + 1,
        },
      });
      scoreCount++;
    }
  }

  console.log(`\nSeed complete: ${createdModels.length} models, ${listingCount} listings, ${scoreCount} scores.`);
}

function benchmarkApplies(benchmark: Benchmark, model: Model) {
  if (benchmark.category === 'VISION') return model.vision;
  if (benchmark.slug === 'swe-bench-verified' || benchmark.slug === 'livecodebench') return model.toolCalling || model.name.toLowerCase().includes('code');
  if (benchmark.category === 'MATH' || benchmark.category === 'REASONING') return model.reasoning;
  return true;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
