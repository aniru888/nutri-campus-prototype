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

// Embedded menu data
const menuData = {
    'Monday': {
        breakfast: [
            { name: 'Hot preparation: Poha', nutrition: { calories: 150, protein: 3, carbs: 30, fat: 2 } },
            { name: 'Side Dish: Sev, Onion, tomato, lemon', nutrition: { calories: 50, protein: 1, carbs: 10, fat: 0 } },
            { name: 'Condiments: Chana Tari', nutrition: { calories: 100, protein: 4, carbs: 15, fat: 3 } },
            { name: 'Egg item: Boiled Egg', nutrition: { calories: 70, protein: 6, carbs: 0, fat: 5 } },
            { name: 'Bread item: Bread, Butter & Jam', nutrition: { calories: 230, protein: 3, carbs: 28, fat: 12 } },
            { name: 'Fruit: Banana', nutrition: { calories: 60, protein: 1, carbs: 15, fat: 0 } },
            { name: 'Milk Preparation: Tea & Coffee', nutrition: { calories: 50, protein: 1, carbs: 8, fat: 1 } },
            { name: 'Plain Milk: Hot & Cold Milk', nutrition: { calories: 120, protein: 8, carbs: 12, fat: 5 } },
            { name: 'Corn flakes: Cornflakes', nutrition: { calories: 100, protein: 2, carbs: 22, fat: 0 } },
            { name: 'Bournvita: Bournvita', nutrition: { calories: 80, protein: 2, carbs: 15, fat: 1 } }
        ],
        lunch: [
            { name: 'Salad: CORN SALAD', nutrition: { calories: 50, protein: 2, carbs: 10, fat: 0 } },
            { name: 'Papad: APPALAM', nutrition: { calories: 30, protein: 1, carbs: 5, fat: 1 } },
            { name: 'Curd item: BOONDI RAITA', nutrition: { calories: 100, protein: 3, carbs: 5, fat: 7 } },
            { name: 'Dry veg: Lauki Kofta', nutrition: { calories: 200, protein: 5, carbs: 15, fat: 12 } },
            { name: 'Gravy veg: SEV TOMATO', nutrition: { calories: 200, protein: 5, carbs: 15, fat: 12 } },
            { name: 'Indian bread: Plain/Butter Roti', nutrition: { calories: 100, protein: 3, carbs: 20, fat: 1 } },
            { name: 'Rice: Plain Rice', nutrition: { calories: 200, protein: 4, carbs: 45, fat: 0 } },
            { name: 'Rice 2: VEG BRIYANI', nutrition: { calories: 300, protein: 8, carbs: 50, fat: 8 } },
            { name: 'Dal preparation: MOONG DAL', nutrition: { calories: 150, protein: 8, carbs: 25, fat: 2 } },
            { name: 'Fruit: Grapes', nutrition: { calories: 60, protein: 1, carbs: 15, fat: 0 } }
        ],
        dinner: [
            { name: 'Salad: ONOIN TOMATO SALAD', nutrition: { calories: 50, protein: 2, carbs: 10, fat: 0 } },
            { name: 'Papad: FRYUMS', nutrition: { calories: 30, protein: 1, carbs: 5, fat: 1 } },
            { name: 'Soup: PLAIN CURD', nutrition: { calories: 100, protein: 3, carbs: 5, fat: 7 } },
            { name: 'Dry veg: Egg curry', nutrition: { calories: 200, protein: 15, carbs: 5, fat: 12 } },
            { name: 'Gravy veg: CHILLI PANEER', nutrition: { calories: 250, protein: 15, carbs: 5, fat: 18 } },
            { name: 'Indian bread: Plain/Butter Roti', nutrition: { calories: 100, protein: 3, carbs: 20, fat: 1 } },
            { name: 'Rice: Plain Rice', nutrition: { calories: 200, protein: 4, carbs: 45, fat: 0 } },
            { name: 'Rice 2: SCHEZWAN RICE', nutrition: { calories: 300, protein: 8, carbs: 50, fat: 8 } },
            { name: 'Dal preparation: DAL FRY', nutrition: { calories: 150, protein: 8, carbs: 25, fat: 2 } },
            { name: 'Sweet Preparation: Jalebi', nutrition: { calories: 150, protein: 2, carbs: 25, fat: 5 } }
        ]
    },
    // Add data for other days following the same pattern
    'Tuesday': {
        breakfast: [
            { name: 'Hot preparation: Idli medu vada', nutrition: { calories: 200, protein: 8, carbs: 30, fat: 5 } },
            { name: 'Side Dish: Sambhar', nutrition: { calories: 100, protein: 4, carbs: 15, fat: 2 } },
            { name: 'Condiments: coconut chutney', nutrition: { calories: 50, protein: 1, carbs: 5, fat: 4 } },
            { name: 'Egg item: Boiled Egg', nutrition: { calories: 70, protein: 6, carbs: 0, fat: 5 } },
            { name: 'Bread item: Atta Bread Butter & Jam', nutrition: { calories: 230, protein: 3, carbs: 28, fat: 12 } },
            { name: 'Fruit: Cheeku', nutrition: { calories: 60, protein: 1, carbs: 15, fat: 0 } },
            { name: 'Milk Preparation: Tea & Coffee', nutrition: { calories: 50, protein: 1, carbs: 8, fat: 1 } },
            { name: 'Plain Milk: Hot & Cold Milk', nutrition: { calories: 120, protein: 8, carbs: 12, fat: 5 } },
            { name: 'Corn flakes: Cornflakes', nutrition: { calories: 100, protein: 2, carbs: 22, fat: 0 } },
            { name: 'Bournvita: Bournvita', nutrition: { calories: 80, protein: 2, carbs: 15, fat: 1 } }
        ],
        lunch: [
            { name: 'Salad: ONION, TOMATO', nutrition: { calories: 50, protein: 2, carbs: 10, fat: 0 } },
            { name: 'Papad: FRYUMS', nutrition: { calories: 30, protein: 1, carbs: 5, fat: 1 } },
            { name: 'Curd item: LASSI', nutrition: { calories: 150, protein: 5, carbs: 20, fat: 5 } },
            { name: 'Dry veg: JEERA ALOO', nutrition: { calories: 200, protein: 5, carbs: 15, fat: 12 } },
            { name: 'Gravy veg: CHOLLE', nutrition: { calories: 200, protein: 8, carbs: 25, fat: 8 } },
            { name: 'Indian bread: Bhature', nutrition: { calories: 200, protein: 5, carbs: 30, fat: 8 } },
            { name: 'Rice: Plain Rice', nutrition: { calories: 200, protein: 4, carbs: 45, fat: 0 } },
            { name: 'Rice 2: Pulao', nutrition: { calories: 300, protein: 8, carbs: 50, fat: 8 } },
            { name: 'Dal preparation: DAL FRY', nutrition: { calories: 150, protein: 8, carbs: 25, fat: 2 } },
            { name: 'Fruit: Banana', nutrition: { calories: 60, protein: 1, carbs: 15, fat: 0 } }
        ],
        dinner: [
            { name: 'Salad: Green salad', nutrition: { calories: 50, protein: 2, carbs: 10, fat: 0 } },
            { name: 'Papad: APPALAM', nutrition: { calories: 30, protein: 1, carbs: 5, fat: 1 } },
            { name: 'Soup: Butter milk', nutrition: { calories: 100, protein: 3, carbs: 5, fat: 7 } },
            { name: 'Dry veg: SCHEZWAN PASTA', nutrition: { calories: 200, protein: 7, carbs: 35, fat: 4 } },
            { name: 'Gravy veg: VEG JAIPURI', nutrition: { calories: 200, protein: 5, carbs: 15, fat: 12 } },
            { name: 'Indian bread: Plain/Butter Roti', nutrition: { calories: 100, protein: 3, carbs: 20, fat: 1 } },
            { name: 'Rice: Plain Rice', nutrition: { calories: 200, protein: 4, carbs: 45, fat: 0 } },
            { name: 'Rice 2: Fried Rice', nutrition: { calories: 300, protein: 8, carbs: 50, fat: 8 } },
            { name: 'Dal preparation: PANCHARATAN DAL', nutrition: { calories: 150, protein: 8, carbs: 25, fat: 2 } },
            { name: 'Sweet Preparation: FRUIT CUSTARD', nutrition: { calories: 150, protein: 2, carbs: 25, fat: 5 } }
        ]
    }
    // Add more days as needed
};

// Function to get today's menu
function getTodaysMenu() {
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[today.getDay()];
    
    return menuData[currentDay] || {
        breakfast: [],
        lunch: [],
        dinner: []
    };
}

// Function to load menu
function loadMenu() {
    const menuContent = document.querySelector('.menu-content');
    if (!menuContent) return;

    try {
        const menuData = getTodaysMenu();
        const today = new Date();
        const dateStr = today.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        let html = `<div class="date-display">Menu for ${dateStr}</div>`;

        if (Object.keys(menuData).every(meal => menuData[meal].length === 0)) {
            html += `<p class="no-menu-message">No menu available for today. Please check back later.</p>`;
        } else {
            for (const meal in menuData) {
                if (menuData[meal].length > 0) {
                    html += `<div class="meal-section">
                        <h4>${meal.charAt(0).toUpperCase() + meal.slice(1)}</h4>
                        <ul>`;
                    
                    menuData[meal].forEach(item => {
                        html += `<li>
                            <span class="item-name">${item.name}</span>
                            <div class="nutrition-info">
                                <span>${item.nutrition.calories} kcal</span>
                                <span>${item.nutrition.protein}g protein</span>
                                <span>${item.nutrition.carbs}g carbs</span>
                                <span>${item.nutrition.fat}g fat</span>
                            </div>
                        </li>`;
                    });
                    
                    html += '</ul></div>';
                }
            }
        }

        menuContent.innerHTML = html;
        menuContent.classList.add('show');
    } catch (error) {
        console.error('Error loading menu:', error);
        menuContent.innerHTML = '<p class="error-message">An error occurred while loading the menu. Please try again later.</p>';
    }
}

