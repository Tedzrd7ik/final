const books = [
  { id: 1, title: "The Silent Forest", author: "Elena Marquez", price: 14.99, category: "Fiction", img: "https://picsum.photos/seed/book1/400/300", desc: "A gripping tale of survival and mystery in an ancient woodland." },
  { id: 2, title: "Code & Cosmos", author: "Raj Patel", price: 22.50, category: "Science", img: "https://picsum.photos/seed/book2/400/300", desc: "Exploring the intersection of programming and astronomy." },
  { id: 3, title: "Ocean Whispers", author: "Sofia Lind", price: 12.00, category: "Poetry", img: "https://picsum.photos/seed/book3/400/300", desc: "Poems inspired by the sea and human emotion." },
  { id: 4, title: "Urban Gardens", author: "Marcus Lee", price: 18.75, category: "Non-Fiction", img: "https://picsum.photos/seed/book4/400/300", desc: "How city dwellers can grow food and community." },
  { id: 5, title: "Midnight Algorithms", author: "Aisha Khan", price: 27.00, category: "Tech", img: "https://picsum.photos/seed/book5/400/300", desc: "A novel about AI ethics and late-night debugging." },
  { id: 6, title: "Mountain Paths", author: "Tom Rivera", price: 15.25, category: "Travel", img: "https://picsum.photos/seed/book6/400/300", desc: "Hiking guides and personal stories from the Andes." }
];

function getFavorites() {
  const user = BookHavenAuth.getCurrent();
  return user ? (user.favorites || []) : JSON.parse(localStorage.getItem('guest_favorites') || '[]');
}

function saveFavorites(favs) {
  const user = BookHavenAuth.getCurrent();
  if (user) {
    BookHavenAuth.updateFavorites(favs);
  } else {
    localStorage.setItem('guest_favorites', JSON.stringify(favs));
  }
  updateFavCounter();
}

function updateFavCounter() {
  const count = getFavorites().length;
  document.querySelectorAll('.fav-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'inline' : 'none';
  });
}

function toggleFavorite(id) {
  let favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx === -1) {
    favs.push(id);
  } else {
    favs.splice(idx, 1);
  }
  saveFavorites(favs);
  return favs.includes(id);
}

