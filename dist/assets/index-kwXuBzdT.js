(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const l of r)if(l.type==="childList")for(const c of l.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&i(c)}).observe(document,{childList:!0,subtree:!0});function a(r){const l={};return r.integrity&&(l.integrity=r.integrity),r.referrerPolicy&&(l.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?l.credentials="include":r.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function i(r){if(r.ep)return;r.ep=!0;const l=a(r);fetch(r.href,l)}})();const s={allRestaurants:[],filteredRestaurants:[],itemsPerPage:24,currentPage:1,activeFilters:{search:"",segment:"all",minRating:2,area:"all",cuisine:"all",features:[]},sortBy:"none"},e={loaderBar:document.getElementById("loader-bar"),statTotalCount:document.getElementById("stat-total-count"),statAvgRating:document.getElementById("stat-avg-rating"),statLocationsCount:document.getElementById("stat-locations-count"),searchInput:document.getElementById("search-input"),searchClearBtn:document.getElementById("search-clear-btn"),segmentSelectWrapper:document.getElementById("segment-select-wrapper"),ratingSlider:document.getElementById("rating-slider"),ratingValLabel:document.getElementById("rating-val-label"),areaSelect:document.getElementById("area-select"),cuisineSelect:document.getElementById("cuisine-select"),popularCuisineTags:document.getElementById("popular-cuisine-tags"),resetFiltersBtn:document.getElementById("reset-filters-btn"),chkVeg:document.getElementById("chk-veg"),chkDelivery:document.getElementById("chk-delivery"),chkBooking:document.getElementById("chk-booking"),chkOutdoor:document.getElementById("chk-outdoor"),chkBuffet:document.getElementById("chk-buffet"),chkWheelchair:document.getElementById("chk-wheelchair"),chkLiveMusic:document.getElementById("chk-livemusic"),chkLgbtqia:document.getElementById("chk-lgbtqia"),chkPetFriendly:document.getElementById("chk-petfriendly"),activeCountLabel:document.getElementById("active-count-label"),activeFiltersBadges:document.getElementById("active-filters-badges"),sortSelectWrapper:document.getElementById("sort-select-wrapper"),displayPanelWrapper:document.getElementById("display-panel-wrapper"),gridPanel:document.getElementById("grid-panel"),restaurantGrid:document.getElementById("restaurant-grid"),loadMoreBtn:document.getElementById("load-more-btn"),paginationArea:document.getElementById("pagination-area"),sidebarFilters:document.getElementById("sidebar-filters"),sidebarCloseBtn:document.getElementById("sidebar-close-btn"),mobileFilterTriggerBtn:document.getElementById("mobile-filter-trigger-btn"),themeToggleBtn:document.getElementById("theme-toggle-btn"),drawerOverlay:document.getElementById("drawer-overlay"),detailDrawer:document.getElementById("detail-drawer"),drawerCloseBtn:document.getElementById("drawer-close-btn"),drawerContent:document.getElementById("drawer-content"),rouletteModalOverlay:document.getElementById("roulette-modal-overlay"),rouletteOpenBtn:document.getElementById("roulette-open-btn"),rouletteCloseBtn:document.getElementById("roulette-close-btn"),rouletteSpinBtn:document.getElementById("roulette-spin-btn"),rouletteReel:document.getElementById("roulette-reel"),rouletteResultCard:document.getElementById("roulette-result-card")};let m;document.addEventListener("DOMContentLoaded",()=>{E(),I(),k()});function E(){const t=localStorage.getItem("chennai-plates-theme")||"light-theme";document.body.className=t}function b(){document.body.classList.contains("dark-theme")?(document.body.className="light-theme",localStorage.setItem("chennai-plates-theme","light-theme")):(document.body.className="dark-theme",localStorage.setItem("chennai-plates-theme","dark-theme"))}function k(){e.loaderBar.style.width="30%",fetch("/Chennai_restaurants.json").then(t=>{if(!t.ok)throw new Error(`HTTP error! Status: ${t.status}`);return e.loaderBar.style.width="60%",t.json()}).then(t=>{e.loaderBar.style.width="80%",s.allRestaurants=t.filter(n=>n.name_of_restaurant&&n.dining_rating!==void 0&&n["features/category"]).map((n,a)=>{let i=parseFloat(n.dining_rating);return isNaN(i)&&(i=3.5),n.dining_rating=i,n.id=`rest-${a}`,n});for(let n=s.allRestaurants.length-1;n>0;n--){const a=Math.floor(Math.random()*(n+1));[s.allRestaurants[n],s.allRestaurants[a]]=[s.allRestaurants[a],s.allRestaurants[n]]}w(),C(),o(),lucide.createIcons(),e.loaderBar.style.width="100%",setTimeout(()=>{e.loaderBar.classList.remove("loading"),e.loaderBar.style.height="0"},300)}).catch(t=>{console.error("Error loading Chennai Zomato JSON dataset:",t),alert("Failed to load the restaurant dataset. Please check your local connection or retry.")})}function w(){const t=s.allRestaurants.length;e.statTotalCount&&(e.statTotalCount.textContent=t.toLocaleString());const a=(s.allRestaurants.reduce((r,l)=>r+l.dining_rating,0)/t).toFixed(1);e.statAvgRating&&(e.statAvgRating.textContent=`${a} ★`);const i=new Set;s.allRestaurants.forEach(r=>{r["area/location"]&&i.add(r["area/location"].trim())}),e.statLocationsCount&&(e.statLocationsCount.textContent=i.size)}function C(){if(e.areaSelect){const a=new Set;s.allRestaurants.forEach(r=>{r["area/location"]&&a.add(r["area/location"].trim())}),Array.from(a).sort().forEach(r=>{const l=document.createElement("option");l.value=r,l.textContent=r,e.areaSelect.appendChild(l)})}const t={};s.allRestaurants.forEach(a=>{a.cuisine&&a.cuisine.split(",").map(r=>r.trim()).forEach(r=>{t[r]=(t[r]||0)+1})});const n=Object.keys(t).sort((a,i)=>t[i]-t[a]);e.cuisineSelect&&n.forEach(a=>{const i=document.createElement("option");i.value=a,i.textContent=`${a} (${t[a]})`,e.cuisineSelect.appendChild(i)})}function I(){e.searchInput.addEventListener("input",a=>{s.activeFilters.search=a.target.value.toLowerCase().trim(),s.activeFilters.search.length>0?e.searchClearBtn.classList.remove("hidden"):e.searchClearBtn.classList.add("hidden"),o()}),e.searchClearBtn.addEventListener("click",()=>{e.searchInput.value="",s.activeFilters.search="",e.searchClearBtn.classList.add("hidden"),o()}),m=v("segment-select-wrapper",a=>{s.activeFilters.segment=a,o()}),v("sort-select-wrapper",a=>{s.sortBy=a,y(),f(!0)}),document.addEventListener("click",()=>{document.querySelectorAll(".custom-select-wrapper").forEach(a=>a.classList.remove("open"))}),e.ratingSlider.addEventListener("input",a=>{const i=parseFloat(a.target.value);e.ratingValLabel.textContent=`${i.toFixed(1)} ★`,s.activeFilters.minRating=i,o()}),e.areaSelect&&e.areaSelect.addEventListener("change",a=>{s.activeFilters.area=a.target.value,o()}),e.cuisineSelect&&e.cuisineSelect.addEventListener("change",a=>{const i=a.target.value;s.activeFilters.cuisine=i,e.popularCuisineTags.querySelectorAll(".tag-pill").forEach(r=>{r.dataset.cuisine===i?r.classList.add("active"):r.classList.remove("active")}),o()}),e.popularCuisineTags.addEventListener("click",a=>{const i=a.target.closest(".tag-pill");if(!i)return;const r=i.dataset.cuisine;i.classList.contains("active")?(i.classList.remove("active"),s.activeFilters.cuisine="all",e.cuisineSelect&&(e.cuisineSelect.value="all")):(e.popularCuisineTags.querySelectorAll(".tag-pill").forEach(l=>l.classList.remove("active")),i.classList.add("active"),s.activeFilters.cuisine=r,e.cuisineSelect&&(e.cuisineSelect.value=r)),o()});const t=[e.chkVeg,e.chkDelivery,e.chkBooking,e.chkOutdoor,e.chkBuffet,e.chkWheelchair,e.chkLiveMusic,e.chkLgbtqia,e.chkPetFriendly];t.forEach(a=>{a.addEventListener("change",()=>{const i=[];t.forEach(r=>{r.checked&&i.push({elementId:r.id,label:r.parentNode.querySelector(".checkbox-label").textContent.trim(),matchKeywords:r.value.split(",").map(l=>l.trim())})}),s.activeFilters.features=i,o()})}),e.resetFiltersBtn.addEventListener("click",S),e.loadMoreBtn.addEventListener("click",R);const n=document.getElementById("mobile-hamburger-btn");n&&n.addEventListener("click",()=>{e.sidebarFilters.classList.add("open")}),e.mobileFilterTriggerBtn&&e.mobileFilterTriggerBtn.addEventListener("click",()=>{e.sidebarFilters.classList.add("open")}),e.sidebarCloseBtn.addEventListener("click",()=>{e.sidebarFilters.classList.remove("open")}),e.themeToggleBtn.addEventListener("click",b),e.drawerCloseBtn.addEventListener("click",p),e.drawerOverlay.addEventListener("click",p),e.rouletteOpenBtn.addEventListener("click",_),e.rouletteCloseBtn.addEventListener("click",h),e.rouletteSpinBtn.addEventListener("click",$),e.rouletteModalOverlay.addEventListener("click",a=>{a.target===e.rouletteModalOverlay&&h()})}function S(){e.searchInput.value="",s.activeFilters.search="",e.searchClearBtn.classList.add("hidden"),m&&m.setValue("all"),s.activeFilters.segment="all",e.ratingSlider.value=2,e.ratingValLabel.textContent="2.0 ★",s.activeFilters.minRating=2,e.areaSelect&&(e.areaSelect.value="all"),s.activeFilters.area="all",e.cuisineSelect&&(e.cuisineSelect.value="all"),s.activeFilters.cuisine="all",e.popularCuisineTags.querySelectorAll(".tag-pill").forEach(n=>n.classList.remove("active")),[e.chkVeg,e.chkDelivery,e.chkBooking,e.chkOutdoor,e.chkBuffet,e.chkWheelchair,e.chkLiveMusic,e.chkLgbtqia,e.chkPetFriendly].forEach(n=>{n.checked=!1}),s.activeFilters.features=[],o()}function o(){const t=s.activeFilters;s.filteredRestaurants=s.allRestaurants.filter(n=>{if(t.search&&!(n["area/location"]&&n["area/location"].toLowerCase().includes(t.search))||t.segment!=="all"&&(n.market_segment?n.market_segment.trim():"").toLowerCase()!==t.segment.toLowerCase()||n.dining_rating<t.minRating||t.area!=="all"&&(!n["area/location"]||n["area/location"].trim()!==t.area)||t.cuisine!=="all"&&(!n.cuisine||!n.cuisine.toLowerCase().includes(t.cuisine.toLowerCase())))return!1;if(t.features.length>0){const a=n["features/category"]?n["features/category"].toLowerCase():"",i=n.cuisine?n.cuisine.toLowerCase():"";for(const r of t.features)if(r.elementId==="chk-veg"){const l=a.includes("vegetarian only")||a.includes("serves jain food"),c=i.includes("vegetarian")||i.includes("pure veg");if(!l&&!c)return!1}else if(!r.matchKeywords.some(c=>a.includes(c.toLowerCase())))return!1}return!0}),e.activeCountLabel.textContent=`Showing ${s.filteredRestaurants.length.toLocaleString()} restaurants`,F(),y(),f(!0)}function y(){const t=s.sortBy;s.filteredRestaurants.sort((n,a)=>t==="none"?s.allRestaurants.indexOf(n)-s.allRestaurants.indexOf(a):t==="rating-desc"?a.dining_rating-n.dining_rating:t==="rating-asc"?n.dining_rating-a.dining_rating:t==="name-asc"?n.name_of_restaurant.localeCompare(a.name_of_restaurant):t==="name-desc"?a.name_of_restaurant.localeCompare(n.name_of_restaurant):0)}function F(){e.activeFiltersBadges.innerHTML="";const t=s.activeFilters,n=(a,i)=>{const r=document.createElement("div");r.className="badge-filter",r.innerHTML=`<span>${a}</span>`;const l=document.createElement("button");l.className="badge-close-btn",l.style.cssText="display: inline-flex; align-items: center; justify-content: center; padding: 0; margin-left: 0.25rem; border: none; background: none; color: inherit; cursor: pointer;",l.innerHTML='<i data-lucide="x" style="width: 0.8rem; height: 0.8rem;"></i>',l.addEventListener("click",i),r.appendChild(l),e.activeFiltersBadges.appendChild(r)};t.search&&n(`"${t.search}"`,()=>{e.searchInput.value="",s.activeFilters.search="",e.searchClearBtn.classList.add("hidden"),o()}),t.segment!=="all"&&n(t.segment,()=>{m&&m.setValue("all"),s.activeFilters.segment="all",o()}),t.minRating>2&&n(`★ ${t.minRating}+`,()=>{e.ratingSlider.value=2,e.ratingValLabel.textContent="2.0 ★",s.activeFilters.minRating=2,o()}),t.area!=="all"&&n(t.area,()=>{e.areaSelect&&(e.areaSelect.value="all"),s.activeFilters.area="all",o()}),t.cuisine!=="all"&&n(t.cuisine,()=>{e.cuisineSelect&&(e.cuisineSelect.value="all"),s.activeFilters.cuisine="all",e.popularCuisineTags.querySelectorAll(".tag-pill").forEach(a=>a.classList.remove("active")),o()}),t.features.forEach(a=>{n(a.label,()=>{const i=document.getElementById(a.elementId);i&&(i.checked=!1),s.activeFilters.features=s.activeFilters.features.filter(r=>r.elementId!==a.elementId),o()})}),lucide.createIcons()}function f(t=!1){t&&(s.currentPage=1,e.restaurantGrid.innerHTML="",e.gridPanel.scrollTop=0);const n=(s.currentPage-1)*s.itemsPerPage,a=n+s.itemsPerPage,i=s.filteredRestaurants.slice(n,a);if(s.filteredRestaurants.length===0){e.restaurantGrid.innerHTML=`
            <div class="grid-empty-state" style="grid-column: 1/-1; padding: 4rem 2rem; text-align: center; color: var(--text-muted);">
                <i data-lucide="frown" style="width: 3rem; height: 3rem; margin-bottom: 1rem; color: var(--border-color);"></i>
                <h3 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 700; color: var(--text-primary);">No Restaurants Found</h3>
                <p style="margin-top: 0.5rem;">Try adjusting your filters, resetting the sliders, or searching something else.</p>
                <button class="btn btn-outline" style="margin-top: 1.5rem;" onclick="document.getElementById('reset-filters-btn').click()">Reset All Filters</button>
            </div>
        `,e.paginationArea.style.display="none",lucide.createIcons();return}i.forEach(r=>{const l=x(r);e.restaurantGrid.appendChild(l)}),a>=s.filteredRestaurants.length?e.paginationArea.style.display="none":e.paginationArea.style.display="flex",lucide.createIcons()}function x(t){const n=document.createElement("article");n.className="restaurant-card",n.dataset.id=t.id;let a="🍲";const i=t.market_segment?t.market_segment.trim().toLowerCase():"";i.includes("cafe")?a="☕":i.includes("bar")||i.includes("pub")||i.includes("nightlife")?a="🍸":i.includes("fast food")?a="🍔":i.includes("bakery")||i.includes("dessert")?a="🍰":i.includes("hotel")&&(a="🏨");let r="rating-good";t.dining_rating>=4?r="rating-excellent":t.dining_rating<3&&(r="rating-poor");const l=t.cuisine?t.cuisine.split(",").slice(0,3).map(d=>`<span class="cuisine-tag">${d.trim()}</span>`).join(""):'<span class="cuisine-tag">Multi-cuisine</span>';let c="";return t.top_dishes&&(c=`
            <div class="card-dishes-row">
                <div class="dishes-label">Top Dishes</div>
                <div class="dishes-teaser">${t.top_dishes.split(",").slice(0,3).map(g=>g.trim()).join(", ")}</div>
            </div>
        `),n.innerHTML=`
        <div class="card-body-wrapper">
            <div class="card-header-row">
                <div class="card-category-icon" title="${t.market_segment}">${a}</div>
                <div class="card-rating-badge ${r}">
                    <span>${t.dining_rating.toFixed(1)}</span>
                    <i data-lucide="star" style="width: 0.8rem; height: 0.8rem; fill: currentColor;"></i>
                </div>
            </div>
            
            <div class="card-body" style="margin-top: 0.5rem;">
                <div class="card-market-segment">${t.market_segment||"Restaurant"}</div>
                <div class="card-title">
                    <h3>${t.name_of_restaurant}</h3>
                </div>
                
                <div class="card-cuisines-row">
                    ${l}
                </div>

                <div class="card-location-row" style="margin-top: 0.4rem;">
                    <i data-lucide="map-pin"></i>
                    <span>${t["area/location"]||"Chennai"}</span>
                </div>

                ${c}
            </div>
        </div>

        <div class="card-action-row">
            <span>
                <span>Explore Details</span>
                <i data-lucide="chevron-right"></i>
            </span>
        </div>
    `,n.addEventListener("click",()=>L(t)),n}function R(){s.currentPage++,f(!1)}function L(t){e.drawerOverlay.classList.add("open"),e.detailDrawer.classList.add("open");const n=parseFloat(t.latitude),a=parseFloat(t.longitude);let i=t["features/category"]?t["features/category"].split(",").map(u=>`
            <div class="checklist-item">
                <i data-lucide="check-circle-2"></i>
                <span>${u.trim()}</span>
            </div>
          `).join(""):"",r=t.cuisine?t.cuisine.split(",").map(u=>`<span class="cuisine-tag">${u.trim()}</span>`).join(""):'<span class="cuisine-tag">Multi-cuisine</span>',l="";t.top_dishes?l=t.top_dishes.split(",").map(u=>`
            <div class="dish-card">
                <span>${u.trim()}</span>
            </div>
        `).join(""):l=`
            <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 0.8rem; font-style: italic; padding: 1rem 0;">
                No explicit dish ratings recorded. View Zomato reviews for suggestions.
            </div>
        `;const c=`https://www.google.com/maps/dir/?api=1&destination=${n},${a}`,d=Math.round(t.dining_rating);let g="";for(let u=1;u<=5;u++)u<=d?g+="★":g+="☆";e.drawerContent.innerHTML=`
        <div class="drawer-header">
            <div class="drawer-meta-row">
                <span class="drawer-dining-type">${t.market_segment||"Restaurant"}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">ID: ${t.id}</span>
            </div>
            
            <h2 class="drawer-restaurant-name" id="drawer-restaurant-name">${t.name_of_restaurant}</h2>
            
            <div class="drawer-rating-block">
                <span class="drawer-rating-number">${t.dining_rating.toFixed(1)}</span>
                <div class="drawer-rating-stars">
                    <div class="stars-row">${g}</div>
                    <span class="stars-label">Zomato Dining Rating</span>
                </div>
            </div>
        </div>

        <div class="drawer-section">
            <h4><i data-lucide="utensils-cross"></i> Cuisine Categories</h4>
            <div class="drawer-cuisines-list">
                ${r}
            </div>
        </div>

        <div class="drawer-section">
            <h4><i data-lucide="award"></i> Highly Recommended Dishes</h4>
            <div class="dishes-grid">
                ${l}
            </div>
        </div>

        <div class="drawer-section">
            <h4><i data-lucide="info"></i> Highlights & Amenities</h4>
            <div class="drawer-checklist">
                ${i||'<div style="color: var(--text-muted);">Standard seating only.</div>'}
            </div>
        </div>

        <div class="drawer-section">
            <h4><i data-lucide="navigation"></i> Locate & Directions</h4>
            <div class="drawer-address-card">
                <div class="address-text">${t.address||"Address information not provided."}</div>
                <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary); margin-top: 0.4rem; display:flex; align-items:center; gap:0.25rem;">
                    <i data-lucide="compass" style="width: 0.9rem; height: 0.9rem; color: var(--accent);"></i>
                    <span>Area: ${t["area/location"]||"Chennai"}</span>
                </div>
            </div>
        </div>

        <div class="drawer-cta-block">
            <a href="${c}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
                <i data-lucide="map"></i> Navigate on Google Maps
            </a>
            <a href="${t.zomato_url}" target="_blank" rel="noopener noreferrer" class="btn btn-zomato">
                <i data-lucide="external-link"></i> Book / Order on Zomato
            </a>
        </div>
    `,lucide.createIcons()}function p(){e.drawerOverlay.classList.remove("open"),e.detailDrawer.classList.remove("open")}function _(){e.rouletteResultCard.classList.add("hidden"),e.rouletteReel.style.transform="translateY(0)",e.rouletteReel.innerHTML='<div class="reel-item">Spin to Taste!</div>',e.rouletteSpinBtn.disabled=!1,e.rouletteSpinBtn.innerHTML='<i data-lucide="dices"></i> Spin the Wheel!',e.rouletteModalOverlay.classList.add("open"),lucide.createIcons()}function h(){e.rouletteModalOverlay.classList.remove("open")}function $(){const t=s.filteredRestaurants.filter(l=>l.dining_rating>=4);if(t.length===0){alert("We couldn't find highly rated restaurants matching your exact filters (Rating >= 4.0). Please clear some filter rules and try again!");return}e.rouletteSpinBtn.disabled=!0,e.rouletteSpinBtn.textContent="Spicing things up...",e.rouletteResultCard.classList.add("hidden");const n=t[Math.floor(Math.random()*t.length)],a=15,i=[];for(let l=0;l<a;l++){const c=t[Math.floor(Math.random()*t.length)];i.push(c.name_of_restaurant)}i.push(n.name_of_restaurant),e.rouletteReel.innerHTML=i.map(l=>`<div class="reel-item">${l}</div>`).join("");const r=-750;e.rouletteReel.style.transition="transform 3.5s cubic-bezier(0.1, 0.8, 0.1, 1)",e.rouletteReel.style.transform=`translateY(${r}px)`,setTimeout(()=>{e.rouletteSpinBtn.innerHTML='<i data-lucide="dices"></i> Spin Again!',e.rouletteSpinBtn.disabled=!1,e.rouletteResultCard.innerHTML=`
            <div class="result-header">
                <div class="result-title">
                    <span style="font-size: 0.7rem; color: var(--accent); font-weight: 700; text-transform: uppercase;">✨ We Picked a Winner!</span>
                    <h3>${n.name_of_restaurant}</h3>
                    <div class="result-cuisine">${n.cuisine?n.cuisine.split(",").slice(0,2).join(", "):"Restaurant"} • ${n["area/location"]}</div>
                </div>
                <div class="card-rating-badge rating-excellent">
                    <span>${n.dining_rating.toFixed(1)}</span>
                    <i data-lucide="star" style="width: 0.75rem; height: 0.75rem; fill: currentColor;"></i>
                </div>
            </div>
            
            ${n.top_dishes?`
                <div style="font-size: 0.8rem; font-style: italic; color: var(--text-secondary); margin-top: 0.25rem;">
                    💡 Top Dishes: ${n.top_dishes.split(",").slice(0,3).map(l=>l.trim()).join(", ")}
                </div>
            `:""}

            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                <button class="btn btn-primary" id="roulette-view-drawer-btn" style="flex:1; padding: 0.5rem; font-size: 0.8rem;">
                    <i data-lucide="eye"></i> Explore Details
                </button>
                <a href="${n.zomato_url}" target="_blank" rel="noopener noreferrer" class="btn btn-zomato" style="padding: 0.5rem; font-size: 0.8rem; display: inline-flex; align-items:center; justify-content:center; gap: 0.25rem;">
                    <i data-lucide="external-link"></i> Zomato
                </a>
            </div>
        `,e.rouletteResultCard.classList.remove("hidden"),lucide.createIcons(),document.getElementById("roulette-view-drawer-btn").addEventListener("click",()=>{h(),L(n)})},3600)}function v(t,n){const a=document.getElementById(t);if(!a)return{setValue:()=>{},getValue:()=>""};const i=a.querySelector(".custom-select-trigger"),r=a.querySelector(".custom-select-value");a.querySelector(".custom-options-container");const l=a.querySelectorAll(".custom-option");return i.addEventListener("click",c=>{c.stopPropagation(),document.querySelectorAll(".custom-select-wrapper").forEach(d=>{d!==a&&d.classList.remove("open")}),a.classList.toggle("open")}),l.forEach(c=>{c.addEventListener("click",d=>{d.stopPropagation(),l.forEach(B=>B.classList.remove("selected")),c.classList.add("selected");const g=c.dataset.value,u=c.textContent;r.textContent=u,a.classList.remove("open"),n(g)})}),{setValue:c=>{l.forEach(d=>{d.dataset.value===c?(d.classList.add("selected"),r.textContent=d.textContent):d.classList.remove("selected")})},getValue:()=>{const c=a.querySelector(".custom-option.selected");return c?c.dataset.value:""}}}
