import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { useForm } from 'react-hook-form';
import { FileText, Download, Eye, Sparkles, Loader2, FileSpreadsheet } from 'lucide-react';
import { disciplinesAPI } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { aiService } from '@/services/aiService';
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  learningGroups?: {
    learningGroupId: string;
    expelledAt: string | null;
  }[];
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
    learningGroups?: {
      learningGroupId: string;
      expelledAt: string | null;
    }[];
  };
  scoreForAnsweredTasks: number;
  scoreForAnsweredRetakeTasks: number;
}

interface CharacteristicKeyword {
  id: string;
  text: string;
  color: string;
  category: 'positive' | 'neutral' | 'negative';
}

// Available keyword options - expanded with more options including negative ones
const availableKeywords: CharacteristicKeyword[] = [
  // Positive characteristics
  { id: '1', text: 'Хорошо учится', color: 'bg-green-100', category: 'positive' },
  { id: '2', text: 'Активный на занятиях', color: 'bg-blue-100', category: 'positive' },
  { id: '3', text: 'Творческий подход', color: 'bg-purple-100', category: 'positive' },
  { id: '4', text: 'Лидерские качества', color: 'bg-yellow-100', category: 'positive' },
  { id: '6', text: 'Способный к аналитике', color: 'bg-indigo-100', category: 'positive' },
  { id: '7', text: 'Ответственный', color: 'bg-teal-100', category: 'positive' },
  { id: '8', text: 'Организованный', color: 'bg-cyan-100', category: 'positive' },
  { id: '9', text: 'Быстро обучается', color: 'bg-green-100', category: 'positive' },
  { id: '10', text: 'Внимателен к деталям', color: 'bg-blue-100', category: 'positive' },
  
  // Neutral characteristics
  { id: '11', text: 'Средняя успеваемость', color: 'bg-gray-100', category: 'neutral' },
  { id: '12', text: 'Работает в команде', color: 'bg-blue-50', category: 'neutral' },
  { id: '13', text: 'Следует инструкциям', color: 'bg-gray-100', category: 'neutral' },
  
  // Negative characteristics
  { id: '5', text: 'Требуется внимание', color: 'bg-red-100', category: 'negative' },
  { id: '14', text: 'Часто пропускает занятия', color: 'bg-red-100', category: 'negative' },
  { id: '15', text: 'Низкая дисциплина', color: 'bg-red-100', category: 'negative' },
  { id: '16', text: 'Трудности с заданиями', color: 'bg-orange-100', category: 'negative' },
  { id: '17', text: 'Не выполняет домашние задания', color: 'bg-red-100', category: 'negative' },
  { id: '18', text: 'Пассивен на занятиях', color: 'bg-orange-100', category: 'negative' },
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
  const [keywordCategory, setKeywordCategory] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [appendingText, setAppendingText] = useState<{ studentIndex: number; text: string | null }>({ studentIndex: -1, text: null });
  const [enhancingStudentIndex, setEnhancingStudentIndex] = useState<number | null>(null);
  const [enhancingGroup, setEnhancingGroup] = useState(false);
  
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
        
        // Filter out expelled/dismissed students
        const activeStudents = studentData.filter(student => {
          const learningGroups = student.learningGroups || student.user?.student?.learningGroups || [];
          // Check if student is not expelled from this group
          const groupMembership = learningGroups.find(g => g.learningGroupId === groupId);
          return !groupMembership?.expelledAt;
        });
        
        setStudents(activeStudents);
        
        // Get scores
        const scoreGroups = await disciplinesAPI.getStudentScores(disciplineId, groupId);
        if (scoreGroups && scoreGroups.length > 0) {
          // Filter scores to only include active students
          const activeScores = scoreGroups[0].students?.filter(score => {
            const learningGroups = score.student?.learningGroups || [];
            const groupMembership = learningGroups.find(g => g.learningGroupId === groupId);
            return !groupMembership?.expelledAt;
          }) || [];
          
          setScores(activeScores);
          setAverageScore(scoreGroups[0].averageScore);
          
          // Set discipline name
          if (scoreGroups[0].discipline && scoreGroups[0].discipline.name) {
            setDisciplineName(scoreGroups[0].discipline.name);
          }
          
          // Initialize form values with student IDs
          const initialCharacteristics = activeStudents.map(student => ({
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

  const handleAppendText = (studentIndex: number, text: string) => {
    // Update the form with the new text value
    form.setValue(`studentCharacteristics.${studentIndex}.comment`, text);
    
    // Reset the appending text state
    setAppendingText({ studentIndex: -1, text: null });
  };

  const handleKeywordToggle = (studentIndex: number, keywordId: string) => {
    const currentKeywords = form.getValues(`studentCharacteristics.${studentIndex}.keywords`) || [];
    
    const updatedKeywords = currentKeywords.includes(keywordId)
      ? currentKeywords.filter(id => id !== keywordId)
      : [...currentKeywords, keywordId];
    
    form.setValue(`studentCharacteristics.${studentIndex}.keywords`, updatedKeywords);
    
    // Get the keyword text to append to comment
    const keyword = getKeywordById(keywordId);
    if (keyword) {
      setAppendingText({ studentIndex, text: keyword.text });
    }
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
    
    // Header with A-K Project branding
    content += '==========================================\n';
    content += '        A-K Project - ХАРАКТЕРИСТИКА ГРУППЫ\n';
    content += '==========================================\n\n';
    
    // Group and discipline info
    content += `Группа: ${previewData.groupName || 'Не указано'}\n`;
    content += `Дисциплина: ${previewData.disciplineName || 'Не указано'}\n`;
    content += `Дата: ${previewData.date || new Date().toLocaleDateString('ru-RU')}\n`;
    
    // Only show average score if it's available
    if (previewData.averageScore !== null && previewData.averageScore !== undefined) {
      content += `Средний балл группы: ${previewData.averageScore}\n`;
    }
    
    content += '\n';
    
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
    
    // Footer with A-K Project branding
    content += '==========================================\n';
    content += '      A-K Project - Документ сгенерирован системой      \n';
    content += '==========================================\n';
    
    setPreviewContent(content);
    setIsPreviewOpen(true);
  };

  const generateDocument = async (data: FormValues) => {
    setGenerating(true);
    
    try {
      // Prepare comprehensive data for document generation
      const docData = preparePreviewData(data);
      
      // Call the API to generate and download the Word document
      await disciplinesAPI.generateGroupCharacteristicsWord(docData);
      toast.success('Word характеристика успешно сгенерирована и скачана');
    } catch (error) {
      console.error('Error generating Word document:', error);
      toast.error('Ошибка при создании Word характеристики');
    } finally {
      setGenerating(false);
    }
  };

  const getKeywordById = (id: string) => {
    return availableKeywords.find(keyword => keyword.id === id) || null;
  };

  // Filter keywords based on selected category
  const filteredKeywords = keywordCategory === 'all' 
    ? availableKeywords
    : availableKeywords.filter(keyword => keyword.category === keywordCategory);

  // AI enhancement functions
  const enhanceStudentComment = async (studentIndex: number) => {
    setEnhancingStudentIndex(studentIndex);
    
    const currentComment = form.getValues(`studentCharacteristics.${studentIndex}.comment`);
    
    if (!currentComment || currentComment.trim() === '') {
      toast.error('Нечего улучшать. Добавьте текст характеристики сначала.');
      setEnhancingStudentIndex(null);
      return;
    }
    
    try {
      const result = await aiService.enhanceStudentCharacteristic(currentComment);
      
      if (result.success) {
        form.setValue(`studentCharacteristics.${studentIndex}.comment`, result.enhancedText);
        toast.success('Характеристика улучшена с помощью ИИ');
      } else {
        toast.error(result.error || 'Не удалось улучшить характеристику');
      }
    } catch (error) {
      console.error('Error enhancing comment:', error);
      toast.error('Ошибка при улучшении характеристики');
    } finally {
      setEnhancingStudentIndex(null);
    }
  };

  const enhanceGroupComment = async () => {
    setEnhancingGroup(true);
    
    const currentComment = form.getValues('groupComment');
    
    if (!currentComment || currentComment.trim() === '') {
      toast.error('Нечего улучшать. Добавьте текст характеристики сначала.');
      setEnhancingGroup(false);
      return;
    }
    
    try {
      const result = await aiService.enhanceGroupCharacteristic(currentComment);
      
      if (result.success) {
        form.setValue('groupComment', result.enhancedText);
        toast.success('Характеристика группы улучшена с помощью ИИ');
      } else {
        toast.error(result.error || 'Не удалось улучшить характеристику');
      }
    } catch (error) {
      console.error('Error enhancing group comment:', error);
      toast.error('Ошибка при улучшении характеристики группы');
    } finally {
      setEnhancingGroup(false);
    }
  };

  // AI Enhancement for Preview
  const enhanceAllInPreview = async () => {
    // Show loading state
    toast.info('Улучшение всех характеристик с помощью ИИ...');
    
    try {
      // Enhance group comment first
      const groupComment = form.getValues('groupComment');
      if (groupComment && groupComment.trim() !== '') {
        const groupResult = await aiService.enhanceGroupCharacteristic(groupComment);
        if (groupResult.success) {
          form.setValue('groupComment', groupResult.enhancedText);
        }
      }
      
      // Enhance all student comments one by one
      const studentCharacteristics = form.getValues('studentCharacteristics');
      
      for (let i = 0; i < studentCharacteristics.length; i++) {
        const comment = studentCharacteristics[i].comment;
        if (comment && comment.trim() !== '') {
          const result = await aiService.enhanceStudentCharacteristic(comment);
          if (result.success) {
            form.setValue(`studentCharacteristics.${i}.comment`, result.enhancedText);
          }
        }
      }
      
      toast.success('Все характеристики успешно улучшены с помощью ИИ');
    } catch (error) {
      console.error('Error enhancing all comments:', error);
      toast.error('Произошла ошибка при улучшении характеристик');
    }
  };

  // Component for preview content with styled A-K Project text
  const CharacteristicPreview = ({content}: {content: string}) => {
    // Replace A-K Project text with styled version
    const styledContent = content.replace(
      /A-K Project/g, 
      'A-K Project'
    );
    
    return (
      <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-md border max-h-[60vh] overflow-y-auto">
        <div className="mb-4">
          <div className="text-center font-bold">
            <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              A-K Project
            </span> - Система характеристик
          </div>
        </div>
        {styledContent.replace(/A-K Project/g, '')}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <Link to={`/dashboard/disciplines/${disciplineId}/groups/${groupId}`}>
            <Button variant="outline" size="sm" className="mb-2 hover:scale-105 transition-transform">&larr; Назад к студентам</Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight animate-fade-in">Характеристика группы {groupName}</h1>
          {disciplineName && <p className="text-gray-600 animate-slide-in">Дисциплина: {disciplineName}</p>}
          {averageScore !== null && <p className="text-gray-600 animate-slide-in">Средний балл: {averageScore}</p>}
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
          <form onSubmit={form.handleSubmit((data) => generateDocument(data))} className="space-y-8">
            <div className="space-y-6">
              <Card className="animate-fade-in">
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>Комментарий для всей группы</CardTitle>
                    <CardDescription>
                      Добавьте общую характеристику для всей группы
                    </CardDescription>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={enhanceGroupComment}
                    className="mt-2 md:mt-0 flex items-center gap-2"
                    disabled={enhancingGroup}
                  >
                    {enhancingGroup ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Улучшаем...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Улучшить с помощью ИИ
                      </>
                    )}
                  </Button>
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
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                  <h2 className="text-xl font-medium animate-slide-in">Характеристика студентов</h2>
                  
                  <div className="flex gap-2 flex-wrap animate-fade-in">
                    <Badge 
                      variant={keywordCategory === 'all' ? "default" : "outline"} 
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setKeywordCategory('all')}
                    >
                      Все характеристики
                    </Badge>
                    <Badge 
                      variant={keywordCategory === 'positive' ? "default" : "outline"} 
                      className="cursor-pointer hover:scale-105 transition-transform bg-green-100 text-green-800 hover:bg-green-200"
                      onClick={() => setKeywordCategory('positive')}
                    >
                      Положительные
                    </Badge>
                    <Badge 
                      variant={keywordCategory === 'neutral' ? "default" : "outline"} 
                      className="cursor-pointer hover:scale-105 transition-transform bg-gray-100 text-gray-800 hover:bg-gray-200"
                      onClick={() => setKeywordCategory('neutral')}
                    >
                      Нейтральные
                    </Badge>
                    <Badge 
                      variant={keywordCategory === 'negative' ? "default" : "outline"} 
                      className="cursor-pointer hover:scale-105 transition-transform bg-red-100 text-red-800 hover:bg-red-200"
                      onClick={() => setKeywordCategory('negative')}
                    >
                      Отрицательные
                    </Badge>
                  </div>
                </div>
                
                {students.map((student, index) => {
                  const studentScore = scores.find(
                    score => score.student.user.id === student.user.id
                  );
                  
                  const fullName = `${student.user.lastName || ''} ${student.user.firstName || ''} ${student.user.middleName || ''}`;
                  const totalScore = studentScore 
                    ? (studentScore.scoreForAnsweredTasks || 0) + (studentScore.scoreForAnsweredRetakeTasks || 0) 
                    : 0;

                  // Get selected keywords for this student
                  const selectedKeywordIds = form.getValues(`studentCharacteristics.${index}.keywords`) || [];
                  
                  return (
                    <Card key={student.user.id} className="border-l-4 border-l-edu-primary animate-fade-in hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{fullName}</CardTitle>
                          <Badge variant="outline" className="ml-2">
                            Баллы: {totalScore}
                          </Badge>
                        </div>
                        
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => enhanceStudentComment(index)}
                          className="mt-2 md:mt-0 flex items-center gap-2"
                          disabled={enhancingStudentIndex === index}
                        >
                          {enhancingStudentIndex === index ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Улучшаем...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Улучшить с помощью ИИ
                            </>
                          )}
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Ключевые характеристики</h4>
                          <div className="flex flex-wrap gap-2">
                            {filteredKeywords.map(keyword => {
                              const isSelected = selectedKeywordIds.includes(keyword.id);
                              
                              let badgeClasses = "cursor-pointer transition-all duration-200 hover:scale-105 ";
                              
                              // Apply different styling based on category
                              if (isSelected) {
                                switch(keyword.category) {
                                  case 'positive':
                                    badgeClasses += "bg-green-600 hover:bg-green-700";
                                    break;
                                  case 'negative':
                                    badgeClasses += "bg-red-600 hover:bg-red-700";
                                    break;
                                  case 'neutral':
                                    badgeClasses += "bg-gray-600 hover:bg-gray-700";
                                    break;
                                  default:
                                    badgeClasses += "bg-edu-primary hover:bg-edu-primary/90";
                                }
                              } else {
                                switch(keyword.category) {
                                  case 'positive':
                                    badgeClasses += "border-green-300 hover:bg-green-100 text-green-800";
                                    break;
                                  case 'negative':
                                    badgeClasses += "border-red-300 hover:bg-red-100 text-red-800";
                                    break;
                                  case 'neutral':
                                    badgeClasses += "border-gray-300 hover:bg-gray-100 text-gray-800";
                                    break;
                                  default:
                                    badgeClasses += "";
                                }
                              }
                              
                              return (
                                <Badge
                                  key={keyword.id}
                                  variant={isSelected ? "default" : "outline"}
                                  className={badgeClasses}
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
                            <FormItem className="animate-fade-in">
                              <FormLabel>Индивидуальный комментарий</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Добавьте индивидуальную характеристику..." 
                                  className="resize-vertical focus:ring-2 focus:ring-edu-primary/30 transition-all"
                                  appendText={appendingText.studentIndex === index ? appendingText.text || undefined : undefined}
                                  onAppendText={(text) => handleAppendText(index, text)}
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
            
            <div className="flex flex-wrap justify-end gap-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => handlePreview()}
                className="flex items-center gap-2 hover:scale-105 transition-transform animate-fade-in"
              >
                <Eye className="h-4 w-4" />
                Предпросмотр
              </Button>
              
              <Button
                type="submit"
                disabled={generating}
                className="flex items-center gap-2 hover:scale-105 transition-transform animate-fade-in"
              >
                {generating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Создание Word...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Сгенерировать Word
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
          <DrawerContent className="animate-slide-in-right">
            <DrawerHeader className="flex justify-between items-center">
              <DrawerTitle>Предпросмотр характеристики</DrawerTitle>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={enhanceAllInPreview}
              >
                <Sparkles className="h-4 w-4" />
                Улучшить все
              </Button>
            </DrawerHeader>
            <div className="px-4">
              <CharacteristicPreview content={previewContent} />
            </div>
            <DrawerFooter>
              <Button onClick={() => setIsPreviewOpen(false)} className="hover:scale-105 transition-transform">Закрыть</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="sm:max-w-[800px] animate-scale-in">
            <DialogHeader className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <DialogTitle>Предпросмотр характеристики</DialogTitle>
                <DialogDescription>
                  Проверьте содержание перед скачиванием документа
                </DialogDescription>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2 md:mt-0 flex items-center gap-2"
                onClick={enhanceAllInPreview}
              >
                <Sparkles className="h-4 w-4" />
                Улучшить все с помощью ИИ
              </Button>
            </DialogHeader>
            <CharacteristicPreview content={previewContent} />
            <DialogFooter>
              <Button onClick={() => setIsPreviewOpen(false)} className="hover:scale-105 transition-transform">Закрыть</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default GroupCharacteristics;
