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

document.addEventListener('DOMContentLoaded', () => {
    const keywordInput = document.getElementById('keywordInput');
    const searchButton = document.getElementById('searchButton');
    const dateFilter = document.getElementById('dateFilter');
    const sourceFilter = document.getElementById('sourceFilter');
    const userVerifiedCheckbox = document.getElementById('userVerified');
    const mustMatchCheckbox = document.getElementById('mustMatch');
    const searchResultsContainer = document.getElementById('searchResults');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // --- Mock Data (Simulated API Response) ---
    // In a real application, this data would come from your backend API calls.
    const mockData = [
        {
            id: 'post1',
            title: 'New AI features rolled out on Instagram!',
            content: 'Instagram has just announced a series of new AI-powered features for content creation and engagement...',
            source: 'instagram',
            date: '2025-07-22T10:00:00Z',
            type: 'posts',
            isUserVerified: true,
            keywords: ['AI', 'Instagram', 'features', 'content']
        },
        {
            id: 'news1',
            title: 'Khaleej Times: Dubai unveils ambitious new sustainable city project',
            content: 'Dubai continues its stride towards sustainability with the announcement of a groundbreaking new urban development...',
            source: 'khaleej_times',
            date: '2025-07-21T14:30:00Z',
            type: 'news',
            isUserVerified: false, // News articles typically aren't 'user verified' in this context
            keywords: ['Dubai', 'sustainable', 'city', 'project', 'Khaleej Times']
        },
        {
            id: 'blog1',
            title: 'The Future of Travel: How Technology is Shaping Our Journeys',
            content: 'From AI-powered recommendations to virtual reality tours, technology is revolutionizing the way we explore the world...',
            source: 'blog_a',
            date: '2025-07-20T09:00:00Z',
            type: 'blogs',
            isUserVerified: true,
            keywords: ['Travel', 'technology', 'future', 'AI']
        },
        {
            id: 'post2',
            title: 'Exploring the latest summer trends in fashion on TikTok!',
            content: 'Fashion influencers are showcasing vibrant new styles for the summer season...',
            source: 'tiktok',
            date: '2025-07-23T08:00:00Z',
            type: 'posts',
            isUserVerified: true,
            keywords: ['summer', 'trends', 'fashion', 'TikTok']
        },
        {
            id: 'news2',
            title: 'X (Twitter) announces new content moderation policies',
            content: 'Amidst ongoing discussions, X has released updated guidelines for content moderation...',
            source: 'x',
            date: '2025-07-19T11:00:00Z',
            type: 'news',
            isUserVerified: false,
            keywords: ['X', 'Twitter', 'moderation', 'policies']
        },
        {
            id: 'post3',
            title: 'Facebook Group Discussion: Best Breakfast Spots in Town',
            content: 'Join the conversation about the most delicious breakfast places. Share your favorites!',
            source: 'facebook',
            date: '2025-07-18T16:00:00Z',
            type: 'posts',
            isUserVerified: false,
            keywords: ['Facebook', 'Breakfast', 'food', 'local']
        },
        {
            id: 'blog2',
            title: 'Deep Dive into Sheikh Zayed Grand Mosque Architecture',
            content: 'A detailed look at the stunning design and cultural significance of one of the world\'s largest mosques...',
            source: 'blog_a',
            date: '2025-07-15T13:00:00Z',
            type: 'blogs',
            isUserVerified: true,
            keywords: ['Sheikh Zayed', 'mosque', 'architecture', 'culture']
        },
        {
            id: 'news3',
            title: 'BMW unveils new electric concept car at auto show',
            content: 'The German automaker showcases its vision for the future of electric vehicles...',
            source: 'news_site_b',
            date: '2025-07-10T10:00:00Z',
            type: 'news',
            isUserVerified: false,
            keywords: ['BMW', 'electric', 'car', 'auto']
        }
    ];

    // Function to filter and display results
    const performSearch = () => {
        const keyword = keywordInput.value.toLowerCase().trim();
        const selectedDate = dateFilter.value;
        const selectedSource = sourceFilter.value;
        const selectedContentType = document.querySelector('input[name="contentType"]:checked').value;
        const isUserVerified = userVerifiedCheckbox.checked;
        const mustMatch = mustMatchCheckbox.checked;

        // Show loading indicator
        searchResultsContainer.innerHTML = ''; // Clear previous results
        noResultsMessage.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');

        // Simulate API call delay
        setTimeout(() => {
            let filteredResults = mockData.filter(item => {
                // Keyword filter
                const itemText = (item.title + ' ' + item.content + ' ' + (item.keywords ? item.keywords.join(' ') : '')).toLowerCase();
                if (keyword && mustMatch && !itemText.includes(keyword)) {
                    return false;
                }
                if (keyword && !mustMatch && !itemText.includes(keyword)) {
                    // If not 'must match', allow if keyword is empty or present
                    if (keyword && !itemText.includes(keyword)) {
                        return false; // If keyword is entered but not found, filter out
                    }
                }

                // Date filter
                const itemDate = new Date(item.date);
                const now = new Date();
                if (selectedDate === 'past_day' && (now - itemDate) > (24 * 60 * 60 * 1000)) return false;
                if (selectedDate === 'past_week' && (now - itemDate) > (7 * 24 * 60 * 60 * 1000)) return false;
                if (selectedDate === 'past_month' && (now - itemDate) > (30 * 24 * 60 * 60 * 1000)) return false; // Approx month
                if (selectedDate === 'past_year' && (now - itemDate) > (365 * 24 * 60 * 60 * 1000)) return false; // Approx year

                // Source filter
                if (selectedSource !== 'all' && item.source !== selectedSource) return false;

                // Content Type filter
                if (selectedContentType === 'news' && item.type !== 'news') return false;
                if (selectedContentType === 'blogs' && item.type !== 'blogs') return false;
                if (selectedContentType === 'posts' && item.type !== 'posts') return false;

                // User verified filter
                if (isUserVerified && !item.isUserVerified) return false;

                return true;
            });

            // Hide loading indicator
            loadingIndicator.classList.add('hidden');

            if (filteredResults.length === 0) {
                noResultsMessage.classList.remove('hidden');
                noResultsMessage.textContent = 'No results found for your search criteria.';
            } else {
                noResultsMessage.classList.add('hidden');
                filteredResults.forEach(item => {
                    const resultCard = document.createElement('div');
                    resultCard.className = 'result-card p-6 flex flex-col space-y-2';
                    resultCard.innerHTML = `
                        <h3 class="text-xl font-semibold text-gray-900">${item.title}</h3>
                        <p class="text-sm text-gray-600">${item.content.substring(0, 150)}...</p>
                        <div class="flex justify-between items-center text-xs text-gray-500 mt-2">
                            <span class="capitalize">${item.source.replace(/_/g, ' ')} (${item.type})</span>
                            <span>${new Date(item.date).toLocaleDateString()}</span>
                        </div>
                    `;
                    searchResultsContainer.appendChild(resultCard);
                });
            }
        }, 1000); // Simulate 1 second network delay
    };

    // Event Listeners
    searchButton.addEventListener('click', performSearch);
    keywordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Initial message
    noResultsMessage.classList.remove('hidden');
});