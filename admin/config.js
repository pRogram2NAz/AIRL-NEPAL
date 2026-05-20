/* ==========================================================
   AIRL Nepal – Admin configuration & static credentials
   ========================================================== */

const AIRL_CONFIG = {
  // In a purely static environment we store credentials locally.
  // Note: For actual deployment, replace or configure a backend.
  auth: {
    username: "admin",
    password: "password123" // Safe static defaults
  }
};
window.AIRL_CONFIG = AIRL_CONFIG;
