/**
 * BIO LINK - JAVASCRIPT APPLICATION CORE (ENHANCED)
 * Handles onboarding wizard, custom local video background uploader,
 * theme engine, canvas particle animations (Rain & Snow), live bio rendering,
 * real dynamic QR Code generation for mobile scanning, and complete multi-user authentication (Google + Email).
 */

// Application State
const state = {
  step: 1,
  totalSteps: 7,
  referral: 'instagram',
  platforms: ['youtube', 'facebook', 'instagram'],
  avatar: 'assets/avatar_abg.jpg',
  name: 'Abg',
  username: 'abg',
  bio: 'Digital Creator & Designer ✨ Chào mừng bạn đến với góc nhỏ của mình!',
  links: [
    { id: 1, title: 'Fb', url: 'https://facebook.com/abg' },
    { id: 2, title: 'Portfolio & Dự án mới', url: 'https://behance.net' }
  ],
  socials: {
    instagram: 'https://instagram.com/abg',
    tiktok: 'https://tiktok.com/@abg',
    youtube: 'https://youtube.com/@abg',
    facebook: 'https://facebook.com/abg',
    twitter: '',
    coffee: '',
    snapchat: '',
    website: ''
  },
  theme: 'rainy_night',
  video: {
    url: null,
    name: '',
    size: '',
    overlay: 40,
    blur: 0,
    muted: true
  }
};

// Network & Server info for QR scanning
let networkInfo = {
  ip: '10.112.194.161',
  port: 3000,
  localUrl: 'http://localhost:3000',
  networkUrl: 'http://10.112.194.161:3000'
};

// Preset Sample Loops (High quality copyright-free webm/mp4 samples)
const PRESET_VIDEOS = {
  video_neon_loop: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-and-skyscrapers-at-night-42416-large.mp4',
  video_galaxy_loop: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1610-large.mp4'
};

// QR Code active state
let currentQrType = 'network'; // 'network', 'local', 'custom'
let currentQrUrl = '';
let qrCodeInstance = null;

// Canvas animation controller
let activeAnimationId = null;
let rainDrops = [];
let snowFlakes = [];

// Authentication State
let currentUser = null;

// DOM Element References
const dom = {
  // Views
  homeSection: document.getElementById('homeSection'),
  wizardSection: document.getElementById('wizardSection'),
  splitStudioSection: document.getElementById('splitStudioSection'),
  publicBioSection: document.getElementById('publicBioSection'),
  navHomeBtn: document.getElementById('navHomeBtn'),
  navWizardBtn: document.getElementById('navWizardBtn'),
  navSplitBtn: document.getElementById('navSplitBtn'),
  navFullBioBtn: document.getElementById('navFullBioBtn'),
  mainHeader: document.getElementById('mainHeader'),
  brandLogoHome: document.getElementById('brandLogoHome'),

  // Homepage Elements
  homeClaimInput: document.getElementById('homeClaimInput'),
  btnClaimHero: document.getElementById('btnClaimHero'),
  btnMegaCtaStart: document.getElementById('btnMegaCtaStart'),
  heroHoloCard: document.getElementById('heroHoloCard'),
  holoGlare: document.getElementById('holoGlare'),
  holoCardVideo: document.getElementById('holoCardVideo'),
  holoCardImage: document.getElementById('holoCardImage'),
  holoCardCanvas: document.getElementById('holoCardCanvas'),
  moodBtns: document.querySelectorAll('.mood-pill-btn'),
  creatorBtns: document.querySelectorAll('.btn-preview-creator'),

  // Header Auth & Profile
  authButtonsGroup: document.getElementById('authButtonsGroup'),
  btnOpenLogin: document.getElementById('btnOpenLogin'),
  btnOpenRegister: document.getElementById('btnOpenRegister'),
  userProfileContainer: document.getElementById('userProfileContainer'),
  userProfileBtn: document.getElementById('userProfileBtn'),
  userProfileDropdown: document.getElementById('userProfileDropdown'),
  headerUserEmail: document.getElementById('headerUserEmail'),
  headerAvatarImg: document.getElementById('headerAvatarImg'),
  dropdownUserName: document.getElementById('dropdownUserName'),
  dropdownUserEmail: document.getElementById('dropdownUserEmail'),
  dropdownUserSlug: document.getElementById('dropdownUserSlug'),
  dropdownMyBioLink: document.getElementById('dropdownMyBioLink'),
  dropdownCopyLinkBtn: document.getElementById('dropdownCopyLinkBtn'),
  dropdownSwitchAccountBtn: document.getElementById('dropdownSwitchAccountBtn'),
  dropdownChangePasswordBtn: document.getElementById('dropdownChangePasswordBtn'),
  dropdownLogoutBtn: document.getElementById('dropdownLogoutBtn'),

  // Wizard Navigation
  wizardProgressBar: document.getElementById('wizardProgressBar'),
  stepCounterText: document.getElementById('stepCounterText'),
  wizardBackBtn: document.getElementById('wizardBackBtn'),
  slides: document.querySelectorAll('.wizard-slide'),

  // Step 1
  referralOptionList: document.getElementById('referralOptionList'),

  // Step 2
  platformSelectList: document.getElementById('platformSelectList'),
  step2ContinueBtn: document.getElementById('step2ContinueBtn'),

  // Step 3
  avatarDropZone: document.getElementById('avatarDropZone'),
  avatarFileInput: document.getElementById('avatarFileInput'),
  avatarPreviewImg: document.getElementById('avatarPreviewImg'),
  presetChips: document.querySelectorAll('.preset-avatar-chips .chip-btn'),
  step3ContinueBtn: document.getElementById('step3ContinueBtn'),

  // Step 4
  userNameInput: document.getElementById('userNameInput'),
  userSlugInput: document.getElementById('userSlugInput'),
  step4SlugPreview: document.getElementById('step4SlugPreview'),
  slugDynamicText: document.getElementById('slugDynamicText'),
  userBioInput: document.getElementById('userBioInput'),
  bioCharCounter: document.getElementById('bioCharCounter'),
  step4ContinueBtn: document.getElementById('step4ContinueBtn'),

  // Step 5
  customLinksList: document.getElementById('customLinksList'),
  addMoreLinkBtn: document.getElementById('addMoreLinkBtn'),
  socialInputsContainer: document.getElementById('socialInputsContainer'),
  step5ContinueBtn: document.getElementById('step5ContinueBtn'),

  // Step 6: Custom Video & Themes
  customVideoCard: document.getElementById('customVideoCard'),
  userVideoFileInput: document.getElementById('userVideoFileInput'),
  videoDropArea: document.getElementById('videoDropArea'),
  videoEmptyState: document.getElementById('videoEmptyState'),
  videoLoadedState: document.getElementById('videoLoadedState'),
  miniVideoPreview: document.getElementById('miniVideoPreview'),
  loadedVideoName: document.getElementById('loadedVideoName'),
  loadedVideoSize: document.getElementById('loadedVideoSize'),
  btnChangeVideo: document.getElementById('btnChangeVideo'),
  overlaySlider: document.getElementById('overlaySlider'),
  overlayValueText: document.getElementById('overlayValueText'),
  blurSlider: document.getElementById('blurSlider'),
  blurValueText: document.getElementById('blurValueText'),
  videoMuteToggle: document.getElementById('videoMuteToggle'),
  themeGrid: document.getElementById('themeGrid'),
  step6ContinueBtn: document.getElementById('step6ContinueBtn'),

  // Step 7: Phone Mockup
  phonePreviewViewport: document.getElementById('phonePreviewViewport'),
  phoneBgVideo: document.getElementById('phoneBgVideo'),
  phoneBgImage: document.getElementById('phoneBgImage'),
  phoneRainCanvas: document.getElementById('phoneRainCanvas'),
  phoneDarkOverlay: document.getElementById('phoneDarkOverlay'),
  phoneAvatarImg: document.getElementById('phoneAvatarImg'),
  phoneUserName: document.getElementById('phoneUserName'),
  phoneUserBio: document.getElementById('phoneUserBio'),
  phoneLinksContainer: document.getElementById('phoneLinksContainer'),
  phoneSocialRow: document.getElementById('phoneSocialRow'),
  btnWizardSaveBio: document.getElementById('btnWizardSaveBio'),
  btnOpenFullScreenBio: document.getElementById('btnOpenFullScreenBio'),
  btnCopyBioLink: document.getElementById('btnCopyBioLink'),
  btnShowQrCode: document.getElementById('btnShowQrCode'),
  btnBackToEdit: document.getElementById('btnBackToEdit'),

  // Ambient Background Elements
  ambientBackground: document.getElementById('ambientBackground'),
  bgVideo: document.getElementById('bgVideo'),
  bgImageLayer: document.getElementById('bgImageLayer'),
  ambientEffectCanvas: document.getElementById('ambientEffectCanvas'),
  bgOverlay: document.getElementById('bgOverlay'),

  // Fullscreen Public View
  publicAvatarImg: document.getElementById('publicAvatarImg'),
  publicUserName: document.getElementById('publicUserName'),
  publicUserBio: document.getElementById('publicUserBio'),
  publicSocialIconsRow: document.getElementById('publicSocialIconsRow'),
  publicLinksList: document.getElementById('publicLinksList'),
  btnExitPublicBio: document.getElementById('btnExitPublicBio'),
  btnSavePublicBio: document.getElementById('btnSavePublicBio'),
  btnFloatingVideoUpload: document.getElementById('btnFloatingVideoUpload'),
  btnToggleAudio: document.getElementById('btnToggleAudio'),
  audioIconSvg: document.getElementById('audioIconSvg'),
  quickUploadVideoBtn: document.getElementById('quickUploadVideoBtn'),

  // Studio Split
  studioPaneContainer: document.getElementById('studioPaneContainer'),
  studioPhoneMockupSlot: document.getElementById('studioPhoneMockupSlot'),
  btnStudioSaveBio: document.getElementById('btnStudioSaveBio'),
  btnStudioViewBio: document.getElementById('btnStudioViewBio'),

  // Upgraded QR Modal
  qrModal: document.getElementById('qrModal'),
  btnCloseQrModal: document.getElementById('btnCloseQrModal'),
  qrCanvasWrapper: document.getElementById('qrCanvasWrapper'),
  qrDisplayUrl: document.getElementById('qrDisplayUrl'),
  btnCopyQrUrl: document.getElementById('btnCopyQrUrl'),
  btnDownloadQr: document.getElementById('btnDownloadQr'),
  btnOpenDirectLink: document.getElementById('btnOpenDirectLink'),
  qrCustomUrlWrapper: document.getElementById('qrCustomUrlWrapper'),
  qrCustomUrlInput: document.getElementById('qrCustomUrlInput'),
  qrTabBtns: document.querySelectorAll('.qr-tab-btn'),

  // Auth Modal & Forms
  authModal: document.getElementById('authModal'),
  btnCloseAuthModal: document.getElementById('btnCloseAuthModal'),
  tabBtnLogin: document.getElementById('tabBtnLogin'),
  tabBtnRegister: document.getElementById('tabBtnRegister'),
  loginForm: document.getElementById('loginForm'),
  registerForm: document.getElementById('registerForm'),
  btnGoogleSignIn: document.getElementById('btnGoogleSignIn'),
  gsiButtonContainer: document.getElementById('gsiButtonContainer'),
  loginIdentifier: document.getElementById('loginIdentifier'),
  loginPassword: document.getElementById('loginPassword'),
  regFullName: document.getElementById('regFullName'),
  regUsername: document.getElementById('regUsername'),
  regEmail: document.getElementById('regEmail'),
  regPassword: document.getElementById('regPassword'),
  regConfirmPassword: document.getElementById('regConfirmPassword'),
  pwdStrengthFill: document.getElementById('pwdStrengthFill'),
  pwdStrengthLabel: document.getElementById('pwdStrengthLabel'),
  slugPreview: document.getElementById('slugPreview'),
  authRequireBanner: document.getElementById('authRequireBanner'),
  authRequireBannerText: document.getElementById('authRequireBannerText'),

  // Device remembered accounts
  deviceRememberedBox: document.getElementById('deviceRememberedBox'),
  deviceAccountsList: document.getElementById('deviceAccountsList'),

  // Google Modal
  googleAuthModal: document.getElementById('googleAuthModal'),
  googleDeviceAccountsContainer: document.getElementById('googleDeviceAccountsContainer'),
  btnCancelGoogleAuth: document.getElementById('btnCancelGoogleAuth'),
  btnToggleOtherGoogle: document.getElementById('btnToggleOtherGoogle'),
  otherGoogleForm: document.getElementById('otherGoogleForm'),
  customGoogleName: document.getElementById('customGoogleName'),
  customGoogleEmail: document.getElementById('customGoogleEmail'),
  customGooglePassword: document.getElementById('customGooglePassword'),
  btnConfirmOtherGoogle: document.getElementById('btnConfirmOtherGoogle'),

  // Forgot Password
  btnForgotPwd: document.getElementById('btnForgotPwd'),
  forgotPasswordModal: document.getElementById('forgotPasswordModal'),
  btnCloseForgotModal: document.getElementById('btnCloseForgotModal'),
  forgotStepEmail: document.getElementById('forgotStepEmail'),
  forgotEmailForm: document.getElementById('forgotEmailForm'),
  forgotInputEmail: document.getElementById('forgotInputEmail'),
  btnSendForgotOtp: document.getElementById('btnSendForgotOtp'),
  forgotStepReset: document.getElementById('forgotStepReset'),
  sentEmailLabel: document.getElementById('sentEmailLabel'),
  forgotResetForm: document.getElementById('forgotResetForm'),
  forgotOtpCode: document.getElementById('forgotOtpCode'),
  forgotNewPassword: document.getElementById('forgotNewPassword'),
  forgotConfirmNewPassword: document.getElementById('forgotConfirmNewPassword'),
  btnConfirmResetPassword: document.getElementById('btnConfirmResetPassword'),
  btnResendForgotOtp: document.getElementById('btnResendForgotOtp'),
  btnBackToStep1: document.getElementById('btnBackToStep1'),

  // Change Password Modal
  changePasswordModal: document.getElementById('changePasswordModal'),
  btnCloseChangePasswordModal: document.getElementById('btnCloseChangePasswordModal'),
  changePasswordForm: document.getElementById('changePasswordForm'),
  inputOldPassword: document.getElementById('inputOldPassword'),
  inputNewPassword: document.getElementById('inputNewPassword'),
  inputConfirmNewPassword: document.getElementById('inputConfirmNewPassword'),
  btnSubmitChangePassword: document.getElementById('btnSubmitChangePassword'),

  // Payment Activation Modal
  paymentModal: document.getElementById('paymentModal'),
  paymentQrImage: document.getElementById('paymentQrImage'),
  payBankName: document.getElementById('payBankName'),
  payAccountName: document.getElementById('payAccountName'),
  payAccountNumber: document.getElementById('payAccountNumber'),
  payAmount: document.getElementById('payAmount'),
  paySyntax: document.getElementById('paySyntax'),
  btnCopyAccountNum: document.getElementById('btnCopyAccountNum'),
  btnCopyAmount: document.getElementById('btnCopyAmount'),
  btnCopySyntax: document.getElementById('btnCopySyntax'),
  btnConfirmPaymentDone: document.getElementById('btnConfirmPaymentDone'),
  btnLogoutFromPayment: document.getElementById('btnLogoutFromPayment'),

  // Toast
  toastNotification: document.getElementById('toastNotification'),
  toastMessage: document.getElementById('toastMessage')
};

// Pending claim handle for unauthenticated users
let pendingClaimHandle = null;

/* ==========================================================================
   HELPER: NORMALIZE EXTERNAL URL TO PREVENT 404
   ========================================================================== */

function normalizeExternalUrl(rawUrl) {
  if (!rawUrl) return '#';
  let url = rawUrl.trim();
  if (!url || url === '#' || url === 'javascript:void(0);') return '#';

  // Handle phone numbers for Zalo: e.g. 0912345678 -> https://zalo.me/0912345678
  if (/^[0-9+ ]{9,15}$/.test(url)) {
    return `https://zalo.me/${url.replace(/\s+/g, '')}`;
  }

  // If already starts with a protocol
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(url)) {
    return url;
  }

  // If starts with // (protocol-relative)
  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  // Prepend https://
  return `https://${url}`;
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  fetchNetworkInfo();
  initAuthSystem();
  initIndexedDB();
  bindEvents();
  renderWizardStep(state.step);
  applyTheme(state.theme);
  updatePhonePreview();
  updatePublicBioView();
  initCanvasEffects();
  initHoloCardShowcase();
  const openedPublic = checkUrlParamsForPublicBio();
  if (!openedPublic) {
    switchMainView('home');
  }
});

/* ==========================================================================
   NETWORK INFO (FOR SCANNABLE MOBILE QR CODES)
   ========================================================================== */

function fetchNetworkInfo() {
  fetch('/api/network-info')
    .then(res => res.json())
    .then(data => {
      if (data && data.ip) {
        networkInfo = data;
      }
    })
    .catch(() => {
      // Fallback: Use window location hostname
      networkInfo.ip = window.location.hostname;
      networkInfo.networkUrl = window.location.origin;
    });
}

