import React from 'react';

const ProgressStepper = ({ currentStep, steps }) => {
  return (
    <div className="progress-stepper">
      <div className="stepper-track">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`step ${index + 1 === currentStep ? 'active' : ''} ${index + 1 < currentStep ? 'completed' : ''}`}
          >
            <div className="step-indicator">
              {index + 1 < currentStep ? (
                <span className="step-check">✓</span>
              ) : (
                <span className="step-number">{index + 1}</span>
              )}
            </div>
            <div className="step-label">{step}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressStepper;