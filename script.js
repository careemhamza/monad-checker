// Simple EVM address validator (0x + 40 hex chars)
function isEvmAddress(addr) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr.trim());
}

let allowlist = null;

async function loadAllowlist() {
  if (allowlist) return allowlist;
  const res = await fetch('wallets.txt', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load allowlist');
  const text = await res.text();

  // normalize + drop duplicates
  const set = new Set(
    text.split(/\r?\n/).map(l => l.trim()).filter(l => /^0x[a-fA-F0-9]{40}$/.test(l))
      .map(l => l.toLowerCase())
  );
  allowlist = set;
  return allowlist;
}

function show(el, cls, msg) {
  el.className = `result ${cls}`;
  el.textContent = msg;
  el.style.display = 'block';
}

document.getElementById('checkBtn').addEventListener('click', async () => {
  const input = document.getElementById('addressInput');
  const result = document.getElementById('result');
  const addr = (input.value || '').trim();

  if (!isEvmAddress(addr)) {
    show(result, 'bad', 'Invalid address. Please enter a checksummed or lowercased EVM address (0x...).');
    return;
  }

  try {
    const list = await loadAllowlist();
    const hit = list.has(addr.toLowerCase());
    if (hit) {
      show(result, 'ok', '✅ Eligible! Your address is on the allowlist.');
    } else {
      show(result, 'bad', '❌ Not eligible. Your address was not found.');
    }
  } catch (e) {
    show(result, 'bad', 'Could not load allowlist. Please try again.');
  }
});
