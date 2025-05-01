
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { userAPI, disciplinesAPI } from '@/services/api';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Discipline {
  discipline: {
    id: string;
    name: string;
    code: string;
  };
}

interface Group {
  id: string;
  name: string;
  isArchived: boolean;
  type: string;
  disciplineId: string;
  disciplineName: string;
}

const Groups = () => {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get disciplines
        const teacherData = await userAPI.getTeacherInfo();
        const disciplinesData = teacherData.teacher.assignedDisciplines_V2 || [];
        setDisciplines(disciplinesData);
        
        // Get groups for each discipline
        const groupsPromises = disciplinesData.map(async (disc: Discipline) => {
          const disciplineId = disc.discipline.id;
          const groups = await disciplinesAPI.getLearningGroups(disciplineId);
          
          // Add discipline info to each group
          return groups.map((group: any) => ({
            ...group,
            disciplineId,
            disciplineName: disc.discipline.name
          }));
        });
        
        const groupsByDiscipline = await Promise.all(groupsPromises);
        setAllGroups(groupsByDiscipline.flat());
      } catch (error) {
        console.error('Error fetching data', error);
        toast.error('Не удалось загрузить данные групп');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeGroups = allGroups.filter(group => !group.isArchived);
  const archivedGroups = allGroups.filter(group => group.isArchived);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Учебные группы</h1>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Активные группы</CardTitle>
              <CardDescription>Список активных учебных групп</CardDescription>
            </CardHeader>
            <CardContent>
              {activeGroups.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Нет активных групп</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full edu-data-table">
                    <thead>
                      <tr>
                        <th>Название группы</th>
                        <th>Дисциплина</th>
                        <th>Тип</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeGroups.map((group) => (
                        <tr key={`${group.id}-${group.disciplineId}`} className="hover:bg-gray-50">
                          <td className="font-medium">{group.name}</td>
                          <td>{group.disciplineName}</td>
                          <td>{group.type}</td>
                          <td>
                            <Link to={`/dashboard/disciplines/${group.disciplineId}/groups/${group.id}`}>
                              <Button size="sm">Студенты</Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Архивные группы</CardTitle>
              <CardDescription>Неактивные и архивные группы</CardDescription>
            </CardHeader>
            <CardContent>
              {archivedGroups.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Нет архивных групп</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full edu-data-table">
                    <thead>
                      <tr>
                        <th>Название группы</th>
                        <th>Дисциплина</th>
                        <th>Тип</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {archivedGroups.map((group) => (
                        <tr key={`${group.id}-${group.disciplineId}`} className="hover:bg-gray-50">
                          <td className="font-medium">{group.name}</td>
                          <td>{group.disciplineName}</td>
                          <td>{group.type}</td>
                          <td>
                            <Link to={`/dashboard/disciplines/${group.disciplineId}/groups/${group.id}`}>
                              <Button size="sm" variant="outline">Студенты</Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Groups;
