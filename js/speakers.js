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
                <button style="display:none" id="searchClose">
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
                            <section class="profcard" id="${speaker.ID}" onclick="openSpeakerProfile('${speaker.ID}')">
                                <div class="bands">
                                    <img src="${speaker.FullPath || 'default-image.png'}" alt="${speaker.Name}" onerror="this.onerror=null; this.src='/images/photo.jpg'">
                                    <div class="content-box-b">
                                        <h3>${speaker.Name}</h3>
                                        <h4 style="font-style: italic; font-weight: normal">${speaker.Designation || "-"}</h4>
                                        <h4>${speaker.Organization || "-"}</h4>
                                        <p style ="display:none"> ${speaker.Bio || "No biography available."} </p>
                                        <h5>${getSessions(speaker.SessionTitle, speaker.Day, speaker.Time, speaker.Venue)} </h5>
                                    </div>
                                </div>
                            </section>
                            `).join('')}
                        </div>
                `;
            }).join('');

            const modalContainer = `
            <div id="speakerModal" class="modal">
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    <div id="modal-body"></div>
                </div>
            </div>
        `;

            const htmlContent = navPanel +  searchSection + speakerGroups + modalContainer;
            setTimeout(() => {
                attachSpeakersEventListeners();
            }, 5);

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

function getSessions(sessionTitle, day, time, venue) {
    const titles = sessionTitle.split(',');
    const days = day.split(',');
    const times = time.split(',');
    const venues = venue.split(',');

    let sessionHtml = '';

    const sessionLabel = titles.length === 1 ? 'Session' : 'Session ${i + 1}';

    for (let i = 0; i < titles.length; i++) {
        sessionHtml += `
            <div class="session">
                ${titles.length === 1 ? 'Session' : `Session ${i + 1}`}: ${titles[i].trim()} | ${days[i]?.trim() || 'TBA'}: ${times[i]?.trim() || 'TBA'} | Venue: ${venues[i]?.trim() || 'TBA'}
            </div>
        `;
    }
    
    return sessionHtml;
}



function attachSpeakersEventListeners() {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const allSpeakers = document.querySelectorAll('.profcard');
    const searchClose = document.getElementById('searchClose');
    const navButtons = document.querySelectorAll('.nav-button');
    
   
    searchButton.addEventListener('click', () => {

        searchButton.style.display = 'none';
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
        searchInput.value = "";
        searchButton.style.display = 'block';
        searchClose.style.display = 'none';
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

window.openSpeakerProfile = function(speakerID) {
    const speaker = document.getElementById(speakerID);
    if (!speaker) return;

    const modal = document.getElementById('speakerModal');
    const modalBody = document.getElementById('modal-body');


    modalBody.innerHTML = `
        <div class="band">
            <img src="${speaker.querySelector('img').src}" alt="${speaker.querySelector('h3').textContent}" >
            <div class="band2">
                <h2>${speaker.querySelector('h3').textContent}</h2>
                <p style="font-style: italic; font-weight: normal">${speaker.querySelector('h4:nth-of-type(1)').textContent}</p>
                <p style="font-weight: Bold">${speaker.querySelector('h4:nth-of-type(2)').textContent}</p>
            </div>
        </div>
        <p>${speaker.querySelector('p:nth-of-type(1)').textContent}</p>
        <div class="ribbon" >Sessions</div>
        
        ${speaker.querySelector('h5').textContent.split('Session').map((session, index) => {
            if (index === 0) {
                return ''; // Do nothing for the first part (before the first "Session")
            }
            return `
                ${index > 1 ? '<br>' : ''} 
                <div class="band3">
                    <p>Session ${session}</p>
                </div>
            `;
        }).join('')}
        
        
        
    `;
        

    modal.classList.add('active');
    modal.style.display = 'block';  // Ensure the modal is visible

    // Add close event listener
    document.querySelector('.close-button').addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
};


function closeModal() {
    const modal = document.getElementById('speakerModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
    }
}