import React from 'react';
import { useParams } from 'react-router-dom';
import { isAdminEstado } from '../../utils/roles';
import { useAuth } from '../../contexts/useAuth';
import PmafInfo from './PmafInfo';
import PmafList from './PmafList';

export default function PmafHome() {
  const { user } = useAuth();
  const { codigoIbge } = useParams();
  const admin = isAdminEstado(user?.perfil);

  if (!admin) {
    return <PmafInfo />;
  }

  if (codigoIbge) {
    return <PmafInfo />;
  }

  return <PmafList />;
}

