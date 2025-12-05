import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  Shield
} from 'lucide-react';
import { useV2CreatePolicy, useV2Policies, useV2PolicyDetails } from '@/hooks/useContract';
import { useSwitchChain } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { toast } from 'sonner';
import { useTransactionNotification } from '@/hooks/useTransactionNotification';

const PolicyManagement = () => {
  const { address, isConnected, chain } = useAccount();
  const { createPolicy, isPending, isConfirming, isConfirmed, error, hash } = useV2CreatePolicy();
  const { data: policiesData, refetch: refetchPolicies } = useV2Policies();
  const { switchChain } = useSwitchChain();

  // Check if on wrong network
  const isWrongNetwork = chain && chain.id !== sepolia.id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxAmount: ''
  });

  // Parse policies from V2 contract data
  // V2 listPolicies returns: (ids[], names[], statuses[], creators[])
  let policies: { id: number; name: string; isActive: boolean; creator: string }[] = [];

  if (policiesData && Array.isArray(policiesData) && policiesData.length >= 4) {
    const [ids, names, statuses, creators] = policiesData as [bigint[], string[], boolean[], string[]];
    if (ids && ids.length > 0) {
      policies = ids.map((id, index) => ({
        id: Number(id),
        name: names[index] || `Policy ${id}`,
        isActive: statuses[index] ?? true,
        creator: creators[index] || ''
      }));
    }
  }

  // Transaction notification hook - monitors on-chain status with explorer links
  const handleTxSuccess = useCallback(() => {
    refetchPolicies();
    setFormData({ name: '', description: '', maxAmount: '' });
  }, [refetchPolicies]);

  useTransactionNotification({
    hash,
    error,
    isPending,
    pendingMessage: 'Creating policy...',
    confirmingMessage: 'Confirming policy creation...',
    successMessage: 'Policy created successfully!',
    errorMessage: 'Failed to create policy',
    onSuccess: handleTxSuccess,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check network first
    if (isWrongNetwork) {
      toast.error('Please switch to Sepolia network');
      try {
        switchChain({ chainId: sepolia.id });
      } catch (err) {
        console.error('Failed to switch network:', err);
      }
      return;
    }

    if (!formData.name || !formData.description || !formData.maxAmount) {
      toast.error('Please fill all fields');
      return;
    }

    const amount = parseFloat(formData.maxAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    // Create policy on CipherCareNetworkV2 (FHE contract)
    createPolicy(formData.name, formData.description, Math.floor(amount * 100)); // Convert to cents
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Policy Management</CardTitle>
          <CardDescription>Please connect your wallet to manage policies</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Policy Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Policy
          </CardTitle>
          <CardDescription>
            Create a new benefit policy for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Policy Name</Label>
              <Input
                id="name"
                placeholder="e.g., Medical Insurance"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isPending || isConfirming}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the benefit policy..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isPending || isConfirming}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAmount">Maximum Amount (USD)</Label>
              <Input
                id="maxAmount"
                type="number"
                placeholder="e.g., 5000"
                value={formData.maxAmount}
                onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                disabled={isPending || isConfirming}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isPending ? 'Creating...' : 'Confirming...'}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Policy
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Network Warning */}
      {isWrongNetwork && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>Please switch to Sepolia network to create policies</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => switchChain({ chainId: sepolia.id })}
            >
              Switch to Sepolia
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Policies List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Existing Policies (FHE V2)
          </CardTitle>
          <CardDescription>
            Total policies: {policies.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {policies.length === 0 ? (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                No policies created yet. Create your first policy above.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {policies.map((policy) => (
                <PolicyCard key={policy.id} policy={policy} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Component to display individual policy details
const PolicyCard = ({ policy }: { policy: { id: number; name: string; isActive: boolean; creator: string } }) => {
  const { data: policyData, isLoading } = useV2PolicyDetails(policy.id);

  // V2 getPolicyDetails returns: [name, description, isActive, creator, createdAt]
  const description = policyData ? (policyData as any[])[1] : '';

  return (
    <Card className={!policy.isActive ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{policy.name}</h3>
              <Badge variant={policy.isActive ? 'default' : 'secondary'}>
                {policy.isActive ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </>
                )}
              </Badge>
              <Badge variant="outline">ID: {policy.id}</Badge>
            </div>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading details...</p>
            ) : description ? (
              <p className="text-sm text-muted-foreground mb-2">{description}</p>
            ) : null}
            <p className="text-xs text-muted-foreground truncate">
              Creator: {policy.creator.slice(0, 6)}...{policy.creator.slice(-4)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PolicyManagement;

