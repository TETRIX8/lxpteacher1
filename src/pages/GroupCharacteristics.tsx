import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { useForm } from 'react-hook-form';
import { FileText, Download, Eye } from 'lucide-react';
import { disciplinesAPI } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';

// Types
interface Student {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    avatar?: string;
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
}

interface CharacteristicKeyword {
  id: string;
  text: string;
  color: string;
}

// Available keyword options
const availableKeywords: CharacteristicKeyword[] = [
  { id: '1', text: 'Хорошо учится', color: 'bg-green-100' },
  { id: '2', text: 'Активный на занятиях', color: 'bg-blue-100' },
  { id: '3', text: 'Творческий подход', color: 'bg-purple-100' },
  { id: '4', text: 'Лидерские качества', color: 'bg-yellow-100' },
  { id: '5', text: 'Требуется внимание', color: 'bg-red-100' },
  { id: '6', text: 'Способный к аналитике', color: 'bg-indigo-100' },
  { id: '7', text: 'Ответственный', color: 'bg-teal-100' },
  { id: '8', text: 'Организованный', color: 'bg-cyan-100' },
];

interface StudentCharacteristic {
  studentId: string;
  keywords: string[];
  comment: string;
}

interface FormValues {
  studentCharacteristics: StudentCharacteristic[];
  groupComment: string;
}

