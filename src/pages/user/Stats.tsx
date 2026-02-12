
import { 
  BarChart as BarChartIcon, 
  TrendingUp, 
  Activity, 
  Clock, 
  Zap, 
  Award
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function Stats() {
  const activityData = [
    { name: 'Mon', hours: 4, tasks: 12 },
    { name: 'Tue', hours: 6, tasks: 18 },
    { name: 'Wed', hours: 8, tasks: 24 },
    { name: 'Thu', hours: 5, tasks: 15 },
    { name: 'Fri', hours: 7, tasks: 20 },
    { name: 'Sat', hours: 2, tasks: 5 },
    { name: 'Sun', hours: 0, tasks: 0 },
  ];

  const projectDistribution = [
    { name: 'Development', value: 45, color: '#8b5cf6' },
    { name: 'Design', value: 25, color: '#ec4899' },
    { name: 'Meeting', value: 15, color: '#f59e0b' },
    { name: 'Planning', value: 15, color: '#10b981' },
  ];

  const skillsGrowth = [
    { name: 'Jan', score: 65 },
    { name: 'Feb', score: 68 },
    { name: 'Mar', score: 75 },
    { name: 'Apr', score: 72 },
    { name: 'May', score: 80 },
    { name: 'Jun', score: 85 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl shadow-xl">
          <p className="font-semibold text-white mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-500" />
            Your Statistics
          </h1>
          <p className="text-gray-400 mt-1">Deep dive into your productivity and performance metrics</p>
        </div>
        
        <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
          {['Week', 'Month', 'Year'].map((period) => (
            <button 
              key={period}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                period === 'Week' 
                  ? 'bg-zinc-800 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: 'Total Hours', value: '32.5h', change: '+12%', color: 'blue' },
          { icon: CheckCheck, label: 'Tasks Completed', value: '45', change: '+8%', color: 'emerald' },
          { icon: Zap, label: 'Productivity Score', value: '92', change: '+5%', color: 'amber' },
          { icon: Award, label: 'Skill Points', value: '1,250', change: '+150', color: 'violet' }
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl hover:border-zinc-700 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                {stat.change}
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Chart */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <BarChartIcon className="w-5 h-5 text-blue-400" />
            Weekly Activity
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                <Bar dataKey="hours" name="Hours Logged" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="tasks" name="Tasks Done" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Distribution */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-violet-400" />
            Time Distribution
          </h3>
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
             {/* Center Text */}
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-white">32.5h</span>
              <span className="text-sm text-gray-500">Total Time</span>
            </div>
          </div>
        </div>

        {/* Skill Growth Area Chart */}
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Performance Trend
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={skillsGrowth}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Icons for JSX
function CheckCheck(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg> }
function PieChartIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg> }
