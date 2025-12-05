import { useEffect, useRef } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import {
    showTxPending,
    showTxConfirming,
    showTxSuccess,
    showTxError,
    showTxRejected,
} from '@/lib/txNotifications';

interface UseTransactionNotificationProps {
    hash?: `0x${string}`;
    error?: Error | null;
    isPending?: boolean;
    pendingMessage?: string;
    confirmingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

/**
 * Hook to manage transaction notifications with explorer links
 * Tracks transaction lifecycle: pending -> confirming -> success/error
 */
export const useTransactionNotification = ({
    hash,
    error,
    isPending,
    pendingMessage = 'Transaction submitted',
    confirmingMessage = 'Confirming transaction...',
    successMessage = 'Transaction confirmed',
    errorMessage = 'Transaction failed',
    onSuccess,
    onError,
}: UseTransactionNotificationProps) => {
    // Track if we've already shown pending notification
    const pendingShownRef = useRef<string | null>(null);
    // Track if we've shown success notification
    const successShownRef = useRef<string | null>(null);
    // Track if we've shown error notification
    const errorShownRef = useRef<boolean>(false);

    // Wait for transaction receipt
    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        isError: isReceiptError,
        error: receiptError,
    } = useWaitForTransactionReceipt({
        hash,
    });

    // Show pending notification when hash is available
    useEffect(() => {
        if (hash && pendingShownRef.current !== hash) {
            showTxPending(hash, pendingMessage);
            pendingShownRef.current = hash;
            errorShownRef.current = false;
            successShownRef.current = null;
        }
    }, [hash, pendingMessage]);

    // Update to confirming status
    useEffect(() => {
        if (hash && isConfirming) {
            showTxConfirming(hash, confirmingMessage);
        }
    }, [hash, isConfirming, confirmingMessage]);

    // Show success notification when confirmed
    useEffect(() => {
        if (hash && isConfirmed && successShownRef.current !== hash) {
            showTxSuccess(hash, successMessage);
            successShownRef.current = hash;
            onSuccess?.();
        }
    }, [hash, isConfirmed, successMessage, onSuccess]);

    // Show error notification for wallet rejection or transaction error
    useEffect(() => {
        if (error && !errorShownRef.current) {
            const errorMsg = error.message.toLowerCase();
            if (errorMsg.includes('rejected') || errorMsg.includes('denied') || errorMsg.includes('cancelled')) {
                showTxRejected('Transaction rejected by user');
            } else {
                showTxError(hash, error, errorMessage);
            }
            errorShownRef.current = true;
            onError?.(error);
        }
    }, [error, hash, errorMessage, onError]);

    // Show error notification for receipt error
    useEffect(() => {
        if (hash && isReceiptError && receiptError && !errorShownRef.current) {
            showTxError(hash, receiptError, errorMessage);
            errorShownRef.current = true;
            onError?.(receiptError);
        }
    }, [hash, isReceiptError, receiptError, errorMessage, onError]);

    // Reset refs when hash changes
    useEffect(() => {
        if (!hash) {
            pendingShownRef.current = null;
            successShownRef.current = null;
            errorShownRef.current = false;
        }
    }, [hash]);

    return {
        hash,
        isConfirming,
        isConfirmed,
        isError: isReceiptError || !!error,
        error: error || receiptError,
    };
};

export default useTransactionNotification;
