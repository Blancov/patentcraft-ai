import React from 'react';
import IdeaForm from '../components/Form/IdeaForm';
import Disclaimer from '../components/Disclaimer';

const Home = () => {
  return (
    <>
      <header>
        <h1>Patent Draft Generator</h1>
        <p>Turn your invention ideas into patent-ready drafts</p>
      </header>
      
      <main>
        <IdeaForm />
      </main>
      
      <footer>
        <Disclaimer />
      </footer>
    </>
  );
};

export default Home;