/* ==========================================================================
   AUTHENTICATION & SERVER PERSISTENCE
   ========================================================================== */

function getCleanDefaultBio(user = null) {
  const fallbackUsername = user?.email ? user.email.split('@')[0].replace(/[^a-z0-9_\-]/g, '') : 'user';
  const username = user?.username || fallbackUsername;
  const name = user?.name || (username.charAt(0).toUpperCase() + username.slice(1));
  const avatar = user?.avatar || 'assets/avatar_abg.jpg';

  return {
    name: name,
    username: username,
    email: user?.email || '',
    bio: user ? `Chào mừng bạn đến với trang Bio của ${name}!` : 'Digital Creator & Designer ✨ Chào mừng bạn đến với góc nhỏ của mình!',
    avatar: avatar,
    theme: 'rainy_night',
    links: [],
    socials: {
      instagram: '',
      tiktok: '',
      youtube: '',
      facebook: '',
      twitter: '',
      coffee: '',
      snapchat: '',
      website: ''
    },
    video: {
      url: null,
      name: '',
      size: '',
      overlay: 40,
      blur: 0,
      muted: true
    }
  };
}

function resetStateToUser(user = null, bioData = null) {
  const defaults = getCleanDefaultBio(user);
  const src = bioData || user?.bioData || defaults;

  state.step = 1;
  state.name = src.name || defaults.name;

  let u = src.username || defaults.username;
  // If user changed their name from default (e.g. to 'anh01') but slug is still 'abg', auto-upgrade slug!
  if (state.name && state.name.toLowerCase() !== 'abg' && (!u || u === 'abg')) {
    const slugFromName = state.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_\-]/g, '');
    if (slugFromName) {
      u = slugFromName;
      if (currentUser && user && (currentUser.id === user.id || currentUser.email === user.email)) {
        currentUser.username = u;
        localStorage.setItem('biolink_current_user', JSON.stringify(currentUser));
      }
    }
  }
  state.username = u;

  state.bio = src.bio !== undefined ? src.bio : defaults.bio;
  state.avatar = src.avatar || defaults.avatar;
  state.theme = src.theme || defaults.theme;

  // Strict links reset: Never retain previous user's links
  if (Array.isArray(src.links) && src.links.length > 0) {
    state.links = src.links.map((l, i) => ({
      id: l.id || (Date.now() + i),
      title: l.title || 'Liên kết',
      url: normalizeExternalUrl(l.url || '#')
    }));
  } else {
    state.links = [];
  }

  // Strict socials reset: Never retain previous user's socials
  const s = src.socials || {};
  state.socials = {
    instagram: normalizeExternalUrl(s.instagram || ''),
    tiktok: normalizeExternalUrl(s.tiktok || ''),
    youtube: normalizeExternalUrl(s.youtube || ''),
    facebook: normalizeExternalUrl(s.facebook || ''),
    twitter: normalizeExternalUrl(s.twitter || ''),
    coffee: normalizeExternalUrl(s.coffee || ''),
    snapchat: normalizeExternalUrl(s.snapchat || ''),
    website: normalizeExternalUrl(s.website || '')
  };

  // Strict video reset: If src has no video url, completely stop & clear video
  if (src.video && src.video.url) {
    state.video = {
      url: src.video.url,
      name: src.video.name || 'custom_video.mp4',
      size: src.video.size || '',
      overlay: src.video.overlay !== undefined ? src.video.overlay : 40,
      blur: src.video.blur !== undefined ? src.video.blur : 0,
      muted: src.video.muted !== undefined ? src.video.muted : true
    };
    if (dom.miniVideoPreview) {
      dom.miniVideoPreview.src = state.video.url;
      dom.miniVideoPreview.muted = true;
      dom.miniVideoPreview.volume = 0;
      dom.miniVideoPreview.load();
      dom.miniVideoPreview.play().catch(() => {});
    }
    if (dom.loadedVideoName) dom.loadedVideoName.textContent = state.video.name;
    if (dom.loadedVideoSize) dom.loadedVideoSize.textContent = `${state.video.size || ''}`;
    if (dom.videoEmptyState) dom.videoEmptyState.classList.add('hidden');
    if (dom.videoLoadedState) dom.videoLoadedState.classList.remove('hidden');
  } else {
    state.video = {
      url: null,
      name: '',
      size: '',
      overlay: 40,
      blur: 0,
      muted: true
    };
    if (dom.miniVideoPreview) {
      dom.miniVideoPreview.pause();
      dom.miniVideoPreview.removeAttribute('src');
      dom.miniVideoPreview.load();
    }
    if (dom.loadedVideoName) dom.loadedVideoName.textContent = '';
    if (dom.loadedVideoSize) dom.loadedVideoSize.textContent = '';
    if (dom.videoEmptyState) dom.videoEmptyState.classList.remove('hidden');
    if (dom.videoLoadedState) dom.videoLoadedState.classList.add('hidden');
  }

  // Update input fields in wizard / studio
  if (dom.userNameInput) dom.userNameInput.value = state.name;
  if (dom.userSlugInput) dom.userSlugInput.value = state.username || 'user';
  if (dom.step4SlugPreview) dom.step4SlugPreview.textContent = `/${state.username || 'user'}`;
  if (dom.slugDynamicText) dom.slugDynamicText.textContent = state.username || 'user';
  if (dom.userBioInput) dom.userBioInput.value = state.bio;
  if (dom.avatarPreviewImg) dom.avatarPreviewImg.src = state.avatar;
  if (dom.bioCharCounter) dom.bioCharCounter.textContent = `${state.bio.length}/255`;

  applyTheme(state.theme);
  updatePhonePreview();
  updatePublicBioView();
}

