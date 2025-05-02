
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
  
  // PDF generation implementation
  generateGroupCharacteristicsPDF: async (data: any) => {
    console.log('Generating PDF with full data:', data);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a PDF document (in a real implementation, this would be server-side)
      const pdfContent = generateMockDocumentContent(data, 'pdf');
      
      // Convert to blob and trigger download
      const mockPdfBlob = new Blob([pdfContent], {type: 'application/pdf'});
      
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
  
  // New Word document generation implementation
  generateGroupCharacteristicsWord: async (data: any) => {
    console.log('Generating Word document with full data:', data);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a Word document content (in a real implementation, this would be server-side)
      const wordContent = generateMockDocumentContent(data, 'word');
      
      // Convert to blob and trigger download
      const mockWordBlob = new Blob([wordContent], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
      
      // Create download link
      const url = URL.createObjectURL(mockWordBlob);
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
  
  // New Excel document generation implementation
  generateGroupCharacteristicsExcel: async (data: any) => {
    console.log('Generating Excel spreadsheet with full data:', data);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create Excel content (in a real implementation, this would be server-side)
      const excelContent = generateMockDocumentContent(data, 'excel');
      
      // Convert to blob and trigger download
      const mockExcelBlob = new Blob([excelContent], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      
      // Create download link
      const url = URL.createObjectURL(mockExcelBlob);
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

// Mock function to generate document content (in real implementation this would be server-side)
function generateMockDocumentContent(data: any, format: 'pdf' | 'word' | 'excel') {
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
