// =============================================================================
// InstanceDetailsPage.tsx
// =============================================================================
// Detailed view for a single EC2 instance showing properties, security groups,
// networking, storage, and tags. Provides instance lifecycle actions.
//
// API CALLS:
// - getInstance()       -> GET /api/ec2/instances/:id
// - startInstance()     -> POST /api/ec2/instances/:id/start
// - stopInstance()      -> POST /api/ec2/instances/:id/stop
// - rebootInstance()    -> POST /api/ec2/instances/:id/reboot
// - terminateInstance() -> DELETE /api/ec2/instances/:id
//
// COMPONENT STRUCTURE:
// └── InstanceDetailsPage
//     ├── Header (Name, State Badge, Action Buttons)
//     ├── Quick Info Cards (Type, Zone, Public IP, Private IP)
//     ├── Tabs
//     │   ├── Details Tab (Instance properties)
//     │   ├── Security Tab (Security groups, IAM role)
//     │   ├── Networking Tab (VPC, Subnet, DNS)
//     │   ├── Storage Tab (EBS volumes table)
//     │   └── Tags Tab (Key-value pairs)
//     └── ScalingConfigDialog (modal)
// =============================================================================


// =============================================================================
// IMPORTS
// =============================================================================

import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Play, Square, RotateCw, Trash2, Copy, ExternalLink, Settings, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { ScalingConfigDialog } from "./ScalingConfigDialog";
import { getInstance, startInstance, stopInstance, rebootInstance, terminateInstance, listInstances, type EC2Instance, type EC2InstanceDetails } from "../api/ec2";
import { toast } from "sonner";
import { ActionConfirmDialog } from "./ActionConfirmDialog";


// =============================================================================
// TYPES
// =============================================================================

interface InstanceDetailsPageProps {
  instanceId?: string | null;
}


// =============================================================================
// COMPONENT
// =============================================================================

