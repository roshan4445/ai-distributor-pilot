import { createClient } from "@supabase/supabase-js";
import { db, ensureDb } from "../lib/db";

const supabaseUrl = 
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) || 
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL) || 
  "https://jminggcexzicnakvsdlx.supabase.co";

const supabaseKey = 
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_KEY) || 
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_KEY) || 
  "sb_publishable_fRXfL-RO43PkxsuLF_vrLA_VEezLIta";

const realSupabase = createClient(supabaseUrl, supabaseKey);

class MockSupabaseQueryBuilder {
  private table: string;
  private filters: { type: string; col: string; val: any }[] = [];
  private updateData: any = null;
  private insertData: any = null;
  private isDelete = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns = "*", options?: any) {
    return this;
  }

  insert(data: any) {
    this.insertData = data;
    return this;
  }

  upsert(data: any) {
    this.insertData = data;
    return this;
  }

  update(data: any) {
    this.updateData = data;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  eq(col: string, val: any) {
    this.filters.push({ type: "eq", col, val });
    return this;
  }

  lt(col: string, val: any) {
    this.filters.push({ type: "lt", col, val });
    return this;
  }

  async maybeSingle() {
    const res = await this.execute();
    return { data: res.data && res.data.length > 0 ? res.data[0] : null, error: res.error };
  }

  async single() {
    const res = await this.execute();
    return { data: res.data && res.data.length > 0 ? res.data[0] : null, error: res.error };
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  async execute() {
    await ensureDb();
    try {
      if (this.insertData) {
        const rows = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
        for (const row of rows) {
          const keys = Object.keys(row);
          const vals = keys.map(k => {
            const v = row[k];
            if (typeof v === "object" && v !== null) {
              return JSON.stringify(v);
            }
            return v;
          });
          const place = keys.map(() => "?").join(", ");
          await db.execute({
            sql: `INSERT OR REPLACE INTO ${this.table} (${keys.join(", ")}) VALUES (${place})`,
            args: vals
          });
        }
        return { data: this.insertData, count: rows.length, error: null };
      }

      if (this.updateData) {
        const setKeys = Object.keys(this.updateData);
        const setVals = setKeys.map(k => {
          const v = this.updateData[k];
          if (typeof v === "object" && v !== null) {
            return JSON.stringify(v);
          }
          return v;
        });

        let sql = `UPDATE ${this.table} SET ${setKeys.map(k => `${k} = ?`).join(", ")}`;
        const args = [...setVals];

        if (this.filters.length > 0) {
          sql += " WHERE " + this.filters.map(f => {
            args.push(f.val);
            return `${f.col} ${f.type === "eq" ? "=" : "<"} ?`;
          }).join(" AND ");
        }

        await db.execute({ sql, args });
        return { data: this.updateData, count: 1, error: null };
      }

      if (this.isDelete) {
        let sql = `DELETE FROM ${this.table}`;
        const args: any[] = [];
        if (this.filters.length > 0) {
          sql += " WHERE " + this.filters.map(f => {
            args.push(f.val);
            return `${f.col} ${f.type === "eq" ? "=" : "<"} ?`;
          }).join(" AND ");
        }
        await db.execute({ sql, args });
        return { data: null, count: 0, error: null };
      }

      // SELECT
      let sql = `SELECT * FROM ${this.table}`;
      const args: any[] = [];
      if (this.filters.length > 0) {
        sql += " WHERE " + this.filters.map(f => {
          args.push(f.val);
          return `${f.col} ${f.type === "eq" ? "=" : "<"} ?`;
        }).join(" AND ");
      }

      const queryRes = await db.execute({ sql, args });
      const data = queryRes.rows.map((row: any) => {
        const obj: any = {};
        for (const col of queryRes.columns) {
          let val = row[col];
          if (typeof val === "string") {
            if ((val.startsWith("{") && val.endsWith("}")) || (val.startsWith("[") && val.endsWith("]"))) {
              try {
                val = JSON.parse(val);
              } catch (e) {}
            }
          }
          obj[col] = val;
        }
        return obj;
      });
      return { data, count: data.length, error: null };
    } catch (err: any) {
      console.error(`MockSupabase query error on table ${this.table}:`, err);
      return { data: null, count: 0, error: err.message || String(err) };
    }
  }
}

export const supabase = (typeof process !== "undefined" && (process.env?.USE_SQLITE === "true" || process.env?.VITE_USE_SQLITE === "true"))
  ? {
      from(table: string) {
        return new MockSupabaseQueryBuilder(table);
      }
    } as any
  : realSupabase;
