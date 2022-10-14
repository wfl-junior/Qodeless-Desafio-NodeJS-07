import { BaseEntity } from "./BaseEntity";

export class Course extends BaseEntity {
  public static tableName = "courses";

  public name: string;
}
