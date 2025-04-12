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
        return handleMenuData(menuData, menuContent); // Separate the data handling
    } catch (error) {
        console.error('Error loading menu:', error);
        handleMenuError(error, menuContent);
        return null;
    }
}

// Separate function to handle menu data
function handleMenuData(menuData, menuContent) {
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
        const recommendationDiv = document.getElementById('recommendation-content');
        if(recommendationDiv) recommendationDiv.innerHTML = '<p>Cannot generate recommendations without menu data.</p>';
        return null;
    }

    displayMenu(menuData, menuContent);
    return menuData;
}

// Separate function to handle menu display
function displayMenu(menuData, menuContent) {
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
}

// Function to handle menu loading errors
function handleMenuError(error, menuContent) {
    console.error('Error loading menu:', error);
    menuContent.innerHTML = `
        <div class="error-message">
            An error occurred while loading the menu: ${error.message}
            <small>Please try again later or contact support if the problem persists.</small>
        </div>
    `;
    menuContent.classList.add('show');
    const recommendationDiv = document.querySelector('.recommendation-content');
    if(recommendationDiv) {
        recommendationDiv.innerHTML = '<p>Cannot generate recommendations due to menu loading error.</p>';
    }
    fetchedMenuData = null;
}

// --- Recommendation Logic ---
function displayRecommendations(menu, goals) {
    const recommendationDiv = document.querySelector('.recommendation-content');
    if (!recommendationDiv) {
        console.error('Recommendation content div not found');
        return;
    }
    
    if (!menu || !goals) {
        recommendationDiv.innerHTML = '<p>Please calculate your goals and wait for the menu to load.</p>';
        return;
    }

    // Create HTML structure for recommendations
    let html = '<div class="daily-recommendation">';
    html += '<h4>Your Personalized Daily Meal Plan</h4>';
    html += '<div class="meal-blocks">';

    const meals = ['breakfast', 'lunch', 'dinner'];
    let totalDailyCalories = 0;
    let totalDailyProtein = 0;
    let totalDailyCarbs = 0;
    let totalDailyFat = 0;

    // Calculate target calories per meal (slightly weighted)
    const breakfastRatio = 0.3; // 30% of daily calories
    const lunchRatio = 0.35;    // 35% of daily calories
    const dinnerRatio = 0.35;   // 35% of daily calories

    const mealRatios = {
        breakfast: breakfastRatio,
        lunch: lunchRatio,
        dinner: dinnerRatio
    };

    meals.forEach(meal => {
        const targetCalories = goals.tdee * mealRatios[meal];
        const targetProtein = goals.proteinGrams * mealRatios[meal];
        
        html += `<div class="meal-block">
            <h5>${meal.charAt(0).toUpperCase() + meal.slice(1)}</h5>
            <div class="meal-recommendation">`;

        if (!menu[meal] || menu[meal].length === 0) {
            html += '<p>No menu items available for this meal.</p>';
        } else {
            const selectedItems = selectOptimalMealItems(menu[meal], {
                targetCalories: targetCalories,
                targetProtein: targetProtein
            }, meal);

            // Display selected items with portions
            selectedItems.forEach(item => {
                const portion = item.portion || 1;
                html += `<div class="portion-recommendation">
                    <span class="food-item">${item.name} (${portion}x serving)</span>
                    <span class="nutrition-values">
                        ${Math.round(item.nutrition.calories * portion)} kcal, 
                        ${Math.round(item.nutrition.protein * portion)}g protein, 
                        ${Math.round(item.nutrition.carbs * portion)}g carbs, 
                        ${Math.round(item.nutrition.fat * portion)}g fat
                    </span>
                </div>`;

                totalDailyCalories += item.nutrition.calories * portion;
                totalDailyProtein += item.nutrition.protein * portion;
                totalDailyCarbs += item.nutrition.carbs * portion;
                totalDailyFat += item.nutrition.fat * portion;
            });

            // Add meal subtotal
            const mealTotal = selectedItems.reduce((acc, item) => {
                return {
                    calories: acc.calories + (item.nutrition.calories * (item.portion || 1)),
                    protein: acc.protein + (item.nutrition.protein * (item.portion || 1))
                };
            }, { calories: 0, protein: 0 });

            html += `<div class="meal-totals">
                Meal Total: ${Math.round(mealTotal.calories)} kcal, 
                ${Math.round(mealTotal.protein)}g protein
            </div>`;
        }

        html += '</div></div>';
    });

    // Add daily totals and comparison with goals
    html += `<div class="daily-totals">
        <h5>Daily Nutrition Totals</h5>
        <ul>
            <li>Calories: ${Math.round(totalDailyCalories)} / ${goals.tdee} kcal 
                (${Math.round((totalDailyCalories/goals.tdee) * 100)}% of goal)</li>
            <li>Protein: ${Math.round(totalDailyProtein)} / ${goals.proteinGrams}g 
                (${Math.round((totalDailyProtein/goals.proteinGrams) * 100)}% of goal)</li>
            <li>Carbs: ${Math.round(totalDailyCarbs)} / ${goals.carbGrams}g 
                (${Math.round((totalDailyCarbs/goals.carbGrams) * 100)}% of goal)</li>
            <li>Fat: ${Math.round(totalDailyFat)} / ${goals.fatGrams}g 
                (${Math.round((totalDailyFat/goals.fatGrams) * 100)}% of goal)</li>
        </ul>
    </div>`;

    html += '</div></div>';
    recommendationDiv.innerHTML = html;
    recommendationDiv.classList.add('show');
}

