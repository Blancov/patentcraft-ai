// Utility functions for accessibility
export const srOnly = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0',
};

// Focus trap for modals
export const focusTrap = (element) => {
  const focusable = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusable.length > 0) {
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    
    first.focus();
    
    const handleTab = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    
    element.addEventListener('keydown', handleTab);
    return () => element.removeEventListener('keydown', handleTab);
  }
};

// ARIA live region for dynamic updates
export const setupLiveRegion = () => {
  const region = document.createElement('div');
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('aria-atomic', 'true');
  region.style.position = 'absolute';
  region.style.width = '1px';
  region.style.height = '1px';
  region.style.overflow = 'hidden';
  region.style.clip = 'rect(0, 0, 0, 0)';
  document.body.appendChild(region);
  return region;
};