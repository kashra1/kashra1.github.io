/**
 * Tirth & Rhea Wedding Site App Logic
 * Note: Since this is built for GitHub Pages (a static host), 
 * frontend-only guest code validation is not truly secure. 
 * Data in a static site can be inspected via dev tools or network requests. 
 * This approach is chosen for simplicity and convenience of static hosting.
 */

const SESSION_KEY = 'wedding_guest_session';

// All Possible Events Configuration
// This maps to the event content required by the user
const ALL_EVENTS = [
    {
        id: 'haldi',
        title: 'Haldi & Mehndi Ceremony',
        dateStr: 'August 28',
        timeStr: '6:00 PM to 10:00 PM',
        locationName: 'Mosaic Clubhouse',
        locationAddr: '1475 Bayberry View Lane, San Ramon, CA',
        mapQuery: 'Mosaic+Clubhouse+San+Ramon+CA',
        dressCode: 'Indian ethnic casuals in shades of yellow',
        description: 'An evening of two beautiful pre-wedding traditions. The auspicious Haldi ceremony begins as turmeric paste is lovingly applied to the bride and groom by family and friends, blessing them with radiance and prosperity. The celebrations continue with Mehndi, where intricate henna designs are applied in celebration of the joyous days ahead.',
        isTimeline: false
    },
    {
        id: 'wedding',
        title: 'Wedding Ceremony',
        dateStr: 'August 30',
        timeStr: '', // We use a timeline here
        locationName: 'Elliston Vineyards',
        locationAddr: '463 Kilkare Rd, Sunol, CA',
        mapQuery: 'Elliston+Vineyards+Sunol',
        dressCode: 'Indian ethnic attire for men and women',
        description: 'The heart of the celebration, Tirth and Rhea’s wedding ceremony performed with Vedic rituals and the beautiful traditions of a Maharashtrian lagna. Come witness the sacred vows that bind two souls for a lifetime.',
        isTimeline: true,
        timelineEvents: [
            { time: '9:30 AM', name: 'Baraat' },
            { time: '10:50 AM', name: 'Varmala' },
            { time: '12:15 PM - 1:30 PM', name: 'Lunch' }
        ]
    },
    {
        id: 'reception',
        title: 'Reception',
        dateStr: 'August 30',
        timeStr: '', 
        locationName: 'Elliston Vineyards',
        locationAddr: '463 Kilkare Rd, Sunol, CA',
        mapQuery: 'Elliston+Vineyards+Sunol',
        dressCode: 'Women: lehenga style | Men: blazer',
        description: 'Cap off the celebration with an elegant evening of cocktails, dinner, heartfelt toasts, music, and dancing. Join Tirth and Rhea as they step into their new chapter surrounded by everyone they love.',
        isTimeline: true,
        timelineEvents: [
            { time: '5:30 PM - 6:30 PM', name: 'Cocktails' },
            { time: '6:30 PM', name: 'Speeches' },
            { time: '7:00 PM - 9:00 PM', name: 'Dinner' }
        ]
    }
];

// Tier mapping logic
const TIER_MAPPING = {
    'HWR': {
        events: ['haldi', 'wedding', 'reception'],
        message: 'You are warmly invited to join us for our Haldi and Mehndi Ceremony, Wedding Ceremony, and Reception.'
    },
    'HW': {
        events: ['haldi', 'wedding'],
        message: 'You are warmly invited to join us for our Haldi and Mehndi Ceremony and Wedding Ceremony.'
    },
    'W': {
        events: ['wedding'],
        message: 'You are warmly invited to join us for our Wedding Ceremony.'
    },
    'R': {
        events: ['reception'],
        message: 'You are warmly invited to join us for our Reception.'
    }
};

// DOM Elements
const elements = {
    modalOverlay: document.getElementById('code-modal'),
    mainContent: document.getElementById('main-content'),
    codeForm: document.getElementById('code-form'),
    inviteCodeInput: document.getElementById('invite-code'),
    errorMessage: document.getElementById('error-message'),
    personalizedBanner: document.getElementById('personalized-banner'),
    guestWelcomeMsg: document.getElementById('guest-welcome-msg'),
    guestTierMsg: document.getElementById('guest-tier-msg'),
    eventsContainer: document.getElementById('events-container'),
    logoutBtn: document.getElementById('logout-btn'),
    reopenModalBtn: document.getElementById('reopen-modal-btn')
};

// Icons (SVG strings for injecting)
const icons = {
    clock: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    mapPin: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
    shirt: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>`,
    externalLink: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`
};

/**
 * Initialize App
 */
function init() {
    // Check for existing session
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (sessionStr) {
        try {
            const guestData = JSON.parse(sessionStr);
            renderAuthenticatedView(guestData);
        } catch (e) {
            console.error("Session data invalid", e);
            showModalView();
        }
    } else {
        showModalView();
    }

    // Event Listeners
    elements.codeForm.addEventListener('submit', handleLogin);
    elements.logoutBtn.addEventListener('click', handleLogout);
    elements.reopenModalBtn.addEventListener('click', handleLogout); // the floating button
}

/**
 * Validates the entered code against the static guest JSON
 */
