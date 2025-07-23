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