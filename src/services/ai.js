import DOMPurify from 'dompurify';

const sanitizeInput = (text) => {
  if (!text) return '';
  return text
    .replace(/[^\p{L}\p{N}\s.,;:()\-'"@/\\#%&+=*~<>^{}|_$!?]/gu, '') 
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 2000);
};

// Helper to get API endpoint
const getApiEndpoint = () => {
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:8888/.netlify/functions/generate-draft';
  }
  return '/.netlify/functions/generate-draft';
};

export const generatePatentDraft = async (data) => {
  const sanitizedData = {
    description: sanitizeInput(data.description),
    inventionType: sanitizeInput(data.inventionType) || "device",
    techField: sanitizeInput(data.techField) || "Technology Field",
    keyFeatures: sanitizeInput(data.keyFeatures) || "Key features not specified"
  };
  
  if (!sanitizedData.description || sanitizedData.description.length < 10) {
    throw new Error("Please provide a detailed description (at least 10 characters)");
  }

  try {
    const endpoint = getApiEndpoint();
    console.log('Calling API endpoint:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sanitizedData)
    });

    if (!response.ok) {
      let errorDetails = `Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetails += `, Message: ${errorData.error || errorData.message || 'No details'}`;
      } catch (e) {
        const text = await response.text();
        errorDetails += `, Response: ${text.substring(0, 100)}`;
      }
      throw new Error(`API request failed: ${errorDetails}`);
    }

    const { draft } = await response.json();
    return DOMPurify.sanitize(draft, {
      ALLOWED_TAGS: ['p', 'br', 'ol', 'ul', 'li'],
      ALLOWED_ATTR: []
    });
  } catch (error) {
    console.error('Draft generation error:', error);
    
    let userMessage;
    if (error.message.includes('Failed to fetch')) {
      userMessage = "Network error. Please check your connection.";
    } else if (error.message.includes('504')) {
      userMessage = "The request timed out. Please try again with a shorter description.";
    } else if (error.message.includes('500') || error.message.includes('timed out')) {
      userMessage = "The request took too long. Please try again or simplify your description.";
    } else if (error.message.includes('404')) {
      userMessage = "Server endpoint not found. Please contact support.";
    } else {
      userMessage = "Failed to generate draft. Please try again.";
    }
    
    throw new Error(userMessage);
  }
};