  window.onload = async () => {
  const signinBtn = document.getElementById("signin-btn");
  const userDropdown = document.getElementById("user-dropdown");
  const usernameSpan = document.getElementById("username");
  const pastContest = document.getElementById("dashboard-actions");

  const guestSection = document.getElementById("guest-hero");
  const whyUsSection = document.getElementById("why-us");
  const footer = document.getElementById("foot");

  try {
    const res = await fetch("/api/me", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      usernameSpan.textContent = data.username;
      signinBtn.classList.add("hidden");
      userDropdown.classList.remove("hidden");
      pastContest.classList.remove("hidden");
      window.isAuthenticated = true;

       if (guestSection) guestSection.style.display = "none";
      if (whyUsSection) whyUsSection.style.display = "none";
      if (footer) footer.style.display = "none";

       attachProtection();
      fetch(`/api/contests/live?username=${data.username}`)
        .then(res => res.json())
        .then(({ liveContests }) => {
          const container = document.getElementById("live-contests");

          if (liveContests.length > 0) {
            const heading = document.createElement("h2");
            heading.className = "text-xl font-semibold mb-2";
            heading.textContent = "🔥 Your Live Contests";
            container.appendChild(heading);
          }

          liveContests.forEach(contest => {
            const card = document.createElement("div");
            card.className = "bg-gray-800 p-4 rounded shadow hover:bg-gray-700 transition";
            card.innerHTML = `
              <h3 class="text-lg font-bold">${contest.name}</h3>
              <p class="text-sm text-gray-300">Started: ${new Date(contest.startTime).toLocaleString()}</p>
              <a href="/contest/contest.html?id=${contest._id}" class="text-blue-400 hover:underline mt-2 inline-block">Go to Contest →</a>
            `;
            container.appendChild(card);
          });
        })
        .catch(err => {
          console.error("Error loading live contests:", err);
        });
      // ☝️☝️ END OF LIVE CONTEST FETCH BLOCK ☝️☝️
    } else {
      throw new Error("Not logged in");
    }
  } catch (err) {
    attachProtection();
    signinBtn.classList.remove("hidden");
    userDropdown.classList.add("hidden");
    window.isAuthenticated = false;
      if (guestSection) guestSection.style.display = "block";
    if (whyUsSection) whyUsSection.style.display = "block";
    if (footer) footer.style.display = "block";
  }

};

    document.getElementById("signin-btn").addEventListener("click", () => {
      window.location.href = "/login/login.html";
    });


    document.getElementById("user-toggle").addEventListener("click", () => {
      document.getElementById("dropdown-menu").classList.toggle("hidden");
    });

    document.getElementById("logout-btn").addEventListener("click", async () => {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      sessionStorage.removeItem("username");
      window.isAuthenticated = false;
      localStorage.removeItem("isLogged");
      window.location.href = "../Home/home.html";
    });

    // 👇 Protect links
    function attachProtection() {
      document.querySelectorAll(".require-login").forEach((item) => {
        item.addEventListener("click", (e) => {
          if (!window.isAuthenticated) {
            e.preventDefault();
            alert("Please login to use this feature.");
            window.location.href = "/login/login.html";
          }
        });
      });
    }
   
 
 const heartBtn = document.getElementById("heart-btn");
const likeCount = document.getElementById("like-count");

// 🔄 Fetch initial like data when page loads
async function fetchLikeData() {
  try {
    const res = await fetch("/api/ratings", {
      credentials: "include" // ✅ send session cookie
    });

    if (!res.ok) throw new Error("Failed to fetch rating");

    const data = await res.json();
    likeCount.textContent = data.likes;

    if (data.liked) {
      heartBtn.classList.add("text-red-500"); // already liked
      heartBtn.disabled = true; // prevent re-click
    }
  } catch (err) {
    console.error("Error loading like data:", err);
  }
}

// ❤️ Handle like click
heartBtn.addEventListener("click", async () => {
  if (!window.isAuthenticated) {
    alert("Please login to like.");
    return;
  }

  try {
    const res = await fetch("/api/ratings/like", {
      method: "POST",
      credentials: "include"
    });

    if (!res.ok) {
      if (res.status === 401) {
        alert("Please login to like.");
      } else {
        alert("Failed to submit like.");
      }
      return;
    }

    const data = await res.json();
    likeCount.textContent = data.likes;
    heartBtn.classList.add("text-red-500");
    heartBtn.disabled = true; // prevent re-click
  } catch (err) {
    console.error("Error liking the post:", err);
  }
});

// ⏬ Initial fetch on load
fetchLikeData();
