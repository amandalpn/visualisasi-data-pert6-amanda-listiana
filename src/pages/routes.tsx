import { Route, Routes } from 'react-router-dom';
import DashboardPage from '@/features/dashboard/DashboardPage';
import ModulesPage from '@/features/modules/ModulesPage';
import StudentsPage from '@/features/students/StudentsPage';
import InsightsPage from '@/features/insights/InsightsPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/modules" element={<ModulesPage />} />
      <Route path="/modules/:moduleId" element={<ModulesPage />} />
      <Route path="/students" element={<StudentsPage />} />
      <Route path="/insights" element={<InsightsPage />} />
    </Routes>
  );
};

export default AppRoutes;
