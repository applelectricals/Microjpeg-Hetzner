// ============================================
// ADD THIS TO YOUR routes.ts FILE
// ============================================

// Logout endpoint - handles user logout
// Add this near your other auth routes (login, signup, etc.)

app.post("/api/logout", async (req, res) => {
  try {
    // Clear the session
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("[Logout] Session destroy error:", err);
        }
      });
    }
    
    // Clear any auth cookies
    res.clearCookie('connect.sid'); // Express session cookie
    res.clearCookie('session'); // Alternative session cookie name
    res.clearCookie('auth_token'); // If you use JWT in cookies
    
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("[Logout] Error:", error);
    res.status(500).json({ success: false, error: "Logout failed" });
  }
});

// Also support GET for legacy/simple logout links
app.get("/api/logout", async (req, res) => {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("[Logout] Session destroy error:", err);
        }
      });
    }
    
    res.clearCookie('connect.sid');
    res.clearCookie('session');
    res.clearCookie('auth_token');
    
    // Redirect to home page for GET requests
    res.redirect('/');
  } catch (error) {
    console.error("[Logout] Error:", error);
    res.redirect('/');
  }
});

// Also add /api/auth/logout as an alias
app.post("/api/auth/logout", async (req, res) => {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("[Logout] Session destroy error:", err);
        }
      });
    }
    
    res.clearCookie('connect.sid');
    res.clearCookie('session');
    res.clearCookie('auth_token');
    
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("[Logout] Error:", error);
    res.status(500).json({ success: false, error: "Logout failed" });
  }
});
