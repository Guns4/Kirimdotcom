document.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('checkBtn');
  const resiInput = document.getElementById('resi');
  const courierInput = document.getElementById('courier');

  // Load last used courier if available
  chrome.storage.local.get(['lastCourier'], function(result) {
    if (result.lastCourier) {
      courierInput.value = result.lastCourier;
    }
  });

  btn.addEventListener('click', function() {
    const resi = resiInput.value.trim();
    const courier = courierInput.value;

    if (!resi) {
      alert('Mohon masukkan nomor resi.');
      return;
    }

    // Save preference
    chrome.storage.local.set({ lastCourier: courier });

    // Construct URL (Adjust based on your actual route structure)
    // Assuming format: https://cekkirim.com/cek-resi?courier=jne&resi=123
    const targetUrl = `https://cekkirim.com/cek-resi?courier=${courier}&resi=${resi}`;

    // Open in new tab
    chrome.tabs.create({ url: targetUrl });
  });
  
  // Enter key support
  resiInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        btn.click();
    }
  });
});
