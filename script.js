// Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        targetSection.scrollIntoView({ behavior: 'smooth' });
    });
});

// CTA button click handler
const ctaButton = document.querySelector('.cta-button');
ctaButton.addEventListener('click', () => {
    const nutritionTool = document.querySelector('#nutrition-tool');
    nutritionTool.scrollIntoView({ behavior: 'smooth' });
});

// Add animation to feature cards when they come into view
const featureCards = document.querySelectorAll('.feature-card');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

featureCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
});

// Global variables
let currentMenuData = null;
let userNutrientGoals = null;

// Global variable to store fetched menu data
let fetchedMenuData = null;

// Google Apps Script Web App URL
const menuApiUrl = 'https://script.google.com/macros/s/AKfycbx4TU1Bx26mBZHoCQU34VTeG7iM02xXQ0532bjb3-QORDrZ9FQ1zwP9ieznGCAiqr8-/exec';

// Function to load menu asynchronously
async function loadMenu() {
    const menuContent = document.querySelector('.menu-content');
    if (!menuContent) {
        console.error("Menu content display area not found.");
        return;
    }
    menuContent.innerHTML = '<p>Loading menu...</p>'; // Show loading indicator

    try {
        const response = await fetch(menuApiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch menu: ${response.status} ${response.statusText}`);
        }

        const menuData = await response.json();

        if (menuData.error) {
            throw new Error(`Error from menu API: ${menuData.message || menuData.error}`);
        }

        // Store fetched data globally
        fetchedMenuData = menuData;

        // Check if recommendations should be displayed now
        if (userNutrientGoals) {
            displayRecommendations(fetchedMenuData, userNutrientGoals);
        }

        if (!menuData.breakfast?.length && !menuData.lunch?.length && !menuData.dinner?.length) {
            menuContent.innerHTML = `<p class="no-menu-message">No menu items found for today in the sheet. ${menuData.info || ''}</p>`;
            menuContent.classList.add('show');
            console.log("No menu items returned from API for today.", menuData);
            // Also clear recommendations if no menu
            const recommendationDiv = document.getElementById('recommendation-content');
            if(recommendationDiv) recommendationDiv.innerHTML = '<p>Cannot generate recommendations without menu data.</p>';
            return;
        }

        const today = new Date();
        const dateStr = today.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        let html = `<div class="date-display">Menu for ${dateStr}</div>`;

        const meals = ['breakfast', 'lunch', 'dinner'];
        meals.forEach(meal => {
            if (menuData[meal] && menuData[meal].length > 0) {
                html += `<div class="meal-section">
                    <h4>${meal.charAt(0).toUpperCase() + meal.slice(1)}</h4>
                    <ul>`;
                
                menuData[meal].forEach(item => {
                    const nutrition = item.nutrition || { calories: 'N/A', protein: 'N/A', carbs: 'N/A', fat: 'N/A' };
                    html += `<li>
                        <span class="item-name">${item.name || 'Unnamed Item'}</span>
                        <div class="nutrition-info">
                            <span>${nutrition.calories} kcal</span>
                            <span>${nutrition.protein}g protein</span>
                            <span>${nutrition.carbs}g carbs</span>
                            <span>${nutrition.fat}g fat</span>
                        </div>
                    </li>`;
                });
                
                html += '</ul></div>';
            }
        });
        
        menuContent.innerHTML = html;
        menuContent.classList.add('show');

    } catch (error) {
        console.error('Error loading menu:', error);
        menuContent.innerHTML = `<p class="error-message">An error occurred while loading the menu: ${error.message}. Please try again later.</p>`;
        menuContent.classList.add('show');
        fetchedMenuData = null; // Reset on error
        // Also clear recommendations on error
        const recommendationDiv = document.getElementById('recommendation-content');
        if(recommendationDiv) recommendationDiv.innerHTML = '<p>Cannot generate recommendations due to menu loading error.</p>';
    }
}

// --- Recommendation Logic ---
function displayRecommendations(menu, goals) {
    const recommendationDiv = document.getElementById('recommendation-content');
    if (!recommendationDiv) return;
    if (!menu || !goals) {
        recommendationDiv.innerHTML = '<p>Please calculate your goals and wait for the menu to load.</p>';
        return;
    }

    let html = '<p>Based on your goals and today\'s menu:</p>';
    const meals = ['breakfast', 'lunch', 'dinner'];
    let totalRecommendedCalories = 0;
    let totalRecommendedProtein = 0;
    let totalRecommendedCarbs = 0;
    let totalRecommendedFat = 0;

    // Calculate per-meal targets (simple division)
    const targetCaloriesPerMeal = goals.tdee / 3;
    const targetProteinPerMeal = goals.proteinGrams / 3;
    // Keep Carb/Fat targets simpler for this heuristic
    // const targetCarbsPerMeal = goals.carbGrams / 3;
    // const targetFatPerMeal = goals.fatGrams / 3;

    meals.forEach(meal => {
        html += `<div class="meal-recommendation">
                    <h5>${meal.charAt(0).toUpperCase() + meal.slice(1)} Recommendation</h5>`;
        
        const availableItems = menu[meal] ? [...menu[meal]] : []; // Get items for this meal
        if (!availableItems.length) {
            html += '<p>No items available for this meal today.</p></div>';
            return; // Skip to next meal
        }

        let recommendedItems = [];
        let currentCalories = 0;
        let currentProtein = 0;
        let currentCarbs = 0;
        let currentFat = 0;

        // Simple Greedy Approach: Add items until calorie target is approached
        // Sort by protein density might be better, but let's start simple.
        availableItems.sort(() => Math.random() - 0.5); // Randomize slightly to vary results

        for (const item of availableItems) {
            const itemCalories = parseFloat(item.nutrition?.calories) || 0;
            const itemProtein = parseFloat(item.nutrition?.protein) || 0;
            const itemCarbs = parseFloat(item.nutrition?.carbs) || 0;
            const itemFat = parseFloat(item.nutrition?.fat) || 0;

            // Check if adding the item keeps calories within a reasonable range of the target
            if (itemCalories > 0 && (currentCalories + itemCalories <= targetCaloriesPerMeal * 1.25)) { // Allow up to 25% overshoot
                recommendedItems.push(item);
                currentCalories += itemCalories;
                currentProtein += itemProtein;
                currentCarbs += itemCarbs;
                currentFat += itemFat;

                 // Optional: Stop if protein target is met? Or just fill calories?
                 // Let's stick to filling calories for now.
            }

            // Break if we are already reasonably close or over the calorie target
            if (currentCalories >= targetCaloriesPerMeal * 0.9) { 
               // break; // Can enable this later if recommendations get too large
            }
        }

        if (recommendedItems.length > 0) {
            html += '<ul>';
            recommendedItems.forEach(recItem => {
                html += `<li>${recItem.name}</li>`; // Just list the item name
            });
            html += '</ul>';
            html += `<p class="meal-nutrition-summary">Est. Nutrients: 
                        ${Math.round(currentCalories)} kcal, 
                        ${Math.round(currentProtein)}g P, 
                        ${Math.round(currentCarbs)}g C, 
                        ${Math.round(currentFat)}g F
                     </p>`;
            // Accumulate totals
            totalRecommendedCalories += currentCalories;
            totalRecommendedProtein += currentProtein;
            totalRecommendedCarbs += currentCarbs;
            totalRecommendedFat += currentFat;
        } else {
            html += '<p>Could not select suitable items for this meal based on targets.</p>';
        }

        html += '</div>'; // Close meal-recommendation
    });

     // Add overall summary
    html += `<div class="total-recommendation-summary">
                <h5>Overall Estimated Intake:</h5>
                <p>Calories: ${Math.round(totalRecommendedCalories)} / ${goals.tdee} kcal</p>
                <p>Protein: ${Math.round(totalRecommendedProtein)} / ${goals.proteinGrams} g</p>
                <p>Carbs: ${Math.round(totalRecommendedCarbs)} / ${goals.carbGrams} g</p>
                <p>Fat: ${Math.round(totalRecommendedFat)} / ${goals.fatGrams} g</p>
             </div>`;

    recommendationDiv.innerHTML = html;
}
// --- End Recommendation Logic ---

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tsParticles
    if (window.tsParticles) {
        tsParticles.load("particles-js", {
            fpsLimit: 60,
            interactivity: {
                events: {
                    onHover: {
                        enable: true,
                        mode: "repulse",
                    },
                    onClick: {
                        enable: true,
                        mode: "push",
                    },
                    resize: true,
                },
                modes: {
                    repulse: {
                        distance: 100,
                        duration: 0.4,
                    },
                    push: {
                        quantity: 4,
                    },
                },
            },
            particles: {
                color: {
                    value: "#546E7A"
                },
                links: {
                    color: "#78909C",
                    distance: 150,
                    enable: true,
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    direction: "none",
                    enable: true,
                    outModes: {
                        default: "bounce"
                    },
                    random: false,
                    speed: 1,
                    straight: false
                },
                number: {
                    density: {
                        enable: true,
                        area: 800
                    },
                    value: 80
                },
                opacity: {
                    value: 0.5
                },
                shape: {
                    type: "circle"
                },
                size: {
                    value: { min: 1, max: 3 }
                }
            },
            detectRetina: true,
            background: {
                color: "transparent"
            }
        });
    }

    // Load the menu from the API
    loadMenu(); // Call the async function

    // TDEE Calculator Event Listener
    const tdeeForm = document.getElementById('tdee-form');
    if (tdeeForm) {
        tdeeForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // ... (Get form values remains the same) ...
            if (!age || !gender || !height || !weight || !activityLevel || !goal) {
                alert('Please fill in all fields.');
                return;
            }
            // ... (BMR calculation remains the same) ...
            // ... (TDEE calculation remains the same) ...
            // ... (Goal adjustment remains the same) ...

            // Calculate Macronutrient Goals
            userNutrientGoals = calculateNutrientGoals(userTdee, weight, goal);

            // Display TDEE Results
            const resultsDiv = document.getElementById('nutrient-summary'); // Target the correct div now
            if (resultsDiv) {
                 resultsDiv.innerHTML = `
                    <h3><i class="fas fa-calculator"></i> Your Estimated Daily Needs</h3>
                    <ul>
                        <li><strong>Calories (TDEE):</strong> <span>${userTdee.toFixed(0)} kcal/day</span></li>
                        <li><strong>Protein:</strong> <span>${userNutrientGoals.proteinGrams} g/day</span></li>
                        <li><strong>Carbohydrates:</strong> <span>${userNutrientGoals.carbGrams} g/day</span></li>
                        <li><strong>Fat:</strong> <span>${userNutrientGoals.fatGrams} g/day</span></li>
                    </ul>
                     <p class="disclaimer"><em>Estimates based on provided data. Individual needs may vary.</em></p>
                `;
                 // No need for resultsDiv.classList.add('show'); if it's always visible
            } else {
                console.error("Nutrient summary display area not found.");
            }

            // Display Water Recommendation (Simple Example)
            const waterDiv = document.getElementById('water-recommendation');
            if (waterDiv) {
                const waterLitres = (weight * 0.033).toFixed(1); // Simple formula (33ml per kg)
                waterDiv.innerHTML = `<h3><i class="fas fa-tint"></i> Daily Water Intake</h3>
                                      <p>Aim for approximately <strong>${waterLitres} litres</strong> per day.</p>`;
            }

             // Display Basic Health Insights (Simple Example)
            const insightsDiv = document.getElementById('health-insights');
            if (insightsDiv) {
                let insightsHtml = `<h3><i class="fas fa-heartbeat"></i> Health & Nutrient Insights</h3><ul>`;
                if (goal === 'lose') insightsHtml += `<li>Focus on consuming lean protein sources and complex carbs while maintaining a calorie deficit.</li>`;
                if (goal === 'gain') insightsHtml += `<li>Ensure sufficient calorie surplus with adequate protein for muscle growth. Consider strength training.</li>`;
                if (goal === 'maintain') insightsHtml += `<li>Balance your intake across meals to match your TDEE. Focus on nutrient-dense foods.</li>`;
                insightsHtml += `<li>Prioritize whole foods like fruits, vegetables, lean meats, and whole grains.</li>`;
                insightsHtml += `<li>Protein Goal: ${userNutrientGoals.proteinGrams}g helps with satiety (feeling full) ${goal === 'gain' ? 'and muscle repair/growth' : 'and preserving muscle mass'}.</li>`;
                 insightsHtml += `<li>Activity Level (${activityLevel}): Regular activity is crucial for overall health and achieving your goals.</li>`;
                insightsHtml += `</ul>`;
                insightsDiv.innerHTML = insightsHtml;
            }

            // Display Weight Projection Chart
            displayWeightProjection(goal, weight, userTdee, bmr * activityLevel); // Pass original TDEE for baseline

            // Try to display recommendations immediately if menu is already loaded
            const recommendationContentDiv = document.getElementById('recommendation-content');
            if (fetchedMenuData) {
                displayRecommendations(fetchedMenuData, userNutrientGoals);
            } else if(recommendationContentDiv) {
                recommendationContentDiv.innerHTML = '<p>Calculating recommendations... (Waiting for menu data)</p>'; 
            }

        });
    }

    // Placeholder for Chart.js integration
    function displayWeightProjection(goal, currentWeight, targetTdee, maintenanceTdee) {
        const ctx = document.getElementById('weightChart')?.getContext('2d');
        if (!ctx) return;

        const weeks = 12;
        const labels = Array.from({length: weeks + 1}, (_, i) => `Week ${i}`);
        const weightData = [currentWeight];

        let weeklyCalorieDiff = 0;
        if (goal === 'lose') {
            weeklyCalorieDiff = (targetTdee - maintenanceTdee) * 7; // Should be negative
        } else if (goal === 'gain') {
            weeklyCalorieDiff = (targetTdee - maintenanceTdee) * 7; // Should be positive
        }
        
        // Approx 7700 kcal per kg of fat/muscle change
        const kgChangePerWeek = weeklyCalorieDiff / 7700; 

        for (let i = 1; i <= weeks; i++) {
            let projectedWeight = weightData[i-1] + kgChangePerWeek;
            // Add slight randomness/variation to make it look less linear
            projectedWeight += (Math.random() - 0.5) * 0.1; // +/- 0.05 kg noise
            // Ensure weight doesn't go below a reasonable minimum (e.g., 30kg)
            weightData.push(Math.max(30, projectedWeight)); 
        }

        // Destroy previous chart instance if exists
        if(window.weightChartInstance) {
            window.weightChartInstance.destroy();
        }

        // Create new chart
        window.weightChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Estimated Weight Projection (kg)',
                    data: weightData,
                    borderColor: '#00796B', // Teal color
                    backgroundColor: 'rgba(0, 121, 107, 0.1)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false, // Start near the actual weight range
                        title: {
                            display: true,
                            text: 'Weight (kg)'
                        }
                    },
                    x: {
                         title: {
                            display: true,
                            text: 'Time'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                }
            }
        });
    }

});

// --- Helper Functions (Keep Calculate Nutrient Goals) ---

// Calculate nutrient goals based on user inputs
function calculateNutrientGoals(tdee, weightKg, goal) {
    // Protein Goal (1.2g/kg for sedentary/maintain, 1.6-2.2g/kg for active/gain/loss)
    let proteinMultiplier = 1.6; // Default to higher end for active users/goals
    // Example: Adjust based on goal if needed, but 1.6 is often a good baseline
    // if (goal === 'lose') proteinMultiplier = 1.8;
    // if (goal === 'gain') proteinMultiplier = 1.8;

    const proteinGrams = Math.round(weightKg * proteinMultiplier);
    const proteinCalories = proteinGrams * 4;

    // Macro Split (Example: 40% Carb, 30% Protein, 30% Fat - adjust % as needed)
    // Let's stick to simple 50/50 split of remaining for now
    const remainingCalories = tdee - proteinCalories;
    // Ensure remaining calories aren't negative
    const safeRemainingCalories = Math.max(0, remainingCalories);
    
    const carbCalories = safeRemainingCalories * 0.50; // 50% of remaining
    const fatCalories = safeRemainingCalories * 0.50;  // 50% of remaining

    const carbGrams = Math.round(carbCalories / 4);
    const fatGrams = Math.round(fatCalories / 9);

    return {
        tdee: parseFloat(tdee.toFixed(0)), // Ensure number type
        proteinGrams: proteinGrams,
        carbGrams: carbGrams,
        fatGrams: fatGrams
    };
}