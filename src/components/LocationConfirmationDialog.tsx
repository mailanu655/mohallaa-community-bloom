import React from 'react';

interface LocationData {
  neighborhood?: {
    name: string;
    city: string;
    state: string;
  };
  city?: string;
  state?: string;
}

interface LocationConfirmationDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  location?: LocationData | null;
  onConfirm?: () => void;
  onRetry?: () => void;
  onManualEntry?: () => void;
}

const LocationConfirmationDialog = ({
  isOpen,
  onClose,
  location,
  onConfirm,
  onRetry,
  onManualEntry,
}: LocationConfirmationDialogProps) => {
  // This component is now deprecated and won't render anything
  // The neighborhood selection system handles location confirmation
  return null;
};

export default LocationConfirmationDialog;
