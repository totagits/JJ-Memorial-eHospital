import React, { useEffect, useState } from 'react';
import { useRBAC } from '../../hooks/useRBAC';
import { subscribeDatabase } from '../../services/storageService';
import { StaffWorkspace } from './StaffWorkspace';

export default function DemoWorkspace({ onBackToPublicSite }: { onBackToPublicSite: () => void }) {
  const { currentUser, switchUser } = useRBAC();
  const [, setTick] = useState(0);
  useEffect(() => subscribeDatabase(() => setTick(tick => tick + 1)), []);
  return <StaffWorkspace currentUser={currentUser} onUserChange={switchUser} onBackToPublicSite={onBackToPublicSite} />;
}
