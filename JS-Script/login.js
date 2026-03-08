const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "admin123";

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");

// Login function
function login() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  // Check credentials
  if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("username", username);

    // Redirect to main page
    window.location.href = "main.html";
  } else {
    // If incorrect credentials - show Alert
    alert("Invalid username or password!");
  }
}

loginBtn.addEventListener("click", login);
