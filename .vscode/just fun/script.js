const square = document.getElementsByClassName('square')[0];
const circle = document.getElementsByClassName('circle')[0];


square.animate(
    {
        transform: ['rotate(0deg)', 'rotate(360deg)'],
    },
    {
        duration: 2000,
        iterations: Infinity,
    }
)
function scrollIntoViewIfNeeded(element) {
    const rect = element.getBoundingClientRect();
    const isInView =
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth);


