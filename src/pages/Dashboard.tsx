
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
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-20 md:pb-0">
      {/* Заголовок с градиентом */}
      <div className="text-center space-y-2 md:space-y-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-edu-primary via-purple-600 to-edu-secondary bg-clip-text text-transparent px-2">
          Личный кабинет преподавателя
        </h1>
        <p className="text-muted-foreground text-sm md:text-lg px-4">
          Добро пожаловать в систему управления образовательным процессом
        </p>
      </div>

      {/* Статистические карточки */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card className="edu-card-gradient hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Дисциплины</CardTitle>
            <div className="p-1.5 md:p-2 bg-edu-primary/10 rounded-lg">
              <Book className="h-4 w-4 md:h-5 md:w-5 text-edu-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-2xl md:text-3xl font-bold text-edu-primary">{disciplines.length}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1 md:mt-2">
              Активных: {disciplines.filter(d => !d.discipline.archivedAt).length}
            </p>
          </CardContent>
        </Card>

        <Card className="edu-card-gradient hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Студенты</CardTitle>
            <div className="p-1.5 md:p-2 bg-green-500/10 rounded-lg">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-2xl md:text-3xl font-bold text-green-600">--</div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1 md:mt-2">
              В разделе Группы
            </p>
          </CardContent>
        </Card>

        <Card className="edu-card-gradient hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Группы</CardTitle>
            <div className="p-1.5 md:p-2 bg-purple-500/10 rounded-lg">
              <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-2xl md:text-3xl font-bold text-purple-600">--</div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1 md:mt-2">
              Активных групп
            </p>
          </CardContent>
        </Card>

        <Card className="edu-card-gradient hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Активность</CardTitle>
            <div className="p-1.5 md:p-2 bg-orange-500/10 rounded-lg">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-2xl md:text-3xl font-bold text-orange-600">100%</div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1 md:mt-2">
              Система активна
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Основной контент */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card className="edu-card hover-lift">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
              <div className="p-1.5 md:p-2 bg-edu-primary/10 rounded-lg">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-edu-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span>Профиль преподавателя</span>
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Ваши личные данные и информация</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <dl className="space-y-2 md:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 md:p-3 bg-muted rounded-lg gap-1">
                <dt className="text-xs md:text-sm font-medium text-muted-foreground">ФИО:</dt>
                <dd className="font-semibold text-sm md:text-base text-foreground">
                  {teacherData.lastName} {teacherData.firstName} {teacherData.middleName || ''}
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 md:p-3 bg-muted rounded-lg gap-1">
                <dt className="text-xs md:text-sm font-medium text-muted-foreground">Email:</dt>
                <dd className="font-semibold text-sm md:text-base text-foreground break-all">{teacherData.email}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 md:p-3 bg-muted rounded-lg gap-1">
                <dt className="text-xs md:text-sm font-medium text-muted-foreground">Телефон:</dt>
                <dd className="font-semibold text-sm md:text-base text-foreground">{teacherData.phoneNumber || 'Не указан'}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 md:p-3 bg-muted rounded-lg gap-1">
                <dt className="text-xs md:text-sm font-medium text-muted-foreground">Организация:</dt>
                <dd className="font-semibold text-sm md:text-base text-foreground">{organization}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 md:p-3 bg-muted rounded-lg gap-1">
                <dt className="text-xs md:text-sm font-medium text-muted-foreground">Подразделение:</dt>
                <dd className="font-semibold text-sm md:text-base text-foreground">{suborganization}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="edu-card hover-lift">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
              <div className="p-1.5 md:p-2 bg-green-500/10 rounded-lg">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              </div>
              <span>Последняя активность</span>
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Недавние действия в системе</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <div className="border-l-4 border-edu-primary pl-3 md:pl-4 py-2 md:py-3 bg-edu-primary/5 rounded-r-lg">
              <p className="text-xs md:text-sm text-muted-foreground">{new Date().toLocaleDateString('ru-RU', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p className="font-medium text-sm md:text-base text-foreground">Вход в систему</p>
            </div>
            <div className="border-l-4 border-green-500 pl-3 md:pl-4 py-2 md:py-3 bg-green-500/5 rounded-r-lg">
              <p className="text-xs md:text-sm text-muted-foreground">{new Date(Date.now() - 86400000).toLocaleDateString('ru-RU', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p className="font-medium text-sm md:text-base text-foreground">Просмотр дисциплин</p>
            </div>
            <div className="text-center mt-4 md:mt-6">
              <p className="text-xs md:text-sm text-muted-foreground">
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
