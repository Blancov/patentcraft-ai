import { useState } from 'react';
import { generatePatentDraft } from '../../services/ai';
import { supabase } from '../../services/supabase';
import { logEvent } from '../../utils/analytics';

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
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center bg-gray-800 p-3 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-primary">Patent Draft Generator</h2>
        <p className="text-muted mt-2">Transform your idea into a professional patent application</p>
      </div>
      
      <ProgressStepper currentStep={step} steps={['Describe', 'Details', 'Review']} />
      
      <form onSubmit={handleSubmit} className="mt-8">
        {step === 1 && (
          <div className="form-step">
            <div className="form-group">
              <label htmlFor="idea" className="block font-medium mb-2">
                Describe Your Invention
              </label>
              <textarea
                id="idea"
                value={idea}
                onChange={handleInputChange}
                placeholder="Example: 'A smartphone case with integrated solar charger and battery indicator'"
                rows={6}
                className="form-textarea w-full"
                disabled={isLoading}
                required
              />
              <div className="char-counter">
                {charCount}/2000 characters
                {charCount >= 2000 && <span className="char-warning ml-2">(Maximum reached)</span>}
              </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-actions justify-end">
              <button 
                type="button" 
                onClick={nextStep}
                className="btn-primary"
                disabled={idea.trim().length < 20}
              >
                Next: Add Details
              </button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="form-step">
            <div className="form-group">
              <label htmlFor="inventionType" className="block font-medium mb-2">
                Invention Type
              </label>
              <select
                id="inventionType"
                value={inventionType}
                onChange={(e) => setInventionType(e.target.value)}
                className="form-select w-full"
              >
                <option value="device">Device/Apparatus</option>
                <option value="method">Method/Process</option>
                <option value="system">System</option>
                <option value="composition">Chemical Composition</option>
                <option value="software">Software</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="technicalField" className="block font-medium mb-2">
                Technical Field
              </label>
              <input
                type="text"
                id="technicalField"
                value={technicalField}
                onChange={(e) => setTechnicalField(e.target.value)}
                placeholder="e.g., Renewable Energy, Biotechnology"
                className="form-input w-full"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="keyFeatures" className="block font-medium mb-2">
                Key Innovative Features
              </label>
              <textarea
                id="keyFeatures"
                value={keyFeatures}
                onChange={(e) => setKeyFeatures(e.target.value)}
                placeholder="Describe the novel aspects of your invention"
                rows={3}
                className="form-textarea w-full"
              />
            </div>
            
            <div className="form-actions justify-between">
              <button type="button" onClick={prevStep} className="btn-outline">
                Back
              </button>
              <button type="button" onClick={nextStep} className="btn-primary">
                Next: Review
              </button>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="form-step">
            <div className="card mb-6">
              <h3 className="font-bold mb-2">Your Invention</h3>
              <p className="whitespace-pre-wrap">{idea}</p>
            </div>
            
            <div className="card mb-6">
              <h3 className="font-bold mb-2">Details</h3>
              <p><strong>Type:</strong> {inventionType}</p>
              <p><strong>Technical Field:</strong> {technicalField || 'Not specified'}</p>
              <p><strong>Key Features:</strong> {keyFeatures || 'Not specified'}</p>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-actions justify-between">
              <button type="button" onClick={prevStep} className="btn-outline">
                Back
              </button>
              <button 
                type="submit" 
                disabled={isLoading || !idea.trim() || charCount > 2000}
                className="btn-primary"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
                    Generating Patent Draft...
                  </span>
                ) : 'Generate Patent Draft'}
              </button>
            </div>
          </div>
        )}
      </form>

      {draft && (
        <div className="draft-preview mt-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Generated Draft</h3>
            <button 
              onClick={() => navigator.clipboard.writeText(draft)}
              className="btn-outline text-sm"
            >
              Copy to Clipboard
            </button>
          </div>
          <pre>{draft}</pre>
        </div>
      )}
    </div>
  );
};

export default IdeaForm;