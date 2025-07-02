let allProblems = [];
let assignedProblems = [];
const contestId = new URLSearchParams(window.location.search).get('id');
console.log("📦 contestId from URL:", contestId);
const backendUrl = "http://localhost:3000";

async function fetchCodeforcesProblems() {
  try {
    const res = await fetch('https://codeforces.com/api/problemset.problems');
    const data = await res.json();
    if (data.status !== 'OK') throw new Error('Failed to load problems');

    allProblems = data.result.problems.filter(p => p.contestId && p.index);
    renderProblemList(allProblems);
    populateFilters(allProblems);
  } catch (err) {
    console.error('❌ Error fetching problems:', err);
  }
}

function renderProblemList(problems) {
  const problemListEl = document.getElementById('problemList');
  problemListEl.innerHTML = '';

  if (!problems.length) {
    problemListEl.innerHTML = '<p>No problems found for selected filter.</p>';
    return;
  }

  problems.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = "problem-entry";
    div.innerHTML = `
      <div class="problem-box">
        <span class="problem-title">[${p.contestId}-${p.index}] ${p.name}</span>
        <button class="add-btn" data-contest="${p.contestId}" data-index="${p.index}" data-name="${p.name}">➕ Add</button>
      </div>
    `;
    problemListEl.appendChild(div);
  });
  
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const contestId = btn.getAttribute('data-contest');
      const index = btn.getAttribute('data-index');
      const name = btn.getAttribute('data-name');

      const already = assignedProblems.some(p => p && p.contestId == contestId && p.index == index);
      if (!already) {
        assignedProblems.push({ contestId, index, name });
        renderAssignedProblems(); // refresh
      }
    });
  });
}

function renderAssignedProblems() {
  const assignedListEl = document.getElementById('assignedProblems');
  assignedListEl.innerHTML = '';

  assignedProblems.forEach((p, idx) => {
    if (!p || !p.contestId || !p.index) return;

    const li = document.createElement('li');
    li.innerHTML = `
      <div class="assigned-box">
        <a href="https://codeforces.com/contest/${p.contestId}/problem/${p.index}" target="_blank">
          [${p.contestId}-${p.index}] ${p.name}
        </a>
        <button class="remove-btn" data-index="${idx}">❌ Remove</button>
      </div>
    `;
    assignedListEl.appendChild(li);
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.getAttribute('data-index'));
      assignedProblems.splice(i, 1);
      renderAssignedProblems(); // refresh
    });
  });
}

function populateFilters(problems) {
  const ratingSet = new Set();
  const tagSet = new Set();

  problems.forEach(p => {
    if (p.rating) ratingSet.add(p.rating);
    if (p.tags) p.tags.forEach(tag => tagSet.add(tag));
  });

  const ratingFilter = document.getElementById('ratingFilter');
  const tagFilter = document.getElementById('tagFilter');

 
  Array.from(ratingSet).sort((a, b) => a - b).forEach(r => {
    const opt = document.createElement('option');
    opt.value = r;
    opt.textContent = r;
    ratingFilter.appendChild(opt);
  });


  Array.from(tagSet).sort().forEach(tag => {
    const opt = document.createElement('option');
    opt.value = tag;
    opt.textContent = tag;
    tagFilter.appendChild(opt);
  });
}

document.getElementById('applyFiltersBtn').addEventListener('click', () => {
  const selectedRating = document.getElementById('ratingFilter').value;
  const selectedTag = document.getElementById('tagFilter').value;

  const filtered = allProblems.filter(p => {
    const matchRating = selectedRating ? p.rating == selectedRating : true;
    const matchTag = selectedTag ? p.tags.includes(selectedTag) : true;
    return matchRating && matchTag;
  });

  renderProblemList(filtered);
});

document.getElementById('addSelectedBtn').addEventListener('click', () => {
  const checkboxes = document.querySelectorAll('#problemList input[type="checkbox"]:checked');
  console.log("✅ Selected checkboxes:", checkboxes);

  checkboxes.forEach(cb => {
    const [contestIdStr, index] = cb.value.split('-');
    const name = cb.getAttribute('data-name');

    console.log("➕ Trying to add:", { contestIdStr, index, name });

    // ✅ Fix: make sure assignedProblems doesn't contain null
    const alreadyAdded = assignedProblems.some(
      p => p && p.contestId == contestIdStr && p.index == index
    );

    if (!alreadyAdded && contestIdStr && index && name) {
      assignedProblems.push({
        contestId: contestIdStr,
        index,
        name
      });
    }
  });

  renderAssignedProblems();
});


