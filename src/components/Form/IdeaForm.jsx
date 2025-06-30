import React, { useState } from 'react';
import { generatePatentDraft } from '../../services/ai';
import { supabase } from '../../services/supabase';
import { logEvent } from '../../utils/analytics';
import ProgressStepper from './ProgressStepper';

const IdeaForm = () => {
  const [idea, setIdea] = useState('');
  const [inventionType, setInventionType] = useState('device');
  const [technicalField, setTechnicalField] = useState('');
  const [keyFeatures, setKeyFeatures] = useState('');
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSubmission, setLastSubmission] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [step, setStep] = useState(1);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setIdea(value);
    setCharCount(value.length);
  };

  const nextStep = () => {
    // Validate before moving to next step
    if (step === 1 && idea.trim().length < 20) {
      setError("Please provide a detailed description (at least 20 characters)");
      return;
    }
    
    setError('');
    setStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setError('');
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Track event
    logEvent('Submission', 'Generate Draft', idea.substring(0, 30));
    
    // Final validation
    const invalidPattern = /[^\p{L}\p{N}\s.,;:()\-'"@/\\#%&+=*~<>^{}|_$!?]/gu;
    if (invalidPattern.test(idea)) {
      setError("Input contains invalid characters. Please remove special symbols except basic punctuation.");
      return;
    }
    
    if (idea.trim().length < 20) {
      setError("Please provide a detailed description (at least 20 characters)");
      return;
    }
    
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
        .insert([{ 
          idea, 
          draft: aiDraft,
          invention_type: inventionType,
          technical_field: technicalField,
          key_features: keyFeatures
        }]);
      
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
      <ProgressStepper currentStep={step} steps={['Describe', 'Details', 'Review']} />
      
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="form-step">
            <h2>Describe Your Invention</h2>
            <textarea
              value={idea}
              onChange={handleInputChange}
              placeholder="Example: 'A smartphone case with integrated solar charger and battery indicator'"
              rows={5}
              disabled={isLoading}
              required
            />
            <div className="char-counter">
              {charCount}/2000 characters
              {charCount >= 2000 && <span className="char-warning"> (Maximum reached)</span>}
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="form-actions">
              <button type="button" onClick={nextStep} className="btn-next">
                Next: Add Details
              </button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="form-step">
            <h2>Additional Details</h2>
            
            <div className="form-group">
              <label htmlFor="inventionType">Invention Type</label>
              <select
                id="inventionType"
                value={inventionType}
                onChange={(e) => setInventionType(e.target.value)}
                className="form-select"
              >
                <option value="device">Device/Apparatus</option>
                <option value="method">Method/Process</option>
                <option value="system">System</option>
                <option value="composition">Chemical Composition</option>
                <option value="software">Software</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="technicalField">Technical Field</label>
              <input
                type="text"
                id="technicalField"
                value={technicalField}
                onChange={(e) => setTechnicalField(e.target.value)}
                placeholder="e.g., Renewable Energy, Biotechnology"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="keyFeatures">Key Innovative Features</label>
              <textarea
                id="keyFeatures"
                value={keyFeatures}
                onChange={(e) => setKeyFeatures(e.target.value)}
                placeholder="Describe the novel aspects of your invention"
                rows={3}
                className="form-textarea"
              />
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={prevStep} className="btn-back">
                Back
              </button>
              <button type="button" onClick={nextStep} className="btn-next">
                Next: Review
              </button>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="form-step">
            <h2>Review and Submit</h2>
            
            <div className="review-section">
              <h3>Your Invention</h3>
              <p>{idea}</p>
            </div>
            
            <div className="review-section">
              <h3>Details</h3>
              <p><strong>Type:</strong> {inventionType}</p>
              <p><strong>Technical Field:</strong> {technicalField || 'Not specified'}</p>
              <p><strong>Key Features:</strong> {keyFeatures || 'Not specified'}</p>
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={prevStep} className="btn-back">
                Back
              </button>
              <button 
                type="submit" 
                disabled={isLoading || !idea.trim() || charCount > 2000}
                className="generate-btn"
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span> Generating Patent Draft...
                  </>
                ) : 'Generate Patent Draft'}
              </button>
            </div>
          </div>
        )}
      </form>

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