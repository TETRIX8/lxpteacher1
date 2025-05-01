
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { disciplinesAPI } from '@/services/api';
import { toast } from '@/components/ui/sonner';
import { DateTime } from 'luxon';
import { Badge } from '@/components/ui/badge';

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
        enrolledAt: string;
        expelledAt: string | null;
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

  useEffect(() => {
    const fetchData = async () => {
      if (!disciplineId || !groupId) return;
      
      setLoading(true);
      try {
        // Get students
        const studentData = await disciplinesAPI.searchStudentsInGroup(groupId, disciplineId);
        setStudents(studentData);
        
        // Get scores
        const scoreGroups = await disciplinesAPI.getStudentScores(disciplineId, groupId);
        if (scoreGroups && scoreGroups.length > 0) {
          setScores(scoreGroups[0].students || []);
          setAverageScore(scoreGroups[0].averageScore);
        }
      } catch (error) {
        console.error('Error fetching student data', error);
        toast.error('Не удалось загрузить данные студентов');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [disciplineId, groupId]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <Link to={`/dashboard/disciplines/${disciplineId}/groups`}>
            <Button variant="outline" size="sm" className="mb-2">&larr; Назад к группам</Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Студенты группы</h1>
          {averageScore !== null && (
            <p className="text-sm text-gray-500">Средний балл группы: {averageScore}</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-primary"></div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="list">Список студентов</TabsTrigger>
            <TabsTrigger value="scores">Баллы студентов</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-4">
            {students.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">Нет студентов в данной группе</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden border border-edu-border">
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
                      
                      const groupInfo = studentData.learningGroups[0] || {};
                      const enrolledDate = groupInfo.enrolledAt 
                        ? DateTime.fromISO(groupInfo.enrolledAt).toFormat('dd.MM.yyyy') 
                        : "Н/Д";
                      const expelledDate = groupInfo.expelledAt 
                        ? DateTime.fromISO(groupInfo.expelledAt).toFormat('dd.MM.yyyy') 
                        : "-";
                      
                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
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
            )}
          </TabsContent>
          
          <TabsContent value="scores" className="mt-4">
            {scores.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">Нет данных о баллах студентов</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden border border-edu-border">
                <table className="w-full edu-data-table">
                  <thead>
                    <tr>
                      <th>ФИО студента</th>
                      <th>Основные баллы</th>
                      <th>Баллы пересдачи</th>
                      <th>Итого</th>
                      <th>Пересдача</th>
                      <th className="hidden md:table-cell">Уважительная причина</th>
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
                        <tr key={studentInfo.id} className="hover:bg-gray-50">
                          <td className="font-medium">{fullName}</td>
                          <td>{mainScore}</td>
                          <td>{retakeScore}</td>
                          <td className="font-semibold">{totalScore}</td>
                          <td>
                            {score.hasRetake ? "Да" : "Нет"}
                          </td>
                          <td className="hidden md:table-cell">
                            {score.isRespectfulReasonForRetake ? "Да" : "Нет"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default GroupStudents;
