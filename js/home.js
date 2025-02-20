export function loadHome() {
    // Fetch data from the external JSON file
    return fetch('https://script.google.com/macros/s/AKfycbwY1BXy6ZCFUYGYRa76hYopJ1bkKEUMRILeWZ4Q-uipPzzGwJ4uozTjzqIvQYD5pSuYPQ/exec')
        .then(response => {
            if (!response.ok) {
                throw new Error('Please wait..and reload the page.');
            }
            return response.json();
        })
        .then((data) => {
            const { general, updates } = data;

            // Check if the response contains the expected structure
            if (!general || !updates) {
                throw new Error('Invalid API response format.');
            }

            // HTML content generation
            const htmlContent = `
                <section class="bghead">
                    <p>${general.greeting || ''}</p>
                    <h1>${general.name || ''}</h1>
                    <h2>${general.theme || ''}</h2>
                    <p>${general.date || ''}</p>
                    <p>${general.venue || ''}</p>
                    <div class="buttons">  
                        <a href="${general.registration_link || '#'}" target="_blank" class="button">Register here</a>
                    </div>
                </section>
                
                <section class="home">
                    <p>${general.description1 || ''}</p>
                    <p>${general.description2 || ''}</p>
                    <p>${general.description3 || ''}</p>
                  
                    <div class="card-container">
                        <div class="card">
                            <div class="card-content">
                                <h1>${general.speakers || '0'}</h1>
                                <h2>Speakers and Presenters</h2>
                            </div>
                            <div class="card-image">
                                <img src="./images/flex-3.png" alt="Speakers Image" onerror="this.onerror=null; this.src='default-image.png';">
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-image">
                                <img src="./images/flex-4.png" alt="Attendees Image" onerror="this.onerror=null; this.src='default-image.png';">
                            </div>
                            <div class="card-content">
                                <h1>${general.registrations || '0'}</h1>
                                <h2>Attendees</h2>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-content">
                                <h1>${general.countries || '0'}</h1>
                                <h2>Countries Represented</h2>
                            </div>
                            <div class="card-image">
                                <img src="./images/flex-2.jpg" alt="Countries Image" onerror="this.onerror=null; this.src='default-image.png';">
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-image">
                                <img src="./images/flex-5.png" alt="Organizations Image" onerror="this.onerror=null; this.src='default-image.png';">
                            </div>
                            <div class="card-content">
                                <h1>${general.organizations || '0'}</h1>
                                <h2>Organizations Represented</h2>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="update">
                    <h3>Conference Updates</h3>
                    <ul>
                        ${updates
                          .map(update => `
                            <li>
                                ${update.description || ''}
                                ${update.link 
                                  ? `<a href="${update.link}" target="_blank" style="margin-left: 5px;" class="button";">Click here</a>` 
                                  : ''}
                            </li>`).join('')}
                    </ul>
                </section>

                <div class="ribbon">
                    <p>Thematic Areas</p>
                </div>
                
                ${generateThemesSection()}

                <div class="ribbon">
                    <p>Celebrating PAS@15</p>
                </div>

                <section class="home">
                    <div class="buttons" style="display: flex; flex-direction: row; align-items: flex-start; margin: 0; padding: 0;">
                        <img class="imgbox" src="images/pas15logo.jpg" alt="PAS Logo" onerror="this.onerror=null; this.src='default-image.png'" style="margin: 0; padding: 0;">
                        <p style="margin:0 0 0 10px; font-size: 0.8rem;">
                            Learn more about the PAS Project, please visit CWAS website or click the button below to explore - 
                            <a href="https://cwas.org.in/cwas-resources/performance-assessment-system-for-urban-water-supply-and-sanitation" target="_blank" class="button" style="display: inline-block; background-color: var(--primary-color); color: #fff; width: 80px; font-size: 0.6rem; padding: 2px;">PAS Project</a>
                        </p>
                    </div>
                    <p style="margin-top:5px;">
                        CWAS has been working on urban water and sanitation related action research since 2009. CWAS began its work when CEPT University received a grant from the Gates Foundation for Performance Assessment System (PAS) Project. Over the past decade, the project has developed an online system, methods, and processes for performance assessment and improvement for urban water supply and sanitation in India. In 2009, this system was initiated in 400+ cities in two states of India. Over these years, the PAS system has been used by 900+ Indian cities across six states and SMART cities. PAS system has the repository of 1800+ cities and it is one of the largest Urban Water and Sanitation database in India which is used by various governments and institutions.
                    </p>
                </section>
            `;
            return htmlContent;
        })
        .catch((error) => {
            return `<div class="error-message">Please wait 5 second and reload the page again</div>`;
        });
}

// Helper function for thematic areas
function generateThemesSection() {
    const themes = [
        { image: "images/gsac25theme1.jpg", title: "Monitoring WASH and climate", description: "To showcase systems, policies, and strategies for measuring and monitoring WASH outcomes in different countries." },
        { image: "images/gsac25theme2.jpg", title: "Governance for inclusive and climate resilient WASH", description: "To showcase systems, policies, and strategies for measuring and monitoring WASH outcomes in different countries." },
        { image: "images/gsac25theme3.jpg", title: "Financing climate resilient WASH", description: "To showcase systems, policies, and strategies for measuring and monitoring WASH outcomes in different countries." },
        { image: "images/gsac25theme4.jpg", title: "WASH innovations in technology and service delivery", description: "To showcase systems, policies, and strategies for measuring and monitoring WASH outcomes in different countries." }
    ];

    return themes.map(theme => `
        <section class="home theme-box">
            <img src="${theme.image}" alt="${theme.title}" onerror="this.onerror=null; this.src='default-image.png';">
            <div class="content-box">
                <h3>${theme.title}</h3>
                <p>${theme.description}</p>
            </div>
        </section>
    `).join('');
}
