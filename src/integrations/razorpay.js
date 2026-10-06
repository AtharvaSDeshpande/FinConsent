// Razorpay Client Integration helper
export async function createRazorpayCheckout() {
  const token = localStorage.getItem('finconsent_token');
  const res = await fetch('/api/billing/create-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function upgradeTestPlan() {
  const token = localStorage.getItem('finconsent_token');
  const res = await fetch('/api/billing/upgrade-test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}
