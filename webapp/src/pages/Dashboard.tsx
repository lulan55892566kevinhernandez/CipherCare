import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  FileText, 
  TrendingUp, 
  Plus,
  Eye,
  Activity,
  Lock
} from 'lucide-react';
import { useSystemStats, useMemberBenefitCount } from '@/hooks/useContract';
import SubmitBenefitForm from '@/components/SubmitBenefitForm';
import MyBenefits from '@/components/MyBenefits';
import AssessmentCenter from '@/components/AssessmentCenter';
import SystemOverview from '@/components/SystemOverview';
import RoleManager from '@/components/RoleManager';
import PolicyManagement from '@/components/PolicyManagement';

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const { data: systemStats, isLoading: statsLoading } = useSystemStats();
  const { data: benefitCount, isLoading: countLoading } = useMemberBenefitCount(address || '0x0');

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl mb-2">Connect Your Wallet</CardTitle>
            <CardDescription className="text-base">
              Connect your wallet to access the CipherCare dashboard and manage your privacy-preserving benefits
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Connect with MetaMask, WalletConnect, or other supported wallets to:
              </p>
              <div className="grid grid-cols-1 gap-2 text-sm text-left">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Submit encrypted benefit records</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Request privacy-preserving assessments</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>View your benefit history</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Access FHE-protected data</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <ConnectButton />
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                🔒 Your data is protected by Fully Homomorphic Encryption (FHE)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">CipherCare Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Manage your privacy-preserving benefits on-chain
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              FHE Protected
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : systemStats?.[0]?.toString() || '0'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Benefits</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : systemStats?.[1]?.toString() || '0'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : systemStats?.[2]?.toString() || '0'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Benefits</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {countLoading ? '...' : benefitCount?.toString() || '0'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="benefits">My Benefits</TabsTrigger>
            <TabsTrigger value="submit">Submit Benefit</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <SystemOverview />
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <PolicyManagement />
          </TabsContent>

          <TabsContent value="benefits" className="space-y-6">
            <MyBenefits />
          </TabsContent>

          <TabsContent value="submit" className="space-y-6">
            <SubmitBenefitForm />
          </TabsContent>

          <TabsContent value="assessment" className="space-y-6">
            <AssessmentCenter />
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <RoleManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
