import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import './App.css';

const GENRES = ['FICTION', 'NON_FICTION', 'ACADEMIC', 'CHILDREN', 'BIOGRAPHY', 'SELF_HELP', 'OTHER'];
const CONDITIONS = ['NEW', 'GOOD', 'FAIR', 'WORN'];

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [activeUser, setActiveUser] = useState({ id: 1, name: 'Yeldhandi Chandu', email: 'chandu@bookbridge.com' });
  const [notification, setNotification] = useState(null);

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
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookForRequest, setSelectedBookForRequest] = useState(null);
  const [selectedRequestForReview, setSelectedRequestForReview] = useState(null);

  // Form states
  const [newBook, setNewBook] = useState({
    title: '', author: '', genre: 'ACADEMIC', condition: 'GOOD', description: '', location: ''
  });
  const [requestDueDate, setRequestDueDate] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  const notify = (msg, isError = false) => {
    setNotification({ msg, isError });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    loadHomeData();
    loadBooks();
    if (activeUser?.id) {
      loadUserData(activeUser.id);
    }
  }, [activeUser]);

  const loadHomeData = async () => {
    try {
      const snap = await api.getCommunitySnapshot();
      if (snap) setSnapshot(snap);
      const feat = await api.getFeaturedBooks();
      if (feat) setFeaturedBooks(feat);
    } catch (err) {
      console.warn('Backend not responding yet or initializing:', err.message);
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

  const handleSearchFilter = (e) => {
    e.preventDefault();
    loadBooks();
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await api.createBook({ ...newBook, ownerId: activeUser.id });
      notify('Book listed successfully!');
      setShowAddBookModal(false);
      setNewBook({ title: '', author: '', genre: 'ACADEMIC', condition: 'GOOD', description: '', location: '' });
      loadBooks();
      loadUserData(activeUser.id);
      loadHomeData();
    } catch (err) {
      notify(err.message, true);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.deleteBook(bookId, activeUser.id);
      notify('Book listing removed');
      loadBooks();
      loadUserData(activeUser.id);
      loadHomeData();
    } catch (err) {
      notify(err.message, true);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    try {
      await api.requestBook(selectedBookForRequest.id, {
        requesterId: activeUser.id,
        dueDate: requestDueDate
      });
      notify('Borrow request sent successfully!');
      setShowRequestModal(false);
      setRequestDueDate('');
      loadBooks();
      loadUserData(activeUser.id);
    } catch (err) {
      notify(err.message, true);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await api.approveRequest(requestId, activeUser.id);
      notify('Request approved! Book is marked BORROWED.');
      loadBooks();
      loadUserData(activeUser.id);
    } catch (err) {
      notify(err.message, true);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.rejectRequest(requestId, activeUser.id);
      notify('Request rejected.');
      loadBooks();
      loadUserData(activeUser.id);
    } catch (err) {
      notify(err.message, true);
    }
  };

  const handleReturn = async (requestId) => {
    try {
      await api.markReturned(requestId, activeUser.id);
      notify('Book marked as RETURNED! Rating is now unlocked.');
      loadBooks();
      loadUserData(activeUser.id);
      loadHomeData();
    } catch (err) {
      notify(err.message, true);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await api.submitReview(selectedRequestForReview.id, {
        reviewerId: activeUser.id,
        rating: parseInt(reviewForm.rating, 10),
        comment: reviewForm.comment
      });
      notify('Review submitted successfully!');
      setShowReviewModal(false);
      setReviewForm({ rating: 5, comment: '' });
      loadUserData(activeUser.id);
      loadHomeData();
    } catch (err) {
      notify(err.message, true);
    }
  };

  const switchUser = (id, name, email) => {
    setActiveUser({ id, name, email });
    notify(`Switched active session to ${name}`);
  };

  return (
    <div className="app">
      {/* Navigation Header */}
      <header className="header">
        <div className="nav-container">
          <a href="#home" className="brand" onClick={() => setCurrentTab('home')}>
            📚 BOOK<span>BRIDGE</span>
          </a>

          <nav className="nav-links">
            <button className={`nav-btn ${currentTab === 'home' ? 'active' : ''}`} onClick={() => setCurrentTab('home')}>Home</button>
            <button className={`nav-btn ${currentTab === 'discover' ? 'active' : ''}`} onClick={() => { setCurrentTab('discover'); loadBooks(); }}>Discover Books</button>
            <button className={`nav-btn ${currentTab === 'listings' ? 'active' : ''}`} onClick={() => setCurrentTab('listings')}>My Listings</button>
            <button className={`nav-btn ${currentTab === 'requests' ? 'active' : ''}`} onClick={() => setCurrentTab('requests')}>My Requests</button>
            <button className={`nav-btn ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentTab('dashboard')}>Dashboard</button>
            <button className={`nav-btn ${currentTab === 'profile' ? 'active' : ''}`} onClick={() => setCurrentTab('profile')}>Profile</button>
          </nav>

          <div className="user-switch-bar">
            <span>👤 Active Member:</span>
            <select
              className="user-select"
              value={activeUser.id}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val === 1) switchUser(1, 'Yeldhandi Chandu', 'chandu@bookbridge.com');
                if (val === 2) switchUser(2, 'Priya Sharma', 'priya@bookbridge.com');
                if (val === 3) switchUser(3, 'Rahul Verma', 'rahul@bookbridge.com');
                if (val === 4) switchUser(4, 'Ananya Patel', 'ananya@bookbridge.com');
              }}
            >
              <option value="1">Yeldhandi Chandu (Roll: 24EG105P62)</option>
              <option value="2">Priya Sharma</option>
              <option value="3">Rahul Verma</option>
              <option value="4">Ananya Patel</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Body */}
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
                  <button className="btn-primary" onClick={() => setShowAddBookModal(true)}>List a Book</button>
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
                <div className="step-item"><div className="step-num">1</div><div className="step-name">List</div></div>
                <div className="step-item"><div className="step-num">2</div><div className="step-name">Discover</div></div>
                <div className="step-item"><div className="step-num">3</div><div className="step-name">Request</div></div>
                <div className="step-item"><div className="step-num">4</div><div className="step-name">Approve</div></div>
                <div className="step-item"><div className="step-num">5</div><div className="step-name">Exchange</div></div>
                <div className="step-item"><div className="step-num">6</div><div className="step-name">Rate</div></div>
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
                    {book.ownerId !== activeUser.id && book.status === 'AVAILABLE' && (
                      <button
                        className="btn-primary"
                        style={{ width: '100%' }}
                        onClick={() => { setSelectedBookForRequest(book); setShowRequestModal(true); }}
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
              <button className="btn-primary" onClick={() => setShowAddBookModal(true)}>+ List a Book</button>
            </div>

            {/* Filter & Search Bar */}
            <form className="filter-bar" onSubmit={handleSearchFilter}>
              <input
                type="text"
                className="search-input"
                placeholder="Search by book title or author..."
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

            {/* Books Grid */}
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
                    {book.ownerId === activeUser.id ? (
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>You own this book</span>
                    ) : book.status === 'AVAILABLE' ? (
                      <button
                        className="btn-primary"
                        style={{ width: '100%' }}
                        onClick={() => { setSelectedBookForRequest(book); setShowRequestModal(true); }}
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
        {currentTab === 'listings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="section-title" style={{ margin: 0 }}>My Listed Books ({myBooks.length})</h2>
              <button className="btn-primary" onClick={() => setShowAddBookModal(true)}>+ List New Book</button>
            </div>

            <div className="book-grid" style={{ marginBottom: '3rem' }}>
              {myBooks.map(book => (
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
              ))}
            </div>

            {/* Incoming Requests for My Books */}
            <h3 className="section-title">Incoming Borrow Requests ({incomingRequests.length})</h3>
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
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: '#64748b' }}>No incoming requests</td></tr>
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
                            <span style={{ fontSize: '0.85rem', color: '#166534' }}>✓ Rated</span>
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
        {currentTab === 'requests' && (
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
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: '#64748b' }}>No requests sent yet</td></tr>
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
                            <span style={{ fontSize: '0.85rem', color: '#166534' }}>✓ Rated</span>
                          )}
                          {req.status === 'APPROVED' && (
                            <span style={{ fontSize: '0.85rem', color: '#1e40af' }}>Currently Holding Book</span>
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
        {currentTab === 'dashboard' && userStats && (
          <div>
            <h2 className="section-title">Member Dashboard — {activeUser.name}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              {/* Owner View */}
              <div className="profile-card">
                <h3 style={{ color: '#1e3a8a', marginBottom: '1.25rem' }}>Owner Activity</h3>
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

              {/* Borrower View */}
              <div className="profile-card">
                <h3 style={{ color: '#0369a1', marginBottom: '1.25rem' }}>Borrower Activity</h3>
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
                  <h4>Total Completed Exchanges</h4>
                  <div className="snapshot-val">{userStats.completedExchanges}</div>
                </div>
                <div>
                  <h4>Combined Reputation Rating</h4>
                  <div className="snapshot-val">⭐ {userStats.overallAverageRating ? userStats.overallAverageRating.toFixed(1) : '5.0'} / 5</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. PROFILE & REVIEWS */}
        {currentTab === 'profile' && userProfile && (
          <div>
            <div className="profile-card">
              <h2 className="section-title" style={{ marginBottom: '1rem' }}>Member Profile</h2>
              <p><strong>Name:</strong> {userProfile.name}</p>
              <p><strong>Email:</strong> {userProfile.email}</p>
              <p><strong>Phone:</strong> {userProfile.phone || 'N/A'}</p>
              <p><strong>Location:</strong> {userProfile.location || 'Local Community'}</p>
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
                    placeholder="e.g. Introduction to Algorithms"
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
                    placeholder="e.g. Thomas H. Cormen"
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
                  <label className="form-label">Location / Pickup Area</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newBook.location}
                    onChange={(e) => setNewBook({ ...newBook, location: e.target.value })}
                    placeholder="e.g. College Library / Block A"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description & Notes</label>
                  <textarea
                    className="form-control"
                    value={newBook.description}
                    onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                    placeholder="Brief summary or condition notes..."
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
