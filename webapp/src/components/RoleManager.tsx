import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Users, 
  UserPlus,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { useHasRole, useRoleMemberCount, useGrantRole } from '@/hooks/useContract';

const RoleManager = () => {
  const { address } = useAccount();
  const [newAccount, setNewAccount] = useState('');
  const [selectedRole, setSelectedRole] = useState('MEMBER_ROLE');
  
  const { grantRole, isPending, isConfirming, isConfirmed, error } = useGrantRole();
  
  // Check if current user has governor role
  const { data: hasGovernorRole } = useHasRole('0x0000000000000000000000000000000000000000000000000000000000000000', address || '0x0');
  
  // Get role member counts
  const { data: governorCount } = useRoleMemberCount('0x0000000000000000000000000000000000000000000000000000000000000000');
  const { data: councilCount } = useRoleMemberCount('0x0000000000000000000000000000000000000000000000000000000000000001');
  const { data: assessorCount } = useRoleMemberCount('0x0000000000000000000000000000000000000000000000000000000000000002');
  const { data: auditorCount } = useRoleMemberCount('0x0000000000000000000000000000000000000000000000000000000000000003');
  const { data: memberCount } = useRoleMemberCount('0x0000000000000000000000000000000000000000000000000000000000000004');

  const roles = [
    { name: 'GOVERNOR_ROLE', description: 'System administrator', count: governorCount || 0 },
    { name: 'COUNCIL_ROLE', description: 'Benefit council', count: councilCount || 0 },
    { name: 'ASSESSOR_ROLE', description: 'Benefit assessor', count: assessorCount || 0 },
    { name: 'AUDITOR_ROLE', description: 'System auditor', count: auditorCount || 0 },
    { name: 'MEMBER_ROLE', description: 'Regular member', count: memberCount || 0 },
  ];

  const handleGrantRole = async () => {
    if (!newAccount || !selectedRole) return;
    
    // Convert role name to bytes32
    const roleHash = selectedRole === 'GOVERNOR_ROLE' ? '0x0000000000000000000000000000000000000000000000000000000000000000' :
                    selectedRole === 'COUNCIL_ROLE' ? '0x0000000000000000000000000000000000000000000000000000000000000001' :
                    selectedRole === 'ASSESSOR_ROLE' ? '0x0000000000000000000000000000000000000000000000000000000000000002' :
                    selectedRole === 'AUDITOR_ROLE' ? '0x0000000000000000000000000000000000000000000000000000000000000003' :
                    '0x0000000000000000000000000000000000000000000000000000000000000004';
    
    grantRole(roleHash, newAccount);
  };

  if (!address) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Connect Wallet Required</h3>
            <p className="text-muted-foreground">
              Please connect your wallet to access role management
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Access Control System
          </CardTitle>
          <CardDescription>
            Manage roles and permissions for the CipherCare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div key={role.name} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{role.name}</h4>
                  <Badge variant="outline">{role.count}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Grant Role
          </CardTitle>
          <CardDescription>
            Grant roles to addresses (requires appropriate permissions)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="account">Account Address</Label>
              <Input
                id="account"
                placeholder="0x..."
                value={newAccount}
                onChange={(e) => setNewAccount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select 
                id="role"
                className="w-full p-2 border rounded-md"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roles.map((role) => (
                  <option key={role.name} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <Button 
            onClick={handleGrantRole}
            disabled={isPending || isConfirming || !newAccount}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Granting Role...
              </>
            ) : isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : isConfirmed ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Role Granted
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Grant Role
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">
                Error: {error.message}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Contract Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contract Address:</span>
              <span className="font-mono">0xF6923cF81EE5B70e7cFD43eFe21902FAA601f601</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network:</span>
              <span>Sepolia Testnet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Address:</span>
              <span className="font-mono">{address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Etherscan:</span>
              <a 
                href="https://sepolia.etherscan.io/address/0xF6923cF81EE5B70e7cFD43eFe21902FAA601f601"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View on Etherscan
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManager;



