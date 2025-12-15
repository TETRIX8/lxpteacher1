
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { disciplinesAPI } from '@/services/api';
import { toast } from '@/components/ui/sonner';
import { DateTime } from 'luxon';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

interface Student {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    avatar?: string;
    student: {
      learningGroups: Array<{
        learningGroupId?: string;
        enrolledAt?: string;
        expelledAt?: string | null;
      }>;
    };
  };
}

interface ScoreData {
  studentId: string;
  disciplineId: string;
  student: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      middleName?: string;
    };
  };
  scoreForAnsweredTasks: number;
  scoreForAnsweredRetakeTasks: number;
  hasRetake: boolean;
  isRespectfulReasonForRetake: boolean;
}

const GroupStudents = () => {
  const { disciplineId, groupId } = useParams<{ disciplineId: string, groupId: string }>();
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<ScoreData[]>([]);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!disciplineId || !groupId) return;
      
      setLoading(true);
      setError(null);
      try {
        // Get students
        const studentData = await disciplinesAPI.searchStudentsInGroup(groupId, disciplineId);
        setStudents(studentData);
        
        // Get scores
        const scoreGroups = await disciplinesAPI.getStudentScores(disciplineId, groupId);
        if (scoreGroups && scoreGroups.length > 0) {
          setScores(scoreGroups[0].students || []);
          setAverageScore(scoreGroups[0].averageScore);
        } else {
          console.log('No score data returned for this group');
        }
      } catch (error) {
        console.error('Error fetching student data', error);
        setError('Не удалось загрузить данные студентов');
        toast.error('Не удалось загрузить данные студентов');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [disciplineId, groupId]);

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-20 md:pb-0">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <div>
          <Link to={`/dashboard/disciplines/${disciplineId}/groups`}>
            <Button variant="outline" size="sm" className="mb-2 text-xs md:text-sm">&larr; Назад к группам</Button>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Студенты группы</h1>
          {averageScore !== null && (
            <p className="text-xs md:text-sm text-muted-foreground">Средний балл группы: {averageScore}</p>
          )}
        </div>
        
        <Link to={`/dashboard/disciplines/${disciplineId}/groups/${groupId}/characteristics`} className="w-full md:w-auto">
          <Button className="flex items-center gap-2 w-full md:w-auto">
            <FileText className="h-4 w-4" />
            Характеристика группы
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-primary"></div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 md:w-auto md:inline-flex">
            <TabsTrigger value="list" className="text-xs md:text-sm">Список студентов</TabsTrigger>
            <TabsTrigger value="scores" className="text-xs md:text-sm">Баллы студентов</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-4">
            {students.length === 0 ? (
              <div className="bg-card rounded-lg shadow p-6 text-center">
                <p className="text-muted-foreground">Нет студентов в данной группе</p>
              </div>
            ) : (
              <>
                {/* Mobile view - cards */}
                <div className="md:hidden space-y-3">
                  {students.map((student) => {
                    const user = student.user;
                    const studentData = user.student;
                    
                    const fullName = `${user.lastName || ''} ${user.firstName || ''} ${user.middleName || ''}`;
                    const isExpelled = studentData.learningGroups.some(group => group.expelledAt);
                    
                    const groupInfo = studentData.learningGroups[0] || {
                      enrolledAt: undefined,
                      expelledAt: undefined
                    };
                    
                    const enrolledDate = groupInfo.enrolledAt 
                      ? DateTime.fromISO(groupInfo.enrolledAt).toFormat('dd.MM.yyyy') 
                      : "Н/Д";
                    const expelledDate = groupInfo.expelledAt 
                      ? DateTime.fromISO(groupInfo.expelledAt).toFormat('dd.MM.yyyy') 
                      : null;
                    
                    return (
                      <div key={user.id} className="bg-card rounded-xl p-4 shadow-sm border border-border">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h3 className="font-semibold text-sm flex-1">{fullName}</h3>
                          <Badge variant={isExpelled ? "secondary" : "default"} className="text-xs shrink-0">
                            {isExpelled ? "Отчислен" : "Активный"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Зачислен: {enrolledDate}</p>
                          {expelledDate && <p>Отчислен: {expelledDate}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Desktop view - table */}
                <div className="hidden md:block bg-card rounded-lg shadow overflow-hidden border border-border">
                  <table className="w-full edu-data-table">
                    <thead>
                      <tr>
                        <th>ФИО</th>
                        <th>Статус</th>
                        <th>Дата зачисления</th>
                        <th>Дата отчисления</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => {
                        const user = student.user;
                        const studentData = user.student;
                        
                        const fullName = `${user.lastName || ''} ${user.firstName || ''} ${user.middleName || ''}`;
                        const isExpelled = studentData.learningGroups.some(group => group.expelledAt);
                        
                        const groupInfo = studentData.learningGroups[0] || {
                          enrolledAt: undefined,
                          expelledAt: undefined
                        };
                        
                        const enrolledDate = groupInfo.enrolledAt 
                          ? DateTime.fromISO(groupInfo.enrolledAt).toFormat('dd.MM.yyyy') 
                          : "Н/Д";
                        const expelledDate = groupInfo.expelledAt 
                          ? DateTime.fromISO(groupInfo.expelledAt).toFormat('dd.MM.yyyy') 
                          : "-";
                        
                        return (
                          <tr key={user.id} className="hover:bg-muted/50">
                            <td className="font-medium">{fullName}</td>
                            <td>
                              <Badge variant={isExpelled ? "secondary" : "default"}>
                                {isExpelled ? "Отчислен" : "Активный"}
                              </Badge>
                            </td>
                            <td>{enrolledDate}</td>
                            <td>{expelledDate}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="scores" className="mt-4">
            {scores.length === 0 ? (
              <div className="bg-card rounded-lg shadow p-6 text-center">
                <p className="text-muted-foreground">Нет данных о баллах студентов</p>
              </div>
            ) : (
              <>
                {/* Mobile view - cards */}
                <div className="md:hidden space-y-3">
                  {scores.map((score) => {
                    const studentInfo = score.student.user;
                    const fullName = `${studentInfo.lastName || ''} ${studentInfo.firstName || ''} ${studentInfo.middleName || ''}`;
                    
                    const mainScore = score.scoreForAnsweredTasks || 0;
                    const retakeScore = score.scoreForAnsweredRetakeTasks || 0;
                    const totalScore = mainScore + retakeScore;
                    
                    return (
                      <div key={studentInfo.id} className="bg-card rounded-xl p-4 shadow-sm border border-border">
                        <h3 className="font-semibold text-sm mb-3">{fullName}</h3>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-muted rounded-lg p-2">
                            <p className="text-xs text-muted-foreground">Основные</p>
                            <p className="font-bold text-lg">{mainScore}</p>
                          </div>
                          <div className="bg-muted rounded-lg p-2">
                            <p className="text-xs text-muted-foreground">Пересдача</p>
                            <p className="font-bold text-lg">{retakeScore}</p>
                          </div>
                          <div className="bg-edu-primary/10 rounded-lg p-2">
                            <p className="text-xs text-muted-foreground">Итого</p>
                            <p className="font-bold text-lg text-edu-primary">{totalScore}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3 text-xs">
                          <Badge variant={score.hasRetake ? "default" : "secondary"}>
                            Пересдача: {score.hasRetake ? "Да" : "Нет"}
                          </Badge>
                          {score.hasRetake && (
                            <Badge variant={score.isRespectfulReasonForRetake ? "default" : "outline"}>
                              Уваж. причина: {score.isRespectfulReasonForRetake ? "Да" : "Нет"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Desktop view - table */}
                <div className="hidden md:block bg-card rounded-lg shadow overflow-hidden border border-border">
                  <table className="w-full edu-data-table">
                    <thead>
                      <tr>
                        <th>ФИО студента</th>
                        <th>Основные баллы</th>
                        <th>Баллы пересдачи</th>
                        <th>Итого</th>
                        <th>Пересдача</th>
                        <th>Уважительная причина</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scores.map((score) => {
                        const studentInfo = score.student.user;
                        const fullName = `${studentInfo.lastName || ''} ${studentInfo.firstName || ''} ${studentInfo.middleName || ''}`;
                        
                        const mainScore = score.scoreForAnsweredTasks || 0;
                        const retakeScore = score.scoreForAnsweredRetakeTasks || 0;
                        const totalScore = mainScore + retakeScore;
                        
                        return (
                          <tr key={studentInfo.id} className="hover:bg-muted/50">
                            <td className="font-medium">{fullName}</td>
                            <td>{mainScore}</td>
                            <td>{retakeScore}</td>
                            <td className="font-semibold">{totalScore}</td>
                            <td>
                              {score.hasRetake ? "Да" : "Нет"}
                            </td>
                            <td>
                              {score.isRespectfulReasonForRetake ? "Да" : "Нет"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default GroupStudents;
