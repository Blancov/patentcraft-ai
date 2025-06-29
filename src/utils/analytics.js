import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize("G-R86CDSB1RY");
};

export const logPageView = () => {
  ReactGA.send({ 
    hitType: "pageview", 
    page: window.location.pathname 
  });
};

export const logEvent = (category, action, label) => {
  ReactGA.event({
    category,
    action,
    label
  });
};

export const logPerformance = () => {
  if (window.performance) {
    const navTiming = performance.getEntriesByType('navigation')[0];
    if (navTiming) {
      ReactGA.event({
        category: "Performance",
        action: "Page Load",
        value: Math.round(navTiming.duration),
        nonInteraction: true
      });
    }
  }
};