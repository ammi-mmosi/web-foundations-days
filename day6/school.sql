-- =========================================
-- Day 6 - School Database
-- =========================================


-- =========================================
-- Create Students Table
-- =========================================

CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE
);


-- =========================================
-- Create Courses Table
-- =========================================

CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    course_code VARCHAR(20) NOT NULL UNIQUE
);


-- =========================================
-- Create Enrolments Table
-- =========================================

CREATE TABLE enrolments (
    enrolment_id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade VARCHAR(5),

    FOREIGN KEY (student_id)
        REFERENCES students(student_id),

    FOREIGN KEY (course_id)
        REFERENCES courses(course_id),

    UNIQUE (student_id, course_id)
);


-- =========================================
-- Insert Students
-- =========================================

INSERT INTO students (
    student_id,
    name,
    email
)
VALUES
    (1, 'Alice Kamau', 'alice@example.com'),
    (2, 'Brian Otieno', 'brian@example.com'),
    (3, 'Carol Wanjiku', 'carol@example.com'),
    (4, 'David Mwangi', 'david@example.com');


-- =========================================
-- Insert Courses
-- =========================================

INSERT INTO courses (
    course_id,
    course_name,
    course_code
)
VALUES
    (1, 'Database Systems', 'DB101'),
    (2, 'Web Development', 'WEB101'),
    (3, 'Cybersecurity', 'CYB101');


-- =========================================
-- Insert Enrolments
-- =========================================

INSERT INTO enrolments (
    enrolment_id,
    student_id,
    course_id,
    grade
)
VALUES
    (1, 1, 1, 'A'),
    (2, 1, 2, 'B'),
    (3, 2, 1, 'B+'),
    (4, 2, 3, 'A'),
    (5, 3, 3, 'B');


-- =========================================
-- Query 1:
-- All Courses for One Student by Name
-- =========================================

SELECT courses.course_name,
       courses.course_code,
       enrolments.grade
FROM students
JOIN enrolments
    ON students.student_id = enrolments.student_id
JOIN courses
    ON enrolments.course_id = courses.course_id
WHERE students.name = 'Alice Kamau';


-- =========================================
-- Query 2:
-- All Students on One Course
-- =========================================

SELECT students.name,
       students.email,
       enrolments.grade
FROM courses
JOIN enrolments
    ON courses.course_id = enrolments.course_id
JOIN students
    ON enrolments.student_id = students.student_id
WHERE courses.course_name = 'Cybersecurity';


-- =========================================
-- Query 3:
-- Number of Students per Course
-- =========================================

SELECT courses.course_name,
       COUNT(enrolments.student_id) AS student_count
FROM courses
LEFT JOIN enrolments
    ON courses.course_id = enrolments.course_id
GROUP BY courses.course_id,
         courses.course_name;


-- =========================================
-- Query 4:
-- Students With No Enrolments
-- =========================================

SELECT students.name,
       students.email
FROM students
LEFT JOIN enrolments
    ON students.student_id = enrolments.student_id
WHERE enrolments.enrolment_id IS NULL;


-- =========================================
-- Query 5:
-- Update One Enrolment's Grade
-- =========================================

UPDATE enrolments
SET grade = 'A'
WHERE student_id = 1
  AND course_id = 2;