function initAuthSystem() {
  // Synchronous instant load from localStorage to ensure currentUser is ready immediately
  const savedUserJson = localStorage.getItem('biolink_current_user');
  if (savedUserJson) {
    try {
      currentUser = JSON.parse(savedUserJson);
      if (currentUser && currentUser.bioData) {
        resetStateToUser(currentUser, currentUser.bioData);
      }
      updateAuthUI();
    } catch (e) {
      currentUser = null;
    }
  }

  const token = localStorage.getItem('biolink_token');
  if (token) {
    // Verify token with server
    fetch(`/api/auth/me?token=${encodeURIComponent(token)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(res => {
        if (res.success && res.user) {
          currentUser = res.user;
          localStorage.setItem('biolink_current_user', JSON.stringify(currentUser));
          updateAuthUI();

          const params = new URLSearchParams(window.location.search);
          const uParam = params.get('u');
          const pSlug = window.location.pathname.replace(/^\/+|\/+$/g, '').replace(/^@/, '');
          const targetU = uParam || pSlug;
          // If no specific other user target in URL or URL matches current user
          if (!targetU || targetU.toLowerCase() === currentUser.username.toLowerCase()) {
            resetStateToUser(currentUser, currentUser.bioData);
            window.history.replaceState({ username: currentUser.username }, '', `/${encodeURIComponent(currentUser.username)}`);
            applyTheme(currentUser.bioData ? currentUser.bioData.theme : state.theme, currentUser.bioData);
            updatePublicBioView(currentUser.bioData, true);
          }

          // Check payment activation status
          checkAndEnforcePayment(currentUser);
        } else {
          // Token expired or invalid
          localStorage.removeItem('biolink_token');
          currentUser = null;
          updateAuthUI();
        }
      })
      .catch(() => {
        // Network fallback
        if (currentUser && currentUser.bioData) {
          resetStateToUser(currentUser, currentUser.bioData);
        }
        updateAuthUI();
      });
  } else {
    // Guest mode - not logged in
    currentUser = null;
    updateAuthUI();
  }

  // Khởi tạo Google Identity Services qua trình duyệt
  initGoogleIdentityServices();
}

async function initGoogleIdentityServices() {
  try {
    const res = await fetch('/api/auth/google-config');
    const data = await res.json();
    const clientId = data && data.clientId;
    if (clientId && window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false
      });
      if (dom.gsiButtonContainer) {
        window.google.accounts.id.renderButton(dom.gsiButtonContainer, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with'
        });
        dom.gsiButtonContainer.style.display = 'flex';
        if (dom.btnGoogleSignIn) dom.btnGoogleSignIn.style.display = 'none';
      }
      // Attempt One Tap prompt for logged-in Google users
      window.google.accounts.id.prompt();
    }
  } catch (err) {
    console.warn('[GSI] Khởi tạo Google Identity:', err.message);
  }
}

async function handleGoogleCredentialResponse(response) {
  if (!response || !response.credential) return;
  showToast('Đang đăng nhập bằng tài khoản Google...');
  try {
    const devId = getOrCreateDeviceId();
    const res = await fetch('/api/auth/google-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': devId
      },
      body: JSON.stringify({ credential: response.credential, deviceId: devId })
    });
    const data = await res.json();
    if (!data.success) {
      alert(data.error || 'Đăng nhập Google thất bại!');
      return;
    }
    loginUser(data.user, data.token);
    if (data.user.bioData) {
      showMyPublicBio();
      showToast(`Chào mừng ${data.user.name}! Đã kết nối Google.`);
    } else {
      switchMainView('wizard');
      goToStep(1);
    }
  } catch (e) {
    console.error('Google token auth error:', e);
    alert('Không thể kết nối đến máy chủ. Vui lòng thử lại!');
  }
}

function updateAuthUI() {
  if (currentUser) {
    // Logged in
    dom.authButtonsGroup.classList.add('hidden-auth');
    dom.userProfileContainer.classList.remove('hidden-auth');
    dom.headerUserEmail.textContent = currentUser.email;
    dom.headerAvatarImg.src = currentUser.avatar || 'assets/avatar_abg.jpg';
    dom.dropdownUserName.textContent = currentUser.name || 'Người dùng';
    dom.dropdownUserEmail.textContent = currentUser.email;
    dom.dropdownUserSlug.textContent = `biolink.me/${currentUser.username || 'user'}`;
    state.username = currentUser.username || 'user';
  } else {
    // Logged out / Guest
    dom.authButtonsGroup.classList.remove('hidden-auth');
    dom.userProfileContainer.classList.add('hidden-auth');
    dom.userProfileDropdown.classList.add('hidden-dropdown');
  }
}

function openAuthModal(mode = 'login', reasonMessage = null) {
  if (dom.authRequireBanner) {
    if (reasonMessage) {
      dom.authRequireBanner.classList.remove('hidden');
      if (dom.authRequireBannerText) dom.authRequireBannerText.textContent = reasonMessage;
    } else {
      dom.authRequireBanner.classList.add('hidden');
    }
  }

  if (mode === 'register') {
    dom.tabBtnLogin.classList.remove('active');
    dom.tabBtnRegister.classList.add('active');
    dom.loginForm.classList.add('hidden');
    dom.registerForm.classList.remove('hidden');
  } else {
    dom.tabBtnLogin.classList.add('active');
    dom.tabBtnRegister.classList.remove('active');
    dom.loginForm.classList.remove('hidden');
    dom.registerForm.classList.add('hidden');
    renderDeviceSuggestedAccounts();
  }
  dom.authModal.classList.remove('hidden-modal');
}

function closeAuthModal() {
  dom.authModal.classList.add('hidden-modal');
}

function getOrCreateDeviceId() {
  try {
    let devId = localStorage.getItem('biolink_device_id');
    if (!devId) {
      devId = 'dev_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem('biolink_device_id', devId);
    }
    return devId;
  } catch (e) {
    return 'dev_fallback';
  }
}

function rememberAccountOnDevice(userData) {
  if (!userData || (!userData.email && !userData.username)) return;
  try {
    let accounts = JSON.parse(localStorage.getItem('biolink_known_accounts') || '[]');
    if (!Array.isArray(accounts)) accounts = [];
    accounts = accounts.filter(a => 
      (a.email && userData.email && a.email.toLowerCase() !== userData.email.toLowerCase()) ||
      (a.username && userData.username && a.username.toLowerCase() !== userData.username.toLowerCase())
    );
    accounts.unshift({
      name: userData.name || userData.username,
      username: userData.username,
      email: userData.email,
      avatar: userData.avatar || 'assets/avatar_abg.jpg'
    });
    if (accounts.length > 5) accounts = accounts.slice(0, 5);
    localStorage.setItem('biolink_known_accounts', JSON.stringify(accounts));
    renderDeviceSuggestedAccounts();
  } catch (e) {}
}

async function renderDeviceSuggestedAccounts() {
  let accounts = [];
  try {
    const local = JSON.parse(localStorage.getItem('biolink_known_accounts') || '[]');
    if (Array.isArray(local)) accounts.push(...local);
  } catch (e) {}

  try {
    const devId = getOrCreateDeviceId();
    const res = await fetch(`/api/auth/suggested-accounts?deviceId=${encodeURIComponent(devId)}`, {
      headers: { 'x-device-id': devId }
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.accounts)) {
      for (const s of data.accounts) {
        if (!accounts.some(a => (a.email && s.email && a.email.toLowerCase() === s.email.toLowerCase()) || (a.username && s.username && a.username.toLowerCase() === s.username.toLowerCase()))) {
          accounts.push(s);
        }
      }
    }
  } catch (err) {
    console.warn('Cannot fetch suggested accounts for device:', err);
  }

  // Deduplicate
  const uniqueAccounts = [];
  const seenKeys = new Set();
  for (const acc of accounts) {
    const key = (acc.email || acc.username || '').toLowerCase();
    if (key && !seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueAccounts.push(acc);
    }
  }

  // Render into login form
  if (dom.deviceRememberedBox && dom.deviceAccountsList) {
    if (uniqueAccounts.length > 0) {
      dom.deviceRememberedBox.classList.remove('hidden');
      dom.deviceAccountsList.innerHTML = uniqueAccounts.map(acc => `
        <div class="device-account-chip" data-identifier="${acc.email || acc.username}">
          <div class="device-acc-avatar">
            ${acc.avatar ? `<img src="${acc.avatar}" alt="${acc.name}">` : `<span>${(acc.name || 'U').charAt(0).toUpperCase()}</span>`}
          </div>
          <div class="device-acc-info">
            <span class="device-acc-name">${acc.name}</span>
            <span class="device-acc-sub">${acc.email || ('@' + acc.username)}</span>
          </div>
          <span class="device-acc-badge">Máy này</span>
        </div>
      `).join('');

      dom.deviceAccountsList.querySelectorAll('.device-account-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          dom.deviceAccountsList.querySelectorAll('.device-account-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          const idVal = chip.getAttribute('data-identifier');
          dom.loginIdentifier.value = idVal;
          dom.loginPassword.focus();
          showToast('Vui lòng nhập mật khẩu tài khoản để đăng nhập an toàn.');
        });
      });
    } else {
      dom.deviceRememberedBox.classList.add('hidden');
      dom.deviceAccountsList.innerHTML = '';
    }
  }

  // Render into Google Modal
  if (dom.googleDeviceAccountsContainer) {
    if (uniqueAccounts.length > 0) {
      dom.googleDeviceAccountsContainer.innerHTML = uniqueAccounts.map(acc => `
        <button type="button" class="google-acc-item" data-email="${acc.email}" data-name="${acc.name}" data-avatar="${acc.avatar || ''}">
          <div class="acc-avatar-circle">
            <span>${(acc.name || 'G').charAt(0).toUpperCase()}</span>
          </div>
          <div class="acc-details">
            <span class="acc-name">${acc.name}</span>
            <span class="acc-email">${acc.email}</span>
          </div>
          <span class="acc-badge">Máy này</span>
        </button>
      `).join('');

      dom.googleDeviceAccountsContainer.querySelectorAll('.google-acc-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const email = btn.getAttribute('data-email');
          const name = btn.getAttribute('data-name');
          const avatar = btn.getAttribute('data-avatar');
          executeGoogleLogin(email, name, avatar);
        });
      });
    } else {
      dom.googleDeviceAccountsContainer.innerHTML = '';
    }
  }
}

async function executeGoogleLogin(email, name = '', avatar = '') {
  if (!email || !email.includes('@')) {
    alert('Vui lòng nhập địa chỉ email Google hợp lệ!');
    return;
  }
  showToast('Đang kết nối tài khoản Google qua trình duyệt...');
  try {
    const devId = getOrCreateDeviceId();
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': devId
      },
      body: JSON.stringify({
        name: name || email.split('@')[0],
        email,
        avatar,
        deviceId: devId
      })
    });
    const data = await res.json();
    if (!data.success) {
      alert(data.error || 'Đăng nhập Google thất bại!');
      return;
    }

    loginUser(data.user, data.token);
    if (data.user.bioData) {
      showMyPublicBio();
      showToast(`Chào mừng ${data.user.name}! Đã đăng nhập an toàn bằng Google.`);
    } else {
      switchMainView('wizard');
      goToStep(1);
    }
  } catch (err) {
    console.error('Google login error:', err);
    alert('Không thể kết nối đến máy chủ. Vui lòng thử lại!');
  }
}

function loginUser(userData, token = null) {
  currentUser = userData;
  if (token) {
    localStorage.setItem('biolink_token', token);
  }
  localStorage.setItem('biolink_current_user', JSON.stringify(currentUser));
  rememberAccountOnDevice(currentUser);
  updateAuthUI();

  // Reset memory state completely to this user's data (prevents cross-account contamination)
  resetStateToUser(userData, userData.bioData);

  // Sync browser URL to this logged-in account
  const newUrl = `/${encodeURIComponent(userData.username)}`;
  window.history.replaceState({ username: userData.username }, '', newUrl);

  closeAuthModal();
  closeGoogleModal();
  updatePhonePreview();
  updatePublicBioView();
  showToast(`Xin chào ${userData.name || userData.email}! Đăng nhập thành công.`);
  checkAndEnforcePayment(currentUser);
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem('biolink_token');
  localStorage.removeItem('biolink_current_user');

  // Clean state completely back to guest default
  resetStateToUser(null, null);

  // Reset URL query parameters
  window.history.replaceState(null, '', '/');

  updateAuthUI();
  switchMainView('home');
  showToast('Đã đăng xuất khỏi tài khoản.');
}

function loadUserBioData(bioData) {
  if (!bioData) return;
  resetStateToUser(currentUser, bioData);
}

function showMyPublicBio() {
  if (!currentUser) {
    openAuthModal('login', '🔒 Vui lòng đăng nhập để xem trang Bio công khai của bạn!');
    return;
  }
  // Ensure current user's bio is loaded cleanly
  resetStateToUser(currentUser, currentUser.bioData);

  // Sync browser URL to this user's username
  const u = currentUser.username || state.username || 'user';
  const newUrl = `/${encodeURIComponent(u)}`;
  window.history.replaceState({ username: u }, '', newUrl);

  // Switch to public bio view
  switchMainView('public');
}

async function saveCurrentBioToUserAsync(showSuccessFeedback = true, btnElem = null) {
  if (!currentUser) {
    openAuthModal('login', '🔒 Vui lòng đăng nhập để lưu thay đổi trang Bio của bạn!');
    return false;
  }

  // Visual button spinner if button passed
  let originalBtnHtml = '';
  if (btnElem) {
    originalBtnHtml = btnElem.innerHTML;
    btnElem.disabled = true;
    btnElem.innerHTML = `
      <svg class="spin-animation" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
      <span>Đang lưu...</span>
    `;
  }

  try {
    // 1. Sync any active form inputs into state before saving
    if (dom.userNameInput && dom.userNameInput.value) state.name = dom.userNameInput.value.trim();
    if (dom.userBioInput) state.bio = dom.userBioInput.value;
    if (dom.userSlugInput && dom.userSlugInput.value) {
      state.username = dom.userSlugInput.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    }

    const studioName = document.getElementById('studioNameInput');
    if (studioName && studioName.value) state.name = studioName.value.trim();
    const studioBio = document.getElementById('studioBioInput');
    if (studioBio) state.bio = studioBio.value;

    const targetUsername = (state.username || currentUser.username || 'user').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    state.username = targetUsername;

    const bioPayload = {
      name: state.name || currentUser.name || targetUsername,
      username: targetUsername,
      email: currentUser.email,
      bio: state.bio !== undefined ? state.bio : '',
      avatar: state.avatar || currentUser.avatar || 'assets/avatar_abg.jpg',
      theme: state.theme || 'rainy_night',
      links: (state.links || []).map((l, i) => ({
        id: l.id || (Date.now() + i),
        title: (l.title || '').trim() || 'Liên kết',
        url: normalizeExternalUrl(l.url || '#')
      })),
      socials: {
        instagram: normalizeExternalUrl(state.socials.instagram || ''),
        tiktok: normalizeExternalUrl(state.socials.tiktok || ''),
        youtube: normalizeExternalUrl(state.socials.youtube || ''),
        facebook: normalizeExternalUrl(state.socials.facebook || '')
      },
      video: {
        url: state.video.url || "",
        name: state.video.name || "",
        size: state.video.size || "",
        overlay: state.video.overlay !== undefined ? state.video.overlay : 40,
        blur: state.video.blur !== undefined ? state.video.blur : 0,
        muted: state.video.muted !== undefined ? state.video.muted : true
      }
    };

    // 2. Safely update memory and local storage
    currentUser.username = targetUsername;
    currentUser.name = bioPayload.name;
    currentUser.avatar = bioPayload.avatar;
    currentUser.bioData = bioPayload;
    try {
      localStorage.setItem('biolink_current_user', JSON.stringify(currentUser));
    } catch (lsErr) {
      console.warn('LocalStorage save warning:', lsErr);
    }

    // 3. Safely update local database
    try {
      const db = getUsersDatabase();
      if (currentUser.email && db[currentUser.email.toLowerCase()]) {
        db[currentUser.email.toLowerCase()].username = targetUsername;
        db[currentUser.email.toLowerCase()].name = bioPayload.name;
        db[currentUser.email.toLowerCase()].avatar = bioPayload.avatar;
        db[currentUser.email.toLowerCase()].bioData = bioPayload;
        saveUsersDatabase(db);
      }
    } catch (dbErr) {
      console.warn('Local users DB save warning:', dbErr);
    }

    // 4. Send to server with 6s timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    let res;
    try {
      res = await fetch('/api/save-bio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('biolink_token') || ''}`
        },
        body: JSON.stringify(bioPayload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      console.warn('Network save timeout or error, local copy saved:', fetchErr);
      // Even if network timed out, local changes are intact!
      updatePublicBioView(bioPayload, true);
      updatePhonePreview();
      if (btnElem) {
        btnElem.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span style="color: #34d399; font-weight: 700;">Đã lưu cục bộ!</span>
        `;
        setTimeout(() => {
          btnElem.innerHTML = originalBtnHtml;
          btnElem.disabled = false;
        }, 2000);
      }
      if (showSuccessFeedback) {
        showToast('Đã lưu thay đổi vào trình duyệt của bạn (Máy chủ phản hồi chậm).');
      }
      return true;
    }

    const data = await res.json();

    if (!data.success) {
      if (data.requirePayment) {
        checkAndEnforcePayment(currentUser);
      } else {
        showToast(`❌ ${data.error || 'Lỗi khi lưu trang Bio'}`);
      }
      if (btnElem) {
        btnElem.innerHTML = originalBtnHtml;
        btnElem.disabled = false;
      }
      return false;
    }

    // Update Views
    updatePublicBioView(bioPayload, true);
    updatePhonePreview();

    // Sync clean URL
    const cleanUrl = `/${encodeURIComponent(targetUsername)}`;
    if (window.location.pathname !== cleanUrl || window.location.search.includes('u=')) {
      window.history.replaceState({ username: targetUsername }, '', cleanUrl);
    }

    // Update Slug & QR display
    if (dom.step4SlugPreview) dom.step4SlugPreview.textContent = `/${targetUsername}`;
    if (dom.slugDynamicText) dom.slugDynamicText.textContent = targetUsername;
    if (dom.qrDisplayUrl) dom.qrDisplayUrl.textContent = `${window.location.origin}/${targetUsername}`;

    if (btnElem) {
      btnElem.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span style="color: #34d399; font-weight: 700;">Đã lưu thành công!</span>
      `;
      setTimeout(() => {
        btnElem.innerHTML = originalBtnHtml;
        btnElem.disabled = false;
      }, 2000);
    }

    if (showSuccessFeedback) {
      showToast(`✅ Đã lưu thay đổi thành công! Link Bio: /${targetUsername}`);
    }
    return true;
  } catch (err) {
    console.error('Save bio error:', err);
    if (btnElem) {
      btnElem.innerHTML = originalBtnHtml;
      btnElem.disabled = false;
    }
    if (showSuccessFeedback) {
      showToast('⚠️ Không thể lưu lên máy chủ lúc này, đã lưu tạm vào bộ nhớ máy bạn.');
    }
    return false;
  }
}

function saveCurrentBioToUser() {
  saveCurrentBioToUserAsync(false).catch(() => {});
}

/* ==========================================================================
   PUBLIC BIO ROUTING (FOR QR CODE SCANNING & MULTI-USER SHARING)
   ========================================================================== */

function checkUrlParamsForPublicBio() {
  const params = new URLSearchParams(window.location.search);
  const qUser = params.get('u') || params.get('user');

  // Extract slug from clean pathname (e.g. /anh09 -> anh09)
  let pathSlug = window.location.pathname.replace(/^\/+|\/+$/g, '').replace(/^@/, '');
  if (pathSlug === 'index.html' || pathSlug === 'home' || pathSlug === 'wizard' || pathSlug === 'public') {
    pathSlug = '';
  }

  const targetUsername = qUser || pathSlug;
  const viewMode = params.get('view');

  if (targetUsername) {
    const cleanTarget = targetUsername.toLowerCase();

    // If target matches current logged-in user, show their own bio
    if (currentUser && (currentUser.username.toLowerCase() === cleanTarget || currentUser.email.toLowerCase() === cleanTarget)) {
      resetStateToUser(currentUser, currentUser.bioData);
      applyTheme(currentUser.bioData ? currentUser.bioData.theme : state.theme, currentUser.bioData);
      updatePublicBioView(currentUser.bioData, true);
      switchMainView('public');
      const cleanUrl = `/${encodeURIComponent(currentUser.username)}`;
      if (window.location.pathname !== cleanUrl || window.location.search.includes('u=')) {
        window.history.replaceState({ username: currentUser.username }, '', cleanUrl);
      }
      return true;
    }

    // Public visitor viewing someone else's bio:
    // Strictly isolate public view: DO NOT touch currentUser, DO NOT remember account on this device!
    fetch(`/api/bio/${encodeURIComponent(cleanTarget)}`)
      .then(r => r.json())
      .then(res => {
        if (res.success && res.bio) {
          const finalSlug = res.bio.username || cleanTarget;
          applyTheme(res.bio.theme || 'rainy_night', res.bio);
          updatePublicBioView(res.bio, false);
          const cleanUrl = `/${encodeURIComponent(finalSlug)}`;
          if (window.location.pathname !== cleanUrl || window.location.search.includes('u=')) {
            window.history.replaceState({ username: finalSlug }, '', cleanUrl);
          }
        } else {
          // Check local users fallback
          const db = getUsersDatabase();
          for (const email in db) {
            if (db[email].username === cleanTarget && db[email].bioData) {
              applyTheme(db[email].bioData.theme || 'rainy_night', db[email].bioData);
              updatePublicBioView(db[email].bioData, false);
              const cleanUrl = `/${encodeURIComponent(cleanTarget)}`;
              window.history.replaceState({ username: cleanTarget }, '', cleanUrl);
              break;
            }
          }
        }
      })
      .catch(() => {});

    // Automatically open Fullscreen Bio view for scanned QR visitors
    switchMainView('public');
    return true;
  } else if (viewMode === 'public') {
    if (currentUser) {
      showMyPublicBio();
    } else {
      switchMainView('public');
    }
    return true;
  }
  return false;
}

/* ==========================================================================
   UPGRADED QR CODE GENERATION & MOBILE SCANNING
   ========================================================================== */

function getTargetBioUrl() {
  const u = state.username || (currentUser ? currentUser.username : 'abg');
  if (currentQrType === 'network') {
    const netBase = networkInfo.networkUrl || `http://${networkInfo.ip}:${networkInfo.port}`;
    return `${netBase}/${encodeURIComponent(u)}`;
  } else if (currentQrType === 'local') {
    return `${window.location.origin}/${encodeURIComponent(u)}`;
  } else if (currentQrType === 'custom') {
    return dom.qrCustomUrlInput.value.trim() || `${window.location.origin}/${encodeURIComponent(u)}`;
  }
  return `${window.location.origin}/${encodeURIComponent(u)}`;
}

function openQrModal() {
  currentQrUrl = getTargetBioUrl();
  generateRealQrCode(currentQrUrl);
  dom.qrModal.classList.remove('hidden-modal');
}

function closeQrModal() {
  dom.qrModal.classList.add('hidden-modal');
}

function generateRealQrCode(urlToEncode) {
  dom.qrCanvasWrapper.innerHTML = '';
  dom.qrDisplayUrl.textContent = urlToEncode;
  dom.btnOpenDirectLink.href = urlToEncode;

  if (typeof QRCode !== 'undefined') {
    qrCodeInstance = new QRCode(dom.qrCanvasWrapper, {
      text: urlToEncode,
      width: 220,
      height: 220,
      colorDark: '#0c0d10',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  } else {
    // Fallback standard canvas QR or clean SVG
    const img = document.createElement('img');
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(urlToEncode)}`;
    img.alt = 'QR Code';
    img.width = 220;
    img.height = 220;
    dom.qrCanvasWrapper.appendChild(img);
  }
}

function downloadQrCode() {
  const canvas = dom.qrCanvasWrapper.querySelector('canvas');
  const img = dom.qrCanvasWrapper.querySelector('img');
  let dataUrl = null;

  if (canvas) {
    dataUrl = canvas.toDataURL('image/png');
  } else if (img && img.src.startsWith('data:')) {
    dataUrl = img.src;
  }

  if (dataUrl) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `BioLink_${state.username || 'Abg'}_QRCode.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Đã tải mã QR (PNG) chất lượng cao về máy!');
  } else {
    showToast('Đang tải mã QR...');
  }
}

/* ==========================================================================
   EVENT BINDINGS
   ========================================================================== */

function bindEvents() {
  // Navigation Tabs
  if (dom.navHomeBtn) dom.navHomeBtn.addEventListener('click', () => switchMainView('home'));
  dom.navWizardBtn.addEventListener('click', () => {
    if (!currentUser) {
      openAuthModal('login', '🔒 Vui lòng đăng nhập hoặc đăng ký tài khoản để bắt đầu tạo trang Bio của bạn!');
      return;
    }
    switchMainView('wizard');
  });
  dom.navSplitBtn.addEventListener('click', () => {
    if (!currentUser) {
      openAuthModal('login', '🔒 Vui lòng đăng nhập hoặc đăng ký tài khoản để truy cập Studio xem trực tiếp!');
      return;
    }
    switchMainView('split');
  });
  dom.navFullBioBtn.addEventListener('click', () => {
    if (currentUser) {
      showMyPublicBio();
    } else {
      switchMainView('public');
    }
  });
  dom.btnExitPublicBio.addEventListener('click', () => {
    if (currentViewingPublicBio && currentViewingPublicBio.isOwner && currentUser) {
      switchMainView('wizard');
    } else {
      if (currentUser) {
        resetStateToUser(currentUser, currentUser.bioData);
      } else {
        resetStateToUser(null);
      }
      switchMainView('home');
      window.history.replaceState({}, '', '/');
    }
  });

  // Brand Logo click returns to Home
  if (dom.brandLogoHome) {
    dom.brandLogoHome.addEventListener('click', (e) => {
      e.preventDefault();
      switchMainView('home');
    });
  }

  // Hero Claim Handle Input & Button
  if (dom.btnClaimHero && dom.homeClaimInput) {
    const handleClaimAction = () => {
      const handle = dom.homeClaimInput.value.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '') || 'abg';
      if (!currentUser) {
        pendingClaimHandle = handle;
        openAuthModal('register', '🔒 Bạn cần đăng ký hoặc đăng nhập tài khoản để bắt đầu tạo trang Bio của mình!');
        return;
      }
      state.username = handle;
      state.name = handle;
      if (dom.userNameInput) dom.userNameInput.value = handle;
      switchMainView('wizard');
      goToStep(1);
      showToast(`Bắt đầu thiết kế trang Bio cho: @${handle}`);
    };

    dom.btnClaimHero.addEventListener('click', handleClaimAction);
    dom.homeClaimInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleClaimAction();
    });
  }

  // Mega CTA Button on Homepage
  if (dom.btnMegaCtaStart) {
    dom.btnMegaCtaStart.addEventListener('click', () => {
      if (!currentUser) {
        openAuthModal('register', '🔒 Bạn cần đăng ký hoặc đăng nhập tài khoản để bắt đầu tạo trang Bio của mình!');
        return;
      }
      switchMainView('wizard');
      goToStep(1);
    });
  }

  // Creator Showcase Cards Preview Buttons
  document.querySelectorAll('.btn-preview-creator').forEach(btn => {
    btn.addEventListener('click', () => {
      const creatorKey = btn.dataset.creator;
      loadCreatorProfile(creatorKey);
    });
  });

  // Footer Quick Links
  const fStudio = document.getElementById('footerLinkStudio');
  const fThemes = document.getElementById('footerLinkThemes');
  const fQr = document.getElementById('footerLinkQr');
  const fLogin = document.getElementById('footerLinkLogin');
  const fRegister = document.getElementById('footerLinkRegister');
  const fGoogle = document.getElementById('footerLinkGoogle');

  if (fStudio) fStudio.onclick = (e) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal('login', '🔒 Vui lòng đăng nhập hoặc đăng ký để vào Studio!');
      return;
    }
    switchMainView('wizard');
    goToStep(1);
  };
  if (fThemes) fThemes.onclick = (e) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal('login', '🔒 Vui lòng đăng nhập hoặc đăng ký để chọn chủ đề!');
      return;
    }
    switchMainView('wizard');
    goToStep(6);
  };
  if (fQr) fQr.onclick = (e) => { e.preventDefault(); openQrModal(); };
  if (fLogin) fLogin.onclick = (e) => { e.preventDefault(); openAuthModal('login'); };
  if (fRegister) fRegister.onclick = (e) => { e.preventDefault(); openAuthModal('register'); };
  if (fGoogle) fGoogle.onclick = (e) => { e.preventDefault(); openGoogleModal(); };

  // 3D Card Tilt & Mood Palettes
  initHoloCard3D();
  initHoloMoods();

  // Header Auth Buttons
  dom.btnOpenLogin.addEventListener('click', () => openAuthModal('login'));
  dom.btnOpenRegister.addEventListener('click', () => openAuthModal('register'));
  dom.btnCloseAuthModal.addEventListener('click', closeAuthModal);

  // User Profile Dropdown Toggle
  dom.userProfileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dom.userProfileDropdown.classList.toggle('hidden-dropdown');
  });
  document.addEventListener('click', () => {
    dom.userProfileDropdown.classList.add('hidden-dropdown');
  });

  // Dropdown Actions
  dom.dropdownMyBioLink.addEventListener('click', (e) => {
    e.preventDefault();
    dom.userProfileDropdown.classList.add('hidden-dropdown');
    showMyPublicBio();
  });
  dom.dropdownCopyLinkBtn.addEventListener('click', () => {
    dom.userProfileDropdown.classList.add('hidden-dropdown');
    copyBioLinkToClipboard();
  });
  dom.dropdownSwitchAccountBtn.addEventListener('click', () => {
    dom.userProfileDropdown.classList.add('hidden-dropdown');
    openGoogleModal();
  });
  if (dom.dropdownChangePasswordBtn) {
    dom.dropdownChangePasswordBtn.addEventListener('click', () => {
      dom.userProfileDropdown.classList.add('hidden-dropdown');
      openChangePasswordModal();
    });
  }
  if (dom.btnCloseChangePasswordModal) {
    dom.btnCloseChangePasswordModal.addEventListener('click', closeChangePasswordModal);
  }
  if (dom.changePasswordForm) {
    dom.changePasswordForm.addEventListener('submit', handleChangePasswordSubmit);
  }
  dom.dropdownLogoutBtn.addEventListener('click', () => {
    dom.userProfileDropdown.classList.add('hidden-dropdown');
    logoutUser();
  });

  // Auth Modal Tab Switcher
  dom.tabBtnLogin.addEventListener('click', () => switchAuthTab('login'));
  dom.tabBtnRegister.addEventListener('click', () => switchAuthTab('register'));

  // Password Visibility Eye Toggles
  document.querySelectorAll('.btn-toggle-eye').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          btn.textContent = '🔒';
        } else {
          input.type = 'password';
          btn.textContent = '👁';
        }
      }
    });
  });

  // Registration Slug & Password Strength
  dom.regUsername.addEventListener('input', (e) => {
    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9_\-]/g, '');
    e.target.value = slug;
    dom.slugPreview.textContent = `biolink.me/${slug || 'username'}`;
  });

  dom.regPassword.addEventListener('input', (e) => {
    updatePasswordStrength(e.target.value);
  });

  // Auth Forms Submission
  dom.loginForm.addEventListener('submit', handleLoginFormSubmit);
  dom.registerForm.addEventListener('submit', handleRegisterFormSubmit);

  // Google OAuth Button
  dom.btnGoogleSignIn.addEventListener('click', openGoogleModal);
  dom.btnCancelGoogleAuth.addEventListener('click', closeGoogleModal);
  if (dom.btnToggleOtherGoogle) {
    dom.btnToggleOtherGoogle.addEventListener('click', () => {
      dom.otherGoogleForm.classList.toggle('hidden');
    });
  }
  if (dom.btnConfirmOtherGoogle) {
    dom.btnConfirmOtherGoogle.addEventListener('click', handleCustomGoogleLogin);
  }

  // Forgot Password Modal Events
  if (dom.btnForgotPwd) {
    dom.btnForgotPwd.addEventListener('click', (e) => {
      e.preventDefault();
      openForgotModal();
    });
  }
  if (dom.btnCloseForgotModal) {
    dom.btnCloseForgotModal.addEventListener('click', closeForgotModal);
  }
  if (dom.forgotEmailForm) {
    dom.forgotEmailForm.addEventListener('submit', handleSendForgotOtp);
  }
  if (dom.forgotResetForm) {
    dom.forgotResetForm.addEventListener('submit', handleResetPassword);
  }
  if (dom.btnResendForgotOtp) {
    dom.btnResendForgotOtp.addEventListener('click', handleSendForgotOtp);
  }
  if (dom.btnBackToStep1) {
    dom.btnBackToStep1.addEventListener('click', () => {
      dom.forgotStepReset.classList.add('hidden');
      dom.forgotStepEmail.classList.remove('hidden');
      dom.forgotInputEmail.focus();
    });
  }

  // Payment Modal Events
  if (dom.btnConfirmPaymentDone) {
    dom.btnConfirmPaymentDone.addEventListener('click', handleConfirmPayment);
  }
  if (dom.btnLogoutFromPayment) {
    dom.btnLogoutFromPayment.addEventListener('click', () => {
      closePaymentModal();
      logoutUser();
    });
  }
  if (dom.btnCopyAccountNum) {
    dom.btnCopyAccountNum.addEventListener('click', () => {
      const num = dom.payAccountNumber ? dom.payAccountNumber.textContent.trim() : '0932543483';
      navigator.clipboard.writeText(num);
      showToast(`Đã sao chép số tài khoản MB: ${num}`);
    });
  }
  if (dom.btnCopyAmount) {
    dom.btnCopyAmount.addEventListener('click', () => {
      navigator.clipboard.writeText('5000');
      showToast('Đã sao chép số tiền: 5.000 đ');
    });
  }
  if (dom.btnCopySyntax) {
    dom.btnCopySyntax.addEventListener('click', () => {
      const syntax = dom.paySyntax ? dom.paySyntax.textContent.trim() : `BIO ${currentUser?.username || 'user'}`;
      navigator.clipboard.writeText(syntax);
      showToast(`Đã sao chép nội dung: ${syntax}`);
    });
  }

  if (dom.customGoogleEmail && dom.customGoogleName) {
    dom.customGoogleEmail.addEventListener('input', (e) => {
      const rawVal = e.target.value.trim();
      if (!dom.customGoogleName.value.trim() || dom.customGoogleName.dataset.autoFilled === 'true') {
        const prefix = rawVal.split('@')[0];
        if (prefix) {
          dom.customGoogleName.value = prefix.charAt(0).toUpperCase() + prefix.slice(1);
          dom.customGoogleName.dataset.autoFilled = 'true';
        }
      }
    });
    dom.customGoogleName.addEventListener('input', () => {
      delete dom.customGoogleName.dataset.autoFilled;
    });
  }

  // Quick video upload from header & floating bar
  dom.quickUploadVideoBtn.addEventListener('click', () => {
    dom.userVideoFileInput.click();
  });
  dom.btnFloatingVideoUpload.addEventListener('click', () => {
    dom.userVideoFileInput.click();
  });

  // Audio Toggle
  dom.btnToggleAudio.addEventListener('click', toggleAudioPlayback);
  dom.videoMuteToggle.addEventListener('click', toggleAudioPlayback);

  // Wizard Step Navigation
  dom.wizardBackBtn.addEventListener('click', goToPreviousStep);

  // Step 1: Referral Options
  dom.referralOptionList.querySelectorAll('.list-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      dom.referralOptionList.querySelectorAll('.list-pill-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.referral = btn.dataset.value;
      setTimeout(() => goToStep(2), 200);
    });
  });

  // Step 2: Multi-select Platforms
  dom.platformSelectList.querySelectorAll('.platform-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
      const platform = btn.dataset.platform;
      if (btn.classList.contains('selected')) {
        if (!state.platforms.includes(platform)) state.platforms.push(platform);
      } else {
        state.platforms = state.platforms.filter(p => p !== platform);
      }
      syncSocialInputsWithPlatforms();
      updatePhonePreview();
      saveCurrentBioToUser();
    });
  });
  dom.step2ContinueBtn.addEventListener('click', () => goToStep(3));

  // Step 3: Avatar Upload & Presets
  dom.avatarDropZone.addEventListener('click', () => dom.avatarFileInput.click());
  dom.avatarFileInput.addEventListener('change', handleAvatarUpload);

  dom.presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      dom.presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const avatarVal = chip.dataset.avatar;
      if (avatarVal === 'preset-cyber') {
        state.avatar = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80';
      } else if (avatarVal === 'preset-minimal') {
        state.avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80';
      } else {
        state.avatar = 'assets/avatar_abg.jpg';
      }
      dom.avatarPreviewImg.src = state.avatar;
      updatePhonePreview();
      updatePublicBioView();
      saveCurrentBioToUser();
    });
  });
  dom.step3ContinueBtn.addEventListener('click', () => goToStep(4));

  // Step 4: Name & Bio Form
  dom.userNameInput.addEventListener('input', (e) => {
    const val = e.target.value.trim() || 'Abg';
    state.name = val;

    // Auto-sync slug if user hasn't explicitly entered a custom slug or was default 'abg'
    const autoSlug = val.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_\-]/g, '');
    if (autoSlug && (!state.hasCustomSlugManual || state.username === 'abg')) {
      state.username = autoSlug;
      if (dom.userSlugInput) dom.userSlugInput.value = autoSlug;
      if (dom.step4SlugPreview) dom.step4SlugPreview.textContent = `/${autoSlug}`;
      if (dom.slugDynamicText) dom.slugDynamicText.textContent = autoSlug;
      if (currentUser) currentUser.username = autoSlug;
      window.history.replaceState({ username: autoSlug }, '', `/${encodeURIComponent(autoSlug)}`);
    }

    updatePhonePreview();
    updatePublicBioView();
    saveCurrentBioToUser();
  });

  if (dom.userSlugInput) {
    dom.userSlugInput.addEventListener('input', (e) => {
      state.hasCustomSlugManual = true;
      const cleanSlug = e.target.value.toLowerCase().replace(/[^a-z0-9_\-]/g, '') || 'user';
      state.username = cleanSlug;
      if (dom.step4SlugPreview) dom.step4SlugPreview.textContent = `/${cleanSlug}`;
      if (dom.slugDynamicText) dom.slugDynamicText.textContent = cleanSlug;
      if (currentUser) currentUser.username = cleanSlug;
      window.history.replaceState({ username: cleanSlug }, '', `/${encodeURIComponent(cleanSlug)}`);
      updatePhonePreview();
      updatePublicBioView();
      saveCurrentBioToUser();
    });
  }

  dom.userBioInput.addEventListener('input', (e) => {
    state.bio = e.target.value;
    dom.bioCharCounter.textContent = `${state.bio.length}/255`;
    updatePhonePreview();
    updatePublicBioView();
    saveCurrentBioToUser();
  });
  dom.step4ContinueBtn.addEventListener('click', () => {
    saveCurrentBioToUser();
    goToStep(5);
  });

  // Step 5: Custom Links & Social Handles
  dom.addMoreLinkBtn.addEventListener('click', addNewLinkRow);
  bindCustomLinkInputs();
  bindSocialHandleInputs();
  dom.step5ContinueBtn.addEventListener('click', () => {
    saveCurrentBioToUser();
    goToStep(6);
  });

  // Step 6: Custom Video Uploader & Theme Selector
  dom.videoDropArea.addEventListener('click', (e) => {
    // Only open file dialog if no video loaded yet, or clicking the empty state
    if (!state.video.url || (dom.videoEmptyState && dom.videoEmptyState.contains(e.target))) {
      dom.userVideoFileInput.click();
    }
  });
  dom.userVideoFileInput.addEventListener('change', handleUserVideoUpload);

  const btnUseCustomVideo = document.getElementById('btnUseCustomVideo');
  if (btnUseCustomVideo) {
    btnUseCustomVideo.addEventListener('click', (e) => {
      e.stopPropagation();
      applyTheme('custom_video');
      saveCurrentBioToUser();
    });
  }

  const customVideoThumbBtn = document.getElementById('customVideoThumbBtn');
  if (customVideoThumbBtn) {
    customVideoThumbBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      applyTheme('custom_video');
      saveCurrentBioToUser();
    });
  }

  // Drag and drop video
  dom.videoDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dom.videoDropArea.classList.add('drag-over');
  });
  dom.videoDropArea.addEventListener('dragleave', () => {
    dom.videoDropArea.classList.remove('drag-over');
  });
  dom.videoDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dom.videoDropArea.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedVideoFile(e.dataTransfer.files[0]);
    }
  });

  dom.btnChangeVideo.addEventListener('click', (e) => {
    e.stopPropagation();
    dom.userVideoFileInput.click();
  });

  // Video Tuning Sliders
  dom.overlaySlider.addEventListener('input', (e) => {
    state.video.overlay = parseInt(e.target.value, 10);
    dom.overlayValueText.textContent = `${state.video.overlay}%`;
    applyOverlaySettings();
    saveCurrentBioToUser();
  });

  dom.blurSlider.addEventListener('input', (e) => {
    state.video.blur = parseInt(e.target.value, 10);
    dom.blurValueText.textContent = `${state.video.blur}px`;
    applyBlurSettings();
    saveCurrentBioToUser();
  });

  // Theme Grid selection
  dom.themeGrid.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', () => {
      const themeId = card.dataset.themeId;
      applyTheme(themeId);
      saveCurrentBioToUser();
    });
  });
  dom.step6ContinueBtn.addEventListener('click', () => {
    saveCurrentBioToUser();
    goToStep(7);
  });

  // Step 7: Finish Actions
  if (dom.btnWizardSaveBio) {
    dom.btnWizardSaveBio.addEventListener('click', () => saveCurrentBioToUserAsync(true, dom.btnWizardSaveBio));
  }
  if (dom.btnSavePublicBio) {
    dom.btnSavePublicBio.addEventListener('click', () => saveCurrentBioToUserAsync(true, dom.btnSavePublicBio));
  }
  if (dom.btnStudioSaveBio) {
    dom.btnStudioSaveBio.addEventListener('click', () => saveCurrentBioToUserAsync(true, dom.btnStudioSaveBio));
  }
  if (dom.btnStudioViewBio) {
    dom.btnStudioViewBio.addEventListener('click', () => {
      if (currentUser) {
        showMyPublicBio();
      } else {
        switchMainView('public');
      }
    });
  }

  dom.btnOpenFullScreenBio.addEventListener('click', () => {
    if (currentUser) {
      showMyPublicBio();
    } else {
      switchMainView('public');
    }
  });
  dom.btnCopyBioLink.addEventListener('click', copyBioLinkToClipboard);
  dom.btnShowQrCode.addEventListener('click', openQrModal);
  dom.btnCloseQrModal.addEventListener('click', closeQrModal);
  dom.btnDownloadQr.addEventListener('click', downloadQrCode);
  dom.btnBackToEdit.addEventListener('click', () => goToStep(4));

  // Upgraded QR Tab Switching
  dom.qrTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.qrTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentQrType = btn.dataset.qrType;

      if (currentQrType === 'custom') {
        dom.qrCustomUrlWrapper.classList.remove('hidden');
      } else {
        dom.qrCustomUrlWrapper.classList.add('hidden');
      }

      currentQrUrl = getTargetBioUrl();
      generateRealQrCode(currentQrUrl);
    });
  });

  dom.qrCustomUrlInput.addEventListener('input', () => {
    if (currentQrType === 'custom') {
      currentQrUrl = getTargetBioUrl();
      generateRealQrCode(currentQrUrl);
    }
  });

  dom.btnCopyQrUrl.addEventListener('click', () => {
    navigator.clipboard.writeText(currentQrUrl).then(() => {
      showToast('Đã sao chép liên kết vào bộ nhớ tạm!');
    });
  });

  // Studio pane tabs
  document.querySelectorAll('.studio-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.studio-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderStudioPane(btn.dataset.studioPane);
    });
  });
}

