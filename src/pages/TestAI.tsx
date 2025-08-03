import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { aiService } from '@/services/aiService';
import { Sparkles, Loader2, Copy, RefreshCw } from 'lucide-react';

const TestAI = () => {
  const [prompt, setPrompt] = useState('Создай характеристику студента Иванова Ивана Ивановича с отличной успеваемостью');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTestAPI = async () => {
    if (!prompt.trim()) {
      toast.error('Введите промпт для тестирования');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://text.pollinations.ai/' + encodeURIComponent(prompt));
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const text = await response.text();
      setResult(text);
      toast.success('API работает корректно!');
    } catch (error) {
      console.error('Error testing API:', error);
      setResult('Ошибка: ' + error.message);
      toast.error('Ошибка при тестировании API');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAIService = async () => {
    if (!prompt.trim()) {
      toast.error('Введите промпт для тестирования');
      return;
    }

    setIsLoading(true);
    try {
      const result = await aiService.generateStudentCharacteristic({
        studentName: 'Иванов Иван Иванович',
        academicPerformance: 'Отличный',
        behavior: 'Отличное',
        strengths: ['Ответственность', 'Трудолюбие', 'Аналитическое мышление'],
        weaknesses: ['Требует мотивации'],
        recommendations: ['Повысить активность на занятиях']
      });

      if (result.success) {
        setResult(result.enhancedText);
        toast.success('AI сервис работает корректно!');
      } else {
        setResult('Ошибка: ' + (result.error || 'Неизвестная ошибка'));
        toast.error('Ошибка в AI сервисе');
      }
    } catch (error) {
      console.error('Error testing AI service:', error);
      setResult('Ошибка: ' + error.message);
      toast.error('Ошибка при тестировании AI сервиса');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResult = () => {
    navigator.clipboard.writeText(result);
    toast.success('Результат скопирован в буфер обмена');
  };

  const handleClear = () => {
    setResult('');
    setPrompt('');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-edu-primary via-purple-600 to-edu-secondary bg-clip-text text-transparent">
          Тестирование AI API
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Проверка работы Pollinations API и AI сервиса
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Тестирование прямого API */}
        <Card className="edu-card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>Прямое тестирование API</span>
            </CardTitle>
            <CardDescription>
              Тестирование Pollinations API напрямую
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt">Промпт для тестирования</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Введите промпт для тестирования..."
                className="mt-1"
                rows={4}
              />
            </div>
            
            <Button 
              onClick={handleTestAPI}
              disabled={isLoading}
              className="w-full edu-button-primary"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Тестирование...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Тестировать API</span>
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Тестирование AI сервиса */}
        <Card className="edu-card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Тестирование AI сервиса</span>
            </CardTitle>
            <CardDescription>
              Тестирование нашего AI сервиса с характеристиками
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ai-prompt">Промпт для AI сервиса</Label>
              <Textarea
                id="ai-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Введите промпт для AI сервиса..."
                className="mt-1"
                rows={4}
              />
            </div>
            
            <Button 
              onClick={handleTestAIService}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Тестирование AI...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Тестировать AI сервис</span>
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Результат */}
      {result && (
        <Card className="edu-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Результат тестирования</span>
              <div className="flex space-x-2">
                <Button
                  onClick={handleCopyResult}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Копировать</span>
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Очистить</span>
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                {result}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Информация об API */}
      <Card className="edu-card">
        <CardHeader>
          <CardTitle>Информация об API</CardTitle>
          <CardDescription>
            Детали работы Pollinations API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-green-600">Преимущества</h4>
              <ul className="text-sm space-y-1 mt-2">
                <li>• Бесплатный доступ</li>
                <li>• Простая интеграция</li>
                <li>• Быстрый ответ</li>
                <li>• Поддержка русского языка</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-600">Ограничения</h4>
              <ul className="text-sm space-y-1 mt-2">
                <li>• Ограниченная длина ответа</li>
                <li>• Возможны задержки</li>
                <li>• Нет гарантии доступности</li>
                <li>• Fallback на другой API</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Как это работает
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Система сначала пытается использовать Pollinations API для генерации текста. 
              Если он недоступен, автоматически переключается на резервный API. 
              Это обеспечивает надежность работы системы генерации характеристик.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAI; 