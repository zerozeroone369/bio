const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const dbLayer = require('./db');

// Native .env file loader (Zero external dependency)
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  try {
    const envRaw = fs.readFileSync(envFile, 'utf8');
    envRaw.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
    console.log('[Env] ✅ Đã nạp thành công các biến cấu hình từ file .env');
  } catch (err) {
    console.warn('[Env] Cảnh báo đọc file .env:', err.message);
  }
}

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
  const safePwd = (pwd || '').toString().trim();
  return crypto.createHash('sha256').update(safePwd + SALT).digest('hex');
}

// Client IP Helper (Supports reverse proxies like Render / Cloudflare / Nginx)
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const list = forwarded.split(',');
    return list[0].trim();
  }
  let ip = req.socket?.remoteAddress || req.connection?.remoteAddress || '';
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }
  return ip || '127.0.0.1';
}

// Nodemailer Gmail SMTP Transporter
function createEmailTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const smtpSecure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : smtpPort === 465;
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || '';
  const smtpPass = (process.env.SMTP_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

  if (smtpHost && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false }
    });
  }

  if (smtpUser && smtpPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: { rejectUnauthorized: false }
    });
  }
  return null;
}

// =============================================================
// PAYMENT CONFIGURATION & WHITELIST (5.000 VND ACTIVATION FEE)
// =============================================================
const PAYMENT_EXEMPT_EMAILS = [
  'thngan09052k5@gmail.com',
  'teome5575@gmail.com',
  'nguyenngotuanhtk123@gmail.com'
];

function isUserPaymentExempt(email) {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return PAYMENT_EXEMPT_EMAILS.some(exempt => exempt.toLowerCase() === clean);
}

function checkUserPaidStatus(user) {
  if (!user) return false;
  if (isUserPaymentExempt(user.email)) return true;
  return user.isPaid === true;
}

const PAYMENT_CONFIG = {
  bank: 'MB',
  bankName: 'MBBank (Ngân hàng TMCP Quân đội)',
  accountNumber: '0932543483',
  accountName: 'NGUYEN NGO TU ANH',
  amount: 5000,
  currency: 'VND',
  qrImage: '/assets/payment_qr.jpg'
};

// Send Password Reset OTP Email
async function sendResetEmail(toEmail, code, userName) {
  const transporter = createEmailTransporter();
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #6366f1; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">bio</h2>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Nền tảng Bio Link Cá Nhân Thế Hệ Mới</p>
      </div>
      <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0 0 12px 0; font-size: 15px;">Xin chào <strong>${userName || 'bạn'}</strong>,</p>
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5; color: #475569;">
          Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản Bio Link liên kết với địa chỉ email này.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; background: #e0e7ff; padding: 12px 28px; border-radius: 10px; border: 1px dashed #6366f1;">
            ${code}
          </span>
        </div>
        <p style="margin: 0; font-size: 13px; color: #64748b; text-align: center;">
          Mã xác thực có hiệu lực trong <strong>15 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.
        </p>
      </div>
      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
        Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này để đảm bảo an toàn cho tài khoản.
      </p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Bio Link Security" <${process.env.SMTP_USER || process.env.GMAIL_USER || 'no-reply@biolink.me'}>`,
        to: toEmail,
        subject: `[Bio Link] Mã xác thực đặt lại mật khẩu của bạn: ${code}`,
        text: `Mã xác thực đặt lại mật khẩu Bio Link của bạn là: ${code}. Mã có hiệu lực trong 15 phút.`,
        html: htmlContent
      });
      console.log(`[Email Sent] ✅ Password reset OTP sent to ${toEmail}`);
      return { sent: true };
    } catch (err) {
      console.error('[Email Error] Failed to send email via SMTP:', err.message);
      return { sent: false, error: err.message };
    }
  } else {
    console.warn(`[Email Service] Cần cấu hình SMTP_USER và SMTP_PASS (Mật khẩu ứng dụng Gmail) để gửi email đến ${toEmail}.`);
    return {
      sent: false,
      error: 'Máy chủ chưa được cấu hình tài khoản gửi Gmail (SMTP_USER & SMTP_PASS). Vui lòng thêm Mật khẩu ứng dụng Gmail (App Password) vào biến môi trường để hệ thống gửi mã xác thực trực tiếp về Gmail!'
    };
  }
}