/* ==========================================================================
   AUTH MODAL & ACTIONS
   ========================================================================== */

function openAuthModal(tab = 'login', reasonMessage = null) {
  if (dom.authRequireBanner) {
    if (reasonMessage) {
      dom.authRequireBanner.classList.remove('hidden');
      if (dom.authRequireBannerText) dom.authRequireBannerText.textContent = reasonMessage;
    } else {
      dom.authRequireBanner.classList.add('hidden');
    }
  }
  switchAuthTab(tab);
  if (tab === 'login') {
    renderDeviceSuggestedAccounts();
  }
  dom.authModal.classList.remove('hidden-modal');
}

function closeAuthModal() {
  dom.authModal.classList.add('hidden-modal');
}

function switchAuthTab(tab) {
  if (tab === 'login') {
    dom.tabBtnLogin.classList.add('active');
    dom.tabBtnRegister.classList.remove('active');
    dom.loginForm.classList.remove('hidden');
    dom.registerForm.classList.add('hidden');
    document.getElementById('authModalTitle').textContent = 'Đăng nhập Bio Link';
    document.getElementById('googleBtnText').textContent = 'Tiếp tục với Google';
  } else {
    dom.tabBtnRegister.classList.add('active');
    dom.tabBtnLogin.classList.remove('active');
    dom.registerForm.classList.remove('hidden');
    dom.loginForm.classList.add('hidden');
    document.getElementById('authModalTitle').textContent = 'Tạo tài khoản Bio Link mới';
    document.getElementById('googleBtnText').textContent = 'Đăng ký nhanh bằng Google';
  }
}

