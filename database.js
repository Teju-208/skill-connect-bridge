const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "skillbridge.db");
let sqlite = null;
let ready = false;
let initError = null;
const queue = [];

function translateSql(sql) {
    // sql.js uses SQLite syntax, so the existing application SQL can be used as-is.
    return sql;
}

function persist() {
    if (!sqlite) return;
    try {
        const data = sqlite.export();
        fs.writeFileSync(DB_FILE, Buffer.from(data));
    } catch (err) {
        console.error("Database persistence warning:", err.message);
    }
}

function runNow(sql, params, callback) {
    try {
        const stmt = sqlite.prepare(translateSql(sql));
        stmt.bind(params || []);
        while (stmt.step()) {}
        stmt.free();

        const idResult = sqlite.exec("SELECT last_insert_rowid() AS id");
        const changesResult = sqlite.exec("SELECT changes() AS changes");
        const lastID = idResult.length ? Number(idResult[0].values[0][0]) : 0;
        const changes = changesResult.length ? Number(changesResult[0].values[0][0]) : 0;
        persist();
        if (callback) callback.call({ lastID, changes }, null);
    } catch (err) {
        if (callback) callback.call({ lastID: 0, changes: 0 }, err);
    }
}

function getNow(sql, params, callback) {
    try {
        const stmt = sqlite.prepare(translateSql(sql));
        stmt.bind(params || []);
        const row = stmt.step() ? stmt.getAsObject() : undefined;
        stmt.free();
        if (callback) callback(null, row);
    } catch (err) {
        if (callback) callback(err);
    }
}

function allNow(sql, params, callback) {
    try {
        const stmt = sqlite.prepare(translateSql(sql));
        stmt.bind(params || []);
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        if (callback) callback(null, rows);
    } catch (err) {
        if (callback) callback(err);
    }
}

function executeQueued() {
    while (queue.length) {
        const item = queue.shift();
        if (item.type === "run") runNow(item.sql, item.params, item.callback);
        else if (item.type === "get") getNow(item.sql, item.params, item.callback);
        else allNow(item.sql, item.params, item.callback);
    }
}

const db = {
    run(sql, params, callback) {
        if (typeof params === "function") {
            callback = params;
            params = [];
        }
        if (!ready) return queue.push({ type: "run", sql, params, callback });
        runNow(sql, params, callback);
    },
    get(sql, params, callback) {
        if (typeof params === "function") {
            callback = params;
            params = [];
        }
        if (!ready) return queue.push({ type: "get", sql, params, callback });
        getNow(sql, params, callback);
    },
    all(sql, params, callback) {
        if (typeof params === "function") {
            callback = params;
            params = [];
        }
        if (!ready) return queue.push({ type: "all", sql, params, callback });
        allNow(sql, params, callback);
    },
    serialize(fn) {
        if (typeof fn === "function") fn();
    }
};

