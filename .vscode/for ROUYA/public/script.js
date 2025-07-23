const scrollBox = document.querySelectorAll('.main-content');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Fade in
      entry.target.classList.add('show');
    }
  });
}, {
  threshold: 0.2 // 20% visible before triggering
});

scrollBox.forEach(box => {
  observer.observe(box);
});

const switchText1 = ["News", "Blog", "Post"];
const switchText2 = ["Foods", "Sports", "Countries", "Games", "Government", "Social", "Politics", "Technology", "Science", "Entertainment", "Health", "Education", "Business", "Lifestyle", "Travel"];

function animateSwitchText(selector, texts, interval = 4000) {
  const el = document.querySelector(selector);
  let idx = 0;

  function showText() {
    el.classList.remove('hide');
    el.textContent = texts[idx];
    el.classList.add('show');
    setTimeout(() => {
      el.classList.remove('show');
      el.classList.add('hide');
      idx = (idx + 1) % texts.length;
    }, interval - 500); // leave 0.5s for transition
  }

  el.classList.add('switch-animate');
  showText();
  setInterval(showText, interval);
}

document.addEventListener('DOMContentLoaded', () => {
  animateSwitchText('.switch_text', switchText1, 4000);
  animateSwitchText('.switch_text2', switchText2, 4000);
});

// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Get references to HTML elements
    const keywordInput = document.getElementById('keywordInput');
    const searchButton = document.getElementById('searchButton');
    const dateFilter = document.getElementById('dateFilter');
    const sourceFilter = document.getElementById('sourceFilter');
    const userVerifiedCheckbox = document.getElementById('userVerified');
    const mustMatchCheckbox = document.getElementById('mustMatch');
    const searchResultsContainer = document.getElementById('searchResults');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // Function to perform the search by calling the Netlify Function
    const performSearch = async () => { // Make this function asynchronous
        const keyword = keywordInput.value.toLowerCase().trim();
        const selectedDate = dateFilter.value;
        const selectedSource = sourceFilter.value.toLowerCase().replace(' ', '_'); // Ensure format matches backend
        const selectedContentType = document.querySelector('input[name="contentType"]:checked').value;
        const isUserVerified = userVerifiedCheckbox.checked;
        const mustMatch = mustMatchCheckbox.checked;

        // Show loading indicator and clear previous results
        searchResultsContainer.innerHTML = '';
        noResultsMessage.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');

        try {
            // Make the API call to your Netlify Function
            const response = await fetch('/.netlify/functions/search', { // Path to your Netlify Function
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    keyword,
                    dateFilter: selectedDate,
                    sourceFilter: selectedSource,
                    contentType: selectedContentType,
                    isUserVerified,
                    mustMatch
                }),
            });

            // Check if the response was successful
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
            }

            // Parse the JSON response from your Netlify Function
            const results = await response.json();

            // Hide loading indicator
            loadingIndicator.classList.add('hidden');

            // Display results or no results message
            if (results.length === 0) {
                noResultsMessage.classList.remove('hidden');
                noResultsMessage.textContent = 'No results found for your search criteria.';
            } else {
                noResultsMessage.classList.add('hidden');
                results.forEach(item => {
                    const resultCard = document.createElement('div');
                    resultCard.className = 'result-card'; // Your custom class
                    resultCard.innerHTML = `
                        <h3>${item.title}</h3>
                        <p>${item.content.substring(0, 150)}...</p>
                        ${item.summary ? `<p class="result-summary">Summary: ${item.summary}</p>` : ''}
                        ${item.sentiment ? `<p class="result-sentiment">Sentiment: ${item.sentiment}</p>` : ''}
                        <div class="result-meta">
                            <span class="capitalize">${item.source.replace(/_/g, ' ')} (${item.type})</span>
                            <span>${new Date(item.date).toLocaleDateString()}</span>
                        </div>
                    `;
                    searchResultsContainer.appendChild(resultCard);
                });
            }
        } catch (error) {
            console.error('Search failed:', error);
            loadingIndicator.classList.add('hidden');
            noResultsMessage.classList.remove('hidden');
            noResultsMessage.textContent = `Error during search: ${error.message}. Please try again.`;
            searchResultsContainer.innerHTML = ''; // Clear any partial results
        }
    };

    // Event Listeners
    searchButton.addEventListener('click', performSearch);
    keywordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Initial message on page load
    noResultsMessage.classList.remove('hidden');
});