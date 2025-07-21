import React from "react";

const ProgressStepper = ({ currentStep, steps }) => (
  <nav
    className="progress-stepper"
    aria-label="Form progress"
    style={{
      margin: "0 auto 2.5rem",
      maxWidth: 480,
      transition: "background 0.3s, color 0.3s, border 0.3s"
    }}
  >
    <div
      style={{
        position: "relative",
        display: "flex",
        gap: 24,
        alignItems: "center",
        transition: "background 0.3s, color 0.3s, border 0.3s"
      }}
      role="list"
    >
      {/* Track */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: 0,
          right: 0,
          height: 4,
          background: "var(--border)",
          transform: "translateY(-50%)",
          zIndex: 1,
          transition: "background 0.3s, color 0.3s, border 0.3s"
        }}
        aria-hidden="true"
      />
      {/* Steps */}
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = currentStep === stepNum;
        const isCompleted = currentStep > stepNum;
        return (
          <div
            key={label}
            role="listitem"
            style={{
              position: "relative",
              zIndex: 2,
              flex: 1,
              textAlign: "center",
              transition: "background 0.3s, color 0.3s, border 0.3s"
            }}
          >
            <div
              tabIndex={0}
              aria-current={isActive ? "step" : undefined}
              style={{
                width: 36,
                height: 36,
                margin: "0 auto 0.5rem",
                borderRadius: "50%",
                background: isActive
                  ? "var(--primary)"
                  : isCompleted
                  ? "var(--success, #22c55e)"
                  : "var(--card)",
                border: `2px solid ${
                  isActive
                    ? "var(--primary)"
                    : isCompleted
                    ? "var(--success, #22c55e)"
                    : "var(--border)"
                }`,
                color: isActive || isCompleted ? "#fff" : "var(--text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "1.1rem",
                outline: isActive ? "2px solid var(--primary)" : "none",
                boxShadow: isActive ? "0 0 0 2px var(--primary-light)" : "none",
                transition: "background 0.3s, border 0.3s, color 0.3s, outline 0.3s, box-shadow 0.3s"
              }}
            >
              {isCompleted ? (
                <span style={{ fontSize: 20, lineHeight: 1 }}>✓</span>
              ) : (
                stepNum
              )}
            </div>
            <div
              style={{
                fontSize: "1rem",
                color: isActive ? "var(--primary)" : "var(--text-light)",
                fontWeight: isActive ? 600 : 400,
                marginTop: 2,
                transition: "color 0.3s"
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  </nav>
);

export default ProgressStepper;