// Default credentials
const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "admin123";

// DOM Elements
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");

// Login function
function login() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();


  // Check credentials
  if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
    // Success - show alert and redirect or do something
    alert("Login successful!");
    console.log("Login successful for user:", username);
    
  } else {
    // If incorrect credentials - show error
    alert("Invalid username or password!");
  }
}

// Event listeners
loginBtn.addEventListener("click", login);