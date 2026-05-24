/* ==========================================================
   AIRL Nepal – Edge AI Crop Leaf Diagnostic Simulator
   Fixes applied:
   - fadeUp keyframe injected via JS (no CSS dependency)
   - scanBeam hidden via inline style at init (not CSS-dependent)
   - isScanning + runBtn always reset in finally block
   ========================================================== */

// Inject the fadeUp keyframe once, so the report reveal always works
// regardless of whether style.css defines it.
(function injectFadeUpKeyframe() {
  if (document.getElementById('airl-fadeup-style')) return;
  const style = document.createElement('style');
  style.id = 'airl-fadeup-style';
  style.textContent = `
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();

document.addEventListener('DOMContentLoaded', () => {
  const leafBtns       = document.querySelectorAll('.sample-leaf-btn');
  const leafImg        = document.getElementById('scanLeafImage');
  const scanBeam       = document.getElementById('scanBeam');
  const progressOverlay = document.getElementById('scanProgressOverlay');
  const statusText     = document.getElementById('scanStatusText');
  const progressVal    = document.getElementById('scanProgressValue');
  const runBtn         = document.getElementById('runDiagnosticsBtn');
  const placeholder    = document.getElementById('diagnosticPlaceholder');
  const report         = document.getElementById('diagnosticReport');

  const diseaseName        = document.getElementById('diseaseName');
  const diseaseConfidence  = document.getElementById('diseaseConfidence');
  const diseaseDescription = document.getElementById('diseaseDescription');
  const diseaseTreatment   = document.getElementById('diseaseTreatment');

  if (!leafImg || !runBtn || !placeholder || !report) return;

  // Guarantee scan beam is hidden at init — never depends on CSS alone
  if (scanBeam) scanBeam.style.display = 'none';

  // ── Leaf database ─────────────────────────────────────────
  const leafData = {
    'potato-blight': {
      image:       '/public/images/diagnostics/potato-blight.jpg',
      name:        'Potato Late Blight',
      confidence:  '98.6%',
      description: 'Late blight is a volatile fungal pathogen (Phytophthora infestans) affecting potato leaves in Kaski fields, characterized by dark brown/purple spots that develop white fuzzy margins in humid climates.',
      treatment:   'Prune heavily affected lower stalks immediately. Apply neem-based oil spray weekly. Avoid high overhead irrigation at dawn to keep moisture profiles dry and suppress fungal spores.',
    },
    'rice-blast': {
      image:       '/public/images/diagnostics/rice-blast.jpg',
      name:        'Rice Blast (Magnaporthe oryzae)',
      confidence:  '94.2%',
      description: 'Spindle-shaped necrotic lesions with greyish centers on leaf surfaces. Thrives in sub-tropical climates like Pokhara and is highly infectious if nitrogen levels are excessively high.',
      treatment:   'Apply Trichoderma bio-antagonist sprays. Optimize nitrogen applications (maintain soil readings within safe limits via Telemetry Dashboard). Burn or deep-bury post-harvest stubble.',
    },
    'tomato-healthy': {
      image:       '/public/images/diagnostics/tomato-healthy.jpg',
      name:        'Tomato Leaf – Healthy',
      confidence:  '99.4%',
      description: 'Excellent specimen showing fully hydrated leaf margins, uniform chlorophyll density, and zero structural lesions. Cellular respiration indexes are well within nominal targets.',
      treatment:   'Continue routine organic drip-watering. Ensure balanced composting and microclimate logging. Spot-check understory leaves bi-weekly to prevent pathogen drift.',
    },
  };

  let selectedLeaf = 'potato-blight';
  let isScanning   = false;
  let scanInterval = null;

  // ── Specimen switching ────────────────────────────────────
  leafBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isScanning) return;

      leafBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedLeaf = btn.getAttribute('data-leaf');

      if (leafData[selectedLeaf]) leafImg.src = leafData[selectedLeaf].image;

      report.classList.add('hidden');
      placeholder.classList.remove('hidden');
    });
  });

  // ── Reset UI helpers ──────────────────────────────────────
  const resetScanUI = () => {
    if (scanBeam)        scanBeam.style.display = 'none';
    if (progressOverlay) progressOverlay.classList.add('hidden');
    isScanning       = false;
    runBtn.disabled  = false;
    runBtn.style.opacity = '1';
  };

  // ── Run AI diagnostics ────────────────────────────────────
  runBtn.addEventListener('click', () => {
    if (isScanning) return;

    isScanning          = true;
    runBtn.disabled     = true;
    runBtn.style.opacity = '0.6';

    if (scanBeam)        scanBeam.style.display = 'block';
    if (progressOverlay) progressOverlay.classList.remove('hidden');

    report.classList.add('hidden');
    placeholder.classList.add('hidden');

    let progress = 0;
    const stages = [
      { threshold: 20,  text: 'Acquiring high-res crop imagery...' },
      { threshold: 45,  text: 'Isolating chlorotic leaf margins...' },
      { threshold: 75,  text: 'Querying Edge Neural Weights...' },
      { threshold: 95,  text: 'Generating diagnostic metrics...' },
      { threshold: 100, text: 'Completed!' },
    ];

    if (scanInterval) clearInterval(scanInterval);

    try {
      scanInterval = setInterval(() => {
        try {
          progress += Math.floor(Math.random() * 8) + 4;
          if (progress >= 100) progress = 100;

          if (progressVal) progressVal.textContent = `${progress}%`;

          const stage = stages.find(s => progress <= s.threshold);
          if (stage && statusText) statusText.textContent = stage.text;

          if (progress === 100) {
            clearInterval(scanInterval);
            scanInterval = null;

            setTimeout(() => {
              try {
                resetScanUI();

                const data = leafData[selectedLeaf];
                if (data) {
                  diseaseName.textContent        = data.name;
                  diseaseConfidence.textContent  = data.confidence;
                  diseaseDescription.textContent = data.description;
                  diseaseTreatment.textContent   = data.treatment;
                  if (window.lucide) window.lucide.createIcons();
                }

                report.classList.remove('hidden');
                report.style.animation = 'fadeUp 0.6s ease both';
              } catch (err) {
                console.error('Diagnostics report render error:', err);
                resetScanUI();
                placeholder.classList.remove('hidden');
              }
            }, 600);
          }
        } catch (err) {
          // Error inside interval — reset everything so the button isn't stuck
          console.error('Diagnostics scan interval error:', err);
          clearInterval(scanInterval);
          scanInterval = null;
          resetScanUI();
          placeholder.classList.remove('hidden');
        }
      }, 100);
    } catch (err) {
      console.error('Diagnostics setInterval error:', err);
      resetScanUI();
      placeholder.classList.remove('hidden');
    }
  });
});
