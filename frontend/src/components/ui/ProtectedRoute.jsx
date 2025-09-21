import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

/**
 * ProtectedRoute Component
 * 
 * Este componente protege rotas que requerem autenticação:
 * - Se o usuário estiver logado: renderiza o componente protegido
 * - Se o usuário não estiver logado: redireciona para a landing page
 */
function ProtectedRoute({ children, ...props }) {
  const { isLoggedIn } = useContext(AuthContext);

  // Se não estiver logado, redireciona para a landing page
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // Se estiver logado, renderiza o componente protegido
  return children;
}

export default ProtectedRoute;
