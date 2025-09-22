// ormconfig.ts
module.exports = {
  type: "mysql",
  
  entities: ["dist/**/*.entity.js"],
  migrations: ["dist/migration/**/*.js"],
  cli: {
    migrationsDir: "src/migration"
  }
};