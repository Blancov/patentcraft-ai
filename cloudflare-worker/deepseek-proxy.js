export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }

    // Only allow POST requests
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // Verify Authorization header exists
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Missing Authorization header", {
        status: 401,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    try {
      const payload = await request.json();
      const deepseekUrl = "https://api.deepseek.com/v1/chat/completions";
      
      // Forward request to DeepSeek API with streaming
      const response = await fetch(deepseekUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          ...payload,
          stream: true
        })
      });

      // Return streaming response with CORS
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*",
          // Add Vary header for better caching behavior
          "Vary": "Origin"
        }
      });
    } catch (error) {
      // Enhanced error logging
      console.error("Proxy Error:", error);
      return new Response(JSON.stringify({ 
        error: "Internal Server Error",
        message: error.message 
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
}