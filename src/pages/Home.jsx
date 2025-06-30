import React from 'react';
import IdeaForm from '../components/Form/IdeaForm';
import Disclaimer from '../components/Disclaimer';
import ResponsiveContainer from '../components/Layout/ResponsiveContainer';

const Home = () => {
  return (
    <ResponsiveContainer>
      <header aria-label="Site header">
        <h1>Patent Draft Generator</h1>
        <p>Turn your invention ideas into patent-ready drafts</p>
      </header>
      
      <main id="main-content" aria-labelledby="main-title">
        <h2 id="main-title" className="sr-only">Patent Draft Form</h2>
        <IdeaForm />
      </main>
      
      <footer aria-label="Site footer">
        <Disclaimer />
      </footer>
    </ResponsiveContainer>
  );
};

export default Home;