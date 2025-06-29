// src/services/ai.js
// Add sanitization helper function
const sanitizeInput = (text) => {
  // Allow letters, numbers, spaces, and common punctuation
  // Preserves non-English characters (Unicode)
  return text
    .replace(/[^\p{L}\p{N}\s.,;:()\-'"@/\\#%&+=*~<>^{}|_$!?]/gu, '') 
    .replace(/\s+/g, ' ')   // Collapse multiple spaces
    .trim()                 // Trim whitespace
    .substring(0, 2000);    // Limit to 2000 characters
};

export const generatePatentDraft = async (description) => {
  // Sanitize input before processing
  const sanitizedDescription = sanitizeInput(description);
  
  // Validate input after sanitization
  if (!sanitizedDescription || sanitizedDescription.length < 10) {
    throw new Error("Input is too short or contains invalid characters after sanitization");
  }

  const API_ENDPOINT = "/api/chat/completions"; // Using Vite proxy
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  
  // Verify API key is configured
  if (!apiKey || apiKey.trim() === "") {
    console.error("DeepSeek API key is not configured");
    return "⚠️ System error: API configuration missing. Please contact support.";
  }

  const payload = {
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: "You are a USPTO-certified patent attorney. Generate professional patent claims in standard USPTO format with proper numbering and dependencies. Always include: 1) A main independent claim, 2) At least 3 dependent claims with specific limitations. Use formal legal language. Format: Claim 1. [Independent claim]. Claim 2. [Dependent claim referring to Claim 1]. Claim 3. [Next dependent claim]."
      },
      {
        role: "user",
        content: `Generate comprehensive patent claims for: ${sanitizedDescription}`
      }
    ],
    temperature: 0.3,
    max_tokens: 2000,
    top_p: 0.9
  };

  let retryCount = 0;
  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds between retries

  while (retryCount <= maxRetries) {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      // Handle rate limits and server errors
      if (response.status === 429 || response.status >= 500) {
        const waitTime = retryDelay * (retryCount + 1);
        console.warn(`Retry ${retryCount+1}/${maxRetries} in ${waitTime/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        retryCount++;
        continue;
      }

      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData?.error?.message || response.statusText;
        throw new Error(`API Error ${response.status}: ${errorMsg}`);
      }

      // Process successful response
      const data = await response.json();
      const claims = data.choices[0]?.message?.content || "";
      
      if (!claims) {
        throw new Error("Empty response from API");
      }
      
      return formatPatentClaims(claims);
      
    } catch (error) {
      console.error(`Attempt ${retryCount+1} failed:`, error);
      
      if (retryCount >= maxRetries) {
        return `⚠️ Service Unavailable: ${error.message}. Please try again later.`;
      }
      
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  return "⚠️ All attempts failed. Please try again later.";
};

// Professional patent claim formatting
const formatPatentClaims = (text) => {
  // Remove any markdown code blocks
  let cleanText = text.replace(/```[\s\S]*?```/g, "");
  
  // Enhance claim formatting
  return cleanText
    .replace(/(Claim \d+\.)/g, "\n\n$1")  // Double space before claims
    .replace(/([a-z])([A-Z])/g, "$1 $2")  // Add space between sentences
    .replace(/(wherein\s)/gi, "\n$1")     // New line for wherein clauses
    .replace(/(characterized in that\s)/gi, "\n$1") // New line for characterization
    .replace(/\.\s([A-Z])/g, ".\n$1")     // New line after periods
    .replace(/([^.])(\n)([a-z])/g, "$1 $3") // Fix broken sentences
    .trim();
};