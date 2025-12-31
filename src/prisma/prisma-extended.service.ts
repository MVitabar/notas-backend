import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

type QueryResult<T> = T & {
  [key: string]: any;
};

@Injectable()
export class PrismaExtendedService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Custom method to execute raw SQL queries
  async executeRawQuery<T = any>(query: string, values: any[] = []): Promise<T> {
    if (values.length > 0) {
      return this.$executeRawUnsafe(query, ...values) as Promise<T>;
    }
    return this.$executeRawUnsafe(query) as Promise<T>;
  }

  // Method to safely execute SELECT queries with proper typing
  async queryRaw<T = any>(query: string, values: any[] = []): Promise<T[]> {
    const result = await this.$queryRawUnsafe<QueryResult<T>[]>(query, ...values);
    return result as T[];
  }
}
