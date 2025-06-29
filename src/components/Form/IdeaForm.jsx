import React, { useState } from 'react';
import { generatePatentDraft } from '../../services/ai';
import { supabase } from '../../services/supabase';
import { logEvent } from '../../utils/analytics';

const IdeaForm = () => {
  const [idea, setIdea] = useState('');
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSubmission, setLastSubmission] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Track event
    logEvent('Submission', 'Generate Draft', idea.substring(0, 30));
    
    // Input validation
    if (idea.trim().length < 20) {
      setError("Please provide a detailed description (at least 20 characters)");
      return;
    }
    
    // Rate limiting
    if (Date.now() - lastSubmission < 30000) {
      setError("Please wait 30 seconds between submissions");
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Generate draft
      const aiDraft = await generatePatentDraft(idea);
      setDraft(aiDraft);
      
      // Save to database
      const { data, error: dbError } = await supabase
        .from('submissions')
        .insert([{ idea, draft: aiDraft }]);
      
      if (dbError) {
        console.error('Supabase error details:', dbError);
        throw new Error(`Database save failed: ${dbError.message}`);
      }
      
      console.log('Data saved successfully:', data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setLastSubmission(Date.now());
    }
  };

  return (
    <div className="idea-form">
      <form onSubmit={handleSubmit}>
        <h2>Describe Your Invention</h2>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Example: 'A smartphone case with integrated solar charger and battery indicator'"
          rows={5}
          disabled={isLoading}
          required
        />
        
        <button 
          type="submit" 
          disabled={isLoading || !idea.trim()}
          className="generate-btn"
        >
          {isLoading ? (
            <>
              <span className="spinner"></span> Generating Patent Draft...
            </>
          ) : 'Generate Patent Draft'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {draft && (
        <div className="draft-preview">
          <h3>Generated Draft:</h3>
          <pre>{draft}</pre>
          <button 
            onClick={() => navigator.clipboard.writeText(draft)}
            className="copy-btn"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
};

export default IdeaForm;