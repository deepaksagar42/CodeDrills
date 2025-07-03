const loginBtn = document.getElementById("show-login");
const signupBtn = document.getElementById("show-signup");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

loginBtn.addEventListener("click", () => {
  loginForm.classList.add("active");
  signupForm.classList.remove("active");
  loginBtn.classList.add("active");
  signupBtn.classList.remove("active");
});

signupBtn.addEventListener("click", () => {
  signupForm.classList.add("active");
  loginForm.classList.remove("active");
  signupBtn.classList.add("active");
  loginBtn.classList.remove("active");
});

// Signup
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = signupForm.querySelector('input[type="email"]').value.trim();
  const username = signupForm.querySelector('input[type="text"]').value.trim();
  const password = signupForm.querySelector('input[type="password"]').value;

  const res = await fetch("https://codedrills.onrender.com/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password }),
    credentials: "include",
  });

  const data = await res.json();
  alert(data.message || data.error);

  if (res.ok)
     {
        localStorage.setItem("username", data.username);
        localStorage.setItem("email", data.email);
       window.location.href = "/home/home.html";
        } else {
    alert(data.message || "Login failed");
  
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const identifier = loginForm.querySelector('input[type="text"]').value.trim();
  const password = loginForm.querySelector('input[type="password"]').value;

  const res = await fetch("https://codedrills.onrender.com/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
    credentials: "include",
  });

  const data = await res.json();
  alert(data.message || data.error);

  if (res.ok) {
    localStorage.setItem("username", data.username);
    localStorage.setItem("email", data.email);
    localStorage.setItem("userId", data.userId);
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    const contestId = params.get("id");

    if (redirect === "contest" && contestId) {
      // ✅ Redirect to join-contest page with contest ID
      window.location.href = `/join-contest.html?id=${contestId}&redirect=contest`;
    } else {
      window.location.href = "/home/home.html";
    }
  }
});