// Function to calculate nutrition
function calculateNutrition() {
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const activity = document.getElementById('activity').value;
    const goal = document.getElementById('goal').value;

    if (!height || !weight || !age || !gender || !activity || !goal) {
        alert('Please fill in all fields');
        return;
    }

    // Calculate BMR (Mifflin-St Jeor Equation)
    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Calculate TDEE based on activity level
    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        very: 1.725
    };

    let tdee = bmr * activityMultipliers[activity];

    // Adjust TDEE based on goal
    if (goal === 'lose') {
        tdee -= 500; // 500 calorie deficit
    } else if (goal === 'gain') {
        tdee += 500; // 500 calorie surplus
    }

    // Calculate macronutrients
    const proteinGrams = Math.round(weight * 2.2); // 1g per pound
    const proteinCalories = proteinGrams * 4;
    const remainingCalories = tdee - proteinCalories;
    const carbGrams = Math.round((remainingCalories * 0.5) / 4); // 50% carbs
    const fatGrams = Math.round((remainingCalories * 0.5) / 9); // 50% fat

    // Update nutrient summary
    const summaryList = document.querySelector('#nutrient-summary ul');
    if (summaryList) {
        summaryList.querySelector('li:nth-child(1) span').textContent = `${Math.round(tdee)} kcal`;
        summaryList.querySelector('li:nth-child(2) span').textContent = `${proteinGrams}g`;
        summaryList.querySelector('li:nth-child(3) span').textContent = `${carbGrams}g`;
        summaryList.querySelector('li:nth-child(4) span').textContent = `${fatGrams}g`;
    }

    // Update water recommendation
    const waterRecommendation = Math.round(weight * 0.033 * 1000); // 33ml per kg
    document.querySelector('#water-recommendation p').textContent = `${waterRecommendation} ml`;

    // Update health insights
    const healthInsights = document.querySelector('#health-insights p');
    if (healthInsights) {
        let insights = [];
        if (goal === 'lose') {
            insights.push('Focus on protein-rich foods to maintain muscle mass while losing fat');
            insights.push('Include fiber-rich foods to stay full longer');
        } else if (goal === 'gain') {
            insights.push('Prioritize calorie-dense foods to meet your increased energy needs');
            insights.push('Ensure adequate protein intake for muscle growth');
        } else {
            insights.push('Maintain balanced meals with all macronutrients');
            insights.push('Focus on whole, unprocessed foods for optimal health');
        }
        healthInsights.innerHTML = insights.map(insight => `<li>${insight}</li>`).join('');
    }

    // Update recommendations based on current menu
    if (currentMenuData) {
        updateRecommendations({
            tdee: Math.round(tdee),
            proteinGrams: proteinGrams,
            carbGrams: carbGrams,
            fatGrams: fatGrams
        });
    }

    // Update weight projection chart
    updateWeightProjectionChart(weight, goal, tdee);
}

