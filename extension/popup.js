document.addEventListener('DOMContentLoaded', () => {
    const checkBtn = document.getElementById('checkBtn');
    const resiInput = document.getElementById('resiInput');
    const courierSelect = document.getElementById('courierSelect');
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');

    // Load last used courier if any
    const savedCourier = localStorage.getItem('cekkirim_last_courier');
    if (savedCourier) {
        courierSelect.value = savedCourier;
    }

    checkBtn.addEventListener('click', async () => {
        const resi = resiInput.value.trim();
        const courier = courierSelect.value;

        if (!resi) {
            showError('Mohon masukkan nomor resi');
            return;
        }

        // UI Loading State
        setLoading(true);
        hideError();
        resultDiv.style.display = 'none';

        try {
            // Determine API URL (Localhost for dev, Production for real)
            // Ideally this is configurable, but for now we try Production
            const API_URL = 'http://localhost:3000/api/v1/track';
            // NOTE: Change to https://www.cekkirim.com/api/v1/track for production release

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ resi, courier })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Gagal melacak paket');
            }

            // Success
            showResult(data.data);
            localStorage.setItem('cekkirim_last_courier', courier);

        } catch (err) {
            showError(err.message);
        } finally {
            setLoading(false);
        }
    });

    function showResult(data) {
        resultDiv.style.display = 'block';

        const statusEl = document.getElementById('resStatusBadge');
        const dateEl = document.getElementById('resDate');
        const descEl = document.getElementById('resDesc');
        const locEl = document.getElementById('resLocText');

        statusEl.textContent = data.currentStatus;

        // Color logic
        statusEl.className = 'status-badge ' +
            (data.currentStatus.includes('DELIVERED') || data.currentStatus.includes('TERKIRIM')
                ? 'status-delivered'
                : 'status-process');

        dateEl.textContent = data.statusDate;
        descEl.textContent = data.history[0]?.desc || '-';
        locEl.textContent = data.history[0]?.location || 'Lokasi tidak diketahui';
    }

    function showError(msg) {
        errorDiv.textContent = msg;
        errorDiv.style.display = 'block';
    }

    function hideError() {
        errorDiv.style.display = 'none';
    }

    function setLoading(isLoading) {
        if (isLoading) {
            checkBtn.textContent = 'Memuat...';
            checkBtn.classList.add('loading');
            checkBtn.disabled = true;
        } else {
            checkBtn.textContent = 'Lacak Paket';
            checkBtn.classList.remove('loading');
            checkBtn.disabled = false;
        }
    }
});
