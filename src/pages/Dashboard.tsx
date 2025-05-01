
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { userAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { Book, Users } from 'lucide-react';

interface TeacherData {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber?: string;
  assignedSuborganizations: any[];
  teacher: {
    assignedDisciplines_V2: any[];
  };
}

const Dashboard = () => {
  const { user } = useAuth();
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const data = await userAPI.getTeacherInfo();
        setTeacherData(data);
      } catch (error) {
        console.error('Error fetching teacher data', error);
        toast.error('Не удалось загрузить данные преподавателя');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-primary"></div>
      </div>
    );
  }

  if (!teacherData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Не удалось загрузить данные. Пожалуйста, попробуйте позже.</p>
      </div>
    );
  }

  const disciplines = teacherData.teacher.assignedDisciplines_V2 || [];
  const organization = teacherData.assignedSuborganizations?.[0]?.suborganization?.organization?.name || 'Не указано';
  const suborganization = teacherData.assignedSuborganizations?.[0]?.suborganization?.name || 'Не указано';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Личный кабинет преподавателя</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Дисциплины</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{disciplines.length}</div>
            <p className="text-xs text-muted-foreground">
              Активных дисциплин: {disciplines.filter(d => !d.discipline.archivedAt).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Студенты</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Информация доступна в разделе Группы
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Профиль преподавателя</CardTitle>
            <CardDescription>Ваши личные данные</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="grid grid-cols-3 gap-1">
                <dt className="text-sm font-medium text-gray-500">ФИО:</dt>
                <dd className="col-span-2">{teacherData.lastName} {teacherData.firstName} {teacherData.middleName || ''}</dd>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <dt className="text-sm font-medium text-gray-500">Email:</dt>
                <dd className="col-span-2">{teacherData.email}</dd>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <dt className="text-sm font-medium text-gray-500">Телефон:</dt>
                <dd className="col-span-2">{teacherData.phoneNumber || 'Не указан'}</dd>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <dt className="text-sm font-medium text-gray-500">Организация:</dt>
                <dd className="col-span-2">{organization}</dd>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <dt className="text-sm font-medium text-gray-500">Подразделение:</dt>
                <dd className="col-span-2">{suborganization}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Последняя активность</CardTitle>
            <CardDescription>Недавние действия в системе</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-2 border-edu-primary pl-4 py-2">
              <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
              <p>Вход в систему</p>
            </div>
            <p className="text-sm text-gray-500 text-center mt-6">
              История активности будет отображаться здесь
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