async function handleLogin(e) {
    e.preventDefault();
    const code = elements.inviteCodeInput.value.trim().toUpperCase(); // Case-insensitive
    
    if (!code) return;

    elements.errorMessage.classList.add('hidden');
    
    // Changing button state
    const submitBtn = elements.codeForm.querySelector('button');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Checking...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('data/guests.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const guests = await response.json();
        
        const guestMatch = guests.find(g => g.privateCode.toUpperCase() === code);

        // Small simulated delay for smoother UX (creates a sense of "auth checking")
        setTimeout(() => {
            if (guestMatch) {
                // Success
                localStorage.setItem(SESSION_KEY, JSON.stringify(guestMatch));
                renderAuthenticatedView(guestMatch);
            } else {
                // Fail
                elements.errorMessage.textContent = "We could not find that invitation code. Please try again.";
                elements.errorMessage.classList.remove('hidden');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }, 600);
        
    } catch (error) {
        console.error("Error fetching guest data:", error);
        elements.errorMessage.textContent = "Unable to load the guest list. Please make sure data/guests.json exists.";
        elements.errorMessage.classList.remove('hidden');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Logs out the user and shows the modal
 */
function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    elements.inviteCodeInput.value = '';
    
    const submitBtn = elements.codeForm.querySelector('button');
    submitBtn.textContent = 'Enter';
    submitBtn.disabled = false;
    elements.errorMessage.classList.add('hidden');
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    showModalView();
}

/**
 * View States Transition
 */
function showModalView() {
    elements.modalOverlay.classList.remove('hidden');
    elements.mainContent.classList.add('blurred');
    elements.personalizedBanner.classList.add('hidden');
    elements.reopenModalBtn.classList.add('hidden');
    elements.eventsContainer.innerHTML = ''; // Clear events
    
    // Re-focus input after transition
    setTimeout(() => {
        elements.inviteCodeInput.focus();
    }, 400);
}

function renderAuthenticatedView(guestData) {
    // Hide modal, show content
    elements.modalOverlay.classList.add('hidden');
    elements.mainContent.classList.remove('blurred');
    elements.personalizedBanner.classList.remove('hidden');
    elements.reopenModalBtn.classList.remove('hidden');
    
    const tierConfig = TIER_MAPPING[guestData.inviteTier];

    // If tier doesn't exist (malformed data), fallback safely
    if (!tierConfig) {
        console.error(`Invalid invite tier: ${guestData.inviteTier}`);
        handleLogout();
        return;
    }

    // Set Welcome Messages
    elements.guestWelcomeMsg.textContent = `Welcome, ${guestData.displayName}`;
    elements.guestTierMsg.textContent = tierConfig.message;

    // Filter and Render Events
    const eventsToRender = ALL_EVENTS.filter(event => tierConfig.events.includes(event.id));
    
    elements.eventsContainer.innerHTML = ''; // Clear existing
    
    // Slight delay for rendering events to allow blur transition
    setTimeout(() => {
        eventsToRender.forEach((event, index) => {
            const card = createEventCard(event);
            // Add staggered entrance animations
            card.style.animation = `slideUp 0.5s ease backwards`;
            card.style.animationDelay = `${0.1 * index}s`;
            elements.eventsContainer.append(card);
        });
    }, 100);
}

/**
 * Creates an event card DOM element
 */
function createEventCard(eventData) {
    const card = document.createElement('div');
    card.className = 'event-card';

    // Timeline template logic
    let timeHtml = '';
    if (eventData.isTimeline && eventData.timelineEvents) {
        const timelineItems = eventData.timelineEvents.map(t => 
            `<div class="timeline-item"><strong>${t.time}</strong> ${t.name}</div>`
        ).join('');
        timeHtml = `<div class="timeline">${timelineItems}</div>`;
    } else {
        timeHtml = `<p>${eventData.timeStr}</p>`;
    }

    card.innerHTML = `
        <div class="event-card-accent"></div>
        <div class="event-header">
            <h3 class="event-title">${eventData.title}</h3>
            <p class="event-date">${eventData.dateStr}</p>
        </div>
        <div class="event-body">
            
            <div class="detail-row">
                <div class="detail-icon">${icons.clock}</div>
                <div class="detail-content">
                    <h4>Time</h4>
                    ${timeHtml}
                </div>
            </div>

            <div class="detail-row">
                <div class="detail-icon">${icons.mapPin}</div>
                <div class="detail-content">
                    <h4>Location</h4>
                    <p><strong>${eventData.locationName}</strong></p>
                    <p>${eventData.locationAddr}</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=${eventData.mapQuery}" target="_blank" rel="noopener noreferrer" class="map-link">
                        Get Directions ${icons.externalLink}
                    </a>
                </div>
            </div>

            <div class="detail-row">
                <div class="detail-icon">${icons.shirt}</div>
                <div class="detail-content">
                    <h4>Dress Code</h4>
                    <p>${eventData.dressCode}</p>
                </div>
            </div>

            <p class="event-description">${eventData.description}</p>

        </div>
    `;

    return card;
}

// Boot the app
document.addEventListener('DOMContentLoaded', init);
