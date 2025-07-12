import CenitarLogo from '../../assets/Cenitar.png';

const ProgressStepper = ({ currentStep, steps }) => {
  return (
    <div className="progress-stepper mb-8">
      <div className="stepper-track relative">
        <div className="absolute top-4 left-0 right-0 h-1 bg-border z-10"></div>
        
        {steps.map((label, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          
          return (
            <div 
              key={index} 
              className={`step relative z-20 flex flex-col items-center ${
                index === 0 ? 'items-start' : index === steps.length - 1 ? 'items-end' : ''
              }`}
              style={{ flex: 1 }}
            >
              <div className={`step-indicator w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all ${
                isActive 
                  ? 'bg-primary border-primary text-white shadow-lg scale-110' 
                  : isCompleted 
                    ? 'bg-success border-success' 
                    : 'bg-card border-border'
              }`}>
                {isCompleted ? (
                  <img 
                    src={CenitarLogo} 
                    alt="Complete" 
                    className="w-5 h-5 object-contain" 
                  />
                ) : (
                  <span className="step-number font-medium">
                    {index + 1}
                  </span>
                )}
              </div>
              <span className={`step-label text-sm text-center max-w-[100px] ${
                isActive ? 'text-primary font-medium' : 'text-text-light'
              }`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressStepper;