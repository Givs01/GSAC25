export function loadPresentations() {
    return fetch('https://script.google.com/macros/s/AKfycbyLMcMgwDrJqJp52E-_Bn3lNvJKH-CceF8_WwYvw4uPj8j2W6hrUlIgLMiHsQVPRSxC2w/exec')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load presentations data.');
            }
            return response.json();
        })
        .then(data => {
            const { poster } = data;  

            if (!poster || !Array.isArray(poster)) {
                throw new Error('Invalid API response format.');
            }

            const groupedByCategory = poster.reduce((acc, presentation) => {
                const category = presentation['Category'];
                if (!acc[category]) acc[category] = {};
                return acc;
            }, {});

            poster.forEach(presentation => {
                const category = presentation['Category'];
                const day = presentation['Day'];
                if (!groupedByCategory[category][day]) {
                    groupedByCategory[category][day] = {};
                }
                const theme = presentation['Theme'];
                if (!groupedByCategory[category][day][theme]) {
                    groupedByCategory[category][day][theme] = [];
                }
                groupedByCategory[category][day][theme].push(presentation);
            });

            const presentationsSections = Object.keys(groupedByCategory).map(category => {
                const categorySection = Object.keys(groupedByCategory[category]).map(day => {
                    const daySection = Object.keys(groupedByCategory[category][day]).map(theme => {
                        const themeList = groupedByCategory[category][day][theme];
                        return `
                            <div class="ribbon3">
                                <p>${theme}</p>
                            </div>
                            <div class="day-sessions" id="category-${category.replace(/\s+/g, '-')}-day-${day}-theme-${theme.replace(/\s+/g, '-')}">
                                ${themeList.map(presentation => {
                                    return `
                                        <section class="agenda-box" id="presentation-${presentation['Sr.No.']}">
                                            <div class="session-card">
                                                <div class="session-time">
                                                    <p>${presentation.Time}</p>
                                                    <p><i class="fas fa-map-marker-alt"></i>${presentation.Venue}</p>
                                                </div>
                                                <div class="session-content">
                                                    <h3 class="session-title">${presentation['Poster Name']}</h3>
                                                    <div class="groupPresenter">
                                                        <p><strong>Author:</strong> ${presentation['Author Name']}</p>
                                                        <p><strong>Co-Authors:</strong> ${presentation['CoAuthor']}</p>
                                                        <p><strong>Organization:</strong> ${presentation['Organization']}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    `;
                                }).join('')}
                            </div>
                        `;
                    }).join('');
                    return `
                        <div class="ribbon2">
                            <p>${day}</p>
                        </div>
                        ${daySection}
                    `;
                }).join('');
                return `
                    <div class="ribbon" id="category-${category.replace(/\s+/g, '-')}">
                        <p>${category}</p>
                    </div>
                    ${categorySection}
                `;
            }).join('');

            const searchSection = `
                <section class="search-section" id="searchSection">
                    <input type="text" id="searchInput" placeholder="Search for presentations..." />
                    <button id="searchButton">Search</button>
                    <button style="display:none" id="searchClose">
                        <i class="fas fa-close"></i>
                    </button>
                </section>
            `;
            
            const categoryButtons = Object.keys(groupedByCategory).map(category => {
                let icon = "<i class='fas fa-file'></i>";
                if (category.toLowerCase() === "verbal presentation") {
                    icon = "<i class='fas fa-microphone-alt'></i>";
                }
                return `<button class="nav-button" data-category="${category.replace(/\s+/g, '-')}">${icon} ${category}</button>`;
            }).join('');
            
            const navPanel = `
                <nav id="navigation-footer" class="navigation-panel">
                    ${categoryButtons}
                </nav>
            `;
            
            return navPanel + searchSection + presentationsSections;
        })
        .catch(error => {
            console.error('Error loading presentations data:', error);
            return `<div class="error-message">Please reload the page: ${error.message}</div>`;
        });
}

// Global event delegation for search and navigation

document.addEventListener('click', (event) => {
    const button = event.target.closest('.nav-button');
    if (button) {
        const category = button.getAttribute('data-category');
        const targetSection = document.querySelector(`#category-${category}`);
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        if (targetSection) {
            setTimeout(() => {
                window.scrollTo({
                    top: targetSection.offsetTop - 90,
                    behavior: "smooth"
                });
            }, 100);
        }
    }

    if (event.target.id === 'searchButton') {
        const searchInput = document.getElementById('searchInput');
        const allPresentationCards = document.querySelectorAll(".session-card");
        document.getElementById("searchButton").style.display = "none";
        document.getElementById("searchClose").style.display = "block";
        const query = searchInput.value.toLowerCase().trim();
        allPresentationCards.forEach(card => {
            const title = card.querySelector(".session-title").textContent.toLowerCase();
            const author = card.querySelector(".groupPresenter p").textContent.toLowerCase();
            card.style.display = (title.includes(query) || author.includes(query)) ? "flex" : "none";
        });
    }
    if (event.target.id === 'searchClose') {
        document.getElementById('searchInput').value = "";
        document.getElementById('searchButton').style.display = 'block';
        document.getElementById('searchClose').style.display = 'none';
        document.querySelectorAll(".session-card").forEach(card => card.style.display = 'flex');
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && document.activeElement.id === 'searchInput') {
        document.getElementById('searchButton').click();
    }
});
