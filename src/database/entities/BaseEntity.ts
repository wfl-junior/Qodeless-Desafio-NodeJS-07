import crypto from "node:crypto";
import { client } from "..";

type OverriddenThis<T extends BaseEntity> = { new (): T } & typeof BaseEntity;

export class BaseEntity {
  public static tableName: string;

  public id: string;

  /**
   * Updates with param data and returns current entity
   */
  async update<T extends BaseEntity>(this: T, data: Partial<T>): Promise<T> {
    Object.assign(this, data);

    const { sql, params } = Object.entries(data).reduce<{
      sql: string;
      params: any[];
    }>(
      (acc, [key, value], index) => {
        if (index > 0) {
          acc.sql += ", ";
        }

        acc.sql += ` "${key}" = $${index + 2}`;
        acc.params.push(value);

        return acc;
      },
      {
        sql: `UPDATE ${(this.constructor as OverriddenThis<T>).tableName} SET`,
        params: [],
      },
    );

    const queryString = `${sql} WHERE id = $1;`;
    await client.query(queryString, [this.id, ...params]);

    return this;
  }

  /**
   * Creates and returns new entity with param newEntityData
   */
  static async create<T extends BaseEntity>(
    this: OverriddenThis<T>,
    newEntityData: Partial<T>,
  ): Promise<T> {
    const newEntity = new this();
    newEntityData.id = crypto.randomUUID();

    Object.assign(newEntity, newEntityData);

    const keys = Object.keys(newEntityData);
    const values = Object.values(newEntityData);

    const queryString = `INSERT INTO ${this.tableName} (${keys
      .map(key => `"${key}"`)
      .join(", ")}) VALUES (${values
      .map((_, index) => `$${index + 1}`)
      .join(", ")});`;

    await client.query(queryString, values);

    return newEntity;
  }

  /**
   * Returns entity with param where param if found or null
   */
  static async findOne<T extends BaseEntity>(
    this: OverriddenThis<T>,
    where: Partial<T>,
  ): Promise<T | null> {
    const { sql, params } = Object.entries(where).reduce<{
      sql: string;
      params: any[];
    }>(
      (acc, [key, value], index) => {
        if (index > 0) {
          acc.sql += " AND ";
        }

        acc.sql += ` "${key}" = $${index + 1}`;
        acc.params.push(value);

        return acc;
      },
      {
        sql: `SELECT * FROM ${this.tableName} WHERE`,
        params: [],
      },
    );

    const queryString = `${sql} LIMIT 1;`;

    const {
      rows: [existingEntity],
    } = await client.query(queryString, params);

    if (!existingEntity) {
      return null;
    }

    const entity = new this();
    Object.assign(entity, existingEntity);
    return entity;
  }

  /**
   * Returns entity with param where if found or creates a new one with param newEntityData and returns it
   */
  static async findOneOrCreate<T extends BaseEntity>(
    this: OverriddenThis<T>,
    where: Partial<T>,
    newEntityData: Partial<T>,
  ): Promise<T> {
    const entity = await this.findOne(where);

    if (!entity) {
      return this.create(newEntityData);
    }

    return entity;
  }

  /**
   * Get all entities
   */
  static async find<T extends BaseEntity>(
    this: OverriddenThis<T>,
  ): Promise<T[]> {
    const { rows } = await client.query(`SELECT * from ${this.tableName};`);

    return rows.map(row => {
      const entity = new this();
      Object.assign(entity, row);
      return entity;
    });
  }
}
