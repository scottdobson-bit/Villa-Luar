import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoginForm from './LoginForm';

const PrivateRoute = ({ children }: React.PropsWithChildren) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <>{children}</> : <LoginForm />;
};

export default PrivateRoute;