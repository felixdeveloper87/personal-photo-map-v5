import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Home from '../../pages/Home';

/**
 * SmartHomeRoute Component
 * 
 * Este componente decide automaticamente o que mostrar na rota raiz:
 * - Se o usuário estiver logado: redireciona para /map
 * - Se o usuário não estiver logado: mostra a landing page
 */
function SmartHomeRoute() {
  const { isLoggedIn } = useContext(AuthContext);

  // Se estiver logado, redireciona para o mapa privado
  if (isLoggedIn) {
    return <Navigate to="/map/private" replace />;
  }

  // Se não estiver logado, mostra a landing page
  return <Home />;
}

export default SmartHomeRoute;
