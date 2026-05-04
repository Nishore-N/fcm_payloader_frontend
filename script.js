// Configuration - Automatically detects if running locally or on Render
// Configuration - Automatically detects if running locally or on Render
const isLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.hostname.startsWith('192.168.') || 
                window.location.hostname.startsWith('10.') || 
                window.location.hostname.endsWith('.local');

// Dynamic Limits Configuration
const LIMITS = {
    in_app: { title: 25, subtitle: 50, body: 600 },
    notification: { title: 12, subtitle: 25, body: 200 },
    both: { title: 12, subtitle: 25, body: 200 }
};

const BACKEND_URL = isLocal 
    ? window.location.origin 
    : 'https://fcm-payloader-backend.onrender.com';

// Intro Animation & Loader Handling
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const appContainer = document.querySelector('.app-container');
    
    // Slight delay to ensure everything is rendered
    setTimeout(() => {
        loader.classList.add('fade-out');
        appContainer.classList.add('visible');
        initInteractions();
        fetchAppInfo(); // Fetch app info from backend
    }, 1500);
});

function initInteractions() {
    const iconMap = {
        'appName': 'fa-mobile-alt',
        'appIconText': 'fa-font',
        'appIconUrl': 'fa-image',
        'title': 'fa-heading',
        'body': 'fa-envelope-open-text',
        'imageUrl': 'fa-link',
        'cardType': 'fa-layer-group',
        'targetType': 'fa-users',
        'target': 'fa-key',
        'scheduledDate': 'fa-calendar-alt',
        'scheduledTime': 'fa-clock'
    };

    document.querySelectorAll('.field label, input, select, textarea').forEach(el => {
        let originalValue = '';

        // Capture value on focus
        el.addEventListener('focus', () => {
            originalValue = el.value;
        });

        el.addEventListener('click', (e) => {
            const id = el.getAttribute('for') || el.id;
            const iconClass = iconMap[id] || 'fa-star';
            spawnPop(e.pageX, e.pageY, iconClass);
        });

        // Removed preview update hint logic
    });
}

function spawnPop(x, y, iconClass) {
    const pop = document.createElement('i');
    pop.className = `fas ${iconClass} float-pop`;
    pop.style.left = `${x - 10}px`;
    pop.style.top = `${y - 10}px`;
    document.body.appendChild(pop);
    
    setTimeout(() => pop.remove(), 1000);
}

