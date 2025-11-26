import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Separator } from "./ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Play,
  Square,
  RotateCw,
  Trash2,
  Copy,
  ExternalLink,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { ScalingConfigDialog } from "./ScalingConfigDialog";

export function InstanceDetailsPage() {
  const [isConfigDialogOpen, setIsConfigDialogOpen] =
    useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1>web-server-01</h1>
            <Badge className="bg-green-600">Running</Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            i-0a1b2c3d4e5f6g7h8
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsConfigDialogOpen(true)}
            className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button variant="outline" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Start
          </Button>
          <Button variant="outline" size="sm">
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
          <Button variant="outline" size="sm">
            <RotateCw className="h-4 w-4 mr-2" />
            Reboot
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Terminate
          </Button>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Instance Type</p>
          <p className="mt-1">t2.micro</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">
            Availability Zone
          </p>
          <p className="mt-1">us-east-1a</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Public IPv4</p>
          <div className="flex items-center gap-2 mt-1">
            <p>54.123.45.67</p>
            <button className="text-gray-400 hover:text-gray-600">
              <Copy className="h-3 w-3" />
            </button>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Private IPv4</p>
          <div className="flex items-center gap-2 mt-1">
            <p>172.31.16.22</p>
            <button className="text-gray-400 hover:text-gray-600">
              <Copy className="h-3 w-3" />
            </button>
          </div>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="networking">
            Networking
          </TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4">Instance Details</h3>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-sm text-gray-600">
                  Instance ID
                </p>
                <p className="mt-1">i-0a1b2c3d4e5f6g7h8</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Instance State
                </p>
                <div className="mt-1">
                  <Badge className="bg-green-600">
                    Running
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Instance Type
                </p>
                <p className="mt-1">t2.micro</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">AMI ID</p>
                <p className="mt-1">ami-0c55b159cbfafe1f0</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  AMI Name
                </p>
                <p className="mt-1">Amazon Linux 2023 AMI</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Platform
                </p>
                <p className="mt-1">Linux/UNIX</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Launch Time
                </p>
                <p className="mt-1">2025-11-13 08:30:45 UTC</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="mt-1">5 days, 14 hours</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Monitoring
                </p>
                <p className="mt-1">Basic (5 min)</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tenancy</p>
                <p className="mt-1">Default</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">CPU & Memory</h3>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">vCPUs</p>
                <p className="mt-1">1</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Memory (GiB)
                </p>
                <p className="mt-1">1.0</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  CPU Credits
                </p>
                <p className="mt-1">T2 Unlimited Disabled</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4">Security Groups</h3>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Security Group ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>default</TableCell>
                  <TableCell>sg-0a1b2c3d4e5f6g7h</TableCell>
                  <TableCell>Default security group</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>web-server-sg</TableCell>
                  <TableCell>sg-1b2c3d4e5f6g7h8i</TableCell>
                  <TableCell>Allow HTTP and HTTPS</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">IAM Role</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                IAM Instance Profile
              </p>
              <p>EC2-S3-Read-Only-Role</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">Key Pair</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Key Pair Name
              </p>
              <p>my-ec2-keypair</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="networking" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4">Network Interfaces</h3>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Interface ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Private IP</TableHead>
                  <TableHead>Public IP</TableHead>
                  <TableHead>Subnet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>eni-0a1b2c3d4e5f</TableCell>
                  <TableCell>
                    <Badge variant="outline">Primary</Badge>
                  </TableCell>
                  <TableCell>172.31.16.22</TableCell>
                  <TableCell>54.123.45.67</TableCell>
                  <TableCell>subnet-0a1b2c3d</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">VPC Details</h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">VPC ID</p>
                <p className="mt-1">vpc-0a1b2c3d4e5f</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Subnet ID
                </p>
                <p className="mt-1">subnet-0a1b2c3d</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Availability Zone
                </p>
                <p className="mt-1">us-east-1a</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  VPC Name
                </p>
                <p className="mt-1">default-vpc</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">DNS Settings</h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">
                  Public DNS (IPv4)
                </p>
                <p className="mt-1">
                  ec2-54-123-45-67.compute-1.amazonaws.com
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Private DNS
                </p>
                <p className="mt-1">
                  ip-172-31-16-22.ec2.internal
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4">Block Devices</h3>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device Name</TableHead>
                  <TableHead>Volume ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>IOPS</TableHead>
                  <TableHead>Throughput</TableHead>
                  <TableHead>Delete on Termination</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>/dev/xvda</TableCell>
                  <TableCell>vol-0a1b2c3d4e5f6g7h</TableCell>
                  <TableCell>gp3</TableCell>
                  <TableCell>8 GiB</TableCell>
                  <TableCell>3000</TableCell>
                  <TableCell>125 MB/s</TableCell>
                  <TableCell>
                    <Badge variant="outline">Yes</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="space-y-4">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3>Resource Tags</h3>
              <Button variant="outline" size="sm">
                Add Tag
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>web-server-01</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Environment</TableCell>
                  <TableCell>Production</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Owner</TableCell>
                  <TableCell>DevOps Team</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Project</TableCell>
                  <TableCell>WebApp-2025</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Scaling Config Dialog */}
      <ScalingConfigDialog
        open={isConfigDialogOpen}
        onOpenChange={setIsConfigDialogOpen}
        instanceName="web-server-01"
      />
    </div>
  );
}