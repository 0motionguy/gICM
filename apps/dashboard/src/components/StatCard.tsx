interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <section className="space-y-2 rounded-lg bg-gray-800 p-6">
      <h2 className="text-sm font-medium uppercase tracking-wide text-gray-400">
        {title}
      </h2>
      <p className="text-3xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
    </section>
  );
}
