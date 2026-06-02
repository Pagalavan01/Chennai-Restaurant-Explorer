/* ==========================================================================
   CHENNAI PLATES - APPLICATION SCRIPT
   ========================================================================== */

// STATE MANAGEMENT
const state = {
    allRestaurants: [],      // Holds all parsed restaurant data objects
    filteredRestaurants: [],  // Current subset matching user filters
    itemsPerPage: 24,         // Pagination card chunk size
    currentPage: 1,           // Current visible page of grid
    activeFilters: {
        search: '',
        segment: 'all',
        minRating: 2.0,
        area: 'all',
        cuisine: 'all',
        features: []
    },
    sortBy: 'none'
};

// DOM ELEMENTS CACHE
const DOM = {
    loaderBar: document.getElementById('loader-bar'),
    statTotalCount: document.getElementById('stat-total-count'),
    statAvgRating: document.getElementById('stat-avg-rating'),
    statLocationsCount: document.getElementById('stat-locations-count'),
    
    // Filters Inputs
    searchInput: document.getElementById('search-input'),
    searchClearBtn: document.getElementById('search-clear-btn'),
    segmentSelectWrapper: document.getElementById('segment-select-wrapper'),
    ratingSlider: document.getElementById('rating-slider'),
    ratingValLabel: document.getElementById('rating-val-label'),
    areaSelect: document.getElementById('area-select'),
    cuisineSelect: document.getElementById('cuisine-select'),
    popularCuisineTags: document.getElementById('popular-cuisine-tags'),
    resetFiltersBtn: document.getElementById('reset-filters-btn'),
    
    // Checklist check-boxes
    chkVeg: document.getElementById('chk-veg'),
    chkDelivery: document.getElementById('chk-delivery'),
    chkBooking: document.getElementById('chk-booking'),
    chkOutdoor: document.getElementById('chk-outdoor'),
    chkBuffet: document.getElementById('chk-buffet'),
    chkWheelchair: document.getElementById('chk-wheelchair'),
    chkLiveMusic: document.getElementById('chk-livemusic'),
    chkLgbtqia: document.getElementById('chk-lgbtqia'),
    chkPetFriendly: document.getElementById('chk-petfriendly'),

    // Body Panels & Controls
    activeCountLabel: document.getElementById('active-count-label'),
    activeFiltersBadges: document.getElementById('active-filters-badges'),
    sortSelectWrapper: document.getElementById('sort-select-wrapper'),
    displayPanelWrapper: document.getElementById('display-panel-wrapper'),
    gridPanel: document.getElementById('grid-panel'),
    restaurantGrid: document.getElementById('restaurant-grid'),
    loadMoreBtn: document.getElementById('load-more-btn'),
    paginationArea: document.getElementById('pagination-area'),

    // Sidebar close/open (mobile)
    sidebarFilters: document.getElementById('sidebar-filters'),
    sidebarCloseBtn: document.getElementById('sidebar-close-btn'),
    mobileFilterTriggerBtn: document.getElementById('mobile-filter-trigger-btn'),

    // Theme Toggle
    themeToggleBtn: document.getElementById('theme-toggle-btn'),

    // Detail Drawer Elements
    drawerOverlay: document.getElementById('drawer-overlay'),
    detailDrawer: document.getElementById('detail-drawer'),
    drawerCloseBtn: document.getElementById('drawer-close-btn'),
    drawerContent: document.getElementById('drawer-content'),

    // Gourmet Roulette Elements
    rouletteModalOverlay: document.getElementById('roulette-modal-overlay'),
    rouletteOpenBtn: document.getElementById('roulette-open-btn'),
    rouletteCloseBtn: document.getElementById('roulette-close-btn'),
    rouletteSpinBtn: document.getElementById('roulette-spin-btn'),
    rouletteReel: document.getElementById('roulette-reel'),
    rouletteResultCard: document.getElementById('roulette-result-card')
};

let customSegmentSelect;
let customSortSelect;

// 1. INITIALIZATION & DATA LOADING
document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Check & Application
    initTheme();

    // 2. Setup standard listeners
    initEventListeners();

    // 3. Load Zomato Chennai Dataset
    loadDataset();
});

// Theme Selector Control
function initTheme() {
    const savedTheme = localStorage.getItem('chennai-plates-theme') || 'light-theme';
    document.body.className = savedTheme;
}

