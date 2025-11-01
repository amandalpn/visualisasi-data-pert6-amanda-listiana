import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadAllData } from './dataLoader';
import type {
  ActivityByWeekRecord,
  GradeDistributionRecord,
  ModuleOutcomeRecord,
  OutcomeByDemographicRecord,
  RegionChoroplethRecord,
  StudentActivityRecord,
} from './types';

type DataState = {
  activityByWeek: ActivityByWeekRecord[];
  gradeDistribution: GradeDistributionRecord[];
  outcomeByDemographic: OutcomeByDemographicRecord[];
  moduleOutcome: ModuleOutcomeRecord[];
  regionChoropleth: RegionChoroplethRecord[];
  studentActivity: StudentActivityRecord[];
};

type DataContextValue = {
  data: DataState | null;
  loading: boolean;
  error: string | null;
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const OuladDataProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<DataContextValue>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    loadAllData()
      .then((data) =>
        setState({
          data,
          loading: false,
          error: null,
        }),
      )
      .catch((error) =>
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data',
        }),
      );
  }, []);

  const value = useMemo(() => state, [state]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useOuladData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useOuladData harus digunakan di dalam OuladDataProvider');
  }
  return ctx;
};