function updatePasswordStrength(pwd) {
  let score = 0;
  if (pwd.length >= 6) score += 25;
  if (pwd.length >= 8) score += 25;
  if (/[A-Z]/.test(pwd)) score += 25;
  if (/[0-9!@#$%^&*]/.test(pwd)) score += 25;

  dom.pwdStrengthFill.style.width = `${score}%`;
  if (score <= 25) {
    dom.pwdStrengthFill.style.backgroundColor = '#ef4444';
    dom.pwdStrengthLabel.textContent = 'Độ mạnh: Yếu (Hãy thêm chữ hoa, số)';
    dom.pwdStrengthLabel.style.color = '#ef4444';
  } else if (score <= 50) {
    dom.pwdStrengthFill.style.backgroundColor = '#f59e0b';
    dom.pwdStrengthLabel.textContent = 'Độ mạnh: Trung bình';
    dom.pwdStrengthLabel.style.color = '#f59e0b';
  } else if (score <= 75) {
    dom.pwdStrengthFill.style.backgroundColor = '#10b981';
    dom.pwdStrengthLabel.textContent = 'Độ mạnh: Khá tốt';
    dom.pwdStrengthLabel.style.color = '#10b981';
  } else {
    dom.pwdStrengthFill.style.backgroundColor = '#06b6d4';
    dom.pwdStrengthLabel.textContent = 'Độ mạnh: Rất mạnh! ✨';
    dom.pwdStrengthLabel.style.color = '#06b6d4';
  }
}

async function handleLoginFormSubmit(e) {
  e.preventDefault();
  const identifier = dom.loginIdentifier.value.trim();
  const password = dom.loginPassword.value.trim();

  if (!identifier || !password) {
    alert('Vui lòng nhập đầy đủ email và mật khẩu!');
    return;
  }

  showToast('Đang đăng nhập...');
  try {
    const devId = getOrCreateDeviceId();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': devId
      },
      body: JSON.stringify({ email: identifier, password, deviceId: devId })
    });
    const data = await res.json();
    if (!data.success) {
      alert(data.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại mật khẩu!');
      return;
    }

    loginUser(data.user, data.token);

    if (data.user.bioData) {
      showMyPublicBio();
      showToast(`Chào mừng trở lại, ${data.user.name}! Đã tải trang Bio của bạn.`);
    } else {
      switchMainView('wizard');
      goToStep(1);
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('Không thể kết nối đến máy chủ. Vui lòng thử lại!');
  }
}

async function handleRegisterFormSubmit(e) {
  e.preventDefault();
  const fullName = dom.regFullName.value.trim();
  const username = dom.regUsername.value.trim().toLowerCase();
  const email = dom.regEmail.value.trim();
  const pwd = dom.regPassword.value;
  const confirmPwd = dom.regConfirmPassword.value;

  if (pwd.length < 6) {
    alert('Mật khẩu phải chứa ít nhất 6 ký tự để bảo vệ tài khoản!');
    return;
  }

  if (pwd !== confirmPwd) {
    alert('Mật khẩu xác nhận không khớp! Vui lòng nhập lại.');
    return;
  }

  showToast('Đang tạo tài khoản trên máy chủ...');
  try {
    const devId = getOrCreateDeviceId();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': devId
      },
      body: JSON.stringify({
        name: fullName,
        username: username,
        email: email,
        password: pwd,
        deviceId: devId
      })
    });
    const data = await res.json();
    if (!data.success) {
      alert(data.error || 'Đăng ký không thành công!');
      return;
    }

    loginUser(data.user, data.token);

    if (pendingClaimHandle) {
      state.username = pendingClaimHandle;
      state.name = fullName;
      pendingClaimHandle = null;
    }

    switchMainView('wizard');
    goToStep(1);
    showToast(`Đăng ký thành công! Chào mừng ${data.user.name}.`);
  } catch (err) {
    console.error('Register error:', err);
    alert('Không thể kết nối đến máy chủ. Vui lòng thử lại!');
  }
}

// Google OAuth Modal with strict password verification
function openGoogleModal() {
  closeAuthModal();
  dom.googleAuthModal.classList.remove('hidden-modal');
  renderDeviceSuggestedAccounts();
}

function closeGoogleModal() {
  dom.googleAuthModal.classList.add('hidden-modal');
}

async function handleCustomGoogleLogin() {
  const email = dom.customGoogleEmail.value.trim();
  let name = dom.customGoogleName.value.trim();
  if (!name || name === 'Người dùng Google') {
    const handle = email.split('@')[0];
    name = handle ? (handle.charAt(0).toUpperCase() + handle.slice(1)) : 'Người dùng Google';
  }

  if (!email || !email.includes('@')) {
    alert('Vui lòng nhập địa chỉ email @gmail.com hợp lệ!');
    return;
  }

  await executeGoogleLogin(email, name);
}

// ==========================================================================
// FORGOT PASSWORD FLOW (EMAIL OTP VIA GMAIL)
// ==========================================================================

function openForgotModal() {
  closeAuthModal();
  closeGoogleModal();
  if (dom.forgotPasswordModal) {
    dom.forgotPasswordModal.classList.remove('hidden-modal');
    dom.forgotStepEmail.classList.remove('hidden');
    dom.forgotStepReset.classList.add('hidden');
    if (dom.loginIdentifier && dom.loginIdentifier.value.includes('@')) {
      dom.forgotInputEmail.value = dom.loginIdentifier.value;
    }
    dom.forgotInputEmail.focus();
  }
}

function closeForgotModal() {
  if (dom.forgotPasswordModal) {
    dom.forgotPasswordModal.classList.add('hidden-modal');
  }
}

async function handleSendForgotOtp(e) {
  if (e) e.preventDefault();
  const email = dom.forgotInputEmail.value.trim();
  if (!email || !email.includes('@')) {
    alert('Vui lòng nhập địa chỉ email hợp lệ!');
    return;
  }

  showToast('Đang gửi mã xác thực về Gmail...');
  if (dom.btnSendForgotOtp) {
    dom.btnSendForgotOtp.disabled = true;
    dom.btnSendForgotOtp.textContent = 'Đang xử lý...';
  }

  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (dom.btnSendForgotOtp) {
      dom.btnSendForgotOtp.disabled = false;
      dom.btnSendForgotOtp.textContent = 'Gửi mã xác thực về Gmail';
    }

    if (!data.success) {
      alert(data.error || 'Không thể gửi mã xác thực. Vui lòng kiểm tra lại email!');
      return;
    }

    // Switch to step 2
    dom.forgotStepEmail.classList.add('hidden');
    dom.forgotStepReset.classList.remove('hidden');
    dom.sentEmailLabel.textContent = data.email || email;
    dom.forgotOtpCode.value = '';
    dom.forgotOtpCode.focus();

    showToast('✓ Đã gửi mã xác thực 6 số về Gmail của bạn! Vui lòng kiểm tra hộp thư đến (hoặc thư rác Spam).');
  } catch (err) {
    if (dom.btnSendForgotOtp) {
      dom.btnSendForgotOtp.disabled = false;
      dom.btnSendForgotOtp.textContent = 'Gửi mã xác thực về Gmail';
    }
    console.error('Forgot password error:', err);
    alert('Lỗi kết nối máy chủ. Vui lòng thử lại sau!');
  }
}

async function handleResetPassword(e) {
  if (e) e.preventDefault();
  const email = (dom.sentEmailLabel.textContent.trim() || dom.forgotInputEmail.value.trim()).toLowerCase();
  const code = dom.forgotOtpCode.value.trim();
  const newPassword = dom.forgotNewPassword.value.trim();
  const confirmNewPassword = dom.forgotConfirmNewPassword.value.trim();

  if (!code || code.length !== 6) {
    alert('Vui lòng nhập đầy đủ mã xác thực 6 chữ số!');
    return;
  }
  if (!newPassword || newPassword.length < 6) {
    alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
    return;
  }
  if (newPassword !== confirmNewPassword) {
    alert('Mật khẩu xác nhận không khớp! Vui lòng nhập lại.');
    return;
  }

  showToast('Đang đặt lại mật khẩu mới...');
  if (dom.btnConfirmResetPassword) {
    dom.btnConfirmResetPassword.disabled = true;
    dom.btnConfirmResetPassword.textContent = 'Đang cập nhật...';
  }

  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        code,
        newPassword
      })
    });
    const data = await res.json();
    if (dom.btnConfirmResetPassword) {
      dom.btnConfirmResetPassword.disabled = false;
      dom.btnConfirmResetPassword.textContent = 'Xác nhận đổi mật khẩu';
    }

    if (!data.success) {
      alert(data.error || 'Đặt lại mật khẩu thất bại!');
      return;
    }

    alert('✓ Đặt lại mật khẩu thành công! Mật khẩu mới đã được lưu an toàn. Vui lòng đăng nhập bằng mật khẩu mới của bạn.');
    closeForgotModal();
    openAuthModal('login');
    dom.loginIdentifier.value = email;
    dom.loginPassword.value = '';
    dom.loginPassword.focus();
  } catch (err) {
    if (dom.btnConfirmResetPassword) {
      dom.btnConfirmResetPassword.disabled = false;
      dom.btnConfirmResetPassword.textContent = 'Xác nhận đổi mật khẩu';
    }
    console.error('Reset password error:', err);
    alert('Lỗi kết nối máy chủ. Vui lòng thử lại sau!');
  }
}

// ==========================================================================
// CHANGE PASSWORD FLOW (IN USER PROFILE DROPDOWN)
// ==========================================================================

function openChangePasswordModal() {
  if (dom.userProfileDropdown) dom.userProfileDropdown.classList.add('hidden-dropdown');
  if (dom.changePasswordModal) {
    dom.changePasswordModal.classList.remove('hidden-modal');
    if (dom.changePasswordForm) dom.changePasswordForm.reset();
    if (dom.inputOldPassword) dom.inputOldPassword.focus();
  }
}

function closeChangePasswordModal() {
  if (dom.changePasswordModal) {
    dom.changePasswordModal.classList.add('hidden-modal');
  }
}

async function handleChangePasswordSubmit(e) {
  if (e) e.preventDefault();
  const oldPassword = dom.inputOldPassword ? dom.inputOldPassword.value.trim() : '';
  const newPassword = dom.inputNewPassword ? dom.inputNewPassword.value.trim() : '';
  const confirmPassword = dom.inputConfirmNewPassword ? dom.inputConfirmNewPassword.value.trim() : '';

  if (!oldPassword || !newPassword || !confirmPassword) {
    alert('Vui lòng điền đầy đủ tất cả các trường mật khẩu!');
    return;
  }

  if (newPassword.length < 6) {
    alert('Mật khẩu mới phải có tối thiểu 6 ký tự!');
    return;
  }

  if (newPassword !== confirmPassword) {
    alert('Mật khẩu xác nhận không khớp với mật khẩu mới!');
    return;
  }

  const token = localStorage.getItem('biolink_token');
  if (!token) {
    alert('Vui lòng đăng nhập lại để đổi mật khẩu!');
    closeChangePasswordModal();
    openAuthModal('login');
    return;
  }

  if (dom.btnSubmitChangePassword) {
    dom.btnSubmitChangePassword.disabled = true;
    dom.btnSubmitChangePassword.textContent = 'Đang lưu thay đổi...';
  }

  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
    });
    const data = await res.json();
    if (!data.success) {
      alert(data.error || 'Đổi mật khẩu thất bại!');
      return;
    }

    showToast('✓ Đổi mật khẩu thành công! Mật khẩu mới đã được lưu an toàn.');
    closeChangePasswordModal();
  } catch (err) {
    console.error('Change password error:', err);
    alert('Lỗi kết nối máy chủ. Vui lòng thử lại sau!');
  } finally {
    if (dom.btnSubmitChangePassword) {
      dom.btnSubmitChangePassword.disabled = false;
      dom.btnSubmitChangePassword.textContent = 'Lưu thay đổi mật khẩu';
    }
  }
}

// ==========================================================================
// PAYMENT FLOW (5.000 VND ACTIVATION VIA MBBANK)
// ==========================================================================

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

function checkAndEnforcePayment(user) {
  if (!user) return true;
  // Whitelist is permanently exempt and free
  if (isUserPaymentExempt(user.email)) {
    closePaymentModal();
    return true;
  }
  // If user already completed payment
  if (user.isPaid === true) {
    closePaymentModal();
    return true;
  }
  // Not paid and not exempt -> open payment paywall
  openPaymentModal(user);
  return false;
}

function openPaymentModal(user) {
  if (!dom.paymentModal) return;
  const uname = user.username || 'user';
  const syntax = `BIO ${uname}`;

  if (dom.payAccountNumber) dom.payAccountNumber.textContent = '0932543483';
  if (dom.payAccountName) dom.payAccountName.textContent = 'NGUYEN NGO TU ANH';
  if (dom.payBankName) dom.payBankName.textContent = 'MBBank (Ngân hàng TMCP Quân đội)';
  if (dom.payAmount) dom.payAmount.textContent = '5.000 đ';
  if (dom.paySyntax) dom.paySyntax.textContent = syntax;

  if (dom.paymentQrImage) {
    const vietQrUrl = `https://img.vietqr.io/image/MB-0932543483-compact2.png?amount=5000&addInfo=${encodeURIComponent(syntax)}&accountName=NGUYEN%20NGO%20TU%20ANH`;
    dom.paymentQrImage.src = vietQrUrl;
    dom.paymentQrImage.onerror = () => {
      dom.paymentQrImage.src = '/assets/payment_qr.jpg';
    };
  }

  dom.paymentModal.classList.remove('hidden-modal');
}

function closePaymentModal() {
  if (dom.paymentModal) {
    dom.paymentModal.classList.add('hidden-modal');
  }
}

async function handleConfirmPayment() {
  if (!currentUser) return;
  showToast('Đang kiểm tra và kích hoạt tài khoản...');
  if (dom.btnConfirmPaymentDone) {
    dom.btnConfirmPaymentDone.disabled = true;
    dom.btnConfirmPaymentDone.textContent = 'Đang kích hoạt...';
  }

  try {
    const token = localStorage.getItem('biolink_token');
    const res = await fetch('/api/payment/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        userId: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        transactionNote: `BIO ${currentUser.username}`
      })
    });
    const data = await res.json();
    if (dom.btnConfirmPaymentDone) {
      dom.btnConfirmPaymentDone.disabled = false;
      dom.btnConfirmPaymentDone.textContent = '✓ Tôi đã chuyển khoản thành công';
    }

    if (!data.success) {
      alert(data.error || 'Kích hoạt chưa thành công. Vui lòng thử lại!');
      return;
    }

    // Success! Update currentUser permanently
    currentUser.isPaid = true;
    currentUser.paidAt = data.user.paidAt || new Date().toISOString();
    localStorage.setItem('biolink_current_user', JSON.stringify(currentUser));

    closePaymentModal();
    showToast('Kích hoạt tài khoản thành công! Cảm ơn bạn đã ủng hộ.');

    if (currentUser.bioData) {
      showMyPublicBio();
    } else {
      switchMainView('wizard');
      goToStep(1);
    }
  } catch (err) {
    if (dom.btnConfirmPaymentDone) {
      dom.btnConfirmPaymentDone.disabled = false;
      dom.btnConfirmPaymentDone.textContent = '✓ Tôi đã chuyển khoản thành công';
    }
    console.error('Lỗi xác nhận thanh toán:', err);
    alert('Không thể kết nối đến máy chủ. Vui lòng thử lại sau!');
  }
}

/* ==========================================================================
   WIZARD FLOW & STEP CONTROLLER
   ========================================================================== */

function goToStep(stepNumber) {
  if (stepNumber < 1) stepNumber = 1;
  if (stepNumber > state.totalSteps) stepNumber = state.totalSteps;
  state.step = stepNumber;
  renderWizardStep(state.step);
}

function goToPreviousStep() {
  if (state.step > 1) {
    goToStep(state.step - 1);
  }
}

function renderWizardStep(step) {
  // Update progress bar
  const progressPercent = (step / state.totalSteps) * 100;
  dom.wizardProgressBar.style.width = `${progressPercent}%`;
  dom.stepCounterText.textContent = `Bước ${step}/${state.totalSteps}`;

  // Update Back button disabled state
  if (step === 1) {
    dom.wizardBackBtn.classList.add('disabled');
  } else {
    dom.wizardBackBtn.classList.remove('disabled');
  }

  // Show active slide
  dom.slides.forEach(slide => {
    if (parseInt(slide.dataset.step, 10) === step) {
      slide.classList.add('active-slide');
    } else {
      slide.classList.remove('active-slide');
    }
  });

  // Sync previews
  updatePhonePreview();
  updatePublicBioView();
}