function toggleTheme() {
    if (document.body.classList.contains('dark-theme')) {
        document.body.className = 'light-theme';
        localStorage.setItem('chennai-plates-theme', 'light-theme');
    } else {
        document.body.className = 'dark-theme';
        localStorage.setItem('chennai-plates-theme', 'dark-theme');
    }
}

// 2. LOAD JSON DATA
function loadDataset() {
    DOM.loaderBar.style.width = '30%';
    
    // Path relative to root of Vite development server
    fetch('/Chennai_restaurants.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            DOM.loaderBar.style.width = '60%';
            return response.json();
        })
        .then(data => {
            DOM.loaderBar.style.width = '80%';
            
            // Filter out any broken entries with missing crucial values
            state.allRestaurants = data.filter(item => 
                item.name_of_restaurant && 
                item.dining_rating !== undefined && 
                item['features/category']
            ).map((item, idx) => {
                // Ensure rating is a proper number or fallback
                let rating = parseFloat(item.dining_rating);
                if (isNaN(rating)) rating = 3.5; // fallback
                item.dining_rating = rating;
                
                // Add an explicit local ID for easier state management
                item.id = `rest-${idx}`;
                return item;
            });
            
            // Randomize order on load
            for (let i = state.allRestaurants.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [state.allRestaurants[i], state.allRestaurants[j]] = [state.allRestaurants[j], state.allRestaurants[i]];
            }
            
            // Initial calculations
            calculateDataStats();

            // Populate drop downs and quick-select tags
            populateFilterOptions();

            // Perform initial filtering and sorting
            applyFiltersAndSort();

            // Render lucide icons
            lucide.createIcons();

            // Close loader progress bar
            DOM.loaderBar.style.width = '100%';
            setTimeout(() => {
                DOM.loaderBar.classList.remove('loading');
                DOM.loaderBar.style.height = '0';
            }, 300);
        })
        .catch(err => {
            console.error('Error loading Chennai Zomato JSON dataset:', err);
            alert('Failed to load the restaurant dataset. Please check your local connection or retry.');
        });
}

// Calculate statistical counters in Header
function calculateDataStats() {
    const total = state.allRestaurants.length;
    if (DOM.statTotalCount) DOM.statTotalCount.textContent = total.toLocaleString();

    // Average dining rating
    const sum = state.allRestaurants.reduce((acc, curr) => acc + curr.dining_rating, 0);
    const avg = (sum / total).toFixed(1);
    if (DOM.statAvgRating) DOM.statAvgRating.textContent = `${avg} ★`;

    // Unique neighborhoods count
    const locationsSet = new Set();
    state.allRestaurants.forEach(item => {
        if (item['area/location']) locationsSet.add(item['area/location'].trim());
    });
    if (DOM.statLocationsCount) DOM.statLocationsCount.textContent = locationsSet.size;
}

// Populate Area Dropdown & Cuisine options from JSON content
function populateFilterOptions() {
    // 1. Area Dropdown Populating
    if (DOM.areaSelect) {
        const areas = new Set();
        state.allRestaurants.forEach(item => {
            if (item['area/location']) {
                areas.add(item['area/location'].trim());
            }
        });
        
        const sortedAreas = Array.from(areas).sort();
        sortedAreas.forEach(area => {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = area;
            DOM.areaSelect.appendChild(option);
        });
    }

    // 2. Cuisines list populating (top 30 most frequent)
    const cuisineFrequency = {};
    state.allRestaurants.forEach(item => {
        if (item.cuisine) {
            const list = item.cuisine.split(',').map(c => c.trim());
            list.forEach(c => {
                cuisineFrequency[c] = (cuisineFrequency[c] || 0) + 1;
            });
        }
    });

    // Sort cuisines by popularity count
    const sortedCuisines = Object.keys(cuisineFrequency).sort((a, b) => cuisineFrequency[b] - cuisineFrequency[a]);
    
    // Populate select
    if (DOM.cuisineSelect) {
        sortedCuisines.forEach(cuisine => {
            const option = document.createElement('option');
            option.value = cuisine;
            option.textContent = `${cuisine} (${cuisineFrequency[cuisine]})`;
            DOM.cuisineSelect.appendChild(option);
        });
    }
}

