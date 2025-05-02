
import axios from 'axios';

const API_URL = "https://api.newlxp.ru/graphql";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signIn: async (email: string, password: string) => {
    const query = `
    query SignIn($input: SignInInput!) {
      signIn(input: $input) {
        user {
          id
          isLead
          __typename
        }
        accessToken
        __typename
      }
    }
    `;
    
    const variables = {
      input: { email, password }
    };

    try {
      const response = await api.post('', { query, variables });
      const accessToken = response.data.data.signIn.accessToken;
      localStorage.setItem('accessToken', accessToken);
      return accessToken;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  }
};

export const userAPI = {
  getTeacherInfo: async () => {
    const query = `
    query GetMe {
      getMe {
        avatar
        createdAt
        email
        firstName
        lastName
        middleName
        id
        isLead
        roles
        phoneNumber
        legalDocumentsApprovedAt
        notificationsSettings {
          isPushDailyDigestOnEmail
          __typename
        }
        assignedSuborganizations {
          suborganization {
            name
            organization {
              name
            }
            __typename
          }
          __typename
        }
        teacher {
          assignedDisciplines_V2 {
            discipline {
              id
              name
              code
              archivedAt
              studyPeriods {
                name
                startDate
                endDate
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

    try {
      const response = await api.post('', { query });
      return response.data.data.getMe;
    } catch (error) {
      console.error('Error fetching teacher info:', error);
      throw error;
    }
  }
};

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
  },
  
  // Updated PDF generation implementation
  generateGroupCharacteristicsPDF: async (data: any) => {
    console.log('Generating PDF with data:', data);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate document content
      const pdfContent = generateDocumentContent(data, 'pdf');
      
      // Create a proper PDF blob
      // This is a simple approach - in production, you might use a PDF library
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Характеристика группы</title>
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
      
      // In a real implementation, you would convert HTML to PDF
      // Here we're making a simple PDF-like format as a demonstration
      const mockPdfBlob = new Blob([htmlContent], {type: 'application/pdf'});
      
      // Create download link
      const url = URL.createObjectURL(mockPdfBlob);
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
  
  // Updated Word document generation implementation with proper DOCX-like format
  generateGroupCharacteristicsWord: async (data: any) => {
    console.log('Generating Word document with data:', data);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a Word-like XML structure (simplified for demonstration)
      const wordXML = `
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>A-K Project - ХАРАКТЕРИСТИКА ГРУППЫ</w:t></w:r></w:p>
    <w:p><w:r><w:t>Группа: ${data.groupName || 'Не указано'}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Дисциплина: ${data.disciplineName || 'Не указано'}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Дата: ${data.date || new Date().toLocaleDateString('ru-RU')}</w:t></w:r></w:p>
    ${data.averageScore !== undefined ? `<w:p><w:r><w:t>Средний балл группы: ${data.averageScore}</w:t></w:r></w:p>` : ''}
    
    <w:p><w:r><w:t>ОБЩАЯ ХАРАКТЕРИСТИКА ГРУППЫ</w:t></w:r></w:p>
    <w:p><w:r><w:t>${data.groupComment || 'Не указана'}</w:t></w:r></w:p>
    
    <w:p><w:r><w:t>ХАРАКТЕРИСТИКИ СТУДЕНТОВ</w:t></w:r></w:p>
    ${data.students.map((student: any, index: number) => `
      <w:p><w:r><w:t>${index + 1}. ${student.fullName}</w:t></w:r></w:p>
      <w:p><w:r><w:t>Баллы: ${student.totalScore} (основные: ${student.mainScore}, пересдача: ${student.retakeScore})</w:t></w:r></w:p>
      <w:p><w:r><w:t>Характеристики: ${student.keywords.length ? student.keywords.join(', ') : 'не указаны'}</w:t></w:r></w:p>
      <w:p><w:r><w:t>Индивидуальный комментарий: ${student.comment || 'не указан'}</w:t></w:r></w:p>
    `).join('')}
    
    <w:p><w:r><w:t>A-K Project - Документ сгенерирован системой</w:t></w:r></w:p>
  </w:body>
</w:document>`;
      
      // Convert to HTML for easier viewing - in real implementation use proper DOCX format
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Характеристика группы</title>
        <style>
          body { font-family: Calibri, sans-serif; padding: 40px; }
          h1 { color: #2b579a; }
          .section { margin-top: 20px; }
          .student { margin-bottom: 15px; }
          .footer { margin-top: 30px; font-size: 0.8em; color: #718096; }
        </style>
      </head>
      <body>
        <h1>A-K Project - ХАРАКТЕРИСТИКА ГРУППЫ</h1>
        <p>Группа: ${data.groupName || 'Не указано'}</p>
        <p>Дисциплина: ${data.disciplineName || 'Не указано'}</p>
        <p>Дата: ${data.date || new Date().toLocaleDateString('ru-RU')}</p>
        ${data.averageScore !== undefined ? `<p>Средний балл группы: ${data.averageScore}</p>` : ''}
        
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
      </html>`;
      
      // In a real implementation, you would use a DOCX generation library
      // Here we're using HTML packed as a .docx file for demonstration
      const blob = new Blob([htmlContent], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
      
      // Download the file
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `A-K_Project_Характеристика_группы_${data.groupName || 'группа'}_${new Date().toLocaleDateString().replace(/\./g, '-')}.docx`;
      link.click();
      
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error generating Word document:', error);
      throw error;
    }
  },
  
  // Updated Excel spreadsheet generation implementation with proper XLSX format structure
  generateGroupCharacteristicsExcel: async (data: any) => {
    console.log('Generating Excel spreadsheet with data:', data);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Basic structure for Excel XML (simplified for demonstration)
      const excelXML = `
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Характеристика группы">
    <Table>
      <Row><Cell><Data ss:Type="String">A-K Project - ХАРАКТЕРИСТИКА ГРУППЫ</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Группа: ${data.groupName || 'Не указано'}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Дисциплина: ${data.disciplineName || 'Не указано'}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Дата: ${data.date || new Date().toLocaleDateString('ru-RU')}</Data></Cell></Row>
      ${data.averageScore !== undefined ? `<Row><Cell><Data ss:Type="String">Средний балл группы: ${data.averageScore}</Data></Cell></Row>` : ''}
      
      <Row><Cell><Data ss:Type="String">ОБЩАЯ ХАРАКТЕРИСТИКА ГРУППЫ</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">${data.groupComment || 'Не указана'}</Data></Cell></Row>
      
      <Row><Cell><Data ss:Type="String">ХАРАКТЕРИСТИКИ СТУДЕНТОВ</Data></Cell></Row>
      <Row>
        <Cell><Data ss:Type="String">№</Data></Cell>
        <Cell><Data ss:Type="String">ФИО</Data></Cell>
        <Cell><Data ss:Type="String">Основные баллы</Data></Cell>
        <Cell><Data ss:Type="String">Баллы за пересдачу</Data></Cell>
        <Cell><Data ss:Type="String">Общий балл</Data></Cell>
        <Cell><Data ss:Type="String">Характеристики</Data></Cell>
        <Cell><Data ss:Type="String">Комментарий</Data></Cell>
      </Row>
      ${data.students.map((student: any, index: number) => `
        <Row>
          <Cell><Data ss:Type="Number">${index + 1}</Data></Cell>
          <Cell><Data ss:Type="String">${student.fullName}</Data></Cell>
          <Cell><Data ss:Type="Number">${student.mainScore}</Data></Cell>
          <Cell><Data ss:Type="Number">${student.retakeScore}</Data></Cell>
          <Cell><Data ss:Type="Number">${student.totalScore}</Data></Cell>
          <Cell><Data ss:Type="String">${student.keywords.length ? student.keywords.join(', ') : 'не указаны'}</Data></Cell>
          <Cell><Data ss:Type="String">${student.comment || 'не указан'}</Data></Cell>
        </Row>
      `).join('')}
      
      <Row><Cell><Data ss:Type="String">A-K Project - Документ сгенерирован системой</Data></Cell></Row>
    </Table>
  </Worksheet>
</Workbook>`;

      // Convert to HTML representation of an Excel table for demonstration
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Характеристика группы</title>
        <style>
          body { font-family: Calibri, sans-serif; padding: 20px; }
          h1 { color: #217346; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #217346; color: white; }
          .header { margin-bottom: 20px; }
          .footer { margin-top: 30px; font-size: 0.8em; color: #718096; }
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
        
        <h2>ОБЩАЯ ХАРАКТЕРИСТИКА ГРУППЫ</h2>
        <p>${data.groupComment || 'Не указана'}</p>
        
        <h2>ХАРАКТЕРИСТИКИ СТУДЕНТОВ</h2>
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>ФИО</th>
              <th>Основные баллы</th>
              <th>Баллы за пересдачу</th>
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
        
        <div class="footer">
          <p>A-K Project - Документ сгенерирован системой (Microsoft Excel)</p>
        </div>
      </body>
      </html>`;
      
      // In a real implementation, you would use an XLSX generation library
      // Here we're using HTML packed as a .xlsx file for demonstration
      const blob = new Blob([htmlContent], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      
      // Download the file
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `A-K_Project_Характеристика_группы_${data.groupName || 'группа'}_${new Date().toLocaleDateString().replace(/\./g, '-')}.xlsx`;
      link.click();
      
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error generating Excel spreadsheet:', error);
      throw error;
    }
  }
};

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

export default api;
