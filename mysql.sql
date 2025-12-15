USE budget_app;

CREATE TABLE income (
  id INT PRIMARY KEY DEFAULT 1,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0)
);

INSERT INTO income (id, amount) VALUES (1, 0);

CREATE TABLE envelopes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  balance DECIMAL(10,2) NOT NULL CHECK (balance >= 0)
);
