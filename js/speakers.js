export function loadSpeakers() {
    return fetch('https://script.google.com/macros/s/AKfycbwApS3-bOHldBZZmUa8IBTmMhholLkEVBpsTqMG_gYrKRqNp9NskMLNrcjqD5IlMQB8YA/exec')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load speaker data.');
            }
            return response.json();
        })
        .then(data => {
            const { speakers } = data;
            if (!speakers || !Array.isArray(speakers)) {
                throw new Error('Invalid API response format.');
            }
            speakers.forEach((speaker, index) => {
                speaker.ID = `speaker-${index}-${speaker.Name.replace(/\s+/g, '-').toLowerCase()}`;
            });
            const groupedSpeakers = groupSpeakersByCategory(speakers);

            const searchSection = `
            <section class="search-section" id="searchSection">
                <input type="text" id="searchInput" placeholder="Search for speakers..." />
                <button id="searchButton">Search</button>
                <button id="searchClose">
                    <i class="fas fa-close"></i>
                </button>
            </section>
            `;

            const categoryIcons = {
                "Chair": "fa-user-tie",               
                "Keynote Speaker": "fa-microphone-alt", 
                "Panelist": "fa-users",               
                "Poster Presenter": "fa-file-alt",        
                "Other": "fa-user",         
            };
            
            const navButtons = Object.keys(groupedSpeakers)
            .filter(category => category !== 'Search') 
            .map(category => {
                const iconClass = categoryIcons[category] || 'fa-tag'; 
                if (category === 'Other' && !groupedSpeakers[category]?.length) {
                    return ''; 
                }
                return `
                    <button class="nav-button" id="nav-${category}" data-category="${category}">
                        <i class="fas ${iconClass}"></i>
                        <span>${category}</span>
                    </button>
                `;
            })
            .join('');
            
            const navPanel = `
                <nav id="navigation-footer" class="navigation-panel">
                    ${navButtons}
                </nav>
            `;
            
            const headerSection = `
            <section class="sp" id="shs">
                <br>
                <h2>Speakers </h1>
                <h2>And</h2>
                <h2>Presenters</h1>
                <br>
                <br>
            </section>
            `;

            const speakerGroups = Object.keys(groupedSpeakers).map(category => {
                const speakersInCategory = groupedSpeakers[category];
                return `
                    <div class="ribbon" id="category-${category}" 
                        ${category === 'Other' && groupedSpeakers[category]?.length === 0 ? 'style="display:none;"' : ''}>
                        <p>${category}</p>
                    </div>
                        <div class="card">
                            ${speakersInCategory.map(speaker => `
                        </div>
                            <section class="profcard" id="${speaker.ID}" onclick="showProfile('${speaker.ID}')">
                                <img src="${speaker.FullPath || 'default-image.png'}" alt="${speaker.Name}" onerror="this.onerror=null; this.src='/images/photo.jpg'">
                                <div class="content-box-b">
                                    <h3>${speaker.Name}</h3>
                                    <h4>${speaker.Designation || "Unknown Designation"} | ${speaker.Organization || "Unknown Organization"}</h4>
                                    <p> <strong> Session:</strong> ${speaker.SessionTitle || "No session title"}</p>
                                    <p> <strong>Time: </strong>${speaker.Time || "TBA"}  <strong>| Venue:  </strong> ${speaker.Venue || "TBA"}</p>
                                </div>
                            </section>
                            `).join('')}
                        </div>
                `;
            }).join('');

            const htmlContent = navPanel + headerSection  + searchSection + speakerGroups;
            setTimeout(() => attachEventListeners(), 100);
            return htmlContent;
        })
        .catch(error => {
            return `<div class="error-message">Please reload the page: ${error.message}</div>`;
        });
}

function groupSpeakersByCategory(speakers) {
    const grouped = speakers.reduce((acc, speaker) => {
        const category = speaker.ParticipantCatagory || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(speaker);
        return acc;
    }, {});

    const categories = Object.keys(grouped);
    const sortedCategories = categories.filter(category => category !== 'Other').sort((a, b) => a.localeCompare(b));
    sortedCategories.push('Other');

    const sortedGrouped = sortedCategories.reduce((acc, category) => {
        grouped[category]?.sort((a, b) => a.Name.localeCompare(b.Name));
        acc[category] = grouped[category] || [];
        return acc;
    }, {});
    return sortedGrouped;
}

function attachEventListeners() {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const allSpeakers = document.querySelectorAll('.profcard');
    const searchClose = document.getElementById('searchClose');
    const headerSection = document.getElementById('shs');
    const navButtons = document.querySelectorAll('.nav-button');
    
   
    searchButton.addEventListener('click', () => {
        searchClose.style.display = 'block';
        const query = searchInput.value.toLowerCase().trim();
        if (query) {
            allSpeakers.forEach(speaker => {
                const speakerName = speaker.querySelector('h3').textContent.toLowerCase();
                speaker.style.display = speakerName.includes(query) ? 'flex' : 'none';
            });
        } else {
            allSpeakers.forEach(speaker => speaker.style.display = 'flex');
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });

    searchClose.addEventListener('click', () => {
        headerSection.style.display = 'flex';
        searchInput.value = "";
        allSpeakers.forEach(speaker => speaker.style.display = 'flex');
    });

    // Add event listener for the nav buttons (toggle active state and reset if clicked again)
    navButtons.forEach(button => {
        const category = button.dataset.category;
        const categoryId = `category-${category}`;

        button.addEventListener('click', () => {
            const isActive = button.classList.contains('active');

            navButtons.forEach(btn => btn.classList.remove('active'));

            allSpeakers.forEach(speaker => {
                speaker.style.display = 'flex';
            });

            if (isActive) {
                return;
            }

            button.classList.add('active');

            const targetSection = document.getElementById(categoryId);
            
            if (targetSection) {
                const offset = 60;
                const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
            
        });
    });
   
}

