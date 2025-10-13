import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export function BackButton({ to, label = 'Kembali', className = '' }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`mb-4 ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}