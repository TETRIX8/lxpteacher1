
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
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-20 md:pb-0">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Учебные группы</h1>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-primary"></div>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Активные группы</CardTitle>
              <CardDescription className="text-xs md:text-sm">Список активных учебных групп</CardDescription>
            </CardHeader>
            <CardContent className="p-0 md:p-6 md:pt-0">
              {activeGroups.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 px-4">Нет активных групп</p>
              ) : (
                <>
                  {/* Mobile view - cards */}
                  <div className="md:hidden space-y-3 p-4">
                    {activeGroups.map((group) => (
                      <div key={`${group.id}-${group.disciplineId}`} className="bg-muted/50 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{group.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{group.disciplineName}</p>
                          </div>
                          <Badge variant="outline" className="shrink-0 text-xs">{group.type}</Badge>
                        </div>
                        <Link to={`/dashboard/disciplines/${group.disciplineId}/groups/${group.id}`}>
                          <Button size="sm" className="w-full">Студенты</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                  
                  {/* Desktop view - table */}
                  <div className="hidden md:block overflow-x-auto">
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
                          <tr key={`${group.id}-${group.disciplineId}`} className="hover:bg-muted/50">
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
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Архивные группы</CardTitle>
              <CardDescription className="text-xs md:text-sm">Неактивные и архивные группы</CardDescription>
            </CardHeader>
            <CardContent className="p-0 md:p-6 md:pt-0">
              {archivedGroups.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 px-4">Нет архивных групп</p>
              ) : (
                <>
                  {/* Mobile view - cards */}
                  <div className="md:hidden space-y-3 p-4">
                    {archivedGroups.map((group) => (
                      <div key={`${group.id}-${group.disciplineId}`} className="bg-muted/30 rounded-xl p-4 space-y-3 opacity-75">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{group.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{group.disciplineName}</p>
                          </div>
                          <Badge variant="secondary" className="shrink-0 text-xs">{group.type}</Badge>
                        </div>
                        <Link to={`/dashboard/disciplines/${group.disciplineId}/groups/${group.id}`}>
                          <Button size="sm" variant="outline" className="w-full">Студенты</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                  
                  {/* Desktop view - table */}
                  <div className="hidden md:block overflow-x-auto">
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
                          <tr key={`${group.id}-${group.disciplineId}`} className="hover:bg-muted/50">
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
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Groups;