function renderBooks(containerId, list) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!list || list.length === 0) {
    container.innerHTML = '<div class="empty-state col-12"><i class="bi bi-book display-4"></i><p class="mt-3">No books found.</p></div>';
    return;
  }
  const favs = getFavorites();
  container.innerHTML = list.map(book => `
    <div class="col-md-4 col-sm-6 mb-4">
      <div class="card book-card h-100">
        <img src="${book.img}" class="card-img-top" alt="${book.title}">
        <button class="btn btn-sm ${favs.includes(book.id) ? 'btn-danger' : 'btn-outline-danger'} badge-fav fav-btn" data-id="${book.id}" aria-label="Toggle favorite">
          <i class="bi ${favs.includes(book.id) ? 'bi-heart-fill' : 'bi-heart'}"></i>
        </button>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${book.title}</h5>
          <p class="card-text text-secondary small">${book.author} · ${book.category}</p>
          <p class="card-text flex-grow-1">${book.desc}</p>
          <div class="d-flex justify-content-between align-items-center">
            <strong class="text-primary">$${book.price.toFixed(2)}</strong>
            <button class="btn btn-sm btn-primary add-cart" data-id="${book.id}">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function calculateTotal(items) {
  return items.reduce((sum, id) => {
    const book = books.find(b => b.id === id);
    return sum + (book ? book.price : 0);
  }, 0);
}

document.addEventListener('DOMContentLoaded', function() {
  updateFavCounter();

  const booksGrid = document.getElementById('booksGrid');
  if (booksGrid) {
    renderBooks('booksGrid', books);
  }

  const favGrid = document.getElementById('favGrid');
  if (favGrid) {
    const favIds = getFavorites();
    const favBooks = books.filter(b => favIds.includes(b.id));
    renderBooks('favGrid', favBooks);
    const totalEl = document.getElementById('favTotal');
    if (totalEl) {
      totalEl.textContent = '$' + calculateTotal(favIds).toFixed(2);
    }
  }

  document.body.addEventListener('click', function(e) {
    const favBtn = e.target.closest('.fav-btn');
    if (favBtn) {
      const id = parseInt(favBtn.dataset.id);
      const isFav = toggleFavorite(id);
      favBtn.classList.toggle('btn-danger', isFav);
      favBtn.classList.toggle('btn-outline-danger', !isFav);
      favBtn.querySelector('i').className = isFav ? 'bi bi-heart-fill' : 'bi bi-heart';
      if (document.getElementById('favGrid')) {
        const favIds = getFavorites();
        renderBooks('favGrid', books.filter(b => favIds.includes(b.id)));
        const totalEl = document.getElementById('favTotal');
        if (totalEl) totalEl.textContent = '$' + calculateTotal(favIds).toFixed(2);
      }
    }
  });

  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  if (searchInput || categoryFilter) {
    function filterBooks() {
      const q = (searchInput ? searchInput.value : '').toLowerCase();
      const cat = categoryFilter ? categoryFilter.value : '';
      let filtered = books.filter(b => {
        const matchQ = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
        const matchC = !cat || b.category === cat;
        return matchQ && matchC;
      });
      renderBooks('booksGrid', filtered);
    }
    if (searchInput) searchInput.addEventListener('input', filterBooks);
    if (categoryFilter) categoryFilter.addEventListener('change', filterBooks);
  }

  const clearFavs = document.getElementById('clearFavs');
  if (clearFavs) {
    clearFavs.addEventListener('click', function() {
      saveFavorites([]);
      renderBooks('favGrid', []);
      const totalEl = document.getElementById('favTotal');
      if (totalEl) totalEl.textContent = '$0.00';
    });
  }

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      clearErrors(signupForm);
      const name = signupForm.name.value.trim();
      const email = signupForm.email.value.trim();
      const password = signupForm.password.value;
      const confirm = signupForm.confirm.value;
      let valid = true;
      if (name.length < 2) { showError(signupForm.name, 'Name must be at least 2 characters'); valid = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError(signupForm.email, 'Enter a valid email'); valid = false; }
      if (password.length < 6) { showError(signupForm.password, 'Password must be at least 6 characters'); valid = false; }
      if (password !== confirm) { showError(signupForm.confirm, 'Passwords do not match'); valid = false; }
      if (!valid) return;
      const result = BookHavenAuth.signup(name, email, password);
      if (result.success) {
        showSuccess(signupForm, 'Account created! Redirecting...');
        setTimeout(() => window.location.href = 'profile.html', 1000);
      } else {
        showError(signupForm.email, result.message);
      }
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      clearErrors(loginForm);
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;
      let valid = true;
      if (!email) { showError(loginForm.email, 'Email is required'); valid = false; }
      if (!password) { showError(loginForm.password, 'Password is required'); valid = false; }
      if (!valid) return;
      const result = BookHavenAuth.login(email, password);
      if (result.success) {
        showSuccess(loginForm, 'Welcome back! Redirecting...');
        setTimeout(() => window.location.href = 'profile.html', 1000);
      } else {
        showError(loginForm.email, result.message);
      }
    });
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      clearErrors(contactForm);
      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();
      let valid = true;
      if (name.length < 2) { showError(contactForm.name, 'Name is required'); valid = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError(contactForm.email, 'Valid email required'); valid = false; }
      if (message.length < 10) { showError(contactForm.message, 'Message must be at least 10 characters'); valid = false; }
      if (!valid) return;
      showSuccess(contactForm, 'Message sent successfully! We will reply soon.');
      contactForm.reset();
    });
  }

  const profileName = document.getElementById('profileName');
  if (profileName) {
    const user = BookHavenAuth.getCurrent();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    profileName.textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileJoined').textContent = new Date(user.joined).toLocaleDateString();
    document.getElementById('profileFavCount').textContent = (user.favorites || []).length;
    const note = document.getElementById('demoNote');
    if (note) note.style.display = 'block';
  }

  if (typeof $ !== 'undefined') {
    $('.card').hover(
      function() { $(this).stop(true).animate({ marginTop: '-8px' }, 200); },
      function() { $(this).stop(true).animate({ marginTop: '0' }, 200); }
    );
    $('.btn').on('mouseenter', function() {
      $(this).stop(true).animate({ opacity: 0.85 }, 150);
    }).on('mouseleave', function() {
      $(this).stop(true).animate({ opacity: 1 }, 150);
    });
    $('#booksGrid, #favGrid').hide().fadeIn(600);
    $('.hero').hide().slideDown(500);
    $('.theme-toggle').on('click', function() {
      $(this).fadeOut(100).fadeIn(100);
    });
  }
});

function showError(input, msg) {
  const err = input.parentElement.querySelector('.error-message');
  if (err) {
    err.textContent = msg;
    err.style.display = 'block';
  }
  input.classList.add('is-invalid');
}

function clearErrors(form) {
  form.querySelectorAll('.error-message').forEach(e => { e.style.display = 'none'; e.textContent = ''; });
  form.querySelectorAll('.is-invalid').forEach(i => i.classList.remove('is-invalid'));
  const success = form.querySelector('.success-message');
  if (success) success.style.display = 'none';
}

function showSuccess(form, msg) {
  const success = form.querySelector('.success-message');
  if (success) {
    success.textContent = msg;
    success.style.display = 'block';
  }
}
