# School Database Design

The idea behind this database is pretty simple: we have students, we have courses, and naturally, students need to enrol in those courses. The interesting part is keeping track of who is taking what without turning the database into a spreadsheet from hell.

For this design, I split the data into three tables: `students`, `courses`, and `enrolments`.

## Students Table

The `students` table is where the basic student information lives.

Each student has:

- A `student_id`
- A name
- An email address

The `student_id` is the primary key, so every student has their own unique identifier.

I also made the email `UNIQUE` because two students sharing the same email would make things unnecessarily confusing. There are enough problems in software already.

The name and email are also `NOT NULL` because a student record without a name or email would not be particularly useful.

## Courses Table

The `courses` table keeps track of the courses offered by the school.

Each course has:

- A `course_id`
- A course name
- A course code

The `course_id` is the primary key.

I also made the course code unique. If `DB101` refers to Database Systems, having another completely different course also called `DB101` is probably a good way to ruin someone's semester.

## Enrolments Table

The `enrolments` table is where the students and courses finally meet.

It contains:

- An `enrolment_id`
- A `student_id`
- A `course_id`
- A grade

The `student_id` points back to the `students` table, while the `course_id` points to the `courses` table using foreign keys.

The grade belongs here instead of inside the student or course table because a grade only makes sense in the context of a particular student taking a particular course.

I also added:

`UNIQUE (student_id, course_id)`

This prevents a student from enrolling in the same course twice. One Database Systems class should be enough suffering for one semester.

## Relationships

A student can have several enrolments, so the relationship between `students` and `enrolments` is **one-to-many**.

For example, Alice could be enrolled in Database Systems, Web Development and Cybersecurity. They are all different enrolment records, but they belong to the same student.

The same applies on the other side. A course can have many enrolments because many students can take the same course. This makes the relationship between `courses` and `enrolments` another **one-to-many** relationship.

Put the two together and students and courses have a **many-to-many** relationship:

- One student can take many courses.
- One course can have many students.

This is why the `enrolments` join table is necessary.

Trying to store a list of courses directly inside a student record might look easier at first, but querying and updating that data would quickly become painful. The join table keeps everything organised and also gives us somewhere sensible to store the grade.

## Index

One index I would add is:

`CREATE INDEX idx_enrolments_course_id ON enrolments(course_id);`

A common query in this system would probably be something like, "Show me everyone taking Cybersecurity."

That query needs to search the `enrolments` table using `course_id`. An index on that column helps the database find those records faster instead of checking every enrolment one by one.

With five enrolments, nobody will notice the difference. With 500,000 enrolments, the database might start sending passive-aggressive emails.

## SQL or NoSQL?

For this system, I would go with **SQL**.

The main reason is that the data is highly relational. Students are connected to courses through enrolments, and those relationships actually matter. I want the database to enforce things like valid foreign keys, unique emails and preventing duplicate enrolments instead of relying entirely on the application to behave itself.

SQL also makes queries such as "Which courses is Alice taking?", "Who is taking Cybersecurity?" and "How many students are in each course?" fairly straightforward using `JOIN`, `GROUP BY` and other relational features.

NoSQL definitely has situations where it makes sense, especially when the data structure is flexible or changes frequently. This just isn't one of them.

The structure here is predictable, the relationships are important, and consistency matters. SQL fits the job nicely — no need to bring a chainsaw when a screwdriver will do.