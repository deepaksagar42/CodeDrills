  window.onload = async () => {
  const signinBtn = document.getElementById("signin-btn");
  const userDropdown = document.getElementById("user-dropdown");
  const usernameSpan = document.getElementById("username");
  const pastContest = document.getElementById("dashboard-actions");

  try {
    const res = await fetch("/api/me", { credentials: "include" });

    if (res.ok) {
      const data = await res.json();
      usernameSpan.textContent = data.username;
      signinBtn.classList.add("hidden");
      userDropdown.classList.remove("hidden");
      pastContest.classList.remove("hidden");
      window.isAuthenticated = true;

      // 👇👇 ADD THIS PART TO FETCH LIVE CONTESTS 👇👇
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
    signinBtn.classList.remove("hidden");
    userDropdown.classList.add("hidden");
    window.isAuthenticated = false;
  }

  attachProtection();
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
      window.location.href = "/home/home.html";
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
