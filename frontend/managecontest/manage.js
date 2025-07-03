const backendUrl = "https://codedrills.onrender.com";
const contestListEl = document.getElementById("contestList");

async function fetchUserContests() {
  try {
    const username = localStorage.getItem("username");
    if (!username) {
      contestListEl.innerHTML = "<p>Please log in to manage contests.</p>";
      return;
    }

    const res = await fetch(`${backendUrl}/api/user/${username}/contest`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Failed to load contests");
    renderContests(data.contests || []);
  } catch (err) {
    console.error("❌ Error loading contests:", err.message);
    contestListEl.innerHTML = "<p>Error loading contests.</p>";
  }
}

function renderContests(contests) {
  const list = document.getElementById("contestList");
  list.innerHTML = "";

  contests.forEach(contest => {
    const div = document.createElement("div");
    div.className =
      "bg-white rounded-lg shadow p-5 border border-gray-200 transition hover:shadow-lg";

    div.innerHTML = `
      <h3 class="text-lg font-semibold text-blue-700 mb-2">${contest.name}</h3>
      <p class="text-sm mb-1"><span class="font-medium text-gray-600">Start:</span> ${new Date(
        contest.startTime
      ).toLocaleString()}</p>
      <p class="text-sm mb-3"><span class="font-medium text-gray-600">End:</span> ${new Date(
        contest.endTime
      ).toLocaleString()}</p>
      <a href="../admin/admin.html?id=${contest._id}"
        class="inline-block mt-1 text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium transition">
        🔧 Open Dashboard
      </a>
      <button class="send-invite-btn mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm"
        data-id="${contest._id}">
        ✉️ Send Invite
      </button>
    `;

    list.appendChild(div);

    // ✅ Attach listener to this newly added button
    const sendBtn = div.querySelector(".send-invite-btn");
    sendBtn.addEventListener("click", async () => {
      const contestId = sendBtn.dataset.id;

      try {
        sendBtn.textContent = "Sending...";
        sendBtn.disabled = true;

        const res = await fetch(`${backendUrl}/api/contest/${contestId}/send-invites`, {
          method: "POST",
        });

        const data = await res.json();
        if (res.ok) {
          alert("✅ Invites sent to your friends!");
          sendBtn.textContent = "Invites Sent";
        } else {
          alert("⚠️ " + data.message);
          sendBtn.textContent = "Send Invite";
          sendBtn.disabled = false;
        }
      } catch (err) {
        alert("❌ Failed to send invites");
        console.error(err);
        sendBtn.textContent = "Send Invite";
        sendBtn.disabled = false;
      }
    });
  });
}

window.addEventListener("DOMContentLoaded", fetchUserContests);
