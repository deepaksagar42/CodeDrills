// public/friends.js

document.addEventListener('DOMContentLoaded', () => {
  const friendsList = document.getElementById('friendsList');
  const addFriendBtn = document.getElementById('addFriendBtn');
  const friendEmailInput = document.getElementById('friendEmail');

  // Load existing friends
  fetch('/friends')
    .then(res => res.json())
    .then(data => {
      if (data.friends) {
        data.friends.forEach(email => addFriendToList(email));
      }
    })
    .catch(err => {
      console.error("Error fetching friends:", err);
      alert("Failed to load friends.");
    });

  // Add friend
  addFriendBtn.addEventListener('click', () => {
    const email = friendEmailInput.value.trim();
    if (!email) return alert("Enter a valid email");

    fetch('/friends/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendEmail: email }),
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.message === "Friend added") {
          addFriendToList(email);
          friendEmailInput.value = "";
        } else {
          alert(data.message || "Error adding friend");
        }
      })
      .catch(err => {
        console.error("Add friend error:", err);
        alert("Failed to add friend.");
      });
  });

  // Helper to render a friend item
  function addFriendToList(email) {
    const li = document.createElement('li');
    li.textContent = email;

    const btn = document.createElement('button');
    btn.textContent = "Remove";
    btn.className = "remove-btn";
    btn.onclick = () => removeFriend(email, li);

    li.appendChild(btn);
    friendsList.appendChild(li);
  }

  // Remove friend
  function removeFriend(email, listItem) {
    fetch('/friends/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendEmail: email }),
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.message === "Friend removed") {
          listItem.remove();
        } else {
          alert(data.message || "Error removing friend");
        }
      })
      .catch(err => {
        console.error("Remove friend error:", err);
        alert("Failed to remove friend.");
      });
  }
});
