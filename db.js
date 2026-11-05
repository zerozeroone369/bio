const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'bio_link_db';

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

let client = null;
let mongoDb = null;
let useMongo = false;

// Đọc dữ liệu từ file local làm fallback
function getLocalDb() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.users) data.users = [];
    if (!data.bios) data.bios = {};
    if (!data.sessions) data.sessions = {};
    return data;
  } catch (e) {
    return { users: [], bios: {}, sessions: {} };
  }
}

function saveLocalDb(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('[DB Local] Error saving file:', e.message);
  }
}

// Khởi tạo kết nối MongoDB
async function initDatabase() {
  try {
    console.log(`[MongoDB] Đang thử kết nối tới ${MONGODB_URI}/${DB_NAME}...`);
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 500, // Thử nhanh 0.5s để khởi động tức thì nếu dùng Local DB
    });
    await client.connect();
    mongoDb = client.db(DB_NAME);
    useMongo = true;
    console.log('[MongoDB] ✅ Đã kết nối thành công tới MongoDB Database!');

    // Tạo Index cho hiệu năng cao
    await mongoDb.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoDb.collection('users').createIndex({ username: 1 });
    await mongoDb.collection('bios').createIndex({ username: 1 }, { unique: true });

    // Đồng bộ người dùng demo nếu database trống, hoặc đồng bộ từ MongoDB về local
    const count = await mongoDb.collection('users').countDocuments();
    if (count === 0) {
      const local = getLocalDb();
      if (local.users && local.users.length > 0) {
        await mongoDb.collection('users').insertMany(local.users);
        const bioEntries = Object.entries(local.bios).map(([uname, data]) => ({
          username: uname.toLowerCase(),
          ...data,
        }));
        if (bioEntries.length > 0) {
          await mongoDb.collection('bios').insertMany(bioEntries);
        }
        console.log('[MongoDB] Đã khởi tạo dữ liệu mẫu từ users.json vào MongoDB!');
      }
    } else {
      // Database MongoDB đã có dữ liệu: đồng bộ ngược lại vào users.json để lưu trữ nhất quán
      try {
        const mongoUsers = await mongoDb.collection('users').find({}).toArray();
        if (mongoUsers && mongoUsers.length > 0) {
          const local = getLocalDb();
          for (const mUser of mongoUsers) {
            const cleanEmail = (mUser.email || '').toLowerCase();
            const cleanUname = (mUser.username || '').toLowerCase();
            const idx = local.users.findIndex(u => 
              (u.id && mUser.id && u.id === mUser.id) ||
              (u.email && u.email.toLowerCase() === cleanEmail) ||
              (u.username && u.username.toLowerCase() === cleanUname)
            );
            if (idx >= 0) {
              local.users[idx] = { ...local.users[idx], ...mUser };
            } else {
              local.users.push(mUser);
            }
          }
          saveLocalDb(local);
          console.log(`[MongoDB] ✅ Đã đồng bộ ${mongoUsers.length} tài khoản từ MongoDB vào bộ nhớ hệ thống!`);
        }
      } catch (syncErr) {
        console.warn('[MongoDB Sync] Không thể đồng bộ từ MongoDB về local:', syncErr.message);
      }
    }
  } catch (err) {
    console.warn(`[MongoDB] ⚠️ Không kết nối được MongoDB (${err.message}). Tự động kích hoạt cơ chế Local Document Database (users.json)!`);
    useMongo = false;
  }
}

// --- CÁC HÀM CRUD TƯƠNG THÍCH MONGODB VÀ FALLBACK ---

async function updateUser(id, updates) {
  if (useMongo) {
    try {
      await mongoDb.collection('users').updateOne(
        { id },
        { $set: { ...updates, updatedAt: new Date().toISOString() } }
      );
    } catch (e) {
      console.error('[MongoDB] updateUser error:', e.message);
    }
  }
  const db = getLocalDb();
  const u = db.users.find(usr => usr.id === id);
  if (u) {
    Object.assign(u, updates, { updatedAt: new Date().toISOString() });
    saveLocalDb(db);
  }
}

async function updateUserPassword(emailOrUsername, newHashedPassword) {
  const clean = (emailOrUsername || '').trim().toLowerCase();
  if (useMongo) {
    try {
      await mongoDb.collection('users').updateOne(
        {
          $or: [
            { email: clean },
            { username: clean }
          ]
        },
        { $set: { password: newHashedPassword, updatedAt: new Date().toISOString() } }
      );
    } catch (e) {
      console.error('[MongoDB] updateUserPassword error:', e.message);
    }
  }
  const db = getLocalDb();
  const u = db.users.find(usr => 
    (usr.email && usr.email.toLowerCase() === clean) ||
    (usr.username && usr.username.toLowerCase() === clean)
  );
  if (u) {
    u.password = newHashedPassword;
    u.updatedAt = new Date().toISOString();
    saveLocalDb(db);
  }
}