// 3. LISTENERS & INTERACTION SYSTEM
function initEventListeners() {
    // Search input
    DOM.searchInput.addEventListener('input', (e) => {
        state.activeFilters.search = e.target.value.toLowerCase().trim();
        if (state.activeFilters.search.length > 0) {
            DOM.searchClearBtn.classList.remove('hidden');
        } else {
            DOM.searchClearBtn.classList.add('hidden');
        }
        applyFiltersAndSort();
    });

    DOM.searchClearBtn.addEventListener('click', () => {
        DOM.searchInput.value = '';
        state.activeFilters.search = '';
        DOM.searchClearBtn.classList.add('hidden');
        applyFiltersAndSort();
    });

    // Custom Select Dropdowns Initialization
    customSegmentSelect = initCustomSelect('segment-select-wrapper', (value) => {
        state.activeFilters.segment = value;
        applyFiltersAndSort();
    });

    customSortSelect = initCustomSelect('sort-select-wrapper', (value) => {
        state.sortBy = value;
        sortFilteredList();
        renderRestaurantGrid(true);
    });

    // Close custom dropdowns on click outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
    });

    // Rating slider
    DOM.ratingSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        DOM.ratingValLabel.textContent = `${val.toFixed(1)} ★`;
        state.activeFilters.minRating = val;
        applyFiltersAndSort();
    });

    // Area selector
    if (DOM.areaSelect) {
        DOM.areaSelect.addEventListener('change', (e) => {
            state.activeFilters.area = e.target.value;
            applyFiltersAndSort();
        });
    }

    // Cuisine selector
    if (DOM.cuisineSelect) {
        DOM.cuisineSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            state.activeFilters.cuisine = val;
            
            // Match active styling in quick pills if selected
            DOM.popularCuisineTags.querySelectorAll('.tag-pill').forEach(pill => {
                if (pill.dataset.cuisine === val) {
                    pill.classList.add('active');
                } else {
                    pill.classList.remove('active');
                }
            });

            applyFiltersAndSort();
        });
    }

    // Quick tag pills (popular cuisines)
    DOM.popularCuisineTags.addEventListener('click', (e) => {
        const pill = e.target.closest('.tag-pill');
        if (!pill) return;

        const cuisine = pill.dataset.cuisine;

        if (pill.classList.contains('active')) {
            // De-select
            pill.classList.remove('active');
            state.activeFilters.cuisine = 'all';
            if (DOM.cuisineSelect) DOM.cuisineSelect.value = 'all';
        } else {
            // Select new
            DOM.popularCuisineTags.querySelectorAll('.tag-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            state.activeFilters.cuisine = cuisine;
            if (DOM.cuisineSelect) DOM.cuisineSelect.value = cuisine;
        }

        applyFiltersAndSort();
    });

    // Specific features checklist checkboxes
    const checkBoxes = [DOM.chkVeg, DOM.chkDelivery, DOM.chkBooking, DOM.chkOutdoor, DOM.chkBuffet, DOM.chkWheelchair, DOM.chkLiveMusic, DOM.chkLgbtqia, DOM.chkPetFriendly];
    checkBoxes.forEach(chk => {
        chk.addEventListener('change', () => {
            const activeFeatures = [];
            checkBoxes.forEach(c => {
                if (c.checked) {
                    activeFeatures.push({
                        elementId: c.id,
                        label: c.parentNode.querySelector('.checkbox-label').textContent.trim(),
                        matchKeywords: c.value.split(',').map(s => s.trim())
                    });
                }
            });
            state.activeFilters.features = activeFeatures;
            applyFiltersAndSort();
        });
    });

    // Reset filters button
    DOM.resetFiltersBtn.addEventListener('click', resetAllFilters);

    // Pagination Load More
    DOM.loadMoreBtn.addEventListener('click', loadNextPage);

    // Mobile Sidebar controls
    const mobileHamburgerBtn = document.getElementById('mobile-hamburger-btn');
    if (mobileHamburgerBtn) {
        mobileHamburgerBtn.addEventListener('click', () => {
            DOM.sidebarFilters.classList.add('open');
        });
    }

    if (DOM.mobileFilterTriggerBtn) {
        DOM.mobileFilterTriggerBtn.addEventListener('click', () => {
            DOM.sidebarFilters.classList.add('open');
        });
    }

    DOM.sidebarCloseBtn.addEventListener('click', () => {
        DOM.sidebarFilters.classList.remove('open');
    });

    // Theme toggler
    DOM.themeToggleBtn.addEventListener('click', toggleTheme);

    // Detail Drawer slider close elements
    DOM.drawerCloseBtn.addEventListener('click', closeDetailsDrawer);
    DOM.drawerOverlay.addEventListener('click', closeDetailsDrawer);

    // Gourmet Roulette triggers
    DOM.rouletteOpenBtn.addEventListener('click', openRouletteModal);
    DOM.rouletteCloseBtn.addEventListener('click', closeRouletteModal);
    DOM.rouletteSpinBtn.addEventListener('click', spinGourmetRoulette);
    DOM.rouletteModalOverlay.addEventListener('click', (e) => {
        if (e.target === DOM.rouletteModalOverlay) closeRouletteModal();
    });
}

