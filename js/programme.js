export function loadProgramme() {
    return fetch('https://script.google.com/macros/s/AKfycbxQMY0Yb7VfC9I4ddAb6S1KA6WQ2xTc9xcSVlA0SwXUeOhkkpuO1RyNcVsk_ivoSNFI2w/exec')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load programme data.');
            }
            return response.json();
        })
        .then(data => {
            const { programme } = data;

            if (!programme || !Array.isArray(programme)) {
                throw new Error('Invalid API response format.');
            }

            const groupedByDay = programme.reduce((acc, session) => {
                const day = session.Day;
                const date = session.Date;
                if (!acc[day]) acc[day] = { date, sessions: [] };
                acc[day].sessions.push(session);
                return acc;
            }, {});

            const daySections = Object.keys(groupedByDay).map(day => {
                const { date, sessions } = groupedByDay[day];
                return `
                    <div class="ribbon">
                        <p>
                            <span>Day ${day}</span>
                            <span> ||  ${date}  ||</span>
                        </p>
                    </div>
                    <div class="day-sessions" id="day-${day}">
                        ${sessions.map(session => {
                            const speakers = session.Speaker.split('<br>').map(part => part.trim()).join('<br>');
                            const speakerList = session.Speaker.split('<br>').map(part => {
                                return part.split(',').map(name => `<span class="speaker-name">${name.trim()}</span>`).join(', ');
                            }).join('<br>');

                            return `
                                <section class="agenda-box" id="session-${session.ID}">
                                    <div class="session-card">
                                        <div class="session-time">
                                            <p>${session.Time}</p>
                                            <p><i class="fas fa-map-marker-alt"></i>${session.Venue}</p>
                                        </div>
                                        <div class="session-content">
                                            <h3 class="session-title">${session.Session}</h3>
                                            <p class="session-speakers">${speakerList}</p>
                                        </div>
                                    </div>
                                </section>
                            `;
                        }).join('')}
                    </div>
                `;
            }).join('');

            const searchSection = `
            <section class="search-section" id="searchSection">
                <input type="text" id="searchInput" placeholder="Search for sessions..." />
                <button id="searchButton">Search</button>
                <button style="display:none" id="searchClose">
                    <i class="fas fa-close"></i>
                </button>
            </section>
            `;

            const navButtons = Object.keys(groupedByDay).map(day => `
                <button class="nav-button" id="nav-${day}" data-day="${day}">
                    <i class="fa fa-calendar"></i>
                    <span>Day ${day}</span>
                </button>
            `).join('');

            const navPanel = `
                <nav id="navigation-footer" class="navigation-panel">
                    ${navButtons}
                </nav>
            `;

            const htmlContent = navPanel + searchSection + daySections;

            setTimeout(() => {
                attachProgrammeEventListeners();
            }, 5);

            return htmlContent;
        })
        .catch(error => {
            console.error('Error loading programme data:', error);
            return `<div class="error-message">Please reload the page: ${error.message}</div>`;
        });
}

function attachProgrammeEventListeners() {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById("searchInput");
    const allSessions = document.querySelectorAll(".session-card");
    const searchClose = document.getElementById("searchClose");
    const navButtons = document.querySelectorAll('.nav-button');

    // Handle search button click
    searchButton.addEventListener('click', () => {
        // Hide search button and show close button
        searchButton.style.display = "none";
        searchClose.style.display = "block";

        const query = searchInput.value.toLowerCase().trim();
        if (query) {
            allSessions.forEach(session => {
                const sessionTitle = session.querySelector(".session-title").textContent.toLowerCase();
                const speakerText = session.querySelector(".session-speakers").textContent.toLowerCase();
                // Show sessions that match the query
                session.style.display = (sessionTitle.includes(query) || speakerText.includes(query)) ? "flex" : "none";
            });
        } else {
            // Show all sessions if no query is entered
            allSessions.forEach(session => session.style.display = 'flex');
        }
    });

    // Handle Enter key press for search
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });

    // Handle search close button click
    searchClose.addEventListener('click', () => {
        searchInput.value = "";
        searchButton.style.display = 'block';
        searchClose.style.display = 'none';
        allSessions.forEach(session => session.style.display = 'flex');
    });

    // Handle navigation button clicks
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const day = button.dataset.day;
            const targetSection = document.getElementById(`day-${day}`);
            
            // Remove active class from all nav buttons and add to the clicked button
            navButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            // Scroll to the relevant day section
            window.scrollTo({ top: targetSection.offsetTop - 90, behavior: "smooth" });
        });
    });
}
