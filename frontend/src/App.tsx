import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Plus, Settings, LogOut, User } from "lucide-react";
import { CreateInstanceModal } from "./components/CreateInstanceModal";
import { DashboardPage } from "./components/DashboardPage";
import { InstanceDetailsPage } from "./components/InstanceDetailsPage";
import { InstanceMonitoringPage } from "./components/InstanceMonitoringPage";
import { CloudSimLogo } from "./components/CloudSimLogo";
import { LoginModal } from "./components/LoginModal";
import { IAMPanel } from "./components/IAMPanel";
import { UserProvider, useUser } from "./contexts/UserContext";
import type { UserRole } from "./contexts/UserContext";

function AppContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isIAMPanelOpen, setIsIAMPanelOpen] = useState(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const { user, login, logout } = useUser();

  const handleInstanceClick = (id: string) => {
    setSelectedInstanceId(id);
    setActiveTab("details");
  };
  const handleLogin = (username: string, role: UserRole) => login(username, role);
  const handleLogout = () => { logout(); setActiveTab("dashboard"); };

  if (!user) return <LoginModal open={true} onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <CloudSimLogo />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">{user.username}</span>
              <Badge variant="outline" className="ml-1">{user.role}</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsIAMPanelOpen(true)}>
              <Settings className="h-4 w-4 mr-2" /> IAM & Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="details">Instance Details</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>
            <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md">
              <Plus className="h-4 w-4 mr-2" /> Launch Instance
            </Button>
          </div>

          <TabsContent value="dashboard">
            <DashboardPage onInstanceClick={handleInstanceClick} />
          </TabsContent>
          <TabsContent value="details">
            <div className="bg-white rounded-lg border p-8">
              <InstanceDetailsPage instanceId={selectedInstanceId} />
            </div>
          </TabsContent>
          <TabsContent value="monitoring">
            <div className="bg-white rounded-lg border p-8">
              <InstanceMonitoringPage />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <CreateInstanceModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <IAMPanel open={isIAMPanelOpen} onOpenChange={setIsIAMPanelOpen} />
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