// Reset all values inside filters panel
function resetAllFilters() {
    DOM.searchInput.value = '';
    state.activeFilters.search = '';
    DOM.searchClearBtn.classList.add('hidden');

    if (customSegmentSelect) customSegmentSelect.setValue('all');
    state.activeFilters.segment = 'all';

    DOM.ratingSlider.value = 2.0;
    DOM.ratingValLabel.textContent = '2.0 ★';
    state.activeFilters.minRating = 2.0;

    if (DOM.areaSelect) DOM.areaSelect.value = 'all';
    state.activeFilters.area = 'all';

    if (DOM.cuisineSelect) DOM.cuisineSelect.value = 'all';
    state.activeFilters.cuisine = 'all';

    DOM.popularCuisineTags.querySelectorAll('.tag-pill').forEach(p => p.classList.remove('active'));

    const checkBoxes = [DOM.chkVeg, DOM.chkDelivery, DOM.chkBooking, DOM.chkOutdoor, DOM.chkBuffet, DOM.chkWheelchair, DOM.chkLiveMusic, DOM.chkLgbtqia, DOM.chkPetFriendly];
    checkBoxes.forEach(c => { c.checked = false; });
    state.activeFilters.features = [];

    applyFiltersAndSort();
}

// 4. CORE SEARCH & STATE FILTERING LOGIC
function applyFiltersAndSort() {
    const filters = state.activeFilters;

    state.filteredRestaurants = state.allRestaurants.filter(item => {
        // 1. Keyword search (Area / Location only)
        if (filters.search) {
            const locationMatch = item['area/location'] && item['area/location'].toLowerCase().includes(filters.search);
            if (!locationMatch) return false;
        }

        // 2. Segment filtering
        if (filters.segment !== 'all') {
            const rawSegment = item.market_segment ? item.market_segment.trim() : '';
            if (rawSegment.toLowerCase() !== filters.segment.toLowerCase()) return false;
        }

        // 3. Rating Slider
        if (item.dining_rating < filters.minRating) return false;

        // 4. Location Dropdown
        if (filters.area !== 'all') {
            if (!item['area/location'] || item['area/location'].trim() !== filters.area) return false;
        }

        // 5. Cuisine Selector
        if (filters.cuisine !== 'all') {
            if (!item.cuisine || !item.cuisine.toLowerCase().includes(filters.cuisine.toLowerCase())) return false;
        }

        // 6. Specific Features (Vegetarian, Delivery, Booking etc)
        if (filters.features.length > 0) {
            const itemCats = item['features/category'] ? item['features/category'].toLowerCase() : '';
            const itemCuisines = item.cuisine ? item.cuisine.toLowerCase() : '';

            for (const feature of filters.features) {
                // Veg check
                if (feature.elementId === 'chk-veg') {
                    // Check features category OR if cuisine explicitly states Vegetarian Only / Veg
                    const isVegCategory = itemCats.includes('vegetarian only') || itemCats.includes('serves jain food');
                    const isVegCuisine = itemCuisines.includes('vegetarian') || itemCuisines.includes('pure veg');
                    
                    if (!isVegCategory && !isVegCuisine) return false;
                } else {
                    // Standard keyword checks across category strings
                    const matchFound = feature.matchKeywords.some(keyword => itemCats.includes(keyword.toLowerCase()));
                    if (!matchFound) return false;
                }
            }
        }

        return true;
    });

    // Update statistics text count
    DOM.activeCountLabel.textContent = `Showing ${state.filteredRestaurants.length.toLocaleString()} restaurants`;

    // Render badge chips for active filters
    renderActiveFilterBadges();

    // Sort the list
    sortFilteredList();

    // Reset layout elements
    renderRestaurantGrid(true);
}

// Sort the list in memory
function sortFilteredList() {
    const sort = state.sortBy;

    state.filteredRestaurants.sort((a, b) => {
        if (sort === 'none') {
            return state.allRestaurants.indexOf(a) - state.allRestaurants.indexOf(b);
        } else if (sort === 'rating-desc') {
            return b.dining_rating - a.dining_rating;
        } else if (sort === 'rating-asc') {
            return a.dining_rating - b.dining_rating;
        } else if (sort === 'name-asc') {
            return a.name_of_restaurant.localeCompare(b.name_of_restaurant);
        } else if (sort === 'name-desc') {
            return b.name_of_restaurant.localeCompare(a.name_of_restaurant);
        }
        return 0;
    });
}