/* ==========================================================================
   VIEW SWITCHER (Wizard, Studio Split, Public Bio)
   ========================================================================== */

function stopAllBackgroundMedia() {
  if (dom.bgVideo) {
    dom.bgVideo.pause();
    dom.bgVideo.muted = true;
    dom.bgVideo.currentTime = 0;
    dom.bgVideo.removeAttribute('src');
    dom.bgVideo.load();
    dom.bgVideo.classList.remove('active');
    dom.bgVideo.style.opacity = '0';
  }
  if (dom.phoneBgVideo) {
    dom.phoneBgVideo.pause();
    dom.phoneBgVideo.muted = true;
    dom.phoneBgVideo.volume = 0;
    dom.phoneBgVideo.currentTime = 0;
    dom.phoneBgVideo.removeAttribute('src');
    dom.phoneBgVideo.load();
    dom.phoneBgVideo.classList.remove('active');
    dom.phoneBgVideo.style.opacity = '0';
  }
  if (dom.miniVideoPreview) {
    dom.miniVideoPreview.pause();
    dom.miniVideoPreview.muted = true;
  }
  if (dom.holoCardVideo) {
    dom.holoCardVideo.pause();
    dom.holoCardVideo.muted = true;
    dom.holoCardVideo.volume = 0;
  }
  if (dom.btnToggleAudio) {
    dom.btnToggleAudio.style.display = 'none';
  }
  document.querySelectorAll('video').forEach(v => {
    v.muted = true;
  });
}

function switchMainView(viewName) {
  if (viewName === 'wizard' || viewName === 'split') {
    if (currentUser && !checkAndEnforcePayment(currentUser)) {
      return;
    }
  }

  // When switching to homepage, immediately stop and silence all background media
  if (viewName === 'home') {
    stopAllBackgroundMedia();
  }

  if (dom.navHomeBtn) dom.navHomeBtn.classList.remove('active');
  dom.navWizardBtn.classList.remove('active');
  dom.navSplitBtn.classList.remove('active');
  dom.navFullBioBtn.classList.remove('active');

  if (dom.homeSection) dom.homeSection.classList.add('hidden-view');
  dom.wizardSection.classList.add('hidden-view');
  dom.splitStudioSection.classList.add('hidden-view');
  dom.publicBioSection.classList.add('hidden-view');

  if (viewName === 'home') {
    if (dom.navHomeBtn) dom.navHomeBtn.classList.add('active');
    if (dom.homeSection) dom.homeSection.classList.remove('hidden-view');
    dom.mainHeader.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    initHoloCardShowcase();
  } else if (viewName === 'wizard') {
    dom.navWizardBtn.classList.add('active');
    dom.wizardSection.classList.remove('hidden-view');
    dom.mainHeader.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    applyTheme(state.theme);
  } else if (viewName === 'split') {
    dom.navSplitBtn.classList.add('active');
    dom.splitStudioSection.classList.remove('hidden-view');
    dom.mainHeader.style.display = 'flex';
    renderStudioPane('pane-profile');
    syncStudioPhoneClone();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    applyTheme(state.theme);
  } else if (viewName === 'public') {
    dom.navFullBioBtn.classList.add('active');
    dom.publicBioSection.classList.remove('hidden-view');
    dom.mainHeader.style.display = 'none'; // Immersive full view
    applyTheme(state.theme);
    updatePublicBioView();
  }
}

/* ==========================================================================
   HOMEPAGE HOLO-CARD 3D TILT & MOOD ENGINE
   ========================================================================== */

