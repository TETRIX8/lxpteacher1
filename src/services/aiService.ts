
// AI text enhancement service

interface EnhanceTextResponse {
  enhancedText: string;
  success: boolean;
  error?: string;
}

export const aiService = {
  enhanceStudentCharacteristic: async (originalText: string): Promise<EnhanceTextResponse> => {
    const url = 'https://chatgpt-42.p.rapidapi.com/aitohuman';
    
    // Create a prompt that guides the AI to enhance student characteristics
    const prompt = `Улучши эту характеристику студента, сделав её более профессиональной, 
    информативной и конструктивной. Сохрани все упомянутые качества, но выражай их более 
    академическим языком. Используй педагогическую терминологию, где уместно. 
    Убедись, что результат звучит как профессиональная характеристика от преподавателя:
    
    ${originalText}`;
    
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
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        enhancedText: result.result || originalText,
        success: true
      };
    } catch (error) {
      console.error('Error enhancing text:', error);
      return {
        enhancedText: originalText,
        success: false,
        error: 'Не удалось улучшить текст. Попробуйте позже.'
      };
    }
  },
  
  enhanceGroupCharacteristic: async (originalText: string): Promise<EnhanceTextResponse> => {
    const url = 'https://chatgpt-42.p.rapidapi.com/aitohuman';
    
    // Create a prompt specifically for group characteristics
    const prompt = `Улучши эту характеристику учебной группы, сделав её более профессиональной, 
    информативной и конструктивной. Сохрани все упомянутые аспекты, но выражай их более 
    академическим языком. Используй педагогическую терминологию для описания групповой динамики, 
    успеваемости и особенностей группы. Результат должен звучать как профессиональная 
    характеристика группы от преподавателя:
    
    ${originalText}`;
    
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
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        enhancedText: result.result || originalText,
        success: true
      };
    } catch (error) {
      console.error('Error enhancing text:', error);
      return {
        enhancedText: originalText,
        success: false,
        error: 'Не удалось улучшить текст. Попробуйте позже.'
      };
    }
  }
};
