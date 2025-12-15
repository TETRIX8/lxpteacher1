// AI text enhancement service using Pollinations API

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

// Функция для вызова Pollinations API с оптимальными параметрами
async function callPollinationsAPI(prompt: string, temperature: number = 0.8): Promise<EnhanceTextResponse> {
  try {
    const systemPrompt = encodeURIComponent(
      "Ты профессиональный педагог-методист с 20-летним опытом. " +
      "Создаёшь идеальные характеристики студентов: грамотные, структурированные, с конкретными примерами. " +
      "Используй профессиональную педагогическую терминологию. Пиши на русском языке."
    );
    
    const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=mistral&temperature=${temperature}&system=${systemPrompt}`;
    
    const response = await fetch(url);
    
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
    return {
      enhancedText: 'Не удалось сгенерировать характеристику. Попробуйте позже.',
      success: false,
      error: 'Ошибка подключения к сервису генерации текста.'
    };
  }
}

export const aiService = {
  // Генерация идеальной характеристики студента
  generateStudentCharacteristic: async (data: CharacteristicData): Promise<EnhanceTextResponse> => {
    const prompt = `Создай ИДЕАЛЬНУЮ профессиональную характеристику студента для педагогической документации.

ДАННЫЕ СТУДЕНТА:
• Полное имя: ${data.studentName}
• Уровень успеваемости: ${data.academicPerformance || 'хороший'}
• Поведение и дисциплина: ${data.behavior || 'примерное'}
• Ключевые достоинства: ${data.strengths.length > 0 ? data.strengths.join(', ') : 'ответственность, трудолюбие'}
• Области для развития: ${data.weaknesses.length > 0 ? data.weaknesses.join(', ') : 'требует дополнительной мотивации'}
• Педагогические рекомендации: ${data.recommendations.length > 0 ? data.recommendations.join(', ') : 'развивать творческий потенциал'}

ТРЕБОВАНИЯ К ХАРАКТЕРИСТИКЕ:
1. ОБЯЗАТЕЛЬНО используй имя "${data.studentName}" в тексте минимум 3-4 раза
2. Начни с вводного абзаца: "${data.studentName} является студентом..."
3. Структура:
   - Общая характеристика личности и учебной деятельности
   - Успеваемость и отношение к учёбе с конкретными примерами
   - Поведение, дисциплина, взаимоотношения с коллективом
   - Сильные стороны и достижения (приведи примеры проявления)
   - Области для развития (деликатно, конструктивно)
   - Рекомендации для дальнейшего развития
   - Заключение с прогнозом

4. Объём: 4-5 полных абзацев
5. Стиль: официально-деловой, но не сухой
6. Каждое качество подкрепляй примером проявления
7. Заверши позитивной перспективой развития

Пиши характеристику БЕЗ заголовков и нумерации, сплошным текстом с абзацами.`;

    return await callPollinationsAPI(prompt, 0.7);
  },

  // Генерация характеристики группы
  generateGroupCharacteristic: async (data: GroupCharacteristicData): Promise<EnhanceTextResponse> => {
    const prompt = `Создай ИДЕАЛЬНУЮ профессиональную характеристику учебной группы.

ДАННЫЕ ГРУППЫ:
• Название группы: ${data.groupName}
• Количество студентов: ${data.totalStudents || 25}
• Общий уровень успеваемости: ${data.academicLevel || 'хороший'}
• Групповая динамика: ${data.groupDynamics || 'сплочённый коллектив'}
• Сильные стороны группы: ${data.commonStrengths.length > 0 ? data.commonStrengths.join(', ') : 'активность, взаимопомощь'}
• Проблемные области: ${data.commonChallenges.length > 0 ? data.commonChallenges.join(', ') : 'требуется повышение мотивации'}
• Рекомендации: ${data.recommendations.length > 0 ? data.recommendations.join(', ') : 'развивать командную работу'}

ТРЕБОВАНИЯ:
1. Используй название группы "${data.groupName}" в тексте
2. Структура характеристики:
   - Общая характеристика группы и её особенности
   - Анализ успеваемости с примерами
   - Групповая динамика и климат в коллективе
   - Сильные стороны группы
   - Области для улучшения
   - Конкретные рекомендации
   - Перспективы развития группы

3. Объём: 4-5 абзацев
4. Стиль: профессиональный, конструктивный

Пиши БЕЗ заголовков и нумерации, сплошным текстом.`;

    return await callPollinationsAPI(prompt, 0.7);
  },

  // Быстрая генерация на основе ключевых слов
  generateCharacteristicFromKeywords: async (
    studentName: string, 
    keywords: string[], 
    academicLevel: string
  ): Promise<EnhanceTextResponse> => {
    const prompt = `Создай краткую ИДЕАЛЬНУЮ характеристику студента.

ДАННЫЕ:
• Имя студента: ${studentName}
• Уровень успеваемости: ${academicLevel || 'хороший'}
• Ключевые качества: ${keywords.join(', ')}

ТРЕБОВАНИЯ:
1. ОБЯЗАТЕЛЬНО используй имя "${studentName}" минимум 2-3 раза
2. Начни: "${studentName} является..."
3. Раскрой каждое качество с примером его проявления
4. Объём: 2-3 абзаца
5. Заверши позитивной рекомендацией

Пиши сплошным текстом без заголовков.`;

    return await callPollinationsAPI(prompt, 0.8);
  },

  // Улучшение существующей характеристики
  enhanceStudentCharacteristic: async (originalText: string): Promise<EnhanceTextResponse> => {
    const prompt = `Улучши эту характеристику студента, сделав её ИДЕАЛЬНОЙ:

ОРИГИНАЛ:
${originalText}

ЗАДАЧА:
1. Сохрани все упомянутые имена и факты
2. Добавь профессиональную педагогическую терминологию
3. Расширь каждый тезис конкретными примерами
4. Улучши структуру и логику изложения
5. Добавь конструктивные рекомендации
6. Заверши позитивным прогнозом

Дай ТОЛЬКО улучшенный текст, без комментариев.`;
    
    return await callPollinationsAPI(prompt, 0.6);
  },
  
  // Улучшение характеристики группы
  enhanceGroupCharacteristic: async (originalText: string): Promise<EnhanceTextResponse> => {
    const prompt = `Улучши эту характеристику учебной группы, сделав её ИДЕАЛЬНОЙ:

ОРИГИНАЛ:
${originalText}

ЗАДАЧА:
1. Сохрани название группы и все факты
2. Добавь педагогическую терминологию
3. Расширь описание групповой динамики
4. Добавь конкретные примеры
5. Включи конструктивные рекомендации

Дай ТОЛЬКО улучшенный текст, без комментариев.`;

    return await callPollinationsAPI(prompt, 0.6);
  },

  // Генерация рекомендаций для студента
  generateStudentRecommendations: async (
    studentName: string,
    strengths: string[],
    weaknesses: string[]
  ): Promise<EnhanceTextResponse> => {
    const prompt = `Создай персональные рекомендации для развития студента.

ДАННЫЕ:
• Студент: ${studentName}
• Сильные стороны: ${strengths.join(', ')}
• Области для развития: ${weaknesses.join(', ')}

Создай 5 конкретных рекомендаций для ${studentName}:
1. Основаны на сильных сторонах
2. Направлены на преодоление слабостей
3. Практически применимы
4. С конкретными действиями
5. С ожидаемыми результатами

Формат: пронумерованный список.`;

    return await callPollinationsAPI(prompt, 0.7);
  }
};
