export const generatePatentDraft = async (description) => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/pszemraj/patent-generator",
      {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${import.meta.env.VITE_HF_TOKEN}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
          inputs: `Generate patent claims for: ${description}`,
          parameters: { 
            max_length: 500,
            return_full_text: false 
          }
        }),
      }
    );
    
    // Handle different response formats
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Handle different response structures
    if (Array.isArray(result) && result.length > 0) {
      // Standard response format
      return result[0].generated_text;
    } else if (result.generated_text) {
      // Alternative format
      return result.generated_text;
    } else if (result.error) {
      // Hugging Face error message
      throw new Error(`Model Error: ${result.error}`);
    } else {
      // Fallback error
      throw new Error("Unexpected response format");
    }
  } catch (error) {
    console.error("AI generation error:", error);
    return `AI Error: ${error.message}`;
  }
};