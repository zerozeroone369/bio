const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const dbLayer = require('./db');

let PORT = parseInt(process.env.PORT, 10) || 3000;
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const UPLOADS_VIDEOS_DIR = path.join(UPLOADS_DIR, 'videos');
const UPLOADS_AVATARS_DIR = path.join(UPLOADS_DIR, 'avatars');

// Ensure necessary directories exist
[DATA_DIR, UPLOADS_DIR, UPLOADS_VIDEOS_DIR, UPLOADS_AVATARS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Password Hashing Helper
const SALT = 'bio_app_secure_salt_2026';
function hashPassword(pwd) {
  return crypto.createHash('sha256').update(pwd + SALT).digest('hex');
}

// Initial Database Setup
if (!fs.existsSync(USERS_FILE)) {
  const initialUser = {
    id: "u_demo",
    name: "Abg",
    username: "abg",
    email: "teome5575@gmail.com",
    password: hashPassword("123456"),
    avatar: "assets/avatar_abg.jpg",
    authProvider: "email",
    createdAt: new Date().toISOString()
  };

  const initialBio = {
    name: "Abg",
    username: "abg",
    bio: "Digital Artist & Tarot Creator ✨ Chào mừng bạn đến với thế giới của tôi!",
    avatar: "assets/avatar_abg.jpg",
    theme: "rainy_night",
    links: [
      { id: 1, title: "Fb", url: "https://facebook.com/abg" },
      { id: 2, title: "Portfolio & Dự án mới", url: "https://behance.net" }
    ],
    socials: {
      instagram: "https://instagram.com/abg",
      tiktok: "https://tiktok.com/@abg",
      youtube: "https://youtube.com/@abg",
      facebook: "https://facebook.com/abg"
    },
    video: {
      url: "",
      name: "",
      size: "",
      overlay: 40,
      blur: 0,
      muted: true
    }
  };

  initialUser.bioData = initialBio;

  fs.writeFileSync(USERS_FILE, JSON.stringify({
    users: [initialUser],
    bios: {
      "abg": initialBio
    },
    sessions: {}
  }, null, 2));
}

// Read & Write DB
function getDatabase() {
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

function saveDatabase(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

// Get Local IPv4 Address for QR Code
function getLocalNetworkIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('169.254.')) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.ico': 'image/x-icon',
  '.apk': 'application/vnd.android.package-archive'
};

// Helper to read JSON request body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Social domain fallback redirect (e.g. if link is clicked as relative url like /facebook.com/...)
  const matchSocial = pathname.match(/^\/(https?:\/\/)?((facebook\.com|threads\.net|threads\.com|zalo\.me|zaloapp\.com|locket\.camera|locket\.cam|tiktok\.com|instagram\.com|youtube\.com|t\.me|behance\.net|spotify\.com|soundcloud\.com)\/.*)$/i);
  if (matchSocial) {
    const dest = `https://${matchSocial[2]}`;
    res.writeHead(302, { 'Location': dest });
    res.end();
    return;
  }

  // -------------------------------------------------------------
  // API: NETWORK INFO FOR SMART QR CODE
  // -------------------------------------------------------------
  if (pathname === '/api/network-info') {
    const ip = getLocalNetworkIp();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      ip,
      port: PORT,
      localUrl: `http://localhost:${PORT}`,
      networkUrl: `http://${ip}:${PORT}`
    }));
    return;
  }

  // -------------------------------------------------------------
  // API: IN-APP APK AUTO UPDATE CHECKER
  // -------------------------------------------------------------
  if (pathname === '/api/app-version') {
    const versionFilePath = path.join(ROOT_DIR, 'releases', 'version.json');
    if (fs.existsSync(versionFilePath)) {
      try {
        const raw = fs.readFileSync(versionFilePath, 'utf-8');
        const verData = JSON.parse(raw);
        const ip = getLocalNetworkIp();
        if (verData.apkUrl && verData.apkUrl.startsWith('/')) {
          verData.fullDownloadUrl = `http://${ip}:${PORT}${verData.apkUrl}`;
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, ...verData }));
        return;
      } catch (e) {
        console.error('[Update API Error]', e.message);
      }
    }
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: false, error: 'Chưa có thông tin phiên bản mới' }));
    return;
  }

  // -------------------------------------------------------------
  // API: AUTHENTICATION (REGISTER / LOGIN / GOOGLE / SESSION)
  // -------------------------------------------------------------

  // REGISTER
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    try {
      const { name, email, password, username } = await parseJsonBody(req);
      if (!email || !password || !name) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu!' }));
        return;
      }

      if (password.length < 6) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Mật khẩu phải chứa ít nhất 6 ký tự để đảm bảo an toàn!' }));
        return;
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanUsername = (username || name).trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '') || `user_${Date.now()}`;

      const db = getDatabase();

      // Check existing email
      const existingUser = db.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (existingUser) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Email này đã được đăng ký. Vui lòng đăng nhập bằng mật khẩu của bạn!' }));
        return;
      }

      // Check existing username
      let finalUsername = cleanUsername;
      if (db.bios[finalUsername] && (!existingUser || existingUser.username !== finalUsername)) {
        finalUsername = `${cleanUsername}_${Math.floor(Math.random() * 899 + 100)}`;
      }

      const newUser = {
        id: `u_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: name.trim(),
        username: finalUsername,
        email: cleanEmail,
        password: hashPassword(password),
        avatar: "assets/avatar_abg.jpg",
        authProvider: "email",
        createdAt: new Date().toISOString()
      };

      const defaultBio = {
        name: newUser.name,
        username: newUser.username,
        bio: `Chào mừng bạn đến với trang Bio của ${newUser.name}!`,
        avatar: newUser.avatar,
        theme: "rainy_night",
        links: [
          { id: 1, title: "Trang cá nhân", url: `https://bio.me/@${newUser.username}` }
        ],
        socials: {
          instagram: "",
          tiktok: "",
          youtube: "",
          facebook: ""
        },
        video: {
          url: "",
          name: "",
          size: "",
          overlay: 40,
          blur: 0,
          muted: true
        }
      };

      newUser.bioData = defaultBio;
      db.users.push(newUser);
      db.bios[finalUsername] = defaultBio;

      // Create session token
      const token = crypto.randomBytes(24).toString('hex');
      db.sessions[token] = { userId: newUser.id, email: newUser.email, expires: Date.now() + 30 * 24 * 3600 * 1000 };
      saveDatabase(db);
      try {
        await dbLayer.createUser(newUser);
        await dbLayer.saveSession(token, db.sessions[token]);
      } catch (errSync) {
        console.warn('[MongoDB Sync] User sync note:', errSync.message);
      }

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        message: 'Đăng ký tài khoản thành công!',
        user: {
          id: newUser.id,
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
          avatar: newUser.avatar,
          bioData: newUser.bioData
        },
        token
      }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // LOGIN (WITH PASSWORD VERIFICATION)
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    try {
      const { email, password } = await parseJsonBody(req);
      if (!email || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Vui lòng nhập đầy đủ email và mật khẩu!' }));
        return;
      }

      const cleanEmail = email.trim().toLowerCase();
      const db = getDatabase();
      const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

      if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Email chưa được đăng ký trong hệ thống!' }));
        return;
      }

      // Verify Password Hash
      const inputHash = hashPassword(password);
      if (user.password && user.password !== inputHash) {
        res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Mật khẩu không chính xác! Vui lòng thử lại.' }));
        return;
      }

      // If user had no password yet, set it now
      if (!user.password) {
        user.password = inputHash;
      }

      // Ensure user has bioData
      if (!user.bioData) {
        user.bioData = db.bios[user.username] || {
          name: user.name,
          username: user.username,
          bio: "",
          avatar: user.avatar,
          theme: "rainy_night",
          links: [],
          socials: {},
          video: {}
        };
      }

      const token = crypto.randomBytes(24).toString('hex');
      db.sessions[token] = { userId: user.id, email: user.email, expires: Date.now() + 30 * 24 * 3600 * 1000 };
      saveDatabase(db);

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        message: 'Đăng nhập thành công!',
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bioData: user.bioData
        },
        token
      }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // GOOGLE LOGIN (WITH PASSWORD PROTECTION)
  if (pathname === '/api/auth/google' && req.method === 'POST') {
    try {
      let { email, name, avatar, password } = await parseJsonBody(req);
      if (!email) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Thiếu thông tin tài khoản Google!' }));
        return;
      }

      const cleanEmail = email.trim().toLowerCase();
      const db = getDatabase();
      let user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

      // Auto-supply default password for demo account if missing
      if (user && (user.id === 'u_demo' || cleanEmail === 'teome5575@gmail.com') && !password) {
        password = '123456';
      }

      // If account exists and has password, require password to match
      if (user && user.password) {
        if (!password && user.authProvider !== 'google') {
          res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            success: false,
            requirePassword: true,
            error: 'Tài khoản này đã được bảo vệ bằng mật khẩu. Vui lòng nhập mật khẩu tài khoản!'
          }));
          return;
        }
        if (password && hashPassword(password) !== user.password) {
          res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: 'Mật khẩu bảo mật không chính xác!' }));
          return;
        }
      }

      // If new Google user, create user
      if (!user) {
        const username = cleanEmail.split('@')[0].replace(/[^a-z0-9_\-]/g, '') || `user_${Date.now()}`;
        const displayName = name && name !== 'Người dùng Google' ? name : (username.charAt(0).toUpperCase() + username.slice(1));
        user = {
          id: `u_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: displayName,
          username: username,
          email: cleanEmail,
          password: password ? hashPassword(password) : hashPassword('123456'),
          avatar: avatar || 'assets/avatar_abg.jpg',
          authProvider: 'google',
          createdAt: new Date().toISOString()
        };

        const defaultBio = {
          name: user.name,
          username: user.username,
          email: user.email,
          bio: `Chào mừng bạn đến với trang Bio của ${user.name}!`,
          avatar: user.avatar,
          theme: "rainy_night",
          links: [],
          socials: {
            instagram: "",
            tiktok: "",
            youtube: "",
            facebook: ""
          },
          video: {
            url: "",
            name: "",
            size: "",
            overlay: 40,
            blur: 0,
            muted: true
          }
        };
        user.bioData = defaultBio;
        db.users.push(user);
        db.bios[username.toLowerCase()] = defaultBio;
      }

      const token = crypto.randomBytes(24).toString('hex');
      db.sessions[token] = { userId: user.id, email: user.email, expires: Date.now() + 30 * 24 * 3600 * 1000 };
      saveDatabase(db);

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        message: 'Đăng nhập Google thành công!',
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bioData: user.bioData || db.bios[user.username]
        },
        token
      }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // VERIFY SESSION
  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '') || parsedUrl.searchParams.get('token');
    const db = getDatabase();

    if (token && db.sessions[token] && db.sessions[token].expires > Date.now()) {
      const sess = db.sessions[token];
      const user = db.users.find(u => u.id === sess.userId || u.email === sess.email);
      if (user) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: true,
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            bioData: user.bioData || db.bios[user.username]
          }
        }));
        return;
      }
    }

    res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: false, error: 'Chưa đăng nhập' }));
    return;
  }

  // -------------------------------------------------------------
  // API: UPLOAD VIDEO BACKGROUND FROM COMPUTER
  // -------------------------------------------------------------
  if (pathname === '/api/upload-video' && req.method === 'POST') {
    const originalFilename = parsedUrl.searchParams.get('filename') || 'custom_bg.mp4';
    const ext = path.extname(originalFilename) || '.mp4';
    const safeName = `video_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    const targetPath = path.join(UPLOADS_VIDEOS_DIR, safeName);

    const writeStream = fs.createWriteStream(targetPath);
    req.pipe(writeStream);

    writeStream.on('finish', () => {
      const stats = fs.statSync(targetPath);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        url: `/uploads/videos/${safeName}`,
        filename: originalFilename,
        size: stats.size
      }));
    });

    writeStream.on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    });
    return;
  }

  // -------------------------------------------------------------
  // API: UPLOAD AVATAR IMAGE
  // -------------------------------------------------------------
  if (pathname === '/api/upload-avatar' && req.method === 'POST') {
    const originalFilename = parsedUrl.searchParams.get('filename') || 'avatar.jpg';
    const ext = path.extname(originalFilename) || '.jpg';
    const safeName = `avatar_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    const targetPath = path.join(UPLOADS_AVATARS_DIR, safeName);

    const writeStream = fs.createWriteStream(targetPath);
    req.pipe(writeStream);

    writeStream.on('finish', () => {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        url: `/uploads/avatars/${safeName}`
      }));
    });

    writeStream.on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    });
    return;
  }

  // -------------------------------------------------------------
  // API: GET USER BIO BY USERNAME OR EMAIL
  // -------------------------------------------------------------
  if (pathname.startsWith('/api/bio/')) {
    const rawTarget = decodeURIComponent(pathname.replace('/api/bio/', '')).toLowerCase();
    try {
      const db = getDatabase();
      let bio = db.bios[rawTarget] || null;
      if (!bio) {
        const u = db.users.find(usr => usr.username.toLowerCase() === rawTarget || (usr.email && usr.email.toLowerCase() === rawTarget));
        if (u && u.bioData) bio = u.bioData;
      }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, bio }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // -------------------------------------------------------------
  // API: SAVE USER BIO (AUTOMATIC PERSISTENCE TO SERVER)
  // -------------------------------------------------------------
  if (pathname === '/api/save-bio' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      if (!payload.username && !payload.email) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Thiếu tên định danh (username) hoặc email' }));
        return;
      }

      const db = getDatabase();
      const uname = (payload.username || '').toLowerCase();
      const uemail = (payload.email || '').toLowerCase();

      // Normalize all links in payload to avoid 404
      if (Array.isArray(payload.links)) {
        payload.links = payload.links.map(l => {
          let u = (l.url || '').trim();
          if (u && !u.startsWith('http://') && !u.startsWith('https://')) {
            if (/^[0-9+ ]{9,15}$/.test(u)) {
              u = `https://zalo.me/${u.replace(/\s+/g, '')}`;
            } else {
              u = `https://${u}`;
            }
          }
          return { ...l, url: u };
        });
      }

      // Update in corresponding user FIRST by email (or by username)
      const user = db.users.find(u => (uemail && u.email.toLowerCase() === uemail) || (uname && u.username.toLowerCase() === uname));
      if (user) {
        if (uname && user.username.toLowerCase() !== uname) {
          const oldUname = user.username.toLowerCase();
          user.username = uname;
          db.bios[uname] = payload;
          db.bios[oldUname] = payload; // Keep alias
        } else {
          db.bios[user.username.toLowerCase()] = payload;
        }
        user.bioData = payload;
        if (payload.avatar) user.avatar = payload.avatar;
        if (payload.name) user.name = payload.name;
      }

      if (uname) {
        db.bios[uname] = payload;
      }

      saveDatabase(db);
      try {
        await dbLayer.saveBioData(uname || (user && user.username), payload);
      } catch (errSync) {
        console.warn('[MongoDB Sync] Bio sync note:', errSync.message);
      }

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, message: 'Đã lưu trang Bio thành công trên máy chủ!' }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // -------------------------------------------------------------
  // STATIC FILE SERVING WITH HTTP 206 RANGE (VIDEO STREAMING)
  // -------------------------------------------------------------
  let reqUrl = pathname;
  if (reqUrl === '/') reqUrl = '/index.html';

  const filePath = path.join(ROOT_DIR, decodeURIComponent(reqUrl));
  const ext = path.extname(filePath).toLowerCase();

  // Basic security check: prevent directory traversal
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // HTTP 206 Partial Content Range Support for Video Streaming (.mp4, .webm, .mov)
    const range = req.headers.range;
    if (range && (ext === '.mp4' || ext === '.webm' || ext === '.mov')) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;

      if (start >= stats.size || end >= stats.size) {
        res.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
        res.end();
        return;
      }

      const chunksize = (end - start) + 1;
      const stream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      stream.pipe(res);
      return;
    }

    // Standard 200 response
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

function listenWithPortFallback(currentPort) {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Cổng ${currentPort} đang bận] Tự động thử cổng tiếp theo: ${currentPort + 1}...`);
      listenWithPortFallback(currentPort + 1);
    } else {
      console.error('Lỗi khởi động Server:', err);
    }
  });

  server.listen(currentPort, '0.0.0.0', () => {
    PORT = currentPort;
    const ip = getLocalNetworkIp();
    console.log(`\n==========================================================`);
    console.log(`🚀 Bio Link Server đang hoạt động thành công tại:`);
    console.log(`- Local:    http://localhost:${PORT}`);
    console.log(`- Network:  http://${ip}:${PORT}`);
    console.log(`- Database: ${dbLayer.isMongoConnected() ? 'MongoDB' : 'Local Document DB (users.json)'}`);
    console.log(`==========================================================\n`);
  });
}

dbLayer.initDatabase().finally(() => {
  listenWithPortFallback(PORT);
});