// Update recommendations based on current menu and nutrient goals
function updateRecommendations(nutrientGoals) {
    const recommendationOutputDiv = document.querySelector('.recommendation-content');
    if (recommendationOutputDiv && currentMenuData) {
        const proteinPerMeal = nutrientGoals.proteinGrams / 3;
        const caloriesPerMeal = nutrientGoals.tdee / 3;
        const needsPerMeal = { 
            proteinTargetPerMeal: proteinPerMeal,
            calorieTargetPerMeal: caloriesPerMeal
        };

        recommendationOutputDiv.innerHTML = `
            <div class="daily-recommendation">
                <h4>Today's Meal Plan (${getDayName(new Date().getDay())})</h4>
                <div class="meal-blocks">
                    <div class="meal-block">
                        <h5>Breakfast</h5>
                        ${generateMealRecommendation('Breakfast', currentMenuData.breakfast, needsPerMeal)}
                    </div>
                    <div class="meal-block">
                        <h5>Lunch</h5>
                        ${generateMealRecommendation('Lunch', currentMenuData.lunch, needsPerMeal)}
                    </div>
                    <div class="meal-block">
                        <h5>Dinner</h5>
                        ${generateMealRecommendation('Dinner', currentMenuData.dinner, needsPerMeal)}
                    </div>
                </div>
                <p class="disclaimer">
                    <em>Portions are calculated based on today's menu to meet your daily nutrient goals. 
                    Adjust portions based on your hunger and specific needs.</em>
                </p>
            </div>
        `;
        recommendationOutputDiv.classList.add('show');
    }
}

// Generate meal recommendations with specific portions
function generateMealRecommendation(mealType, availableItemsWithNutrition, userNeedsPerMeal) {
    if (!availableItemsWithNutrition || availableItemsWithNutrition.length === 0) {
        return `<p>No ${mealType} items available or data missing.</p>`;
    }

    const { proteinTargetPerMeal, calorieTargetPerMeal } = userNeedsPerMeal;
    let recommendation = [];
    let currentProtein = 0;
    let currentCalories = 0;

    // Filter and sort items by protein content
    let usableItems = availableItemsWithNutrition.filter(item => 
        item.nutrition && 
        !item.nutrition.error && 
        item.nutrition.protein && 
        item.nutrition.calories
    );
    
    usableItems.sort((a, b) => (b.nutrition.protein || 0) - (a.nutrition.protein || 0));

    // Calculate portions to meet targets
    for (const item of usableItems) {
        if (currentProtein < proteinTargetPerMeal * 1.2 && currentCalories < calorieTargetPerMeal * 1.2) {
            // Calculate how much of this item we need for protein
            const proteinPer100g = item.nutrition.protein;
            const caloriesPer100g = item.nutrition.calories;
            
            // Calculate portion size needed (in grams)
            let portionForProtein = ((proteinTargetPerMeal - currentProtein) / proteinPer100g) * 100;
            let portionForCalories = ((calorieTargetPerMeal - currentCalories) / caloriesPer100g) * 100;
            
            // Take the smaller portion to avoid overshooting either target
            let recommendedPortion = Math.min(portionForProtein, portionForCalories);
            
            // Round to nearest 25g for practicality
            recommendedPortion = Math.round(recommendedPortion / 25) * 25;
            
            // Minimum portion size of 50g
            if (recommendedPortion >= 50) {
                const proteinFromPortion = (recommendedPortion * proteinPer100g) / 100;
                const caloriesFromPortion = (recommendedPortion * caloriesPer100g) / 100;
                
                recommendation.push({
                    name: item.name,
                    portion: recommendedPortion,
                    protein: proteinFromPortion,
                    calories: caloriesFromPortion
                });
                
                currentProtein += proteinFromPortion;
                currentCalories += caloriesFromPortion;
            }
        }
    }

    if (recommendation.length === 0) {
        return `<p>Could not generate a specific recommendation for ${mealType}. Try choosing high-protein options if available.</p>`;
    }

    let html = `<div class="meal-recommendation">`;
    recommendation.forEach(item => {
        html += `<div class="portion-recommendation">
            <span class="food-item">${item.portion}g of ${item.name}</span>
            <span class="nutrition-values">(${item.protein.toFixed(1)}g protein / ${item.calories.toFixed(0)} kcal)</span>
        </div>`;
    });
    html += `<div class="meal-totals">
        Meal Totals: ${currentProtein.toFixed(1)}g protein / ${currentCalories.toFixed(0)} kcal
    </div>`;
    html += '</div>';

    return html;
}

// Helper function to get day name
function getDayName(dayIndex) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
}

