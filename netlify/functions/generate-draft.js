export const handler = async (event) => {
  // Set consistent headers with improved CORS support
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Handle base64 encoded body
    const body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf-8')
      : event.body;
    
    console.log('Request body:', body);
    
    // Parse JSON safely
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON format' })
      };
    }
    
    const { 
      description, 
      inventionType = "device", 
      techField = "Technology Field", 
      keyFeatures = "Key features not specified" 
    } = parsedBody;
    
    if (!description || description.trim().length < 10) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Description is required and must be at least 10 characters'
        })
      };
    }

    // Access environment variable
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    
    if (!DEEPSEEK_API_KEY) {
      console.error('DeepSeek API key is missing');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Server configuration error: API key missing'
        })
      };
    }

    console.log('Calling DeepSeek API...');
    
    // Create the system prompt
    const systemPrompt = `As a USPTO patent attorney, draft a patent for a ${inventionType} in ${techField}. Key features: ${keyFeatures}. Include:
- Claims with USPTO numbering
- PlantUML diagrams
- Physics validation
- Prior art flags
- Competitor analysis
- International IP`;

    const startTime = Date.now();
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Generate patent draft for: ${description.substring(0, 1000)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        top_p: 0.9
      })
    });
    
    const duration = Date.now() - startTime;
    console.log(`API request took ${duration}ms`);

    // Handle API errors
    if (!response.ok) {
      let errorDetails;
      try {
        const errorResponse = await response.json();
        errorDetails = errorResponse.error?.message || JSON.stringify(errorResponse);
      } catch (e) {
        errorDetails = await response.text();
      }
      
      console.error(`DeepSeek API error (${response.status}):`, errorDetails);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: `API request failed (${response.status})`,
          details: errorDetails.substring(0, 500)
        })
      };
    }

    const data = await response.json();
    const draft = data.choices[0]?.message?.content || "";
    
    console.log('Draft generated successfully');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ draft })
    };
    
  } catch (error) {
    console.error('Function execution error:', error);
    
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