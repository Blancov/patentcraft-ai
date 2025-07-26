import { useState, useRef, useContext } from "react";
import { generatePatentDraft } from "../../services/ai";
import { supabase } from "../../services/supabase";
import { logEvent } from "../../utils/analytics";
import ProgressStepper from "./ProgressStepper";
import { ThemeContext } from "../../context/ThemeContext";

// Theme-aware error colors
const getErrorColors = (darkMode) => ({
  color: darkMode ? "#FCA5A5" : "#B91C1C",
  bg: darkMode ? "#2A1A1A" : "#F9E5E5",
  border: darkMode ? "#7F1D1D" : "#F3BABA"
});

const ErrorMessage = ({ error, errorRef, darkMode }) => {
  if (!error) return null;
  const { color, bg, border } = getErrorColors(darkMode);
  return (
    <span
      ref={errorRef}
      aria-live="assertive"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem",
        marginTop: "0.25rem",
        marginBottom: "0.5rem",
        fontSize: "0.95rem",
        fontWeight: 500,
        borderRadius: "0.75rem",
        color,
        background: bg,
        border: `1px solid ${border}`,
        boxShadow: darkMode
          ? "0 1px 2px rgba(252,165,165,0.03)"
          : "0 1px 2px rgba(185,28,28,0.03)"
      }}
    >
      <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
      </svg>
      <span>{error}</span>
    </span>
  );
};