// Form submission handler
document.getElementById('profile-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get form values
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const activity = document.getElementById('activity').value;
    const goal = document.getElementById('goal').value;

    // Calculate BMR (Mifflin-St Jeor Equation)
    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Calculate TDEE based on activity level
    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        very: 1.725
    };

    const tdee = bmr * activityMultipliers[activity];

    // Adjust TDEE based on goal
    if (goal === 'lose') {
        tdee -= 500; // 500 calorie deficit
    } else if (goal === 'gain') {
        tdee += 500; // 500 calorie surplus
    }

    // Calculate nutrient goals
    const nutrientGoals = calculateNutrientGoals(tdee, weight, goal);
    userNutrientGoals = nutrientGoals;

    // Update nutrient summary display
    const summaryList = document.querySelector('#nutrient-summary ul');
    if (summaryList) {
        summaryList.querySelector('li:nth-child(1) span').textContent = `${nutrientGoals.tdee} kcal`;
        summaryList.querySelector('li:nth-child(2) span').textContent = `${nutrientGoals.proteinGrams} g`;
        summaryList.querySelector('li:nth-child(3) span').textContent = `${nutrientGoals.carbGrams} g`;
        summaryList.querySelector('li:nth-child(4) span').textContent = `${nutrientGoals.fatGrams} g`;
    }

    // Update recommendations with current menu data
    updateRecommendations(nutrientGoals);

    // Calculate and display water recommendation
    const waterRecommendation = Math.round(weight * 0.033 * 1000); // 33ml per kg
    document.querySelector('#water-recommendation p').textContent = `${waterRecommendation} ml`;

    // Update health insights
    const healthInsights = document.querySelector('#health-insights p');
    if (healthInsights) {
        let insights = [];
        if (goal === 'lose') {
            insights.push('Focus on protein-rich foods to maintain muscle mass while losing fat');
            insights.push('Include fiber-rich foods to stay full longer');
        } else if (goal === 'gain') {
            insights.push('Prioritize calorie-dense foods to meet your increased energy needs');
            insights.push('Ensure adequate protein intake for muscle growth');
        } else {
            insights.push('Maintain balanced meals with all macronutrients');
            insights.push('Focus on whole, unprocessed foods for optimal health');
        }
        healthInsights.innerHTML = insights.map(insight => `<li>${insight}</li>`).join('');
    }

    // Update weight projection chart
    updateWeightProjectionChart(weight, goal, tdee);
});

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

    // Load the menu
    loadMenu();

    // Initialize form submission
    const form = document.getElementById('profile-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateNutrition();
        });
    }
});

// Function to update weight projection chart
function updateWeightProjectionChart(currentWeight, goal, tdee) {
    const ctx = document.getElementById('weightChart').getContext('2d');
    const weeks = 12;
    const labels = Array.from({length: weeks}, (_, i) => `Week ${i + 1}`);
    
    let projectedWeights = [currentWeight];
    for (let i = 1; i < weeks; i++) {
        let weightChange;
        if (goal === 'lose') {
            weightChange = -0.5; // 0.5kg per week
        } else if (goal === 'gain') {
            weightChange = 0.5; // 0.5kg per week
        } else {
            weightChange = 0;
        }
        projectedWeights.push(projectedWeights[i-1] + weightChange);
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Projected Weight (kg)',
                data: projectedWeights,
                borderColor: '#00796B',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: Math.min(...projectedWeights) - 2,
                    max: Math.max(...projectedWeights) + 2
                }
            }
        }
    });
}

// Calculate nutrient goals based on user inputs
function calculateNutrientGoals(tdee, weightKg, goal) {
    // Protein Goal (1.2g/kg for sedentary/maintain, 1.6g/kg for active/gain/loss)
    let proteinMultiplier = 1.2;
    if (goal === 'gain' || goal === 'lose') {
        proteinMultiplier = 1.6;
    }

    const proteinGrams = Math.round(weightKg * proteinMultiplier);
    const proteinCalories = proteinGrams * 4;

    // Macro Split (50% Carb, 50% Fat of remaining calories)
    const remainingCalories = tdee - proteinCalories;
    const carbCalories = remainingCalories * 0.50;
    const fatCalories = remainingCalories * 0.50;

    const carbGrams = Math.round(carbCalories / 4);
    const fatGrams = Math.round(fatCalories / 9);

    return {
        tdee: tdee.toFixed(0),
        proteinGrams: proteinGrams,
        carbGrams: carbGrams,
        fatGrams: fatGrams
    };
} 