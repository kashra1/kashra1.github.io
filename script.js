/**
 * Tirth & Rhea Wedding Site App Logic
 * Note: Since this is built for GitHub Pages (a static host), 
 * frontend-only guest code validation is not truly secure. 
 * Data in a static site can be inspected via dev tools or network requests. 
 * This approach is chosen for simplicity and convenience of static hosting.
 */

const SESSION_KEY = 'wedding_guest_session';
// TODO: Add your Google Apps Script Web App URL here after following the rsvp/README.md instructions
const RSVP_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby1FklTGY7o4pICiS39neHzXtVLzI9qIU9n4C_1NVADVGz0VerQVe4ctotgzJFsUwRd/exec'; 

// All Possible Events Configuration
const ALL_EVENTS = [
    {
        id: 'haldi',
        title: 'Haldi and Mehndi Ceremony',
        dateStr: 'August 28',
        timeStr: '5:30 PM to 9:30 PM',
        locationName: 'Mosaic Clubhouse',
        locationAddr: '1475 Bayberry View Lane, San Ramon, CA',
        mapQuery: 'Mosaic+Clubhouse+San+Ramon+CA',
        dressCode: 'Indian Ethnic Casuals in hues of Yellow and Henna Green',
        description: 'An evening of two beautiful pre-wedding traditions. The auspicious Haldi ceremony begins as turmeric paste is lovingly applied to the bride and groom by family and friends, blessing them with radiance and prosperity. The celebrations continue with mehndi, where intricate henna designs are applied in celebration of the joyous days ahead.',
        isTimeline: false
    },
    {
        id: 'wedding',
        title: 'Wedding Ceremony',
        dateStr: 'August 30',
        timeStr: '', // Timeline layout
        locationName: 'Elliston Vineyards',
        locationAddr: '463 Kilkare Rd, Sunol, CA',
        mapQuery: 'Elliston+Vineyards+Sunol',
        dressCode: 'Traditional Indian attire - women: sarees; gentlemen: kurta pajamas',
        description: 'The heart of the celebration, Tirth and Rhea’s wedding ceremony is performed with Vedic rituals and beautiful family traditions. Come witness the sacred vows that bind two souls for a lifetime.',
        isTimeline: true,
        timelineEvents: [
            { time: 'Baraat –', name: '9:30 AM' },
            { time: 'Varmala –', name: '10:50 AM' },
            { time: 'Lunch –', name: '12:15 PM to 1:30 PM' }
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
        dressCode: 'Women: Lehenga-Inspired Attire and gentlemen: Blazer/Formal Jacket',
        description: 'Cap off the celebration with an elegant evening of cocktails, dinner, heartfelt toasts, music, and dancing. Join Tirth and Rhea as they step into their new chapter surrounded by everyone they love.',
        isTimeline: true,
        timelineEvents: [
            { time: 'Cocktails –', name: '5:30 PM to 6:30 PM' },
            { time: 'Speeches –', name: '6:30 PM' },
            { time: 'Dinner –', name: '7:00 PM to 9:00 PM' }
        ]
    }
];

// Tier mapping logic exactly as required
const TIER_MAPPING = {
    'HWR': {
        events: ['haldi', 'wedding', 'reception'],
        message: 'You are warmly invited to join us for our Haldi and Mehndi Ceremony, Wedding Ceremony, and Reception.'
    },
    'HW': {
        events: ['haldi', 'wedding'],
        message: 'You are warmly invited to join us for our Haldi and Mehndi Ceremony and Wedding Ceremony.'
    },
    'WR': {
        events: ['wedding', 'reception'],
        message: 'You are warmly invited to join us for our Wedding Ceremony and Reception.'
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
    reopenModalBtn: document.getElementById('reopen-modal-btn'),
    
    // Navigation & Tabs
    topNav: document.getElementById('top-nav'),
    navMenu: document.getElementById('nav-menu'),
    mobileNavToggle: document.getElementById('mobile-nav-toggle'),
    navLinks: document.querySelectorAll('.nav-link'),
    tabPages: document.querySelectorAll('.tab-page'),
    navRsvpBtn: document.getElementById('nav-rsvp-btn'),
    galleryGrid: document.getElementById('gallery-grid'),

    // RSVP Elements
    rsvpModal: document.getElementById('rsvp-modal'),
    rsvpBtnTop: document.getElementById('rsvp-btn-top'),
    rsvpBtnBottom: document.getElementById('rsvp-btn-bottom'),
    bottomRsvpSection: document.getElementById('bottom-rsvp-section'),
    closeRsvp: document.getElementById('close-rsvp'),
    rsvpForm: document.getElementById('rsvp-form'),
    rsvpDynamicFields: document.getElementById('rsvp-dynamic-fields'),
    rsvpStatusMessage: document.getElementById('rsvp-status-message'),
    submitRsvpBtn: document.getElementById('submit-rsvp-btn')
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
    elements.reopenModalBtn.addEventListener('click', handleLogout);
    
    // RSVP Event Listeners
    elements.rsvpBtnTop.addEventListener('click', openRsvpModal);
    elements.rsvpBtnBottom.addEventListener('click', openRsvpModal);
    elements.closeRsvp.addEventListener('click', closeRsvpModal);
    elements.rsvpForm.addEventListener('submit', handleRsvpSubmit);
    
    // Navigation Listeners
    elements.navRsvpBtn.addEventListener('click', openRsvpModal);
    
    // We removed the mobileNavToggle in HTML/CSS to favor horizontal flex
    if (elements.mobileNavToggle) {
        elements.mobileNavToggle.addEventListener('click', () => {
            elements.navMenu.classList.toggle('active');
        });
    }
    
    elements.navLinks.forEach(link => {
        link.addEventListener('click', handleTabClick);
    });
}

/**
 * Validates the entered code against the static guest JSON
 */
async function handleLogin(e) {
    e.preventDefault();
    const inputCode = elements.inviteCodeInput.value.trim().toUpperCase(); 
    
    if (!inputCode) return;

    elements.errorMessage.classList.add('hidden');
    
    const submitBtn = elements.codeForm.querySelector('button');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Checking...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('data/guests.json');
        
        if (!response.ok) {
            throw new Error('HTTP error! status: ' + response.status);
        }
        
        const guests = await response.json();
        
        const guestMatch = guests.find(g => g.privateCode.trim().toUpperCase() === inputCode);

        setTimeout(() => {
            if (guestMatch) {
                // Success - store exact matched object
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
    elements.bottomRsvpSection.classList.add('hidden');
    elements.topNav.classList.add('hidden');
    elements.eventsContainer.innerHTML = '';
    
    setTimeout(() => {
        elements.inviteCodeInput.focus();
    }, 400);
}

function renderAuthenticatedView(guestData) {
    elements.modalOverlay.classList.add('hidden');
    elements.rsvpModal.classList.add('hidden');
    elements.mainContent.classList.remove('blurred');
    elements.personalizedBanner.classList.remove('hidden');
    elements.reopenModalBtn.classList.remove('hidden');
    elements.bottomRsvpSection.classList.remove('hidden');
    elements.topNav.classList.remove('hidden');
    
    // Initialize gallery if empty
    if (elements.galleryGrid && elements.galleryGrid.children.length === 0) {
        initGallery();
    }
    
    const tierConfig = TIER_MAPPING[guestData.inviteTier];

    if (!tierConfig) {
        console.error('Invalid invite tier: ' + guestData.inviteTier);
        handleLogout();
        return;
    }

    // Exact greeting format
    elements.guestWelcomeMsg.textContent = 'Hi, ' + guestData.displayName;
    elements.guestTierMsg.textContent = tierConfig.message;

    const eventsToRender = ALL_EVENTS.filter(event => tierConfig.events.includes(event.id));
    
    elements.eventsContainer.innerHTML = ''; 
    
    setTimeout(() => {
        eventsToRender.forEach((event, index) => {
            const card = createEventCard(event);
            card.style.animation = 'slideUp 0.5s ease backwards';
            card.style.animationDelay = (0.1 * index) + 's';
            elements.eventsContainer.append(card);
        });
    }, 100);
}

/**
 * Tab Navigation Logic
 */
function handleTabClick(e) {
    const targetTabId = e.currentTarget.dataset.tab;

    if (!targetTabId) {
        return;
    }

    // Only prevent default for tab links. External links should behave normally.
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('#')) {
        e.preventDefault();
    }
    
    // Remove active class from all links
    elements.navLinks.forEach(link => link.classList.remove('active'));
    
    // Add active to clicked link
    e.currentTarget.classList.add('active');
    
    // Hide all tabs
    elements.tabPages.forEach(page => page.classList.add('hidden'));
    
    // Show target tab
    const targetTab = document.getElementById(targetTabId);
    if (targetTab) {
        targetTab.classList.remove('hidden');
    }
    
    // Close mobile menu if open (safeguard)
    if (elements.navMenu && elements.navMenu.classList.contains('active')) {
        elements.navMenu.classList.remove('active');
    }
    
    window.scrollTo(0, 0);
}

/**
 * Gallery Logic
 */
function initGallery() {
    elements.galleryGrid.innerHTML = '';
    const MAX_PHOTOS = 12; // Configurable as requested
    
    for (let i = 1; i <= MAX_PHOTOS; i++) {
        const img = document.createElement('img');
        img.className = 'gallery-item';
        // Force the browser to attempt loading
        img.src = 'photos/' + i + '.jpg';
        img.alt = 'Gallery Image ' + i;
        img.loading = 'lazy';
        
        // If image doesn't exist, fallback to an aesthetic placeholder
        img.onerror = function() {
            if (this.src.indexOf('placeholder.svg') === -1) {
                this.src = 'photos/placeholder.svg';
                this.alt = 'Photo Coming Soon';
            } else {
                // If even the placeholder fails, then hide
                this.classList.add('hidden');
            }
        };
        
        elements.galleryGrid.appendChild(img);
    }
}

/**
 * Creates an event card DOM element
 */
function createEventCard(eventData) {
    const card = document.createElement('div');
    card.className = 'event-card';

    let timeHtml = '';
    if (eventData.isTimeline && eventData.timelineEvents) {
        const timelineItems = eventData.timelineEvents.map(t => 
            '<div class="timeline-item"><strong>' + t.time + '</strong> ' + t.name + '</div>'
        ).join('');
        timeHtml = '<div class="timeline">' + timelineItems + '</div>';
    } else {
        timeHtml = '<p>' + eventData.timeStr + '</p>';
    }

    let dressCodeHtml = eventData.dressCode.replace(/\n/g, '<br>');

    card.innerHTML = 
        '<div class="event-card-accent"></div>' +
        '<div class="event-header">' +
            '<h3 class="event-title">' + eventData.title + '</h3>' +
            '<p class="event-date">' + eventData.dateStr + '</p>' +
        '</div>' +
        '<div class="event-body">' +
            '<div class="detail-row">' +
                '<div class="detail-icon">' + icons.clock + '</div>' +
                '<div class="detail-content">' +
                    '<h4>Time</h4>' + timeHtml +
                '</div>' +
            '</div>' +
            '<div class="detail-row">' +
                '<div class="detail-icon">' + icons.mapPin + '</div>' +
                '<div class="detail-content">' +
                    '<h4>Location</h4>' +
                    '<p><strong>' + eventData.locationName + '</strong></p>' +
                    '<p>' + eventData.locationAddr + '</p>' +
                    '<a href="https://www.google.com/maps/search/?api=1&query=' + eventData.mapQuery + '" target="_blank" rel="noopener noreferrer" class="map-link">' +
                        'Get Directions ' + icons.externalLink +
                    '</a>' +
                '</div>' +
            '</div>' +
            '<div class="detail-row">' +
                '<div class="detail-icon">' + icons.shirt + '</div>' +
                '<div class="detail-content">' +
                    '<h4>Dress Code</h4>' +
                    '<p>' + dressCodeHtml + '</p>' +
                '</div>' +
            '</div>' +
            '<p class="event-description">' + eventData.description + '</p>' +
        '</div>';

    return card;
}

/**
 * RSVP Logic
 */
function openRsvpModal() {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return;
    
    const guestData = JSON.parse(sessionStr);
    const tierConfig = TIER_MAPPING[guestData.inviteTier];
    const eventsToRender = ALL_EVENTS.filter(event => tierConfig.events.includes(event.id));

    // Generate fields
    elements.rsvpDynamicFields.innerHTML = '';
    eventsToRender.forEach(event => {
        const group = document.createElement('div');
        group.className = 'rsvp-event-group';
        group.innerHTML = `
            <h4 class="rsvp-event-title">${event.title}</h4>
            <div class="rsvp-radio-options">
                <label class="radio-label">
                    <input type="radio" name="rsvp-${event.id}" value="Attending" required>
                    Joyfully Accept
                </label>
                <label class="radio-label">
                    <input type="radio" name="rsvp-${event.id}" value="Declining" required>
                    Regretfully Decline
                </label>
            </div>
        `;
        elements.rsvpDynamicFields.appendChild(group);
    });

    elements.rsvpStatusMessage.classList.add('hidden');
    elements.rsvpModal.classList.remove('hidden');
}

function closeRsvpModal() {
    elements.rsvpModal.classList.add('hidden');
}

async function handleRsvpSubmit(e) {
    e.preventDefault();
    
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return;
    const guestData = JSON.parse(sessionStr);

    // Collect data
    const formData = new FormData(elements.rsvpForm);
    const rsvpData = {
        code: guestData.privateCode,
        name: guestData.displayName,
        tier: guestData.inviteTier,
        timestamp: new Date().toISOString()
    };

    const tierConfig = TIER_MAPPING[guestData.inviteTier];
    tierConfig.events.forEach(eventId => {
        rsvpData[eventId] = formData.get('rsvp-' + eventId);
    });

    if (!RSVP_WEB_APP_URL) {
        // Mock submission if no URL provided
        console.log("Mock RSVP Submission:", rsvpData);
        elements.rsvpStatusMessage.innerHTML = "<strong>Success!</strong> Your RSVP was recorded locally. (Backend URL not configured).";
        elements.rsvpStatusMessage.classList.remove('hidden');
        elements.rsvpForm.reset();
        setTimeout(closeRsvpModal, 3000);
        return;
    }

    elements.submitRsvpBtn.disabled = true;
    elements.submitRsvpBtn.textContent = 'Submitting...';

    try {
        await fetch(RSVP_WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify(rsvpData),
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', 
                // using text/plain avoids CORS preflight blocks for simple Google Apps Scripts
            }
        });
        
        // Assumes success as Google Apps Script usually returns 200 or opaque
        elements.rsvpStatusMessage.innerHTML = "<strong>Success!</strong> Thank you for your RSVP.";
        elements.rsvpStatusMessage.style.color = "#2e7d32";
        elements.rsvpStatusMessage.style.backgroundColor = "#e8f5e9";
        elements.rsvpStatusMessage.classList.remove('hidden');
        elements.rsvpForm.reset();
        setTimeout(closeRsvpModal, 3000);
    } catch (err) {
        console.error("RSVP Submission Error:", err);
        elements.rsvpStatusMessage.innerHTML = "<strong>Error:</strong> Failed to submit. Please try again or contact us directly.";
        elements.rsvpStatusMessage.style.color = "#c9302c";
        elements.rsvpStatusMessage.style.backgroundColor = "#fdf2f2";
        elements.rsvpStatusMessage.classList.remove('hidden');
    } finally {
        elements.submitRsvpBtn.disabled = false;
        elements.submitRsvpBtn.textContent = 'Submit RSVP';
    }
}

// Boot the app
document.addEventListener('DOMContentLoaded', init);