function initHoloCard3D() {
  const card = dom.heroHoloCard;
  const glare = dom.holoGlare;
  if (!card) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

    if (glare) {
      glare.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(255, 255, 255, 0.3) 0%, transparent 60%)`;
    }
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    if (glare) {
      glare.style.background = 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.22) 0%, transparent 60%)';
    }
  });
}

function initHoloMoods() {
  const buttons = document.querySelectorAll('.mood-pill-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mood = btn.dataset.mood;
      setHoloMood(mood);
    });
  });
}

function initHoloCardShowcase() {
  setHoloMood('rainy');
}

let holoAnimationId = null;
let holoRainDrops = [];

function setHoloMood(mood) {
  const videoElem = dom.holoCardVideo;
  const imgElem = dom.holoCardImage;
  const canvas = dom.holoCardCanvas;
  if (!videoElem || !imgElem || !canvas) return;

  if (holoAnimationId) {
    cancelAnimationFrame(holoAnimationId);
    holoAnimationId = null;
  }
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  videoElem.classList.remove('active');
  videoElem.pause();
  videoElem.muted = true;
  videoElem.volume = 0;

  if (mood === 'rainy') {
    videoElem.removeAttribute('src');
    videoElem.load();
    imgElem.style.backgroundImage = "url('assets/rainy_city_night.jpg')";
    startHoloRain(canvas);
  } else if (mood === 'galaxy') {
    videoElem.src = PRESET_VIDEOS.video_galaxy_loop;
    videoElem.muted = true;
    videoElem.volume = 0;
    videoElem.classList.add('active');
    videoElem.load();
    videoElem.play().catch(() => {});
  } else if (mood === 'cyber') {
    videoElem.src = PRESET_VIDEOS.video_neon_loop;
    videoElem.muted = true;
    videoElem.volume = 0;
    videoElem.classList.add('active');
    videoElem.load();
    videoElem.play().catch(() => {});
  } else if (mood === 'winter') {
    videoElem.removeAttribute('src');
    videoElem.load();
    imgElem.style.backgroundImage = "url('assets/theme_winter.jpg')";
    startHoloSnow(canvas);
  }
}

function startHoloRain(canvas) {
  canvas.width = canvas.clientWidth || 320;
  canvas.height = canvas.clientHeight || 610;
  const ctx = canvas.getContext('2d');
  holoRainDrops = [];
  for (let i = 0; i < 40; i++) {
    holoRainDrops.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      len: Math.random() * 20 + 10,
      spd: Math.random() * 6 + 10
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.2;
    holoRainDrops.forEach(d => {
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 1, d.y + d.len);
      ctx.stroke();
      d.y += d.spd;
      d.x -= 0.8;
      if (d.y > canvas.height) {
        d.y = -d.len;
        d.x = Math.random() * canvas.width;
      }
    });
    holoAnimationId = requestAnimationFrame(loop);
  }
  loop();
}

function startHoloSnow(canvas) {
  canvas.width = canvas.clientWidth || 320;
  canvas.height = canvas.clientHeight || 610;
  const ctx = canvas.getContext('2d');
  const flakes = [];
  for (let i = 0; i < 35; i++) {
    flakes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 1,
      spd: Math.random() * 1.5 + 0.8
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    flakes.forEach(f => {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
      f.y += f.spd;
      if (f.y > canvas.height) {
        f.y = -4;
        f.x = Math.random() * canvas.width;
      }
    });
    holoAnimationId = requestAnimationFrame(loop);
  }
  loop();
}

function loadCreatorProfile(creatorKey) {
  if (creatorKey === 'abg') {
    state.name = 'Abg';
    state.username = 'abg';
    state.bio = 'Digital Artist & Tarot Creator ✨ Chào mừng bạn đến với thế giới của tôi!';
    state.avatar = 'assets/avatar_abg.jpg';
    state.theme = 'rainy_night';
    state.links = [
      { id: 1, title: '🎨 Bộ sưu tập Tarot Art', url: 'https://behance.net' },
      { id: 2, title: '☕ Đặt vẽ tranh chân dung cá nhân', url: 'https://facebook.com' }
    ];
  } else if (creatorKey === 'kira') {
    state.name = 'Kira Neon';
    state.username = 'kiraneon';
    state.bio = 'Cyberpunk Producer & DJ ⚡ Âm thanh tương lai từ Tokyo.';
    state.avatar = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80';
    state.theme = 'video_neon_loop';
    state.links = [
      { id: 1, title: '🎵 Nghe Set Nhạc Synthwave Mới', url: 'https://soundcloud.com' },
      { id: 2, title: '🎟️ Vé Tour Lưu Diễn 2026', url: 'https://spotify.com' }
    ];
  } else if (creatorKey === 'elena') {
    state.name = 'Elena Vu';
    state.username = 'elenavu';
    state.bio = 'Coffee Roaster & Lifestyle Vlogger ☕ Góc ấm áp của những hương vị.';
    state.avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80';
    state.theme = 'christmas';
    state.links = [
      { id: 1, title: '☕ Đăng ký Workshop Pha Cà Phê', url: 'https://instagram.com' },
      { id: 2, title: '📖 Cuốn sách: Hương Vị Mộc', url: 'https://amazon.com' }
    ];
  } else if (creatorKey === 'zen') {
    state.name = 'Zenith';
    state.username = 'zenith';
    state.bio = '3D Animator & Indie Game Dev 🌌 Đưa bạn vào những chiều không gian mới.';
    state.avatar = 'assets/avatar_abg.jpg';
    state.theme = 'video_galaxy_loop';
    state.links = [
      { id: 1, title: '🎮 Tải Game Demo Steam', url: 'https://store.steampowered.com' },
      { id: 2, title: '👾 Tham gia Discord Cộng Đồng', url: 'https://discord.com' }
    ];
  }

  applyTheme(state.theme);
  updatePublicBioView();
  switchMainView('public');
  showToast(`Đang xem hồ sơ mẫu của ${state.name}!`);
}

/* ==========================================================================
   AVATAR UPLOAD HANDLER
   ========================================================================== */

function compressImage(file, maxWidth = 400, maxHeight = 400, quality = 0.85) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

async function handleAvatarUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  showToast('Đang tối ưu ảnh đại diện...');
  const compressedAvatar = await compressImage(file);
  state.avatar = compressedAvatar || state.avatar || 'assets/avatar_abg.jpg';
  dom.avatarPreviewImg.src = state.avatar;
  updatePhonePreview();
  updatePublicBioView();
  saveCurrentBioToUser();
  showToast('Đã tải ảnh đại diện thành công!');
}

/* ==========================================================================
   KEY REQUIREMENT: CUSTOM VIDEO BACKGROUND UPLOAD HANDLER
   ========================================================================== */

function handleUserVideoUpload(e) {
  const file = e.target.files[0];
  if (file) {
    processSelectedVideoFile(file);
  }
}

async function processSelectedVideoFile(file) {
  if (!file.type.startsWith('video/')) {
    alert('Vui lòng chọn một tệp video hợp lệ (.mp4, .webm, .mov)!');
    return;
  }

  const formattedSize = formatFileSize(file.size);
  showToast('Đang tải video lên máy chủ...');

  try {
    const res = await fetch(`/api/upload-video?filename=${encodeURIComponent(file.name)}`, {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'video/mp4'
      },
      body: file
    });
    const data = await res.json();
    if (data.success && data.url) {
      setCustomVideo(data.url, file.name, formattedSize, true);
      saveCurrentBioToUser();
      showToast(`Đã lưu video nền vào máy chủ: ${file.name}`);
      return;
    }
  } catch (err) {
    console.error('Server video upload error:', err);
  }

  // Fallback to local blob URL if server upload fails
  const videoUrl = URL.createObjectURL(file);
  setCustomVideo(videoUrl, file.name, formattedSize, true);
  saveVideoToIndexedDB(file);
  saveCurrentBioToUser();
  showToast(`Đã áp dụng video nền: ${file.name}`);
}

function setCustomVideo(url, name, size, selectCard = true) {
  state.video.url = url;
  state.video.name = name;
  state.video.size = size;

  // Update Mini preview in card
  if (dom.miniVideoPreview) {
    dom.miniVideoPreview.src = url;
    dom.miniVideoPreview.muted = true;
    dom.miniVideoPreview.volume = 0;
    dom.miniVideoPreview.load();
    dom.miniVideoPreview.play().catch(() => {});
  }

  if (dom.loadedVideoName) dom.loadedVideoName.textContent = name;
  if (dom.loadedVideoSize) dom.loadedVideoSize.textContent = `${size} · Đang dùng làm nền`;

  if (dom.videoEmptyState) dom.videoEmptyState.classList.add('hidden');
  if (dom.videoLoadedState) dom.videoLoadedState.classList.remove('hidden');

  if (selectCard) {
    state.theme = 'custom_video';
    applyTheme('custom_video');
    updatePublicBioView();
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function applyOverlaySettings() {
  const opacity = state.video.overlay / 100;
  dom.bgOverlay.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
  dom.phoneDarkOverlay.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
}

function applyBlurSettings() {
  const blurVal = `${state.video.blur}px`;
  dom.bgVideo.style.filter = `blur(${blurVal})`;
  dom.bgImageLayer.style.filter = `blur(${blurVal})`;
  dom.phoneBgVideo.style.filter = `blur(${blurVal})`;
  dom.phoneBgImage.style.filter = `blur(${blurVal})`;
}

function updateAudioButtonUI(isMuted) {
  if (dom.videoMuteToggle) {
    if (isMuted) {
      dom.videoMuteToggle.classList.remove('active');
      const textElem = dom.videoMuteToggle.querySelector('.toggle-state');
      if (textElem) textElem.textContent = 'Tắt tiếng (Muted)';
    } else {
      dom.videoMuteToggle.classList.add('active');
      const textElem = dom.videoMuteToggle.querySelector('.toggle-state');
      if (textElem) textElem.textContent = 'Bật tiếng (Sound On)';
    }
  }
  if (dom.audioIconSvg) {
    if (isMuted) {
      dom.audioIconSvg.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>`;
    } else {
      dom.audioIconSvg.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>`;
    }
  }
}

function toggleAudioPlayback() {
  if (state.theme !== 'custom_video') {
    if (dom.bgVideo) dom.bgVideo.muted = true;
    if (dom.phoneBgVideo) {
      dom.phoneBgVideo.muted = true;
      dom.phoneBgVideo.volume = 0;
    }
    if (dom.btnToggleAudio) dom.btnToggleAudio.style.display = 'none';
    return;
  }

  state.video.muted = !state.video.muted;
  if (dom.bgVideo) {
    dom.bgVideo.muted = state.video.muted;
  }
  // Phone mockup video MUST ALWAYS REMAIN 100% MUTED to prevent double audio echo
  if (dom.phoneBgVideo) {
    dom.phoneBgVideo.muted = true;
    dom.phoneBgVideo.volume = 0;
  }

  updateAudioButtonUI(state.video.muted);

  if (state.video.muted) {
    showToast('Đã tắt tiếng video nền');
  } else {
    if (dom.bgVideo) {
      dom.bgVideo.play().catch(() => {});
    }
    showToast('Đã bật âm thanh video nền 🔊');
  }
  saveCurrentBioToUser();
}

/* ==========================================================================
   THEME ENGINE (Presets, Canvas Particles & Custom Video)
   ========================================================================== */

function applyTheme(themeId, targetBio = null) {
  if (!themeId) themeId = 'rainy_night';
  state.theme = themeId;

  // 1. Reset dynamic canvas particle effects (rain & snow)
  clearCanvasEffects();

  const isVideoTheme = (themeId === 'custom_video' || themeId === 'video_neon_loop' || themeId === 'video_galaxy_loop');

  // 2. Built-in non-video themes (rainy_night, winter, christmas, carbon, pride, cyber_glitch, glassy, chameleon, basic_dark):
  // Completely STOP, MUTE, STRIP SRC, and UNLOAD all videos to prevent any audio or residual playback!
  if (!isVideoTheme) {
    if (dom.bgVideo) {
      dom.bgVideo.pause();
      dom.bgVideo.muted = true;
      dom.bgVideo.currentTime = 0;
      dom.bgVideo.removeAttribute('src');
      dom.bgVideo.load();
      dom.bgVideo.classList.remove('active');
      dom.bgVideo.style.opacity = '0';
    }
    if (dom.phoneBgVideo) {
      dom.phoneBgVideo.pause();
      dom.phoneBgVideo.muted = true;
      dom.phoneBgVideo.volume = 0;
      dom.phoneBgVideo.currentTime = 0;
      dom.phoneBgVideo.removeAttribute('src');
      dom.phoneBgVideo.load();
      dom.phoneBgVideo.classList.remove('active');
      dom.phoneBgVideo.style.opacity = '0';
    }
    if (dom.btnToggleAudio) {
      dom.btnToggleAudio.style.display = 'none';
    }
  }

  // 3. Reset image and color layers to clean defaults
  dom.bgImageLayer.style.backgroundImage = '';
  dom.phoneBgImage.style.backgroundImage = '';
  dom.bgImageLayer.style.backgroundColor = 'transparent';
  dom.phoneBgImage.style.backgroundColor = 'transparent';
  dom.bgImageLayer.style.backgroundSize = 'cover';
  dom.phoneBgImage.style.backgroundSize = 'cover';
  dom.bgImageLayer.style.opacity = '1';
  dom.phoneBgImage.style.opacity = '1';

  // 4. Update Theme Card Active States in Step 6 Grid
  if (dom.themeGrid) {
    dom.themeGrid.querySelectorAll('.theme-card').forEach(card => {
      card.classList.toggle('active', card.dataset.themeId === themeId);
    });
  }

  // 5. Update Custom Video Uploader Box Visual State
  const customVideoCard = document.getElementById('customVideoCard');
  const btnUseCustomVideo = document.getElementById('btnUseCustomVideo');
  if (customVideoCard) {
    if (themeId === 'custom_video') {
      customVideoCard.classList.add('theme-active');
      if (btnUseCustomVideo) {
        btnUseCustomVideo.textContent = '✓ Đang dùng làm nền';
        btnUseCustomVideo.classList.add('active');
      }
      if (dom.loadedVideoSize) {
        dom.loadedVideoSize.textContent = `${state.video.size || ''} · Đang dùng làm nền`;
        dom.loadedVideoSize.style.color = '#34d399';
      }
    } else {
      customVideoCard.classList.remove('theme-active');
      if (btnUseCustomVideo) {
        btnUseCustomVideo.textContent = '▶ Dùng video này';
        btnUseCustomVideo.classList.remove('active');
      }
      if (dom.loadedVideoSize && state.video.url) {
        dom.loadedVideoSize.textContent = `${state.video.size || ''} · Đã lưu, bấm để chọn lại`;
        dom.loadedVideoSize.style.color = '#38bdf8';
      }
    }
  }

  // 6. Branch according to themeId
  if (themeId === 'custom_video') {
    const videoData = (targetBio && targetBio.video) ? targetBio.video : state.video;
    if (videoData && videoData.url) {
      // Mockup video: MUST ALWAYS BE 100% MUTED to prevent double audio echo!
      dom.phoneBgVideo.src = videoData.url;
      dom.phoneBgVideo.muted = true;
      dom.phoneBgVideo.volume = 0;
      dom.phoneBgVideo.autoplay = true;
      dom.phoneBgVideo.loop = true;
      dom.phoneBgVideo.setAttribute('playsinline', '');
      dom.phoneBgVideo.classList.add('active');
      dom.phoneBgVideo.style.opacity = '1';
      dom.phoneBgImage.style.opacity = '0';
      dom.phoneBgVideo.load();
      dom.phoneBgVideo.play().catch(() => {});

      // Full background video: Main page audio
      dom.bgVideo.src = videoData.url;
      const isMuted = (videoData.muted !== undefined) ? !!videoData.muted : true;
      dom.bgVideo.muted = isMuted;
      dom.bgVideo.autoplay = true;
      dom.bgVideo.loop = true;
      dom.bgVideo.setAttribute('playsinline', '');
      dom.bgVideo.classList.add('active');
      dom.bgVideo.style.opacity = '1';
      dom.bgImageLayer.style.opacity = '0';
      dom.bgVideo.load();
      const playPromise = dom.bgVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.log('Autoplay deferred:', e));
      }

      if (dom.btnToggleAudio) {
        dom.btnToggleAudio.style.display = 'inline-flex';
        updateAudioButtonUI(isMuted);
      }
      showToast('Đã kích hoạt Video nền tùy biến của bạn!');
    } else {
      // No custom video uploaded yet, fallback to rainy_night
      state.theme = 'rainy_night';
      applyTheme('rainy_night');
      return;
    }
  } else if (themeId === 'rainy_night') {
    dom.bgImageLayer.style.backgroundImage = "url('assets/rainy_city_night.jpg')";
    dom.phoneBgImage.style.backgroundImage = "url('assets/rainy_city_night.jpg')";
    startRainEffect();
    showToast('Đã chuyển sang chủ đề: Đêm mưa (Trực tiếp)');
  } else if (themeId === 'winter') {
    dom.bgImageLayer.style.backgroundImage = "url('assets/theme_winter.jpg')";
    dom.phoneBgImage.style.backgroundImage = "url('assets/theme_winter.jpg')";
    startSnowEffect();
    showToast('Đã chuyển sang chủ đề: Mùa đông tuyết rơi');
  } else if (themeId === 'christmas') {
    dom.bgImageLayer.style.backgroundImage = "url('assets/theme_christmas.jpg')";
    dom.phoneBgImage.style.backgroundImage = "url('assets/theme_christmas.jpg')";
    showToast('Đã chuyển sang chủ đề: Giáng sinh ấm áp');
  } else if (themeId === 'carbon') {
    dom.bgImageLayer.style.backgroundColor = '#121316';
    dom.bgImageLayer.style.backgroundImage = 'radial-gradient(#262933 15%, transparent 16%)';
    dom.bgImageLayer.style.backgroundSize = '12px 12px';
    dom.phoneBgImage.style.backgroundColor = '#121316';
    dom.phoneBgImage.style.backgroundImage = 'radial-gradient(#262933 15%, transparent 16%)';
    dom.phoneBgImage.style.backgroundSize = '12px 12px';
    showToast('Đã chuyển sang chủ đề: Cacbon tối giản');
  } else if (themeId === 'pride') {
    const prideGrad = 'linear-gradient(180deg, #3b82f6 0%, #10b981 35%, #f59e0b 70%, #ef4444 100%)';
    dom.bgImageLayer.style.backgroundImage = prideGrad;
    dom.phoneBgImage.style.backgroundImage = prideGrad;
    showToast('Đã chuyển sang chủ đề: Kiêu hãnh (Pride)');
  } else if (themeId === 'cyber_glitch') {
    const cyberBg = 'linear-gradient(rgba(0, 255, 204, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 204, 0.15) 1px, transparent 1px)';
    dom.bgImageLayer.style.backgroundColor = '#08080c';
    dom.bgImageLayer.style.backgroundImage = cyberBg;
    dom.bgImageLayer.style.backgroundSize = '16px 16px';
    dom.phoneBgImage.style.backgroundColor = '#08080c';
    dom.phoneBgImage.style.backgroundImage = cyberBg;
    dom.phoneBgImage.style.backgroundSize = '16px 16px';
    showToast('Đã chuyển sang chủ đề: Cyber Glitch');
  } else if (themeId === 'glassy') {
    const glassGrad = 'linear-gradient(135deg, #fbcfe8 0%, #f472b6 50%, #fb7185 100%)';
    dom.bgImageLayer.style.backgroundImage = glassGrad;
    dom.phoneBgImage.style.backgroundImage = glassGrad;
    showToast('Đã chuyển sang chủ đề: Glassy');
  } else if (themeId === 'chameleon') {
    const chamGrad = 'linear-gradient(180deg, #15803d 0%, #166534 100%)';
    dom.bgImageLayer.style.backgroundImage = chamGrad;
    dom.phoneBgImage.style.backgroundImage = chamGrad;
    showToast('Đã chuyển sang chủ đề: Tắc kè hoa xanh');
  } else if (themeId === 'basic_dark') {
    dom.bgImageLayer.style.backgroundColor = '#121214';
    dom.phoneBgImage.style.backgroundColor = '#121214';
    showToast('Đã chuyển sang chủ đề: Tối cơ bản');
  } else if (themeId === 'video_neon_loop' || themeId === 'video_galaxy_loop') {
    const videoSrc = PRESET_VIDEOS[themeId] || PRESET_VIDEOS.video_neon_loop;
    dom.bgVideo.src = videoSrc;
    dom.bgVideo.muted = true;
    dom.bgVideo.volume = 0;
    dom.bgVideo.autoplay = true;
    dom.bgVideo.loop = true;
    dom.bgVideo.setAttribute('playsinline', '');
    dom.bgVideo.classList.add('active');
    dom.bgVideo.style.opacity = '1';
    dom.bgImageLayer.style.opacity = '0';
    dom.bgVideo.load();
    dom.bgVideo.play().catch(() => {});

    dom.phoneBgVideo.src = videoSrc;
    dom.phoneBgVideo.muted = true;
    dom.phoneBgVideo.volume = 0;
    dom.phoneBgVideo.autoplay = true;
    dom.phoneBgVideo.loop = true;
    dom.phoneBgVideo.setAttribute('playsinline', '');
    dom.phoneBgVideo.classList.add('active');
    dom.phoneBgVideo.style.opacity = '1';
    dom.phoneBgImage.style.opacity = '0';
    dom.phoneBgVideo.load();
    dom.phoneBgVideo.play().catch(() => {});

    if (dom.btnToggleAudio) dom.btnToggleAudio.style.display = 'none';

    showToast(themeId === 'video_neon_loop' ? 'Đã chuyển sang video: Neon Cyber City' : 'Đã chuyển sang video: Vũ trụ Galaxy');
  }

  // 7. Apply overlay & blur filters
  applyOverlaySettings();
  applyBlurSettings();

  // 8. Sync studio phone clone if in split view
  syncStudioPhoneClone();
}

/* ==========================================================================
   DYNAMIC CANVASES: RAINDROPS & FALLING SNOW
   ========================================================================== */

function initCanvasEffects() {
  const resizeCanvases = () => {
    dom.ambientEffectCanvas.width = window.innerWidth;
    dom.ambientEffectCanvas.height = window.innerHeight;

    dom.phoneRainCanvas.width = dom.phonePreviewViewport.clientWidth || 310;
    dom.phoneRainCanvas.height = dom.phonePreviewViewport.clientHeight || 590;
  };
  window.addEventListener('resize', resizeCanvases);
  resizeCanvases();
}

function clearCanvasEffects() {
  if (activeAnimationId) {
    cancelAnimationFrame(activeAnimationId);
    activeAnimationId = null;
  }
  const ctx1 = dom.ambientEffectCanvas.getContext('2d');
  const ctx2 = dom.phoneRainCanvas.getContext('2d');
  ctx1.clearRect(0, 0, dom.ambientEffectCanvas.width, dom.ambientEffectCanvas.height);
  ctx2.clearRect(0, 0, dom.phoneRainCanvas.width, dom.phoneRainCanvas.height);
  rainDrops = [];
  snowFlakes = [];
}

function startRainEffect() {
  clearCanvasEffects();
  const count = 75;
  for (let i = 0; i < count; i++) {
    rainDrops.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      length: Math.random() * 25 + 15,
      speed: Math.random() * 8 + 12,
      opacity: Math.random() * 0.4 + 0.2
    });
  }

  const ctxMain = dom.ambientEffectCanvas.getContext('2d');
  const ctxPhone = dom.phoneRainCanvas.getContext('2d');

  function renderRain() {
    ctxMain.clearRect(0, 0, dom.ambientEffectCanvas.width, dom.ambientEffectCanvas.height);
    ctxPhone.clearRect(0, 0, dom.phoneRainCanvas.width, dom.phoneRainCanvas.height);

    ctxMain.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctxMain.lineWidth = 1.2;

    ctxPhone.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctxPhone.lineWidth = 1.2;

    rainDrops.forEach(drop => {
      // Main screen rain
      ctxMain.beginPath();
      ctxMain.moveTo(drop.x, drop.y);
      ctxMain.lineTo(drop.x - 2, drop.y + drop.length);
      ctxMain.stroke();

      // Phone screen rain scaled
      const phoneX = (drop.x / window.innerWidth) * dom.phoneRainCanvas.width;
      const phoneY = (drop.y / window.innerHeight) * dom.phoneRainCanvas.height;
      ctxPhone.beginPath();
      ctxPhone.moveTo(phoneX, phoneY);
      ctxPhone.lineTo(phoneX - 1, phoneY + drop.length * 0.7);
      ctxPhone.stroke();

      drop.y += drop.speed;
      drop.x -= 1;
      if (drop.y > window.innerHeight) {
        drop.y = -drop.length;
        drop.x = Math.random() * window.innerWidth;
      }
    });

    activeAnimationId = requestAnimationFrame(renderRain);
  }
  renderRain();
}

function startSnowEffect() {
  clearCanvasEffects();
  const count = 60;
  for (let i = 0; i < count; i++) {
    snowFlakes.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 3 + 1,
      speed: Math.random() * 1.5 + 0.8,
      wind: Math.random() * 0.8 - 0.4
    });
  }

  const ctxMain = dom.ambientEffectCanvas.getContext('2d');
  const ctxPhone = dom.phoneRainCanvas.getContext('2d');

  function renderSnow() {
    ctxMain.clearRect(0, 0, dom.ambientEffectCanvas.width, dom.ambientEffectCanvas.height);
    ctxPhone.clearRect(0, 0, dom.phoneRainCanvas.width, dom.phoneRainCanvas.height);

    ctxMain.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctxPhone.fillStyle = 'rgba(255, 255, 255, 0.75)';

    snowFlakes.forEach(flake => {
      ctxMain.beginPath();
      ctxMain.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      ctxMain.fill();

      const phoneX = (flake.x / window.innerWidth) * dom.phoneRainCanvas.width;
      const phoneY = (flake.y / window.innerHeight) * dom.phoneRainCanvas.height;
      ctxPhone.beginPath();
      ctxPhone.arc(phoneX, phoneY, flake.radius * 0.8, 0, Math.PI * 2);
      ctxPhone.fill();

      flake.y += flake.speed;
      flake.x += flake.wind;
      if (flake.y > window.innerHeight) {
        flake.y = -5;
        flake.x = Math.random() * window.innerWidth;
      }
    });

    activeAnimationId = requestAnimationFrame(renderSnow);
  }
  renderSnow();
}

/* ==========================================================================
   CUSTOM LINKS & SOCIAL HANDLERS
   ========================================================================== */

function addNewLinkRow() {
  const newId = Date.now();
  const newRow = document.createElement('div');
  newRow.className = 'custom-link-row';
  newRow.dataset.id = newId;
  newRow.innerHTML = `
    <div class="row-field">
      <label class="input-sublabel">Tên liên kết</label>
      <input type="text" class="input-modern link-title-input" value="Liên kết mới" placeholder="Ví dụ: Trang Facebook, Portfolio...">
    </div>
    <div class="row-field">
      <label class="input-sublabel">URL</label>
      <input type="text" class="input-modern link-url-input" value="https://" placeholder="https://...">
    </div>
  `;
  dom.customLinksList.appendChild(newRow);

  state.links.push({ id: newId, title: 'Liên kết mới', url: 'https://' });
  bindCustomLinkInputs();
  updatePhonePreview();
  updatePublicBioView();
  saveCurrentBioToUser();
}

function bindCustomLinkInputs() {
  const rows = dom.customLinksList.querySelectorAll('.custom-link-row');
  state.links = [];

  rows.forEach(row => {
    const titleInput = row.querySelector('.link-title-input');
    const urlInput = row.querySelector('.link-url-input');

    const updateLinkData = () => {
      const idx = state.links.findIndex(l => l.rowElem === row);
      if (idx !== -1) {
        state.links[idx].title = titleInput.value.trim() || 'Liên kết';
        state.links[idx].url = urlInput.value.trim() || '#';
      }
      updatePhonePreview();
      updatePublicBioView();
      saveCurrentBioToUser();
    };

    titleInput.oninput = updateLinkData;
    urlInput.oninput = updateLinkData;

    state.links.push({
      rowElem: row,
      title: titleInput.value.trim() || 'Liên kết',
      url: urlInput.value.trim() || '#'
    });
  });
}

function bindSocialHandleInputs() {
  const insta = document.getElementById('socialInstagramInput');
  const tiktok = document.getElementById('socialTiktokInput');
  const yt = document.getElementById('socialYoutubeInput');

  if (insta) insta.addEventListener('input', (e) => { state.socials.instagram = e.target.value; updatePhonePreview(); updatePublicBioView(); saveCurrentBioToUser(); });
  if (tiktok) tiktok.addEventListener('input', (e) => { state.socials.tiktok = e.target.value; updatePhonePreview(); updatePublicBioView(); saveCurrentBioToUser(); });
  if (yt) yt.addEventListener('input', (e) => { state.socials.youtube = e.target.value; updatePhonePreview(); updatePublicBioView(); saveCurrentBioToUser(); });
}

function syncSocialInputsWithPlatforms() {
  // Reserved for dynamic field triggers
}

/* ==========================================================================
   PHONE MOCKUP & FULL PUBLIC BIO SYNCHRONIZATION
   ========================================================================== */

function updatePhonePreview() {
  dom.phoneAvatarImg.src = state.avatar;
  dom.phoneUserName.textContent = state.name;
  dom.phoneUserBio.textContent = state.bio;

  // Custom links
  dom.phoneLinksContainer.innerHTML = '';
  state.links.forEach(link => {
    const a = document.createElement('a');
    a.href = normalizeExternalUrl(link.url);
    a.className = 'phone-link-pill';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.innerHTML = `<span>${escapeHtml(link.title)}</span>`;
    dom.phoneLinksContainer.appendChild(a);
  });

  // Social icons inside phone
  dom.phoneSocialRow.innerHTML = '';
  const socialsMeta = [
    { key: 'instagram', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>` },
    { key: 'tiktok', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.33 6.33 0 0 0 6.33-6.32V8.6a8.28 8.28 0 0 0 4.84 1.55V6.69h-.92z"/></svg>` },
    { key: 'youtube', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>` },
    { key: 'facebook', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>` }
  ];

  socialsMeta.forEach(sm => {
    if (state.socials[sm.key]) {
      const btn = document.createElement('a');
      btn.href = normalizeExternalUrl(state.socials[sm.key]);
      btn.className = 'phone-social-icon-btn';
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
      btn.innerHTML = sm.icon;
      dom.phoneSocialRow.appendChild(btn);
    }
  });
}

