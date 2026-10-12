-- ========================================================
-- BOOKBRIDGE - Seed Data (MySQL)
-- Default password for all seed users: password123
-- BCrypt Hash: $2a$10$w6F2n.WdM8J5k0j8k5l4le1nQ2b9z6b4x0KzW1s1Xp7c2x5s.cM2u
-- ========================================================

-- Users
INSERT IGNORE INTO users (id, name, email, password, phone, location) VALUES
(1, 'Yeldhandi Chandu', 'chandu@bookbridge.com', '$2a$10$w6F2n.WdM8J5k0j8k5l4le1nQ2b9z6b4x0KzW1s1Xp7c2x5s.cM2u', '9876543210', 'Hyderabad, Tech Hub'),
(2, 'Priya Sharma', 'priya@bookbridge.com', '$2a$10$w6F2n.WdM8J5k0j8k5l4le1nQ2b9z6b4x0KzW1s1Xp7c2x5s.cM2u', '9123456789', 'Madhapur, Hyderabad'),
(3, 'Rahul Verma', 'rahul@bookbridge.com', '$2a$10$w6F2n.WdM8J5k0j8k5l4le1nQ2b9z6b4x0KzW1s1Xp7c2x5s.cM2u', '9988776655', 'Kondapur, Hyderabad'),
(4, 'Ananya Patel', 'ananya@bookbridge.com', '$2a$10$w6F2n.WdM8J5k0j8k5l4le1nQ2b9z6b4x0KzW1s1Xp7c2x5s.cM2u', '9871234560', 'Gachibowli, Hyderabad');

-- Books
INSERT IGNORE INTO books (id, title, author, genre, book_condition, description, location, status, owner_id) VALUES
(1, 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', 'ACADEMIC', 'GOOD', 'Essential read for every software developer. Clean code principles and best practices.', 'Hyderabad, Tech Hub', 'AVAILABLE', 1),
(2, 'Atomic Habits', 'James Clear', 'SELF_HELP', 'NEW', 'An easy and proven way to build good habits and break bad ones.', 'Madhapur, Hyderabad', 'BORROWED', 2),
(3, 'The Pragmatic Programmer', 'David Thomas & Andrew Hunt', 'ACADEMIC', 'GOOD', 'Your journey to mastery in software craft and system design.', 'Hyderabad, Tech Hub', 'REQUESTED', 1),
(4, 'To Kill a Mockingbird', 'Harper Lee', 'FICTION', 'FAIR', 'A classic novel of warmth and humor despite dealing with serious issues.', 'Kondapur, Hyderabad', 'AVAILABLE', 3),
(5, 'Steve Jobs: The Exclusive Biography', 'Walter Isaacson', 'BIOGRAPHY', 'GOOD', 'The story of the roller-coaster life and searingly intense personality of Steve Jobs.', 'Gachibowli, Hyderabad', 'AVAILABLE', 4),
(6, 'Designing Data-Intensive Applications', 'Martin Kleppmann', 'ACADEMIC', 'NEW', 'The big ideas behind reliable, scalable, and maintainable systems.', 'Madhapur, Hyderabad', 'AVAILABLE', 2);
