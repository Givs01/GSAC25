function attachProgrammeEventListeners() {
    document.addEventListener("click", (event) => {
        const target = event.target;

        // Handle search button click
        if (target.id === "searchButton") {
            const searchInput = document.getElementById("searchInput");
            const searchClose = document.getElementById("searchClose");
            const allSessions = document.querySelectorAll(".session-card");
            target.style.display = "none"; // Hide search button
            searchClose.style.display = "block"; // Show close button

            const query = searchInput.value.toLowerCase().trim();

            allSessions.forEach(session => {
                const sessionTitle = session.querySelector(".session-title").textContent.toLowerCase();
                const speakerText = session.querySelector(".session-speakers").textContent.toLowerCase();

                session.style.display = (sessionTitle.includes(query) || speakerText.includes(query)) ? "flex" : "none";
            });
        }

        // Handle search close button
        if (target.id === "searchClose") {
            document.getElementById("searchInput").value = ""; // Clear search input
            document.querySelectorAll(".session-card").forEach(session => session.style.display = "flex"); // Show all sessions
            target.style.display = "none"; // Hide close button
            document.getElementById("searchButton").style.display = "block"; // Show search button
        }

        // Handle navigation button clicks
        if (target.classList.contains("nav-button")) {
            const day = target.dataset.day;
            const targetSection = document.getElementById(`day-${day}`);
            const navButtons = document.querySelectorAll(".nav-button");

            const isActive = target.classList.contains("active");

            navButtons.forEach(btn => btn.classList.remove("active"));
            document.querySelectorAll(".session-card").forEach(session => session.style.display = "flex");

            if (!isActive) {
                target.classList.add("active");
                window.scrollTo({ top: targetSection.offsetTop - 90, behavior: "smooth" });
            }
        }
    });

    // Attach keydown event to handle "Enter" key search
    document.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && document.activeElement.id === "searchInput") {
            document.getElementById("searchButton").click();
        }
    });
}


// Modify loadProgramme to directly call attachProgrammeEventListeners()
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

            const headerSection = `
                <section class="sp">
                    <br>
                    <h2>Agenda</h2>
                    <br><br>
                </section>
            `;

            const daySections = Object.keys(groupedByDay).map(day => {
                const { date, sessions } = groupedByDay[day];
                return `
                    <div class="ribbon">
                        <p>
                            <span class="day-text">Day ${day}</span>
                            <span class="date-text"> ||  ${date}  ||</span>
                        </p>
                    </div>
                    <div class="day-sessions" id="day-${day}">
                        ${sessions.map(session => `
                            <section class="agenda-box" id="session-${session.ID}">
                                <div class="session-card">
                                    <div class="session-time">
                                        <p>${session.Time}</p>
                                        <p><i class="fas fa-map-marker-alt"></i>${session.Venue}</p>
                                    </div>
                                    <div class="session-content">
                                        <h3 class="session-title">${session.Session}</h3>
                                        <p class="session-speakers"><strong>Speakers:</strong> ${session.Speaker}</p>
                                    </div>
                                </div>
                            </section>
                        `).join('')}
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

            const htmlContent = navPanel + headerSection + searchSection + daySections;

            // Attach event listeners immediately after rendering
            attachProgrammeEventListeners();

            return htmlContent;
        })
        .catch(error => {
            console.error('Error loading programme data:', error);
            return `<div class="error-message">Please reload the page: ${error.message}</div>`;
        });
}
