exports.handler = async (event, context) => {
  // Extend timeout
  context.callbackWaitsForEmptyEventLoop = false;
  
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS" }, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }
  try {
    const { apiKey, ...requestBody } = JSON.parse(event.body);
    if (!apiKey) return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "No API key" }) };
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    clearTimeout(timeout);
    
    const data = await response.text();
    return {
      statusCode: response.status,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: data
    };
  } catch (err) {
    const msg = err.name === "AbortError" ? "Request timed out. Try searching one city at a time." : err.message;
    return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: msg }) };
  }
};
