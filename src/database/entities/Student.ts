import crypto from "node:crypto";
import { client } from "..";

export class Student {
  public static tableName = "students";

  public id!: string;
  public name!: string;
  public courseId!: string;

  static async create(student: Omit<Student, "id">): Promise<Student> {
    const newStudent = new Student();
    Object.assign(newStudent, {
      ...student,
      id: crypto.randomUUID(),
    });

    await client.query(
      `INSERT INTO ${Student.tableName} ("id", "courseId", "name") VALUES ($1, $2, $3);`,
      [newStudent.id, newStudent.courseId, newStudent.name],
    );

    return newStudent;
  }

  static async find(): Promise<Student[]> {
    const { rows } = await client.query(`SELECT * from ${Student.tableName};`);

    return rows.map(row => {
      const student = new Student();
      Object.assign(student, row);
      return student;
    });
  }
}
