


  const form = document.getElementById('contestForm');

  form.addEventListener('submit', async e => {

    e.preventDefault();
    const startTime = new Date(`${form.startDate.value}T${form.startTime.value}`);
    const endTime = form.noEnd.checked ? null : new Date(`${form.endDate.value}T${form.endTime.value}`);

    const obj = {
      name: form.name.value.trim(),
      startTime,
      endTime,
      noEnd: form.noEnd.checked,
      orgType: form.orgType.value,
      orgName: form.orgName.value.trim(),
      createdBy: localStorage.getItem("username"), 
      createdAt: new Date().toISOString()
    };

    console.log({
  name: form.name.value,
  startDate: form.startDate.value,
  startTime: form.startTime.value,
  orgType: form.orgType.value,
  orgName: form.orgName.value,
  createdBy: localStorage.getItem("username")
});

    try {
      const response = await fetch('http://localhost:3000/api/createcontest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj)
      });

      const data = await response.json();
      console.log("✅ Contest Created:", data); 
      console.log(data);
      if (response.ok) {
        window.location.href = `../join-contest.html?id=${data.id}`;
      } else {
        alert(data.message || 'Something went wrong.');
      }
    } catch (err) {
      alert('⚠️ Network error: ' + err.message);
    }
  });
