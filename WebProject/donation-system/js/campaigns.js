let allCampaigns = [];

document.addEventListener('DOMContentLoaded', function() {
    const user = checkAuth();

    const dashboardLink = document.getElementById('dashboardLink');
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');

    if (user) {
        if (dashboardLink) {
            dashboardLink.href = getDashboardPath(user);
            dashboardLink.style.display = '';
        }
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = '';
    } else {
        if (dashboardLink) dashboardLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
    }

    setupFilters();
    loadCampaigns();
});

function normalizeCampaign(campaign) {
    const ngo = campaign.ngoId || {};
    const startDate = campaign.startDate ? new Date(campaign.startDate) : null;
    const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
    const daysLeft = endDate && !Number.isNaN(endDate.getTime())
        ? Math.max(Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)), 0)
        : campaign.daysLeft;

    return {
        id: campaign._id || campaign.id,
        title: campaign.title,
        description: campaign.description,
        targetAmount: Number(campaign.targetAmount || 0),
        collectedAmount: Number(campaign.collectedAmount ?? campaign.raisedAmount ?? 0),
        image: campaign.image || 'images/img1.jpg',
        ngoName: ngo.name || campaign.ngoName || 'Verified CareHaven Partner',
        category: campaign.category || 'Other',
        daysLeft,
        verified: ngo.status ? ngo.status === 'Approved' : campaign.verified !== false,
        createdAt: campaign.createdAt || (startDate ? startDate.toISOString() : null)
    };
}

async function loadCampaigns() {
    const container = document.getElementById('campaignsContainer');
    container.innerHTML = '<p class="no-data">Loading campaigns...</p>';

    try {
        const response = await apiRequest('/campaigns/all?status=Active&limit=100', { skipAuth: true });
        allCampaigns = response.campaigns.map(normalizeCampaign);
    } catch (error) {
        container.innerHTML = `<p class="no-data">Unable to load campaigns. Make sure the backend is running at ${escapeHTML(API_BASE)}.<br>${escapeHTML(error.message)}</p>`;
        return;
    }

    filterAndSortCampaigns();
}

function displayCampaigns(campaigns) {
    const container = document.getElementById('campaignsContainer');

    if (!campaigns.length) {
        container.innerHTML = '<p class="no-data">No active campaigns yet. Check back soon!</p>';
        return;
    }

    container.innerHTML = campaigns.map((campaign) => {
        const progress = campaign.targetAmount
            ? Math.min((campaign.collectedAmount / campaign.targetAmount) * 100, 100)
            : 0;

        return `
            <article class="campaign-card" data-category="${escapeHTML(campaign.category)}">
                <div class="campaign-image">
                    <img src="${escapeHTML(campaign.image)}" alt="${escapeHTML(campaign.title)}">
                    ${campaign.verified ? '<span class="verified-badge">Verified</span>' : ''}
                </div>
                <div class="campaign-content">
                    <h3>${escapeHTML(campaign.title)}</h3>
                    <p class="campaign-description">${escapeHTML(campaign.description)}</p>
                    <p class="campaign-ngo">By: ${escapeHTML(campaign.ngoName)}</p>

                    <div class="campaign-progress">
                        <div class="progress-bar" aria-label="Campaign funding progress">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-info">
                            <span>$${campaign.collectedAmount.toLocaleString()} raised</span>
                            <span>$${campaign.targetAmount.toLocaleString()} goal</span>
                        </div>
                        <div class="progress-percentage">${progress.toFixed(1)}% funded</div>
                    </div>

                    <div class="campaign-footer">
                        <span class="days-left">${campaign.daysLeft ?? 0} days left</span>
                        <button class="btn btn-primary donate-button" data-campaign-id="${escapeHTML(campaign.id)}">Donate Now</button>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    container.querySelectorAll('.donate-button').forEach((button) => {
        button.addEventListener('click', () => donateToCampaign(button.dataset.campaignId));
    });
}

function setupFilters() {
    ['searchInput', 'categoryFilter', 'sortSelect'].forEach((id) => {
        const element = document.getElementById(id);
        if (!element) return;
        element.addEventListener('change', filterAndSortCampaigns);
        element.addEventListener('input', filterAndSortCampaigns);
    });
}

function filterAndSortCampaigns() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const sortBy = document.getElementById('sortSelect').value;

    const filtered = allCampaigns.filter((campaign) => {
        const matchesSearch = campaign.title.toLowerCase().includes(searchTerm) ||
            campaign.description.toLowerCase().includes(searchTerm) ||
            campaign.ngoName.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || campaign.category === category;
        return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'mostFunded':
                return (b.collectedAmount / b.targetAmount) - (a.collectedAmount / a.targetAmount);
            case 'endingSoon':
                return (a.daysLeft ?? Number.MAX_SAFE_INTEGER) - (b.daysLeft ?? Number.MAX_SAFE_INTEGER);
            case 'newest':
            default:
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
    });

    displayCampaigns(filtered);
}

function donateToCampaign(campaignId) {
    const user = checkAuth();
    if (!user) {
        window.location.href = `login.html?redirect=${encodeURIComponent(`donate.html?campaignId=${campaignId}`)}`;
        return;
    }
    if (getUserRole(user) !== 'donor') {
        alert('Only donor accounts can make donations.');
        return;
    }
    window.location.href = `donate.html?campaignId=${encodeURIComponent(campaignId)}`;
}
