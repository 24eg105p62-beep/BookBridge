import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import './App.css';

const GENRES = ['FICTION', 'NON_FICTION', 'ACADEMIC', 'CHILDREN', 'BIOGRAPHY', 'SELF_HELP', 'OTHER'];
const CONDITIONS = ['NEW', 'GOOD', 'FAIR', 'WORN'];

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [notification, setNotification] = useState(null);

  // Authentication State (Only ONE user can be logged in at a time)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('bookbridge_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Global Active Session from Server
  const [serverActiveSession, setServerActiveSession] = useState(null);

  // Data states
  const [snapshot, setSnapshot] = useState({ totalBooksListed: 0, activeMembers: 0, booksExchanged: 0, averageRating: 0 });
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookForRequest, setSelectedBookForRequest] = useState(null);
  const [selectedRequestForReview, setSelectedRequestForReview] = useState(null);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '', force: false });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', phone: '', location: '' });
  const [newBook, setNewBook] = useState({
    title: '', author: '', genre: 'ACADEMIC', condition: 'GOOD', description: '', location: ''
  });
  const [requestDueDate, setRequestDueDate] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [authError, setAuthError] = useState(null);

  const notify = (msg, isError = false) => {
    setNotification({ msg, isError });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    loadHomeData();
    loadBooks();
    checkActiveSession();
    if (currentUser?.id) {
      loadUserData(currentUser.id);
    }
  }, [currentUser]);

  const checkActiveSession = async () => {
    try {
      const session = await api.getActiveSession();
      setServerActiveSession(session?.active ? session : null);
    } catch (err) {
      console.warn('Could not check active session:', err.message);
    }
  };

  const loadHomeData = async () => {
    try {
      const snap = await api.getCommunitySnapshot();
      if (snap) setSnapshot(snap);
      const feat = await api.getFeaturedBooks();
      if (feat) setFeaturedBooks(feat);
    } catch (err) {
      console.warn('Backend not responding yet:', err.message);
    }
  };

  const loadBooks = async () => {
    try {
      const data = await api.getBooks({ search, genre: selectedGenre, status: selectedStatus });
      setAllBooks(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUserData = async (userId) => {
    try {
      const [books, outReq, incReq, stats, profile, revs] = await Promise.all([
        api.getUserBooks(userId).catch(() => []),
        api.getUserRequests(userId, 'outgoing').catch(() => []),
        api.getUserRequests(userId, 'incoming').catch(() => []),
        api.getUserStatistics(userId).catch(() => null),
        api.getUserProfile(userId).catch(() => null),
        api.getUserReviews(userId).catch(() => [])
      ]);
      setMyBooks(books || []);
      setMyRequests(outReq || []);
      setIncomingRequests(incReq || []);
      setUserStats(stats);
      setUserProfile(profile);
      setMyReviews(revs || []);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  // Login handler enforcing single active user login
  const handleLogin = async (e, forceLogin = false) => {
    if (e) e.preventDefault();
    setAuthError(null);
    try {
      const res = await api.login({
        email: loginForm.email.trim(),
        password: loginForm.password,
        force: forceLogin
      });

      localStorage.setItem('bookbridge_token', res.token);
      const userData = { id: res.id, name: res.name, email: res.email, phone: res.phone, location: res.location };
      localStorage.setItem('bookbridge_user', JSON.stringify(userData));

      setCurrentUser(userData);
      setShowLoginModal(false);
      notify(`Logged in successfully as ${res.name}. Single active session established.`);
      checkActiveSession();
      loadUserData(res.id);
      loadBooks();
    } catch (err) {
      setAuthError(err.message);
      checkActiveSession();
    }
  };

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError(null);
    try {
      await api.register(registerForm);
      notify('Account created successfully! Please log in.');
      setShowRegisterModal(false);
      setLoginForm({ email: registerForm.email, password: registerForm.password, force: false });
      setShowLoginModal(true);
      setRegisterForm({ name: '', email: '', password: '', phone: '', location: '' });
      loadHomeData();
    } catch (err) {
      setAuthError(err.message);
    }
  };

  // Logout handler to free the single active session slot
  const handleLogout = async () => {
    try {
      await api.logout(currentUser?.id);
    } catch (err) {
      console.warn('Logout notification error:', err.message);
    } finally {
      localStorage.removeItem('bookbridge_token');
      localStorage.removeItem('bookbridge_user');
      setCurrentUser(null);
      setServerActiveSession(null);
      setCurrentTab('home');
      notify('Logged out successfully. Login slot is now available for other members.');
      checkActiveSession();
    }
  };

  // Force logout whoever is currently active on server
  const handleForceLogoutCurrent = async () => {
    try {
      await api.logout(null);
      setServerActiveSession(null);
      notify('Active session cleared. You can now log in.');
      setAuthError(null);
    } catch (err) {
      notify('Error clearing session: ' + err.message, true);
    }
  };

  const handleSearchFilter = (e) => {
    e.preventDefault();
    loadBooks();
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    try {
      await api.createBook({ ...newBook, ownerId: currentUser.id });
      notify('Book listed successfully!');
      setShowAddBookModal(false);
      setNewBook({ title: '', author: '', genre: 'ACADEMIC', condition: 'GOOD', description: '', location: '' });
      loadBooks();
      loadUserData(currentUser.id);
      loadHomeData();
    } catch (err) {
      notify(err.message, true);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!currentUser) return;
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.deleteBook(bookId, currentUser.id);
      notify('Book listing removed');
      loadBooks();
      loadUserData(currentUser.id);
      loadHomeData();
    } catch (err) {
      notify(err.message, true);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    try {
      await api.requestBook(selectedBookForRequest.id, {
        requesterId: currentUser.id,
        dueDate: requestDueDate
      });
      notify('Borrow request sent successfully!');
      setShowRequestModal(false);
      setRequestDueDate('');
      loadBooks();
      loadUserData(currentUser.id);
    } catch (err) {
      notify(err.message, true);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await api.approveRequest(requestId, currentUser.id);
      notify('Request approved! Book is marked BORROWED.');
      loadBooks();
      loadUserData(currentUser.id);
    } catch (err) {
      notify(err.message, true);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.rejectRequest(requestId, currentUser.id);
      notify('Request rejected.');
      loadBooks();
      loadUserData(currentUser.id);
    } catch (err) {
      notify(err.message, true);
    }
  };

  const handleReturn = async (requestId) => {
    try {
      await api.markReturned(requestId, currentUser.id);
      notify('Book marked as RETURNED! Rating is now unlocked.');
      loadBooks();
      loadUserData(currentUser.id);
      loadHomeData();
    } catch (err) {
      notify(err.message, true);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await api.submitReview(selectedRequestForReview.id, {
        reviewerId: currentUser.id,
        rating: parseInt(reviewForm.rating, 10),
        comment: reviewForm.comment
      });
      notify('Review submitted successfully!');
      setShowReviewModal(false);
      setReviewForm({ rating: 5, comment: '' });
      loadUserData(currentUser.id);
      loadHomeData();
    } catch (err) {
      notify(err.message, true);
    }
  };

  const requireAuthTab = (tabName) => {
    if (!currentUser) {
      setShowLoginModal(true);
      notify('Please log in first to access this page.', true);
    } else {
      setCurrentTab(tabName);
    }
  };


  return (
    <div className="app">
      {/* Header & Single-User Navigation */}
      <header className="header">
        <div className="nav-container">
          <a href="#home" className="brand" onClick={() => setCurrentTab('home')}>
            📚 BOOK<span>BRIDGE</span>
          </a>

          <nav className="nav-links">
            <button className={`nav-btn ${currentTab === 'home' ? 'active' : ''}`} onClick={() => setCurrentTab('home')}>Home</button>
            <button className={`nav-btn ${currentTab === 'discover' ? 'active' : ''}`} onClick={() => { setCurrentTab('discover'); loadBooks(); }}>Discover Books</button>
            <button className={`nav-btn ${currentTab === 'listings' ? 'active' : ''}`} onClick={() => requireAuthTab('listings')}>My Listings</button>
            <button className={`nav-btn ${currentTab === 'requests' ? 'active' : ''}`} onClick={() => requireAuthTab('requests')}>My Requests</button>
            <button className={`nav-btn ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => requireAuthTab('dashboard')}>Dashboard</button>
            <button className={`nav-btn ${currentTab === 'profile' ? 'active' : ''}`} onClick={() => requireAuthTab('profile')}>Profile</button>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {currentUser ? (
              <div className="user-switch-bar">
                <span>👤 Logged in as: <strong>{currentUser.name}</strong></span>
                <button
                  className="btn-danger"
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.8rem', borderRadius: '6px' }}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn-outline"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.88rem' }}
                  onClick={() => { setAuthError(null); setShowLoginModal(true); }}
                >
                  Sign In
                </button>
                <button
                  className="btn-primary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.88rem' }}
                  onClick={() => { setAuthError(null); setShowRegisterModal(true); }}
                >
                  Join
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {notification && (
          <div className={`alert ${notification.isError ? 'alert-error' : 'alert-success'}`}>
            {notification.msg}
          </div>
        )}

        {/* 1. HOME / LANDING TAB */}
        {currentTab === 'home' && (
          <div>
            <section className="hero-section">
              <div className="hero-content">
                <span className="hero-tagline">COMMUNITY BOOK EXCHANGE & LENDING PLATFORM</span>
                <h1 className="hero-title">Read More. Own Less.<br/>Share Books.</h1>
                <p className="hero-description">
                  List the books gathering dust on your shelf, discover what your neighbours are lending, and keep every exchange on record.
                </p>
                <div className="hero-actions">
                  <button className="btn-secondary" onClick={() => { setCurrentTab('discover'); loadBooks(); }}>Browse Books</button>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      if (!currentUser) setShowLoginModal(true);
                      else setShowAddBookModal(true);
                    }}
                  >
                    List a Book
                  </button>
                  {!currentUser && (
                    <button className="btn-outline" style={{ color: 'white', borderColor: 'white' }} onClick={() => setShowLoginModal(true)}>
                      Member Login
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Community Snapshot */}
            <h3 className="section-title">Community Snapshot</h3>
            <div className="snapshot-grid">
              <div className="snapshot-card">
                <h4>Total Books Listed</h4>
                <div className="snapshot-val">{snapshot.totalBooksListed}</div>
              </div>
              <div className="snapshot-card">
                <h4>Active Members</h4>
                <div className="snapshot-val">{snapshot.activeMembers}</div>
              </div>
              <div className="snapshot-card">
                <h4>Books Exchanged</h4>
                <div className="snapshot-val">{snapshot.booksExchanged}</div>
              </div>
              <div className="snapshot-card">
                <h4>Average Member Rating</h4>
                <div className="snapshot-val">⭐ {snapshot.averageRating ? snapshot.averageRating.toFixed(1) : '5.0'} / 5</div>
              </div>
            </div>

            {/* How It Works */}
            <div className="how-it-works">
              <h3 className="section-title">How It Works</h3>
              <div className="steps-grid">
                <div className="step-item"><div className="step-num">1</div><div className="step-name">List</div><div className="step-sub">Share shelf books</div></div>
                <div className="step-item"><div className="step-num">2</div><div className="step-name">Discover</div><div className="step-sub">Search nearby</div></div>
                <div className="step-item"><div className="step-num">3</div><div className="step-name">Request</div><div className="step-sub">Propose due date</div></div>
                <div className="step-item"><div className="step-num">4</div><div className="step-name">Approve</div><div className="step-sub">Owner confirms</div></div>
                <div className="step-item"><div className="step-num">5</div><div className="step-name">Exchange</div><div className="step-sub">Hand over & return</div></div>
                <div className="step-item"><div className="step-num">6</div><div className="step-name">Rate</div><div className="step-sub">Build reputation</div></div>
              </div>
            </div>

            {/* Featured Books */}
            <h3 className="section-title">Featured Available Books</h3>
            <div className="book-grid">
              {featuredBooks.map(book => (
                <div key={book.id} className="book-card">
                  <div>
                    <div className="book-badges">
                      <span className="badge badge-genre">{book.genre}</span>
                      <span className="badge badge-condition">{book.condition}</span>
                      <span className={`badge badge-${book.status}`}>{book.status}</span>
                    </div>
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">by {book.author}</p>
                    <p className="book-desc">{book.description}</p>
                  </div>
                  <div>
                    <div className="book-meta">
                      <span>📍 {book.location || 'Local Community'}</span>
                      <span>Owner: {book.ownerName}</span>
                    </div>
                    {book.status === 'AVAILABLE' && (
                      <button
                        className="btn-primary"
                        style={{ width: '100%' }}
                        onClick={() => {
                          if (!currentUser) {
                            setShowLoginModal(true);
                          } else {
                            setSelectedBookForRequest(book);
                            setShowRequestModal(true);
                          }
                        }}
                      >
                        Request to Borrow
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. DISCOVER BOOKS TAB */}
        {currentTab === 'discover' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="section-title" style={{ margin: 0 }}>Discover Community Books</h2>
              <button
                className="btn-primary"
                onClick={() => {
                  if (!currentUser) setShowLoginModal(true);
                  else setShowAddBookModal(true);
                }}
              >
                + List a Book
              </button>
            </div>

            {/* Filter Bar */}
            <form className="filter-bar" onSubmit={handleSearchFilter}>
              <input
                type="text"
                className="search-input"
                placeholder="Search by title or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select className="filter-select" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
                <option value="">All Genres</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select className="filter-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="REQUESTED">REQUESTED</option>
                <option value="BORROWED">BORROWED</option>
              </select>
              <button type="submit" className="btn-primary">Apply Filter</button>
              {(search || selectedGenre || selectedStatus) && (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => { setSearch(''); setSelectedGenre(''); setSelectedStatus(''); }}
                >
                  Clear
                </button>
              )}
            </form>

            {/* Book Cards */}
            <div className="book-grid">
              {allBooks.map(book => (
                <div key={book.id} className="book-card">
                  <div>
                    <div className="book-badges">
                      <span className="badge badge-genre">{book.genre}</span>
                      <span className="badge badge-condition">{book.condition}</span>
                      <span className={`badge badge-${book.status}`}>{book.status}</span>
                    </div>
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">by {book.author}</p>
                    <p className="book-desc">{book.description}</p>
                  </div>
                  <div>
                    <div className="book-meta">
                      <span>📍 {book.location || 'Local Community'}</span>
                      <span>Owner: {book.ownerName} {book.ownerRating ? `(⭐${book.ownerRating})` : ''}</span>
                    </div>
                    {currentUser && book.ownerId === currentUser.id ? (
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>You own this listing</span>
                    ) : book.status === 'AVAILABLE' ? (
                      <button
                        className="btn-primary"
                        style={{ width: '100%' }}
                        onClick={() => {
                          if (!currentUser) setShowLoginModal(true);
                          else {
                            setSelectedBookForRequest(book);
                            setShowRequestModal(true);
                          }
                        }}
                      >
                        Request to Borrow
                      </button>
                    ) : (
                      <button className="btn-outline" style={{ width: '100%', opacity: 0.6 }} disabled>
                        {book.status}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. MY LISTINGS (OWNER VIEW) */}
        {currentTab === 'listings' && currentUser && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="section-title" style={{ margin: 0 }}>My Listed Books ({myBooks.length})</h2>
              <button className="btn-primary" onClick={() => setShowAddBookModal(true)}>+ List New Book</button>
            </div>

            <div className="book-grid" style={{ marginBottom: '3rem' }}>
              {myBooks.length === 0 ? (
                <p style={{ color: '#64748b' }}>You haven't listed any books yet. Click "+ List New Book" to share with the community!</p>
              ) : (
                myBooks.map(book => (
                  <div key={book.id} className="book-card">
                    <div>
                      <div className="book-badges">
                        <span className="badge badge-genre">{book.genre}</span>
                        <span className="badge badge-condition">{book.condition}</span>
                        <span className={`badge badge-${book.status}`}>{book.status}</span>
                      </div>
                      <h3 className="book-title">{book.title}</h3>
                      <p className="book-author">by {book.author}</p>
                      <p className="book-desc">{book.description}</p>
                    </div>
                    <div>
                      <div className="book-meta">
                        <span>📍 {book.location}</span>
                        <span>Status: {book.status}</span>
                      </div>
                      <button className="btn-danger" style={{ width: '100%' }} onClick={() => handleDeleteBook(book.id)}>
                        Remove Listing
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Incoming Requests */}
            <h3 className="section-title">Incoming Borrow Requests for My Books ({incomingRequests.length})</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Requester</th>
                    <th>Request Date</th>
                    <th>Proposed Due Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {incomingRequests.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: '#64748b' }}>No incoming requests right now</td></tr>
                  ) : (
                    incomingRequests.map(req => (
                      <tr key={req.id}>
                        <td><strong>{req.bookTitle}</strong></td>
                        <td>{req.requesterName} {req.requesterRating ? `(⭐${req.requesterRating})` : ''}</td>
                        <td>{req.requestDate ? new Date(req.requestDate).toLocaleDateString() : '-'}</td>
                        <td>{req.dueDate}</td>
                        <td><span className={`badge badge-${req.status}`}>{req.status}</span></td>
                        <td>
                          {req.status === 'PENDING' && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn-success" onClick={() => handleApprove(req.id)}>Approve</button>
                              <button className="btn-danger" onClick={() => handleReject(req.id)}>Reject</button>
                            </div>
                          )}
                          {req.status === 'APPROVED' && (
                            <button className="btn-primary" onClick={() => handleReturn(req.id)}>
                              Confirm Return
                            </button>
                          )}
                          {req.status === 'RETURNED' && !req.reviewedByOwner && (
                            <button className="btn-outline" onClick={() => { setSelectedRequestForReview(req); setShowReviewModal(true); }}>
                              ⭐ Rate Borrower
                            </button>
                          )}
                          {req.status === 'RETURNED' && req.reviewedByOwner && (
                            <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>✓ Rated</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. MY REQUESTS (BORROWER VIEW) */}
        {currentTab === 'requests' && currentUser && (
          <div>
            <h2 className="section-title">My Sent Borrow Requests ({myRequests.length})</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Owner</th>
                    <th>Request Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: '#64748b' }}>You haven't requested any books yet</td></tr>
                  ) : (
                    myRequests.map(req => (
                      <tr key={req.id}>
                        <td><strong>{req.bookTitle}</strong></td>
                        <td>{req.ownerName}</td>
                        <td>{req.requestDate ? new Date(req.requestDate).toLocaleDateString() : '-'}</td>
                        <td>{req.dueDate}</td>
                        <td><span className={`badge badge-${req.status}`}>{req.status}</span></td>
                        <td>
                          {req.status === 'RETURNED' && !req.reviewedByRequester && (
                            <button className="btn-outline" onClick={() => { setSelectedRequestForReview(req); setShowReviewModal(true); }}>
                              ⭐ Rate Owner
                            </button>
                          )}
                          {req.status === 'RETURNED' && req.reviewedByRequester && (
                            <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>✓ Rated</span>
                          )}
                          {req.status === 'APPROVED' && (
                            <span style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: 600 }}>Currently Holding Book</span>
                          )}
                          {req.status === 'PENDING' && (
                            <span style={{ fontSize: '0.85rem', color: '#854d0e' }}>Awaiting Owner Approval</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. DASHBOARD */}
        {currentTab === 'dashboard' && currentUser && userStats && (
          <div>
            <h2 className="section-title">Member Dashboard — {currentUser.name}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              {/* Owner Metrics */}
              <div className="profile-card">
                <h3 style={{ color: '#1b4332', marginBottom: '1.25rem' }}>Owner Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Books Listed:</span>
                    <strong>{userStats.booksListed}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Books Currently Lent Out:</span>
                    <strong style={{ color: '#dc2626' }}>{userStats.booksCurrentlyLentOut}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Pending Incoming Requests:</span>
                    <strong style={{ color: '#d97706' }}>{userStats.pendingIncomingRequests}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Average Rating Received as Owner:</span>
                    <strong className="rating-stars">⭐ {userStats.averageRatingAsOwner ? userStats.averageRatingAsOwner.toFixed(1) : 'No ratings yet'}</strong>
                  </div>
                </div>
              </div>

              {/* Borrower Metrics */}
              <div className="profile-card">
                <h3 style={{ color: '#2d6a4f', marginBottom: '1.25rem' }}>Borrower Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Books Currently Borrowed:</span>
                    <strong style={{ color: '#2563eb' }}>{userStats.booksCurrentlyBorrowed}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Borrowing History (Completed):</span>
                    <strong>{userStats.borrowingHistory}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Pending Sent Requests:</span>
                    <strong style={{ color: '#d97706' }}>{userStats.pendingSentRequests}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Average Rating Received as Borrower:</span>
                    <strong className="rating-stars">⭐ {userStats.averageRatingAsBorrower ? userStats.averageRatingAsBorrower.toFixed(1) : 'No ratings yet'}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="snapshot-card">
              <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                  <h4>Completed Exchanges</h4>
                  <div className="snapshot-val">{userStats.completedExchanges}</div>
                </div>
                <div>
                  <h4>Reputation Score</h4>
                  <div className="snapshot-val">⭐ {userStats.overallAverageRating ? userStats.overallAverageRating.toFixed(1) : '5.0'} / 5</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. PROFILE & REVIEWS */}
        {currentTab === 'profile' && currentUser && userProfile && (
          <div>
            <div className="profile-card">
              <h2 className="section-title" style={{ marginBottom: '1rem' }}>Member Profile</h2>
              <p><strong>Full Name:</strong> {userProfile.name}</p>
              <p><strong>Email Address:</strong> {userProfile.email}</p>
              <p><strong>Phone:</strong> {userProfile.phone || 'N/A'}</p>
              <p><strong>Community Location:</strong> {userProfile.location || 'Local Community'}</p>
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <p><strong>Reputation as Book Owner:</strong> ⭐ {userProfile.averageRatingAsOwner ? userProfile.averageRatingAsOwner.toFixed(1) : 'No ratings yet'}</p>
                <p><strong>Reputation as Borrower:</strong> ⭐ {userProfile.averageRatingAsBorrower ? userProfile.averageRatingAsBorrower.toFixed(1) : 'No ratings yet'}</p>
                <p><strong>Total Completed Exchanges:</strong> {userProfile.completedExchanges}</p>
              </div>
            </div>

            <h3 className="section-title">Feedback & Reviews Received ({myReviews.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myReviews.length === 0 ? (
                <p style={{ color: '#64748b' }}>No reviews received yet. Complete a book exchange to receive feedback!</p>
              ) : (
                myReviews.map(r => (
                  <div key={r.id} className="snapshot-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong>{r.reviewerName} rated for "{r.bookTitle}"</strong>
                      <span className="rating-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} ({r.rating}/5)</span>
                    </div>
                    <p style={{ color: '#475569', fontStyle: 'italic' }}>"{r.comment || 'No comment provided'}"</p>
                    <small style={{ color: '#94a3b8' }}>{new Date(r.createdAt).toLocaleDateString()}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MODAL: LOGIN (ENFORCING SINGLE ACTIVE LOGIN) */}
        {showLoginModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Member Sign In</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                * Note: Only one member can be logged in at a time to maintain single-session integrity.
              </p>

              {authError && (
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                  <p>{authError}</p>
                  {serverActiveSession && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <button
                        type="button"
                        className="btn-danger"
                        style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
                        onClick={handleForceLogoutCurrent}
                      >
                        Log out active user ({serverActiveSession.userName})
                      </button>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={(e) => handleLogin(e, false)}>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    required
                    className="form-control"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-outline" onClick={() => setShowLoginModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Sign In</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: REGISTER */}
        {showRegisterModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Join BookBridge Community</h3>
              {authError && <div className="alert alert-error">{authError}</div>}
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="ramesh@example.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password (min 6 chars) *</label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    className="form-control"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    placeholder="9876543210"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Community / College Location</label>
                  <input
                    type="text"
                    className="form-control"
                    value={registerForm.location}
                    onChange={(e) => setRegisterForm({ ...registerForm, location: e.target.value })}
                    placeholder="e.g. Block C, Campus Hostel"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-outline" onClick={() => setShowRegisterModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Register Account</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: LIST A BOOK */}
        {showAddBookModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">List a Personal Book</h3>
              <form onSubmit={handleAddBook}>
                <div className="form-group">
                  <label className="form-label">Book Title *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    placeholder="e.g. Operating System Concepts"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Author *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    placeholder="e.g. Silberschatz & Galvin"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Genre *</label>
                    <select
                      className="form-control"
                      value={newBook.genre}
                      onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                    >
                      {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Condition *</label>
                    <select
                      className="form-control"
                      value={newBook.condition}
                      onChange={(e) => setNewBook({ ...newBook, condition: e.target.value })}
                    >
                      {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Pickup Location</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newBook.location}
                    onChange={(e) => setNewBook({ ...newBook, location: e.target.value })}
                    placeholder="e.g. Campus Library or Hostel Block"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={newBook.description}
                    onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                    placeholder="Condition details, edition, notes..."
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-outline" onClick={() => setShowAddBookModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Add Listing</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: REQUEST TO BORROW */}
        {showRequestModal && selectedBookForRequest && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Request to Borrow</h3>
              <p style={{ marginBottom: '1rem', color: '#475569' }}>
                You are requesting <strong>"{selectedBookForRequest.title}"</strong> from <strong>{selectedBookForRequest.ownerName}</strong>.
              </p>
              <form onSubmit={handleSendRequest}>
                <div className="form-group">
                  <label className="form-label">Proposed Due Date *</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="form-control"
                    value={requestDueDate}
                    onChange={(e) => setRequestDueDate(e.target.value)}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-outline" onClick={() => setShowRequestModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Confirm Request</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: SUBMIT REVIEW */}
        {showReviewModal && selectedRequestForReview && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Submit Exchange Review</h3>
              <p style={{ marginBottom: '1rem', color: '#475569' }}>
                Rate your exchange experience for <strong>"{selectedRequestForReview.bookTitle}"</strong>.
              </p>
              <form onSubmit={handleSubmitReview}>
                <div className="form-group">
                  <label className="form-label">Rating (1 to 5 Stars) *</label>
                  <select
                    className="form-control"
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent Experience</option>
                    <option value="4">⭐⭐⭐⭐ 4 - Good</option>
                    <option value="3">⭐⭐⭐ 3 - Average</option>
                    <option value="2">⭐⭐ 2 - Below Expectations</option>
                    <option value="1">⭐ 1 - Poor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Comment / Feedback</label>
                  <textarea
                    className="form-control"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Share how the exchange went..."
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-outline" onClick={() => setShowReviewModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Post Review</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
