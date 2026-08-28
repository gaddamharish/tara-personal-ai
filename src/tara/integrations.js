const integrations = new Map();

/**
 * Optional integration registry. External services remain disabled until a
 * provider is explicitly configured and registered.
 */
function register(name, provider) {
  if (!name || !provider || typeof provider !== "object") {
    throw new TypeError("An integration name and provider object are required");
  }
  integrations.set(name, provider);
}

function get(name) {
  return integrations.get(name) || null;
}

function status() {
  return Object.fromEntries(
    [...integrations.entries()].map(([name, provider]) => [name, {
      enabled: provider.enabled !== false,
      capabilities: provider.capabilities || [],
    }])
  );
}

module.exports = { register, get, status };