// Draw list of active badges filters
function renderActiveFilterBadges() {
    DOM.activeFiltersBadges.innerHTML = '';
    const filters = state.activeFilters;

    const createBadge = (text, onClickReset) => {
        const badge = document.createElement('div');
        badge.className = 'badge-filter';
        badge.innerHTML = `<span>${text}</span>`;
        
        // Wrap the close icon in a button wrapper that doesn't get removed/replaced by Lucide
        const closeBtn = document.createElement('button');
        closeBtn.className = 'badge-close-btn';
        closeBtn.style.cssText = 'display: inline-flex; align-items: center; justify-content: center; padding: 0; margin-left: 0.25rem; border: none; background: none; color: inherit; cursor: pointer;';
        closeBtn.innerHTML = '<i data-lucide="x" style="width: 0.8rem; height: 0.8rem;"></i>';
        
        closeBtn.addEventListener('click', onClickReset);
        badge.appendChild(closeBtn);
        DOM.activeFiltersBadges.appendChild(badge);
    };

    if (filters.search) {
        createBadge(`"${filters.search}"`, () => {
            DOM.searchInput.value = '';
            state.activeFilters.search = '';
            DOM.searchClearBtn.classList.add('hidden');
            applyFiltersAndSort();
        });
    }

    if (filters.segment !== 'all') {
        createBadge(filters.segment, () => {
            if (customSegmentSelect) customSegmentSelect.setValue('all');
            state.activeFilters.segment = 'all';
            applyFiltersAndSort();
        });
    }

    if (filters.minRating > 2.0) {
        createBadge(`★ ${filters.minRating}+`, () => {
            DOM.ratingSlider.value = 2.0;
            DOM.ratingValLabel.textContent = '2.0 ★';
            state.activeFilters.minRating = 2.0;
            applyFiltersAndSort();
        });
    }

    if (filters.area !== 'all') {
        createBadge(filters.area, () => {
            if (DOM.areaSelect) DOM.areaSelect.value = 'all';
            state.activeFilters.area = 'all';
            applyFiltersAndSort();
        });
    }

    if (filters.cuisine !== 'all') {
        createBadge(filters.cuisine, () => {
            if (DOM.cuisineSelect) DOM.cuisineSelect.value = 'all';
            state.activeFilters.cuisine = 'all';
            DOM.popularCuisineTags.querySelectorAll('.tag-pill').forEach(p => p.classList.remove('active'));
            applyFiltersAndSort();
        });
    }

    filters.features.forEach(feat => {
        createBadge(feat.label, () => {
            const chk = document.getElementById(feat.elementId);
            if (chk) chk.checked = false;
            
            state.activeFilters.features = state.activeFilters.features.filter(f => f.elementId !== feat.elementId);
            applyFiltersAndSort();
        });
    });

    lucide.createIcons();
}



// 6. RENDER THE RESTAURANT GRID CARDS
function renderRestaurantGrid(resetPagination = false) {
    if (resetPagination) {
        state.currentPage = 1;
        DOM.restaurantGrid.innerHTML = '';
        DOM.gridPanel.scrollTop = 0;
    }

    const startIdx = (state.currentPage - 1) * state.itemsPerPage;
    const endIdx = startIdx + state.itemsPerPage;
    const pageItems = state.filteredRestaurants.slice(startIdx, endIdx);

    if (state.filteredRestaurants.length === 0) {
        DOM.restaurantGrid.innerHTML = `
            <div class="grid-empty-state" style="grid-column: 1/-1; padding: 4rem 2rem; text-align: center; color: var(--text-muted);">
                <i data-lucide="frown" style="width: 3rem; height: 3rem; margin-bottom: 1rem; color: var(--border-color);"></i>
                <h3 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 700; color: var(--text-primary);">No Restaurants Found</h3>
                <p style="margin-top: 0.5rem;">Try adjusting your filters, resetting the sliders, or searching something else.</p>
                <button class="btn btn-outline" style="margin-top: 1.5rem;" onclick="document.getElementById('reset-filters-btn').click()">Reset All Filters</button>
            </div>
        `;
        DOM.paginationArea.style.display = 'none';
        lucide.createIcons();
        return;
    }

    // Append Cards
    pageItems.forEach(item => {
        const card = createRestaurantCard(item);
        DOM.restaurantGrid.appendChild(card);
    });

    // Check pagination button
    if (endIdx >= state.filteredRestaurants.length) {
        DOM.paginationArea.style.display = 'none';
    } else {
        DOM.paginationArea.style.display = 'flex';
    }

    lucide.createIcons();
}

