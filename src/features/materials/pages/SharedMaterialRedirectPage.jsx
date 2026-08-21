import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

const SharedMaterialRedirectPage = () => {
  const { token } = useParams();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={`/workspace/profile?sharedMaterialToken=${token}`} replace />;
};

export default SharedMaterialRedirectPage;
