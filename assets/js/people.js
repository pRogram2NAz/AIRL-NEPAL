/* ==========================================================
   AIRL Nepal – Dynamic Team Rendering & Search
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const teamGrid = document.getElementById('teamGrid');
  const teamSearch = document.getElementById('teamSearch');
  const noResults = document.getElementById('noResults');

  let allMembers = [];

  // Default fallback data if data/people.json fails to load
  const fallbackMembers = [
    {
      name: "Dr. Sandesh Khanal",
      role: "Lead Agri-AI Researcher",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
      bio: "Ph.D. in Smart Agriculture. Specializes in predictive ML models for crop disease forecasting."
    },
    {
      name: "Anjana Adhikari",
      role: "Senior GIS Analyst & Remote Sensing Engineer",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop",
      bio: "M.Sc. in Geoinformatics. Leverages Sentinel data to map crop health indices across Nepal."
    },
    {
      name: "Bishal Thapa",
      role: "IoT Systems & Precision Hardware Engineer",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
      bio: "Develops low-power soil telemetry hardware and smart drip irrigation nodes for local pilots."
    }
  ];

  // Function to render team members
  const renderMembers = (members) => {
    if (!teamGrid) return;
    teamGrid.innerHTML = '';
    
    if (members.length === 0) {
      noResults?.classList.remove('hidden');
      return;
    }
    noResults?.classList.add('hidden');

    members.forEach(member => {
      const card = document.createElement('div');
      card.className = 'member-card fade-up';
      
      card.innerHTML = `
        <img src="${member.image}" alt="${member.name}" class="member-photo" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop';" />
        <div class="member-info">
          <h3 class="member-name">${member.name}</h3>
          <p class="member-role">${member.role}</p>
          <p class="member-bio">${member.bio}</p>
        </div>
      `;
      
      teamGrid.appendChild(card);
    });
  };

  // Check local cache first for instant website updates
  const localPeople = localStorage.getItem('airl_people');
  if (localPeople) {
    allMembers = JSON.parse(localPeople);
    renderMembers(allMembers);
  } else {
    // Fetch from public json endpoint
    fetch('data/people.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load dynamic team JSON');
        return res.json();
      })
      .then(data => {
        allMembers = data;
        localStorage.setItem('airl_people', JSON.stringify(allMembers));
        renderMembers(allMembers);
      })
      .catch(err => {
        console.warn('Using fallback team data:', err.message);
        allMembers = fallbackMembers;
        localStorage.setItem('airl_people', JSON.stringify(allMembers)); // Write to cache so admin dashboard can sync
        renderMembers(allMembers);
      });
  }

  // Simple Live Search
  teamSearch?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = allMembers.filter(m => 
      m.name.toLowerCase().includes(query) || 
      m.role.toLowerCase().includes(query) || 
      m.bio.toLowerCase().includes(query)
    );
    renderMembers(filtered);
  });
});
