// Starting data
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];


// 1. searchNotes
function searchNotes(word) {
  return notes.filter((note) =>
    note.text.toLowerCase().includes(word.toLowerCase())
  );
}


// 2. longestNote
function longestNote() {
  if (notes.length === 0) {
    return null;
  }

  let longest = notes[0];

  for (const note of notes) {
    if (note.text.length > longest.text.length) {
      longest = note;
    }
  }

  return longest;
}


// 3. countByCategory
function countByCategory() {
  const counts = {};

  for (const note of notes) {
    if (counts[note.category]) {
      counts[note.category]++;
    } else {
      counts[note.category] = 1;
    }
  }

  return counts;
}


// 4. getSummary
function getSummary() {
  const counts = countByCategory();
  const noteWord = notes.length === 1 ? "note" : "notes";

  return `${notes.length} ${noteWord}: ${counts.personal || 0} personal, ${counts.work || 0} work, ${counts.study || 0} study.`;
}


// 5. isDuplicate
function isDuplicate(text) {
  const cleanText = text.trim().toLowerCase();

  return notes.some(
    (note) => note.text.trim().toLowerCase() === cleanText
  );
}


// 6. addNote
function addNote(text, category) {
  const cleanText = text.trim();
  const validCategories = ["personal", "work", "study"];

  // Check text length
  if (cleanText.length < 1 || cleanText.length > 200) {
    console.log("Cannot add note: text must be 1-200 characters.");
    return false;
  }

  // Check category
  if (!validCategories.includes(category)) {
    console.log("Cannot add note: invalid category.");
    return false;
  }

  // Check for duplicate
  if (isDuplicate(cleanText)) {
    console.log("Cannot add note: duplicate note.");
    return false;
  }

  // Add the note
  notes.push({
    id: notes.length + 1,
    text: cleanText,
    category: category,
  });

  return true;
}


// ==========================================
// TESTS
// ==========================================


// searchNotes tests

console.log(searchNotes("JavaScript"));
// Expected: [{ id: 4, text: "Revise JavaScript arrays", category: "study" }]

console.log(searchNotes("Python"));
// Expected: []


// longestNote tests

console.log(longestNote());
// Expected: { id: 3, text: "Email the project report to Grace", category: "work" }

let savedNotes = notes;
notes = [];

console.log(longestNote());
// Expected: null

notes = savedNotes;


// countByCategory tests

console.log(countByCategory());
// Expected: { personal: 2, study: 2, work: 1 }

savedNotes = notes;
notes = [];

console.log(countByCategory());
// Expected: {}

notes = savedNotes;


// getSummary tests

console.log(getSummary());
// Expected: "5 notes: 2 personal, 1 work, 2 study."

savedNotes = notes;
notes = [
  { id: 1, text: "Buy milk", category: "personal" }
];

console.log(getSummary());
// Expected: "1 note: 1 personal, 0 work, 0 study."

notes = savedNotes;


// isDuplicate tests

console.log(isDuplicate("Buy milk and bread"));
// Expected: true

console.log(isDuplicate("  BUY MILK AND BREAD  "));
// Expected: true

console.log(isDuplicate("Go to the gym"));
// Expected: false


// addNote tests

console.log(addNote("Practice JavaScript", "study"));
// Expected: true

console.log(addNote("Buy milk and bread", "personal"));
// Expected: "Cannot add note: duplicate note." then false

console.log(addNote("", "personal"));
// Expected: "Cannot add note: text must be 1-200 characters." then false

console.log(addNote("Clean the house", "home"));
// Expected: "Cannot add note: invalid category." then false