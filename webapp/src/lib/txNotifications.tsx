import { toast } from 'sonner';
import { ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Sepolia block explorer base URL
const SEPOLIA_EXPLORER = 'https://sepolia.etherscan.io';

/**
 * Get block explorer URL for a transaction hash
 */
export const getExplorerTxUrl = (hash: string, chainId: number = 11155111): string => {
    // Default to Sepolia for now
    return `${SEPOLIA_EXPLORER}/tx/${hash}`;
};

/**
 * Get block explorer URL for an address
 */
export const getExplorerAddressUrl = (address: string, chainId: number = 11155111): string => {
    return `${SEPOLIA_EXPLORER}/address/${address}`;
};

/**
 * Truncate transaction hash for display
 */
export const truncateHash = (hash: string): string => {
    if (!hash) return '';
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

/**
 * Show transaction pending notification
 */
export const showTxPending = (hash: string, message: string = 'Transaction submitted'): string | number => {
    const explorerUrl = getExplorerTxUrl(hash);

    return toast.loading(
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium">{message}</span>
            </div>
            <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
            >
                <span>View on Explorer: {truncateHash(hash)}</span>
                <ExternalLink className="h-3 w-3" />
            </a>
        </div>,
        {
            duration: Infinity, // Keep showing until dismissed
            id: hash, // Use hash as toast ID for later updates
        }
    );
};

/**
 * Show transaction success notification
 */
export const showTxSuccess = (hash: string, message: string = 'Transaction confirmed'): string | number => {
    const explorerUrl = getExplorerTxUrl(hash);

    // Dismiss any pending toast with this hash
    toast.dismiss(hash);

    return toast.success(
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">{message}</span>
            </div>
            <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
            >
                <span>View on Explorer: {truncateHash(hash)}</span>
                <ExternalLink className="h-3 w-3" />
            </a>
        </div>,
        {
            duration: 8000,
            id: `success-${hash}`,
        }
    );
};

/**
 * Show transaction failure notification
 */
export const showTxError = (
    hash: string | undefined,
    error: Error | string,
    message: string = 'Transaction failed'
): string | number => {
    const errorMessage = typeof error === 'string' ? error : error.message;

    // Dismiss any pending toast with this hash
    if (hash) {
        toast.dismiss(hash);
    }

    const explorerUrl = hash ? getExplorerTxUrl(hash) : null;

    return toast.error(
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="font-medium">{message}</span>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2">{errorMessage}</p>
            {explorerUrl && (
                <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                >
                    <span>View on Explorer: {truncateHash(hash!)}</span>
                    <ExternalLink className="h-3 w-3" />
                </a>
            )}
        </div>,
        {
            duration: 10000,
            id: hash ? `error-${hash}` : undefined,
        }
    );
};

/**
 * Show transaction rejected notification (user cancelled)
 */
export const showTxRejected = (message: string = 'Transaction rejected'): string | number => {
    return toast.warning(
        <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{message}</span>
        </div>,
        {
            duration: 5000,
        }
    );
};

/**
 * Update pending toast to show confirming status
 */
export const showTxConfirming = (hash: string, message: string = 'Confirming transaction...'): void => {
    const explorerUrl = getExplorerTxUrl(hash);

    toast.loading(
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium">{message}</span>
            </div>
            <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
            >
                <span>View on Explorer: {truncateHash(hash)}</span>
                <ExternalLink className="h-3 w-3" />
            </a>
        </div>,
        {
            duration: Infinity,
            id: hash, // Replace existing toast with same hash
        }
    );
};
