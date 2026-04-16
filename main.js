
import { marked } from 'marked';

async function fetchGitHubReadme() {
  const readmeContainer = document.getElementById('github-readme');
  if (!readmeContainer) return;

  try {
    const res = await fetch('https://raw.githubusercontent.com/mowne67/mowne67/main/README.md');
    if (!res.ok) throw new Error('Failed to fetch README');
    const text = await res.text();
    readmeContainer.innerHTML = marked(text);
  } catch (err) {
    readmeContainer.innerHTML = '<span style="color: red;">[ERR] failed to fetch github readme</span>';
  }
}



const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {

  fetchGitHubReadme();
  runMatrix();           // background rain (always on)
  runMatrixIntro();      // fullscreen intro rain (fades out, then typewriter starts)
});

function runMatrixIntro() {
  const canvas = document.getElementById('matrix-intro');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const letters = 'அஆஇஈஉஊஎஏஐஒஓஔகஙசஞடணதநபமயரலவழளறனABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);

  function draw() {
    ctx.fillStyle = 'rgba(22, 22, 22, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
      const text = letters.charAt(Math.floor(Math.random() * letters.length));
      ctx.fillStyle = drops[i] === 1 ? '#7dff7d' : '#20C20E';
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  const interval = setInterval(draw, 40);

  // After 2.5s, fade out the intro overlay
  setTimeout(() => {
    canvas.style.opacity = '0';
    setTimeout(() => {
      clearInterval(interval);
      canvas.remove();
    }, 1200); // wait for fade transition to finish
  }, 2000);
}

function runMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const letters = 'அஆஇஈஉஊஎஏஐஒஓஔகஙசஞடணதநபமயரலவழளறனABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const fontSize = 14;

  let columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);

  window.addEventListener('resize', () => {
    columns = Math.floor(canvas.width / fontSize);
    drops.length = columns;
    drops.fill(1);
  });

  function draw() {
    ctx.fillStyle = 'rgba(22, 22, 22, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = letters.charAt(Math.floor(Math.random() * letters.length));
      // Bright head character
      ctx.fillStyle = drops[i] === 1 ? '#7dff7d' : '#20C20E';
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 40);
}
