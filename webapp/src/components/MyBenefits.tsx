import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Eye, 
  Lock, 
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';
import { useMemberBenefitCount, useMemberBenefitRecord } from '@/hooks/useContract';

interface BenefitRecord {
  encryptedData: string;
  policyId: number;
  timestamp: number;
  status: number;
}

const MyBenefits = () => {
  const { address } = useAccount();
  const { data: benefitCount, isLoading: countLoading } = useMemberBenefitCount(address || '0x0');
  const [benefits, setBenefits] = useState<BenefitRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock function to decrypt FHE data
  const decryptData = async (encryptedData: string) => {
    // In real implementation, this would use FHE SDK for decryption
    try {
      const decoded = atob(encryptedData);
      return JSON.parse(decoded);
    } catch {
      return { type: 'Unknown', amount: '0', description: 'Encrypted data' };
    }
  };

  const loadBenefits = async () => {
    if (!address || !benefitCount) return;
    
    setLoading(true);
    const benefitRecords: BenefitRecord[] = [];
    
    try {
      for (let i = 0; i < Number(benefitCount); i++) {
        // In real implementation, you would call useMemberBenefitRecord hook here
        // For now, we'll create mock data
        const mockRecord: BenefitRecord = {
          encryptedData: btoa(JSON.stringify({
            type: ['Medical', 'Education', 'Housing', 'Transportation'][i % 4],
            amount: (Math.random() * 1000 + 100).toFixed(2),
            description: `Benefit record ${i + 1} description`
          })),
          policyId: i + 1,
          timestamp: Date.now() - (i * 86400000), // Mock timestamps
          status: [0, 1, 2][i % 3] // 0: Pending, 1: Approved, 2: Rejected
        };
        benefitRecords.push(mockRecord);
      }
      setBenefits(benefitRecords);
    } catch (error) {
      console.error('Error loading benefits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBenefits();
  }, [address, benefitCount]);

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
      case 1:
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />Approved</Badge>;
      case 2:
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="w-3 h-3" />Rejected</Badge>;
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
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">Connect Wallet Required</h3>
            <p className="text-sm text-muted-foreground">
              Please connect your wallet to view your encrypted benefit records
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Benefits</h2>
          <p className="text-muted-foreground">
            View and manage your encrypted benefit records
          </p>
        </div>
        <Button onClick={loadBenefits} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Benefits Count */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Benefit Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-primary">
                {countLoading ? '...' : benefitCount?.toString() || '0'}
              </div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-green-500">
                {benefits.filter(b => b.status === 1).length}
              </div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-orange-500">
                {benefits.filter(b => b.status === 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits List */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your benefits...</p>
            </div>
          </CardContent>
        </Card>
      ) : benefits.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Benefits Found</h3>
              <p className="text-muted-foreground">
                You haven't submitted any benefit records yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {benefits.map((benefit, index) => (
            <BenefitCard 
              key={index} 
              benefit={benefit} 
              index={index}
              decryptData={decryptData}
              getStatusBadge={getStatusBadge}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* Privacy Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Protection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              All your benefit data is encrypted using Fully Homomorphic Encryption (FHE). 
              Only you and authorized parties can decrypt and view the sensitive information. 
              The blockchain only stores encrypted data, ensuring complete privacy.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

// Individual Benefit Card Component
const BenefitCard = ({ 
  benefit, 
  index, 
  decryptData, 
  getStatusBadge, 
  formatDate 
}: {
  benefit: BenefitRecord;
  index: number;
  decryptData: (data: string) => Promise<any>;
  getStatusBadge: (status: number) => JSX.Element;
  formatDate: (timestamp: number) => string;
}) => {
  const [decryptedData, setDecryptedData] = useState<any>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleDecrypt = async () => {
    if (decryptedData) {
      setShowDetails(!showDetails);
      return;
    }

    setIsDecrypting(true);
    try {
      const data = await decryptData(benefit.encryptedData);
      setDecryptedData(data);
      setShowDetails(true);
    } catch (error) {
      console.error('Decryption failed:', error);
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Benefit Record #{index + 1}</CardTitle>
              <CardDescription>
                Policy ID: {benefit.policyId} • {formatDate(benefit.timestamp)}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(benefit.status)}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecrypt}
              disabled={isDecrypting}
            >
              {isDecrypting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Decrypting...
                </>
              ) : showDetails ? (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Hide Details
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {showDetails && decryptedData && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-sm font-medium">Amount</div>
                <div className="text-lg font-bold">${decryptedData.amount}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">Type</div>
                <div className="font-medium">{decryptedData.type}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              <div>
                <div className="text-sm font-medium">Submitted</div>
                <div className="font-medium">{formatDate(benefit.timestamp)}</div>
              </div>
            </div>
          </div>
          {decryptedData.description && (
            <div className="mt-4 p-3 rounded-lg bg-background border">
              <div className="text-sm font-medium mb-1">Description</div>
              <div className="text-sm text-muted-foreground">{decryptedData.description}</div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default MyBenefits;
