/**
 * TabbiMate Custom Modal
 * Replaces native alert/confirm dialogs with branded modals
 */

// Create modal container if it doesn't exist
function createModalContainer() {
    if (document.getElementById('tabbimate-modal')) return;

    const modalHTML = `
        <div id="tabbimate-modal" class="tabbimate-modal">
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title" id="modal-title"></h3>
                </div>
                <p class="modal-message" id="modal-message"></p>
                <div class="modal-actions" id="modal-actions"></div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close on overlay click
    const modal = document.getElementById('tabbimate-modal');
    const overlay = modal.querySelector('.modal-overlay');
    overlay.addEventListener('click', () => {
        if (modal.dataset.dismissible !== 'false') {
            closeModal();
        }
    });
}

// Show modal
function showModal() {
    const modal = document.getElementById('tabbimate-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('tabbimate-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Custom Alert
function customAlert(message, title = 'Notice') {
    createModalContainer();

    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalActions = document.getElementById('modal-actions');
    const modal = document.getElementById('tabbimate-modal');

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.dataset.dismissible = 'true';

    modalActions.innerHTML = `
        <button class="modal-btn modal-btn-confirm" id="modal-ok-btn">OK</button>
    `;

    const okBtn = document.getElementById('modal-ok-btn');
    okBtn.addEventListener('click', closeModal);

    showModal();
}

// Custom Confirm
function customConfirm(message, title = 'Confirm') {
    return new Promise((resolve) => {
        createModalContainer();

        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const modalActions = document.getElementById('modal-actions');
        const modal = document.getElementById('tabbimate-modal');

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.dataset.dismissible = 'false';

        modalActions.innerHTML = `
            <button class="modal-btn modal-btn-cancel" id="modal-cancel-btn">Cancel</button>
            <button class="modal-btn modal-btn-confirm" id="modal-confirm-btn">OK</button>
        `;

        const cancelBtn = document.getElementById('modal-cancel-btn');
        const confirmBtn = document.getElementById('modal-confirm-btn');

        cancelBtn.addEventListener('click', () => {
            closeModal();
            resolve(false);
        });

        confirmBtn.addEventListener('click', () => {
            closeModal();
            resolve(true);
        });

        showModal();
    });
}

// Custom Prompt
function customPrompt(message, defaultValue = '', title = 'Input') {
    return new Promise((resolve) => {
        createModalContainer();

        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const modalActions = document.getElementById('modal-actions');
        const modal = document.getElementById('tabbimate-modal');

        modalTitle.textContent = title;
        modal.dataset.dismissible = 'false';

        modalMessage.innerHTML = `
            <p style="margin-bottom: 12px;">${message}</p>
            <input type="text" id="modal-input" class="profile-input" value="${defaultValue}" style="width: 100%;">
        `;

        modalActions.innerHTML = `
            <button class="modal-btn modal-btn-cancel" id="modal-cancel-btn">Cancel</button>
            <button class="modal-btn modal-btn-confirm" id="modal-confirm-btn">OK</button>
        `;

        const input = document.getElementById('modal-input');
        const cancelBtn = document.getElementById('modal-cancel-btn');
        const confirmBtn = document.getElementById('modal-confirm-btn');

        input.focus();
        input.select();

        cancelBtn.addEventListener('click', () => {
            closeModal();
            resolve(null);
        });

        confirmBtn.addEventListener('click', () => {
            closeModal();
            resolve(input.value);
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                closeModal();
                resolve(input.value);
            }
        });

        showModal();
    });
}

// Export functions
if (typeof window !== 'undefined') {
    window.customAlert = customAlert;
    window.customConfirm = customConfirm;
    window.customPrompt = customPrompt;
}

