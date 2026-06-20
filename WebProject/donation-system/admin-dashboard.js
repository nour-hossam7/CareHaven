document.addEventListener('DOMContentLoaded', async function() {
    const user = requireAuth();
    if (!user) return;

    if (getUserRole(user) !== 'admin') {
        window.location.href = getDashboardPath(user);
        return;
    }

    document.getElementById('adminName').textContent = user.name;
    document.getElementById('year').textContent = new Date().getFullYear();

    await loadStatistics();
    await loadPendingNGOs();
});

async function loadStatistics() {
    try {
        const response = await apiRequest('/ngos/admin/statistics');
        const stats = response.statistics;
        document.getElementById('statTotal').textContent = stats.total;
        document.getElementById('statApproved').textContent = stats.approved;
        document.getElementById('statPending').textContent = stats.pending;
        document.getElementById('statRejected').textContent = stats.rejected;
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function loadPendingNGOs() {
    const container = document.getElementById('pendingList');
    container.innerHTML = '<p class="no-data">Loading pending NGOs...</p>';

    try {
        const response = await apiRequest('/ngos/admin/pending?limit=100');
        const ngos = response.ngos;

        if (!ngos.length) {
            container.innerHTML = '<p class="no-data">No NGOs awaiting approval.</p>';
            return;
        }

        container.innerHTML = ngos.map((ngo) => `
            <div class="ngo-card" data-ngo-id="${escapeHTML(ngo._id)}">
                <div class="ngo-info">
                    <h3>${escapeHTML(ngo.name)}</h3>
                    <p><strong>Email:</strong> ${escapeHTML(ngo.email)}</p>
                    <p><strong>Phone:</strong> ${escapeHTML(ngo.phone)}</p>
                    <p><strong>Registration #:</strong> ${escapeHTML(ngo.registrationNumber)}</p>
                    ${ngo.description ? `<p>${escapeHTML(ngo.description)}</p>` : ''}
                    <p class="ngo-date">Submitted: ${new Date(ngo.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="ngo-actions">
                    <button class="btn btn-primary btn-approve" data-id="${escapeHTML(ngo._id)}">Approve</button>
                    <button class="btn btn-secondary btn-reject" data-id="${escapeHTML(ngo._id)}">Reject</button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.btn-approve').forEach((btn) => {
            btn.addEventListener('click', () => approveNGO(btn.dataset.id, btn));
        });

        container.querySelectorAll('.btn-reject').forEach((btn) => {
            btn.addEventListener('click', () => rejectNGO(btn.dataset.id, btn));
        });
    } catch (error) {
        container.innerHTML = `<p class="no-data">Unable to load NGOs: ${escapeHTML(error.message)}</p>`;
    }
}

async function approveNGO(ngoId, button) {
    button.disabled = true;
    try {
        await apiRequest(`/ngos/admin/approve/${ngoId}`, { method: 'POST', body: {} });
        showMessage('NGO approved successfully.', 'success');
        await loadStatistics();
        await loadPendingNGOs();
    } catch (error) {
        showMessage(error.message, 'error');
        button.disabled = false;
    }
}

async function rejectNGO(ngoId, button) {
    const reason = prompt('Enter rejection reason (optional):') || 'Application did not meet requirements.';
    button.disabled = true;
    try {
        await apiRequest(`/ngos/admin/reject/${ngoId}`, {
            method: 'POST',
            body: { rejectionReason: reason }
        });
        showMessage('NGO rejected.', 'success');
        await loadStatistics();
        await loadPendingNGOs();
    } catch (error) {
        showMessage(error.message, 'error');
        button.disabled = false;
    }
}
