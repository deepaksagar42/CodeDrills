(async () => {
  const contestListEl = document.getElementById("contestList");
  const username = localStorage.getItem("username");
  if (!username) return (window.location.href = "/login/login.html");

  try {
    const res = await fetch(`http://localhost:3000/api/user-contests/${username}`);
    const data = await res.json();

    const now = new Date();
    const upcoming = data.contests.filter(c => new Date(c.startTime) > now);

    if (!upcoming.length) {
      contestListEl.innerHTML = `<p class="text-gray-400 text-center">No upcoming contests found.</p>`;
      return;
    }

    contestListEl.innerHTML = "";

    upcoming.forEach(contest => {
      const wrapper = document.createElement("div");
      wrapper.className = "bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 space-y-3";

      const countdownId = `countdown-${contest._id}`;
      const signupsId = `signups-${contest._id}`;
      const toggleBtnId = `toggle-${contest._id}`;

      wrapper.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div class="space-y-1">
            <h2 class="text-xl font-semibold text-blue-400">${contest.name}</h2>
            <p><span class="font-medium text-gray-300">Created by:</span> ${contest.createdBy}</p>
            <p><span class="font-medium text-gray-300">Organizer:</span> ${contest.orgName}</p>
            <span id="${countdownId}" class="text-yellow-400 font-mono block mt-2 text-sm sm:text-base">⏳ Loading...</span>
          </div>
          <button id="${toggleBtnId}" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-3 sm:mt-0 text-sm">👥 View Registered</button>
        </div>
        <div id="${signupsId}" class="hidden mt-4"></div>
      `;

      contestListEl.appendChild(wrapper);

      // Countdown logic
      const startTime = new Date(contest.startTime);
      const countdownEl = document.getElementById(countdownId);

      const updateCountdown = () => {
        const now = new Date();
        const diff = startTime - now;

        if (diff <= 0) {
          countdownEl.textContent = "⏳ Started";
          return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        countdownEl.textContent = `⏳ ${d}d ${h}h ${m}m ${s}s`;
      };

      updateCountdown();
      setInterval(updateCountdown, 1000);

      // Toggle registered users
      const toggleBtn = document.getElementById(toggleBtnId);
      const signupsDiv = document.getElementById(signupsId);

      toggleBtn.addEventListener("click", async () => {
        if (signupsDiv.classList.contains("hidden")) {
          signupsDiv.innerHTML = `<p class="text-sm text-gray-400">Loading signups...</p>`;
          signupsDiv.classList.remove("hidden");

          try {
            const res = await fetch(`http://localhost:3000/api/contest/${contest._id}/signups`);
            const data = await res.json();

            if (!data.signups?.length) {
              signupsDiv.innerHTML = `<p class="text-gray-400 text-sm">No registered users.</p>`;
            } else {
              signupsDiv.innerHTML = `
                <table class="w-full text-sm text-left text-gray-300 border border-gray-700">
                  <thead class="bg-gray-700 text-gray-100">
                    <tr>
                      <th class="px-4 py-2 border">#</th>
                      <th class="px-4 py-2 border">Username</th>
                      <th class="px-4 py-2 border">Joined At</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.signups.map((u, i) => `
                      <tr class="bg-gray-800 hover:bg-gray-700 transition">
                        <td class="px-4 py-2 border">${i + 1}</td>
                        <td class="px-4 py-2 border">${u.username}</td>
                        <td class="px-4 py-2 border">${new Date(u.joinedAt).toLocaleString()}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              `;
            }
          } catch (err) {
            signupsDiv.innerHTML = `<p class="text-red-500">Error loading signups.</p>`;
          }

        } else {
          signupsDiv.classList.add("hidden");
        }
      });
    });

  } catch (err) {
    console.error("❌ Error fetching contests:", err);
    contestListEl.innerHTML = `<p class="text-red-500 text-center">Failed to load contests. Try again later.</p>`;
  }
})();
