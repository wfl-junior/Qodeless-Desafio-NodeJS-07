/**
 * Required External Modules
 */

import cors from "cors";
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { ask } from "./ask";
import { askForNewStudent } from "./askForNewStudent";
import { Course } from "./database/entities/Course";
import { Student } from "./database/entities/Student";
import { setupDatabase } from "./database/setupDatabase";
import { editStudentName } from "./editStudentName";

/**
 * App Variables
 */

if (!process.env.PORT) {
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();

/**
 *  App Configuration
 */

app.use(helmet());
app.use(cors());
app.use(express.json());

/**
 * Server Activation
 */

app.listen(PORT, async () => {
  console.log(`Listening on port ${PORT}`);

  // CÓDIGO PARA ATENDER OS REQUERIMENTOS
  // R01, R02, R03, R04, R05

  try {
    await setupDatabase();
    await askForNewStudent();

    const [courses, students] = await Promise.all([
      Course.find(),
      Student.find(),
    ]);

    const coursesMap = courses.reduce<Record<Course["id"], Course>>(
      (map, course) => {
        map[course.id] = course;
        return map;
      },
      {},
    );

    const studentsWithCourse = students.map(student => {
      return {
        ...student,
        course: coursesMap[student.courseId],
      };
    });

    // Listar Tudo o que foi salvo

    studentsWithCourse.forEach(student => {
      console.log(
        `Aluno(a) ${student.name} matriculado(a) no curso ${student.course.name}`,
      );
    });

    // Editar o nome de um aluno que já foi salvo no banco de dados

    const shouldEditStudentName = await ask(
      "Deseja editar algum(a) aluno(a)? y/n ",
    );

    if (shouldEditStudentName.match(/^y$/i)) {
      await editStudentName();
    }
  } catch (error) {
    console.log("Houston, we have a problem: ", error);
  }
});
