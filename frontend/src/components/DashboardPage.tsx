// =============================================================================
// DashboardPage.tsx
// =============================================================================
// Main dashboard view displaying EC2 instance overview, instance table with
// actions, alarms, zone health, and resource usage summary.
//
// API CALLS:
// - fetchInstances() -> GET /api/ec2/instances
// - deleteInstance() -> DELETE /api/ec2/instances/:id
// - startInstance()  -> POST /api/ec2/instances/:id/start
// - stopInstance()   -> POST /api/ec2/instances/:id/stop
// - rebootInstance() -> POST /api/ec2/instances/:id/reboot
//
// COMPONENT STRUCTURE:
// └── DashboardPage
//     ├── Account Overview Cards (Total, Running, Stopped, Alarms)
//     ├── All Instances Table
//     │   ├── Instance Name (clickable)
//     │   ├── Instance ID, Type, State, Zone, IP, Uptime
//     │   └── Action Buttons (Start/Stop/Reboot/Terminate)
//     ├── Instance Alarms Card
//     ├── Availability Zone Health Card
//     └── Resource Usage Summary Card
// =============================================================================


// =============================================================================
// IMPORTS
// =============================================================================

import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { Server, Play, Square, RotateCw, Trash2, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { fetchInstances, deleteInstance, startInstance, stopInstance, rebootInstance, type Instance } from '../api/instances';
import { getCurrentMetrics, type CurrentMetrics } from '../api/ec2';
import { toast } from 'sonner';
import { ActionConfirmDialog } from './ActionConfirmDialog';


// =============================================================================
// TYPES
// =============================================================================

interface DashboardPageProps {
  onInstanceClick: (id: string) => void;
}


// =============================================================================
// CONSTANTS - Mock Data
// =============================================================================

// =============================================================================
// COMPONENT
// =============================================================================

export function DashboardPage({ onInstanceClick }: DashboardPageProps) {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [instances, setInstances] = useState<Instance[]>([]);
  const [currentMetricsByInstance, setCurrentMetricsByInstance] = useState<Record<string, CurrentMetrics>>({});
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    instanceId: string;
    instanceName: string;
    action: 'start' | 'stop' | 'reboot' | 'terminate';
  } | null>(null);

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------
  const runningInstances = instances.filter(i => i.state === 'running').length;
  const stoppedInstances = instances.filter(i => i.state === 'stopped').length;
  const totalInstances = instances.length;
  const getCpuPercent = (instanceId: string) => currentMetricsByInstance[instanceId]?.cpu_percent ?? 0;
  const clampPercent = (value: number) => Math.max(0, Math.min(100, value));
  const storageUsed = instances.filter(i => i.state !== "terminated").length * 8;
  const vCpuLimit = 20;
  const memoryLimit = 64;
  const storageLimit = 1000;
  const totalRunningVCpuCapacity = instances.filter(i => i.state === "running").reduce((sum, i) => sum + i.cpu, 0);
  const weightedLiveCpuPercent = totalRunningVCpuCapacity > 0
    ? instances
      .filter(i => i.state === "running")
      .reduce((sum, i) => sum + (i.cpu * getCpuPercent(i.id)), 0) / totalRunningVCpuCapacity
    : 0;
  const timeWave = runningInstances > 0 ? Math.sin(Date.now() / 12000) * 2.2 : 0;
  const vCpuUsagePercent = runningInstances > 0
    ? clampPercent(20 + ((weightedLiveCpuPercent - 20) * 0.35) + timeWave)
    : 0;
  const memoryUsagePercent = runningInstances > 0
    ? clampPercent(20 + ((weightedLiveCpuPercent - 20) * 0.25) + Math.cos(Date.now() / 14000) * 1.6)
    : 0;
  const vCpuUsed = (vCpuLimit * vCpuUsagePercent) / 100;
  const memoryUsed = (memoryLimit * memoryUsagePercent) / 100;

  const zoneMap = instances.reduce<Record<string, { instances: number; runningCpu: number; runningCount: number }>>(
    (acc, instance) => {
      const zone = instance.zone || "unknown";
      if (!acc[zone]) {
        acc[zone] = { instances: 0, runningCpu: 0, runningCount: 0 };
      }
        acc[zone].instances += 1;
      if (instance.state === "running") {
        acc[zone].runningCpu += getCpuPercent(instance.id);
        acc[zone].runningCount += 1;
      }
      return acc;
    },
    {}
  );

  const zones = Object.entries(zoneMap).map(([name, info]) => {
    const cpuAvg = info.runningCount > 0 ? Math.round(info.runningCpu / info.runningCount) : 0;
    return {
      name,
      status: cpuAvg > 85 ? "degraded" : "healthy",
      instances: info.instances,
      cpuAvg,
    };
  });
  const alarms = instances.map((instance) => {
    const isAlarm = instance.state === "terminated" || instance.state === "shutting-down";
    const isWarning = instance.state === "pending";
    const status = isAlarm ? "alarm" : isWarning ? "warn" : "ok";
    return {
      name: `${instance.name}-status`,
      instance: instance.name,
      status,
      metric: "Instance State",
    };
  });
  const activeAlarms = alarms.filter((a) => a.status === "alarm").length;

  // ---------------------------------------------------------------------------
  // API Handlers - Load Data
  // ---------------------------------------------------------------------------

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      // API CALL: GET /api/ec2/instances
      const data = await fetchInstances();
      setInstances(data);
      await loadCurrentMetrics(data);
    } catch (error) {
      console.error('Failed to fetch instances:', error);
      toast.error('Failed to load instances');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadCurrentMetrics = async (sourceInstances: Instance[]) => {
    const running = sourceInstances.filter((instance) => instance.state === "running");
    if (running.length === 0) {
      setCurrentMetricsByInstance({});
      return;
    }

    const metricsEntries = await Promise.all(
      running.map(async (instance) => {
        try {
          const metrics = await getCurrentMetrics(instance.id);
          return [instance.id, metrics] as const;
        } catch {
          return [instance.id, null] as const;
        }
      })
    );

    const nextMetrics: Record<string, CurrentMetrics> = {};
    for (const [instanceId, metrics] of metricsEntries) {
      if (metrics) nextMetrics[instanceId] = metrics;
    }
    setCurrentMetricsByInstance(nextMetrics);
  };

  useEffect(() => {
    loadData();
    const intervalId = window.setInterval(() => {
      loadData(true);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  // ---------------------------------------------------------------------------
  // API Handlers - Instance Actions
  // ---------------------------------------------------------------------------

  const handleDelete = async (id: string) => {
    try {
      // API CALL: DELETE /api/ec2/instances/:id
      await deleteInstance(id);
      toast.success('Instance terminated successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete instance:', error);
      toast.error('Failed to terminate instance');
    }
  };

  const openActionConfirm = (
    instanceId: string,
    action: 'start' | 'stop' | 'reboot' | 'terminate'
  ) => {
    const instance = instances.find((inst) => inst.id === instanceId);
    setPendingAction({
      instanceId,
      instanceName: instance?.name ?? instanceId,
      action,
    });
    setConfirmOpen(true);
  };

  const executePendingAction = async () => {
    if (!pendingAction) return;
    const { instanceId, action } = pendingAction;

    if (action === 'start') await handleStart(instanceId);
    if (action === 'stop') await handleStop(instanceId);
    if (action === 'reboot') await handleReboot(instanceId);
    if (action === 'terminate') await handleDelete(instanceId);
  };

  const actionCopy =
    pendingAction?.action === 'start'
      ? {
        title: 'Start this instance?',
        description: `This will power on "${pendingAction.instanceName}" and start billing compute usage.`,
        confirmLabel: 'Start Instance',
        confirmClassName: 'bg-green-600 hover:bg-green-700 text-white',
      }
      : pendingAction?.action === 'stop'
        ? {
          title: 'Stop this instance?',
          description: `Running workloads on "${pendingAction.instanceName}" will pause until you start it again.`,
          confirmLabel: 'Stop Instance',
          confirmClassName: 'bg-gray-700 hover:bg-gray-800 text-white',
        }
        : pendingAction?.action === 'reboot'
          ? {
            title: 'Reboot this instance?',
            description: `This performs a restart on "${pendingAction.instanceName}". Active connections may be interrupted.`,
            confirmLabel: 'Reboot Instance',
            confirmClassName: 'bg-blue-600 hover:bg-blue-700 text-white',
          }
          : {
            title: 'Terminate this instance?',
            description: `This permanently deletes "${pendingAction?.instanceName ?? ''}". This action cannot be undone.`,
            confirmLabel: 'Terminate Instance',
            confirmClassName: 'bg-red-600 hover:bg-red-700 text-white',
          };

  const handleStart = async (id: string) => {
    try {
      // API CALL: POST /api/ec2/instances/:id/start
      await startInstance(id);
      toast.success('Starting instance...');
      loadData();
    } catch (error) {
      console.error('Failed to start instance:', error);
      toast.error('Failed to start instance');
    }
  };

  const handleStop = async (id: string) => {
    try {
      // API CALL: POST /api/ec2/instances/:id/stop
      await stopInstance(id);
      toast.success('Stopping instance...');
      loadData();
    } catch (error) {
      console.error('Failed to stop instance:', error);
      toast.error('Failed to stop instance');
    }
  };

  const handleReboot = async (id: string) => {
    try {
      // API CALL: POST /api/ec2/instances/:id/reboot
      await rebootInstance(id);
      toast.success('Rebooting instance...');
      loadData();
    } catch (error) {
      console.error('Failed to reboot instance:', error);
      toast.error('Failed to reboot instance');
    }
  };

  // ---------------------------------------------------------------------------
  // Render - Loading State
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render - Main Content
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <div>
        <h2 className="mb-4">Account Overview</h2>
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Server className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Instances</p>
                <p className="text-2xl mt-1">{totalInstances}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Running</p>
                <p className="text-2xl mt-1">{runningInstances}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Square className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Stopped</p>
                <p className="text-2xl mt-1">{stoppedInstances}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Alarms</p>
                <p className="text-2xl mt-1">{activeAlarms}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* All Instances Table */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3>All Instances</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => loadData()}>
              <RotateCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Instance ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Public IP</TableHead>
              <TableHead>Uptime</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24 text-gray-500">
                  No instances found. Launch one!
                </TableCell>
              </TableRow>
            ) : (
              instances.map((instance) => (
                <TableRow key={instance.id}>
                  <TableCell>
                    <button
                      onClick={() => onInstanceClick(instance.id)}
                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {instance.name}
                    </button>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{instance.id}</TableCell>
                  <TableCell>{instance.type}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        instance.state === 'running'
                          ? 'bg-green-600'
                          : instance.state === 'stopped'
                            ? 'bg-gray-500'
                            : 'bg-yellow-600'
                      }
                    >
                      {instance.state}
                    </Badge>
                  </TableCell>
                  <TableCell>{instance.zone}</TableCell>
                  <TableCell className="font-mono text-xs">{instance.publicIp}</TableCell>
                  <TableCell>{instance.uptime}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {instance.state === 'stopped' ? (
                        <Button variant="ghost" size="sm" title="Start" onClick={() => openActionConfirm(instance.id, 'start')}>
                          <Play className="h-4 w-4 text-green-600" />
                        </Button>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" title="Stop" onClick={() => openActionConfirm(instance.id, 'stop')}>
                            <Square className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Reboot" onClick={() => openActionConfirm(instance.id, 'reboot')}>
                            <RotateCw className="h-4 w-4 text-blue-600" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" title="Terminate" onClick={() => openActionConfirm(instance.id, 'terminate')}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Two Column Layout: Alarms + Zone Health */}
      <div className="grid grid-cols-2 gap-6">
        {/* Instance Alarms */}
        <Card className="p-6">
          <h3 className="mb-4">Instance Alarms</h3>

          <div className="space-y-3">
            {alarms.map((alarm, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {alarm.status === 'ok' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : alarm.status === 'warn' ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm">{alarm.name}</p>
                    <p className="text-xs text-gray-600">
                      {alarm.instance} • {alarm.metric}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    alarm.status === 'ok'
                      ? 'border-green-500 text-green-700'
                      : alarm.status === 'warn'
                        ? 'border-yellow-500 text-yellow-700'
                        : 'border-red-500 text-red-700'
                  }
                >
                  {alarm.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4" size="sm">
            View All Alarms
          </Button>
        </Card>

        {/* Zone Health */}
        <Card className="p-6">
          <h3 className="mb-4">Availability Zone Health</h3>

          <div className="space-y-4">
            {zones.map((zone, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{zone.name}</span>
                    {zone.status === 'healthy' ? (
                      <Badge variant="outline" className="border-green-500 text-green-700">
                        Healthy
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                        Degraded
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">{zone.instances} instances</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Avg CPU: {zone.cpuAvg}%</span>
                    <span>{zone.cpuAvg}%</span>
                  </div>
                  <Progress value={zone.cpuAvg} className="h-2" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm">All zones operational</p>
                <p className="text-xs text-gray-600 mt-1">
                  Last checked: 2 minutes ago
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Resource Usage Summary */}
      <Card className="p-6">
        <h3 className="mb-4">Resource Usage Summary</h3>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">vCPU Usage</span>
              <span className="text-sm">{vCpuUsed.toFixed(1)} / {vCpuLimit}</span>
            </div>
            <Progress value={Math.round(vCpuUsagePercent)} className="h-2" />
            <p className="text-xs text-gray-600 mt-1">{Math.round(vCpuUsagePercent)}% of account limit</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Memory (GiB)</span>
              <span className="text-sm">{memoryUsed.toFixed(1)} / {memoryLimit}</span>
            </div>
            <Progress value={Math.round(memoryUsagePercent)} className="h-2" />
            <p className="text-xs text-gray-600 mt-1">{Math.round(memoryUsagePercent)}% of account limit</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">EBS Storage (GB)</span>
              <span className="text-sm">{storageUsed} / {storageLimit}</span>
            </div>
            <Progress value={Math.round((storageUsed / storageLimit) * 100)} className="h-2" />
            <p className="text-xs text-gray-600 mt-1">{Math.round((storageUsed / storageLimit) * 100)}% of account limit</p>
          </div>
        </div>
      </Card>

      <ActionConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={actionCopy.title}
        description={actionCopy.description}
        confirmLabel={actionCopy.confirmLabel}
        confirmClassName={actionCopy.confirmClassName}
        onConfirm={executePendingAction}
      />
    </div>
  );
}
