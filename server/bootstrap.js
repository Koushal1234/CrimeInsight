async function ensurePatrolDispatchTable(db) {
  const dbp = db.promise();
  await dbp.query(`
    CREATE TABLE IF NOT EXISTS PATROL_DISPATCH (
      dispatch_id INT AUTO_INCREMENT PRIMARY KEY,
      patrol_id INT NOT NULL UNIQUE,
      crime_id INT NOT NULL,
      assigned_by_officer_id INT NULL,
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patrol_id) REFERENCES PATROL(patrol_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (crime_id) REFERENCES CRIME(crime_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (assigned_by_officer_id) REFERENCES OFFICER(officer_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `);
}

async function bootstrapDatabase(db, migrateOfficerPasswords) {
  await ensurePatrolDispatchTable(db);
  await migrateOfficerPasswords(db);
}

module.exports = {
  bootstrapDatabase,
};
