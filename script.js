// Configuration - Update this to your deployed Backend URL
const BACKEND_URL = 'https://fcm-payloader-backend.onrender.com'; // Deployed Render Backend URL

// Intro Animation & Loader Handling
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const appContainer = document.querySelector('.app-container');
    
    // Slight delay to ensure everything is rendered
    setTimeout(() => {
        loader.classList.add('fade-out');
        appContainer.classList.add('visible');
        initInteractions();
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
        'buttonType': 'fa-mouse-pointer',
        'buttonText': 'fa-i-cursor',
        'deepLink': 'fa-external-link-alt',
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

// Preview Elements
const previewTitle = document.getElementById('previewTitle');
const previewBody = document.getElementById('previewBody');
const previewImage = document.getElementById('previewImage');
const previewSideImage = document.getElementById('previewSideImage');
const previewButton = document.getElementById('previewButton');
const previewCard = document.getElementById('previewCard');
const previewContent = document.getElementById('previewContent');

const previewAppName = document.querySelectorAll('.app-name');
const previewAppIcon = document.querySelectorAll('.app-icon');

// Input Listeners for Live Preview
const inputs = ['title', 'body', 'imageUrl', 'buttonText', 'cardType', 'buttonType', 'appName', 'appIconText', 'appIconUrl'];
inputs.forEach(id => {
    document.getElementById(id).addEventListener('input', updatePreview);
});

// Initial update
updatePreview();

// Preview Action Redirect
previewButton.addEventListener('click', () => {
    const deepLink = document.getElementById('deepLink').value;
    if (deepLink) {
        if (deepLink.startsWith('http://') || deepLink.startsWith('https://')) {
            window.open(deepLink, '_blank');
        } else {
            // Handle as deep link (alert for demo purposes in web preview)
            alert(`Deep Link Triggered: ${deepLink}\n(On a mobile device, this would open the specific app screen)`);
        }
    }
});

let hintTimeout;
function updatePreview() {
    const title = document.getElementById('title').value || 'Notification Title';
    const body = document.getElementById('body').value || 'Your message will appear here. Start typing to see it change in real-time.';
    const imageUrl = document.getElementById('imageUrl').value;
    const buttonText = document.getElementById('buttonText').value || 'View Details';
    const cardTypeVal = document.getElementById('cardType').value;
    const buttonTypeVal = document.getElementById('buttonType').value;
    const appNameVal = document.getElementById('appName').value || 'Application';
    const appIconTextVal = document.getElementById('appIconText').value || 'App';
    const appIconUrlVal = document.getElementById('appIconUrl').value;
    const iconMode = document.querySelector('input[name="iconMode"]:checked').value;

    const previewTitle = document.getElementById('previewTitle');

    // Update text
    previewTitle.textContent = title;
    previewBody.textContent = body;
    previewButton.textContent = buttonText;
    
    const isCentered = cardTypeVal === '1' || cardTypeVal === '4';
    const alignStyle = isCentered ? 'center' : 'left';
    
    // Apply alignment to preview container
    previewCard.style.textAlign = alignStyle;
    previewContent.style.alignItems = isCentered ? 'center' : 'flex-start';
    previewButton.style.alignSelf = isCentered ? 'center' : 'flex-start';

    // Handle Background: Clear any inline background to allow CSS class to take over
    previewCard.style.background = '';

    // Update Branding in Preview
    document.querySelectorAll('.app-name').forEach(el => el.textContent = appNameVal);
    document.querySelectorAll('.app-icon').forEach(el => {
        if (iconMode === 'image' && appIconUrlVal) {
            el.innerHTML = `<img src="${appIconUrlVal}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;">`;
        } else {
            el.innerHTML = '';
            el.textContent = appIconTextVal;
        }
    });

    // Update Card Type Class
    previewCard.className = `notification-card card-type-${cardTypeVal}`;

    // Update Image Field Visibility (Only show for Type 2 and Type 3)
    if (cardTypeVal === '2' || cardTypeVal === '3') {
        imageFieldWrapper.style.display = 'block';
    } else {
        imageFieldWrapper.style.display = 'none';
    }

    // Update Images
    if (imageUrl) {
        previewImage.src = imageUrl;
        previewSideImage.src = imageUrl;
        // The display logic is handled by CSS based on card-type class
    } else {
        // Fallback or hide
        previewImage.src = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=400&q=80';
        previewSideImage.src = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=400&q=80';
    }

    // Update Button Type Class
    previewButton.className = `btn-type-${buttonTypeVal}`;
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
        body: document.getElementById('body').value,
        imageUrl: (cardTypeSelect.value === '2' || cardTypeSelect.value === '3') ? document.getElementById('imageUrl').value : '',
        cardType: cardTypeSelect.value,
        buttonType: document.getElementById('buttonType').value,
        buttonText: document.getElementById('buttonText').value,
        appName: document.getElementById('appName').value,
        appIconText: document.querySelector('input[name="iconMode"]:checked').value === 'text' ? document.getElementById('appIconText').value : '',
        appIconUrl: document.querySelector('input[name="iconMode"]:checked').value === 'image' ? document.getElementById('appIconUrl').value : '',
        deepLink: document.getElementById('deepLink').value,
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
