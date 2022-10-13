import crypto from "node:crypto";
import { client } from "..";

export class Course {
  public static tableName = "courses";

  public id!: string;
  public name!: string;

  static async create(course: Omit<Course, "id">): Promise<Course> {
    const newCourse = new Course();
    Object.assign(newCourse, {
      ...course,
      id: crypto.randomUUID(),
    });

    await client.query(
      `INSERT INTO ${Course.tableName} (id, name) VALUES ($1, $2);`,
      [newCourse.id, newCourse.name],
    );

    return newCourse;
  }

  static async findOne(name: Course["name"]): Promise<Course | null> {
    const {
      rows: [existingCourse],
    } = await client.query(
      `SELECT * from ${Course.tableName} where name = $1 LIMIT 1`,
      [name],
    );

    if (existingCourse) {
      const course = new Course();
      Object.assign(course, existingCourse);
      return course;
    }

    return null;
  }

  static async findOrCreate(name: Course["name"]): Promise<Course> {
    const course = await Course.findOne(name);

    if (!course) {
      return Course.create({ name });
    }

    return course;
  }

  static async find(): Promise<Course[]> {
    const { rows } = await client.query(`SELECT * from ${Course.tableName};`);

    return rows.map(row => {
      const course = new Course();
      Object.assign(course, row);
      return course;
    });
  }
}