async function initialize() {
    try {
        const SQL = await initSqlJs({
            locateFile: file => path.join(path.dirname(require.resolve("sql.js")), file)
        });

        if (fs.existsSync(DB_FILE)) {
            sqlite = new SQL.Database(fs.readFileSync(DB_FILE));
        } else {
            sqlite = new SQL.Database();
        }

        sqlite.run(`PRAGMA foreign_keys = ON;`);

        const schema = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            phone TEXT,
            location TEXT,
            degree TEXT,
            specialization TEXT,
            college TEXT,
            graduation_year INTEGER,
            target_career TEXT,
            preferred_industry TEXT,
            resume_name TEXT,
            resume_text TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            skill_name TEXT NOT NULL,
            skill_score INTEGER DEFAULT 0,
            source TEXT DEFAULT 'manual',
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS opportunities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            location TEXT,
            skills TEXT,
            duration TEXT,
            type TEXT
        );
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT,
            level TEXT,
            duration TEXT
        );
        CREATE TABLE IF NOT EXISTS faculty (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            department TEXT,
            designation TEXT,
            college TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            faculty_id INTEGER,
            title TEXT NOT NULL,
            skill TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (faculty_id) REFERENCES faculty(id)
        );
        CREATE TABLE IF NOT EXISTS assessment_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            assessment_id INTEGER NOT NULL,
            question TEXT NOT NULL,
            option_a TEXT NOT NULL,
            option_b TEXT NOT NULL,
            option_c TEXT NOT NULL,
            option_d TEXT NOT NULL,
            correct_answer TEXT NOT NULL,
            FOREIGN KEY (assessment_id) REFERENCES assessments(id)
        );
        CREATE TABLE IF NOT EXISTS assessment_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            assessment_id INTEGER,
            student_id INTEGER,
            score INTEGER DEFAULT 0,
            FOREIGN KEY (assessment_id) REFERENCES assessments(id),
            FOREIGN KEY (student_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS course_recommendations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            faculty_id INTEGER,
            student_id INTEGER,
            course_id INTEGER,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (faculty_id) REFERENCES faculty(id),
            FOREIGN KEY (student_id) REFERENCES users(id),
            FOREIGN KEY (course_id) REFERENCES courses(id)
        );`;

        sqlite.run(schema);

        // Migrate older SQLite files if the columns do not exist.
        const columns = (table) => sqlite.exec(`PRAGMA table_info(${table})`)[0]?.values.map(r => r[1]) || [];
        const profileCols = columns("profiles");
        if (!profileCols.includes("resume_name")) sqlite.run("ALTER TABLE profiles ADD COLUMN resume_name TEXT");
        if (!profileCols.includes("resume_text")) sqlite.run("ALTER TABLE profiles ADD COLUMN resume_text TEXT");
        const skillCols = columns("skills");
        if (!skillCols.includes("source")) sqlite.run("ALTER TABLE skills ADD COLUMN source TEXT DEFAULT 'manual'");

        seedDefaults();
        persist();
        ready = true;
        console.log("SkillBridge database ready ✅ (portable SQLite engine)");
        executeQueued();
    } catch (err) {
        initError = err;
        console.error("Database initialization failed:", err);
        while (queue.length) {
            const item = queue.shift();
            if (item.callback) item.callback(initError);
        }
    }
}

function seedDefaults() {
    const user = sqlite.exec("SELECT id FROM users ORDER BY id LIMIT 1");
    if (user.length) {
        const userId = Number(user[0].values[0][0]);
        const skills = [["Java",80],["HTML & CSS",75],["Python",65],["JavaScript",60],["Machine Learning",45]];
        for (const [name, score] of skills) {
            sqlite.run(`INSERT INTO skills (user_id, skill_name, skill_score) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM skills WHERE user_id = ? AND skill_name = ?)`, [userId,name,score,userId,name]);
        }
    }

    const opportunities = [
        ["Web Development Intern","Technology Company","Remote","HTML • CSS • JavaScript","3 Months","Internship"],
        ["AI / ML Intern","AI Solutions Company","Hybrid","Python • Machine Learning","6 Months","Internship"],
        ["Software Developer","Software Solutions","Bangalore","Java • DSA","Full Time","Entry Level"],
        ["Python Developer Intern","Digital Technology Company","Remote","Python • SQL","4 Months","Internship"]
    ];
    for (const o of opportunities) sqlite.run(`INSERT INTO opportunities (title,company,location,skills,duration,type) SELECT ?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM opportunities WHERE title=? AND company=?)`, [...o,o[0],o[1]]);

    const courses = [
        ["Java Fundamentals","PROGRAMMING","Beginner","8 Weeks"],
        ["Modern Web Development","WEB DEVELOPMENT","Beginner","6 Weeks"],
        ["Python for AI","ARTIFICIAL INTELLIGENCE","Beginner","7 Weeks"],
        ["Machine Learning Basics","MACHINE LEARNING","Intermediate","10 Weeks"]
    ];
    for (const c of courses) sqlite.run(`INSERT INTO courses (title,category,level,duration) SELECT ?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title=?)`, [...c,c[0]]);
}

initialize();
module.exports = db;