// Helper function to select optimal meal items
function selectOptimalMealItems(availableItems, targets, meal) {
    let selectedItems = [];
    let currentCalories = 0;
    let currentProtein = 0;
    let hasStapleFood = false;

    // Function to check if an item is a staple food (rice or Indian bread)
    const isStapleFood = (item) => {
        const name = item.name.toLowerCase();
        return name.includes('rice') || name.includes('roti') || name.includes('naan') || name.includes('paratha') || name.includes('chapati');
    };

    // For lunch and dinner, first ensure we have a staple food
    if ((meal === 'lunch' || meal === 'dinner') && !hasStapleFood) {
        const stapleItems = availableItems.filter(isStapleFood);
        if (stapleItems.length > 0) {
            const staple = stapleItems[0];
            selectedItems.push({ ...staple, portion: 1 });
            currentCalories += staple.nutrition.calories;
            currentProtein += staple.nutrition.protein;
            hasStapleFood = true;
        }
    }

    // Sort remaining items by protein-to-calorie ratio for better nutrition
    const remainingItems = availableItems.filter(item => 
        (meal === 'breakfast') || !isStapleFood(item) || !selectedItems.some(selected => selected.name === item.name)
    ).sort((a, b) => {
        const ratioA = (a.nutrition?.protein || 0) / (a.nutrition?.calories || 1);
        const ratioB = (b.nutrition?.protein || 0) / (b.nutrition?.calories || 1);
        return ratioB - ratioA;
    });

    // Add remaining items based on nutritional targets
    for (const item of remainingItems) {
        if (!item.nutrition) continue;
        
        // Calculate optimal portion size
        let portion = 1;
        if (currentCalories < targets.targetCalories) {
            portion = Math.min(
                Math.ceil((targets.targetCalories - currentCalories) / item.nutrition.calories),
                3 // Maximum portion size
            );
            portion = Math.max(portion, 1); // Minimum portion size
        }

        // Check if adding this item (with portion) would exceed targets too much
        const newCalories = currentCalories + (item.nutrition.calories * portion);
        if (newCalories <= targets.targetCalories * 1.1) { // Allow 10% overflow
            selectedItems.push({...item, portion: portion});
            currentCalories = newCalories;
            currentProtein += item.nutrition.protein * portion;
        }

        // Stop if we've reached our targets
        if (currentCalories >= targets.targetCalories && currentProtein >= targets.targetProtein) {
            break;
        }
    }

    return selectedItems;
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
    const tdeeForm = document.getElementById('profile-form'); // Changed from 'tdee-form' to match HTML
    if (tdeeForm) {
        tdeeForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent form submission at the very beginning
            console.log("Form submission prevented");
            
            try {
                const ageInput = document.getElementById('age');
                const genderInput = document.getElementById('gender');
                const heightInput = document.getElementById('height');
                const weightInput = document.getElementById('weight');
                const activityLevelInput = document.getElementById('activity'); // Changed from 'activity-level' to match HTML
                const goalInput = document.getElementById('goal');

                // Validate all inputs exist before accessing .value
                if (!ageInput || !genderInput || !heightInput || !weightInput || !activityLevelInput || !goalInput) {
                    console.error('One or more form input elements not found!');
                    alert('Form elements missing. Please reload the page or check the HTML.');
                    return;
                }

                const age = parseInt(ageInput.value);
                const gender = genderInput.value;
                const height = parseInt(heightInput.value);
                const weight = parseInt(weightInput.value);
                
                // Map activity levels to multipliers
                const activityMultipliers = {
                    'sedentary': 1.2,
                    'light': 1.375,
                    'moderate': 1.55,
                    'very': 1.725
                };
                const activityLevel = activityMultipliers[activityLevelInput.value] || 1.2;
                const goal = goalInput.value;

                // Check for valid parsed numbers and selections
                if (isNaN(age) || !gender || isNaN(height) || isNaN(weight) || !activityLevel || !goal) {
                    alert('Please fill in all fields with valid values.');
                    console.warn('Form validation failed: Invalid input values', { age, gender, height, weight, activityLevel, goal });
                    return;
                }

                // Calculate BMR (Harris-Benedict Equation)
                let bmr;
                if (gender === 'male') {
                    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
                } else { // female
                    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
                }

                // Calculate TDEE
                let userTdee = bmr * activityLevel;

                // Adjust TDEE based on goal
                let maintenanceTdee = userTdee; // Store original before adjustment
                if (goal === 'lose') {
                    userTdee -= 500; // Calorie deficit for weight loss
                } else if (goal === 'gain') {
                    userTdee += 300; // Calorie surplus for weight gain
                }
                userTdee = Math.max(1200, userTdee); // Ensure TDEE doesn't go unreasonably low

                // Calculate Macronutrient Goals
                userNutrientGoals = calculateNutrientGoals(userTdee, weight, goal);

                // Display TDEE Results
                const resultsDiv = document.getElementById('nutrient-summary'); 
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
                } else {
                    console.error("Nutrient summary display area not found.");
                }

                // Display Water Recommendation 
                const waterDiv = document.getElementById('water-recommendation');
                if (waterDiv) {
                    const waterLitres = (weight * 0.033).toFixed(1); 
                    waterDiv.innerHTML = `<h3><i class="fas fa-tint"></i> Daily Water Intake</h3>
                                          <p>Aim for approximately <strong>${waterLitres} litres</strong> per day.</p>`;
                }

                 // Display Basic Health Insights
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
                displayWeightProjection(goal, weight, userTdee, maintenanceTdee); // Pass maintenance TDEE

                // Clear any existing recommendations first
                const recommendationContentDiv = document.querySelector('.recommendation-content');
                if (recommendationContentDiv) {
                    recommendationContentDiv.innerHTML = '<p>Calculating recommendations...</p>';
                }

                // If we don't have menu data yet, reload it
                if (!fetchedMenuData) {
                    await loadMenu();
                }

                // Now display recommendations with the menu data
                if (fetchedMenuData) {
                    console.log("Displaying recommendations with menu data");
                    displayRecommendations(fetchedMenuData, userNutrientGoals);
                } else {
                    console.log("No menu data available");
                    if (recommendationContentDiv) {
                        recommendationContentDiv.innerHTML = '<p>Unable to load menu data for recommendations.</p>';
                    }
                }

                console.log("Form processing complete."); // Debug log

            } catch (error) { // Add catch block
                 console.error("Error during form submission processing:", error);
                 alert("An error occurred while calculating results. Please check the console for details.");
            }

        });
    }

    // Placeholder for Chart.js integration
    function displayWeightProjection(goal, currentWeight, targetTdee, maintenanceTdee) {
        const ctx = document.getElementById('weightChart')?.getContext('2d');
        if (!ctx) return;

        const weeks = 30;
        const labels = Array.from({length: weeks + 1}, (_, i) => `Week ${i}`);
        const weightData = [currentWeight];

        let weeklyCalorieDiff = 0;
        if (goal === 'lose') {
            weeklyCalorieDiff = (targetTdee - maintenanceTdee) * 7; 
        } else if (goal === 'gain') {
            weeklyCalorieDiff = (targetTdee - maintenanceTdee) * 7; 
        }
        
        const kgChangePerWeek = weeklyCalorieDiff / 7700; 

        for (let i = 1; i <= weeks; i++) {
            let projectedWeight = weightData[i-1] + kgChangePerWeek;
            projectedWeight += (Math.random() - 0.5) * 0.1; 
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
                            text: 'Time (30 Week Projection)'
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