const GroupCharacteristics = () => {
  const { disciplineId, groupId } = useParams<{ disciplineId: string, groupId: string }>();
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disciplineName, setDisciplineName] = useState<string>('');
  const [groupName, setGroupName] = useState<string>('');
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  
  const isMobile = useIsMobile();
  
  // Initialize form
  const form = useForm<FormValues>({
    defaultValues: {
      studentCharacteristics: [],
      groupComment: ''
    }
  });

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
          
          // Set discipline name
          if (scoreGroups[0].discipline && scoreGroups[0].discipline.name) {
            setDisciplineName(scoreGroups[0].discipline.name);
          }
          
          // Initialize form values with student IDs
          const initialCharacteristics = studentData.map(student => ({
            studentId: student.user.id,
            keywords: [],
            comment: ''
          }));
          
          form.reset({
            studentCharacteristics: initialCharacteristics,
            groupComment: ''
          });
        }

        // Get group name
        const groupsData = await disciplinesAPI.getLearningGroups(disciplineId);
        const currentGroup = groupsData.find(g => g.id === groupId);
        if (currentGroup) {
          setGroupName(currentGroup.name);
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
  }, [disciplineId, groupId, form]);

  const handleKeywordToggle = (studentIndex: number, keywordId: string) => {
    const currentKeywords = form.getValues(`studentCharacteristics.${studentIndex}.keywords`) || [];
    
    const updatedKeywords = currentKeywords.includes(keywordId)
      ? currentKeywords.filter(id => id !== keywordId)
      : [...currentKeywords, keywordId];
    
    form.setValue(`studentCharacteristics.${studentIndex}.keywords`, updatedKeywords);
  };

  const preparePreviewData = (data: FormValues) => {
    const studentsWithDetails = students.map((student) => {
      const studentScore = scores.find(score => score.student.user.id === student.user.id);
      const studentCharacteristic = data.studentCharacteristics.find(char => char.studentId === student.user.id);
      
      const fullName = `${student.user.lastName || ''} ${student.user.firstName || ''} ${student.user.middleName || ''}`;
      const mainScore = studentScore ? studentScore.scoreForAnsweredTasks || 0 : 0;
      const retakeScore = studentScore ? studentScore.scoreForAnsweredRetakeTasks || 0 : 0;
      const totalScore = mainScore + retakeScore;
      
      const selectedKeywords = studentCharacteristic?.keywords.map(id => {
        const keyword = availableKeywords.find(k => k.id === id);
        return keyword ? keyword.text : '';
      }) || [];
      
      return {
        id: student.user.id,
        fullName,
        mainScore,
        retakeScore,
        totalScore,
        keywords: selectedKeywords,
        comment: studentCharacteristic?.comment || '',
      };
    });
    
    return {
      disciplineId,
      groupId,
      disciplineName,
      groupName,
      averageScore,
      groupComment: data.groupComment,
      students: studentsWithDetails,
      studentCharacteristics: data.studentCharacteristics,
      keywords: availableKeywords,
      date: new Date().toLocaleDateString('ru-RU')
    };
  };

  const handlePreview = () => {
    const formData = form.getValues();
    const previewData = preparePreviewData(formData);
    
    // Generate preview content
    let content = '';
    
    // Header
    content += '==========================================\n';
    content += '        ХАРАКТЕРИСТИКА ГРУППЫ\n';
    content += '==========================================\n\n';
    
    // Group and discipline info
    content += `Группа: ${previewData.groupName || 'Не указано'}\n`;
    content += `Дисциплина: ${previewData.disciplineName || 'Не указано'}\n`;
    content += `Дата: ${previewData.date || new Date().toLocaleDateString('ru-RU')}\n`;
    content += `Средний балл группы: ${previewData.averageScore || 'Не указано'}\n\n`;
    
    // Group comment
    content += '==========================================\n';
    content += 'ОБЩАЯ ХАРАКТЕРИСТИКА ГРУППЫ\n';
    content += '==========================================\n';
    content += previewData.groupComment || 'Не указана\n\n';
    
    // Students
    content += '==========================================\n';
    content += 'ХАРАКТЕРИСТИКИ СТУДЕНТОВ\n';
    content += '==========================================\n\n';
    
    if (previewData.students && previewData.students.length > 0) {
      previewData.students.forEach((student, index) => {
        content += `${index + 1}. ${student.fullName}\n`;
        content += `   - Баллы: ${student.totalScore} (основные: ${student.mainScore}, пересдача: ${student.retakeScore})\n`;
        content += '   - Характеристики: ' + (student.keywords.length ? student.keywords.join(', ') : 'не указаны') + '\n';
        content += '   - Индивидуальный комментарий: ' + (student.comment || 'не указан') + '\n\n';
      });
    } else {
      content += 'Информация о студентах отсутствует\n';
    }
    
    setPreviewContent(content);
    setIsPreviewOpen(true);
  };

  const generatePDF = async (data: FormValues) => {
    setGenerating(true);
    try {
      // Prepare comprehensive data for PDF generation using the same function
      const pdfData = preparePreviewData(data);
      
      // Call the API to generate and download PDF with all data
      await disciplinesAPI.generateGroupCharacteristicsPDF(pdfData);
      
      toast.success('Характеристика успешно сгенерирована и скачана');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Ошибка при создании характеристики');
    } finally {
      setGenerating(false);
    }
  };

  const getKeywordById = (id: string) => {
    return availableKeywords.find(keyword => keyword.id === id) || null;
  };

  // Component for preview content
  const CharacteristicPreview = ({content}: {content: string}) => {
    return (
      <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-md border max-h-[60vh] overflow-y-auto">
        {content}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <Link to={`/dashboard/disciplines/${disciplineId}/groups/${groupId}`}>
            <Button variant="outline" size="sm" className="mb-2">&larr; Назад к студентам</Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Характеристика группы {groupName}</h1>
          {disciplineName && <p className="text-gray-600">Дисциплина: {disciplineName}</p>}
          {averageScore !== null && <p className="text-gray-600">Средний балл: {averageScore}</p>}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-800">
          {error}
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(generatePDF)} className="space-y-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Комментарий для всей группы</CardTitle>
                  <CardDescription>
                    Добавьте общую характеристику для всей группы
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="groupComment"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder="Напишите общую характеристику группы..." 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <div className="space-y-4">
                <h2 className="text-xl font-medium">Характеристика студентов</h2>
                
                {students.map((student, index) => {
                  const studentScore = scores.find(
                    score => score.student.user.id === student.user.id
                  );
                  
                  const fullName = `${student.user.lastName || ''} ${student.user.firstName || ''} ${student.user.middleName || ''}`;
                  const totalScore = studentScore 
                    ? (studentScore.scoreForAnsweredTasks || 0) + (studentScore.scoreForAnsweredRetakeTasks || 0) 
                    : 0;
                  
                  return (
                    <Card key={student.user.id} className="border-l-4 border-l-edu-primary">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{fullName}</CardTitle>
                          <Badge variant="outline" className="ml-2">
                            Баллы: {totalScore}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Ключевые характеристики</h4>
                          <div className="flex flex-wrap gap-2">
                            {availableKeywords.map(keyword => {
                              const isSelected = form.getValues(`studentCharacteristics.${index}.keywords`)?.includes(keyword.id);
                              
                              return (
                                <Badge
                                  key={keyword.id}
                                  variant={isSelected ? "default" : "outline"}
                                  className={`cursor-pointer ${isSelected ? 'bg-edu-primary' : ''}`}
                                  onClick={() => handleKeywordToggle(index, keyword.id)}
                                >
                                  {keyword.text}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`studentCharacteristics.${index}.comment`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Индивидуальный комментарий</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Добавьте индивидуальную характеристику..." 
                                  {...field} 
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => handlePreview()}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Предпросмотр
              </Button>
              <Button 
                type="submit" 
                disabled={generating}
                className="flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Создание документа...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Сгенерировать и скачать (PDF)
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Responsive Preview - Dialog for desktop and Drawer for mobile */}
      {isMobile ? (
        <Drawer open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Предпросмотр характеристики</DrawerTitle>
            </DrawerHeader>
            <div className="px-4">
              <CharacteristicPreview content={previewContent} />
            </div>
            <DrawerFooter>
              <Button onClick={() => setIsPreviewOpen(false)}>Закрыть</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Предпросмотр характеристики</DialogTitle>
              <DialogDescription>
                Проверьте содержание перед скачиванием PDF документа
              </DialogDescription>
            </DialogHeader>
            <CharacteristicPreview content={previewContent} />
            <DialogFooter>
              <Button onClick={() => setIsPreviewOpen(false)}>Закрыть</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default GroupCharacteristics;
