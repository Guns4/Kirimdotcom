// ============================================================================
// CekKirim Sidebar - Shipping Cost Calculator
// ============================================================================

const checkBtn = document.getElementById('checkBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const resultsDiv = document.getElementById('results');

// Event listener for check button
checkBtn.addEventListener('click', handleCheckShipping);

// Allow Enter key to trigger check
document.getElementById('destination').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleCheckShipping();
    }
});

/**
 * Main function to check shipping costs
 */
async function handleCheckShipping() {
    const origin = document.getElementById('origin').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const weight = parseInt(document.getElementById('weight').value);

    // Validation
    if (!destination) {
        showError('Mohon isi kota tujuan');
        return;
    }

    if (!weight || weight < 1) {
        showError('Berat minimal 1 gram');
        return;
    }

    // Show loading state
    setLoading(true);

    try {
        // Call actual API (mock for now)
        const results = await fetchShippingCosts(origin, destination, weight);
        displayResults(results);
    } catch (error) {
        showError('Gagal mengecek ongkir. Silakan coba lagi.');
        console.error('Error:', error);
    } finally {
        setLoading(false);
    }
}

/**
 * Fetch shipping costs from API
 * TODO: Replace with actual CekKirim API endpoint
 */
async function fetchShippingCosts(origin, destination, weight) {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mock data - replace with actual API call
            const mockData = [
                {
                    code: 'JNE',
                    service: 'REG',
                    description: 'Layanan Reguler',
                    price: calculatePrice('jne', weight),
                    etd: '2-3 Hari'
                },
                {
                    code: 'J&T',
                    service: 'EZ',
                    description: 'Ekonomis',
                    price: calculatePrice('jnt', weight),
                    etd: '2-4 Hari'
                },
                {
                    code: 'SiCepat',
                    service: 'REG',
                    description: 'Regular',
                    price: calculatePrice('sicepat', weight),
                    etd: '1-2 Hari'
                },
                {
                    code: 'AnterAja',
                    service: 'Reguler',
                    description: 'Layanan Reguler',
                    price: calculatePrice('anteraja', weight),
                    etd: '2-3 Hari'
                }
            ];

            resolve(mockData);
        }, 800);
    });
}

/**
 * Simple price calculation (mock)
 */
function calculatePrice(courier, weight) {
    const basePrice = {
        'jne': 10000,
        'jnt': 9000,
        'sicepat': 11000,
        'anteraja': 8500
    };

    const pricePerKg = basePrice[courier] || 10000;
    return Math.ceil((weight / 1000) * pricePerKg);
}

/**
 * Display results in UI
 */
function displayResults(data) {
    if (!data || data.length === 0) {
        resultsDiv.innerHTML = '<div class="placeholder">Tidak ada hasil ditemukan</div>';
        return;
    }

    let html = '';
    data.forEach((item, index) => {
        const textToCopy = `Ongkir ${item.code} ${item.service}: Rp ${item.price.toLocaleString('id-ID')} (${item.etd})`;

        html += `
            <div class="result-item">
                <div class="courier-info">
                    <div class="courier">${item.code} - ${item.service}</div>
                    <div class="service">${item.description}</div>
                    <div class="etd">📅 ${item.etd}</div>
                </div>
                <div class="price-info">
                    <div class="price">Rp ${item.price.toLocaleString('id-ID')}</div>
                    <button class="copy-btn" data-text="${textToCopy}" data-index="${index}">
                        📋 Copy
                    </button>
                </div>
            </div>
        `;
    });

    resultsDiv.innerHTML = html;

    // Add event listeners to copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', handleCopy);
    });
}

/**
 * Handle copy to clipboard
 */
function handleCopy(e) {
    const btn = e.currentTarget;
    const text = btn.dataset.text;

    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = '✅ Copied!';
        btn.classList.add('copied');

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        btn.innerHTML = '❌ Error';
    });

    // Optional: Send message to content script to auto-paste to WA
    // window.parent.postMessage({ type: 'CEKKIRIM_COPY_TO_CHAT', text }, '*');
}

/**
 * Show error message
 */
function showError(message) {
    resultsDiv.innerHTML = `
        <div style="text-align:center; color:#dc2626; padding:20px;">
            ⚠️ ${message}
        </div>
    `;
}

/**
 * Set loading state
 */
function setLoading(isLoading) {
    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        checkBtn.disabled = true;
        resultsDiv.innerHTML = '<div class="placeholder" style="margin-top:20px">⏳ Mengecek harga...</div>';
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        checkBtn.disabled = false;
    }
}

// Initialize
console.log('CekKirim Sidebar loaded');
