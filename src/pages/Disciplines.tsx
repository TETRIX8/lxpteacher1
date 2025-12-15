
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { userAPI } from '@/services/api';
import { toast } from '@/components/ui/sonner';
import { DateTime } from 'luxon';
import { Badge } from '@/components/ui/badge';

interface Discipline {
  discipline: {
    id: string;
    name: string;
    code: string;
    archivedAt: string | null;
    studyPeriods: Array<{
      name: string;
      startDate: string;
      endDate: string;
    }>;
  };
}

const Disciplines = () => {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const teacherData = await userAPI.getTeacherInfo();
        const disciplineData = teacherData.teacher.assignedDisciplines_V2 || [];
        setDisciplines(disciplineData);
      } catch (error) {
        console.error('Error fetching disciplines', error);
        toast.error('Не удалось загрузить список дисциплин');
      } finally {
        setLoading(false);
      }
    };

    fetchDisciplines();
  }, []);

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-20 md:pb-0">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Дисциплины</h1>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-primary"></div>
        </div>
      ) : disciplines.length === 0 ? (
        <div className="bg-card rounded-lg shadow p-6 text-center">
          <p className="text-muted-foreground">Нет доступных дисциплин</p>
        </div>
      ) : (
        <>
          {/* Mobile view - cards */}
          <div className="md:hidden space-y-3">
            {disciplines.map((disc, index) => {
              const { discipline } = disc;
              const status = discipline.archivedAt ? "Архивная" : "Активная";
              const period = discipline.studyPeriods[0] || { name: 'Н/Д', startDate: '', endDate: '' };
              
              return (
                <div key={discipline.id} className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        <Badge variant={discipline.archivedAt ? "secondary" : "default"} className="text-xs">
                          {status}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-sm">{discipline.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">Код: {discipline.code}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="bg-muted px-2 py-1 rounded">{period.name}</span>
                    {period.startDate && period.endDate && (
                      <span className="bg-muted px-2 py-1 rounded">
                        {DateTime.fromISO(period.startDate).toFormat('dd.MM.yy')} - {DateTime.fromISO(period.endDate).toFormat('dd.MM.yy')}
                      </span>
                    )}
                  </div>
                  
                  <Link to={`/dashboard/disciplines/${discipline.id}/groups`}>
                    <Button size="sm" className="w-full">Группы</Button>
                  </Link>
                </div>
              );
            })}
          </div>
          
          {/* Desktop view - table */}
          <div className="hidden md:block bg-card rounded-lg shadow overflow-hidden border border-border">
            <table className="w-full edu-data-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Название</th>
                  <th>Код</th>
                  <th>Статус</th>
                  <th>Период</th>
                  <th>Даты</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {disciplines.map((disc, index) => {
                  const { discipline } = disc;
                  const status = discipline.archivedAt ? "Архивная" : "Активная";
                  const period = discipline.studyPeriods[0] || { name: 'Н/Д', startDate: '', endDate: '' };
                  
                  return (
                    <tr key={discipline.id} className="hover:bg-muted/50">
                      <td>{index + 1}</td>
                      <td className="font-medium">{discipline.name}</td>
                      <td>{discipline.code}</td>
                      <td>
                        <Badge variant={discipline.archivedAt ? "secondary" : "default"}>
                          {status}
                        </Badge>
                      </td>
                      <td>{period.name}</td>
                      <td>
                        {period.startDate && period.endDate ? (
                          <>
                            {DateTime.fromISO(period.startDate).toFormat('dd.MM.yyyy')} - 
                            {DateTime.fromISO(period.endDate).toFormat('dd.MM.yyyy')}
                          </>
                        ) : 'Н/Д'}
                      </td>
                      <td>
                        <Link to={`/dashboard/disciplines/${discipline.id}/groups`}>
                          <Button size="sm">Группы</Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Disciplines;
