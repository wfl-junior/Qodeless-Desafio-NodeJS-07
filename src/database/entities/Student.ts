import { BaseEntity } from "./BaseEntity";

export class Student extends BaseEntity {
  public static tableName = "students";

  public name: string;
  public courseId: string;
}