// Generate single card elements
function createRestaurantCard(item) {
    const card = document.createElement('article');
    card.className = 'restaurant-card';
    card.dataset.id = item.id;

    // Get segment icons
    let categoryIcon = '🍲';
    const segment = item.market_segment ? item.market_segment.trim().toLowerCase() : '';
    if (segment.includes('cafe')) categoryIcon = '☕';
    else if (segment.includes('bar') || segment.includes('pub') || segment.includes('nightlife')) categoryIcon = '🍸';
    else if (segment.includes('fast food')) categoryIcon = '🍔';
    else if (segment.includes('bakery') || segment.includes('dessert')) categoryIcon = '🍰';
    else if (segment.includes('hotel')) categoryIcon = '🏨';

    // Get rating levels for colors badge
    let ratingClass = 'rating-good'; // orange: 3.0-3.9
    if (item.dining_rating >= 4.0) ratingClass = 'rating-excellent'; // green
    else if (item.dining_rating < 3.0) ratingClass = 'rating-poor'; // red

    // Formulate top 3 cuisines
    const cuisineTags = item.cuisine 
        ? item.cuisine.split(',').slice(0, 3).map(c => `<span class="cuisine-tag">${c.trim()}</span>`).join('')
        : `<span class="cuisine-tag">Multi-cuisine</span>`;

    // Dishes list summary
    let dishesMarkup = '';
    if (item.top_dishes) {
        const cleanedDishes = item.top_dishes.split(',').slice(0, 3).map(d => d.trim()).join(', ');
        dishesMarkup = `
            <div class="card-dishes-row">
                <div class="dishes-label">Top Dishes</div>
                <div class="dishes-teaser">${cleanedDishes}</div>
            </div>
        `;
    }

    card.innerHTML = `
        <div class="card-body-wrapper">
            <div class="card-header-row">
                <div class="card-category-icon" title="${item.market_segment}">${categoryIcon}</div>
                <div class="card-rating-badge ${ratingClass}">
                    <span>${item.dining_rating.toFixed(1)}</span>
                    <i data-lucide="star" style="width: 0.8rem; height: 0.8rem; fill: currentColor;"></i>
                </div>
            </div>
            
            <div class="card-body" style="margin-top: 0.5rem;">
                <div class="card-market-segment">${item.market_segment || 'Restaurant'}</div>
                <div class="card-title">
                    <h3>${item.name_of_restaurant}</h3>
                </div>
                
                <div class="card-cuisines-row">
                    ${cuisineTags}
                </div>

                <div class="card-location-row" style="margin-top: 0.4rem;">
                    <i data-lucide="map-pin"></i>
                    <span>${item['area/location'] || 'Chennai'}</span>
                </div>

                ${dishesMarkup}
            </div>
        </div>

        <div class="card-action-row">
            <span>
                <span>Explore Details</span>
                <i data-lucide="chevron-right"></i>
            </span>
        </div>
    `;

    // Trigger Slide Drawer on Click
    card.addEventListener('click', () => openDetailsDrawer(item));

    return card;
}

function loadNextPage() {
    state.currentPage++;
    renderRestaurantGrid(false);
}