export function InstanceDetailsPage({ instanceId }: InstanceDetailsPageProps) {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [instance, setInstance] = useState<EC2InstanceDetails | null>(null);
  const [instances, setInstances] = useState<EC2Instance[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(instanceId ?? null);
  const [loading, setLoading] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"start" | "stop" | "reboot" | "terminate" | null>(null);

  // ---------------------------------------------------------------------------
  // API Handlers - Fetch Instance Details
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setSelectedInstanceId(instanceId ?? null);
  }, [instanceId]);

  useEffect(() => {
    const loadInstances = async () => {
      try {
        const data = await listInstances();
        setInstances(data);
        setSelectedInstanceId((prev) => {
          if (prev && data.some((inst) => inst.instance_id === prev)) return prev;
          return data.length > 0 ? data[0].instance_id : null;
        });
      } catch {
        toast.error("Failed to load instance list");
      }
    };
    loadInstances();
    const intervalId = window.setInterval(loadInstances, 10000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (selectedInstanceId) {
      fetchInstanceDetails(selectedInstanceId);
    }
  }, [selectedInstanceId]);

  useEffect(() => {
    if (!selectedInstanceId) return;
    const intervalId = window.setInterval(() => {
      fetchInstanceDetails(selectedInstanceId, true);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [selectedInstanceId]);

  const fetchInstanceDetails = async (id: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      // API CALL: GET /api/ec2/instances/:id
      const data = await getInstance(id);
      setInstance(data);
    } catch (error) {
      console.error("Failed to fetch instance details:", error);
      toast.error("Failed to load instance details");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // API Handlers - Instance Actions
  // ---------------------------------------------------------------------------

  const handleStart = async () => {
    if (!instance) return;
    try {
      // API CALL: POST /api/ec2/instances/:id/start
      await startInstance(instance.instance_id);
      toast.success("Instance starting...");
      fetchInstanceDetails(instance.instance_id);
    } catch {
      toast.error("Failed to start instance");
    }
  };

  const handleStop = async () => {
    if (!instance) return;
    try {
      // API CALL: POST /api/ec2/instances/:id/stop
      await stopInstance(instance.instance_id);
      toast.success("Instance stopping...");
      fetchInstanceDetails(instance.instance_id);
    } catch {
      toast.error("Failed to stop instance");
    }
  };

  const handleReboot = async () => {
    if (!instance) return;
    try {
      // API CALL: POST /api/ec2/instances/:id/reboot
      await rebootInstance(instance.instance_id);
      toast.success("Instance rebooting...");
      fetchInstanceDetails(instance.instance_id);
    } catch {
      toast.error("Failed to reboot instance");
    }
  };

  const handleTerminate = async () => {
    if (!instance) return;
    try {
      // API CALL: DELETE /api/ec2/instances/:id
      await terminateInstance(instance.instance_id);
      toast.success("Instance terminating...");
      fetchInstanceDetails(instance.instance_id);
    } catch {
      toast.error("Failed to terminate instance");
    }
  };

  const openActionConfirm = (action: "start" | "stop" | "reboot" | "terminate") => {
    setPendingAction(action);
    setConfirmOpen(true);
  };

  const executePendingAction = async () => {
    if (!pendingAction) return;
    if (pendingAction === "start") await handleStart();
    if (pendingAction === "stop") await handleStop();
    if (pendingAction === "reboot") await handleReboot();
    if (pendingAction === "terminate") await handleTerminate();
  };

  const actionCopy =
    pendingAction === "start"
      ? {
        title: "Start this instance?",
        description: `This will power on "${instance?.name || instance?.instance_id || "instance"}" and begin active compute usage.`,
        confirmLabel: "Start Instance",
        confirmClassName: "bg-green-600 hover:bg-green-700 text-white",
      }
      : pendingAction === "stop"
        ? {
          title: "Stop this instance?",
          description: `This pauses workloads on "${instance?.name || instance?.instance_id || "instance"}" until it is started again.`,
          confirmLabel: "Stop Instance",
          confirmClassName: "bg-gray-700 hover:bg-gray-800 text-white",
        }
        : pendingAction === "reboot"
          ? {
            title: "Reboot this instance?",
            description: `This will restart "${instance?.name || instance?.instance_id || "instance"}". Connections may be briefly interrupted.`,
            confirmLabel: "Reboot Instance",
            confirmClassName: "bg-blue-600 hover:bg-blue-700 text-white",
          }
          : {
            title: "Terminate this instance?",
            description: `This permanently deletes "${instance?.name || instance?.instance_id || "instance"}". This action cannot be undone.`,
            confirmLabel: "Terminate Instance",
            confirmClassName: "bg-red-600 hover:bg-red-700 text-white",
          };

  // ---------------------------------------------------------------------------
  // Render - Empty State (no instance selected)
  // ---------------------------------------------------------------------------

  if (!selectedInstanceId) {
    return (
      <div className="flex h-[400px] items-center justify-center flex-col gap-4">
        <AlertCircle className="h-12 w-12 text-gray-400" />
        <p className="text-gray-600">No instances found. Launch one to view details.</p>
      </div>
    );
  }

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
  // Render - Not Found State
  // ---------------------------------------------------------------------------

  if (!instance) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-gray-600">Instance not found.</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render - Main Content
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1>{instance.name || instance.instance_id}</h1>
            <Badge className={instance.state === 'running' ? 'bg-green-600' : 'bg-gray-500'}>
              {instance.state}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">{instance.instance_id}</p>
        </div>

        <div className="flex gap-2 items-center">
          <Select value={selectedInstanceId ?? ""} onValueChange={setSelectedInstanceId}>
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder="Select instance" />
            </SelectTrigger>
            <SelectContent>
              {instances.map((inst) => (
                <SelectItem key={inst.instance_id} value={inst.instance_id}>
                  {inst.name || inst.instance_id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsConfigDialogOpen(true)}
            className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button variant="outline" size="sm" onClick={() => openActionConfirm("start")} disabled={instance.state === 'running'}>
            <Play className="h-4 w-4 mr-2" />
            Start
          </Button>
          <Button variant="outline" size="sm" onClick={() => openActionConfirm("stop")} disabled={instance.state !== 'running'}>
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
          <Button variant="outline" size="sm" onClick={() => openActionConfirm("reboot")} disabled={instance.state !== 'running'}>
            <RotateCw className="h-4 w-4 mr-2" />
            Reboot
          </Button>
          <Button variant="outline" size="sm" onClick={() => openActionConfirm("terminate")} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Terminate
          </Button>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Instance Type</p>
          <p className="mt-1">{instance.instance_type}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Availability Zone</p>
          <p className="mt-1">{instance.availability_zone}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Public IPv4</p>
          <div className="flex items-center gap-2 mt-1">
            <p>{instance.public_ip || '-'}</p>
            {instance.public_ip && (
              <button className="text-gray-400 hover:text-gray-600" onClick={() => navigator.clipboard.writeText(instance.public_ip!)}>
                <Copy className="h-3 w-3" />
              </button>
            )}
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Private IPv4</p>
          <div className="flex items-center gap-2 mt-1">
            <p>{instance.private_ip || '-'}</p>
            {instance.private_ip && (
              <button className="text-gray-400 hover:text-gray-600" onClick={() => navigator.clipboard.writeText(instance.private_ip!)}>
                <Copy className="h-3 w-3" />
              </button>
            )}
          </div>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="networking">Networking</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4">Instance Details</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-sm text-gray-600">Instance ID</p>
                <p className="mt-1">{instance.instance_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Instance State</p>
                <div className="mt-1">
                  <Badge className={instance.state === 'running' ? 'bg-green-600' : 'bg-gray-500'}>
                    {instance.state}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Instance Type</p>
                <p className="mt-1">{instance.instance_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">AMI ID</p>
                <p className="mt-1">{instance.ami_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Platform</p>
                <p className="mt-1">{instance.platform}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Launch Time</p>
                <p className="mt-1">{instance.launch_time ? new Date(instance.launch_time).toLocaleString() : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monitoring</p>
                <p className="mt-1">{instance.monitoring}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tenancy</p>
                <p className="mt-1">{instance.tenancy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Key Pair Name</p>
                <p className="mt-1">{instance.key_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Public DNS</p>
                <p className="mt-1 break-all">{instance.public_dns || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Private DNS</p>
                <p className="mt-1 break-all">{instance.private_dns || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">VPC ID</p>
                <p className="mt-1">{instance.vpc_id || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Subnet ID</p>
                <p className="mt-1">{instance.subnet_id || '-'}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4">Security Groups</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Security Group ID</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instance.security_groups.length > 0 ? instance.security_groups.map((sg) => (
                  <TableRow key={sg.GroupId}>
                    <TableCell>{sg.GroupName}</TableCell>
                    <TableCell>{sg.GroupId}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">No security groups attached</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">IAM Role</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">IAM Instance Profile ARN</p>
              <p>{instance.iam_role || 'None'}</p>
            </div>
          </Card>
        </TabsContent>

        {/* Networking Tab */}
        <TabsContent value="networking" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4">Networking Details</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">VPC ID</p>
                <p className="mt-1">{instance.vpc_id || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Subnet ID</p>
                <p className="mt-1">{instance.subnet_id || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Public DNS (IPv4)</p>
                <p className="mt-1 break-all">{instance.public_dns || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Private DNS</p>
                <p className="mt-1 break-all">{instance.private_dns || '-'}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4">Block Devices (EBS Volumes)</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device Name</TableHead>
                  <TableHead>Volume ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size (GiB)</TableHead>
                  <TableHead>IOPS</TableHead>
                  <TableHead>Encrypted</TableHead>
                  <TableHead>Delete on Term.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instance.block_devices.length > 0 ? instance.block_devices.map((bd) => (
                  <TableRow key={bd.volume_id}>
                    <TableCell>{bd.device_name}</TableCell>
                    <TableCell>{bd.volume_id}</TableCell>
                    <TableCell>{bd.volume_type}</TableCell>
                    <TableCell>{bd.size}</TableCell>
                    <TableCell>{bd.iops || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={bd.encrypted ? "outline" : "secondary"}>{bd.encrypted ? 'Yes' : 'No'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={bd.delete_on_termination ? "outline" : "secondary"}>{bd.delete_on_termination ? 'Yes' : 'No'}</Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">No block devices found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags" className="space-y-4">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3>Resource Tags</h3>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instance.tags.length > 0 ? instance.tags.map((tag) => (
                  <TableRow key={tag.Key}>
                    <TableCell className="font-medium">{tag.Key}</TableCell>
                    <TableCell>{tag.Value}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-gray-500">No tags</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Scaling Config Dialog */}
      <ScalingConfigDialog
        open={isConfigDialogOpen}
        onOpenChange={setIsConfigDialogOpen}
        instanceName={instance.name}
      />

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