async function findUserByEmail(email) {
  const cleanEmail = email.trim().toLowerCase();
  if (useMongo) {
    return await mongoDb.collection('users').findOne({ email: cleanEmail });
  }
  const db = getLocalDb();
  return db.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
}

async function findUserByUsername(username) {
  const cleanUsername = username.trim().toLowerCase();
  if (useMongo) {
    return await mongoDb.collection('users').findOne({ username: cleanUsername });
  }
  const db = getLocalDb();
  return db.users.find(u => u.username.toLowerCase() === cleanUsername) || null;
}

async function findUserById(id) {
  if (useMongo) {
    return await mongoDb.collection('users').findOne({ id });
  }
  const db = getLocalDb();
  return db.users.find(u => u.id === id) || null;
}

async function createUser(userData) {
  if (useMongo) {
    await mongoDb.collection('users').insertOne(userData);
    if (userData.bioData) {
      await mongoDb.collection('bios').updateOne(
        { username: userData.username.toLowerCase() },
        { $set: { username: userData.username.toLowerCase(), ...userData.bioData } },
        { upsert: true }
      );
    }
    return userData;
  }
  const db = getLocalDb();
  db.users.push(userData);
  if (userData.bioData) {
    db.bios[userData.username.toLowerCase()] = userData.bioData;
  }
  saveLocalDb(db);
  return userData;
}

async function getBioByUsername(username) {
  const cleanUsername = username.trim().toLowerCase();
  if (useMongo) {
    const doc = await mongoDb.collection('bios').findOne({ username: cleanUsername });
    if (doc) return doc;
    const user = await mongoDb.collection('users').findOne({ username: cleanUsername });
    return user ? user.bioData : null;
  }
  const db = getLocalDb();
  let bio = db.bios[cleanUsername] || null;
  if (!bio) {
    const u = db.users.find(usr => usr.username.toLowerCase() === cleanUsername || (usr.email && usr.email.toLowerCase() === cleanUsername));
    if (u && u.bioData) bio = u.bioData;
  }
  return bio;
}

async function saveBioData(username, bioData) {
  const cleanUsername = username.trim().toLowerCase();
  if (useMongo) {
    try {
      await mongoDb.collection('bios').updateOne(
        { username: cleanUsername },
        { $set: { username: cleanUsername, ...bioData, updatedAt: new Date() } },
        { upsert: true }
      );
      const filter = bioData.email ? 
        { $or: [{ username: cleanUsername }, { email: bioData.email.toLowerCase() }] } : 
        { username: cleanUsername };
      await mongoDb.collection('users').updateOne(
        filter,
        { $set: { username: cleanUsername, bioData, updatedAt: new Date().toISOString() } }
      );
    } catch (mErr) {
      console.warn('[MongoDB Save Warning]', mErr.message);
    }
  }
  const db = getLocalDb();
  db.bios[cleanUsername] = bioData;
  const user = db.users.find(u => 
    (u.username && u.username.toLowerCase() === cleanUsername) || 
    (bioData.email && u.email && u.email.toLowerCase() === bioData.email.toLowerCase())
  );
  if (user) {
    user.username = cleanUsername;
    user.bioData = bioData;
    if (bioData.name) user.name = bioData.name;
    if (bioData.avatar) user.avatar = bioData.avatar;
  }
  saveLocalDb(db);
  return true;
}

async function saveSession(token, sessionData) {
  if (useMongo) {
    await mongoDb.collection('sessions').updateOne(
      { token },
      { $set: { token, ...sessionData, updatedAt: new Date() } },
      { upsert: true }
    );
    return;
  }
  const db = getLocalDb();
  db.sessions[token] = sessionData;
  saveLocalDb(db);
}

async function getSession(token) {
  if (useMongo) {
    return await mongoDb.collection('sessions').findOne({ token });
  }
  const db = getLocalDb();
  return db.sessions[token] || null;
}

module.exports = {
  initDatabase,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  createUser,
  updateUser,
  updateUserPassword,
  getBioByUsername,
  saveBioData,
  saveSession,
  getSession,
  isMongoConnected: () => useMongo,
};
