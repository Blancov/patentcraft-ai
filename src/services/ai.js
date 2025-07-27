import DOMPurify from 'dompurify';

const sanitizeInput = (text) => {
  if (!text) return '';
  return text
    .replace(/[^\p{L}\p{N}\s.,;:()\-'"@/\\#%&+=*~<>^{}|_$!?]/gu, '') 
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 2000);
};

// Helper to get API endpoint based on environment
const getApiEndpoint = () => {
  if (import.meta.env.MODE === 'development') {
    // For Netlify CLI development
    return 'http://localhost:8888/.netlify/functions/generate-draft';
  }
  // For production
  return '/.netlify/functions/generate-draft';
};

export const generatePatentDraft = async (data) => {
  // Sanitize all inputs
  const sanitizedData = {
    description: sanitizeInput(data.description),
    inventionType: sanitizeInput(data.inventionType) || "device",
    techField: sanitizeInput(data.techField) || "Technology Field",
    keyFeatures: sanitizeInput(data.keyFeatures) || "Key features not specified"
  };
  
  if (!sanitizedData.description || sanitizedData.description.length < 10) {
    throw new Error("Please provide a more detailed description (at least 10 characters)");
  }

  try {
    const endpoint = getApiEndpoint();
    console.log('Calling API endpoint:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Netlify-Workaround': 'true'  // Critical header for workaround
      },
      body: JSON.stringify(sanitizedData)
    });

    // Handle HTTP errors
    if (!response.ok) {
      let errorDetails = `Status: ${response.status}`;
      try {
        // Try to get error details from response
        const errorData = await response.json();
        errorDetails += `, Message: ${errorData.error || errorData.message || 'No details'}`;
      } catch (e) {
        // If JSON parsing fails, get text response
        try {
          const text = await response.text();
          errorDetails += `, Response: ${text.substring(0, 100)}`;
        } catch (textError) {
          errorDetails += ', Failed to read response body';
        }
      }
      
      throw new Error(`API request failed: ${errorDetails}`);
    }

    // Parse successful response
    const { draft } = await response.json();
    return DOMPurify.sanitize(draft, {
      ALLOWED_TAGS: ['p', 'br', 'ol', 'ul', 'li'],
      ALLOWED_ATTR: []
    });
  } catch (error) {
    console.error('Draft generation error:', error);
    
    // Create more specific error messages
    let userMessage;
    if (error.message.includes('Failed to fetch')) {
      userMessage = "Network error. Please check your connection.";
    } else if (error.message.includes('API request failed')) {
      // Handle Netlify Dev timeout specifically
      if (error.message.includes('500') || error.message.includes('timed out')) {
        userMessage = "The request took too long. Please try again or deploy to production.";
      } else {
        userMessage = "Service is temporarily unavailable. Please try again later.";
      }
    } else if (error.message.includes('404')) {
      userMessage = "Server endpoint not found. Please contact support.";
    } else {
      userMessage = "Failed to generate draft. Please try again.";
    }
    
    throw new Error(userMessage);
  }
};