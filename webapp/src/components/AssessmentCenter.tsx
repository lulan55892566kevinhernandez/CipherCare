import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, 
  Eye, 
  Lock, 
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Shield,
  Loader2,
  FileText
} from 'lucide-react';
import { useRequestAssessment, useActivePolicies } from '@/hooks/useContract';
import { toast } from 'sonner';

interface AssessmentRequest {
  id: string;
  policyId: number;
  member: string;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    eligible: boolean;
    amount: number;
    score: number;
  };
}

const AssessmentCenter = () => {
  const { address } = useAccount();
  const { requestAssessment, isPending, isConfirming, isConfirmed, error } = useRequestAssessment();
  const { data: policies, isLoading: policiesLoading } = useActivePolicies();
  
  const [selectedPolicy, setSelectedPolicy] = useState<string>('');
  const [assessments, setAssessments] = useState<AssessmentRequest[]>([
    // Mock data
    {
      id: '1',
      policyId: 1,
      member: address || '0x0',
      timestamp: Date.now() - 3600000,
      status: 'completed',
      result: {
        eligible: true,
        amount: 500,
        score: 85
      }
    },
    {
      id: '2',
      policyId: 2,
      member: address || '0x0',
      timestamp: Date.now() - 1800000,
      status: 'processing'
    }
  ]);

  const handleRequestAssessment = async () => {
    if (!address || !selectedPolicy) {
      toast.error('Please select a policy and ensure wallet is connected');
      return;
    }

    try {
      const requestId = await requestAssessment(address, parseInt(selectedPolicy));
      
      // Add new assessment request
      const newAssessment: AssessmentRequest = {
        id: requestId || Date.now().toString(),
        policyId: parseInt(selectedPolicy),
        member: address,
        timestamp: Date.now(),
        status: 'pending'
      };
      
      setAssessments(prev => [newAssessment, ...prev]);
      toast.success('Assessment request submitted successfully!');
      
      // Simulate processing
      setTimeout(() => {
        setAssessments(prev => prev.map(assessment => 
          assessment.id === newAssessment.id 
            ? { ...assessment, status: 'processing' }
            : assessment
        ));
      }, 2000);

      // Simulate completion
      setTimeout(() => {
        setAssessments(prev => prev.map(assessment => 
          assessment.id === newAssessment.id 
            ? { 
                ...assessment, 
                status: 'completed',
                result: {
                  eligible: Math.random() > 0.3,
                  amount: Math.floor(Math.random() * 1000) + 100,
                  score: Math.floor(Math.random() * 40) + 60
                }
              }
            : assessment
        ));
      }, 5000);

    } catch (err) {
      toast.error('Failed to request assessment');
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Processing</Badge>;
      case 'completed':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="w-3 h-3" />Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!address) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Calculator className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">Connect Wallet Required</h3>
            <p className="text-sm text-muted-foreground">
              Please connect your wallet to access the privacy-preserving assessment center
            </p>
          </div>
          <ConnectButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Assessment Center</h2>
        <p className="text-muted-foreground">
          Request privacy-preserving benefit assessments using FHE
        </p>
      </div>

      {/* Request New Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Request Assessment
          </CardTitle>
          <CardDescription>
            Submit a request for benefit eligibility assessment with encrypted data processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Policy</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={selectedPolicy}
                onChange={(e) => setSelectedPolicy(e.target.value)}
              >
                <option value="">Choose a policy...</option>
                {policiesLoading ? (
                  <option disabled>Loading policies...</option>
                ) : policies && policies.length > 0 ? (
                  policies.map((policy: any) => (
                    <option key={policy.id} value={policy.id}>
                      {policy.name} - {policy.description}
                    </option>
                  ))
                ) : (
                  <option disabled>No active policies available</option>
                )}
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleRequestAssessment}
                disabled={isPending || isConfirming || !selectedPolicy}
                className="w-full"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Request Assessment
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error: {error.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Assessment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Assessment History
          </CardTitle>
          <CardDescription>
            View your previous assessment requests and results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <div className="text-center py-8">
              <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Assessments Yet</h3>
              <p className="text-muted-foreground">
                Request your first benefit assessment to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <AssessmentCard 
                  key={assessment.id}
                  assessment={assessment}
                  getStatusBadge={getStatusBadge}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FHE Assessment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy-Preserving Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Lock className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Encrypted Processing</h4>
                <p className="text-sm text-muted-foreground">
                  All calculations performed on encrypted data using FHE
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Eye className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Zero-Knowledge Results</h4>
                <p className="text-sm text-muted-foreground">
                  Only eligibility and amount revealed, not personal data
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Individual Assessment Card Component
const AssessmentCard = ({ 
  assessment, 
  getStatusBadge, 
  formatDate 
}: {
  assessment: AssessmentRequest;
  getStatusBadge: (status: string) => JSX.Element;
  formatDate: (timestamp: number) => string;
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Assessment #{assessment.id}</CardTitle>
            <CardDescription>
              Policy ID: {assessment.policyId} • {formatDate(assessment.timestamp)}
            </CardDescription>
          </div>
          {getStatusBadge(assessment.status)}
        </div>
      </CardHeader>
      
      {assessment.status === 'processing' && (
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm">Processing encrypted data...</span>
            </div>
            <Progress value={66} className="h-2" />
            <p className="text-xs text-muted-foreground">
              FHE computation in progress. This may take a few minutes.
            </p>
          </div>
        </CardContent>
      )}

      {assessment.status === 'completed' && assessment.result && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {assessment.result.eligible ? 'Eligible' : 'Not Eligible'}
              </div>
              <div className="text-sm text-muted-foreground">Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                ${assessment.result.amount}
              </div>
              <div className="text-sm text-muted-foreground">Amount</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {assessment.result.score}%
              </div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 rounded-lg bg-background border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Assessment Summary</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Based on your encrypted benefit data and policy requirements, 
              you have been {assessment.result.eligible ? 'approved' : 'denied'} 
              for this benefit with a score of {assessment.result.score}%.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AssessmentCenter;
