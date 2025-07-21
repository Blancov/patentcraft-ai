import React, { useState, useRef } from "react";
import { generatePatentDraft } from "../../services/ai";
import { supabase } from "../../services/supabase";
import { logEvent } from "../../utils/analytics";
import ProgressStepper from "./ProgressStepper";

// Error colors for light/dark mode
const errorColorLight = "#B91C1C";
const errorBgLight = "#F9E5E5";
const errorBorderLight = "#F3BABA";
const errorColorDark = "#FCA5A5";
const errorBgDark = "#2A1A1A";
const errorBorderDark = "#7F1D1D";

// Utility to detect dark mode (simple, for demonstration)
const useIsDarkMode = () => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
};

// Error message component, box width fits text length
const ErrorMessage = ({ error, errorRef }) => {
  const isDark = useIsDarkMode();
  const color = isDark ? errorColorDark : errorColorLight;
  const bg = isDark ? errorBgDark : errorBgLight;
  const border = isDark ? errorBorderDark : errorBorderLight;

  if (!error) return null;

  return (
    <span
      tabIndex={-1}
      ref={errorRef}
      aria-live="assertive"
      style={{
        color,
        background: bg,
        borderRadius: 4,
        border: `1px solid ${border}`,
        padding: "2px 8px",
        marginTop: "0.15em",
        marginBottom: "0.2em",
        fontSize: "0.93rem",
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        boxShadow: isDark
          ? "0 1px 2px rgba(252,165,165,0.03)"
          : "0 1px 2px rgba(185,28,28,0.03)",
        fontFamily: "Inter, Arial, sans-serif",
        fontWeight: 500,
        letterSpacing: "0.01em",
        minHeight: "1.2em",
        lineHeight: "1.1",
        whiteSpace: "nowrap",
        width: "fit-content",
        maxWidth: "100%",
        verticalAlign: "middle",
        transition: "background 0.3s, color 0.3s, border 0.3s"
      }}
    >
      <svg
        style={{
          width: 13,
          height: 13,
          color,
          marginTop: 0,
          flexShrink: 0,
        }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01"
          stroke={color}
        />
      </svg>
      <span style={{ paddingRight: 1 }}>{error}</span>
    </span>
  );
};

const DraftPreview = ({ draft }) => (
  <div className="draft-preview" style={{ marginTop: 56, transition: "background 0.3s, color 0.3s, border 0.3s" }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        transition: "background 0.3s, color 0.3s, border 0.3s"
      }}
    >
      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, transition: "color 0.3s" }}>Generated Draft</h3>
      <button
        onClick={() => navigator.clipboard.writeText(draft)}
        className="btn-outline"
        style={{
          fontSize: "1rem",
          borderRadius: "1rem",
          padding: "0.5em 1.2em",
          transition: "background 0.3s, color 0.3s, border 0.3s"
        }}
        aria-label="Copy generated draft to clipboard"
      >
        Copy to Clipboard
      </button>
    </div>
    <pre
      style={{
        background: "var(--bg)",
        borderRadius: "1.25rem",
        padding: 24,
        fontSize: "1.1rem",
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        boxShadow: "0 2px 12px rgba(60,60,60,0.07)",
        transition: "background 0.3s, color 0.3s, border 0.3s"
      }}
    >
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
  const [idea, setIdea] = useState("");
  const [inventionType, setInventionType] = useState("");
  const [technicalField, setTechnicalField] = useState("");
  const [customTechnicalField, setCustomTechnicalField] = useState("");
  const [showCustomField, setShowCustomField] = useState(false);
  const [keyFeatures, setKeyFeatures] = useState("");
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [lastSubmission, setLastSubmission] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [step, setStep] = useState(1);

  const errorRef = useRef(null);

  // Input change handler
  const handleInputChange = (e) => {
    const value = e.target.value;
    setIdea(value);
    setCharCount(value.length);
    setFieldErrors((prev) => ({ ...prev, idea: "" }));
    setError("");
  };

  // Step navigation with validation
  const nextStep = () => {
    let errors = {};
    if (step === 1) {
      if (!idea.trim()) {
        errors.idea = "Please describe your invention.";
      } else if (idea.trim().length < 20) {
        errors.idea = "Description must be at least 20 characters.";
      }
    }
    if (step === 2) {
      if (!inventionType) {
        errors.inventionType = "Select an invention type.";
      }
      if (
        (!showCustomField && !technicalField.trim()) ||
        (showCustomField && !customTechnicalField.trim())
      ) {
        errors.technicalField = "Specify the technical field.";
      }
      if (!keyFeatures.trim()) {
        errors.keyFeatures = "Describe the key innovative features.";
      } else if (keyFeatures.trim().length < 10) {
        errors.keyFeatures = "Key features must be at least 10 characters.";
      }
    }
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      errorRef.current?.focus();
      return;
    }
    setError("");
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setError("");
    setFieldErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    let errors = {};
    if (!idea.trim()) {
      errors.idea = "Please describe your invention.";
    } else if (idea.trim().length < 20) {
      errors.idea = "Description must be at least 20 characters.";
    }
    if (!inventionType) {
      errors.inventionType = "Select an invention type.";
    }
    if (
      (!showCustomField && !technicalField.trim()) ||
      (showCustomField && !customTechnicalField.trim())
    ) {
      errors.technicalField = "Specify the technical field.";
    }
    if (!keyFeatures.trim()) {
      errors.keyFeatures = "Describe the key innovative features.";
    } else if (keyFeatures.trim().length < 10) {
      errors.keyFeatures = "Key features must be at least 10 characters.";
    }
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      errorRef.current?.focus();
      return;
    }

    if (charCount > 2000) {
      setError("Description exceeds maximum length (2000 characters)");
      errorRef.current?.focus();
      return;
    }

    if (Date.now() - lastSubmission < 30000) {
      setError("Please wait 30 seconds between submissions");
      errorRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      logEvent("Submission", "Generate Draft", idea.substring(0, 30));
      const aiDraft = await generatePatentDraft(idea);
      setDraft(aiDraft);

      const { error: dbError } = await supabase.from("submissions").insert([
        {
          idea,
          draft: aiDraft,
          invention_type: inventionType,
          technical_field: showCustomField
            ? customTechnicalField
            : technicalField,
          key_features: keyFeatures,
        },
      ]);

      if (dbError) {
        throw new Error(`Database save failed: ${dbError.message}`);
      }
    } catch (err) {
      setError(err.message);
      errorRef.current?.focus();
    } finally {
      setIsLoading(false);
      setLastSubmission(Date.now());
    }
  };

  // Hover effect handlers for the container
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        paddingTop: "3.5rem",
        paddingBottom: "3.5rem",
        background: "transparent",
        transition: "background 0.3s, color 0.3s, border 0.3s"
      }}
    >
      <div
        className="ideaform-container"
        style={{
          maxWidth: 420,
          margin: "0 auto",
          background: "var(--card)",
          borderRadius: "1.25rem",
          boxShadow: hovered
            ? "0 4px 24px rgba(60,60,60,0.13)"
            : "0 2px 12px rgba(60,60,60,0.07)",
          padding: "2.5rem 2rem",
          transition: "background 0.3s, color 0.3s, border 0.3s, box-shadow 0.3s, transform 0.3s",
          transform: hovered ? "translateY(-2px)" : "none"
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="idea-form" aria-live="polite" style={{ transition: "background 0.3s, color 0.3s, border 0.3s" }}>
          {/* Header */}
          <div className="text-center mb-12" style={{ transition: "background 0.3s, color 0.3s, border 0.3s" }}>
            <div
              className="flex-center bg-card p-6 rounded-full mb-6"
              aria-hidden="true"
              style={{
                background: "var(--card)",
                transition: "background 0.3s, color 0.3s, border 0.3s, box-shadow 0.3s, transform 0.3s"
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon-large"
                style={{ color: "var(--primary)", width: 56, height: 56 }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <h2 className="ideaform-title" style={{ color: "var(--primary)", transition: "color 0.3s" }}>
              Patent Draft Generator
            </h2>
            <p
              className="ideaform-subtitle"
              style={{ color: "var(--text-light)", transition: "color 0.3s" }}
            >
              Effortlessly turn your innovation into a patent-ready document with AI.
            </p>
          </div>

          {/* Progress Stepper */}
          <ProgressStepper currentStep={step} steps={["Describe", "Details", "Review"]} />

          {/* Main Form */}
          <form
            onSubmit={handleSubmit}
            className="ideaform-form"
            aria-describedby={error ? "form-error" : undefined}
          >
            {/* Step 1: Describe */}
            {step === 1 && (
              <div className="form-step">
                <div className="form-group">
                  <label htmlFor="idea" className="form-label">
                    Describe Your Invention
                  </label>
                  <textarea
                    id="idea"
                    value={idea}
                    onChange={handleInputChange}
                    placeholder="Example: 'A pocket-sized device that instantly translates spoken language in real time.'"
                    rows={8}
                    className="form-textarea"
                    disabled={isLoading}
                    required
                    aria-required="true"
                    aria-describedby="idea-desc"
                    maxLength={2000}
                    style={{
                      width: "100%",
                      maxWidth: "600px",
                      margin: "0 auto",
                      borderRadius: "1.25rem",
                      border: fieldErrors.idea
                        ? `1.5px solid ${errorColorLight}`
                        : "1px solid var(--border)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontSize: "1.1rem",
                      padding: "1.25rem",
                      boxShadow: "0 2px 12px rgba(60,60,60,0.07)",
                      transition: "background 0.3s, color 0.3s, border 0.3s"
                    }}
                  />
                  <div
                    id="idea-desc"
                    className="char-counter"
                    style={{ color: "var(--text-light)", marginTop: 6, transition: "color 0.3s" }}
                  >
                    <span>{charCount}/2000 characters</span>
                    {charCount >= 1900 && (
                      <span
                        className="char-warning"
                        style={{
                          color: "var(--warning)",
                          fontWeight: 600,
                          marginLeft: 8,
                          transition: "color 0.3s"
                        }}
                      >
                        (Almost at limit!)
                      </span>
                    )}
                  </div>
                  {/* Error below field */}
                  {fieldErrors.idea && (
                    <ErrorMessage error={fieldErrors.idea} errorRef={errorRef} />
                  )}
                  {/* Step-level error (e.g. API/network) below all fields */}
                  {!fieldErrors.idea && error && (
                    <ErrorMessage error={error} errorRef={errorRef} />
                  )}
                </div>
                <div
                  className="form-actions"
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    paddingTop: 16,
                    transition: "background 0.3s, color 0.3s, border 0.3s"
                  }}
                >
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary"
                    style={{
                      fontSize: "1.1rem",
                      borderRadius: "1rem",
                      padding: "0.9em 2em",
                      boxShadow: "0 2px 8px rgba(60,60,60,0.07)",
                      transition: "background 0.3s, color 0.3s, border 0.3s"
                    }}
                    disabled={isLoading}
                    aria-disabled={isLoading}
                  >
                    Next: Add Details
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <div className="form-step">
                <div className="form-group">
                  <label htmlFor="inventionType" className="form-label">
                    Invention Type
                  </label>
                  <select
                    id="inventionType"
                    value={inventionType}
                    onChange={(e) => setInventionType(e.target.value)}
                    className="form-select"
                    aria-required="true"
                    style={{
                      width: "100%",
                      borderRadius: "1rem",
                      border: fieldErrors.inventionType
                        ? `1.5px solid ${errorColorLight}`
                        : "1px solid var(--border)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontSize: "1rem",
                      padding: "0.8em",
                      boxShadow: "0 1px 4px rgba(60,60,60,0.04)",
                      transition: "background 0.3s, color 0.3s, border 0.3s"
                    }}
                  >
                    <option value="">Select type...</option>
                    <option value="device">Device/Apparatus</option>
                    <option value="method">Method/Process</option>
                    <option value="system">System</option>
                    <option value="composition">Chemical Composition</option>
                    <option value="software">Software</option>
                  </select>
                  {/* Error below field */}
                  {fieldErrors.inventionType && (
                    <ErrorMessage error={fieldErrors.inventionType} errorRef={errorRef} />
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="technicalField" className="form-label">
                    Technical Field
                  </label>
                  <select
                    id="technicalField"
                    value={showCustomField ? "Other" : technicalField}
                    onChange={(e) => {
                      if (e.target.value === "Other") {
                        setShowCustomField(true);
                        setTechnicalField("");
                      } else {
                        setShowCustomField(false);
                        setTechnicalField(e.target.value);
                      }
                    }}
                    className="form-select"
                    aria-required="true"
                    style={{
                      width: "100%",
                      borderRadius: "1rem",
                      border: fieldErrors.technicalField
                        ? `1.5px solid ${errorColorLight}`
                        : "1px solid var(--border)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontSize: "1rem",
                      padding: "0.8em",
                      boxShadow: "0 1px 4px rgba(60,60,60,0.04)",
                      transition: "background 0.3s, color 0.3s, border 0.3s",
                      marginBottom: showCustomField ? 8 : 0
                    }}
                  >
                    <option value="">Select field...</option>
                    {technicalFields.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                  {showCustomField && (
                    <input
                      type="text"
                      id="customTechnicalField"
                      value={customTechnicalField}
                      onChange={(e) => setCustomTechnicalField(e.target.value)}
                      placeholder="Enter technical field"
                      className="form-input"
                      aria-required="true"
                      style={{
                        width: "100%",
                        borderRadius: "1rem",
                        border: fieldErrors.technicalField
                          ? `1.5px solid ${errorColorLight}`
                          : "1px solid var(--border)",
                        background: "var(--bg)",
                        color: "var(--text)",
                        fontSize: "1rem",
                        padding: "0.8em",
                        boxShadow: "0 1px 4px rgba(60,60,60,0.04)",
                        transition: "background 0.3s, color 0.3s, border 0.3s",
                        marginTop: 8
                      }}
                    />
                  )}
                  {/* Error below field */}
                  {fieldErrors.technicalField && (
                    <ErrorMessage error={fieldErrors.technicalField} errorRef={errorRef} />
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="keyFeatures" className="form-label">
                    Key Innovative Features
                  </label>
                  <textarea
                    id="keyFeatures"
                    value={keyFeatures}
                    onChange={(e) => setKeyFeatures(e.target.value)}
                    placeholder="Describe the novel aspects of your invention"
                    rows={5}
                    className="form-textarea"
                    aria-required="true"
                    style={{
                      width: "100%",
                      borderRadius: "1rem",
                      border: fieldErrors.keyFeatures
                        ? `1.5px solid ${errorColorLight}`
                        : "1px solid var(--border)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontSize: "1rem",
                      padding: "0.8em",
                      boxShadow: "0 1px 4px rgba(60,60,60,0.04)",
                      transition: "background 0.3s, color 0.3s, border 0.3s",
                      resize: "vertical"
                    }}
                  />
                  {/* Error below field */}
                  {fieldErrors.keyFeatures && (
                    <ErrorMessage error={fieldErrors.keyFeatures} errorRef={errorRef} />
                  )}
                </div>
                {/* Step-level error (e.g. API/network) below all fields */}
                {!fieldErrors.inventionType &&
                  !fieldErrors.technicalField &&
                  !fieldErrors.keyFeatures &&
                  error && (
                    <ErrorMessage error={error} errorRef={errorRef} />
                  )}
                <div
                  className="form-actions"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: 16,
                    transition: "background 0.3s, color 0.3s, border 0.3s"
                  }}
                >
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-outline"
                    style={{
                      fontSize: "1.1rem",
                      borderRadius: "1rem",
                      padding: "0.9em 2em",
                      transition: "background 0.3s, color 0.3s, border 0.3s"
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary"
                    style={{
                      fontSize: "1.1rem",
                      borderRadius: "1rem",
                      padding: "0.9em 2em",
                      transition: "background 0.3s, color 0.3s, border 0.3s"
                    }}
                    disabled={isLoading}
                    aria-disabled={isLoading}
                  >
                    Next: Review
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {step === 3 && (
              <div className="form-step">
                {error && <ErrorMessage error={error} errorRef={errorRef} />}
                <div
                  className="card"
                  style={{
                    marginBottom: 32,
                    padding: 24,
                    borderRadius: "1.25rem",
                    boxShadow: "0 2px 12px rgba(60,60,60,0.07)",
                    background: "var(--card)",
                    transition: "background 0.3s, color 0.3s, border 0.3s"
                  }}
                >
                  <h3
                    className="form-label"
                    style={{
                      fontWeight: 700,
                      fontSize: "1.2rem",
                      marginBottom: 8,
                      transition: "color 0.3s"
                    }}
                  >
                    Your Invention
                  </h3>
                  <p style={{ whiteSpace: "pre-wrap", fontSize: "1.1rem", transition: "color 0.3s" }}>
                    {idea}
                  </p>
                </div>
                <div
                  className="card"
                  style={{
                    marginBottom: 32,
                    padding: 24,
                    borderRadius: "1.25rem",
                    boxShadow: "0 2px 12px rgba(60,60,60,0.07)",
                    background: "var(--card)",
                    transition: "background 0.3s, color 0.3s, border 0.3s"
                  }}
                >
                  <h3
                    className="form-label"
                    style={{
                      fontWeight: 700,
                      fontSize: "1.2rem",
                      marginBottom: 8,
                      transition: "color 0.3s"
                    }}
                  >
                    Details
                  </h3>
                  <p style={{ fontSize: "1.1rem", transition: "color 0.3s" }}>
                    <strong>Type:</strong> {inventionType}
                  </p>
                  <p style={{ fontSize: "1.1rem", transition: "color 0.3s" }}>
                    <strong>Technical Field:</strong>{" "}
                    {showCustomField
                      ? customTechnicalField || "Not specified"
                      : technicalField || "Not specified"}
                  </p>
                  <p style={{ fontSize: "1.1rem", transition: "color 0.3s" }}>
                    <strong>Key Features:</strong> {keyFeatures || "Not specified"}
                  </p>
                </div>
                <div
                  className="form-actions"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: 16,
                    transition: "background 0.3s, color 0.3s, border 0.3s"
                  }}
                >
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-outline"
                    style={{
                      fontSize: "1.1rem",
                      borderRadius: "1rem",
                      padding: "0.9em 2em",
                      transition: "background 0.3s, color 0.3s, border 0.3s"
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      !idea.trim() ||
                      charCount > 2000 ||
                      !inventionType ||
                      (!showCustomField && !technicalField.trim()) ||
                      (showCustomField && !customTechnicalField.trim()) ||
                      !keyFeatures.trim() ||
                      keyFeatures.trim().length < 10
                    }
                    className="btn-primary"
                    style={{
                      fontSize: "1.1rem",
                      borderRadius: "1rem",
                      padding: "0.9em 2em",
                      transition: "background 0.3s, color 0.3s, border 0.3s"
                    }}
                    aria-disabled={
                      isLoading ||
                      !idea.trim() ||
                      charCount > 2000 ||
                      !inventionType ||
                      (!showCustomField && !technicalField.trim()) ||
                      (showCustomField && !customTechnicalField.trim()) ||
                      !keyFeatures.trim() ||
                      keyFeatures.trim().length < 10
                    }
                  >
                    {isLoading ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "color 0.3s"
                        }}
                      >
                        <span
                          className="animate-spin"
                          style={{
                            display: "inline-block",
                            borderRadius: "50%",
                            height: 20,
                            width: 20,
                            borderTop: "2px solid #fff",
                            borderBottom: "2px solid #fff",
                            marginRight: 8,
                            animation: "spin 1s linear infinite",
                            transition: "background 0.3s, color 0.3s, border 0.3s"
                          }}
                        ></span>
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
          {draft && <DraftPreview draft={draft} />}
        </div>
      </div>
    </div>
  );
};

export default IdeaForm;