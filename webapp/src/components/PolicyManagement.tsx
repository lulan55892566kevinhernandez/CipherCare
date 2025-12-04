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
import { useCreatePolicy, usePolicyCount, usePolicyDetails } from '@/hooks/useContract';
import { toast } from 'sonner';
import { useTransactionNotification } from '@/hooks/useTransactionNotification';

const PolicyManagement = () => {
  const { address, isConnected } = useAccount();
  const { createPolicy, isPending, isConfirming, isConfirmed, error, hash } = useCreatePolicy();
  const { data: policyCount, refetch: refetchPolicyCount } = usePolicyCount();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxAmount: ''
  });

  const [policies, setPolicies] = useState<any[]>([]);

  // Transaction notification hook - monitors on-chain status with explorer links
  const handleTxSuccess = useCallback(() => {
    refetchPolicyCount();
    setFormData({ name: '', description: '', maxAmount: '' });
  }, [refetchPolicyCount]);

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

  // Fetch all policies when count changes
  useEffect(() => {
    if (policyCount && Number(policyCount) > 0) {
      const fetchPolicies = async () => {
        const policyList = [];
        for (let i = 1; i <= Number(policyCount); i++) {
          policyList.push(i);
        }
        setPolicies(policyList);
      };
      fetchPolicies();
    }
  }, [policyCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.maxAmount) {
      toast.error('Please fill all fields');
      return;
    }

    const amount = parseFloat(formData.maxAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

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

      {/* Policies List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Existing Policies
          </CardTitle>
          <CardDescription>
            Total policies: {policyCount ? policyCount.toString() : '0'}
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
              {policies.map((policyId) => (
                <PolicyCard key={policyId} policyId={policyId} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Component to display individual policy details
const PolicyCard = ({ policyId }: { policyId: number }) => {
  const { data: policyData, isLoading } = usePolicyDetails(policyId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading policy {policyId}...
        </CardContent>
      </Card>
    );
  }

  if (!policyData) {
    return null;
  }

  // getPolicyDetails returns: [name, description, isActive, maxAmount, createdAt, priority, creator]
  const [name, description, isActive, maxAmount, createdAt, priority, creator] = policyData as [
    string,
    string,
    boolean,
    bigint,
    bigint,
    number,
    string
  ];

  return (
    <Card className={!isActive ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{name}</h3>
              <Badge variant={isActive ? 'default' : 'secondary'}>
                {isActive ? (
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
              <Badge variant="outline">ID: {policyId}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{description}</p>
            <p className="text-sm font-medium">
              Max Amount: ${(Number(maxAmount) / 100).toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PolicyManagement;

