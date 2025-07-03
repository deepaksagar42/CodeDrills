(async () => {
  const contestListEl = document.getElementById("contestList");
  const username = localStorage.getItem("username");

  if (!username) {
    window.location.href = "/login/login.html";
    return;
  }

  try {
    const res = await fetch(`https://codedrills.onrender.com/api/user-contests/${username}`);
    const data = await res.json();

    const now = new Date();
    const pastContests = data.contests.filter(c => new Date(c.endTime) < now);

    if (!pastContests.length) {
      contestListEl.innerHTML = `<p class="text-gray-400 text-center">You haven't participated in any past contests yet.</p>`;
      return;
    }

    contestListEl.innerHTML = "";

    pastContests.forEach(contest => {
      const wrapper = document.createElement("div");
      wrapper.className = "bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col sm:flex-row justify-between items-start sm:items-center";

      const content = document.createElement("div");
      content.className = "space-y-1 sm:space-y-2";
      content.innerHTML = `
        <h2 class="text-xl font-semibold mb-2 text-blue-400">${contest.name}</h2>
        <p><span class="font-medium text-gray-300">📅 Start:</span> ${new Date(contest.startTime).toLocaleString()}</p>
        <p><span class="font-medium text-gray-300">🏁 End:</span> ${new Date(contest.endTime).toLocaleString()}</p>
        <p><span class="font-medium text-gray-300">🏢 Organizer:</span> ${contest.orgName}</p>
        <p><span class="font-medium text-gray-300">👤 Created By:</span> ${contest.createdBy}</p>
      `;

      const standingsBtn = document.createElement("button");
      standingsBtn.textContent = "📊 Standings";
      standingsBtn.className = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-4 sm:mt-0 sm:ml-4";
      standingsBtn.onclick = () => {
        window.location.href = `/admin/standing.html?id=${contest._id}`;
      };

      wrapper.appendChild(content);
      wrapper.appendChild(standingsBtn);
      contestListEl.appendChild(wrapper);
    });

  } catch (err) {
    console.error("❌ Error fetching past contests:", err);
    contestListEl.innerHTML = `<p class="text-red-500 text-center">Failed to load past contests. Please try again later.</p>`;
  }
})();