// Initial Database Setup
if (!fs.existsSync(USERS_FILE)) {
  const initialUser = {
    id: "u_demo",
    name: "Abg",
    username: "abg",
    email: "creator@biolink.me",
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
    let raw = fs.readFileSync(USERS_FILE, 'utf-8');
    if (raw.charCodeAt(0) === 0xFEFF) {
      raw = raw.slice(1);
    }
    const data = JSON.parse(raw);
    if (!data.users) data.users = [];
    if (!data.bios) data.bios = {};
    if (!data.sessions) data.sessions = {};
    if (!data.passwordResets) data.passwordResets = {};
    return data;
  } catch (e) {
    return { users: [], bios: {}, sessions: {}, passwordResets: {} };
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

  // SUGGESTED ACCOUNTS ON THIS DEVICE
  if (pathname === '/api/auth/suggested-accounts' && req.method === 'GET') {
    const clientIp = getClientIp(req);
    const clientDeviceId = (req.headers['x-device-id'] || parsedUrl.searchParams?.get('deviceId') || '').toString().trim();
    const db = getDatabase();
    let matched = [];
    // Only suggest accounts if they were actually registered or logged in with this specific deviceId
    if (clientDeviceId) {
      matched = db.users
        .filter(u => Array.isArray(u.deviceIds) && u.deviceIds.includes(clientDeviceId))
        .map(u => ({
          name: u.name,
          username: u.username,
          email: u.email,
          avatar: u.avatar || 'assets/avatar_abg.jpg'
        }));
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      success: true,
      clientIp,
      accounts: matched
    }));
    return;
  }

  // REGISTER
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    try {
      const { name, email, password, username, deviceId } = await parseJsonBody(req);
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

      const clientIp = getClientIp(req);
      const clientDeviceId = (deviceId || req.headers['x-device-id'] || '').toString().trim();
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

      const isExempt = isUserPaymentExempt(cleanEmail);
      const newUser = {
        id: `u_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: name.trim(),
        username: finalUsername,
        email: cleanEmail,
        password: hashPassword(password),
        avatar: "assets/avatar_abg.jpg",
        authProvider: "email",
        deviceIds: clientDeviceId ? [clientDeviceId] : [],
        deviceIps: clientIp ? [clientIp] : [],
        lastIp: clientIp,
        isPaid: isExempt,
        isExempt: isExempt,
        paidAt: isExempt ? new Date().toISOString() : null,
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
          bioData: newUser.bioData,
          isPaid: checkUserPaidStatus(newUser),
          isExempt: isUserPaymentExempt(newUser.email),
          paidAt: newUser.paidAt || null
        },
        token
      }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // LOGIN (WITH STRICT PASSWORD VERIFICATION)
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    try {
      const { email, password, deviceId } = await parseJsonBody(req);
      if (!email || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Vui lòng nhập đầy đủ email/tên người dùng và mật khẩu!' }));
        return;
      }

      const identifier = email.trim().toLowerCase();
      const cleanPassword = (password || '').toString().trim();
      const clientIp = getClientIp(req);
      const clientDeviceId = (deviceId || req.headers['x-device-id'] || '').toString().trim();
      const db = getDatabase();
      let user = db.users.find(u => 
        (u.email && u.email.toLowerCase() === identifier) || 
        (u.username && u.username.toLowerCase() === identifier)
      );

      // Check MongoDB if user not found in local users.json
      if (!user && dbLayer.isMongoConnected()) {
        user = await dbLayer.findUserByEmail(identifier) || await dbLayer.findUserByUsername(identifier);
        if (user) {
          db.users.push(user);
          saveDatabase(db);
        }
      }

      if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Tài khoản không tồn tại trong hệ thống!' }));
        return;
      }

      // Verify Password Hash strictly
      const inputHash = hashPassword(cleanPassword);
      if (!user.password || user.password !== inputHash) {
        let matched = false;
        if (dbLayer.isMongoConnected()) {
          const freshUser = await dbLayer.findUserByEmail(identifier) || await dbLayer.findUserByUsername(identifier);
          if (freshUser && freshUser.password === inputHash) {
            user.password = freshUser.password;
            saveDatabase(db);
            matched = true;
          }
        }
        if (!matched) {
          res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: 'Mật khẩu không chính xác! Vui lòng thử lại hoặc chọn Quên mật khẩu.' }));
          return;
        }
      }

      // Remember client device ID
      if (!Array.isArray(user.deviceIds)) user.deviceIds = [];
      if (clientDeviceId && !user.deviceIds.includes(clientDeviceId)) {
        user.deviceIds.push(clientDeviceId);
      }

      // Remember client IP on device
      if (!Array.isArray(user.deviceIps)) user.deviceIps = [];
      if (clientIp && !user.deviceIps.includes(clientIp)) {
        user.deviceIps.push(clientIp);
      }
      user.lastIp = clientIp;

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
          bioData: user.bioData,
          isPaid: checkUserPaidStatus(user),
          isExempt: isUserPaymentExempt(user.email),
          paidAt: user.paidAt || null
        },
        token
      }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // GOOGLE LOGIN (WITH STRICT PASSWORD VERIFICATION)
  if (pathname === '/api/auth/google' && req.method === 'POST') {
    try {
      let { email, name, avatar, password, deviceId } = await parseJsonBody(req);
      if (!email) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Thiếu thông tin tài khoản Google!' }));
        return;
      }

      const clientIp = getClientIp(req);
      const clientDeviceId = (deviceId || req.headers['x-device-id'] || '').toString().trim();
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = (password || '').toString().trim();
      const db = getDatabase();
      let user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

      // Fallback check in MongoDB if user not found in local users.json
      if (!user && dbLayer.isMongoConnected()) {
        user = await dbLayer.findUserByEmail(cleanEmail);
        if (user) {
          db.users.push(user);
          saveDatabase(db);
        }
      }

      // If account exists and has password, ALWAYS require valid password
      if (user && user.password) {
        if (!cleanPassword) {
          res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            success: false,
            requirePassword: true,
            error: 'Tài khoản này đã được bảo vệ bằng mật khẩu. Vui lòng nhập mật khẩu tài khoản!'
          }));
          return;
        }
        const inputHash = hashPassword(cleanPassword);
        if (inputHash !== user.password) {
          let matched = false;
          if (dbLayer.isMongoConnected()) {
            const freshUser = await dbLayer.findUserByEmail(cleanEmail);
            if (freshUser && freshUser.password === inputHash) {
              user.password = freshUser.password;
              saveDatabase(db);
              matched = true;
            }
          }
          if (!matched) {
            res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, error: 'Mật khẩu bảo mật không chính xác!' }));
            return;
          }
        }
      }

      // If new Google user, create user with password
      if (!user) {
        if (!cleanPassword || cleanPassword.length < 6) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: 'Vui lòng thiết lập mật khẩu tối thiểu 6 ký tự để bảo vệ tài khoản Google của bạn!' }));
          return;
        }

        const username = cleanEmail.split('@')[0].replace(/[^a-z0-9_\-]/g, '') || `user_${Date.now()}`;
        const displayName = name && name !== 'Người dùng Google' ? name : (username.charAt(0).toUpperCase() + username.slice(1));
        const isExempt = isUserPaymentExempt(cleanEmail);
        user = {
          id: `u_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: displayName,
          username: username,
          email: cleanEmail,
          password: hashPassword(cleanPassword),
          avatar: avatar || 'assets/avatar_abg.jpg',
          authProvider: 'google',
          deviceIds: clientDeviceId ? [clientDeviceId] : [],
          deviceIps: clientIp ? [clientIp] : [],
          lastIp: clientIp,
          isPaid: isExempt,
          isExempt: isExempt,
          paidAt: isExempt ? new Date().toISOString() : null,
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
        saveDatabase(db);
        if (dbLayer.isMongoConnected()) {
          await dbLayer.createUser(user);
        }
      } else {
        // Existing user logged in successfully: remember device & IP
        if (clientDeviceId) {
          if (!Array.isArray(user.deviceIds)) user.deviceIds = [];
          if (!user.deviceIds.includes(clientDeviceId)) user.deviceIds.push(clientDeviceId);
        }
        if (!Array.isArray(user.deviceIps)) user.deviceIps = [];
        if (clientIp && !user.deviceIps.includes(clientIp)) {
          user.deviceIps.push(clientIp);
        }
        user.lastIp = clientIp;
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
          bioData: user.bioData || db.bios[user.username],
          isPaid: checkUserPaidStatus(user),
          isExempt: isUserPaymentExempt(user.email),
          paidAt: user.paidAt || null
        },
        token
      }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // CHANGE PASSWORD FOR LOGGED IN USER
  if (pathname === '/api/auth/change-password' && req.method === 'POST') {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace(/^Bearer\s+/i, '') || parsedUrl.searchParams?.get('token');
      const db = getDatabase();

      if (!token || !db.sessions[token] || db.sessions[token].expires < Date.now()) {
        res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!' }));
        return;
      }

      const sess = db.sessions[token];
      let user = db.users.find(u => u.id === sess.userId || (u.email && u.email.toLowerCase() === (sess.email || '').toLowerCase()));
      if (!user && dbLayer.isMongoConnected()) {
        user = await dbLayer.findUserById(sess.userId) || (sess.email ? await dbLayer.findUserByEmail(sess.email) : null);
        if (user) {
          db.users.push(user);
          saveDatabase(db);
        }
      }

      if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Không tìm thấy tài khoản người dùng!' }));
        return;
      }

      const { oldPassword, newPassword, confirmPassword } = await parseJsonBody(req);
      const cleanOld = (oldPassword || '').toString().trim();
      const cleanNew = (newPassword || '').toString().trim();
      const cleanConfirm = (confirmPassword || '').toString().trim();

      if (!cleanOld || !cleanNew || !cleanConfirm) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới!' }));
        return;
      }

      if (cleanNew.length < 6) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Mật khẩu mới phải có tối thiểu 6 ký tự!' }));
        return;
      }

      if (cleanNew !== cleanConfirm) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Mật khẩu xác nhận không khớp với mật khẩu mới!' }));
        return;
      }

      const hashedOld = hashPassword(cleanOld);
      if (user.password && user.password !== hashedOld) {
        let matched = false;
        if (dbLayer.isMongoConnected()) {
          const freshUser = await dbLayer.findUserById(user.id) || (user.email ? await dbLayer.findUserByEmail(user.email) : null);
          if (freshUser && freshUser.password === hashedOld) {
            user.password = freshUser.password;
            matched = true;
          }
        }
        if (!matched) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: 'Mật khẩu hiện tại không chính xác! Vui lòng kiểm tra lại.' }));
          return;
        }
      }

      user.password = hashPassword(cleanNew);
      user.updatedAt = new Date().toISOString();
      saveDatabase(db);

      if (dbLayer.isMongoConnected()) {
        await dbLayer.updateUserPassword(user.email || user.username, user.password);
      }

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, message: 'Đổi mật khẩu thành công! Mật khẩu mới đã được lưu an toàn vào hệ thống.' }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // FORGOT PASSWORD: REQUEST OTP VIA GMAIL
  if (pathname === '/api/auth/forgot-password' && req.method === 'POST') {
    try {
      const { email } = await parseJsonBody(req);
      if (!email) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Vui lòng nhập địa chỉ email của bạn!' }));
        return;
      }

      const cleanEmail = email.trim().toLowerCase();
      const db = getDatabase();
      let user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

      if (!user && dbLayer.isMongoConnected()) {
        user = await dbLayer.findUserByEmail(cleanEmail);
        if (user) {
          db.users.push(user);
          saveDatabase(db);
        }
      }

      if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Không tìm thấy tài khoản với địa chỉ email này!' }));
        return;
      }

      // Generate 6-digit OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      if (!db.passwordResets) db.passwordResets = {};
      db.passwordResets[cleanEmail] = {
        code: otpCode,
        expires: Date.now() + 15 * 60 * 1000 // 15 minutes validity
      };
      saveDatabase(db);

      const emailResult = await sendResetEmail(cleanEmail, otpCode, user.name);

      if (!emailResult.sent) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: false,
          error: emailResult.error || 'Không thể gửi email OTP đến hộp thư của bạn. Vui lòng kiểm tra lại cấu hình hoặc thử lại sau!'
        }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        message: 'Mã xác thực 6 số đã được gửi trực tiếp về Gmail của bạn! Vui lòng kiểm tra hộp thư đến (hoặc thư rác Spam).',
        email: cleanEmail
      }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // RESET PASSWORD: VERIFY OTP & UPDATE PASSWORD
  if (pathname === '/api/auth/reset-password' && req.method === 'POST') {
    try {
      const { email, code, newPassword } = await parseJsonBody(req);
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanCode = (code || '').toString().trim();
      const cleanNewPassword = (newPassword || '').toString().trim();

      if (!cleanEmail || !cleanCode || !cleanNewPassword) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Vui lòng nhập đầy đủ email, mã xác thực và mật khẩu mới!' }));
        return;
      }

      if (cleanNewPassword.length < 6) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự!' }));
        return;
      }

      const db = getDatabase();
      const resetRecord = db.passwordResets && db.passwordResets[cleanEmail];

      if (!resetRecord) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Yêu cầu không hợp lệ hoặc bạn chưa yêu cầu mã xác thực!' }));
        return;
      }

      if (Date.now() > resetRecord.expires) {
        delete db.passwordResets[cleanEmail];
        saveDatabase(db);
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Mã xác thực đã hết hạn (quá 15 phút). Vui lòng yêu cầu mã mới!' }));
        return;
      }

      if (resetRecord.code !== cleanCode) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Mã xác thực không chính xác! Vui lòng kiểm tra lại Gmail của bạn.' }));
        return;
      }

      let user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (!user && dbLayer.isMongoConnected()) {
        user = await dbLayer.findUserByEmail(cleanEmail);
        if (user) {
          db.users.push(user);
        }
      }

      if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Không tìm thấy người dùng!' }));
        return;
      }

      // Update password with hash
      user.password = hashPassword(cleanNewPassword);
      user.updatedAt = new Date().toISOString();
      delete db.passwordResets[cleanEmail];
      saveDatabase(db);

      if (dbLayer.isMongoConnected()) {
        await dbLayer.updateUserPassword(cleanEmail, user.password);
      }

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        message: 'Đặt lại mật khẩu thành công! Mật khẩu mới đã được lưu an toàn. Bạn có thể đăng nhập ngay bây giờ.'
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
            bioData: user.bioData || db.bios[user.username] || (user.username && db.bios[user.username.toLowerCase()]) || null,
            isPaid: checkUserPaidStatus(user),
            isExempt: isUserPaymentExempt(user.email),
            paidAt: user.paidAt || null
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
  // API: PAYMENT & ACCOUNT ACTIVATION (5.000 VND MBBANK)
  // -------------------------------------------------------------

  // GET PAYMENT CONFIG & WHITELIST
  if (pathname === '/api/payment/config' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      success: true,
      config: PAYMENT_CONFIG,
      exemptEmails: PAYMENT_EXEMPT_EMAILS
    }));
    return;
  }

  // GET PAYMENT STATUS FOR USER
  if (pathname === '/api/payment/status' && req.method === 'GET') {
    const rawTarget = (parsedUrl.searchParams.get('username') || parsedUrl.searchParams.get('email') || '').toLowerCase();
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const db = getDatabase();

    let user = null;
    if (token && db.sessions[token]) {
      const sess = db.sessions[token];
      user = db.users.find(u => u.id === sess.userId || u.email === sess.email);
    }
    if (!user && rawTarget) {
      user = db.users.find(u => u.username.toLowerCase() === rawTarget || (u.email && u.email.toLowerCase() === rawTarget));
    }

    const isPaid = user ? checkUserPaidStatus(user) : false;
    const isExempt = user ? isUserPaymentExempt(user.email) : false;

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      success: true,
      isPaid,
      isExempt,
      paidAt: user?.paidAt || null
    }));
    return;
  }

  // CONFIRM PAYMENT DONE (ACTIVATES ACCOUNT PERMANENTLY)
  if (pathname === '/api/payment/confirm' && req.method === 'POST') {
    try {
      const { userId, username, email, transactionNote } = await parseJsonBody(req);
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace(/^Bearer\s+/i, '');
      const db = getDatabase();

      let user = null;
      if (token && db.sessions[token]) {
        const sess = db.sessions[token];
        user = db.users.find(u => u.id === sess.userId || u.email === sess.email);
      }
      if (!user && (userId || username || email)) {
        const uId = userId || '';
        const uName = (username || '').toLowerCase();
        const uEmail = (email || '').toLowerCase();
        user = db.users.find(u => 
          (uId && u.id === uId) ||
          (uName && u.username.toLowerCase() === uName) ||
          (uEmail && u.email.toLowerCase() === uEmail)
        );
      }

      if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Không tìm thấy tài khoản để kích hoạt thanh toán!' }));
        return;
      }

      // Mark user as paid permanently
      user.isPaid = true;
      user.paidAt = new Date().toISOString();
      user.paymentTransaction = transactionNote || `BIO ${user.username}`;
      saveDatabase(db);

      try {
        await dbLayer.updateUser(user.id, { isPaid: true, paidAt: user.paidAt });
      } catch (errSync) {
        console.warn('[MongoDB Sync] Payment update note:', errSync.message);
      }

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        message: 'Kích hoạt tài khoản Bio Link thành công! Bạn có thể sử dụng tất cả tính năng trên hệ thống.',
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bioData: user.bioData || db.bios[user.username],
          isPaid: true,
          isExempt: isUserPaymentExempt(user.email),
          paidAt: user.paidAt
        }
      }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
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
        for (const k in db.bios) {
          if (k.toLowerCase() === rawTarget) {
            bio = db.bios[k];
            break;
          }
        }
      }
      if (!bio) {
        const u = db.users.find(usr => (usr.username && usr.username.toLowerCase() === rawTarget) || (usr.email && usr.email.toLowerCase() === rawTarget));
        if (u && u.bioData) bio = u.bioData;
      }
      if (!bio) {
        try {
          bio = await dbLayer.getBioByUsername(rawTarget);
        } catch (_) {}
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

      // Check payment activation requirement
      const user = db.users.find(u => (uemail && u.email.toLowerCase() === uemail) || (uname && u.username.toLowerCase() === uname));
      if (user && !checkUserPaidStatus(user)) {
        res.writeHead(402, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: false,
          requirePayment: true,
          error: 'Tài khoản chưa hoàn tất kích hoạt (5.000 VNĐ). Vui lòng thanh toán để lưu và tạo trang Bio cá nhân!'
        }));
        return;
      }

      // Update in corresponding user FIRST by email (or by username)
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

      // Return immediate response so client gets instant confirmation (<50ms)
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, message: 'Đã lưu trang Bio thành công trên máy chủ!' }));

      // Background sync to dbLayer (non-blocking)
      Promise.resolve().then(() => {
        return dbLayer.saveBioData(uname || (user && user.username), payload);
      }).catch(errSync => {
        console.warn('[MongoDB Sync] Bio sync note:', errSync.message);
      });
      return;
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
      // Clean URL / SPA Fallback: If not an API route and not static media, serve index.html (e.g. /anh09, /abg)
      if (!pathname.startsWith('/api/') && !pathname.startsWith('/uploads/') && !pathname.startsWith('/releases/')) {
        const indexPath = path.join(ROOT_DIR, 'index.html');
        return fs.readFile(indexPath, (readErr, content) => {
          if (!readErr) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(content);
            return;
          }
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('404 Not Found');
        });
      }
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
