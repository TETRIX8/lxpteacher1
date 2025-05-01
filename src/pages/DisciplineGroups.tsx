
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { disciplinesAPI } from '@/services/api';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';

interface Group {
  id: string;
  name: string;
  isArchived: boolean;
  type: string;
}

const DisciplineGroups = () => {
  const { disciplineId } = useParams<{ disciplineId: string }>();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!disciplineId) return;
      
      try {
        const groupData = await disciplinesAPI.getLearningGroups(disciplineId);
        setGroups(groupData);
      } catch (error) {
        console.error('Error fetching groups', error);
        toast.error('Не удалось загрузить группы дисциплины');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [disciplineId]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <Link to="/dashboard/disciplines">
            <Button variant="outline" size="sm" className="mb-2">&larr; Назад к дисциплинам</Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Группы дисциплины</h1>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-primary"></div>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Нет доступных групп для этой дисциплины</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-edu-border">
          <table className="w-full edu-data-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Название группы</th>
                <th>Тип</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, index) => (
                <tr key={group.id} className="hover:bg-gray-50">
                  <td>{index + 1}</td>
                  <td className="font-medium">{group.name}</td>
                  <td>{group.type}</td>
                  <td>
                    <Badge variant={group.isArchived ? "secondary" : "default"}>
                      {group.isArchived ? "Архивная" : "Активная"}
                    </Badge>
                  </td>
                  <td>
                    <Link to={`/dashboard/disciplines/${disciplineId}/groups/${group.id}`}>
                      <Button size="sm">Студенты</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DisciplineGroups;
