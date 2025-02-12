export function loadProfile(speakerID) {


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

            // Generate a unique ID for each speaker
            speakers.forEach((speaker, index) => {
                // Generate an ID using index and speaker's name to make it unique
                speaker.ID = `speaker-${index}-${speaker.Name ? speaker.Name.replace(/\s+/g, '-').toLowerCase() : index}`;
            });

            const selectedSpeaker = speakers.find(speaker => speaker.ID === speakerID);

            if (!selectedSpeaker) {
                throw new Error('Speaker not found.');
            }

            console.log('Selected speaker details:', selectedSpeaker.ID, selectedSpeaker.Name);

            const profileHTML = `
                <div class="ribbon">
                    <p>Speaker/Presenter's  Profile</p>
                </div>
                <section class="profile">
                    <img src="${selectedSpeaker.FullPath || 'default-image.png'}" alt="${selectedSpeaker.Name || 'Unknown Speaker'}" onerror="this.onerror=null; this.src='default-image.png'">
                    <h1>${selectedSpeaker.Name || 'Unknown Speaker'}</h1>
                    <h2>${selectedSpeaker.Designation || 'Unknown Designation'} | ${selectedSpeaker.Organization || 'Unknown Organization'}</h2>
                    <p> ${selectedSpeaker.Bio || 'No biography available.'}</p>
                    <div class="profile-content">
                        <p><strong>Session:</strong> ${selectedSpeaker.SessionTitle || 'No session title available.'}</p>
                        <p><strong>Time:</strong> ${selectedSpeaker.Time || 'TBA'}</p>
                        <p><strong>Venue:</strong> ${selectedSpeaker.Venue || 'TBA'}</p>
                    </div>
                </section>

            `;

            return profileHTML;
        })
        .catch(error => {
            console.error('Error loading speaker profile:', error);
            return `<div class="error-message">Please reload the page: ${error.message}</div>`;
        });
}
