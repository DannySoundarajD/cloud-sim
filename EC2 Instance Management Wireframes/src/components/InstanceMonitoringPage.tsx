import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Download, RefreshCw, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

// Mock data for charts
const cpuData = [
  { time: '00:00', usage: 12 },
  { time: '04:00', usage: 8 },
  { time: '08:00', usage: 25 },
  { time: '12:00', usage: 45 },
  { time: '16:00', usage: 38 },
  { time: '20:00', usage: 22 },
  { time: '24:00', usage: 15 },
];

const networkData = [
  { time: '00:00', in: 120, out: 80 },
  { time: '04:00', in: 90, out: 60 },
  { time: '08:00', in: 250, out: 180 },
  { time: '12:00', in: 450, out: 320 },
  { time: '16:00', in: 380, out: 280 },
  { time: '20:00', in: 220, out: 160 },
  { time: '24:00', in: 150, out: 100 },
];

const diskData = [
  { time: '00:00', read: 45, write: 32 },
  { time: '04:00', read: 38, write: 28 },
  { time: '08:00', read: 65, write: 48 },
  { time: '12:00', read: 85, write: 62 },
  { time: '16:00', read: 72, write: 55 },
  { time: '20:00', read: 58, write: 42 },
  { time: '24:00', read: 48, write: 35 },
];

const memoryData = [
  { time: '00:00', used: 512, available: 512 },
  { time: '04:00', used: 486, available: 538 },
  { time: '08:00', used: 615, available: 409 },
  { time: '12:00', used: 768, available: 256 },
  { time: '16:00', used: 702, available: 322 },
  { time: '20:00', used: 589, available: 435 },
  { time: '24:00', used: 524, available: 500 },
];

const costData = [
  { date: 'Nov 8', compute: 2.5, storage: 0.8, network: 0.3, total: 3.6 },
  { date: 'Nov 9', compute: 2.8, storage: 0.8, network: 0.4, total: 4.0 },
  { date: 'Nov 10', compute: 3.2, storage: 0.9, network: 0.5, total: 4.6 },
  { date: 'Nov 11', compute: 2.9, storage: 0.9, network: 0.4, total: 4.2 },
  { date: 'Nov 12', compute: 3.1, storage: 0.9, network: 0.6, total: 4.6 },
  { date: 'Nov 13', compute: 2.7, storage: 0.9, network: 0.4, total: 4.0 },
  { date: 'Nov 14', compute: 2.6, storage: 0.9, network: 0.3, total: 3.8 },
];

const costBreakdown = [
  { name: 'Compute', value: 19.8, color: '#3b82f6' },
  { name: 'Storage', value: 6.1, color: '#8b5cf6' },
  { name: 'Network', value: 2.9, color: '#10b981' },
  { name: 'Other', value: 0.5, color: '#f59e0b' },
];

const logEntries = [
  { timestamp: '2025-11-13 14:32:45', level: 'INFO', message: 'Instance health check passed' },
  { timestamp: '2025-11-13 14:30:12', level: 'INFO', message: 'Network interface eth0 traffic normal' },
  { timestamp: '2025-11-13 14:28:03', level: 'WARN', message: 'CPU utilization spike detected (78%)' },
  { timestamp: '2025-11-13 14:25:30', level: 'INFO', message: 'Disk I/O operations within normal range' },
  { timestamp: '2025-11-13 14:20:15', level: 'INFO', message: 'System update check completed' },
  { timestamp: '2025-11-13 14:15:42', level: 'ERROR', message: 'Connection timeout to external service' },
  { timestamp: '2025-11-13 14:10:28', level: 'INFO', message: 'Security group rules validated' },
  { timestamp: '2025-11-13 14:05:11', level: 'INFO', message: 'Instance health check passed' },
];

