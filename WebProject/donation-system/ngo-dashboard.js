document.addEventListener('DOMContentLoaded', async function() {
    let user = requireAuth();
    if (!user) return;

    if (getUserRole(user) !== 'ngo') {
        window.location.href = getDashboardPath(user);
        return;
    }

    user = await refreshCurrentUser() || user;

    const ngoName = document.getElementById('ngoName');
    if (ngoName) ngoName.textContent = user.organizationName || user.name || 'CareHaven NGO';

    const welcomeHeading = document.getElementById('welcomeHeading');
    if (welcomeHeading) welcomeHeading.textContent = `Welcome to your CareHaven, ${user.name}`;

    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    showApprovalBanner(user);
    initDashboard(user);
});

async function initDashboard(user) {
    const list = document.getElementById('campaignList');
    list.innerHTML = '<p class="empty-state">Loading campaigns...</p>';

    if (!user.ngoId) {
        list.innerHTML = '<p class="empty-state">No NGO profile is linked to this account.</p>';
        return;
    }

    let campaigns = [];

    try {
        const response = await apiRequest(`/campaigns/ngo/${user.ngoId}?limit=100`, { skipAuth: true });
        campaigns = response.campaigns.map((campaign) => ({
            id: campaign._id,
            title: campaign.title,
            image: campaign.image,
            raised: Number(campaign.collectedAmount || 0),
            goal: Number(campaign.targetAmount || 0),
            progress: campaign.targetAmount
                ? Math.min(Math.round((campaign.collectedAmount / campaign.targetAmount) * 100), 100)
                : 0
        }));
    } catch (error) {
        list.innerHTML = `<p class="empty-state">Unable to load campaigns: ${escapeHTML(error.message)}</p>`;
        return;
    }

    renderStats(campaigns);
    renderCampaignList(campaigns);
}

function renderStats(campaigns) {
    const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.raised, 0);
    const activeCampaigns = campaigns.filter((campaign) => campaign.progress < 100).length;
    const averageProgress = campaigns.length
        ? Math.round(campaigns.reduce((sum, campaign) => sum + campaign.progress, 0) / campaigns.length)
        : 0;

    document.getElementById('totalCampaigns').textContent = campaigns.length;
    document.getElementById('activeCampaigns').textContent = activeCampaigns;
    document.getElementById('totalDonations').textContent = `$${totalRaised.toLocaleString()}`;
    document.getElementById('monthlyProgress').style.width = `${averageProgress}%`;
    document.getElementById('monthlyProgress').textContent = `${averageProgress}%`;
}

function renderCampaignList(campaigns) {
    const list = document.getElementById('campaignList');
    if (!list) return;

    if (!campaigns.length) {
        list.innerHTML = '<p class="empty-state">No campaigns yet. Create your first campaign to begin fundraising.</p>';
        return;
    }

    list.innerHTML = campaigns.map((campaign) => `
        <div class="campaign-card">
            <div class="thumb">
                ${campaign.image ? `<img src="${escapeHTML(campaign.image)}" alt="${escapeHTML(campaign.title)}">` : ''}
            </div>
            <div class="campaign-card-content">
                <h3>${escapeHTML(campaign.title)}</h3>
                <div class="progress-small" aria-label="Campaign progress">
                    <div class="inner" style="width: ${campaign.progress}%"></div>
                </div>
                <p>${campaign.progress}% funded &middot; $${campaign.raised.toLocaleString()} / $${campaign.goal.toLocaleString()}</p>
                <button type="button" data-campaign-id="${escapeHTML(campaign.id)}">View</button>
            </div>
        </div>
    `).join('');

    list.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', () => {
            window.location.href = `campaign-details.html?campaignId=${encodeURIComponent(button.dataset.campaignId)}`;
        });
    });
}
