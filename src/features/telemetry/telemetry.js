/* ==========================================================
   AIRL Nepal – Live IoT Soil Telemetry Simulation Widget
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const farmLocation = document.getElementById('farmLocation');
  const moistureEl = document.getElementById('telemetryMoisture');
  const tempEl = document.getElementById('telemetryTemp');
  const nitrogenEl = document.getElementById('telemetryNitrogen');
  const phEl = document.getElementById('telemetryPh');
  const advisoryEl = document.getElementById('telemetryAdvisory');
  const alertContainer = document.getElementById('telemetryAlertContainer');

  if (!farmLocation || !moistureEl || !tempEl || !nitrogenEl || !phEl) return;

  // Station baseline profiles
  const profiles = {
    pokhara: {
      name: "Pokhara Rice Paddy Station",
      moisture: 28.4,
      temp: 24.2,
      nitrogen: 154,
      ph: 6.3,
      advisories: [
        "Optimal conditions. Soil moisture is within the target range for rice paddy maturation. Automated irrigation gates locked.",
        "Mild elevation in soil temperature. Micro-climate humidity level is hovering around 82%. Classifying as optimal.",
        "Stable macronutrient absorption observed. Leaf color indexing suggests robust chlorophyll activity."
      ]
    },
    kaski: {
      name: "Kaski Potato Farm Station",
      moisture: 21.8,
      temp: 18.9,
      nitrogen: 137,
      ph: 5.7,
      advisories: [
        "Warning: Nitrogen macronutrients slightly below the 140 mg/kg threshold. We recommend applying bio-enriched organic manure.",
        "Soil moisture is at a low margin (21%). Root systems show stable transpiration. System observing closely.",
        "Acidic pH trend detected (5.7). Perfect for early-stage tuber formation. No neutralizing limestone required."
      ]
    },
    mustang: {
      name: "Mustang Apple Orchard Station",
      moisture: 16.2,
      temp: 13.5,
      nitrogen: 118,
      ph: 6.8,
      advisories: [
        "Action Required: Soil moisture is critically dry (16.2%). Activating Mustang automated micro-drip emitters for 15 minutes.",
        "Cool alpine climate tracking correctly (13.5°C). Excellent chilling hours logged for high-quality apple yield.",
        "Macronutrient indices stable. Deep root structures mapping high potassium ratio. Classifying as healthy."
      ]
    }
  };

  let currentStation = 'pokhara';
  let activeProfile = { ...profiles.pokhara };

  // Dynamic visual highlighting helper to denote live changes
  const applyChangeHighlight = (el) => {
    el.style.transition = 'none';
    el.style.color = 'var(--clr-accent)';
    el.style.textShadow = '0 0 10px var(--clr-accent)';
    setTimeout(() => {
      el.style.transition = 'color 0.8s ease, text-shadow 0.8s ease';
      el.style.color = 'var(--clr-primary-dark)';
      el.style.textShadow = 'none';
    }, 400);
  };

  // Main UI updater
  const updateTelemetryUI = (animate = true) => {
    moistureEl.textContent = `${activeProfile.moisture.toFixed(1)}%`;
    tempEl.textContent = `${activeProfile.temp.toFixed(1)}°C`;
    nitrogenEl.textContent = `${activeProfile.nitrogen} mg/kg`;
    phEl.textContent = activeProfile.ph.toFixed(2);

    // Apply color highlights to elements
    if (animate) {
      applyChangeHighlight(moistureEl);
      applyChangeHighlight(tempEl);
      applyChangeHighlight(nitrogenEl);
      applyChangeHighlight(phEl);
    }

    // Determine target range status indicators
    updateStatusAdvisories();
  };

  // Render smart advisory text
  const updateStatusAdvisories = () => {
    let text = "";
    
    // Choose advisory text based on parameters
    if (currentStation === 'pokhara') {
      if (activeProfile.moisture < 28.0) {
        text = "AIRL AI Advisory: Soil moisture slightly dipped. Preparing secondary automated canal release.";
      } else {
        text = `AIRL AI Advisory: ${profiles.pokhara.advisories[0]}`;
      }
    } else if (currentStation === 'kaski') {
      if (activeProfile.nitrogen < 135) {
        text = "AIRL AI Advisory: CRITICAL – Soil nitrogen levels are dropping rapidly. Organic nitrogen fertilizers highly recommended immediately.";
      } else {
        text = `AIRL AI Advisory: ${profiles.kaski.advisories[0]}`;
      }
    } else if (currentStation === 'mustang') {
      if (activeProfile.moisture < 16.0) {
        text = "AIRL AI Advisory: URGENT – Alpine farm drought alert! Automated micro-drip active. Re-watering in progress.";
      } else {
        text = `AIRL AI Advisory: ${profiles.mustang.advisories[0]}`;
      }
    }

    advisoryEl.textContent = text;
  };

  // Selection change listener
  farmLocation.addEventListener('change', (e) => {
    currentStation = e.target.value;
    activeProfile = { ...profiles[currentStation] };
    updateTelemetryUI(true);

    // Subtle fade in and out container effect on switch
    const card = document.querySelector('.telemetry-card');
    if (card) {
      card.style.opacity = '0.7';
      setTimeout(() => { card.style.opacity = '1'; }, 150);
    }
  });

  // Natural fluctuation generator (ticks every 3 seconds to represent active live nodes)
  setInterval(() => {
    const original = profiles[currentStation];
    
    // Fluctuate soil moisture slightly (max +/- 0.4%)
    const mDelta = (Math.random() - 0.5) * 0.4;
    activeProfile.moisture = Math.max(original.moisture - 2, Math.min(original.moisture + 2, activeProfile.moisture + mDelta));

    // Fluctuate temperature slightly (max +/- 0.2°C)
    const tDelta = (Math.random() - 0.5) * 0.3;
    activeProfile.temp = Math.max(original.temp - 1.5, Math.min(original.temp + 1.5, activeProfile.temp + tDelta));

    // Fluctuate nitrogen slightly (max +/- 1 mg/kg)
    const nDelta = Math.random() > 0.5 ? 1 : -1;
    activeProfile.nitrogen = Math.max(original.nitrogen - 8, Math.min(original.nitrogen + 8, activeProfile.nitrogen + nDelta));

    // Fluctuate pH slightly (max +/- 0.05)
    const pDelta = (Math.random() - 0.5) * 0.06;
    activeProfile.ph = Math.max(original.ph - 0.25, Math.min(original.ph + 0.25, activeProfile.ph + pDelta));

    updateTelemetryUI(true);
  }, 3000);

  // Initialize UI immediately
  updateTelemetryUI(false);
});
