import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardLinkProps {
  to: string;
  children: ReactNode;
  requireAuth?: boolean;
  className?: string;
  onClick?: () => void;
}

const AuthGuardLink = ({ to, children, requireAuth = false, className, onClick }: AuthGuardLinkProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    if (requireAuth && !user) {
      e.preventDefault();
      navigate('/auth');
      return;
    }
    onClick?.();
  };

  return (
    <Link to={to} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
};

export default AuthGuardLink;