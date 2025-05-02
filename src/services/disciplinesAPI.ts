
import api from './apiClient';

// Helper function to generate document content
function generateDocumentContent(data: any, format: 'pdf' | 'word' | 'excel') {
  // In a real implementation, this would use a proper library to generate the document
  // For the purposes of this demo, we're creating a mock text representation
  
  let content = '';
  
  // Header with A-K Project branding
  content += '==========================================\n';
  content += `        A-K Project - ХАРАКТЕРИСТИКА ГРУППЫ (${format.toUpperCase()})\n`;
  content += '==========================================\n\n';
  
  // Group and discipline info
  content += `Группа: ${data.groupName || 'Не указано'}\n`;
  content += `Дисциплина: ${data.disciplineName || 'Не указано'}\n`;
  content += `Дата: ${data.date || new Date().toLocaleDateString('ru-RU')}\n`;
  content += `Формат: ${format.toUpperCase()}\n`;
  
  // Only show average score if it's available
  if (data.averageScore !== null && data.averageScore !== undefined) {
    content += `Средний балл группы: ${data.averageScore}\n`;
  }
  
  content += '\n';
  
  // Group comment
  content += '==========================================\n';
  content += 'ОБЩАЯ ХАРАКТЕРИСТИКА ГРУППЫ\n';
  content += '==========================================\n';
  content += data.groupComment || 'Не указана\n\n';
  
  // Students
  content += '==========================================\n';
  content += 'ХАРАКТЕРИСТИКИ СТУДЕНТОВ\n';
  content += '==========================================\n\n';
  
  if (data.students && data.students.length > 0) {
    data.students.forEach((student: any, index: number) => {
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
  content += `      A-K Project - Документ сгенерирован системой (${format.toUpperCase()})      \n`;
  content += '==========================================\n';
  
  // Add format-specific note
  if (format === 'word') {
    content += '\nДокумент сгенерирован в формате Microsoft Word\n';
  } else if (format === 'excel') {
    content += '\nДокумент сгенерирован в формате Microsoft Excel с таблицей данных\n';
  }
  
  return content;
}

export const disciplinesAPI = {
  getLearningGroups: async (disciplineId: string) => {
    const query = `
    query DisciplineLearningGroupsForSelect($input: DisciplineLearningGroupsInput!) {
      disciplineLearningGroups(input: $input) {
        id
        name
        isArchived
        type
        organizationId
        suborganizationIdV2
        __typename
      }
    }
    `;
    
    const variables = {
      input: {
        disciplineId: disciplineId,
        filters: {}
      }
    };

    try {
      const response = await api.post('', { query, variables });
      return response.data.data.disciplineLearningGroups;
    } catch (error) {
      console.error('Error fetching learning groups:', error);
      throw error;
    }
  },

  searchStudentsInGroup: async (learningGroupId: string, disciplineId: string) => {
    const query = `
    query SearchStudentsNamesInLearningGroup(
        $input: SearchStudentsInLearningGroupInput!, 
        $disciplineId: UUID!, 
        $isWithoutDiscipline: Boolean!, 
        $learningGroupId: UUID!
    ) {
      searchStudentsInLearningGroup(input: $input) {
        items {
          id
          user {
            id
            firstName
            lastName
            middleName
            avatar
            student {
              isDeactivatedOnDiscipline(
                disciplineId: $disciplineId
                learningGroupId: $learningGroupId
              ) @skip(if: $isWithoutDiscipline)
              learningGroups(learningGroupsIds: [$learningGroupId]) {
                learningGroupId
                isActivated
                enrolledAt
                expelledAt
                learningGroup {
                  name
                  type
                  id
                  __typename
                }
                __typename
              }
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
    }
    `;
    
    const variables = {
      input: { filters: { learningGroupId } },
      disciplineId,
      isWithoutDiscipline: false,
      learningGroupId
    };

    try {
      const response = await api.post('', { query, variables });
      return response.data.data.searchStudentsInLearningGroup.items;
    } catch (error) {
      console.error('Error searching students in group:', error);
      throw error;
    }
  },

  getStudentScores: async (disciplineId: string, groupId: string) => {
    const query = `
    query GetDisciplineStudentsByGroupForScoreJournal($input: GetDisciplineScoreJournalInput!, $name: String, $learningGroupId: UUID!, $learningSubgroupId: UUID, $withSearchStudent: Boolean = true) {
      getDisciplineScoreJournal(input: $input) {
        learningGroups {
          averageScore
          discipline {
            id
            name
            __typename
          }
          learningGroupId
          students(name: $name, learningGroupId: $learningSubgroupId) @include(if: $withSearchStudent) {
            studentId
            disciplineId
            student {
              id
              user {
                id
                firstName
                lastName
                middleName
                avatar
                __typename
              }
              learningGroups(learningGroupsIds: [$learningGroupId]) {
                learningGroupId
                expelledAt
                __typename
              }
              __typename
            }
            isDeactivatedDiscipline
            scoreForAnsweredTasks
            scoreForAnsweredRetakeTasks
            retakeScore
            hasRetake
            isRespectfulReasonForRetake
            __typename
          }
          __typename
        }
        __typename
      }
    }
    `;
    
    const variables = {
      withSearchStudent: true,
      input: {
        disciplineId,
        filters: {
          groupId,
          query: "",
          isCurator: false
        }
      },
      name: "",
      learningGroupId: groupId
    };

    try {
      const response = await api.post('', { query, variables });
      return response.data.data.getDisciplineScoreJournal.learningGroups;
    } catch (error) {
      console.error('Error fetching student scores:', error);
      throw error;
    }
  }
};

export const documentGenerationAPI = {
  // PDF generation implementation
  generateGroupCharacteristicsPDF: async (data: any) => {
    console.log('Generating PDF with data:', data);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create proper HTML content for PDF
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Характеристика группы</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #4a5568; text-align: center; }
          .header { text-align: center; margin-bottom: 20px; }
          .section { margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          .student { margin-bottom: 15px; }
          .footer { margin-top: 30px; text-align: center; font-size: 0.8em; color: #718096; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>A-K Project - ХАРАКТЕРИСТИКА ГРУППЫ</h1>
          <p>Группа: ${data.groupName || 'Не указано'}</p>
          <p>Дисциплина: ${data.disciplineName || 'Не указано'}</p>
          <p>Дата: ${data.date || new Date().toLocaleDateString('ru-RU')}</p>
          ${data.averageScore !== undefined ? `<p>Средний балл группы: ${data.averageScore}</p>` : ''}
        </div>
        
        <div class="section">
          <h2>ОБЩАЯ ХАРАКТЕРИСТИКА ГРУППЫ</h2>
          <p>${data.groupComment || 'Не указана'}</p>
        </div>
        
        <div class="section">
          <h2>ХАРАКТЕРИСТИКИ СТУДЕНТОВ</h2>
          ${data.students.map((student: any, index: number) => `
            <div class="student">
              <h3>${index + 1}. ${student.fullName}</h3>
              <p>Баллы: ${student.totalScore} (основные: ${student.mainScore}, пересдача: ${student.retakeScore})</p>
              <p>Характеристики: ${student.keywords.length ? student.keywords.join(', ') : 'не указаны'}</p>
              <p>Индивидуальный комментарий: ${student.comment || 'не указан'}</p>
            </div>
          `).join('')}
        </div>
        
        <div class="footer">
          <p>A-K Project - Документ сгенерирован системой</p>
        </div>
      </body>
      </html>
      `;
      
      // Create a blob with PDF MIME type
      const blob = new Blob([htmlContent], {type: 'application/pdf'});
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `A-K_Project_Характеристика_группы_${data.groupName || 'группа'}_${new Date().toLocaleDateString().replace(/\./g, '-')}.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  },
  
  // Word document generation implementation with proper format
  generateGroupCharacteristicsWord: async (data: any) => {
    console.log('Generating Word document with data:', data);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a proper Word HTML document
      const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Характеристика группы</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>90</w:Zoom>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: 21cm 29.7cm;
            margin: 2cm;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
          }
          h1 { font-size: 16pt; text-align: center; }
          h2 { font-size: 14pt; }
          .header { text-align: center; margin-bottom: 20pt; }
          .section { margin-top: 15pt; }
          .student { margin-bottom: 12pt; }
          .footer { margin-top: 20pt; text-align: center; font-size: 10pt; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>A-K Project - ХАРАКТЕРИСТИКА ГРУППЫ</h1>
          <p>Группа: ${data.groupName || 'Не указано'}</p>
          <p>Дисциплина: ${data.disciplineName || 'Не указано'}</p>
          <p>Дата: ${data.date || new Date().toLocaleDateString('ru-RU')}</p>
          ${data.averageScore !== undefined ? `<p>Средний балл группы: ${data.averageScore}</p>` : ''}
        </div>
        
        <div class="section">
          <h2>ОБЩАЯ ХАРАКТЕРИСТИКА ГРУППЫ</h2>
          <p>${data.groupComment || 'Не указана'}</p>
        </div>
        
        <div class="section">
          <h2>ХАРАКТЕРИСТИКИ СТУДЕНТОВ</h2>
          ${data.students.map((student: any, index: number) => `
            <div class="student">
              <h3>${index + 1}. ${student.fullName}</h3>
              <p>Баллы: ${student.totalScore} (основные: ${student.mainScore}, пересдача: ${student.retakeScore})</p>
              <p>Характеристики: ${student.keywords.length ? student.keywords.join(', ') : 'не указаны'}</p>
              <p>Индивидуальный комментарий: ${student.comment || 'не указан'}</p>
            </div>
          `).join('')}
        </div>
        
        <div class="footer">
          <p>A-K Project - Документ сгенерирован системой (Microsoft Word)</p>
        </div>
      </body>
      </html>
      `;
      
      // Create proper Word document content type
      const blob = new Blob([htmlContent], {
        type: 'application/vnd.ms-word;charset=utf-8'
      });
      
      // Download the file
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `A-K_Project_Характеристика_группы_${data.groupName || 'группа'}_${new Date().toLocaleDateString().replace(/\./g, '-')}.doc`;
      link.click();
      
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error generating Word document:', error);
      throw error;
    }
  },
  
  // Excel spreadsheet generation implementation
  generateGroupCharacteristicsExcel: async (data: any) => {
    console.log('Generating Excel spreadsheet with data:', data);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create HTML that Excel can open
      const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Характеристика группы</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table, td, th {
            border: 1px solid black;
            border-collapse: collapse;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          h1, h2 {
            font-family: Calibri;
          }
        </style>
      </head>
      <body>
        <h1>A-K Project - ХАРАКТЕРИСТИКА ГРУППЫ</h1>
        <p>Группа: ${data.groupName || 'Не указано'}</p>
        <p>Дисциплина: ${data.disciplineName || 'Не указано'}</p>
        <p>Дата: ${data.date || new Date().toLocaleDateString('ru-RU')}</p>
        ${data.averageScore !== undefined ? `<p>Средний балл группы: ${data.averageScore}</p>` : ''}
        
        <h2>ОБЩАЯ ХАРАКТЕРИСТИКА ГРУППЫ</h2>
        <p>${data.groupComment || 'Не указана'}</p>
        
        <h2>ХАРАКТЕРИСТИКИ СТУДЕНТОВ</h2>
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>ФИО студента</th>
              <th>Основной балл</th>
              <th>Балл за пересдачу</th>
              <th>Общий балл</th>
              <th>Характеристики</th>
              <th>Комментарий</th>
            </tr>
          </thead>
          <tbody>
            ${data.students.map((student: any, index: number) => `
              <tr>
                <td>${index + 1}</td>
                <td>${student.fullName}</td>
                <td>${student.mainScore}</td>
                <td>${student.retakeScore}</td>
                <td>${student.totalScore}</td>
                <td>${student.keywords.length ? student.keywords.join(', ') : 'не указаны'}</td>
                <td>${student.comment || 'не указан'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <p>A-K Project - Документ сгенерирован системой (Microsoft Excel)</p>
      </body>
      </html>
      `;
      
      // Create Excel content type
      const blob = new Blob([htmlContent], {
        type: 'application/vnd.ms-excel;charset=utf-8'
      });
      
      // Download the file
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `A-K_Project_Характеристика_группы_${data.groupName || 'группа'}_${new Date().toLocaleDateString().replace(/\./g, '-')}.xls`;
      link.click();
      
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error generating Excel spreadsheet:', error);
      throw error;
    }
  }
};
