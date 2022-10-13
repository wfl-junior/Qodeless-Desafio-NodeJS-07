import { ask } from "./ask";
import { Course } from "./database/entities/Course";
import { Student } from "./database/entities/Student";

export async function askForNewStudent() {
  const newStudentName = await ask("Qual é o nome do(a) aluno(a)? ");
  const studentCourseName = await ask(
    `Qual é o nome do curso do(a) aluno(a) ${newStudentName}? `,
  );

  try {
    const course = await Course.findOrCreate(studentCourseName);

    await Student.create({
      name: newStudentName,
      courseId: course.id,
    });

    console.log(`Aluno(a) ${newStudentName} inserido no banco de dados.`);

    const shouldAskAgain = await ask("Deseja inserir outro aluno? y/n ");

    if (shouldAskAgain.match(/^y$/i)) {
      await askForNewStudent();
    }
  } catch (error: any) {
    if (error.code === "23505") {
      console.log(`Aluno(a) ${newStudentName} já está no banco de dados.`);
      await askForNewStudent();
    } else {
      throw error;
    }
  }
}
