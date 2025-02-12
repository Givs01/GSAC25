export function loadVenue() {
    const navPanel = `
        <nav id="navigation-header" class="navigation-panel">
            <button class="nav-button" id="nav-conclave" data-target="conclave">
                <i class="fas fa-map-location"></i>
                <span>Conclave Layout</span>
            </button>
            <button class="nav-button" id="nav-cept" data-target="cept">
                <i class="fas fa-map-location"></i>
                <span>CEPT Layout</span>
            </button>
            <button class="nav-button" id="nav-gmap" data-target="gmap">
                <span>Google Map</span>
            </button>
        </nav>
    `;

    const htmlContent = `
        ${navPanel}

        <section class="sp">
            <br>
            <h2>Layout Plans </h1>
            <h2>And</h2>
            <h2>Venue location</h1>
            <br>
            <br>
        </section>


        <div class="hero">
            <div class="ribbon"> 
                <p> Conclave Layout</p>
            </div>
            <div class="day" id="conclave">
                <img class="img-f" src="./images/conclave.jpg" alt="Conclave layout plan">
            </div>
            <div class="ribbon"> 
                <p> CEPT Layout</p>
            </div>
            <div class="day" id="cept">
                <img class="img-f" src="./images/cept.jpg" alt="CEPT Layout plan">
            </div>
            <div class="ribbon"> 
                <p> Google Map</p>
            </div>
            <div class="day" id="gmap">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.590635588952!2d72.54778777407539!3d23.03879821572475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e8536b4c64cad%3A0xb9a1a9cce4feac13!2sCEPT%20North%20Gate!5e0!3m2!1sen!2sin!4v1706471148907!5m2!1sen!2sin" 
                    style="border: 0px solid #01A3BA; height: 600px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>

            
        </div>
    `;

    setTimeout(() => attachVenueEventListeners(), 100);

    return htmlContent;
}

function attachVenueEventListeners() {
    const navButtons = document.querySelectorAll('.nav-button');
    const venueSections = document.querySelectorAll('.day');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            const targetSection = document.getElementById(targetId);
            
            // Hide all sections and remove active class from buttons
            venueSections.forEach(section => section.style.display = 'block');
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // Show target section and mark button as active
            targetSection.style.display = 'block';
            button.classList.add('active');

            // Smooth scroll
            window.scrollTo({ top: targetSection.offsetTop - 90, behavior: 'smooth' });
        });
    });
}
