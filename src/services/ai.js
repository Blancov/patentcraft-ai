import DOMPurify from 'dompurify';

const sanitizeInput = (text) => {
  if (!text) return '';
  return text
    .replace(/[^\p{L}\p{N}\s.,;:()\-'"@/\\#%&+=*~<>^{}|_$!?]/gu, '') 
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 2000);
};

export const generatePatentDraft = async (data, onChunkReceived) => {
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
    const workerUrl = import.meta.env.VITE_CF_WORKER_URL;
    console.log('Calling Cloudflare Worker endpoint:', workerUrl);
    
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `As a USPTO patent attorney, generate a patent application draft for a ${sanitizedData.inventionType} in ${sanitizedData.techField}. Key features: ${sanitizedData.keyFeatures}. Include:
1. Claims with USPTO numbering
2. Technical diagrams
3. Physics validation
4. Prior art analysis
5. International IP considerations`
          },
          { 
            role: "user", 
            content: sanitizedData.description.substring(0, 1000) 
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        top_p: 0.9,
        stream: true  // Enable streaming
      })
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

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let draft = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const events = chunk.split('\n\n').filter(Boolean);

      for (const event of events) {
        if (event.includes('data: [DONE]')) break;
        
        if (event.startsWith('data: ')) {
          const data = event.replace('data: ', '');
          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices[0]?.delta?.content || '';
            draft += token;
            
            // Send token to UI as it arrives
            if (onChunkReceived) {
              onChunkReceived(token);
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    }

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