import crypto from "node:crypto";
import { client } from "..";

export class Student {
  public static tableName = "students";

  public id!: string;
  public name!: string;
  public courseId!: string;

  async update(
    data: Partial<Pick<Student, "name" | "courseId">>,
  ): Promise<Student> {
    Object.assign(this, data);

    await client.query(
      `
        UPDATE ${Student.tableName}
        SET "courseId" = $2, name = $3
        WHERE id = $1;
      `,
      [this.id, this.courseId, this.name],
    );

    return this;
  }

  static async create(
    student: Pick<Student, "name" | "courseId">,
  ): Promise<Student> {
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

  static async findOne(name: Student["name"]): Promise<Student | null> {
    const {
      rows: [existingStudent],
    } = await client.query(
      `SELECT * from ${Student.tableName} where name = $1 LIMIT 1`,
      [name],
    );

    if (existingStudent) {
      const student = new Student();
      Object.assign(student, existingStudent);
      return student;
    }

    return null;
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
