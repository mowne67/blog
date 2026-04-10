const _posts = [
  { id: '01', title: 'YouTube Knowledge Bank', tags: ['ai', 'python'], date: 'Open Source' },
  { id: '02', title: 'Enterprise Resource Planning AI Chatbot', tags: ['langgraph', 'ai'], date: 'Project' },
  { id: '03', title: 'LLM Apps: Movie Scripts & RAG', tags: ['gemini', 'llama3'], date: 'Project' },
  { id: '04', title: 'OCR Streamlit App', tags: ['gemini', 'vision'], date: 'Project' },
  { id: '05', title: 'YOLO Object Customer Detection', tags: ['computer-vision'], date: 'Project' },
  { id: '06', title: 'Transfer Learning for NLP', tags: ['nlp', 'tensorflow'], date: 'Project' },
  { id: '07', title: 'pyinterpret', tags: ['python', 'open-source'], date: 'Library' },
  { id: '08', title: 'Instagram AI Scraper', tags: ['python', 'wip'], date: 'Upcoming' },
];

const _tags = [
  { id: 'all', name: 'all' },
  { id: 'ai', name: 'ai' },
  { id: 'python', name: 'python' },
  { id: 'gemini', name: 'gemini' },
  { id: 'computer-vision', name: 'computer-vision' },
  { id: 'nlp', name: 'nlp' },
];

function renderPosts(filterTag = 'all') {
  const postList = document.getElementById('post-list');
  postList.innerHTML = '';
  
  const filteredPosts = _posts.filter(post => 
    filterTag === 'all' || post.tags.includes(filterTag)
  );

  filteredPosts.forEach((post, index) => {
    const li = document.createElement('li');
    li.className = 'post-item';
    li.style.animation = `fadeInUp 0.4s ease forwards`;
    li.style.animationDelay = `${index * 0.1}s`;
    li.style.opacity = '0';
    li.style.transform = 'translateY(10px)';

    const tagDisplay = post.tags.join(' · ');

    li.innerHTML = `
      <span class="post-num">${post.id}</span>
      <a class="post-title" href="https://github.com/mowne67" target="_blank">${post.title}</a>
      <span class="post-tag">${tagDisplay}</span>
      <span class="post-date">${post.date}</span>
    `;
    postList.appendChild(li);
  });
}

function renderTags() {
  const tagRow = document.getElementById('tag-row');
  tagRow.innerHTML = '';

  _tags.forEach(tag => {
    const count = tag.id === 'all' 
      ? _posts.length 
      : _posts.filter(p => p.tags.includes(tag.id)).length;

    const span = document.createElement('span');
    span.className = tag.id === 'all' ? 'tag active' : 'tag';
    span.dataset.id = tag.id;
    span.textContent = `${tag.name} (${count})`;
    
    span.addEventListener('click', () => {
      document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
      span.classList.add('active');
      renderPosts(tag.id);
    });

    tagRow.appendChild(span);
  });
}

const typeText = "hello. i'm Mownetharan A K S — Data Scientist & Full Stack AI Engineer.<br>building scalable solutions at the intersection of <span class='highlight'>data</span>, <span class='highlight'>AI</span>, and <span class='highlight'>business process acceleration</span>.";
let typeIndex = 0;
const typeSpeed = 15;

function typeWriter() {
  const el = document.getElementById('typewriter');
  let currentHTML = "";
  let isTag = false;
  
  function type() {
      if (typeIndex < typeText.length) {
          const char = typeText.charAt(typeIndex);
          if (char === '<') isTag = true;
          
          currentHTML += char;
          
          if (char === '>') isTag = false;
          
          el.innerHTML = currentHTML + '<span class="cursor"></span>';
          typeIndex++;
          
          if (isTag) {
              type(); 
          } else {
              setTimeout(type, typeSpeed);
          }
      } else {
          el.innerHTML = currentHTML + '<span class="cursor"></span>'; 
      }
  }
  
  el.innerHTML = "";
  type();
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
  renderTags();
  renderPosts();
  runMatrix();           // background rain (always on)
  runMatrixIntro();      // fullscreen intro rain (fades out, then typewriter starts)
});

function runMatrixIntro() {
  const canvas = document.getElementById('matrix-intro');
  if (!canvas) { setTimeout(typeWriter, 500); return; }
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const letters = 'アイウエオカキクケコサシスセソABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);

  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
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
      setTimeout(typeWriter, 100);
    }, 1500); // wait for fade transition to finish
  }, 2500);
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

  const letters = 'アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const fontSize = 14;

  let columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);

  window.addEventListener('resize', () => {
    columns = Math.floor(canvas.width / fontSize);
    drops.length = columns;
    drops.fill(1);
  });

  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
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
