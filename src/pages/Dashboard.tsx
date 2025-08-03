
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { userAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { Book, Users, GraduationCap, Calendar, TrendingUp } from 'lucide-react';

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
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-edu-primary/20 border-t-edu-primary"></div>
          <div className="absolute inset-0 animate-pulse-soft">
            <div className="rounded-full h-16 w-16 bg-edu-primary/10"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!teacherData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Не удалось загрузить данные. Пожалуйста, попробуйте позже.</p>
        </div>
      </div>
    );
  }

  const disciplines = teacherData.teacher.assignedDisciplines_V2 || [];
  const organization = teacherData.assignedSuborganizations?.[0]?.suborganization?.organization?.name || 'Не указано';
  const suborganization = teacherData.assignedSuborganizations?.[0]?.suborganization?.name || 'Не указано';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Заголовок с градиентом */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-edu-primary via-purple-600 to-edu-secondary bg-clip-text text-transparent">
          Личный кабинет преподавателя
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Добро пожаловать в систему управления образовательным процессом
        </p>
      </div>

      {/* Статистические карточки */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="edu-card-gradient hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Дисциплины</CardTitle>
            <div className="p-2 bg-edu-primary/10 rounded-lg">
              <Book className="h-5 w-5 text-edu-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-edu-primary">{disciplines.length}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Активных: {disciplines.filter(d => !d.discipline.archivedAt).length}
            </p>
          </CardContent>
        </Card>

        <Card className="edu-card-gradient hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Студенты</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">--</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Информация в разделе Группы
            </p>
          </CardContent>
        </Card>

        <Card className="edu-card-gradient hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Группы</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <GraduationCap className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">--</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Активных групп
            </p>
          </CardContent>
        </Card>

        <Card className="edu-card-gradient hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Активность</CardTitle>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">100%</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Система активна
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Основной контент */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="edu-card hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-edu-primary/10 rounded-lg">
                <svg className="w-5 h-5 text-edu-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span>Профиль преподавателя</span>
            </CardTitle>
            <CardDescription>Ваши личные данные и информация</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">ФИО:</dt>
                <dd className="font-semibold text-gray-900 dark:text-gray-100">
                  {teacherData.lastName} {teacherData.firstName} {teacherData.middleName || ''}
                </dd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</dt>
                <dd className="font-semibold text-gray-900 dark:text-gray-100">{teacherData.email}</dd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Телефон:</dt>
                <dd className="font-semibold text-gray-900 dark:text-gray-100">{teacherData.phoneNumber || 'Не указан'}</dd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Организация:</dt>
                <dd className="font-semibold text-gray-900 dark:text-gray-100">{organization}</dd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Подразделение:</dt>
                <dd className="font-semibold text-gray-900 dark:text-gray-100">{suborganization}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="edu-card hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <span>Последняя активность</span>
            </CardTitle>
            <CardDescription>Недавние действия в системе</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-edu-primary pl-4 py-3 bg-edu-primary/5 rounded-r-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('ru-RU', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">Вход в систему</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-3 bg-green-500/5 rounded-r-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(Date.now() - 86400000).toLocaleDateString('ru-RU', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">Просмотр дисциплин</p>
            </div>
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                История активности будет отображаться здесь
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