// 8. SIDEBAR DETAILS DRAWER SYSTEM
function openDetailsDrawer(item) {
    DOM.drawerOverlay.classList.add('open');
    DOM.detailDrawer.classList.add('open');

    const lat = parseFloat(item.latitude);
    const lng = parseFloat(item.longitude);

    // Build categories checklist markup
    let categoriesList = item['features/category'] 
        ? item['features/category'].split(',').map(c => `
            <div class="checklist-item">
                <i data-lucide="check-circle-2"></i>
                <span>${c.trim()}</span>
            </div>
          `).join('')
        : '';

    // Cuisines lists
    let cuisinesTags = item.cuisine
        ? item.cuisine.split(',').map(c => `<span class="cuisine-tag">${c.trim()}</span>`).join('')
        : '<span class="cuisine-tag">Multi-cuisine</span>';

    // Dishes grids
    let dishesGrid = '';
    if (item.top_dishes) {
        dishesGrid = item.top_dishes.split(',').map(d => `
            <div class="dish-card">
                <span>${d.trim()}</span>
            </div>
        `).join('');
    } else {
        dishesGrid = `
            <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 0.8rem; font-style: italic; padding: 1rem 0;">
                No explicit dish ratings recorded. View Zomato reviews for suggestions.
            </div>
        `;
    }

    // Google Maps Navigation url
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    // Rating star levels
    const ratingCount = Math.round(item.dining_rating);
    let starsRow = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= ratingCount) starsRow += '★';
        else starsRow += '☆';
    }

    // Set layout content
    DOM.drawerContent.innerHTML = `
        <div class="drawer-header">
            <div class="drawer-meta-row">
                <span class="drawer-dining-type">${item.market_segment || 'Restaurant'}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">ID: ${item.id}</span>
            </div>
            
            <h2 class="drawer-restaurant-name" id="drawer-restaurant-name">${item.name_of_restaurant}</h2>
            
            <div class="drawer-rating-block">
                <span class="drawer-rating-number">${item.dining_rating.toFixed(1)}</span>
                <div class="drawer-rating-stars">
                    <div class="stars-row">${starsRow}</div>
                    <span class="stars-label">Zomato Dining Rating</span>
                </div>
            </div>
        </div>

        <div class="drawer-section">
            <h4><i data-lucide="utensils-cross"></i> Cuisine Categories</h4>
            <div class="drawer-cuisines-list">
                ${cuisinesTags}
            </div>
        </div>

        <div class="drawer-section">
            <h4><i data-lucide="award"></i> Highly Recommended Dishes</h4>
            <div class="dishes-grid">
                ${dishesGrid}
            </div>
        </div>

        <div class="drawer-section">
            <h4><i data-lucide="info"></i> Highlights & Amenities</h4>
            <div class="drawer-checklist">
                ${categoriesList || '<div style="color: var(--text-muted);">Standard seating only.</div>'}
            </div>
        </div>

        <div class="drawer-section">
            <h4><i data-lucide="navigation"></i> Locate & Directions</h4>
            <div class="drawer-address-card">
                <div class="address-text">${item.address || 'Address information not provided.'}</div>
                <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary); margin-top: 0.4rem; display:flex; align-items:center; gap:0.25rem;">
                    <i data-lucide="compass" style="width: 0.9rem; height: 0.9rem; color: var(--accent);"></i>
                    <span>Area: ${item['area/location'] || 'Chennai'}</span>
                </div>
            </div>
        </div>

        <div class="drawer-cta-block">
            <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
                <i data-lucide="map"></i> Navigate on Google Maps
            </a>
            <a href="${item.zomato_url}" target="_blank" rel="noopener noreferrer" class="btn btn-zomato">
                <i data-lucide="external-link"></i> Book / Order on Zomato
            </a>
        </div>
    `;

    lucide.createIcons();
}

function closeDetailsDrawer() {
    DOM.drawerOverlay.classList.remove('open');
    DOM.detailDrawer.classList.remove('open');
}

// 9. GOURMET ROULETTE ALGORITHM (SURPRISE SELECTOR)
function openRouletteModal() {
    // Reset roulette visual contents
    DOM.rouletteResultCard.classList.add('hidden');
    DOM.rouletteReel.style.transform = 'translateY(0)';
    DOM.rouletteReel.innerHTML = '<div class="reel-item">Spin to Taste!</div>';
    DOM.rouletteSpinBtn.disabled = false;
    DOM.rouletteSpinBtn.innerHTML = '<i data-lucide="dices"></i> Spin the Wheel!';

    DOM.rouletteModalOverlay.classList.add('open');
    lucide.createIcons();
}

function closeRouletteModal() {
    DOM.rouletteModalOverlay.classList.remove('open');
}

