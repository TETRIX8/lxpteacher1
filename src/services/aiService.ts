
// AI text enhancement service

interface EnhanceTextResponse {
  enhancedText: string;
  success: boolean;
  error?: string;
}

interface CharacteristicData {
  studentName: string;
  academicPerformance: string;
  behavior: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface GroupCharacteristicData {
  groupName: string;
  totalStudents: number;
  academicLevel: string;
  groupDynamics: string;
  commonStrengths: string[];
  commonChallenges: string[];
  recommendations: string[];
}

export const aiService = {
  // Генерация характеристики студента с помощью Pollinations API
  generateStudentCharacteristic: async (data: CharacteristicData): Promise<EnhanceTextResponse> => {
    const prompt = `Создай профессиональную характеристику студента для педагогической документации.

Студент: ${data.studentName}
Успеваемость: ${data.academicPerformance}
Поведение: ${data.behavior}
Сильные стороны: ${data.strengths.join(', ')}
Слабые стороны: ${data.weaknesses.join(', ')}
Рекомендации: ${data.recommendations.join(', ')}

Создай структурированную характеристику в следующем формате:
1. Общая оценка успеваемости и поведения
2. Анализ сильных сторон с примерами
3. Области для улучшения
4. Конкретные рекомендации для развития
5. Прогноз дальнейшего обучения

Используй педагогическую терминологию, будь объективным и конструктивным.`;

    return await callPollinationsAPI(prompt);
  },

  // Генерация характеристики группы
  generateGroupCharacteristic: async (data: GroupCharacteristicData): Promise<EnhanceTextResponse> => {
    const prompt = `Создай профессиональную характеристику учебной группы для педагогической документации.

Группа: ${data.groupName}
Количество студентов: ${data.totalStudents}
Общий уровень успеваемости: ${data.academicLevel}
Групповая динамика: ${data.groupDynamics}
Общие сильные стороны: ${data.commonStrengths.join(', ')}
Общие проблемы: ${data.commonChallenges.join(', ')}
Рекомендации: ${data.recommendations.join(', ')}

Создай структурированную характеристику группы в следующем формате:
1. Общая характеристика группы
2. Анализ успеваемости и дисциплины
3. Групповая динамика и взаимодействие
4. Общие сильные стороны группы
5. Проблемные области
6. Рекомендации для улучшения работы группы

Используй педагогическую терминологию, будь объективным и конструктивным.`;

    return await callPollinationsAPI(prompt);
  },

  // Улучшение существующей характеристики студента
  enhanceStudentCharacteristic: async (originalText: string): Promise<EnhanceTextResponse> => {
    const prompt = `Улучши эту характеристику студента, сделав её более профессиональной, 
    информативной и конструктивной. Используй педагогическую терминологию, где уместно. 
    Дай только улучшенный текст без объяснений или вводных фраз. Никаких "вот улучшенная характеристика" или подобных фраз:
    
    ${originalText}`;
    
    return await callPollinationsAPI(prompt);
  },
  
  // Улучшение характеристики группы
  enhanceGroupCharacteristic: async (originalText: string): Promise<EnhanceTextResponse> => {
    const prompt = `Улучши эту характеристику учебной группы, сделав её более профессиональной, 
    информативной и конструктивной. Используй педагогическую терминологию для описания групповой динамики. 
    Дай только улучшенный текст без объяснений, вводных или заключительных фраз. Не добавляй комментариев от себя:
    
    ${originalText}`;
    
    return await callPollinationsAPI(prompt);
  },

  // Генерация краткой характеристики на основе ключевых слов
  generateCharacteristicFromKeywords: async (
    studentName: string, 
    keywords: string[], 
    academicLevel: string
  ): Promise<EnhanceTextResponse> => {
    const prompt = `Создай краткую, но информативную характеристику студента на основе следующих данных:

Студент: ${studentName}
Уровень успеваемости: ${academicLevel}
Ключевые качества: ${keywords.join(', ')}

Создай характеристику в 2-3 абзаца, которая:
- Начинается с общей оценки успеваемости
- Описывает ключевые качества студента
- Включает конкретные примеры проявления качеств
- Заканчивается краткой рекомендацией для дальнейшего развития

Используй педагогическую терминологию и будь конструктивным.`;

    return await callPollinationsAPI(prompt);
  },

  // Генерация рекомендаций для студента
  generateStudentRecommendations: async (
    studentName: string,
    strengths: string[],
    weaknesses: string[]
  ): Promise<EnhanceTextResponse> => {
    const prompt = `Создай конкретные рекомендации для развития студента:

Студент: ${studentName}
Сильные стороны: ${strengths.join(', ')}
Области для улучшения: ${weaknesses.join(', ')}

Создай 3-5 конкретных рекомендаций, которые:
- Основаны на сильных сторонах студента
- Направлены на преодоление слабостей
- Практически применимы
- Включают временные рамки
- Учитывают индивидуальный подход

Формат: пронумерованный список с краткими, но конкретными рекомендациями.`;

    return await callPollinationsAPI(prompt);
  }
};

// Общая функция для вызова Pollinations API
async function callPollinationsAPI(prompt: string): Promise<EnhanceTextResponse> {
  try {
    // Используем Pollinations API
    const response = await fetch('https://text.pollinations.ai/' + encodeURIComponent(prompt));
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.text();
    
    return {
      enhancedText: result.trim(),
      success: true
    };
  } catch (error) {
    console.error('Error calling Pollinations API:', error);
    
    // Fallback к предыдущему API
    const url = 'https://chatgpt-42.p.rapidapi.com/aitohuman';
    
    const options = {
      method: 'POST',
      headers: {
        'x-rapidapi-key': 'ffa0249cd3mshfb71d7035c856b4p1d723ajsn807262f10334',
        'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: prompt
      })
    };

    try {
      const fallbackResponse = await fetch(url, options);
      
      if (!fallbackResponse.ok) {
        throw new Error(`HTTP error! Status: ${fallbackResponse.status}`);
      }
      
      const fallbackResult = await fallbackResponse.json();
      return {
        enhancedText: fallbackResult.result || 'Не удалось сгенерировать характеристику.',
        success: true
      };
    } catch (fallbackError) {
      console.error('Error with fallback API:', fallbackError);
      return {
        enhancedText: 'Не удалось сгенерировать характеристику. Попробуйте позже.',
        success: false,
        error: 'Ошибка подключения к сервису генерации текста.'
      };
    }
  }
}
