document.getElementById("workout-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const reps = document.getElementById("reps").value;
    const sets = document.getElementById("sets").value;
    const category = document.getElementById("category").value;

    console.log('Form Data:', { name, reps, sets, category });

    console.log("Category selected:", category);

    try {
        const response = await fetch("/add-workout", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                "name": name,
                "reps": reps,
                "sets": sets,
                "category": category,
            }),
        });

        const data = await response.json();
        console.log('Response:', data);

        // Fetch updated workouts
        const workoutsResponse = await fetch("/get-workouts");
        const workouts = await workoutsResponse.json();
        updateWorkoutList(workouts);
    } catch (error) {
        console.error("Error:", error);
    }
});

// Fetch and display workouts
async function fetchWorkouts() {
    try {
        const response = await fetch("/get-workouts");
        const workouts = await response.json();
        updateWorkoutList(workouts);
    } catch (error) {
        console.error("Error fetching workouts:", error);
    }
}

function updateWorkoutList(workouts) {
    const list = document.getElementById("workout-list");
    list.innerHTML = '';

    if (workouts.length === 0) {
        list.innerHTML = '<li>No workouts found</li>';
    } else {
        workouts.forEach(workout => {
            const li = document.createElement("li");

            const category = document.createElement("div");
            category.classList.add("workout-category");
            category.textContent = `Category: ${workout[2]}`;

            const name = document.createElement("div");
            name.classList.add("workout-name");
            name.textContent = `${workout[1]}`;

            const sets = document.createElement("div");
            sets.classList.add("workout-sets");
            sets.textContent = `Sets: ${workout[3]}`;

            const reps = document.createElement("div");
            reps.classList.add("workout-reps");
            reps.textContent = `Reps: ${workout[4]}`;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.classList.add("delete-btn");
            deleteBtn.addEventListener("click", async function () {
                try {
                    const response = await fetch(`/delete-workout/${workout[0]}`, { method: "DELETE" });
                    const data = await response.json();
                    console.log(data.message);
                    const updatedWorkoutsResponse = await fetch("/get-workouts");
                    const updatedWorkouts = await updatedWorkoutsResponse.json();
                    updateWorkoutList(updatedWorkouts);
                } catch (error) {
                    console.error("Error:", error);
                }
            });

            li.appendChild(category);
            li.appendChild(name);
            li.appendChild(sets);
            li.appendChild(reps);
            li.appendChild(deleteBtn);

            list.appendChild(li);
        });
    }
}

// Handle export workouts button
document.getElementById("export-btn").addEventListener("click", function () {
    window.location.href = "/export-workouts";
});

// Handle clear workouts button
document.getElementById("clear-btn").addEventListener("click", async function () {
    try {
        const response = await fetch("/clear-workouts", { method: "POST" });
        const data = await response.json();
        console.log(data.message);

        updateWorkoutList([]);
    } catch (error) {
        console.error("Error clearing workouts:", error);
    }
});

fetchWorkouts();

function calculateBMIAndCalories() {
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const activityLevel = document.getElementById('activity-level').value;

    if (isNaN(weight) || isNaN(height) || isNaN(age)) {
        alert('Please fill in all the fields correctly!');
        return;
    }

    // BMI Calculation (using pounds and inches)
    const bmi = (weight / (height * height)) * 703;  // Multiply by 703 for pounds and inches
    document.getElementById('bmi').textContent = bmi.toFixed(2);

    // Daily Calorie Calculation (Harris-Benedict Equation)
    let bmr;
    if (gender === 'male') {
        bmr = 66 + (6.23 * weight) + (12.7 * height) - (6.8 * age);  // Formula for males
    } else {
        bmr = 655 + (4.35 * weight) + (4.7 * height) - (4.7 * age);  // Formula for females
    }

    let calorieMultiplier;
    switch (activityLevel) {
        case 'sedentary':
            calorieMultiplier = 1.2;
            break;
        case 'light':
            calorieMultiplier = 1.375;
            break;
        case 'moderate':
            calorieMultiplier = 1.55;
            break;
        case 'active':
            calorieMultiplier = 1.725;
            break;
        case 'very-active':
            calorieMultiplier = 1.9;
            break;
    }

    const dailyCalories = (bmr * calorieMultiplier).toFixed(0);
    document.getElementById('calories').textContent = dailyCalories;
}

// JavaScript for scrolling and video navigation
document.addEventListener("DOMContentLoaded", function() {
    const videos = document.querySelectorAll('.video-container');
    let currentVideoIndex = 0;

    // Show the first video on page load
    videos[currentVideoIndex].style.display = 'block';

    // Scroll to the next video when right arrow is clicked
    document.querySelectorAll('.scroll-right').forEach(button => {
        button.addEventListener('click', function() {
            // Hide current video
            videos[currentVideoIndex].style.display = 'none';

            // Increment index to show the next video
            currentVideoIndex = (currentVideoIndex + 1) % videos.length;

            // Show the next video
            videos[currentVideoIndex].style.display = 'block';
        });
    });

    // Scroll to the previous video when left arrow is clicked
    document.querySelectorAll('.scroll-left').forEach(button => {
        button.addEventListener('click', function() {
            // Hide current video
            videos[currentVideoIndex].style.display = 'none';

            // Decrement index to show the previous video
            currentVideoIndex = (currentVideoIndex - 1 + videos.length) % videos.length;

            // Show the previous video
            videos[currentVideoIndex].style.display = 'block';
        });
    });
});


