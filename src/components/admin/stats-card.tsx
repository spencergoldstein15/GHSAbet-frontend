interface StatsCardProps {
  title: string;
  value: string | number;
  color: string;
  testId: string;
}

export default function StatsCard({ title, value, color, testId }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border" data-testid={testId}>
      <div className="flex items-center">
        <div className={`p-2 ${color}/10 rounded-lg`}>
          <div className={`w-6 h-6 ${color} rounded`}></div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600" data-testid={`text-${testId}-title`}>
            {title}
          </p>
          <p className="text-2xl font-semibold text-gray-900" data-testid={`text-${testId}-value`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
