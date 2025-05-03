import axios from 'axios';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
  
  // Updated PDF generation implementation with jsPDF
  generateGroupCharacteristicsPDF: async (data: any) => {
    console.log('Generating PDF with jsPDF:', data);
    
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Set up fonts
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text('A-K Project - ХАРАКТЕРИСТИКА ГРУППЫ', 20, 20);
      
      // Basic info
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Группа: ${data.groupName || 'Не указано'}`, 20, 30);
      doc.text(`Дисциплина: ${data.disciplineName || 'Не указано'}`, 20, 40);
      doc.text(`Дата: ${data.date || new Date().toLocaleDateString('ru-RU')}`, 20, 50);
      
      if (data.averageScore !== undefined) {
        doc.text(`Средний балл группы: ${data.averageScore}`, 20, 60);
      }
      
      // Group comment section
      doc.setFont("helvetica", "bold");
      doc.text('ОБЩАЯ ХАРАКТЕРИСТИКА ГРУППЫ', 20, 75);
      doc.setFont("helvetica", "normal");
      
      // Handle multiline comments with word wrapping
      const groupCommentLines = doc.splitTextToSize(data.groupComment || 'Не указана', 170);
      doc.text(groupCommentLines, 20, 85);
      
      // Students section
      let yPosition = 85 + (groupCommentLines.length * 7);
      doc.setFont("helvetica", "bold");
      doc.text('ХАРАКТЕРИСТИКИ СТУДЕНТОВ', 20, yPosition);
      doc.setFont("helvetica", "normal");
      
      yPosition += 10;
      
      // Add students details
      if (data.students && data.students.length > 0) {
        data.students.forEach((student: any, index: number) => {
          // Student name and scores
          doc.setFont("helvetica", "bold");
          doc.text(`${index + 1}. ${student.fullName}`, 20, yPosition);
          yPosition += 7;
          doc.setFont("helvetica", "normal");
          
          doc.text(`Баллы: ${student.totalScore} (основные: ${student.mainScore}, пересдача: ${student.retakeScore})`, 25, yPosition);
          yPosition += 7;
          
          const keywordsText = `Характеристики: ${student.keywords.length ? student.keywords.join(', ') : 'не указаны'}`;
          const keywordLines = doc.splitTextToSize(keywordsText, 165);
          doc.text(keywordLines, 25, yPosition);
          yPosition += keywordLines.length * 7;
          
          const commentText = `Индивидуальный комментарий: ${student.comment || 'не указан'}`;
          const commentLines = doc.splitTextToSize(commentText, 165);
          doc.text(commentLines, 25, yPosition);
          yPosition += commentLines.length * 7 + 5;
          
          // Add a new page if needed
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
        });
      } else {
        doc.text('Информация о студентах отсутствует', 20, yPosition);
        yPosition += 10;
      }
      
      // Footer
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(10);
      doc.text('A-K Project - Документ сгенерирован системой', 20, 280);
      
      // Save the PDF
      doc.save(`A-K_Project_Характеристика_группы_${data.groupName || 'группа'}_${new Date().toLocaleDateString().replace(/\./g, '-')}.pdf`);
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  },
  
  // Updated Word document generation implementation with docx library
  generateGroupCharacteristicsWord: async (data: any) => {
    console.log('Generating Word document with docx library:', data);
    
    try {
      // Create document sections
      const children = [
        new Paragraph({
          children: [
            new TextRun({
              text: 'A-K Project - ХАРАКТЕРИСТИКА ГРУППЫ',
              bold: true,
              size: 32,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 }
        }),
        
        new Paragraph({
          children: [new TextRun({ text: `Группа: ${data.groupName || 'Не указано'}` })],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [new TextRun({ text: `Дисциплина: ${data.disciplineName || 'Не указано'}` })],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [new TextRun({ text: `Дата: ${data.date || new Date().toLocaleDateString('ru-RU')}` })],
          spacing: { after: 100 }
        }),
      ];
      
      // Add average score if available
      if (data.averageScore !== undefined) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `Средний балл группы: ${data.averageScore}` })],
            spacing: { after: 200 }
          })
        );
      }
      
      // Group comment section
      children.push(
        new Paragraph({
          children: [new TextRun({ text: 'ОБЩАЯ ХАРАКТЕРИСТИКА ГРУППЫ', bold: true })],
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [new TextRun({ text: data.groupComment || 'Не указана' })],
          spacing: { after: 400 }
        })
      );
      
      // Students section
      children.push(
        new Paragraph({
          children: [new TextRun({ text: 'ХАРАКТЕРИСТИКИ СТУДЕНТОВ', bold: true })],
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 }
        })
      );
      
      // Add students details
      if (data.students && data.students.length > 0) {
        data.students.forEach((student: any, index: number) => {
          children.push(
            new Paragraph({
              children: [new TextRun({ 
                text: `${index + 1}. ${student.fullName}`, 
                bold: true,
                size: 24
              })],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ 
                text: `Баллы: ${student.totalScore} (основные: ${student.mainScore}, пересдача: ${student.retakeScore})` 
              })],
              indent: { left: 500 },
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ 
                text: `Характеристики: ${student.keywords.length ? student.keywords.join(', ') : 'не указаны'}` 
              })],
              indent: { left: 500 },
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ 
                text: `Индивидуальный комментарий: ${student.comment || 'не указан'}` 
              })],
              indent: { left: 500 },
              spacing: { after: 300 }
            })
          );
        });
      } else {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: 'Информация о студентах отсутствует' })],
            spacing: { after: 200 }
          })
        );
      }
      
      // Footer
      children.push(
        new Paragraph({
          children: [new TextRun({ 
            text: 'A-K Project - Документ сгенерирован системой',
            size: 18
          })],
          spacing: { after: 100 }
        })
      );
      
      // Create the document with all sections
      const doc = new Document({
        sections: [{
          properties: {},
          children: children
        }]
      });
      
      // Generate and save the document
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `A-K_Project_Характеристика_группы_${data.groupName || 'группа'}_${new Date().toLocaleDateString().replace(/\./g, '-')}.docx`);
      return true;
    } catch (error) {
      console.error('Error generating Word document:', error);
      throw error;
    }
  },
  
  // Updated Excel spreadsheet generation implementation with xlsx library
  generateGroupCharacteristicsExcel: async (data: any) => {
    console.log('Generating Excel spreadsheet with xlsx library:', data);
    
    try {
      // Create workbook
      const workbook = XLSX.utils.book_new();
      
      // Create main info worksheet
      const infoData = [
        ['A-K Project - ХАРАКТЕРИСТИКА ГРУППЫ'],
        [],
        ['Группа:', data.groupName || 'Не указано'],
        ['Дисциплина:', data.disciplineName || 'Не указано'],
        ['Дата:', data.date || new Date().toLocaleDateString('ru-RU')]
      ];
      
      // Add average score if available
      if (data.averageScore !== undefined) {
        infoData.push(['Средний балл группы:', data.averageScore]);
      }
      
      infoData.push(
        [],
        ['ОБЩАЯ ХАРАКТЕРИСТИКА ГРУППЫ'],
        [data.groupComment || 'Не указана'],
        []
      );
      
      const infoWorksheet = XLSX.utils.aoa_to_sheet(infoData);
      XLSX.utils.book_append_sheet(workbook, infoWorksheet, 'Информация');
      
      // Create students worksheet with proper formatting
      const studentsHeaders = ['№', 'ФИО', 'Основные баллы', 'Баллы за пересдачу', 'Общий балл', 'Характеристики', 'Комментарий'];
      
      const studentsData = data.students.map((student: any, index: number) => [
        index + 1,
        student.fullName,
        student.mainScore,
        student.retakeScore,
        student.totalScore,
        student.keywords.length ? student.keywords.join(', ') : 'не указаны',
        student.comment || 'не указан'
      ]);
      
      // Add headers to the beginning of the data array
      studentsData.unshift(studentsHeaders);
      
      const studentsWorksheet = XLSX.utils.aoa_to_sheet(studentsData);
      XLSX.utils.book_append_sheet(workbook, studentsWorksheet, 'Студенты');
      
      // Generate and save the Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, `A-K_Project_Характеристика_группы_${data.groupName || 'группа'}_${new Date().toLocaleDateString().replace(/\./g, '-')}.xlsx`);
      
      return true;
    } catch (error) {
      console.error('Error generating Excel spreadsheet:', error);
      throw error;
    }
  }
};

export default api;
