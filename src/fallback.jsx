import React from 'react';

const Fallback = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/">Go to Home</a>
    </div>
  );
};

export default Fallback;