export function InstanceMonitoringPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1>Instance Monitoring</h1>
            <Badge className="bg-green-600">Live</Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">web-server-01 (i-0a1b2c3d4e5f6g7h8)</p>
        </div>
        
        <div className="flex gap-2">
          <Select defaultValue="1h">
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15m">Last 15 minutes</SelectItem>
              <SelectItem value="1h">Last 1 hour</SelectItem>
              <SelectItem value="6h">Last 6 hours</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Current Status Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-gray-600">CPU Utilization</p>
          </div>
          <p className="text-2xl">15.2%</p>
          <p className="text-xs text-green-600 mt-1">↓ 2.3% from average</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-purple-600" />
            <p className="text-sm text-gray-600">Memory Usage</p>
          </div>
          <p className="text-2xl">512 MB</p>
          <p className="text-xs text-gray-600 mt-1">50% of 1 GB</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-green-600" />
            <p className="text-sm text-gray-600">Network In</p>
          </div>
          <p className="text-2xl">1.2 MB/s</p>
          <p className="text-xs text-green-600 mt-1">↑ 0.8 MB/s from avg</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-orange-600" />
            <p className="text-sm text-gray-600">Disk Read/Write</p>
          </div>
          <p className="text-2xl">48 ops/s</p>
          <p className="text-xs text-gray-600 mt-1">Normal activity</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <p className="text-sm text-gray-600">Today's Cost</p>
          </div>
          <p className="text-2xl">$3.80</p>
          <p className="text-xs text-green-600 mt-1">↓ $0.20 vs yesterday</p>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="cpu" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="cpu">CPU</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="disk">Disk I/O</TabsTrigger>
          <TabsTrigger value="cost">Cost</TabsTrigger>
        </TabsList>

        <TabsContent value="cpu" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4">CPU Utilization (%)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cpuData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="usage" stroke="#3b82f6" fill="#93c5fd" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-sm text-gray-600">Average CPU</p>
              <p className="text-xl mt-2">23.7%</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Peak CPU</p>
              <p className="text-xl mt-2">45.0%</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Min CPU</p>
              <p className="text-xl mt-2">8.0%</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4">Memory Usage (MB)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={memoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="used" stackId="1" stroke="#8b5cf6" fill="#c4b5fd" />
                <Area type="monotone" dataKey="available" stackId="1" stroke="#10b981" fill="#86efac" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-sm text-gray-600">Average Used</p>
              <p className="text-xl mt-2">599 MB</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Peak Used</p>
              <p className="text-xl mt-2">768 MB</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Total Memory</p>
              <p className="text-xl mt-2">1024 MB</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4">Network Traffic (KB/s)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={networkData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="in" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="out" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-sm text-gray-600">Total Data In</p>
              <p className="text-xl mt-2">2.1 GB</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Total Data Out</p>
              <p className="text-xl mt-2">1.5 GB</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Packet Loss</p>
              <p className="text-xl mt-2">0.02%</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="disk" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4">Disk I/O Operations (ops/s)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={diskData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="read" fill="#3b82f6" />
                <Bar dataKey="write" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-sm text-gray-600">Avg Read Ops</p>
              <p className="text-xl mt-2">58.7/s</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Avg Write Ops</p>
              <p className="text-xl mt-2">43.1/s</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Disk Utilization</p>
              <p className="text-xl mt-2">24%</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cost" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4">Daily Cost Trend ($)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="compute" stackId="1" stroke="#3b82f6" fill="#93c5fd" />
                <Area type="monotone" dataKey="storage" stackId="1" stroke="#8b5cf6" fill="#c4b5fd" />
                <Area type="monotone" dataKey="network" stackId="1" stroke="#10b981" fill="#86efac" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="mb-4">Cost Breakdown (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4">Cost Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Week to Date</span>
                  <span className="font-medium">$29.30</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Month to Date</span>
                  <span className="font-medium">$116.50</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm text-gray-600">Projected Monthly</span>
                  <span className="font-medium text-blue-700">$249.80</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-gray-600">vs Last Month</span>
                  </div>
                  <span className="font-medium text-orange-700">+12.5%</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-sm text-gray-600">Compute Costs</p>
              <p className="text-xl mt-2">$19.80</p>
              <p className="text-xs text-gray-500 mt-1">67.5% of total</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Storage Costs</p>
              <p className="text-xl mt-2">$6.10</p>
              <p className="text-xs text-gray-500 mt-1">20.8% of total</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Network Costs</p>
              <p className="text-xl mt-2">$2.90</p>
              <p className="text-xs text-gray-500 mt-1">9.9% of total</p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="mb-4">Cost Optimization Recommendations</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Right-size Instance</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Your average CPU is only 23.7%. Consider downsizing to t2.nano to save up to $5.50/month.
                  </p>
                </div>
                <Button size="sm" variant="outline">Apply</Button>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Reserved Instance Savings</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Switch to a 1-year reserved instance to save up to 40% ($99.92/year).
                  </p>
                </div>
                <Button size="sm" variant="outline">Learn More</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Logs Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3>System Logs</h3>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {logEntries.map((log, index) => (
            <div
              key={index}
              className="flex gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-xs text-gray-500 whitespace-nowrap font-mono">
                {log.timestamp}
              </span>
              <Badge
                variant="outline"
                className={
                  log.level === 'ERROR'
                    ? 'border-red-500 text-red-700'
                    : log.level === 'WARN'
                    ? 'border-yellow-500 text-yellow-700'
                    : 'border-blue-500 text-blue-700'
                }
              >
                {log.level}
              </Badge>
              <span className="text-sm flex-1">{log.message}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Alarms Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3>CloudWatch Alarms</h3>
          <Button variant="outline" size="sm">Create Alarm</Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Badge className="bg-green-600">OK</Badge>
              <div>
                <p>CPU-High-Utilization</p>
                <p className="text-sm text-gray-600">Triggers when CPU &gt; 80% for 5 minutes</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Badge className="bg-green-600">OK</Badge>
              <div>
                <p>Memory-High-Usage</p>
                <p className="text-sm text-gray-600">Triggers when memory usage &gt; 90%</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Badge className="bg-green-600">OK</Badge>
              <div>
                <p>Status-Check-Failed</p>
                <p className="text-sm text-gray-600">Triggers on instance status check failure</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
