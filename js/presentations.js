export function loadPresentations() {
    return fetch('https://script.google.com/macros/s/AKfycbyLMcMgwDrJqJp52E-_Bn3lNvJKH-CceF8_WwYvw4uPj8j2W6hrUlIgLMiHsQVPRSxC2w/exec')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load presentations data.');
            }
            return response.json();
        })
        .then(data => {
            const { poster } = data;  // Assuming the response has "poster" as the array of presentations

            if (!poster || !Array.isArray(poster)) {
                throw new Error('Invalid API response format.');
            }

            const groupedByCategory = poster.reduce((acc, presentation) => {
                const category = presentation['Category'];  // Group presentations by category
                if (!acc[category]) acc[category] = [];
                acc[category].push(presentation);
                return acc;
            }, {});


            // Presentation sections for each category
            const presentationsSections = Object.keys(groupedByCategory).map(category => {
                const presentationsList = groupedByCategory[category];
                return `
                    <div class="ribbon">
                        <p>${category}</p>
                    </div>
                    <div class="day-sessions" id="category-${category}">
                        ${presentationsList.map(presentation => {
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
                                                <p>Organization: ${presentation['Organization']}</p>
                                            </div>
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
                    <input type="text" id="searchInput" placeholder="Search for presentations..." />
                    <button id="searchButton">Search</button>
                    <button style="display:none" id="searchClose">
                        <i class="fas fa-close"></i>
                    </button>
                </section>
            `;
            
            const categoryButtons = Object.keys(groupedByCategory).map(category => {
                let icon = "<i class='fas fa-file'></i>";

                if (category.toLowerCase() === "verbal") {
                    icon = "<i class='fas fa-microphone-alt'></i>";
                }
                return `<button class="nav-button" data-category="${category}">${icon} ${category}</button>`;
            }).join('');
            

            const navPanel = `
                <nav id="category-navigation-footer" class="navigation-panel">
                    ${categoryButtons}
                </nav>
            `;
            

            const htmlContent = navPanel + searchSection + presentationsSections;

            setTimeout(() => {
                attachPresentationsEventListeners();
            }, 5);

            return htmlContent;
        })
        .catch(error => {
            console.error('Error loading presentations data:', error);
            return `<div class="error-message">Please reload the page: ${error.message}</div>`;
        });
}

function attachPresentationsEventListeners() {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById("searchInput");
    const allPresentationCards = document.querySelectorAll(".session-card");
    const searchClose = document.getElementById("searchClose");
    const categoryButtons = document.querySelectorAll('.nav-button');


    searchButton.addEventListener('click', () => {
       
        searchButton.style.display = "none";
        searchClose.style.display = "block";

        const query = searchInput.value.toLowerCase().trim();
        if (query) {
            allPresentationCards.forEach(card => {
                const title = card.querySelector(".session-title").textContent.toLowerCase();
                const author = card.querySelector(".groupPresenter p").textContent.toLowerCase();
                // Show presentations that match the query
                card.style.display = (title.includes(query) || author.includes(query)) ? "flex" : "none";
            });
        } else {
            // Show all presentations if no query is entered
            allPresentationCards.forEach(card => card.style.display = 'flex');
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
        allPresentationCards.forEach(card => card.style.display = 'flex');
    });

    // Handle category button clicks
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            const targetSection = document.getElementById(`category-${category}`);
            
            // Remove active class from all category buttons and add to the clicked button
            categoryButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            // Scroll to the relevant category section
            if (targetSection) {
                window.scrollTo({ top: targetSection.offsetTop - 90, behavior: "smooth" });
            }
        });
    });
}

// Call this function after content is loaded, instead of using setTimeout
loadPresentations().then(htmlContent => {
    // Insert the HTML content into the page
    document.getElementById('content-container').innerHTML = htmlContent;

    // Now that content is loaded, attach event listeners
    attachPresentationsEventListeners();
}).catch(error => {
    console.error("Error loading presentations:", error);
});


