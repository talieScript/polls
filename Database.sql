CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE poll (
  id            uuid DEFAULT uuid_generate_v4 (),
  title         VARCHAR(50) NOT NULL,
  question      VARCHAR(150) NOT NULL,
  options       VARCHAR(95) NOT NULL,
  created       timestamp DEFAULT(now()),
  end_date      timestamp NOT NUll,
  voters        uuid[],
  PRIMARY KEY (id)
)

CREATE TABLE answer (
  id            uuid DEFAULT uuid_generate_v4 (),
  answer_string	VARCHAR(150) NOT NULL,
  votes			INT DEFAULT 0,
  poll          uuid NOT NULL,
  FOREIGN KEY(poll) REFERENCES poll(id) ON DELETE CASCADE,
  PRIMARY KEY (id)
)

CREATE TABLE voter (
  id            uuid DEFAULT uuid_generate_v4 (),
  email         VARCHAR UNIQUE,
  ip            char(32) NOT NULL,
  answers       uuid[],
  PRIMARY KEY (id)
)

CREATE TABLE pendingEmails (
	email       VARCHAR UNIQUE,
	answers     uuid[],
	PRIMARY KEY (email)
)