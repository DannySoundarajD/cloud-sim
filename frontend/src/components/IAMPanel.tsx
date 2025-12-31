import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { useUser } from '../contexts/UserContext';
import type { UserRole } from '../contexts/UserContext';
import { Shield, Download, Database, Network, Bell, Code, BarChart3, Lock, Activity, DollarSign, CreditCard, TrendingUp, Plus, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import * as adminApi from '../api/admin';

interface IAMPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IAMPanel({ open, onOpenChange }: IAMPanelProps) {
  const { user, hasRole } = useUser();
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [deniedAction, setDeniedAction] = useState('');
  const [deniedRequiredRole, setDeniedRequiredRole] = useState<UserRole>(null);

  // User management state
  const [users, setUsers] = useState<adminApi.AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('User');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userError, setUserError] = useState('');

  // Fetch users when panel opens (Admin only)
  useEffect(() => {
    if (open && user?.role === 'Admin') {
      fetchUsers();
    }
  }, [open, user?.role]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await adminApi.listUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleCreateUser = async () => {
    setUserError('');
    setIsCreatingUser(true);
    try {
      await adminApi.createUser({
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      });
      setShowAddUserDialog(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('User');
      fetchUsers();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        || 'Failed to create user';
      setUserError(message);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: number, email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;
    try {
      await adminApi.deleteUser(userId);
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const checkAccess = (requiredRole: UserRole, action: string) => {
    if (!hasRole(requiredRole)) {
      setDeniedAction(action);
      setDeniedRequiredRole(requiredRole);
      setShowAccessDenied(true);
      return false;
    }
    return true;
  };

  // Mock audit logs
  const auditLogs = [
    { id: 1, user: 'john.doe', action: 'Created instance i-1a2b3c4d', timestamp: '2025-11-14 10:30:15' },
    { id: 2, user: 'jane.smith', action: 'Modified auto-scale policy', timestamp: '2025-11-14 09:15:22' },
    { id: 3, user: 'admin.user', action: 'Added new user', timestamp: '2025-11-14 08:45:10' },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>IAM & Advanced Settings</SheetTitle>
            <SheetDescription>
              Manage access controls and advanced configurations
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{user?.username}</Badge>
                <Badge className="bg-orange-100 text-orange-700">{user?.role}</Badge>
              </div>
            </SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="overview" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-medium mb-3">Current Role Capabilities</h3>
                <div className="space-y-3">
                  {user?.role === 'Admin' && (
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Administrator</p>
                        <p className="text-sm text-gray-600">
                          Full access to audit logs, user management, resource quotas, network testing, and cost management
                        </p>
                      </div>
                    </div>
                  )}
                  {user?.role === 'Developer' && (
                    <div className="flex items-start gap-3">
                      <Code className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Developer</p>
                        <p className="text-sm text-gray-600">
                          API access, custom dashboard creation, instance connectivity via REST APIs, and cost tracking
                        </p>
                      </div>
                    </div>
                  )}
                  {user?.role === 'DevOps Engineer' && (
                    <div className="flex items-start gap-3">
                      <Activity className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">DevOps Engineer</p>
                        <p className="text-sm text-gray-600">
                          Auto-scaling configuration, metric alerts, orchestration settings, and cost optimization
                        </p>
                      </div>
                    </div>
                  )}
                  {user?.role === 'User' && (
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">User</p>
                        <p className="text-sm text-gray-600">
                          Instance monitoring, compute resource scaling, configuration management, and cost visibility
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-medium mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      if (checkAccess('Admin', 'export audit logs')) {
                        alert('Exporting audit logs...');
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Audit Logs
                    {!hasRole('Admin') && <Lock className="h-3 w-3 ml-auto text-gray-400" />}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      if (checkAccess('DevOps Engineer', 'configure auto-scaling')) {
                        alert('Opening auto-scale configuration...');
                      }
                    }}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Configure Auto-Scaling
                    {!hasRole('DevOps Engineer') && <Lock className="h-3 w-3 ml-auto text-gray-400" />}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      if (checkAccess('Developer', 'access API dashboard')) {
                        alert('Opening API dashboard...');
                      }
                    }}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    API Dashboard
                    {!hasRole('Developer') && <Lock className="h-3 w-3 ml-auto text-gray-400" />}
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Advanced Settings Tab - Combined */}
            <TabsContent value="advanced" className="space-y-4">
              {/* Advanced Settings Overview */}
              <Card className="p-4">
                <h3 className="font-medium mb-3">Advanced Settings</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Configure advanced features and role-specific settings for your CloudSim environment.
                </p>
                <div className="space-y-3">
                  {user?.role === 'Admin' && (
                    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                      <Shield className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Administrator Settings Available</p>
                        <p className="text-sm text-gray-600">
                          Access user management, audit trails, resource quotas, and network testing
                        </p>
                      </div>
                    </div>
                  )}
                  {user?.role === 'Developer' && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <Code className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Developer Settings Available</p>
                        <p className="text-sm text-gray-600">
                          Configure API access, manage custom dashboards, and control REST API endpoints
                        </p>
                      </div>
                    </div>
                  )}
                  {user?.role === 'DevOps Engineer' && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                      <Activity className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">DevOps Settings Available</p>
                        <p className="text-sm text-gray-600">
                          Manage auto-scaling, configure metric alerts, and control session orchestration
                        </p>
                      </div>
                    </div>
                  )}
                  {user?.role === 'User' && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                      <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Limited Access</p>
                        <p className="text-sm text-gray-600">
                          Your current role has view-only access. Contact your administrator for elevated permissions.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Admin-specific content */}
              {user?.role === 'Admin' && (
                <>
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">User Management</h3>
                      <Button
                        size="sm"
                        onClick={() => setShowAddUserDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </div>

                    {isLoadingUsers ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((u) => (
                            <TableRow key={u.id}>
                              <TableCell>{u.email}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{u.role}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={u.is_active ? "default" : "secondary"}>
                                  {u.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteUser(u.id, u.email)}
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </Card>

                  {/* Add User Dialog */}
                  <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                          Create a new user account with specified role.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {userError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                            {userError}
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="new-email">Email</Label>
                          <Input
                            id="new-email"
                            type="email"
                            placeholder="user@example.com"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">Password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            placeholder="Enter password"
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-role">Role</Label>
                          <Select value={newUserRole} onValueChange={setNewUserRole}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="User">User</SelectItem>
                              <SelectItem value="Developer">Developer</SelectItem>
                              <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                              <SelectItem value="Admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateUser}
                          disabled={!newUserEmail || !newUserPassword || isCreatingUser}
                        >
                          {isCreatingUser ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create User'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Card className="p-4">
                    <h3 className="font-medium mb-4">Audit Trail</h3>
                    <div className="space-y-3">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                          <Activity className="h-4 w-4 text-gray-400 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm">{log.action}</p>
                            <p className="text-xs text-gray-500">by {log.user} • {log.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => {
                        if (checkAccess('Admin', 'export audit logs')) {
                          alert('Exporting audit logs...');
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Logs
                    </Button>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-medium mb-4">Resource Quotas</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="max-instances">Maximum Instances</Label>
                        <Input
                          id="max-instances"
                          type="number"
                          defaultValue="20"
                          onClick={() => checkAccess('Admin', 'modify resource quotas')}
                          disabled={!hasRole('Admin')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-storage">Maximum Storage (GB)</Label>
                        <Input
                          id="max-storage"
                          type="number"
                          defaultValue="500"
                          onClick={() => checkAccess('Admin', 'modify resource quotas')}
                          disabled={!hasRole('Admin')}
                        />
                      </div>
                      <Button
                        disabled={!hasRole('Admin')}
                        onClick={() => {
                          if (checkAccess('Admin', 'save quota settings')) {
                            alert('Quota settings saved');
                          }
                        }}
                      >
                        Save Quota Settings
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-medium mb-4">Network Performance Testing</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Bandwidth Limit (Mbps)</Label>
                        <Slider
                          defaultValue={[100]}
                          max={1000}
                          step={10}
                          disabled={!hasRole('Admin')}
                          onValueChange={() => {
                            if (!hasRole('Admin')) {
                              checkAccess('Admin', 'adjust bandwidth');
                            }
                          }}
                        />
                        <p className="text-sm text-gray-600">Current: 100 Mbps</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Simulated Latency (ms)</Label>
                        <Slider
                          defaultValue={[50]}
                          max={500}
                          step={5}
                          disabled={!hasRole('Admin')}
                          onValueChange={() => {
                            if (!hasRole('Admin')) {
                              checkAccess('Admin', 'adjust latency');
                            }
                          }}
                        />
                        <p className="text-sm text-gray-600">Current: 50 ms</p>
                      </div>
                      <Button
                        disabled={!hasRole('Admin')}
                        onClick={() => {
                          if (checkAccess('Admin', 'apply network settings')) {
                            alert('Network settings applied');
                          }
                        }}
                      >
                        Apply Network Settings
                      </Button>
                    </div>
                  </Card>
                </>
              )}

              {/* Developer-specific content */}
              {user?.role === 'Developer' && (
                <>
                  <Card className="p-4">
                    <h3 className="font-medium mb-4">API Configuration</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="api-key">API Key</Label>
                        <div className="flex gap-2">
                          <Input
                            id="api-key"
                            type="password"
                            value="sk_live_••••••••••••••••"
                            readOnly
                            disabled={!hasRole('Developer')}
                          />
                          <Button
                            variant="outline"
                            disabled={!hasRole('Developer')}
                            onClick={() => {
                              if (checkAccess('Developer', 'regenerate API key')) {
                                alert('API key regenerated');
                              }
                            }}
                          >
                            Regenerate
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="api-endpoint">API Endpoint</Label>
                        <Input
                          id="api-endpoint"
                          value="https://api.cloudsim.com/v1"
                          readOnly
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-medium mb-4">REST API Access</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Instance Management API</p>
                          <p className="text-xs text-gray-600">GET, POST, PUT, DELETE /instances</p>
                        </div>
                        <Badge>Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Monitoring API</p>
                          <p className="text-xs text-gray-600">GET /metrics, /logs</p>
                        </div>
                        <Badge>Enabled</Badge>
                      </div>
                      <Button
                        disabled={!hasRole('Developer')}
                        onClick={() => {
                          if (checkAccess('Developer', 'view API documentation')) {
                            alert('Opening API documentation...');
                          }
                        }}
                      >
                        <Code className="h-4 w-4 mr-2" />
                        View API Documentation
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-medium mb-4">Custom Dashboards</h3>
                    <div className="space-y-3">
                      <Button
                        className="w-full"
                        disabled={!hasRole('Developer')}
                        onClick={() => {
                          if (checkAccess('Developer', 'create custom dashboard')) {
                            alert('Creating custom dashboard...');
                          }
                        }}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Create New Dashboard
                      </Button>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm font-medium mb-2">Existing Dashboards</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Production Metrics</span>
                            <Button size="sm" variant="ghost" disabled={!hasRole('Developer')}>
                              Edit
                            </Button>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Dev Environment Status</span>
                            <Button size="sm" variant="ghost" disabled={!hasRole('Developer')}>
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </>
              )}

              {/* DevOps-specific content */}
              {user?.role === 'DevOps Engineer' && (
                <>
                  <Card className="p-4">
                    <h3 className="font-medium mb-4">Auto-Scaling Configuration</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Auto-Scaling</Label>
                          <p className="text-sm text-gray-600">Automatically scale instances based on triggers</p>
                        </div>
                        <Switch
                          disabled={!hasRole('DevOps Engineer')}
                          onCheckedChange={() => {
                            if (!hasRole('DevOps Engineer')) {
                              checkAccess('DevOps Engineer', 'enable auto-scaling');
                            }
                          }}
                        />
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <Label htmlFor="scale-trigger">Scale Up Trigger</Label>
                        <Select
                          disabled={!hasRole('DevOps Engineer')}
                          onValueChange={() => {
                            if (!hasRole('DevOps Engineer')) {
                              checkAccess('DevOps Engineer', 'modify scale triggers');
                            }
                          }}
                        >
                          <SelectTrigger id="scale-trigger">
                            <SelectValue placeholder="Select trigger" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cpu">CPU {">"} 80%</SelectItem>
                            <SelectItem value="memory">Memory {">"} 75%</SelectItem>
                            <SelectItem value="requests">Requests {">"} 1000/min</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="min-instances">Minimum Instances</Label>
                        <Input
                          id="min-instances"
                          type="number"
                          defaultValue="2"
                          disabled={!hasRole('DevOps Engineer')}
                          onClick={() => {
                            if (!hasRole('DevOps Engineer')) {
                              checkAccess('DevOps Engineer', 'modify instance limits');
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-instances">Maximum Instances</Label>
                        <Input
                          id="max-instances"
                          type="number"
                          defaultValue="10"
                          disabled={!hasRole('DevOps Engineer')}
                          onClick={() => {
                            if (!hasRole('DevOps Engineer')) {
                              checkAccess('DevOps Engineer', 'modify instance limits');
                            }
                          }}
                        />
                      </div>
                      <Button
                        disabled={!hasRole('DevOps Engineer')}
                        onClick={() => {
                          if (checkAccess('DevOps Engineer', 'save auto-scale settings')) {
                            alert('Auto-scale settings saved');
                          }
                        }}
                      >
                        Save Auto-Scale Settings
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-medium mb-4">Metric Alerts</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bell className="h-4 w-4 text-orange-600" />
                          <div>
                            <p className="text-sm font-medium">High CPU Alert</p>
                            <p className="text-xs text-gray-600">Trigger when CPU {">"} 90%</p>
                          </div>
                        </div>
                        <Switch
                          defaultChecked
                          disabled={!hasRole('DevOps Engineer')}
                          onCheckedChange={() => {
                            if (!hasRole('DevOps Engineer')) {
                              checkAccess('DevOps Engineer', 'manage alerts');
                            }
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bell className="h-4 w-4 text-orange-600" />
                          <div>
                            <p className="text-sm font-medium">Memory Threshold Alert</p>
                            <p className="text-xs text-gray-600">Trigger when Memory {">"} 85%</p>
                          </div>
                        </div>
                        <Switch
                          defaultChecked
                          disabled={!hasRole('DevOps Engineer')}
                          onCheckedChange={() => {
                            if (!hasRole('DevOps Engineer')) {
                              checkAccess('DevOps Engineer', 'manage alerts');
                            }
                          }}
                        />
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={!hasRole('DevOps Engineer')}
                        onClick={() => {
                          if (checkAccess('DevOps Engineer', 'create alert')) {
                            alert('Creating new alert...');
                          }
                        }}
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Create New Alert
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-medium mb-4">Session Orchestration</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Persist Sessions</Label>
                          <p className="text-sm text-gray-600">Maintain session state across restarts</p>
                        </div>
                        <Switch
                          defaultChecked
                          disabled={!hasRole('DevOps Engineer')}
                          onCheckedChange={() => {
                            if (!hasRole('DevOps Engineer')) {
                              checkAccess('DevOps Engineer', 'configure session persistence');
                            }
                          }}
                        />
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                        <Input
                          id="session-timeout"
                          type="number"
                          defaultValue="30"
                          disabled={!hasRole('DevOps Engineer')}
                          onClick={() => {
                            if (!hasRole('DevOps Engineer')) {
                              checkAccess('DevOps Engineer', 'modify session settings');
                            }
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-save Configurations</Label>
                          <p className="text-sm text-gray-600">Automatically backup configuration changes</p>
                        </div>
                        <Switch
                          defaultChecked
                          disabled={!hasRole('DevOps Engineer')}
                          onCheckedChange={() => {
                            if (!hasRole('DevOps Engineer')) {
                              checkAccess('DevOps Engineer', 'configure auto-save');
                            }
                          }}
                        />
                      </div>
                      <Button
                        disabled={!hasRole('DevOps Engineer')}
                        onClick={() => {
                          if (checkAccess('DevOps Engineer', 'save orchestration settings')) {
                            alert('Orchestration settings saved');
                          }
                        }}
                      >
                        Save Orchestration Settings
                      </Button>
                    </div>
                  </Card>
                </>
              )}

              {/* User role-specific content - Compute Scaling */}
              {user?.role === 'User' && (
                <>
                  <Card className="p-4">
                    <h3 className="font-medium mb-4">Configure Specific Instance</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="select-instance">Select Instance</Label>
                        <Select defaultValue="instance-1">
                          <SelectTrigger id="select-instance">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instance-1">web-server-01 (i-0a1b2c3d4e5f6g7h8)</SelectItem>
                            <SelectItem value="instance-2">api-server-01 (i-1b2c3d4e5f6g7h9i)</SelectItem>
                            <SelectItem value="instance-3">db-server-01 (i-2c3d4e5f6g7h9i0j)</SelectItem>
                            <SelectItem value="instance-4">cache-server-01 (i-3d4e5f6g7h9i0j1k)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">Choose an instance to configure its resources and settings</p>
                      </div>

                      <Separator />

                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <p className="text-sm font-medium mb-2">Current Configuration</p>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p>Type: t2.micro • vCPU: 1 • Memory: 1GB</p>
                          <p>Storage: 30GB • Status: Running</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-medium mb-4">Compute Resource Scaling</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Dynamic Scaling Enabled</Label>
                          <p className="text-sm text-gray-600">Adjust compute resources based on workload</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <Label htmlFor="user-instance-type">Instance Type</Label>
                        <Select defaultValue="t3.medium">
                          <SelectTrigger id="user-instance-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="t3.small">t3.small (2 vCPU, 2GB RAM) - $0.021/hr</SelectItem>
                            <SelectItem value="t3.medium">t3.medium (2 vCPU, 4GB RAM) - $0.042/hr</SelectItem>
                            <SelectItem value="t3.large">t3.large (2 vCPU, 8GB RAM) - $0.083/hr</SelectItem>
                            <SelectItem value="t3.xlarge">t3.xlarge (4 vCPU, 16GB RAM) - $0.166/hr</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>CPU Allocation (%)</Label>
                        <Slider defaultValue={[75]} max={100} step={5} />
                        <p className="text-sm text-gray-600">Current: 75%</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Memory Allocation (GB)</Label>
                        <Slider defaultValue={[3]} max={16} step={1} />
                        <p className="text-sm text-gray-600">Current: 3 GB</p>
                      </div>
                      <Button
                        onClick={() => {
                          alert('Compute resources scaled successfully for the selected instance');
                        }}
                      >
                        Apply Changes
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-medium mb-4">Instance Configuration</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-restart on Failure</Label>
                          <p className="text-sm text-gray-600">Automatically restart instance if it fails</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <Label htmlFor="user-storage">Storage (GB)</Label>
                        <Input
                          id="user-storage"
                          type="number"
                          defaultValue="50"
                          max="500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-backup">Backup Frequency</Label>
                        <Select defaultValue="daily">
                          <SelectTrigger id="user-backup">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Monitoring</Label>
                          <p className="text-sm text-gray-600">Detailed CloudWatch monitoring</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Button
                        onClick={() => {
                          alert('Configuration saved successfully for the selected instance');
                        }}
                      >
                        Save Configuration
                      </Button>
                    </div>
                  </Card>
                </>
              )}

              {/* Cost & Billing - Available to all roles */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Cost & Billing</h3>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>

                <div className="space-y-4">
                  {/* Current Month Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">This Month</p>
                      <p className="text-lg font-medium">$284.50</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">12% vs last month</span>
                      </div>
                    </div>
                    <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Projected</p>
                      <p className="text-lg font-medium">$350.00</p>
                      <span className="text-xs text-gray-600">End of month</span>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Last Month</p>
                      <p className="text-lg font-medium">$254.20</p>
                      <span className="text-xs text-gray-600">November 2025</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Cost Breakdown */}
                  <div>
                    <p className="text-sm font-medium mb-3">Cost Breakdown</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Compute (EC2)</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">$156.30</p>
                          <p className="text-xs text-gray-500">55%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Storage (EBS)</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">$68.20</p>
                          <p className="text-xs text-gray-500">24%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Network className="h-4 w-4 text-purple-600" />
                          <span className="text-sm">Network Transfer</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">$42.00</p>
                          <p className="text-xs text-gray-500">15%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-orange-600" />
                          <span className="text-sm">Monitoring</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">$18.00</p>
                          <p className="text-xs text-gray-500">6%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {user?.role === 'Admin' && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium mb-3">Billing Settings</p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="text-sm font-medium">Payment Method</p>
                              <p className="text-xs text-gray-600">•••• •••• •••• 4242</p>
                            </div>
                            <Button size="sm" variant="outline">
                              Update
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="text-sm font-medium">Billing Email</p>
                              <p className="text-xs text-gray-600">billing@example.com</p>
                            </div>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Cost Alerts</Label>
                              <p className="text-sm text-gray-600">Notify when costs exceed threshold</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      alert('Downloading detailed billing report...');
                    }}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {user?.role === 'Admin' ? 'View Detailed Report' : 'View My Usage'}
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Access Denied Alert */}
      <AlertDialog open={showAccessDenied} onOpenChange={setShowAccessDenied}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              Access Denied
            </AlertDialogTitle>
            <AlertDialogDescription>
              You do not have permission to {deniedAction}.
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Required Role:</span> {deniedRequiredRole}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">Your Role:</span> {user?.role}
                </p>
              </div>
              <p className="mt-3 text-sm">
                Please contact your administrator if you believe you should have access to this feature.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setShowAccessDenied(false)}>
              Understood
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