function showTab(tabId) {
  document.querySelectorAll('.section').forEach(sec => {
    sec.classList.remove('active');
  });
  document.getElementById(tabId).classList.add('active');

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.getAttribute('data-tab');
    showTab(tab);
  });
});


async function loadContestDetails() {
  try {
    const res = await fetch(`http://localhost:3000/api/contest/${contestId}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Failed to load contest details");

    const container = document.getElementById("contestDetailsContainer");
    container.innerHTML = `
      <p><strong>Contest Name:</strong> ${data.name}</p>
      <p><strong>Organizer:</strong> ${data.orgName || "N/A"} (${data.orgType || "N/A"})</p>
      <p><strong>Start Time:</strong> ${new Date(data.startTime).toLocaleString()}</p>
      <p><strong>End Time:</strong> ${data.endTime ? new Date(data.endTime).toLocaleString() : "Not Set"}</p>
    `;
  } catch (err) {
    console.error("❌ Failed to load contest:", err.message);
    document.getElementById("contestDetailsContainer").innerText = "Failed to load contest details.";
  }
}

 document.getElementById("standingsFrame").src = `standing.html?id=${contestId}`;
 
document.getElementById("saveProblemsBtn").addEventListener("click", async () => {
  try {
    // ✅ Only keep well-formed problems
    const problemsToSend = assignedProblems
      .filter(p => p && p.contestId && p.index)
      .map(p => ({
        contestId: p.contestId,
        index: p.index,
        name:  p.name || "Untitled Problem",
      }));

    if (!problemsToSend.length) {
      alert("⚠️ No valid problems to save.");
      return;
    }

  const res = await fetch(`http://localhost:3000/api/contest/${contestId}/add-problems`, {

      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ problems: problemsToSend }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message);

    alert("✅ Problems saved successfully!");
    loadAssignedProblems();
  } catch (err) {
    alert("❌ Failed to save problems: " + err.message);
  }
});

async function loadAssignedProblems() {
 
  try {
    const res = await fetch(`http://localhost:3000/api/contest/${contestId}/problems`);
    const data = await res.json();
    console.log("👀 assignedProblems from DB:", data.problems);
    if (!res.ok) throw new Error(data.error);

    assignedProblems = data.problems || [];
    renderAssignedProblems();  // You already have this function
  } catch (err) {
    console.error("Failed to load assigned problems:", err.message);
  }
}

const btn = document.querySelector("#signups-tab-button");
if (btn) {
  btn.addEventListener("click", () => {
    loadSignups(currentContestId);
  });
}
async function signupUserIfNew() {
  try {
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email"); // ✅ fetch email too
    if (!username || !email) return;

    const res = await fetch(`http://localhost:3000/api/contest/${contestId}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email }) // ✅ send both
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Unknown error");

    console.log("✅ Signed up:", result);
    fetchSignups(); // refresh the table
  } catch (err) {
    console.error("❌ Sign-up error:", err.message);
  }
}

async function fetchSignups() {
  try {
    const res = await fetch(`http://localhost:3000/api/contest/${contestId}/signups`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    const tbody = document.querySelector("#signup-table tbody");
    const signupCount = document.getElementById("signup-count");
    tbody.innerHTML = ""; // clear old
    console.log("👀 Signups fetched in frontend:", data.signups);
    data.signups.forEach(user => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${user.username}</td>
        <td>${user.email || "N/A"}</td>
        <td>${new Date(user.joinedAt).toLocaleString()}</td>
      `;

      tbody.appendChild(row);
    });


    signupCount.textContent = data.signups.length;
  } catch (err) {
    console.error("❌ Failed to fetch signups:", err.message);
  }
}

function markAlreadyAssigned() {
  assignedProblems.forEach(p => {
    if (!p || !p.contestId || !p.index) return; // 🛡️ safeguard
    const checkbox = document.querySelector(`input[value="${p.contestId}-${p.index}"]`);
    if (checkbox) checkbox.disabled = true;
  });
}


window.addEventListener("DOMContentLoaded", async () => {
  await fetchCodeforcesProblems();    // 1. Fetch Codeforces problems
  await loadAssignedProblems();       // 2. Load already assigned problems
  loadContestDetails();               // 3. Load contest metadata
  markAlreadyAssigned();              // 4. Visually mark them in the list
});

document.addEventListener("DOMContentLoaded", () => {
  if (contestId)
     {
     signupUserIfNew();
      fetchSignups();
  }
});
