import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import type { UserRole } from '../contexts/UserContext';
import { Shield, Code, Settings, User, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  open: boolean;
  onLogin: (username: string, role: UserRole) => void;
}

export function LoginModal({ open, onLogin }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [productUsername, setProductUsername] = useState('');
  const [productPassword, setProductPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleTesterLogin = () => {
    if (username && selectedRole) {
      onLogin(username, selectedRole);
    }
  };

  const handleProductLogin = () => {
    setLoginError('');
    
    // Mock backend authentication
    // In production, this would make an API call to verify credentials
    const mockUsers: Record<string, { password: string; role: UserRole }> = {
      admin: { password: 'admin123', role: 'Admin' },
      developer: { password: 'dev123', role: 'Developer' },
      devops: { password: 'devops123', role: 'DevOps Engineer' },
      user: { password: 'user123', role: 'User' },
    };

    const user = mockUsers[productUsername.toLowerCase()];
    
    if (user && user.password === productPassword) {
      onLogin(productUsername, user.role);
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const roles = [
    {
      value: 'Admin',
      label: 'Admin',
      icon: Shield,
      description: 'Full access to audit logs, user management, and system configuration',
      color: 'text-red-600',
    },
    {
      value: 'Developer',
      label: 'Developer',
      icon: Code,
      description: 'API access, custom dashboards, and instance connectivity',
      color: 'text-blue-600',
    },
    {
      value: 'DevOps Engineer',
      label: 'DevOps Engineer',
      icon: Settings,
      description: 'Auto-scaling, alerts, and orchestration configuration',
      color: 'text-green-600',
    },
    {
      value: 'User',
      label: 'User',
      icon: User,
      description: 'View-only access to instances, monitoring, and basic operations',
      color: 'text-gray-600',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Login to CloudSim</DialogTitle>
          <DialogDescription>
            Access CloudSim features with your credentials
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="tester" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tester">Tester Mode</TabsTrigger>
            <TabsTrigger value="product">Product Mode</TabsTrigger>
          </TabsList>

          {/* Tester Mode */}
          <TabsContent value="tester" className="space-y-6 mt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Testing mode allows you to quickly switch between different roles to test access controls and features.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Select Role</Label>
              <div className="grid gap-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <Card
                      key={role.value}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedRole === role.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'hover:border-gray-400'
                      }`}
                      onClick={() => setSelectedRole(role.value as UserRole)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${role.color}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{role.label}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {role.description}
                          </p>
                        </div>
                        {selectedRole === role.value && (
                          <div className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center">
                            <svg
                              className="h-3 w-3 text-white"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              onClick={handleTesterLogin}
              disabled={!username || !selectedRole}
            >
              Login as Tester
            </Button>
          </TabsContent>

          {/* Product Mode */}
          <TabsContent value="product" className="space-y-6 mt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Production mode authenticates against the backend database. Your role will be determined by your credentials.
              </AlertDescription>
            </Alert>

            {loginError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product-username">Username</Label>
                <Input
                  id="product-username"
                  placeholder="Enter your username"
                  value={productUsername}
                  onChange={(e) => {
                    setProductUsername(e.target.value);
                    setLoginError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && productUsername && productPassword) {
                      handleProductLogin();
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-password">Password</Label>
                <Input
                  id="product-password"
                  type="password"
                  placeholder="Enter your password"
                  value={productPassword}
                  onChange={(e) => {
                    setProductPassword(e.target.value);
                    setLoginError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && productUsername && productPassword) {
                      handleProductLogin();
                    }
                  }}
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>Admin: admin / admin123</p>
                <p>Developer: developer / dev123</p>
                <p>DevOps: devops / devops123</p>
                <p>User: user / user123</p>
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              onClick={handleProductLogin}
              disabled={!productUsername || !productPassword}
            >
              Login
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
