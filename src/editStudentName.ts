import { ask } from "./ask";
import { Student } from "./database/entities/Student";

export async function editStudentName() {
  const studentToEdit = await ask("Qual é o nome do(a) aluno(a)? ");
  const newStudentName = await ask(
    `Qual é o novo nome para o (a) aluno(a) ${studentToEdit}? `,
  );

  try {
    const student = await Student.findOne(studentToEdit);

    if (student) {
      await student.update({
        name: newStudentName,
      });

      console.log(
        `Aluno(a) ${studentToEdit} atualizado para ${newStudentName}.`,
      );
    } else {
      console.log(`Aluno(a) ${studentToEdit} não encontrado.`);
    }

    const shouldAskAgain = await ask("Deseja editar outro aluno? y/n ");

    if (shouldAskAgain.match(/^y$/i)) {
      await editStudentName();
    }
  } catch (error: any) {
    if (error.code === "23505") {
      console.log(`Aluno(a) ${newStudentName} já está no banco de dados.`);
      await editStudentName();
    } else {
      throw error;
    }
  }
}