let currentViewingPublicBio = null;

function updatePublicBioView(bioData = null, isOwner = null) {
  const data = bioData || state;
  const owner = isOwner !== null ? isOwner : (
    currentUser && (
      (currentUser.username && currentUser.username.toLowerCase() === (data.username || state.username || '').toLowerCase()) ||
      (currentUser.email && currentUser.email.toLowerCase() === (data.email || '').toLowerCase())
    )
  );

  currentViewingPublicBio = { data, isOwner: !!owner };

  if (dom.publicAvatarImg) dom.publicAvatarImg.src = data.avatar || 'assets/avatar_abg.jpg';
  if (dom.publicUserName) dom.publicUserName.textContent = data.name || data.username || 'Người dùng';
  if (dom.publicUserBio) dom.publicUserBio.textContent = data.bio !== undefined ? data.bio : '';

  // Render Public links
  if (dom.publicLinksList) {
    dom.publicLinksList.innerHTML = '';
    const links = Array.isArray(data.links) ? data.links : [];
    links.forEach(link => {
      const card = document.createElement('a');
      card.href = normalizeExternalUrl(link.url);
      card.className = 'public-link-card';
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.innerHTML = `<span>${escapeHtml(link.title)}</span>`;
      dom.publicLinksList.appendChild(card);
    });
  }

  // Render Public Social Row
  if (dom.publicSocialIconsRow) {
    dom.publicSocialIconsRow.innerHTML = '';
    const socialsMeta = [
      { key: 'instagram', icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>` },
      { key: 'tiktok', icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.33 6.33 0 0 0 6.33-6.32V8.6a8.28 8.28 0 0 0 4.84 1.55V6.69h-.92z"/></svg>` },
      { key: 'youtube', icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>` },
      { key: 'facebook', icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>` }
    ];

    const soc = data.socials || {};
    socialsMeta.forEach(sm => {
      if (soc[sm.key]) {
        const btn = document.createElement('a');
        btn.href = normalizeExternalUrl(soc[sm.key]);
        btn.className = 'public-social-btn';
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        btn.innerHTML = sm.icon;
        dom.publicSocialIconsRow.appendChild(btn);
      }
    });
  }

  // Update button in header overlay
  if (dom.btnExitPublicBio) {
    if (owner) {
      dom.btnExitPublicBio.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Chỉnh sửa Bio
      `;
      dom.btnExitPublicBio.title = 'Quay lại trình chỉnh sửa';
      if (dom.btnFloatingVideoUpload) dom.btnFloatingVideoUpload.style.display = 'inline-flex';
      if (dom.btnSavePublicBio) dom.btnSavePublicBio.style.display = 'inline-flex';
    } else {
      dom.btnExitPublicBio.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Trang chủ Bio Link
      `;
      dom.btnExitPublicBio.title = 'Về trang chủ';
      if (dom.btnFloatingVideoUpload) dom.btnFloatingVideoUpload.style.display = 'none';
      if (dom.btnSavePublicBio) dom.btnSavePublicBio.style.display = 'none';
    }
  }

  // Audio Toggle Button: ONLY show if current theme is custom_video AND has a video URL
  const activeTheme = data.theme || state.theme || 'rainy_night';
  const hasCustomVideo = activeTheme === 'custom_video' && ((data.video && data.video.url) || (state.video && state.video.url));
  if (dom.btnToggleAudio) {
    if (hasCustomVideo) {
      dom.btnToggleAudio.style.display = 'inline-flex';
      const isMuted = (data.video && data.video.muted !== undefined) ? data.video.muted : state.video.muted;
      updateAudioButtonUI(isMuted);
    } else {
      dom.btnToggleAudio.style.display = 'none';
    }
  }
}

function syncStudioPhoneClone() {
  const stage = document.querySelector('.phone-presentation-stage');
  if (stage && dom.studioPhoneMockupSlot) {
    dom.studioPhoneMockupSlot.innerHTML = '';
    const clone = stage.cloneNode(true);
    // Ensure all cloned videos are strictly muted to prevent duplicate audio
    clone.querySelectorAll('video').forEach(v => {
      v.muted = true;
      v.volume = 0;
      v.pause();
    });
    dom.studioPhoneMockupSlot.appendChild(clone);
  }
}

function renderStudioPane(paneId) {
  const container = dom.studioPaneContainer;
  if (!container) return;

  if (paneId === 'pane-profile') {
    container.innerHTML = `
      <div class="form-group-floating">
        <label class="input-label">Tên hiển thị</label>
        <input type="text" id="studioNameInput" class="input-modern" value="${escapeHtml(state.name)}">
      </div>
      <div class="form-group-floating">
        <label class="input-label">Tiểu sử (Bio)</label>
        <textarea id="studioBioInput" class="textarea-modern">${escapeHtml(state.bio)}</textarea>
      </div>
      <div class="form-group-floating">
        <label class="input-label">Ảnh đại diện</label>
        <button type="button" class="btn-gradient-submit" id="btnStudioChangeAvatar" style="padding: 10px 16px; font-size: 14px;">Đổi ảnh đại diện</button>
      </div>
    `;
    document.getElementById('studioNameInput').oninput = (e) => {
      state.name = e.target.value;
      updatePhonePreview();
      updatePublicBioView();
      syncStudioPhoneClone();
      saveCurrentBioToUser();
    };
    document.getElementById('studioBioInput').oninput = (e) => {
      state.bio = e.target.value;
      updatePhonePreview();
      updatePublicBioView();
      syncStudioPhoneClone();
      saveCurrentBioToUser();
    };
    document.getElementById('btnStudioChangeAvatar').onclick = () => dom.avatarFileInput.click();
  } else if (paneId === 'pane-links') {
    container.innerHTML = `
      <h3 style="font-size: 16px; margin-bottom: 12px; font-weight: 700;">Danh sách liên kết</h3>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">Chỉnh sửa liên kết hiển thị trên trang Bio của bạn.</p>
      <div id="studioLinksWrapper" style="display: flex; flex-direction: column; gap: 12px;"></div>
      <button type="button" id="btnStudioAddLink" class="btn-add-more" style="margin-top: 14px;">+ Thêm liên kết mới</button>
    `;
    const wrapper = document.getElementById('studioLinksWrapper');
    state.links.forEach((link, idx) => {
      const card = document.createElement('div');
      card.style.cssText = 'background: #1e2026; padding: 12px; border-radius: 12px; display: flex; flex-direction: column; gap: 8px;';
      card.innerHTML = `
        <input type="text" class="input-modern" style="padding: 8px 12px;" value="${escapeHtml(link.title)}" placeholder="Tên liên kết">
        <input type="text" class="input-modern" style="padding: 8px 12px;" value="${escapeHtml(link.url)}" placeholder="URL">
      `;
      const inputs = card.querySelectorAll('input');
      inputs[0].oninput = (e) => {
        state.links[idx].title = e.target.value;
        updatePhonePreview();
        updatePublicBioView();
        syncStudioPhoneClone();
        saveCurrentBioToUser();
      };
      inputs[1].oninput = (e) => {
        state.links[idx].url = e.target.value;
        updatePhonePreview();
        updatePublicBioView();
        syncStudioPhoneClone();
        saveCurrentBioToUser();
      };
      wrapper.appendChild(card);
    });
    document.getElementById('btnStudioAddLink').onclick = () => {
      state.links.push({ id: Date.now(), title: 'Liên kết mới', url: 'https://' });
      renderStudioPane('pane-links');
      updatePhonePreview();
      updatePublicBioView();
      syncStudioPhoneClone();
      saveCurrentBioToUser();
    };
  } else if (paneId === 'pane-themes') {
    const studioThemes = [
      { id: 'rainy_night', name: 'Đêm mưa · Trực tiếp', badge: 'Mưa rơi' },
      { id: 'winter', name: 'Mùa đông · Trực tiếp', badge: 'Tuyết rơi' },
      { id: 'christmas', name: 'Giáng sinh', badge: 'Cozy' },
      { id: 'carbon', name: 'Cacbon', badge: 'Pattern' },
      { id: 'pride', name: 'Kiêu hãnh', badge: 'Gradient' },
      { id: 'cyber_glitch', name: 'Cyber Glitch', badge: 'Neon' },
      { id: 'glassy', name: 'Glassy', badge: 'Kính mờ' },
      { id: 'chameleon', name: 'Tắc kè hoa', badge: 'Sắc xanh' },
      { id: 'basic_dark', name: 'Tối cơ bản', badge: 'Cổ điển' },
      { id: 'video_neon_loop', name: 'Neon Thành Phố', badge: 'Video' },
      { id: 'video_galaxy_loop', name: 'Vũ Trụ Galaxy', badge: 'Video' }
    ];

    let customVideoHtml = '';
    if (state.video && state.video.url) {
      const isCustomActive = state.theme === 'custom_video';
      customVideoHtml = `
        <div style="background: ${isCustomActive ? 'rgba(56, 189, 248, 0.15)' : '#181920'}; border: 1.5px solid ${isCustomActive ? '#38bdf8' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 14px; margin-bottom: 18px; display: flex; align-items: center; gap: 14px;">
          <div style="width: 70px; height: 46px; border-radius: 8px; overflow: hidden; background: #000; position: relative; flex-shrink: 0;">
            <video src="${state.video.url}" style="width: 100%; height: 100%; object-fit: cover;" muted playsinline autoplay loop></video>
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 13px; font-weight: 700; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(state.video.name || 'custom_video.mp4')}</div>
            <div style="font-size: 11px; color: ${isCustomActive ? '#34d399' : '#94a3b8'}; margin-top: 2px;">${isCustomActive ? '✓ Đang dùng làm nền' : 'Đã lưu trong máy'}</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${!isCustomActive ? `<button type="button" id="btnStudioActivateVideo" class="btn-use-custom-video" style="padding: 4px 10px; font-size: 11px;">▶ Dùng video này</button>` : ''}
            <button type="button" id="btnStudioChangeVideo" style="font-size: 11px; color: #38bdf8; background: transparent; border: none; cursor: pointer; text-decoration: underline;">Đổi video khác</button>
          </div>
        </div>
      `;
    } else {
      customVideoHtml = `
        <button type="button" class="btn-gradient-submit" id="btnStudioUploadVideo" style="width: 100%; margin-bottom: 18px; padding: 10px 16px; font-size: 13px;">🎬 Tải video từ máy làm hình nền</button>
      `;
    }

    container.innerHTML = `
      <h3 style="font-size: 16px; margin-bottom: 6px; font-weight: 700;">Video nền & Chủ đề</h3>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">Chọn từ bộ sưu tập có sẵn hoặc dùng video từ máy tính của bạn.</p>

      ${customVideoHtml}

      <h4 style="font-size: 14px; font-weight: 700; color: #ffffff; margin-bottom: 10px;">Bộ sưu tập chủ đề có sẵn:</h4>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;" id="studioThemeGrid">
        ${studioThemes.map(t => {
          const isActive = state.theme === t.id;
          return `
            <button type="button" class="studio-theme-pill-btn" data-theme-id="${t.id}" style="text-align: left; background: ${isActive ? 'rgba(236, 72, 153, 0.2)' : '#1e2026'}; border: 1.5px solid ${isActive ? 'var(--accent-pink)' : 'rgba(255, 255, 255, 0.08)'}; border-radius: 10px; padding: 10px 12px; cursor: pointer; transition: all 0.2s ease;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 13px; font-weight: 700; color: ${isActive ? '#fff' : '#e2e8f0'};">${escapeHtml(t.name)}</span>
                <span style="font-size: 10px; padding: 2px 6px; border-radius: 12px; background: rgba(255,255,255,0.08); color: #cbd5e1;">${escapeHtml(t.badge)}</span>
              </div>
            </button>
          `;
        }).join('')}
      </div>

      <div style="display: flex; flex-direction: column; gap: 14px; background: #181920; padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px;">
            <span>Độ tối lớp phủ (Overlay)</span>
            <span id="studioOverlayVal" style="font-weight: 700; color: #fff;">${state.video.overlay}%</span>
          </div>
          <input type="range" id="studioOverlayRange" min="0" max="85" value="${state.video.overlay}" style="width: 100%;">
        </div>
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px;">
            <span>Độ mờ điện ảnh (Blur)</span>
            <span id="studioBlurVal" style="font-weight: 700; color: #fff;">${state.video.blur}px</span>
          </div>
          <input type="range" id="studioBlurRange" min="0" max="20" value="${state.video.blur}" style="width: 100%;">
        </div>
      </div>
    `;

    if (document.getElementById('btnStudioUploadVideo')) {
      document.getElementById('btnStudioUploadVideo').onclick = () => dom.userVideoFileInput.click();
    }
    if (document.getElementById('btnStudioChangeVideo')) {
      document.getElementById('btnStudioChangeVideo').onclick = () => dom.userVideoFileInput.click();
    }
    if (document.getElementById('btnStudioActivateVideo')) {
      document.getElementById('btnStudioActivateVideo').onclick = () => {
        applyTheme('custom_video');
        saveCurrentBioToUser();
        renderStudioPane('pane-themes');
      };
    }

    container.querySelectorAll('.studio-theme-pill-btn').forEach(btn => {
      btn.onclick = () => {
        const themeId = btn.dataset.themeId;
        applyTheme(themeId);
        saveCurrentBioToUser();
        renderStudioPane('pane-themes');
      };
    });

    const overlayRange = document.getElementById('studioOverlayRange');
    if (overlayRange) {
      overlayRange.oninput = (e) => {
        state.video.overlay = parseInt(e.target.value, 10);
        document.getElementById('studioOverlayVal').textContent = `${state.video.overlay}%`;
        applyOverlaySettings();
        saveCurrentBioToUser();
      };
    }

    const blurRange = document.getElementById('studioBlurRange');
    if (blurRange) {
      blurRange.oninput = (e) => {
        state.video.blur = parseInt(e.target.value, 10);
        document.getElementById('studioBlurVal').textContent = `${state.video.blur}px`;
        applyBlurSettings();
        saveCurrentBioToUser();
      };
    }
  } else if (paneId === 'pane-settings') {
    container.innerHTML = `
      <h3 style="font-size: 16px; margin-bottom: 8px; font-weight: 700;">Cài đặt chung</h3>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">Tùy chỉnh hiển thị và quyền riêng tư.</p>
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <label style="display: flex; align-items: center; justify-content: space-between; font-size: 14px;">
          <span>Hiển thị huy hiệu xác thực</span>
          <input type="checkbox" checked style="width: 18px; height: 18px;">
        </label>
        <label style="display: flex; align-items: center; justify-content: space-between; font-size: 14px;">
          <span>Hiệu ứng kính mờ (Glassmorphism)</span>
          <input type="checkbox" checked style="width: 18px; height: 18px;">
        </label>
      </div>
    `;
  }
}

/* ==========================================================================
   INDEXEDDB FOR PERSISTENT LOCAL VIDEO STORAGE
   ========================================================================== */

let db = null;
function initIndexedDB() {
  const request = indexedDB.open('BioLinkDB', 1);
  request.onupgradeneeded = (e) => {
    const database = e.target.result;
    if (!database.objectStoreNames.contains('videos')) {
      database.createObjectStore('videos', { keyPath: 'id' });
    }
  };
  request.onsuccess = (e) => {
    db = e.target.result;
    loadSavedVideo();
  };
}

function saveVideoToIndexedDB(file) {
  if (!db) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const arrayBuffer = e.target.result;
    const tx = db.transaction('videos', 'readwrite');
    const store = tx.objectStore('videos');
    store.put({
      id: 'custom_background',
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      data: arrayBuffer
    });
  };
  reader.readAsArrayBuffer(file);
}

function loadSavedVideo() {
  if (!db) return;
  const tx = db.transaction('videos', 'readonly');
  const store = tx.objectStore('videos');
  const request = store.get('custom_background');
  request.onsuccess = (e) => {
    const record = e.target.result;
    if (record && record.data) {
      const blob = new Blob([record.data], { type: record.type });
      const videoUrl = URL.createObjectURL(blob);
      setCustomVideo(videoUrl, record.name, record.size, false);
    }
  };
}

/* ==========================================================================
   HELPERS & SHARING
   ========================================================================== */

function copyBioLinkToClipboard() {
  const u = state.username || (currentUser ? currentUser.username : 'anh01');
  const base = window.location.origin;
  const bioUrl = `${base}/${encodeURIComponent(u)}`;
  navigator.clipboard.writeText(bioUrl).then(() => {
    showToast(`Đã sao chép liên kết Bio Link (${bioUrl})!`);
  }).catch(() => {
    showToast('Đã sao chép liên kết Bio!');
  });
}

function showToast(message) {
  dom.toastMessage.textContent = message;
  dom.toastNotification.classList.remove('hidden-toast');
  setTimeout(() => {
    dom.toastNotification.classList.add('hidden-toast');
  }, 3200);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}