async function fetchAppInfo() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/app-info`);
        if (!response.ok) throw new Error('Failed to fetch app info');
        
        const data = await response.json();
        
        const appNameInput = document.getElementById('appName');
        const appIconTextInput = document.getElementById('appIconText');
        
        if (data.appName) {
            appNameInput.value = data.appName;
            console.log(`App Name synchronized: ${data.appName} (${data.source})`);
            
            // Also update any labels or placeholders if needed
            appNameInput.placeholder = data.appName;
        } else {
            console.warn('App info fetched but appName was empty');
            appNameInput.value = 'Application'; 
        }
        
        if (data.appIconText) {
            appIconTextInput.value = data.appIconText;
        } else {
            appIconTextInput.value = 'App';
        }
        
        // Refresh preview with new data
        updatePreview();
        
    } catch (error) {
        console.error('Error fetching app info, using fallback:', error);
        const appNameInput = document.getElementById('appName');
        const appIconTextInput = document.getElementById('appIconText');
        if (appNameInput) appNameInput.value = 'Application';
        if (appIconTextInput) appIconTextInput.value = 'App';
        updatePreview();
    }
}

// Elements
const form = document.getElementById('payloadForm');
const triggerType = document.getElementById('triggerType');
const delayField = document.getElementById('delayField');
const submitBtn = document.getElementById('submitBtn');
const statusMsg = document.getElementById('status');
const imageFieldWrapper = document.getElementById('imageFieldWrapper');
const iconTextField = document.getElementById('iconTextField');
const iconUrlField = document.getElementById('iconUrlField');
const toggleButtons = document.querySelectorAll('.toggle-btn');
const cardTypeSelect = document.getElementById('cardType');

// State for Dynamic Buttons
let actionButtons = [];

// Preview Containers & Tabs
const tabButtons = document.querySelectorAll('.phone-tab-btn');
const previewContainers = document.querySelectorAll('.preview-container');

// Input Listeners for Live Preview
const inputs = ['title', 'body', 'imageUrl', 'cardType', 'appName', 'appIconText', 'appIconUrl', 'notificationType', 'subtitle'];
inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updatePreview);
});

// Tab Switching
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        switchTab(tab);
    });
});

function switchTab(tab) {
    // Update Buttons
    tabButtons.forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tab);
    });
    
    // Update Containers
    previewContainers.forEach(container => {
        container.classList.toggle('active', container.id === `${tab}Preview`);
    });

    // Re-run updatePreview to ensure the newly visible tab is populated correctly
    updatePreview();
}

// Sync Tabs with Notification Type
const notificationTypeSelect = document.getElementById('notificationType');
notificationTypeSelect.addEventListener('change', syncPreviewTabs);

function syncPreviewTabs() {
    const type = notificationTypeSelect.value;
    const pushTabBtn = document.querySelector('.phone-tab-btn[data-tab="push"]');
    const inappTabBtn = document.querySelector('.phone-tab-btn[data-tab="inapp"]');
    
    // Get new limits
    const newLimits = LIMITS[type] || LIMITS.both;
    
    // Auto-Truncate content to safe buffers
    const titleField = document.getElementById('title');
    const subtitleField = document.getElementById('subtitle');
    const bodyField = document.getElementById('body');

    if (titleField.value.length > newLimits.title) {
        titleField.value = titleField.value.substring(0, newLimits.title);
    }
    if (subtitleField.value.length > newLimits.subtitle) {
        subtitleField.value = subtitleField.value.substring(0, newLimits.subtitle);
    }
    if (bodyField.value.length > newLimits.body) {
        bodyField.value = bodyField.value.substring(0, newLimits.body);
    }

    if (type === 'notification') {
        pushTabBtn.style.display = 'flex';
        inappTabBtn.style.display = 'none';
        switchTab('push');
    } else if (type === 'in_app') {
        pushTabBtn.style.display = 'none';
        inappTabBtn.style.display = 'flex';
        switchTab('inapp');
    } else {
        pushTabBtn.style.display = 'flex';
        inappTabBtn.style.display = 'flex';
    }
    
    updatePreview(); // Refresh UI and counters
}

// Dynamic Button Management
const addActionButton = document.getElementById('addActionButton');
const buttonsContainer = document.getElementById('buttonsContainer');
const noButtonsHint = document.getElementById('noButtonsHint');

addActionButton.addEventListener('click', () => {
    if (actionButtons.length >= 4) {
        alert('Maximum 4 buttons allowed for optimal display.');
        return;
    }
    
    // Collapse all existing buttons when adding a new one
    actionButtons.forEach(b => b.isExpanded = false);
    
    const id = Date.now();
    const newButton = {
        id: id,
        text: 'View Details',
        style: '1',
        actionType: 'link',
        actionValue: '',
        isExpanded: true // New button starts expanded
    };
    
    actionButtons.push(newButton);
    renderButtonFormItems();
    updatePreview();
});

function renderButtonFormItems() {
    buttonsContainer.innerHTML = '';
    noButtonsHint.style.display = actionButtons.length === 0 ? 'block' : 'none';
    
    actionButtons.forEach((btn, index) => {
        const item = document.createElement('div');
        item.className = `button-item ${btn.isExpanded ? '' : 'collapsed'}`;
        item.innerHTML = `
            <div class="button-item-header" data-id="${btn.id}">
                <div class="button-header-left">
                    <i class="fas fa-chevron-down btn-toggle-collapse"></i>
                    <span>Button ${index + 1}: <small>${btn.text}</small></span>
                </div>
                <button type="button" class="btn-remove-mini" data-id="${btn.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="button-item-body">
                <div class="grid-2-col">
                    <div class="field">
                        <label>Label</label>
                        <input type="text" class="btn-text-input" data-id="${btn.id}" value="${btn.text}" placeholder="e.g. View Details">
                    </div>
                    <div class="field">
                        <label>UI Style</label>
                        <select class="btn-style-input" data-id="${btn.id}">
                            <option value="1" ${btn.style === '1' ? 'selected' : ''}>Solid Primary</option>
                            <option value="2" ${btn.style === '2' ? 'selected' : ''}>Outline Ghost</option>
                            <option value="3" ${btn.style === '3' ? 'selected' : ''}>Text Link</option>
                            <option value="4" ${btn.style === '4' ? 'selected' : ''}>Full Width</option>
                        </select>
                    </div>
                </div>
                <div class="grid-2-col">
                    <div class="field">
                        <label>Action Type</label>
                        <select class="btn-action-type-input" data-id="${btn.id}">
                            <option value="link" ${btn.actionType === 'link' ? 'selected' : ''}>External Link</option>
                            <option value="route" ${btn.actionType === 'route' ? 'selected' : ''}>App Route</option>
                        </select>
                    </div>
                    <div class="field">
                        <label>Action Value</label>
                        <input type="text" class="btn-action-value-input" data-id="${btn.id}" value="${btn.actionValue}" placeholder="${btn.actionType === 'link' ? 'https://...' : 'e.g. event_details'}">
                    </div>
                </div>
            </div>
        `;
        
        buttonsContainer.appendChild(item);
        
        // Add Listeners
        const header = item.querySelector('.button-item-header');
        const trashBtn = item.querySelector('.btn-remove-mini');
        
        // Toggle Collapse on Header Click
        header.addEventListener('click', (e) => {
            // Don't toggle if trash button is clicked
            if (e.target.closest('.btn-remove-mini')) return;
            
            btn.isExpanded = !btn.isExpanded;
            item.classList.toggle('collapsed', !btn.isExpanded);
        });

        trashBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            actionButtons = actionButtons.filter(b => b.id !== btn.id);
            renderButtonFormItems();
            updatePreview();
        });
        
        item.querySelector('.btn-text-input').addEventListener('input', (e) => {
            btn.text = e.target.value;
            updatePreview();
        });
        
        item.querySelector('.btn-style-input').addEventListener('change', (e) => {
            btn.style = e.target.value;
            updatePreview();
        });
        
        item.querySelector('.btn-action-type-input').addEventListener('change', (e) => {
            btn.actionType = e.target.value;
            const valInput = item.querySelector('.btn-action-value-input');
            valInput.placeholder = btn.actionType === 'link' ? 'https://...' : 'e.g. event_details';
            updatePreview();
        });
        
        item.querySelector('.btn-action-value-input').addEventListener('input', (e) => {
            btn.actionValue = e.target.value;
            updatePreview();
        });
    });
}

// Initial update
syncPreviewTabs();
updatePreview();

// Preview Click Simulation logic moved to updatePreview for dynamic buttons

let hintTimeout;
function updatePreview() {
    const rawTitle = document.getElementById('title').value;
    const rawSubtitle = document.getElementById('subtitle').value;
    const rawBody = document.getElementById('body').value;
    
    const title = rawTitle || 'Notification Title';
    const subtitle = rawSubtitle;
    const body = rawBody || 'Your message will appear here. Start typing to see it change in real-time.';
    const imageUrl = document.getElementById('imageUrl').value;
    const cardTypeVal = document.getElementById('cardType').value;
    const appNameVal = document.getElementById('appName').value || 'Application';
    const appIconTextVal = document.getElementById('appIconText').value || 'App';
    const appIconUrlVal = document.getElementById('appIconUrl').value;
    const iconMode = document.querySelector('input[name="iconMode"]:checked').value;
    const type = document.getElementById('notificationType').value;

    // 1. Update Counters (Using Raw Values)
    const currentLimits = LIMITS[type] || LIMITS.both;
    document.getElementById('titleCount').textContent = `${rawTitle.length} / ${currentLimits.title}`;
    document.getElementById('subtitleCount').textContent = `${rawSubtitle.length} / ${currentLimits.subtitle}`;
    document.getElementById('bodyCount').textContent = `${rawBody.length} / ${currentLimits.body}`;
    updateCounterColor('titleCount', rawTitle.length, currentLimits.title);
    updateCounterColor('subtitleCount', rawSubtitle.length, currentLimits.subtitle);
    updateCounterColor('bodyCount', rawBody.length, currentLimits.body);

    // 2. Sync All Cards (Push and In-App)
    const cards = document.querySelectorAll('.preview-card-ref');
    cards.forEach(card => {
        card.className = `notification-card card-type-${cardTypeVal} preview-card-ref`;
        
        // Text Content
        card.querySelector('.preview-title-ref').textContent = title;
        card.querySelector('.preview-body-ref').textContent = body;
        card.querySelector('.preview-body-ref').style.textAlign = 'justify';
        
        const subtitleEl = card.querySelector('.preview-subtitle-ref');
        if (subtitle) {
            subtitleEl.textContent = subtitle;
            subtitleEl.style.display = 'block';
            subtitleEl.style.textAlign = 'center';
            subtitleEl.style.fontSize = '0.8rem';
            subtitleEl.style.fontStyle = 'italic';
            subtitleEl.style.color = 'inherit';
            subtitleEl.style.opacity = '0.7';
        } else {
            subtitleEl.style.display = 'none';
        }

        // Branding
        card.querySelector('.preview-app-name').textContent = appNameVal;
        const iconEl = card.querySelector('.preview-app-icon');
        if (iconMode === 'image' && appIconUrlVal) {
            iconEl.innerHTML = `<img src="${appIconUrlVal}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;">`;
        } else {
            iconEl.innerHTML = '';
            iconEl.textContent = appIconTextVal;
        }

        // Images
        const mainImg = card.querySelector('.preview-main-image');
        const sideImg = card.querySelector('.preview-side-image-ref');
        const mainImgContainer = card.querySelector('.preview-image-container');
        const sideImgContainer = card.querySelector('.preview-side-image-container');

        if (imageUrl) {
            mainImg.src = imageUrl;
            sideImg.src = imageUrl;
        } else {
            const fallback = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=400&q=80';
            mainImg.src = fallback;
            sideImg.src = fallback;
        }

        // Visibility based on card type
        mainImgContainer.style.display = (cardTypeVal === '2' || cardTypeVal === '3') ? 'block' : 'none';
        sideImgContainer.style.display = (cardTypeVal === '3') ? 'block' : 'none';
        card.querySelector('.preview-promo-badge').style.display = cardTypeVal === '4' ? 'block' : 'none';

        // Buttons
        const btnContainer = card.querySelector('.preview-button-container-ref');
        btnContainer.innerHTML = '';
        if (actionButtons.length > 0) {
            btnContainer.style.display = 'flex';
            btnContainer.className = 'card-footer preview-button-container-ref';
            if (actionButtons.length > 1) btnContainer.classList.add('row-layout');

            actionButtons.forEach(btn => {
                const pBtn = document.createElement('button');
                pBtn.type = 'button';
                pBtn.className = `btn-type-${btn.style}`;
                pBtn.textContent = btn.text;
                btnContainer.appendChild(pBtn);
            });
        } else {
            btnContainer.style.display = 'none';
        }
    });

    // 3. UI Field Visibility
    imageFieldWrapper.style.display = (cardTypeVal === '2' || cardTypeVal === '3') ? 'block' : 'none';
}

// Toggle Delay Field
triggerType.addEventListener('change', (e) => {
    delayField.style.display = e.target.value === 'scheduled' ? 'block' : 'none';
    if (e.target.value === 'scheduled') {
        const now = new Date();
        
        // Default Date (YYYY-MM-DD)
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const dateInput = document.getElementById('scheduledDate');
        dateInput.value = `${year}-${month}-${day}`;
        dateInput.min = `${year}-${month}-${day}`; // Prevent past dates
        
        // Default Time (HH:mm) - 1 minute from now
        now.setMinutes(now.getMinutes() + 1);
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const timeInput = document.getElementById('scheduledTime');
        timeInput.value = `${hours}:${minutes}`;
        
        updateTimeMinRestriction();
    }
});

// Update time min restriction based on date selection
const dateInput = document.getElementById('scheduledDate');
const timeInput = document.getElementById('scheduledTime');

dateInput.addEventListener('change', updateTimeMinRestriction);
timeInput.addEventListener('focus', updateTimeMinRestriction); // Refresh min time when clicking the field

function updateTimeMinRestriction() {
    const now = new Date();
    
    // Get local date in YYYY-MM-DD format
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const localToday = `${year}-${month}-${day}`;
    
    if (dateInput.value === localToday) {
        // If today is selected, restrict time to CURRENT local time
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeInput.min = `${hours}:${minutes}`;
        
        // If the current value is now in the past, reset it to current time + 1 min
        if (timeInput.value && timeInput.value < timeInput.min) {
            now.setMinutes(now.getMinutes() + 1);
            const nextHours = String(now.getHours()).padStart(2, '0');
            const nextMins = String(now.getMinutes()).padStart(2, '0');
            timeInput.value = `${nextHours}:${nextMins}`;
        }
    } else {
        // If future date, no time restriction
        timeInput.min = "";
    }
}

// Target Type Label Logic
// Target Selection Elements
const targetType = document.getElementById('targetType');
const targetLabel = document.querySelector('label[for="target"]');
const targetContainer = document.getElementById('targetContainer');
const addTokenBtn = document.getElementById('addTokenBtn');

// Add more tokens logic
addTokenBtn.addEventListener('click', () => {
    const wrapper = document.createElement('div');
    wrapper.className = 'target-input-wrapper';
    wrapper.innerHTML = `
        <input type="text" class="target-input" placeholder="Paste unique device FCM token" required>
        <button type="button" class="remove-token-btn" title="Remove">
            <i class="fas fa-times"></i>
        </button>
    `;
    targetContainer.appendChild(wrapper);
    
    // Add remove listener
    wrapper.querySelector('.remove-token-btn').addEventListener('click', () => {
        wrapper.remove();
    });
});

targetType.addEventListener('change', (e) => {
    // Clear and reset tokens
    const wrappers = targetContainer.querySelectorAll('.target-input-wrapper');
    wrappers.forEach((w, index) => {
        if (index === 0) {
            const input = w.querySelector('input');
            input.value = '';
            // Show/Hide plus button
            w.querySelector('#addTokenBtn').style.display = e.target.value === 'topic' ? 'none' : 'flex';
        } else {
            w.remove();
        }
    });

    if (e.target.value === 'topic') {
        targetLabel.innerHTML = '<i class="fas fa-hashtag"></i> Target Topic Name <span class="required-star">*</span>';
        targetContainer.querySelector('input').placeholder = 'e.g. all_users or promotions';
    } else {
        targetLabel.innerHTML = '<i class="fas fa-key"></i> Recipient Token <span class="required-star">*</span>';
        targetContainer.querySelector('input').placeholder = 'Paste unique device FCM token';
    }
});

// Handle Icon Mode Toggle
toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update UI
        toggleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        btn.querySelector('input').checked = true;

        // Show/Hide Fields & Toggle Required
        const mode = btn.dataset.mode;
        if (mode === 'text') {
            iconTextField.style.display = 'block';
            iconUrlField.style.display = 'none';
            document.getElementById('appIconText').required = true;
            document.getElementById('appIconUrl').required = false;
        } else {
            iconTextField.style.display = 'none';
            iconUrlField.style.display = 'block';
            document.getElementById('appIconText').required = false;
            document.getElementById('appIconUrl').required = true;
        }
        updatePreview();
    });
});

// Form Submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Explicit Validation Check
    const titleVal = document.getElementById('title').value.trim();
    const bodyVal = document.getElementById('body').value.trim();
    const targetTypeVal = document.getElementById('targetType').value;
    const tokenInputs = targetContainer.querySelectorAll('.target-input');
    const targetValues = Array.from(tokenInputs).map(i => i.value.trim()).filter(v => v !== '');
    
    const appNameVal = document.getElementById('appName').value.trim();
    const iconMode = document.querySelector('input[name="iconMode"]:checked').value;
    const appIconTextVal = document.getElementById('appIconText').value.trim();
    const appIconUrlVal = document.getElementById('appIconUrl').value.trim();

    let validationError = false;
    if (!appNameVal) {
        statusMsg.textContent = 'Please enter Application Name';
        document.getElementById('appName').focus();
        validationError = true;
    } else if (iconMode === 'text' && !appIconTextVal) {
        statusMsg.textContent = 'Please enter Icon Text';
        document.getElementById('appIconText').focus();
        validationError = true;
    } else if (iconMode === 'image' && !appIconUrlVal) {
        statusMsg.textContent = 'Please enter App Icon URL';
        document.getElementById('appIconUrl').focus();
        validationError = true;
    } else if (!titleVal) {
        statusMsg.textContent = 'Please enter Notification Title';
        document.getElementById('title').focus();
        validationError = true;
    } else if (!bodyVal) {
        statusMsg.textContent = 'Please enter Message Body';
        document.getElementById('body').focus();
        validationError = true;
    } else if (targetValues.length === 0) {
        const targetLabelText = targetTypeVal === 'topic' ? 'Target Topic Name' : 'Recipient Token';
        statusMsg.textContent = `Please enter at least one ${targetLabelText}`;
        tokenInputs[0].focus();
        validationError = true;
    }

    if (validationError) {
        statusMsg.className = 'status-message error';
        statusMsg.style.display = 'block';
        return;
    }
    
    submitBtn.disabled = true;
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>';
    
    statusMsg.className = 'status-message';
    statusMsg.textContent = '';
    statusMsg.style.display = 'none';

    const data = {
        title: document.getElementById('title').value,
        subtitle: document.getElementById('subtitle').value,
        body: document.getElementById('body').value,
        imageUrl: (cardTypeSelect.value === '2' || cardTypeSelect.value === '3') ? document.getElementById('imageUrl').value : '',
        cardType: cardTypeSelect.value,
        appName: document.getElementById('appName').value,
        appIconText: document.querySelector('input[name="iconMode"]:checked').value === 'text' ? document.getElementById('appIconText').value : '',
        appIconUrl: document.querySelector('input[name="iconMode"]:checked').value === 'image' ? document.getElementById('appIconUrl').value : '',
        buttons: actionButtons.map(b => ({
            text: b.text,
            style: b.style,
            type: b.actionType,
            value: b.actionValue
        })),
        notificationType: document.getElementById('notificationType').value,
        targetType: targetTypeVal,
        target: targetTypeVal === 'topic' ? targetValues[0] : targetValues, // Single string for topic, array for tokens
        triggerType: document.getElementById('triggerType').value,
        delay: 0
    };

    if (data.triggerType === 'scheduled') {
        const dateVal = document.getElementById('scheduledDate').value;
        const timeVal = document.getElementById('scheduledTime').value;
        
        if (!dateVal || !timeVal) {
            statusMsg.textContent = 'Please select both Date and Time';
            statusMsg.classList.add('error');
            statusMsg.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
        }

        const scheduledDateTime = new Date(`${dateVal}T${timeVal}`);
        const now = new Date().getTime();
        const diff = Math.floor((scheduledDateTime.getTime() - now) / 1000);

        if (diff < 0) {
            statusMsg.textContent = 'Selected time is in the past! Please pick a future time.';
            statusMsg.classList.add('error');
            statusMsg.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
        }
        
        data.delay = diff;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/send-notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        statusMsg.style.display = 'block';
        statusMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        if (response.ok) {
            statusMsg.textContent = result.message || 'Notification sent successfully!';
            statusMsg.className = 'status-message success';
            
            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                if (statusMsg.classList.contains('success')) {
                    statusMsg.style.display = 'none';
                }
            }, 5000);

            // 10 Second Cooldown Logic
            submitBtn.disabled = true;
            let cooldown = 10;
            
            const timer = setInterval(() => {
                cooldown--;
                if (cooldown <= 0) {
                    clearInterval(timer);
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                } else {
                    submitBtn.innerHTML = `<i class="fas fa-clock"></i> <span>Wait ${cooldown}s...</span>`;
                }
            }, 1000);

            // Set initial cooldown state
            submitBtn.innerHTML = `<i class="fas fa-clock"></i> <span>Wait ${cooldown}s...</span>`;
            
        } else {
            statusMsg.textContent = 'Error: ' + (result.details || result.error || 'Failed to send');
            statusMsg.className = 'status-message error';
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    } catch (err) {
        statusMsg.style.display = 'block';
        statusMsg.textContent = 'Network error: ' + err.message;
        statusMsg.className = 'status-message error';
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
});

function updateDynamicLimits() {
    const type = document.getElementById('notificationType').value;
    const currentLimits = LIMITS[type] || LIMITS.both;
    
    const fields = {
        title: document.getElementById('title'),
        subtitle: document.getElementById('subtitle'),
        body: document.getElementById('body')
    };
    
    // Update maxlength and truncate if necessary
    fields.title.maxLength = currentLimits.title;
    if (fields.title.value.length > currentLimits.title) {
        fields.title.value = fields.title.value.substring(0, currentLimits.title);
    }

    fields.subtitle.maxLength = currentLimits.subtitle;
    if (fields.subtitle.value.length > currentLimits.subtitle) {
        fields.subtitle.value = fields.subtitle.value.substring(0, currentLimits.subtitle);
    }

    fields.body.maxLength = currentLimits.body;
    if (fields.body.value.length > currentLimits.body) {
        fields.body.value = fields.body.value.substring(0, currentLimits.body);
    }
    
    // Update counter labels (will be updated by updatePreview)
    updatePreview();
}

// Add listener for type change
document.getElementById('notificationType').addEventListener('change', updateDynamicLimits);

// Initial limits setup
updateDynamicLimits();

function updateCounterColor(id, length, max) {
    const el = document.getElementById(id);
    if (!el) return;
    if (length >= max) {
        el.style.color = '#ef4444'; // error red
    } else if (length >= max * 0.8) {
        el.style.color = '#f59e0b'; // warning yellow
    } else {
        el.style.color = 'var(--text-dim)';
    }
}

// Add event listeners for counters
['title', 'subtitle', 'body'].forEach(id => {
    document.getElementById(id).addEventListener('input', updatePreview);
});
