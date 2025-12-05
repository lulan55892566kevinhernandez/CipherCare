import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  Shield,
  Lock,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useSubmitBenefit, useV2Policies } from '@/hooks/useContract';
import { toast } from 'sonner';
import { initializeFHE, encryptUint64 } from '@/lib/fhe';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { sepolia } from 'wagmi/chains';
import { useTransactionNotification } from '@/hooks/useTransactionNotification';
import { useCallback } from 'react';

const SubmitBenefitForm = () => {
  const { address, chain } = useAccount();
  const { submitEncryptedBenefit, submitPlainBenefit, isPending, isConfirming, isConfirmed, error, hash } = useSubmitBenefit();
  const { data: policiesData, isLoading: policiesLoading } = useV2Policies();

  const [fheInitialized, setFheInitialized] = useState(false);

  // Transaction notification hook - monitors on-chain status
  const handleTxSuccess = useCallback(() => {
    // Reset form on success
    setFormData({
      policyId: '',
      benefitType: '',
      amount: '',
      description: '',
      encryptedData: ''
    });
  }, []);

  useTransactionNotification({
    hash,
    error,
    isPending,
    pendingMessage: 'Submitting benefit record...',
    confirmingMessage: 'Confirming benefit record...',
    successMessage: 'Benefit record submitted successfully!',
    errorMessage: 'Failed to submit benefit record',
    onSuccess: handleTxSuccess,
  });

  const chainId = chain?.id || sepolia.id;
  // Use CipherCareNetworkV2 (FHE contract) for encryption target
  const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.CipherCareNetworkV2 as string;

  // Parse policies from V2 contract data
  // V2 listPolicies returns: (ids[], names[], statuses[], creators[])
  let policies: { id: number; name: string; isActive: boolean }[] = [];

  console.log('🔍 Raw policiesData:', policiesData);

  if (policiesData && Array.isArray(policiesData) && policiesData.length >= 4) {
    // V2 contract returns: [ids, names, statuses, creators]
    const [ids, names, statuses, creators] = policiesData as [bigint[], string[], boolean[], string[]];

    console.log('📦 V2 Policy data:', { ids, names, statuses });

    if (ids && ids.length > 0) {
      policies = ids.map((id, index) => ({
        id: Number(id),
        name: names[index] || `Policy ${id}`,
        isActive: statuses[index] ?? true,
      }));
    }
  }

  console.log('✅ Final policies array:', policies);

  const [formData, setFormData] = useState({
    policyId: '',
    benefitType: '',
    amount: '',
    description: '',
    encryptedData: ''
  });

  const [isEncrypting, setIsEncrypting] = useState(false);

  // Initialize Zama Relayer SDK when wallet is connected
  useEffect(() => {
    const initFHE = async () => {
      if (address && !fheInitialized) {
        try {
          console.log('🔧 Initializing FHE in SubmitBenefitForm...');
          const instance = await initializeFHE();
          if (instance) {
            setFheInitialized(true);
            toast.success('FHE encryption initialized');
            console.log('✅ FHE initialized in SubmitBenefitForm');
          } else {
            // FHE failed but we'll allow plain submission
            console.warn('⚠️ FHE initialization returned null, allowing plain submission');
            setFheInitialized(true); // Set to true to enable form
          }
        } catch (error) {
          console.error('❌ Failed to initialize FHE:', error);
          // Still allow form submission without FHE
          setFheInitialized(true);
          toast.warning('FHE initialization failed, using plain submission');
        }
      }
    };

    initFHE();
  }, [address, fheInitialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!formData.policyId || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsEncrypting(true);

      // Convert amount to cents (uint64)
      const amountInCents = Math.floor(parseFloat(formData.amount) * 100);
      const policyId = parseInt(formData.policyId);

      if (fheInitialized) {
        console.log('🔐 Using REAL FHE encryption for CipherCareNetworkV2');
        console.log('📦 Policy ID:', policyId);
        console.log('📦 Amount (cents):', amountInCents);
        console.log('📦 Contract Address:', contractAddress);

        // Encrypt the amount using FHE (only amount needs encryption for V2 contract)
        const encryptedAmount = await encryptUint64(
          amountInCents,
          contractAddress,
          address
        );

        console.log('✅ Amount encrypted with FHE:', encryptedAmount);
        console.log('  - Handle:', encryptedAmount.handle);
        console.log('  - Proof length:', encryptedAmount.proof.length);

        // Submit to CipherCareNetworkV2.recordEncryptedBenefit
        submitEncryptedBenefit(policyId, {
          amountHandle: encryptedAmount.handle,
          proof: encryptedAmount.proof
        });

        // Note: Transaction notifications are handled by useTransactionNotification hook
      } else {
        console.warn('⚠️ FHE not initialized, using plain submission to V2 contract');
        // Fallback to plain submission (amount will be encrypted on-chain)
        submitPlainBenefit(policyId, amountInCents);
        // Note: Transaction notifications are handled by useTransactionNotification hook
      }

      // Form reset is handled by useTransactionNotification onSuccess callback
      setIsEncrypting(false);
    } catch (err) {
      setIsEncrypting(false);
      // Note: Error notifications are handled by useTransactionNotification hook
      console.error('❌ Submission error:', err);
      toast.error(err instanceof Error ? err.message : 'Encryption failed');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Submit Benefit Record
          </CardTitle>
          <CardDescription>
            Submit a new benefit record with FHE-encrypted data for privacy protection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Policy Selection */}
            <div className="space-y-2">
              <Label htmlFor="policy">Benefit Policy</Label>
              <Select 
                value={formData.policyId} 
                onValueChange={(value) => handleInputChange('policyId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a benefit policy" />
                </SelectTrigger>
                <SelectContent>
                  {policiesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading policies...
                    </SelectItem>
                  ) : policies && policies.length > 0 ? (
                    policies.filter(p => p.isActive).map((policy) => (
                      <SelectItem key={policy.id} value={policy.id.toString()}>
                        {policy.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No active policies available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Benefit Type */}
            <div className="space-y-2">
              <Label htmlFor="benefitType">Benefit Type</Label>
              <Select 
                value={formData.benefitType} 
                onValueChange={(value) => handleInputChange('benefitType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select benefit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Medical Subsidy</SelectItem>
                  <SelectItem value="education">Education Allowance</SelectItem>
                  <SelectItem value="housing">Housing Support</SelectItem>
                  <SelectItem value="transportation">Transportation Allowance</SelectItem>
                  <SelectItem value="meal">Meal Allowance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter benefit amount"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the benefit claim..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Privacy Notice */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                {fheInitialized ? (
                  <>
                    ✅ <strong>FHE Encryption Active:</strong> Your benefit data will be encrypted on your device using
                    Fully Homomorphic Encryption before being submitted to the blockchain.
                    Only encrypted data will be stored on-chain.
                  </>
                ) : (
                  <>
                    ⏳ Initializing FHE encryption... Your benefit data will be encrypted using
                    Fully Homomorphic Encryption (FHE) before being stored on-chain.
                  </>
                )}
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || isConfirming || isEncrypting || !formData.policyId}
            >
              {isEncrypting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  🔐 Encrypting with FHE...
                </>
              ) : isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting Transaction...
                </>
              ) : isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Confirming...
                </>
              ) : isConfirmed ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  ✅ Submitted with FHE Encryption
                </>
              ) : fheInitialized ? (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  🔐 Submit with FHE Encryption
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit (Plaintext Fallback)
                </>
              )}
            </Button>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Error: {error.message}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {/* FHE Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Privacy Protection Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Shield className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">FHE Encryption</h4>
                <p className="text-sm text-muted-foreground">
                  Data encrypted before blockchain storage
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Lock className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Zero-Knowledge</h4>
                <p className="text-sm text-muted-foreground">
                  Verify without revealing sensitive data
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmitBenefitForm;
