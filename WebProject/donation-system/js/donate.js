let currentCampaign = null;
let selectedAmount = 0;

document.addEventListener('DOMContentLoaded', function() {
    const user = requireAuth();
    if (!user) return;

    if (getUserRole(user) !== 'donor') {
        alert('Only donor accounts can make donations.');
        window.location.href = getDashboardPath(user);
        return;
    }

    const dashboardLink = document.getElementById('dashboardLink');
    if (dashboardLink) {
        dashboardLink.href = getDashboardPath(user);
    }

    loadCampaignDetails();
    setupDonationForm();
});

async function loadCampaignDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const campaignId = urlParams.get('campaignId');

    if (!campaignId || !/^[a-f\d]{24}$/i.test(campaignId)) {
        alert('Campaign not found');
        window.location.href = 'campaigns.html';
        return;
    }

    try {
        const response = await apiRequest(`/campaigns/${campaignId}`, { skipAuth: true });
        const campaign = response.campaign;
        currentCampaign = {
            id: campaign._id,
            title: campaign.title,
            description: campaign.description,
            targetAmount: campaign.targetAmount,
            collectedAmount: campaign.collectedAmount,
            ngoName: campaign.ngoId?.name || 'Verified CareHaven Partner'
        };
    } catch (error) {
        alert(`Could not load campaign: ${error.message}`);
        window.location.href = 'campaigns.html';
        return;
    }

    displayCampaignDetails(currentCampaign);
}

function displayCampaignDetails(campaign) {
    document.getElementById('campaignTitle').textContent = campaign.title;
    document.getElementById('campaignDescription').textContent = campaign.description;
    document.getElementById('campaignNgo').textContent = campaign.ngoName;
    document.getElementById('campaignTarget').textContent = Number(campaign.targetAmount).toLocaleString();
    document.getElementById('campaignRaised').textContent = Number(campaign.collectedAmount).toLocaleString();
}

function setupDonationForm() {
    document.querySelectorAll('.amount-option').forEach((button) => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.amount-option').forEach((btn) => btn.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('customAmount').value = '';

            selectedAmount = parseInt(this.dataset.amount, 10);
            updateSummary();
        });
    });

    document.getElementById('customAmount').addEventListener('input', function() {
        document.querySelectorAll('.amount-option').forEach((btn) => btn.classList.remove('active'));
        selectedAmount = parseInt(this.value, 10) || 0;
        updateSummary();
    });

    document.getElementById('donationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        processDonation();
    });
}

function updateSummary() {
    const formattedAmount = `$${selectedAmount.toLocaleString()}`;
    document.getElementById('summaryAmount').textContent = formattedAmount;
    document.getElementById('totalAmount').textContent = formattedAmount;
}

async function processDonation() {
    if (selectedAmount <= 0) {
        alert('Please select a donation amount');
        return;
    }

    const form = document.getElementById('donationForm');
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
        await apiRequest('/donations', {
            method: 'POST',
            body: {
                campaignId: currentCampaign.id,
                amount: selectedAmount,
                message: document.getElementById('donationMessage').value,
                isAnonymous: document.getElementById('anonymousDonation').checked,
                paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value
            }
        });

        document.getElementById('successModal').style.display = 'flex';
    } catch (error) {
        alert(error.message);
    } finally {
        if (submitButton) submitButton.disabled = false;
    }
}

function goToDashboard() {
    window.location.href = 'donor-dashboard.html';
}

function viewReceipt() {
    goToDashboard();
}

window.addEventListener('click', function(event) {
    const modal = document.getElementById('successModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