const DraftPreview = ({ draft, darkMode }) => (
  <div style={{ marginTop: "3.5rem" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
      <h3 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Generated Draft</h3>
      <button
        onClick={() => navigator.clipboard.writeText(draft)}
        style={{
          border: "1.5px solid #3b82f6",
          padding: "0.5rem 1rem",
          borderRadius: "9999px",
          fontSize: "0.95rem",
          background: "transparent",
          color: "#3b82f6",
          fontWeight: 500,
          cursor: "pointer"
        }}
        aria-label="Copy generated draft to clipboard"
      >
        Copy to Clipboard
      </button>
    </div>
    <pre style={{
      background: darkMode ? "#1f2937" : "#fff",
      borderRadius: "1rem",
      padding: "1.5rem",
      fontFamily: "monospace",
      whiteSpace: "pre-wrap",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
    }}>
      {draft}
    </pre>
  </div>
);

const technicalFields = [
  "Renewable Energy",
  "Biotechnology",
  "Electronics",
  "Mechanical Engineering",
  "Medical Devices",
  "Software",
  "Chemistry",
  "Other",
];

const IdeaForm = () => {
  const { darkMode } = useContext(ThemeContext);
  const [formState, setFormState] = useState({
    idea: "",
    inventionType: "",
    technicalField: "",
    customTechnicalField: "",
    showCustomField: false,
    keyFeatures: "",
    draft: "",
    isLoading: false,
    error: "",
    fieldErrors: {},
    lastSubmission: 0,
    charCount: 0,
    step: 1
  });

  const errorRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  // Update specific form state
  const updateFormState = (updates) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateFormState({
      [name]: value,
      fieldErrors: { ...formState.fieldErrors, [name]: "" },
      error: ""
    });

    if (name === "idea") {
      updateFormState({ charCount: value.length });
    }
  };

  const handleTechnicalFieldChange = (e) => {
    const value = e.target.value;
    if (value === "Other") {
      updateFormState({
        showCustomField: true,
        technicalField: ""
      });
    } else {
      updateFormState({
        showCustomField: false,
        technicalField: value,
        customTechnicalField: ""
      });
    }
  };

  // Step navigation
  const nextStep = () => {
    const errors = validateStep();
    if (Object.keys(errors).length > 0) {
      updateFormState({
        fieldErrors: errors,
        error: Object.values(errors)[0]
      });
      errorRef.current?.focus();
      return;
    }
    updateFormState({ error: "", step: Math.min(formState.step + 1, 3) });
  };

  const prevStep = () => {
    updateFormState({ error: "", fieldErrors: {}, step: Math.max(formState.step - 1, 1) });
  };

  // Form validation
  const validateStep = () => {
    const errors = {};
    const { idea, inventionType, technicalField, customTechnicalField, showCustomField, keyFeatures } = formState;

    if (formState.step === 1) {
      if (!idea.trim()) errors.idea = "Please describe your invention";
      else if (idea.trim().length < 20) errors.idea = "Description must be at least 20 characters";
    }

    if (formState.step === 2) {
      if (!inventionType) errors.inventionType = "Select an invention type";

      const techFieldValid = showCustomField ?
        customTechnicalField.trim() :
        technicalField.trim();
      if (!techFieldValid) errors.technicalField = "Specify the technical field";

      if (!keyFeatures.trim()) errors.keyFeatures = "Describe key features";
      else if (keyFeatures.trim().length < 10) errors.keyFeatures = "Key features must be at least 10 characters";
    }

    return errors;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateStep();
    if (Object.keys(errors).length > 0) {
      updateFormState({ fieldErrors: errors, error: Object.values(errors)[0] });
      errorRef.current?.focus();
      return;
    }

    if (formState.charCount > 2000) {
      updateFormState({ error: "Description exceeds maximum length (2000 characters)" });
      return;
    }

    if (Date.now() - formState.lastSubmission < 30000) {
      updateFormState({ error: "Please wait 30 seconds between submissions" });
      return;
    }

    updateFormState({ isLoading: true, error: "" });

    try {
      logEvent("Submission", "Generate Draft", formState.idea.substring(0, 30));
      
      // Prepare data object with all necessary fields
      const draftData = {
        description: formState.idea,
        inventionType: formState.inventionType,
        techField: formState.showCustomField 
          ? formState.customTechnicalField 
          : formState.technicalField,
        keyFeatures: formState.keyFeatures
      };
      
      const draft = await generatePatentDraft(draftData);
      updateFormState({ draft });

      const { error: dbError } = await supabase.from("submissions").insert([{
        idea: formState.idea,
        draft,
        invention_type: formState.inventionType,
        technical_field: formState.showCustomField ?
          formState.customTechnicalField : formState.technicalField,
        key_features: formState.keyFeatures
      }]);

      if (dbError) throw new Error(`Database save failed: ${dbError.message}`);

      updateFormState({ lastSubmission: Date.now() });
    } catch (err) {
      updateFormState({ error: err.message });
      errorRef.current?.focus();
    } finally {
      updateFormState({ isLoading: false });
    }
  };

  // CSS classes for styling
  const cardClasses = {
    maxWidth: "480px",
    margin: "0 auto",
    padding: "2rem",
    borderRadius: "1.25rem",
    boxShadow: hovered ? "0 8px 32px rgba(59,130,246,0.12)" : "0 4px 16px rgba(59,130,246,0.08)",
    background: darkMode ? "#1f2937" : "#fff",
    color: darkMode ? "#f3f4f6" : "#22223b",
    transition: "box-shadow 0.3s, transform 0.3s",
    transform: hovered ? "translateY(-4px)" : "none"
  };

  const titleStyles = {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    color: darkMode ? "#60a5fa" : "#3b82f6"
  };

  const subtitleStyles = {
    marginBottom: "2rem",
    color: darkMode ? "#d1d5db" : "#4b5563"
  };

  const labelStyles = {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: 500,
    color: darkMode ? "#d1d5db" : "#22223b"
  };

  const inputStyles = {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "1rem",
    border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
    background: darkMode ? "#374151" : "#f9fafb",
    color: darkMode ? "#f3f4f6" : "#22223b",
    fontSize: "1rem",
    marginBottom: "0.5rem",
    outline: "none",
    transition: "border 0.3s, box-shadow 0.3s"
  };

  const buttonPrimaryStyles = {
    padding: "0.75rem 1.5rem",
    borderRadius: "9999px",
    fontWeight: 500,
    background: darkMode ? "#3b82f6" : "#2563eb",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background 0.3s"
  };

  const buttonOutlineStyles = {
    padding: "0.75rem 1.5rem",
    borderRadius: "9999px",
    fontWeight: 500,
    background: "transparent",
    color: darkMode ? "#f3f4f6" : "#22223b",
    border: `1.5px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background 0.3s"
  };

  const cardPreviewStyles = {
    padding: "1.5rem",
    borderRadius: "1.25rem",
    marginBottom: "1.5rem",
    background: darkMode ? "#374151" : "#f9fafb"
  };

  return (
    <div style={{ paddingTop: "3.5rem", paddingBottom: "3.5rem" }}>
      <div
        style={cardClasses}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }} aria-hidden="true">
            <div style={{
              padding: "1.5rem",
              borderRadius: "9999px",
              background: darkMode ? "#374151" : "#f3f4f6"
            }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={56}
                height={56}
                fill="none"
                viewBox="0 0 24 24"
                stroke={darkMode ? "#60a5fa" : "#3b82f6"}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
          </div>
          <h2 style={titleStyles}>Patent Draft Generator</h2>
          <p style={subtitleStyles}>
            Effortlessly turn your innovation into a patent-ready document with AI.
          </p>
        </div>

        <ProgressStepper
          currentStep={formState.step}
          steps={["Describe", "Details", "Review"]}
          darkMode={darkMode}
        />

        <form onSubmit={handleSubmit}>
          {/* Step 1: Describe */}
          {formState.step === 1 && (
            <div style={{ marginTop: "2rem" }}>
              <div>
                <label htmlFor="idea" style={labelStyles}>
                  Describe Your Invention
                </label>
                <textarea
                  id="idea"
                  name="idea"
                  value={formState.idea}
                  onChange={handleInputChange}
                  placeholder="Example: 'A pocket-sized device that instantly translates spoken language in real time.'"
                  rows={6}
                  style={{ ...inputStyles, minHeight: "150px", resize: "vertical" }}
                  disabled={formState.isLoading}
                  aria-describedby="idea-desc"
                  maxLength={2000}
                />
                <div id="idea-desc" style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.95rem" }}>
                  <span>{formState.charCount}/2000 characters</span>
                  {formState.charCount >= 1900 && (
                    <span style={{ color: "#f59e0b", fontWeight: 500 }}>
                      (Almost at limit!)
                    </span>
                  )}
                </div>

                {formState.fieldErrors.idea && (
                  <ErrorMessage
                    error={formState.fieldErrors.idea}
                    errorRef={errorRef}
                    darkMode={darkMode}
                  />
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "1rem" }}>
                <button
                  type="button"
                  onClick={nextStep}
                  style={buttonPrimaryStyles}
                  disabled={formState.isLoading}
                >
                  Next: Add Details
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {formState.step === 2 && (
            <div style={{ marginTop: "2rem" }}>
              <div>
                <label htmlFor="inventionType" style={labelStyles}>
                  Invention Type
                </label>
                <select
                  id="inventionType"
                  name="inventionType"
                  value={formState.inventionType}
                  onChange={handleInputChange}
                  style={inputStyles}
                >
                  <option value="">Select type...</option>
                  <option value="device">Device/Apparatus</option>
                  <option value="method">Method/Process</option>
                  <option value="system">System</option>
                  <option value="composition">Chemical Composition</option>
                  <option value="software">Software</option>
                </select>
                {formState.fieldErrors.inventionType && (
                  <ErrorMessage
                    error={formState.fieldErrors.inventionType}
                    errorRef={errorRef}
                    darkMode={darkMode}
                  />
                )}
              </div>

              <div>
                <label htmlFor="technicalField" style={labelStyles}>
                  Technical Field
                </label>
                <select
                  id="technicalField"
                  value={formState.showCustomField ? "Other" : formState.technicalField}
                  onChange={handleTechnicalFieldChange}
                  style={inputStyles}
                >
                  <option value="">Select field...</option>
                  {technicalFields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>

                {formState.showCustomField && (
                  <input
                    type="text"
                    id="customTechnicalField"
                    name="customTechnicalField"
                    value={formState.customTechnicalField}
                    onChange={handleInputChange}
                    placeholder="Enter technical field"
                    style={{ ...inputStyles, marginTop: "0.75rem" }}
                  />
                )}

                {formState.fieldErrors.technicalField && (
                  <ErrorMessage
                    error={formState.fieldErrors.technicalField}
                    errorRef={errorRef}
                    darkMode={darkMode}
                  />
                )}
              </div>

              <div>
                <label htmlFor="keyFeatures" style={labelStyles}>
                  Key Innovative Features
                </label>
                <textarea
                  id="keyFeatures"
                  name="keyFeatures"
                  value={formState.keyFeatures}
                  onChange={handleInputChange}
                  placeholder="Describe the novel aspects of your invention"
                  rows={4}
                  style={{ ...inputStyles, minHeight: "100px", resize: "vertical" }}
                />
                {formState.fieldErrors.keyFeatures && (
                  <ErrorMessage
                    error={formState.fieldErrors.keyFeatures}
                    errorRef={errorRef}
                    darkMode={darkMode}
                  />
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "1rem" }}>
                <button
                  type="button"
                  onClick={prevStep}
                  style={buttonOutlineStyles}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  style={buttonPrimaryStyles}
                  disabled={formState.isLoading}
                >
                  Next: Review
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {formState.step === 3 && (
            <div style={{ marginTop: "2rem" }}>
              {formState.error && (
                <ErrorMessage
                  error={formState.error}
                  errorRef={errorRef}
                  darkMode={darkMode}
                />
              )}

              <div style={cardPreviewStyles}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>Your Invention</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>
                  {formState.idea}
                </p>
              </div>

              <div style={cardPreviewStyles}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>Details</h3>
                <p><strong>Type:</strong> {formState.inventionType}</p>
                <p style={{ marginTop: "0.5rem" }}>
                  <strong>Technical Field:</strong>{" "}
                  {formState.showCustomField
                    ? formState.customTechnicalField || "Not specified"
                    : formState.technicalField || "Not specified"}
                </p>
                <p style={{ marginTop: "0.5rem" }}>
                  <strong>Key Features:</strong> {formState.keyFeatures || "Not specified"}
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "1rem" }}>
                <button
                  type="button"
                  onClick={prevStep}
                  style={buttonOutlineStyles}
                >
                  Back
                </button>
                <button
                  type="submit"
                  style={buttonPrimaryStyles}
                  disabled={
                    formState.isLoading ||
                    !formState.idea.trim() ||
                    formState.charCount > 2000 ||
                    !formState.inventionType ||
                    (!formState.showCustomField && !formState.technicalField.trim()) ||
                    (formState.showCustomField && !formState.customTechnicalField.trim()) ||
                    !formState.keyFeatures.trim() ||
                    formState.keyFeatures.trim().length < 10
                  }
                >
                  {formState.isLoading ? (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <span style={{
                        display: "inline-block",
                        animation: "spin 1s linear infinite",
                        borderRadius: "50%",
                        height: "20px",
                        width: "20px",
                        borderBottom: "2px solid #fff",
                        marginRight: "0.5rem"
                      }}></span>
                      Generating Patent Draft...
                    </span>
                  ) : (
                    "Generate Patent Draft"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Draft Preview */}
        {formState.draft && (
          <DraftPreview
            draft={formState.draft}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  );
};

export default IdeaForm;