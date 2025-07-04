async function submitUsername() {
  const username = document.getElementById("username").value.trim();
  const errorMsg = document.getElementById("error-msg");

  if (!username) {
    errorMsg.textContent = "Username cannot be empty.";
    return;
  }

  try {
    const res = await fetch("/api/auth/set-username", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ username })
    });

    if (!res.ok) {
      const errorText = await res.text(); // Read only once
      throw new Error("Server error: " + errorText);
    }

    const data = await res.json(); // Only parse JSON if status is OK
    console.log("✅ Username set:", data);

    // Redirect to homepage after success
    window.location.href = "../Home/home.html";

  } catch (err) {
    console.error("❌ Error:", err);
    errorMsg.textContent = "Failed to set username: " + err.message;
  }
}
