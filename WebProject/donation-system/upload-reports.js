document.addEventListener('DOMContentLoaded', async function() {
    let user = requireAuth();
    if (!user) return;

    if (getUserRole(user) !== 'ngo') {
        window.location.href = getDashboardPath(user);
        return;
    }

    user = await refreshCurrentUser() || user;
    showApprovalBanner(user);

    if (!isNgoApproved(user)) {
        document.getElementById('reportForm').querySelectorAll('input, textarea, select, button').forEach((el) => {
            el.disabled = true;
        });
        showMessage('Your NGO must be approved before you can upload reports.', 'error');
        return;
    }

    document.getElementById('reportForm').addEventListener('submit', uploadReport);
    loadCampaignOptions(user);
});

async function loadCampaignOptions(user) {
    const select = document.getElementById('campaignSelect');

    if (!user.ngoId) {
        select.innerHTML = '<option value="">No NGO profile is linked to this account</option>';
        return;
    }

    try {
        const response = await apiRequest(`/campaigns/ngo/${user.ngoId}?limit=100`, { skipAuth: true });

        if (!response.campaigns.length) {
            select.innerHTML = '<option value="">No campaigns available — create a campaign first</option>';
            return;
        }

        select.innerHTML = response.campaigns.map((campaign) => (
            `<option value="${escapeHTML(campaign._id)}">${escapeHTML(campaign.title)}</option>`
        )).join('');
    } catch (error) {
        select.innerHTML = '<option value="">Unable to load campaigns</option>';
        showMessage(error.message, 'error');
    }
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Unable to read selected file'));
        reader.readAsDataURL(file);
    });
}

async function uploadReport(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const file = document.getElementById('reportFile').files[0];
    const maxBytes = 3 * 1024 * 1024;

    if (!file) {
        showMessage('Please select a report file', 'error');
        return;
    }

    if (file.size > maxBytes) {
        showMessage('Report file must be 3MB or smaller', 'error');
        return;
    }

    setLoading(form, true);

    try {
        const fileData = await readFileAsDataURL(file);
        const response = await apiRequest('/reports', {
            method: 'POST',
            body: {
                campaignId: document.getElementById('campaignSelect').value,
                title: document.getElementById('reportTitle').value.trim(),
                description: document.getElementById('reportDescription').value.trim(),
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                fileData
            }
        });

        showMessage(response.message || 'Report uploaded successfully.', 'success');
        form.reset();
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        setLoading(form, false);
    }
}
