
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Дисциплины</h1>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-primary"></div>
        </div>
      ) : disciplines.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Нет доступных дисциплин</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-edu-border">
          <table className="w-full edu-data-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Название</th>
                <th className="hidden md:table-cell">Код</th>
                <th className="hidden md:table-cell">Статус</th>
                <th className="hidden md:table-cell">Период</th>
                <th className="hidden md:table-cell">Даты</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {disciplines.map((disc, index) => {
                const { discipline } = disc;
                const status = discipline.archivedAt ? "Архивная" : "Активная";
                const period = discipline.studyPeriods[0] || { name: 'Н/Д', startDate: '', endDate: '' };
                
                return (
                  <tr key={discipline.id} className="hover:bg-gray-50">
                    <td>{index + 1}</td>
                    <td className="font-medium">{discipline.name}</td>
                    <td className="hidden md:table-cell">{discipline.code}</td>
                    <td className="hidden md:table-cell">
                      <Badge variant={discipline.archivedAt ? "secondary" : "default"}>
                        {status}
                      </Badge>
                    </td>
                    <td className="hidden md:table-cell">{period.name}</td>
                    <td className="hidden md:table-cell">
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
      )}
    </div>
  );
};

export default Disciplines;
