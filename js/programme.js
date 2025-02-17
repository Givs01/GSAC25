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
                            const speakerList = session.Speaker.split('<br>').map(part =>
                                part.split(',').map(name =>
                                    `<span class="speaker-name">${name.trim()}</span>`).join(', ')
                            ).join('<br>');

                            return `
                                <section class="agenda-box" id="session-${session.ID}">
                                    <div class="session-card" id="${session.Class}">
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
                <button class="nav-button" data-day="${day}">
                    <i class="fa fa-calendar"></i>
                    <span>Day ${day}</span>
                </button>
            `).join('');

            const navPanel = `
                <nav id="navigation-footer" class="navigation-panel">
                    ${navButtons}
                </nav>
            `;

            return navPanel + searchSection + daySections;
        })
        .catch(error => {
            console.error('Error loading programme data:', error);
            return `<div class="error-message">Please reload the page: ${error.message}</div>`;
        });
}

// Global Event Delegation for Programme Navigation & Search
document.addEventListener('click', (event) => {
    const button = event.target.closest('.nav-button');
    const searchButton = event.target.closest('#searchButton');
    const searchClose = event.target.closest('#searchClose');

    if (button) {
        // Handle day navigation
        const targetDay = button.getAttribute('data-day');
        const targetSection = document.getElementById(`day-${targetDay}`);

        if (targetSection) {
            document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            setTimeout(() => {
                window.scrollTo({
                    top: targetSection.offsetTop - 90,
                    behavior: "smooth"
                });
            }, 100);
        }
    } else if (searchButton) {
        // Handle search functionality
        const searchInput = document.getElementById("searchInput");
        const allSessions = document.querySelectorAll(".session-card");
        const query = searchInput.value.toLowerCase().trim();

        if (query) {
            allSessions.forEach(session => {
                const sessionTitle = session.querySelector(".session-title").textContent.toLowerCase();
                const speakerText = session.querySelector(".session-speakers").textContent.toLowerCase();
                session.style.display = (sessionTitle.includes(query) || speakerText.includes(query)) ? "flex" : "none";
            });

            document.getElementById("searchButton").style.display = "none";
            document.getElementById("searchClose").style.display = "block";
        } else {
            allSessions.forEach(session => session.style.display = 'flex');
        }
    } else if (searchClose) {
        // Handle closing search
        document.getElementById("searchInput").value = "";
        document.getElementById("searchButton").style.display = "block";
        document.getElementById("searchClose").style.display = "none";

        document.querySelectorAll(".session-card").forEach(session => session.style.display = 'flex');
    }
});

// Handle Enter key press for search input
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && document.activeElement.id === 'searchInput') {
        document.getElementById('searchButton').click();
    }
});
