import type { SQLiteDatabase } from 'expo-sqlite';
import { runMigrations } from './run-migrations';
import { Migration } from './types';

function makeDb(userVersion: number, calls: string[]) {
  return {
    getFirstAsync: jest.fn().mockResolvedValue({ user_version: userVersion }),
    execAsync: jest.fn((source: string) => {
      calls.push(source);
      return Promise.resolve();
    }),
  } as unknown as SQLiteDatabase;
}

function makeMigration(name: string, calls: string[], shouldThrow = false): Migration {
  return {
    up: jest.fn(() => {
      calls.push(`up:${name}`);
      if (shouldThrow) return Promise.reject(new Error(`${name} failed`));
      return Promise.resolve();
    }),
  };
}

describe('runMigrations', () => {
  it('applies all migrations in order from a fresh (version 0) database, bumping the version after each one', async () => {
    const calls: string[] = [];
    const db = makeDb(0, calls);
    const migrations = [makeMigration('one', calls), makeMigration('two', calls)];

    await runMigrations(db, migrations);

    expect(migrations[0].up).toHaveBeenCalledWith(db);
    expect(migrations[1].up).toHaveBeenCalledWith(db);
    expect(calls).toEqual([
      'BEGIN TRANSACTION',
      'up:one',
      'PRAGMA user_version = 1',
      'COMMIT',
      'BEGIN TRANSACTION',
      'up:two',
      'PRAGMA user_version = 2',
      'COMMIT',
    ]);
  });

  it('only runs migrations above the database current version', async () => {
    const calls: string[] = [];
    const db = makeDb(1, calls);
    const migrations = [makeMigration('one', calls), makeMigration('two', calls)];

    await runMigrations(db, migrations);

    expect(migrations[0].up).not.toHaveBeenCalled();
    expect(migrations[1].up).toHaveBeenCalledWith(db);
  });

  it('does nothing when the database is already at the latest version', async () => {
    const calls: string[] = [];
    const db = makeDb(2, calls);
    const migrations = [makeMigration('one', calls), makeMigration('two', calls)];

    await runMigrations(db, migrations);

    expect(migrations[0].up).not.toHaveBeenCalled();
    expect(migrations[1].up).not.toHaveBeenCalled();
    expect(calls).toEqual([]);
  });

  it('treats a null PRAGMA user_version result as version 0', async () => {
    const calls: string[] = [];
    const db = {
      getFirstAsync: jest.fn().mockResolvedValue(null),
      execAsync: jest.fn((source: string) => {
        calls.push(source);
        return Promise.resolve();
      }),
    } as unknown as SQLiteDatabase;
    const migrations = [makeMigration('one', calls)];

    await runMigrations(db, migrations);

    expect(migrations[0].up).toHaveBeenCalledWith(db);
  });

  it('rolls back and stops the run when a migration throws, without corrupting already-applied migrations', async () => {
    const calls: string[] = [];
    const db = makeDb(0, calls);
    const migrations = [
      makeMigration('one', calls),
      makeMigration('two', calls, true),
      makeMigration('three', calls),
    ];

    await expect(runMigrations(db, migrations)).rejects.toThrow('two failed');

    expect(migrations[0].up).toHaveBeenCalled();
    expect(migrations[1].up).toHaveBeenCalled();
    expect(migrations[2].up).not.toHaveBeenCalled();
    expect(calls).toEqual([
      'BEGIN TRANSACTION',
      'up:one',
      'PRAGMA user_version = 1',
      'COMMIT',
      'BEGIN TRANSACTION',
      'up:two',
      'ROLLBACK',
    ]);
  });
});
