import React from 'react';

const ResponsiveContainer = ({ children }) => {
  return (
    <div className="responsive-container">
      <div className="container-inner">
        {children}
      </div>
    </div>
  );
};

export default ResponsiveContainer;