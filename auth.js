(function() {
  const USERS_KEY = 'bookhaven_users';
  const CURRENT_KEY = 'bookhaven_current';

  function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_KEY) || 'null');
  }

  function setCurrentUser(user) {
    if (user) {
      localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_KEY);
    }
    updateNav();
  }

  function updateNav() {
    const user = getCurrentUser();
    const loginLink = document.getElementById('navLogin');
    const profileLink = document.getElementById('navProfile');
    const logoutBtn = document.getElementById('navLogout');
    const userName = document.getElementById('navUserName');
    if (loginLink) loginLink.style.display = user ? 'none' : 'block';
    if (profileLink) profileLink.style.display = user ? 'block' : 'none';
    if (logoutBtn) logoutBtn.style.display = user ? 'block' : 'none';
    if (userName) {
      userName.style.display = user ? 'block' : 'none';
      userName.textContent = user ? user.name : '';
    }
  }

  window.BookHavenAuth = {
    signup: function(name, email, password) {
      const users = getUsers();
      if (users.find(u => u.email === email)) {
        return { success: false, message: 'Email already registered' };
      }
      const user = { id: Date.now(), name, email, password, favorites: [], joined: new Date().toISOString() };
      users.push(user);
      saveUsers(users);
      setCurrentUser({ id: user.id, name: user.name, email: user.email, favorites: user.favorites, joined: user.joined });
      return { success: true };
    },
    login: function(email, password) {
      const users = getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        return { success: false, message: 'Invalid email or password' };
      }
      setCurrentUser({ id: user.id, name: user.name, email: user.email, favorites: user.favorites || [], joined: user.joined });
      return { success: true };
    },
    logout: function() {
      setCurrentUser(null);
    },
    getCurrent: getCurrentUser,
    updateFavorites: function(favorites) {
      const current = getCurrentUser();
      if (!current) return;
      current.favorites = favorites;
      setCurrentUser(current);
      const users = getUsers();
      const idx = users.findIndex(u => u.id === current.id);
      if (idx !== -1) {
        users[idx].favorites = favorites;
        saveUsers(users);
      }
    },
    updateNav: updateNav
  };

  document.addEventListener('DOMContentLoaded', function() {
    updateNav();
    function doLogout(e) {
      e.preventDefault();
      BookHavenAuth.logout();
      window.location.href = 'index.html';
    }
    const logoutBtn = document.getElementById('navLogout');
    if (logoutBtn) logoutBtn.addEventListener('click', doLogout);
    const profileLogout = document.getElementById('profileLogout');
    if (profileLogout) profileLogout.addEventListener('click', doLogout);
  });
})();

