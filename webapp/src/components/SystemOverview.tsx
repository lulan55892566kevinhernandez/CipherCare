import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Lock, 
  Eye, 
  Activity,
  TrendingUp,
  Users,
  FileText,
  Zap
} from 'lucide-react';
import { useSystemStats, useAggregatedStats } from '@/hooks/useContract';

const SystemOverview = () => {
  const { data: systemStats, isLoading: statsLoading } = useSystemStats();
  const { data: aggregatedStats, isLoading: aggLoading } = useAggregatedStats();

  const features = [
    {
      icon: Shield,
      title: 'FHE Privacy Protection',
      description: 'All benefit data remains encrypted during computation using Fully Homomorphic Encryption',
      status: 'Active',
      color: 'text-green-500'
    },
    {
      icon: Lock,
      title: 'Zero-Knowledge Verification',
      description: 'Verify benefit eligibility without revealing sensitive personal information',
      status: 'Active',
      color: 'text-blue-500'
    },
    {
      icon: Eye,
      title: 'Obfuscated Reserves',
      description: 'System reserves are encrypted to prevent front-running and manipulation',
      status: 'Active',
      color: 'text-purple-500'
    },
    {
      icon: Activity,
      title: 'Real-time Assessment',
      description: 'Automated benefit assessment with privacy-preserving calculations',
      status: 'Active',
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Status
          </CardTitle>
          <CardDescription>
            Current status of the CipherCare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border">
                  <div className={`p-2 rounded-full bg-muted`}>
                    <Icon className={`w-4 h-4 ${feature.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{feature.title}</p>
                    <Badge variant="outline" className="text-xs">
                      {feature.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Network Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Network Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Members</span>
              <span className="text-2xl font-bold">
                {statsLoading ? '...' : systemStats?.[0]?.toString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Benefits</span>
              <span className="text-2xl font-bold">
                {statsLoading ? '...' : systemStats?.[1]?.toString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Policies</span>
              <span className="text-2xl font-bold">
                {statsLoading ? '...' : systemStats?.[2]?.toString() || '0'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">System Uptime</span>
                <span className="text-sm text-muted-foreground">99.9%</span>
              </div>
              <Progress value={99.9} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Privacy Score</span>
                <span className="text-sm text-muted-foreground">100%</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">FHE Processing</span>
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recent Network Activity
          </CardTitle>
          <CardDescription>
            Latest transactions and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm">New benefit record submitted</span>
              </div>
              <span className="text-xs text-muted-foreground">2 min ago</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-sm">Assessment completed</span>
              </div>
              <span className="text-xs text-muted-foreground">5 min ago</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-sm">Policy updated</span>
              </div>
              <span className="text-xs text-muted-foreground">10 min ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemOverview;

