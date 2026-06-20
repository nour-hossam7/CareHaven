document.addEventListener('DOMContentLoaded', function() {
    const user = requireAuth();
    if (!user) return;

    if (getUserRole(user) !== 'donor') {
        window.location.href = getDashboardPath(user);
        return;
    }

    document.getElementById('userName').textContent = user.name;
    loadDashboardData();
});

async function loadDashboardData() {
    const donationsList = document.getElementById('donationsList');
    donationsList.innerHTML = '<p class="no-data">Loading your donations...</p>';

    try {
        const response = await apiRequest('/donations/mine?limit=100');
        const userDonations = response.donations.map((donation) => ({
            campaignId: donation.campaignId?._id || donation.campaignId,
            campaignName: donation.campaignId?.title || 'Campaign',
            amount: Number(donation.amount),
            date: donation.createdAt
        }));

        const totalDonations = userDonations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0);
        document.getElementById('totalDonations').textContent = `$${totalDonations.toLocaleString()}`;

        const uniqueCampaigns = new Set(userDonations.map((donation) => donation.campaignId));
        document.getElementById('campaignsCount').textContent = uniqueCampaigns.size;

        displayRecentDonations(userDonations);
    } catch (error) {
        donationsList.innerHTML = `<p class="no-data">Unable to load donations: ${escapeHTML(error.message)}</p>`;
    }
}

function displayRecentDonations(donations) {
    const donationsList = document.getElementById('donationsList');

    if (!donations.length) {
        donationsList.innerHTML = '<p class="no-data">No donations yet. <a href="campaigns.html">Browse campaigns</a> to start making a difference!</p>';
        return;
    }

    donationsList.innerHTML = donations.slice(0, 5).map((donation) => `
        <div class="donation-item">
            <div class="donation-info">
                <h4>${escapeHTML(donation.campaignName)}</h4>
                <p>${new Date(donation.date).toLocaleDateString('en-US')}</p>
            </div>
            <div class="donation-amount">
                $${Number(donation.amount).toLocaleString()}
            </div>
        </div>
    `).join('');
}
