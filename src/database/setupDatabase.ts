import { client } from ".";
import { Course } from "./entities/Course";
import { Student } from "./entities/Student";

export async function setupDatabase() {
  await client.connect();

  await client.query(`DROP TABLE IF EXISTS ${Student.tableName}`);
  await client.query(`DROP TABLE IF EXISTS ${Course.tableName}`);

  await client.query(`CREATE TABLE IF NOT EXISTS ${Course.tableName} (
    id varchar(36) PRIMARY KEY,
    name varchar(255) UNIQUE NOT NULL
  );`);

  await client.query(`CREATE TABLE IF NOT EXISTS ${Student.tableName} (
    id varchar(36) PRIMARY KEY,
    "courseId" varchar(36) NOT NULL,
    name varchar(255) UNIQUE NOT NULL,
    CONSTRAINT fk_student_course FOREIGN KEY("courseId") REFERENCES courses(id) ON DELETE CASCADE
  );`);
}
