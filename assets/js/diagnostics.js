/* ==========================================================
   AIRL Nepal – Edge AI Crop Leaf Diagnostic Simulator
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const leafBtns = document.querySelectorAll('.sample-leaf-btn');
  const leafImg = document.getElementById('scanLeafImage');
  const scanBeam = document.getElementById('scanBeam');
  const progressOverlay = document.getElementById('scanProgressOverlay');
  const statusText = document.getElementById('scanStatusText');
  const progressVal = document.getElementById('scanProgressValue');
  const runBtn = document.getElementById('runDiagnosticsBtn');
  const placeholder = document.getElementById('diagnosticPlaceholder');
  const report = document.getElementById('diagnosticReport');
  
  const diseaseName = document.getElementById('diseaseName');
  const diseaseConfidence = document.getElementById('diseaseConfidence');
  const diseaseDescription = document.getElementById('diseaseDescription');
  const diseaseTreatment = document.getElementById('diseaseTreatment');

  if (!leafImg || !runBtn || !placeholder || !report) return;

  // Leaf database
  const leafData = {
    'potato-blight': {
      image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=400&auto=format&fit=crop',
      name: 'Potato Late Blight',
      confidence: '98.6%',
      description: 'Late blight is a volatile fungal pathogen (Phytophthora infestans) affecting potato leaves in Kaski fields, characterized by dark brown/purple spots that develop white fuzzy margins in humid climates.',
      treatment: 'Prune heavily affected lower stalks immediately. Apply neem-based oil spray weekly. Avoid high overhead irrigation at dawn to keep moisture profiles dry and suppress fungal spores.'
    },
    'rice-blast': {
      image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=400&auto=format&fit=crop',
      name: 'Rice Blast (Magnaporthe oryzae)',
      confidence: '94.2%',
      description: 'Spindle-shaped necrotic lesions with greyish centers on leaf surfaces. Thrives in sub-tropical climates like Pokhara and is highly infectious if nitrogen levels are excessively high.',
      treatment: 'Apply Trichoderma bio-antagonist sprays. Optimize nitrogen applications (maintain soil readings within safe limits via Telemetry Dashboard). Burn or deep-bury post-harvest stubble.'
    },
    'tomato-healthy': {
      image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=400&auto=format&fit=crop',
      name: 'Tomato Leaf – Healthy',
      confidence: '99.4%',
      description: 'Excellent specimen showing fully hydrated leaf margins, uniform chlorophyll density, and zero structural lesions. Cellular respiration indexes are well within nominal targets.',
      treatment: 'Continue routine organic drip-watering. Ensure balanced composting and microclimate logging. Spot-check understory leaves bi-weekly to prevent pathogen drift.'
    }
  };

  let selectedLeaf = 'potato-blight';
  let isScanning = false;
  let scanInterval = null;

  // Handle Specimen Switching
  leafBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isScanning) return; // Prevent clicking during active scan

      // Switch active class
      leafBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      selectedLeaf = btn.getAttribute('data-leaf');
      
      // Update leaf image preview
      if (leafData[selectedLeaf]) {
        leafImg.src = leafData[selectedLeaf].image;
      }

      // Reset reports and placeholder
      report.classList.add('hidden');
      placeholder.classList.remove('hidden');
    });
  });

  // Run AI Diagnostics Simulation
  runBtn.addEventListener('click', () => {
    if (isScanning) return;

    isScanning = true;
    runBtn.disabled = true;
    runBtn.style.opacity = '0.6';

    // Show Scanning Elements
    if (scanBeam) scanBeam.style.display = 'block';
    if (progressOverlay) progressOverlay.classList.remove('hidden');
    
    // Hide previous reports
    report.classList.add('hidden');
    placeholder.classList.add('hidden');

    let progress = 0;
    const stages = [
      { threshold: 20, text: 'Acquiring high-res crop imagery...' },
      { threshold: 45, text: 'Isolating chlorotic leaf margins...' },
      { threshold: 75, text: 'Querying Edge Neural Weights...' },
      { threshold: 95, text: 'Generating diagnostic metrics...' },
      { threshold: 100, text: 'Completed!' }
    ];

    if (scanInterval) clearInterval(scanInterval);

    scanInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 4;
      if (progress >= 100) progress = 100;

      // Update progress numbers
      if (progressVal) progressVal.textContent = `${progress}%`;

      // Update status stage description
      const stage = stages.find(s => progress <= s.threshold);
      if (stage && statusText) {
        statusText.textContent = stage.text;
      }

      if (progress === 100) {
        clearInterval(scanInterval);
        
        // Wrap up scanning visual states
        setTimeout(() => {
          if (scanBeam) scanBeam.style.display = 'none';
          if (progressOverlay) progressOverlay.classList.add('hidden');
          
          // Populate Report Data
          const data = leafData[selectedLeaf];
          if (data) {
            diseaseName.textContent = data.name;
            diseaseConfidence.textContent = data.confidence;
            diseaseDescription.textContent = data.description;
            diseaseTreatment.textContent = data.treatment;

            // Trigger Lucide re-creation inside the report for the leaf icon
            if (window.lucide) window.lucide.createIcons();
          }

          // Transition animations
          report.classList.remove('hidden');
          report.style.animation = 'fadeUp 0.6s ease both';

          isScanning = false;
          runBtn.disabled = false;
          runBtn.style.opacity = '1';
        }, 600);
      }
    }, 100);
  });
});
