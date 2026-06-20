document.addEventListener('DOMContentLoaded', async function() {
    let user = requireAuth();
    if (!user) return;

    if (getUserRole(user) !== 'ngo') {
        window.location.href = getDashboardPath(user);
        return;
    }

    user = await refreshCurrentUser() || user;
    showApprovalBanner(user);
    loadCampaignDetails();
});

async function loadCampaignDetails() {
    const campaignId = new URLSearchParams(window.location.search).get('campaignId');

    if (!campaignId || !/^[a-f\d]{24}$/i.test(campaignId)) {
        showMessage('Invalid campaign ID', 'error');
        return;
    }

    try {
        const response = await apiRequest(`/campaigns/${campaignId}`, { skipAuth: true });
        renderCampaign(response.campaign);
        loadReports(campaignId);
    } catch (error) {
        showMessage(`Unable to load campaign: ${error.message}`, 'error');
    }
}

function renderCampaign(campaign) {
    const raised = Number(campaign.collectedAmount || 0);
    const target = Number(campaign.targetAmount || 0);
    const progress = target ? Math.min(Math.round((raised / target) * 100), 100) : 0;

    document.getElementById('campaignTitle').textContent = campaign.title;
    document.getElementById('campaignSubtitle').textContent = campaign.category;
    document.getElementById('campaignDescription').textContent = campaign.description;
    document.getElementById('raisedAmount').textContent = `$${raised.toLocaleString()}`;
    document.getElementById('targetAmount').textContent = `$${target.toLocaleString()}`;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `${progress}% funded`;

    if (campaign.image) {
        document.getElementById('campaignImage').src = campaign.image;
    }

    document.getElementById('donorEngagement').textContent = `Status: ${campaign.status}`;
}

async function loadReports(campaignId) {
    const container = document.getElementById('reportsList');
    if (!container) return;

    container.innerHTML = '<p class="empty-state">Loading reports...</p>';

    try {
        const response = await apiRequest(`/reports/campaign/${campaignId}?limit=50`, { skipAuth: true });

        if (!response.reports.length) {
            container.innerHTML = '<p class="empty-state">No reports uploaded for this campaign yet.</p>';
            return;
        }

        container.innerHTML = response.reports.map((report) => `
            <div class="report-item">
                <div>
                    <h4>${escapeHTML(report.title)}</h4>
                    <p>${escapeHTML(report.fileName)} &middot; ${new Date(report.createdAt).toLocaleDateString()}</p>
                </div>
                <button type="button" class="btn-download" data-report-id="${escapeHTML(report._id)}">Download</button>
            </div>
        `).join('');

        container.querySelectorAll('.btn-download').forEach((button) => {
            button.addEventListener('click', () => downloadReport(button.dataset.reportId, button));
        });
    } catch (error) {
        container.innerHTML = `<p class="empty-state">Unable to load reports: ${escapeHTML(error.message)}</p>`;
    }
}

async function downloadReport(reportId, button) {
    button.disabled = true;
    try {
        const response = await fetch(`${API_BASE}/reports/${reportId}/download`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || 'Download failed');
        }

        const blob = await response.blob();
        const disposition = response.headers.get('Content-Disposition') || '';
        const match = disposition.match(/filename="(.+)"/);
        const fileName = match ? match[1] : 'report';

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        alert(error.message);
    } finally {
        button.disabled = false;
    }
}
