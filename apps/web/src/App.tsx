import type { JSX } from 'react';
import { Route, Routes } from 'react-router-dom';

import { Dashboard } from '@/features/Dashboard/Index';

export const App = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
};
