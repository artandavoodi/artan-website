// assets/js/auth.js

// Reference to Firebase Auth
const authInstance = firebase.auth();

// Monitor user state
authInstance.onAuthStateChanged((user) => {
  if (user) {
    console.log("User signed in:", user);

    // Update profile page dynamically
    const nameEl = document.getElementById("profile-name");
    const emailEl = document.getElementById("profile-email");

    if(nameEl) nameEl.textContent = user.displayName || "No Name";
    if(emailEl) emailEl.textContent = user.email;
  } else {
    console.log("No user signed in");
    // Optional: redirect to homepage if not logged in
    if(window.location.pathname.includes("profile.html")) {
      window.location.href = "index.html";
    }
  }
});

// Logout function
function logout() {
  authInstance.signOut().then(() => {
    console.log("User logged out");
    window.location.href = "index.html";
  });
}

// Optional: Google Login function (can be used elsewhere)
function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  authInstance.signInWithPopup(provider)
    .then((result) => {
      console.log("Google login success:", result.user);
      window.location.href = "profile.html";
    })
    .catch((error) => console.error("Login error:", error));
}