function spinGourmetRoulette() {
    // 1. Gather highly rated restaurants within active filters
    const pool = state.filteredRestaurants.filter(r => r.dining_rating >= 4.0);
    
    if (pool.length === 0) {
        alert("We couldn't find highly rated restaurants matching your exact filters (Rating >= 4.0). Please clear some filter rules and try again!");
        return;
    }

    DOM.rouletteSpinBtn.disabled = true;
    DOM.rouletteSpinBtn.textContent = 'Spicing things up...';
    DOM.rouletteResultCard.classList.add('hidden');

    // 2. Select a winner
    const winner = pool[Math.floor(Math.random() * pool.length)];

    // 3. Create dummy reel values for slot machine spinner visual
    const numDummySlots = 15;
    const reelContent = [];
    
    for (let i = 0; i < numDummySlots; i++) {
        // Pick a random highly rated one for slot rotation
        const randomItem = pool[Math.floor(Math.random() * pool.length)];
        reelContent.push(randomItem.name_of_restaurant);
    }
    // Set exact winner at the bottom
    reelContent.push(winner.name_of_restaurant);

    // Render slots into reel
    DOM.rouletteReel.innerHTML = reelContent.map(name => `<div class="reel-item">${name}</div>`).join('');

    // Trigger visual slide transformation
    const itemHeight = 50; // matching CSS .reel-item height
    const translateOffset = -(numDummySlots * itemHeight);

    // Apply smooth CSS transition
    DOM.rouletteReel.style.transition = 'transform 3.5s cubic-bezier(0.1, 0.8, 0.1, 1)';
    DOM.rouletteReel.style.transform = `translateY(${translateOffset}px)`;

    // 4. Resolve spin complete
    setTimeout(() => {
        // Re-enable trigger button
        DOM.rouletteSpinBtn.innerHTML = '<i data-lucide="dices"></i> Spin Again!';
        DOM.rouletteSpinBtn.disabled = false;

        // Render detailed result card below slot machine
        DOM.rouletteResultCard.innerHTML = `
            <div class="result-header">
                <div class="result-title">
                    <span style="font-size: 0.7rem; color: var(--accent); font-weight: 700; text-transform: uppercase;">✨ We Picked a Winner!</span>
                    <h3>${winner.name_of_restaurant}</h3>
                    <div class="result-cuisine">${winner.cuisine ? winner.cuisine.split(',').slice(0,2).join(', ') : 'Restaurant'} • ${winner['area/location']}</div>
                </div>
                <div class="card-rating-badge rating-excellent">
                    <span>${winner.dining_rating.toFixed(1)}</span>
                    <i data-lucide="star" style="width: 0.75rem; height: 0.75rem; fill: currentColor;"></i>
                </div>
            </div>
            
            ${winner.top_dishes ? `
                <div style="font-size: 0.8rem; font-style: italic; color: var(--text-secondary); margin-top: 0.25rem;">
                    💡 Top Dishes: ${winner.top_dishes.split(',').slice(0, 3).map(d => d.trim()).join(', ')}
                </div>
            ` : ''}

            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                <button class="btn btn-primary" id="roulette-view-drawer-btn" style="flex:1; padding: 0.5rem; font-size: 0.8rem;">
                    <i data-lucide="eye"></i> Explore Details
                </button>
                <a href="${winner.zomato_url}" target="_blank" rel="noopener noreferrer" class="btn btn-zomato" style="padding: 0.5rem; font-size: 0.8rem; display: inline-flex; align-items:center; justify-content:center; gap: 0.25rem;">
                    <i data-lucide="external-link"></i> Zomato
                </a>
            </div>
        `;

        DOM.rouletteResultCard.classList.remove('hidden');
        lucide.createIcons();

        // Bind view detailed drawer button
        document.getElementById('roulette-view-drawer-btn').addEventListener('click', () => {
            closeRouletteModal();
            openDetailsDrawer(winner);
        });

    }, 3600); // matching 3.5s transition time plus slight delay
}

// 10. CUSTOM SELECT COMPONENT HELPER
function initCustomSelect(wrapperId, onSelectChange) {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return {
        setValue: () => {},
        getValue: () => ''
    };

    const trigger = wrapper.querySelector('.custom-select-trigger');
    const valueSpan = wrapper.querySelector('.custom-select-value');
    const optionsContainer = wrapper.querySelector('.custom-options-container');
    const options = wrapper.querySelectorAll('.custom-option');

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close other custom selects
        document.querySelectorAll('.custom-select-wrapper').forEach(w => {
            if (w !== wrapper) w.classList.remove('open');
        });
        wrapper.classList.toggle('open');
    });

    options.forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            options.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            const value = opt.dataset.value;
            const text = opt.textContent;
            valueSpan.textContent = text;
            wrapper.classList.remove('open');
            onSelectChange(value);
        });
    });

    return {
        setValue: (value) => {
            options.forEach(o => {
                if (o.dataset.value === value) {
                    o.classList.add('selected');
                    valueSpan.textContent = o.textContent;
                } else {
                    o.classList.remove('selected');
                }
            });
        },
        getValue: () => {
            const selected = wrapper.querySelector('.custom-option.selected');
            return selected ? selected.dataset.value : '';
        }
    };
}
