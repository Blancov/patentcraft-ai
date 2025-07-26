import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6" role="alert">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-xl text-gray-500 mb-8">
        Sorry, the page you are looking for does not exist.<br />
        Please check the URL or return to the homepage.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;