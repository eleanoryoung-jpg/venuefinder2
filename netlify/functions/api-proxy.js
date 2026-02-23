exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }
  try {
    const { apiKey, ...requestBody } = JSON.parse(event.body);
    if (!apiKey) return { statusCode: 400, body: JSON.stringify({ error: "No API key" }) };
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(requestBody)
    });
    const data = await response.text();
    return { statusCode: response.status, headers: { "Content-Type": "application/json" }, body: data };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
