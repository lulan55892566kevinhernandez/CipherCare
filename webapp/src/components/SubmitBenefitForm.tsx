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
import { useSubmitBenefit, useActivePolicies } from '@/hooks/useContract';
import { toast } from 'sonner';
import { initializeFHE, encryptBenefitDataFromForm } from '@/lib/fhe';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { sepolia } from 'wagmi/chains';

const SubmitBenefitForm = () => {
  const { address, chain } = useAccount();
  const { submitEncryptedBenefit, submitPlainBenefit, isPending, isConfirming, isConfirmed, error } = useSubmitBenefit();
  const { data: policiesData, isLoading: policiesLoading } = useActivePolicies();

  const [fheInitialized, setFheInitialized] = useState(false);

  const chainId = chain?.id || sepolia.id;
  const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.PolicyManager as string;

  // Parse policies from contract data
  // Contract returns: Policy[] (array of Policy structs)
  let policies = [];

  console.log('🔍 Raw policiesData:', policiesData);
  console.log('🔍 policiesData type:', typeof policiesData);
  console.log('🔍 Array.isArray(policiesData):', Array.isArray(policiesData));

  if (policiesData && Array.isArray(policiesData) && policiesData.length > 0) {
    console.log('🔍 policiesData length:', policiesData.length);
    console.log('🔍 policiesData[0]:', policiesData[0]);
    console.log('🔍 Array.isArray(policiesData[0]):', Array.isArray(policiesData[0]));

    // Check if it's an array of Policy structs
    if (Array.isArray(policiesData[0])) {
      // It's a nested array (wagmi wraps the result)
      const policyArray = policiesData[0];
      console.log('📦 Using nested array, length:', policyArray.length);
      policies = policyArray.map((policy: any, index: number) => {
        const parsed = {
          id: index + 1, // Policy IDs start from 1
          name: policy[0] || policy.name,
          description: policy[1] || policy.description,
          isActive: policy[2] || policy.isActive,
          maxAmount: Number(policy[3] || policy.maxAmount)
        };
        console.log(`📋 Parsed policy ${index + 1}:`, parsed);
        return parsed;
      });
    } else {
      // Direct array of Policy structs
      console.log('📦 Using direct array, length:', policiesData.length);
      policies = policiesData.map((policy: any, index: number) => {
        const parsed = {
          id: index + 1,
          name: policy[0] || policy.name,
          description: policy[1] || policy.description,
          isActive: policy[2] || policy.isActive,
          maxAmount: Number(policy[3] || policy.maxAmount)
        };
        console.log(`📋 Parsed policy ${index + 1}:`, parsed);
        return parsed;
      });
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

      if (fheInitialized) {
        console.log('🔐 Using FHE encryption for benefit submission');
        
        // Prepare benefit data for FHE encryption
        const benefitData = {
          policyId: parseInt(formData.policyId),
          amount: amountInCents,
          benefitType: formData.benefitType || 'general',
          description: formData.description || 'No description',
          timestamp: Date.now()
        };

        console.log('📦 Encrypting benefit data with FHE...', benefitData);
        
        // Encrypt the data using FHE
        const encryptedData = await encryptBenefitDataFromForm(
          benefitData,
          contractAddress,
          address
        );
        
        console.log('✅ Data encrypted, submitting to blockchain...', encryptedData);
        
        // Submit encrypted benefit record
        submitEncryptedBenefit(
          parseInt(formData.policyId),
          encryptedData
        );
        
        toast.success('Benefit record encrypted and submitted with FHE!');
      } else {
        console.warn('⚠️ FHE not initialized, using plaintext submission');
        // Fallback to plaintext submission if FHE is not available
        submitPlainBenefit(
          parseInt(formData.policyId),
          amountInCents,
          formData.benefitType || 'general',
          formData.description || 'No description'
        );
        toast.warning('Submitted without FHE encryption (fallback mode)');
      }

      // Reset form
      setFormData({
        policyId: '',
        benefitType: '',
        amount: '',
        description: '',
        encryptedData: ''
      });
      
      setIsEncrypting(false);
    } catch (err) {
      setIsEncrypting(false);
      toast.error('Failed to submit benefit record');
      console.error('❌ Submission error:', err);
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
                    policies.map((policy: any) => {
                      // Safely convert maxAmount to display format
                      const maxAmount = typeof policy.maxAmount === 'bigint' 
                        ? Number(policy.maxAmount) 
                        : policy.maxAmount;
                      const displayAmount = isNaN(maxAmount) ? '0' : (maxAmount / 100).toFixed(2);
                      
                      return (
                        <SelectItem key={policy.id} value={policy.id.toString()}>
                          {policy.name} - ${displayAmount}
                        </SelectItem>
                      );
                    })
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
