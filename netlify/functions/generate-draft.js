// Initialize Supabase (if used)
const initSupabase = () => {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    const { createClient } = require('@supabase/supabase-js');
    return createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
      { persistSession: false }
    );
  }
  return null;
};

const supabase = initSupabase();

console.log("Function process started. Environment:", process.env.NETLIFY_DEV ? "Development" : "Production");

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log("Handler execution started");
  console.time("HandlerExecution");

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Always respond to OPTIONS for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    console.timeEnd("HandlerExecution");
    return { statusCode: 200, headers, body: JSON.stringify({ message: 'CORS preflight successful' }) };
  }

  if (event.httpMethod !== 'POST') {
    console.timeEnd("HandlerExecution");
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    // Parse request body
    const bodyString = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf-8')
      : event.body;

    const parsedBody = JSON.parse(bodyString);

    const {
      description,
      inventionType = "device",
      techField = "Technology Field",
      keyFeatures = "Key features not specified"
    } = parsedBody;

    if (!description || description.trim().length < 10) {
      console.timeEnd("HandlerExecution");
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Description must be at least 10 characters' })
      };
    }

    // API key check
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!DEEPSEEK_API_KEY) {
      console.timeEnd("HandlerExecution");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error: API key missing' })
      };
    }

    // System prompt
    const systemPrompt = `As a USPTO patent attorney, generate a patent application draft for a ${inventionType} in ${techField}. Key features: ${keyFeatures}. Include:
1. Claims with USPTO numbering
2. Technical diagrams
3. Physics validation
4. Prior art analysis
5. International IP considerations`;

    // API call with timeout (10 seconds)
    const apiTimeout = 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), apiTimeout);

    console.log("Calling DeepSeek API...");
    console.time("APICall");

    let apiResponse;
    try {
      apiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Connection': 'close'
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: description.substring(0, 1000) }
          ],
          temperature: 0.3,
          max_tokens: 2000,
          top_p: 0.9
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
      console.timeEnd("APICall");
    }

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.timeEnd("HandlerExecution");
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: `API request failed (${apiResponse.status})`,
          details: errorText.substring(0, 500)
        })
      };
    }

    const data = await apiResponse.json();
    const draft = data.choices[0]?.message?.content || "";

    // Fire-and-forget Supabase insert (if configured)
    if (supabase) {
      supabase.from('submissions')
        .insert({
          description: description.substring(0, 500),
          draft: draft.substring(0, 1000),
          created_at: new Date().toISOString()
        })
        .then(() => console.log("Supabase insertion completed"))
        .catch(e => console.error('Supabase error:', e.message));
    }

    console.timeEnd("HandlerExecution");
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ draft })
    };

  } catch (error) {
    if (error.name === 'AbortError') {
      console.timeEnd("HandlerExecution");
      return {
        statusCode: 504,
        headers,
        body: JSON.stringify({
          error: 'API request timed out',
          message: 'The DeepSeek API did not respond in time'
        })
      };
    }
    console.error('Handler error:', error);
    console.timeEnd("HandlerExecution");
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};