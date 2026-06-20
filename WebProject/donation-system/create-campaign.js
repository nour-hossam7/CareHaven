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
        document.getElementById('campaignForm').querySelectorAll('input, textarea, select, button').forEach((el) => {
            el.disabled = true;
        });
        showMessage('Your NGO must be approved before you can create campaigns.', 'error');
        return;
    }

    document.getElementById('campaignForm').addEventListener('submit', createCampaign);
});

async function createCampaign(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (new Date(startDate) >= new Date(endDate)) {
        showMessage('End date must be after start date', 'error');
        return;
    }

    const campaignData = {
        title: document.getElementById('campaignTitle').value.trim(),
        description: document.getElementById('campaignDescription').value.trim(),
        targetAmount: Number(document.getElementById('targetAmount').value),
        category: document.getElementById('category').value,
        startDate,
        endDate,
        image: document.getElementById('campaignImage').value.trim()
    };

    setLoading(form, true);

    try {
        const response = await apiRequest('/campaigns/create', {
            method: 'POST',
            body: campaignData
        });

        showMessage(response.message || 'Campaign created successfully.', 'success');
        setTimeout(() => {
            window.location.href = `campaign-details.html?campaignId=${response.campaign._id}`;
        }, 1000);
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        setLoading(form, false);
    }
}
