// src/components/RunStatusChart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Run {
  status: string;
}

interface RunStatusChartProps {
  runs: Run[];
}

export const RunStatusChart = ({ runs }: RunStatusChartProps) => {
  const statusCounts = runs.reduce((acc, run) => {
    acc[run.status] = (acc[run.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }));

  const COLORS = {
    completed: "#10B981",
    failed: "#EF4444",
    running: "#3B82F6",
    stopped: "#F59E0B",
  };

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No run data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  COLORS[entry.name.toLowerCase() as keyof typeof COLORS] ||
                  "#8884d8"
                }
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
