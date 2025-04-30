"use client";

import { 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from "recharts";

// Status Chart Component
export function StatusChart({ data, colors }: { data: any[], colors: Record<string, string> }) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={Object.values(colors)[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Bar Chart Component
export function MonthlyVolumeChart({ data }: { data: any[] }) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#8884d8" name="Total Laporan" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Category Pie Chart
export function CategoryChart({ data, colors }: { data: any[], colors: string[] }) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={90}
            dataKey="value"
            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Area Chart Component for Trends
export function TrendAreaChart({ data, colors }: { data: any[], colors: Record<string, string> }) {
  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="pending" 
            stackId="1" 
            stroke={colors.pending} 
            fill={colors.pending} 
            name="Menunggu"
          />
          <Area 
            type="monotone" 
            dataKey="inProgress" 
            stackId="1" 
            stroke={colors.inProgress} 
            fill={colors.inProgress} 
            name="Dalam Proses"
          />
          <Area 
            type="monotone" 
            dataKey="resolved" 
            stackId="1" 
            stroke={colors.resolved} 
            fill={colors.resolved} 
            name="Terselesaikan"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Line Chart Component for Single Status
export function StatusLineChart({ 
  data, 
  dataKey, 
  color, 
  name 
}: { 
  data: any[], 
  dataKey: string, 
  color: string, 
  name: string 
}) {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color}
            name={name}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 