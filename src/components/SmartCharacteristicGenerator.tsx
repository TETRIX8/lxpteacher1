import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { aiService } from '@/services/aiService';
import { 
  Sparkles, 
  Loader2, 
  User, 
  Users, 
  BookOpen, 
  Target, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SmartCharacteristicGeneratorProps {
  onCharacteristicGenerated: (characteristic: string) => void;
  studentName?: string;
  groupName?: string;
  isGroup?: boolean;
}

const SmartCharacteristicGenerator: React.FC<SmartCharacteristicGeneratorProps> = ({
  onCharacteristicGenerated,
  studentName = '',
  groupName = '',
  isGroup = false
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCharacteristic, setGeneratedCharacteristic] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Состояния для студента
  const [studentData, setStudentData] = useState({
    name: studentName,
    academicPerformance: '',
    behavior: '',
    strengths: [] as string[],
    weaknesses: [] as string[],
    recommendations: [] as string[]
  });

  // Состояния для группы
  const [groupData, setGroupData] = useState({
    name: groupName,
    totalStudents: 0,
    academicLevel: '',
    groupDynamics: '',
    commonStrengths: [] as string[],
    commonChallenges: [] as string[],
    recommendations: [] as string[]
  });

  // Предустановленные опции
  const academicLevels = [
    'Отличный',
    'Хороший', 
    'Средний',
    'Ниже среднего',
    'Низкий'
  ];

  const behaviorLevels = [
    'Отличное',
    'Хорошее',
    'Удовлетворительное', 
    'Неудовлетворительное'
  ];

  const groupDynamicsOptions = [
    'Сплоченная, дружная группа',
    'Активная, инициативная группа',
    'Спокойная, рабочая атмосфера',
    'Разрозненная, требует сплочения',
    'Конфликтная, требует внимания'
  ];

  const commonStrengths = [
    'Высокая мотивация к обучению',
    'Хорошая дисциплина',
    'Активное участие в занятиях',
    'Взаимопомощь между студентами',
    'Творческий подход к заданиям',
    'Ответственность в выполнении работ'
  ];

  const commonChallenges = [
    'Низкая мотивация к обучению',
    'Проблемы с дисциплиной',
    'Пассивность на занятиях',
    'Конфликты между студентами',
    'Неорганизованность',
    'Проблемы с посещаемостью'
  ];

  const handleGenerateStudentCharacteristic = async () => {
    if (!studentData.name.trim()) {
      toast.error('Введите имя студента');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await aiService.generateStudentCharacteristic({
        studentName: studentData.name,
        academicPerformance: studentData.academicPerformance,
        behavior: studentData.behavior,
        strengths: studentData.strengths,
        weaknesses: studentData.weaknesses,
        recommendations: studentData.recommendations
      });

      if (result.success) {
        setGeneratedCharacteristic(result.enhancedText);
        onCharacteristicGenerated(result.enhancedText);
        toast.success('Характеристика успешно сгенерирована!');
      } else {
        toast.error(result.error || 'Ошибка генерации характеристики');
      }
    } catch (error) {
      console.error('Error generating characteristic:', error);
      toast.error('Ошибка при генерации характеристики');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateGroupCharacteristic = async () => {
    if (!groupData.name.trim()) {
      toast.error('Введите название группы');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await aiService.generateGroupCharacteristic({
        groupName: groupData.name,
        totalStudents: groupData.totalStudents,
        academicLevel: groupData.academicLevel,
        groupDynamics: groupData.groupDynamics,
        commonStrengths: groupData.commonStrengths,
        commonChallenges: groupData.commonChallenges,
        recommendations: groupData.recommendations
      });

      if (result.success) {
        setGeneratedCharacteristic(result.enhancedText);
        onCharacteristicGenerated(result.enhancedText);
        toast.success('Характеристика группы успешно сгенерирована!');
      } else {
        toast.error(result.error || 'Ошибка генерации характеристики');
      }
    } catch (error) {
      console.error('Error generating group characteristic:', error);
      toast.error('Ошибка при генерации характеристики группы');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickGenerate = async () => {
    if (isGroup) {
      // Быстрая генерация для группы
      if (!groupData.name.trim()) {
        toast.error('Введите название группы');
        return;
      }

      setIsGenerating(true);
      try {
        const result = await aiService.generateGroupCharacteristic({
          groupName: groupData.name,
          totalStudents: groupData.totalStudents || 20,
          academicLevel: groupData.academicLevel || 'Средний',
          groupDynamics: groupData.groupDynamics || 'Спокойная, рабочая атмосфера',
          commonStrengths: groupData.commonStrengths.length > 0 ? groupData.commonStrengths : ['Хорошая дисциплина'],
          commonChallenges: groupData.commonChallenges.length > 0 ? groupData.commonChallenges : ['Требует мотивации'],
          recommendations: groupData.recommendations.length > 0 ? groupData.recommendations : ['Повысить активность на занятиях']
        });

        if (result.success) {
          setGeneratedCharacteristic(result.enhancedText);
          onCharacteristicGenerated(result.enhancedText);
          toast.success('Характеристика группы сгенерирована!');
        }
      } catch (error) {
        toast.error('Ошибка при быстрой генерации');
      } finally {
        setIsGenerating(false);
      }
    } else {
      // Быстрая генерация для студента
      if (!studentData.name.trim()) {
        toast.error('Введите имя студента');
        return;
      }

      setIsGenerating(true);
      try {
        const result = await aiService.generateStudentCharacteristic({
          studentName: studentData.name,
          academicPerformance: studentData.academicPerformance || 'Средний',
          behavior: studentData.behavior || 'Хорошее',
          strengths: studentData.strengths.length > 0 ? studentData.strengths : ['Ответственность'],
          weaknesses: studentData.weaknesses.length > 0 ? studentData.weaknesses : ['Требует мотивации'],
          recommendations: studentData.recommendations.length > 0 ? studentData.recommendations : ['Повысить активность']
        });

        if (result.success) {
          setGeneratedCharacteristic(result.enhancedText);
          onCharacteristicGenerated(result.enhancedText);
          toast.success('Характеристика студента сгенерирована!');
        }
      } catch (error) {
        toast.error('Ошибка при быстрой генерации');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const toggleStrength = (strength: string) => {
    const currentStrengths = isGroup ? groupData.commonStrengths : studentData.strengths;
    const setStrengths = isGroup 
      ? (strengths: string[]) => setGroupData({...groupData, commonStrengths: strengths})
      : (strengths: string[]) => setStudentData({...studentData, strengths: strengths});

    if (currentStrengths.includes(strength)) {
      setStrengths(currentStrengths.filter(s => s !== strength));
    } else {
      setStrengths([...currentStrengths, strength]);
    }
  };

  const toggleChallenge = (challenge: string) => {
    const currentChallenges = isGroup ? groupData.commonChallenges : studentData.weaknesses;
    const setChallenges = isGroup 
      ? (challenges: string[]) => setGroupData({...groupData, commonChallenges: challenges})
      : (challenges: string[]) => setStudentData({...studentData, weaknesses: challenges});

    if (currentChallenges.includes(challenge)) {
      setChallenges(currentChallenges.filter(c => c !== challenge));
    } else {
      setChallenges([...currentChallenges, challenge]);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="edu-card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Умная генерация характеристик</span>
          </CardTitle>
          <CardDescription>
            Создайте профессиональную характеристику с помощью ИИ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Быстрая генерация */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
              <Label className="font-medium">Быстрая генерация</Label>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">
                  {isGroup ? 'Название группы' : 'Имя студента'}
                </Label>
                <Input
                  id="name"
                  value={isGroup ? groupData.name : studentData.name}
                  onChange={(e) => {
                    if (isGroup) {
                      setGroupData({...groupData, name: e.target.value});
                    } else {
                      setStudentData({...studentData, name: e.target.value});
                    }
                  }}
                  placeholder={isGroup ? "Введите название группы" : "Введите имя студента"}
                  className="mt-1"
                />
              </div>
              
              {isGroup && (
                <div>
                  <Label htmlFor="totalStudents">Количество студентов</Label>
                  <Input
                    id="totalStudents"
                    type="number"
                    value={groupData.totalStudents}
                    onChange={(e) => setGroupData({...groupData, totalStudents: parseInt(e.target.value) || 0})}
                    placeholder="20"
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            <Button 
              onClick={handleQuickGenerate}
              disabled={isGenerating}
              className="w-full edu-button-primary"
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Генерация...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Быстрая генерация</span>
                </div>
              )}
            </Button>
          </div>

          {/* Расширенные настройки */}
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              {showAdvanced ? 'Скрыть' : 'Показать'} расширенные настройки
            </Button>

            {showAdvanced && (
              <div className="space-y-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {/* Основные параметры */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="academicLevel">
                      {isGroup ? 'Общий уровень успеваемости' : 'Уровень успеваемости'}
                    </Label>
                    <Select
                      value={isGroup ? groupData.academicLevel : studentData.academicPerformance}
                      onValueChange={(value) => {
                        if (isGroup) {
                          setGroupData({...groupData, academicLevel: value});
                        } else {
                          setStudentData({...studentData, academicPerformance: value});
                        }
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Выберите уровень" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {!isGroup && (
                    <div>
                      <Label htmlFor="behavior">Поведение</Label>
                      <Select
                        value={studentData.behavior}
                        onValueChange={(value) => setStudentData({...studentData, behavior: value})}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Выберите уровень поведения" />
                        </SelectTrigger>
                        <SelectContent>
                          {behaviorLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {isGroup && (
                    <div>
                      <Label htmlFor="groupDynamics">Групповая динамика</Label>
                      <Select
                        value={groupData.groupDynamics}
                        onValueChange={(value) => setGroupData({...groupData, groupDynamics: value})}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Выберите тип динамики" />
                        </SelectTrigger>
                        <SelectContent>
                          {groupDynamicsOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Сильные стороны */}
                <div>
                  <Label className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{isGroup ? 'Общие сильные стороны группы' : 'Сильные стороны студента'}</span>
                  </Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {commonStrengths.map((strength) => (
                      <Badge
                        key={strength}
                        variant={isGroup 
                          ? (groupData.commonStrengths.includes(strength) ? "default" : "outline")
                          : (studentData.strengths.includes(strength) ? "default" : "outline")
                        }
                        className="cursor-pointer hover:bg-green-100"
                        onClick={() => toggleStrength(strength)}
                      >
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Проблемные области */}
                <div>
                  <Label className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span>{isGroup ? 'Общие проблемы группы' : 'Области для улучшения'}</span>
                  </Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {commonChallenges.map((challenge) => (
                      <Badge
                        key={challenge}
                        variant={isGroup 
                          ? (groupData.commonChallenges.includes(challenge) ? "destructive" : "outline")
                          : (studentData.weaknesses.includes(challenge) ? "destructive" : "outline")
                        }
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => toggleChallenge(challenge)}
                      >
                        {challenge}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Рекомендации */}
                <div>
                  <Label className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span>Рекомендации</span>
                  </Label>
                  <Textarea
                    placeholder="Введите рекомендации для развития..."
                    value={isGroup ? groupData.recommendations.join('\n') : studentData.recommendations.join('\n')}
                    onChange={(e) => {
                      const recommendations = e.target.value.split('\n').filter(r => r.trim());
                      if (isGroup) {
                        setGroupData({...groupData, recommendations});
                      } else {
                        setStudentData({...studentData, recommendations});
                      }
                    }}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={isGroup ? handleGenerateGroupCharacteristic : handleGenerateStudentCharacteristic}
                  disabled={isGenerating}
                  className="w-full edu-button-primary"
                >
                  {isGenerating ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Генерация...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Сгенерировать характеристику</span>
                    </div>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Результат генерации */}
      {generatedCharacteristic && (
        <Card className="edu-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-edu-primary" />
              <span>Сгенерированная характеристика</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {generatedCharacteristic}
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(generatedCharacteristic);
                  toast.success('Характеристика скопирована в буфер обмена');
                }}
                variant="outline"
                size="sm"
              >
                Копировать
              </Button>
              <Button
                onClick={() => {
                  setGeneratedCharacteristic('');
                  onCharacteristicGenerated('');
                }}
                variant="outline"
                size="sm"
              >
                Очистить
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartCharacteristicGenerator; 