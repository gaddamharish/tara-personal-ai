const handlers = new Map();

/**
 * Register a proactive workflow by stable name.
 * Workflows should be idempotent and safe to run repeatedly.
 */
function register(name, handler) {
  if (!name || typeof handler !== "function") {
    throw new TypeError("A workflow name and function are required");
  }
  handlers.set(name, handler);
}

function list() {
  return [...handlers.keys()];
}

async function run(name, context = {}) {
  const handler = handlers.get(name);
  if (!handler) throw new Error(`Unknown TARA workflow: ${name}`);
  return handler(context);
}

module.exports = { register, list, run };
