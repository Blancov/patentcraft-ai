const FeatureCard = ({ icon, title, description }) => (
  <div className="feature-card">
    <div className="feature-card__icon">{icon}</div>
    <h3 className="font-bold">{title}</h3>
    <p>{description}</p>
  </div>
);

export default FeatureCard;