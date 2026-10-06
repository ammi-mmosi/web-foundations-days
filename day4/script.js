// 1. Select the elements
const noteText = document.querySelector("#note-text");
const charCount = document.querySelector("#char-count");
const wordCount = document.querySelector("#word-count");
const clearBtn = document.querySelector("#clear-btn");
const themeToggle = document.querySelector("#theme-toggle");


// 2. Update character and word counts
function updateCounts() {
  const text = noteText.value;

  // Character count
  const characters = text.length;

  charCount.textContent =
    `${characters} / 200 characters`;

  // Word count
  let words = 0;

  if (text.trim() !== "") {
    words = text.trim().split(/\s+/).length;
  }

  wordCount.textContent = `${words} words`;

  // Remove old warning classes
  charCount.classList.remove("warning", "over");

  // Add the correct warning class
  if (characters > 200) {
    charCount.classList.add("over");
  } else if (characters > 180) {
    charCount.classList.add("warning");
  }
}


// 3. Save draft and update counts on every input
noteText.addEventListener("input", function () {
  updateCounts();

  localStorage.setItem("draft", noteText.value);
});


// 4. Clear the note
function clearNote() {
  noteText.value = "";

  localStorage.removeItem("draft");

  updateCounts();
}


// Clear button
clearBtn.addEventListener("click", clearNote);


// 5. Clear when Escape is pressed inside textarea
noteText.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    clearNote();
  }
});


// 6. Toggle dark/light theme
themeToggle.addEventListener("click", function () {
  document.body.classList.toggle("dark");

  const isDark =
    document.body.classList.contains("dark");

  if (isDark) {
    themeToggle.textContent = "Light mode";
    localStorage.setItem("theme", "dark");
  } else {
    themeToggle.textContent = "Dark mode";
    localStorage.setItem("theme", "light");
  }
});


// 7. Restore saved draft when page loads
const savedDraft = localStorage.getItem("draft");

if (savedDraft !== null) {
  noteText.value = savedDraft;
}


// Restore saved theme
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "Light mode";
} else {
  document.body.classList.remove("dark");
  themeToggle.textContent = "Dark mode";
}


// Set the correct counts when the page first loads
updateCounts();
