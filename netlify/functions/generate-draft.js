// Add this at the very top
console.log('Function process started. Environment:', process.env.NETLIFY_DEV ? 'Development' : 'Production');

export const handler = async (event) => {
  console.log('Received request:', event.httpMethod, event.path);
  
  // Set consistent headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS preflight');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }

  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Log raw body for debugging
    console.log('Raw body:', event.body);
    
    // Handle base64 encoded body
    const bodyString = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf-8')
      : event.body;
    
    console.log('Decoded body:', bodyString);
    
    // Parse JSON safely
    let parsedBody;
    try {
      parsedBody = JSON.parse(bodyString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
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
      console.log('Invalid description:', description);
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
      // Log all environment variables for debugging
      console.log('Environment variables:', Object.keys(process.env));
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Server configuration error: API key missing',
          envKeys: Object.keys(process.env)
        })
      };
    }

    console.log('Calling DeepSeek API...');
    
    // Create the system prompt safely
    const systemPrompt = `As a USPTO patent attorney, generate a patent application draft for a ${inventionType} in ${techField} with these key features: ${keyFeatures}. Include:
1. Claims with proper USPTO numbering and dependencies
2. Technical diagrams in PlantUML format
3. Physics validation
4. Prior art avoidance flags
5. Competitor workaround analysis
6. International IP considerations`;

    // Log the prompt for verification
    console.log('System prompt:', systemPrompt.substring(0, 200) + '...');
    
    const startTime = Date.now();
    const apiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
    console.log(`API request took ${duration}ms, status: ${apiResponse.status}`);

    // Handle API errors
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('DeepSeek API error:', apiResponse.status, errorText.substring(0, 200));
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
    
    console.log('Draft generated successfully. Length:', draft.length);
    
    // WORKAROUND: Force process exit in development to prevent timeout
    if (process.env.NETLIFY_DEV) {
      setTimeout(() => {
        console.log('Forcing process exit to avoid timeout bug');
        process.exit(0);
      }, 100);
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ draft: draft.substring(0, 100) + '...' }) // Truncate for logs
    };
    
  } catch (error) {
    console.error('Function error:', error);
    
    // WORKAROUND: Force process exit in development
    if (process.env.NETLIFY_DEV) {
      setTimeout(() => {
        console.log('Forcing process exit due to error');
        process.exit(1);
      }, 100);
    }
    
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