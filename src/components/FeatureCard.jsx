export default function FeatureCard({ title, description, icon }) {
  return (
    <div className="card text-center p-8 hover:bg-gray-800 transition-colors h-full flex flex-col">
      <div className="text-5xl mb-6 text-primary">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted flex-grow">{description}</p>
    </div>
  );
}