//DOM Elements
const mealsContainer = document.getElementById("meals");
const favMeals = document.getElementById("fav-meals");
const favBtn = document.getElementById("favourite");
const searchBtn = document.getElementById("search");
const searchTerm = document.getElementById("search-term");
const recipePopup = document.getElementById("recipe-popup");
const popupCloseBtn = document.getElementById("close-popup");
const mealInfoContainer = document.getElementById("meal-info");

const getRandomMeal = async () => {
  const randomMeal = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  )
    .then((response) => response.json())
    .then((data) => data.meals[0]);

  addMeal(randomMeal, true);
};
getRandomMeal();

const getMealById = async (id) => {
  const meal = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  )
    .then((response) => response.json())
    .then((data) => data.meals[0]);

  return meal;
};

const getMealsBySearch = async (name) => {
  const meals = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + name
  )
    .then((response) => response.json())
    .then((data) => data.meals);

  return meals;
};

const addMeal = (mealData, random = false) => {
  const meal = document.createElement("div");
  meal.classList.add("meal");

  meal.innerHTML = `
  <div class="meal-header">
   ${
     random
       ? `
       <span id="random" class="random">
         Random Meal
       </span>`
       : ""
   }
    <img
      id="randomMealImg"
      src="${mealData.strMealThumb}"
      alt="${mealData.strMeal}"
    />
  </div>
  <div class="meal-body">
    <h3 id="randomMealTitle">${mealData.strMeal}</h3>
    <button class="fav-btn" id="favourite" ">
      <i class="fa-solid fa-heart"></i>
    </button>
  </div>
  `;

  const btn = meal.querySelector(".meal-body .fav-btn");
  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) {
      removeMealLS(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      addMealLS(mealData.idMeal);
      btn.classList.add("active");
    }

    fetchFavMeals();
  });

  const popupBtn = meal.querySelector(".meal-header");

  popupBtn.addEventListener("click", () => {
    showRecipeInfo(mealData);
  });

  mealsContainer.appendChild(meal);
};

const addMealLS = (mealId) => {
  const mealIds = getMealsLS();

  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
};

const removeMealLS = (mealId) => {
  const mealIds = getMealsLS();
  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
};

const getMealsLS = () => {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
};

const fetchFavMeals = async () => {
  favMeals.innerHTML = "";
  const mealIds = getMealsLS();

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    let meal = await getMealById(mealId);
    addFavMeal(meal);
  }
};
fetchFavMeals();
const addFavMeal = (mealData) => {
  const favMeal = document.createElement("li");
  favMeal.innerHTML = `
  <li>
  <div class="fav-meal-header">
  <img
    src="${mealData.strMealThumb}"
    alt="${mealData.strMeal}"
  /><span>${mealData.strMeal}</span>
  </div>
  <button class="clear"><i class="fa-solid fa-circle-xmark"></i></button>
</li>
    `;

  const btn = favMeal.querySelector(".clear");

  btn.addEventListener("click", () => {
    removeMealLS(mealData.idMeal);
    fetchFavMeals();
  });

  favMeals.appendChild(favMeal);

  const popupBtn = favMeal.querySelector(".fav-meal-header");

  popupBtn.addEventListener("click", () => {
    showRecipeInfo(mealData);
  });
};

searchBtn.addEventListener("click", async () => {
  //Clean container before displaying search results
  mealsContainer.innerHTML = " ";
  const name = searchTerm.value;

  const meals = await getMealsBySearch(name);

  if (meals && name !== "") {
    meals.forEach((meal) => {
      addMeal(meal);
    });
  }
});

popupCloseBtn.addEventListener("click", () => {
  recipePopup.classList.add("hidden");
});

const showRecipeInfo = (mealData) => {
  //Clear existing recipe data
  mealInfoContainer.innerHTML = "";

  //Update Recipe Data
  const recipe = document.createElement("div");

  const ingredients = [];

  //Get ingredients and measures

  for (let i = 1; i <= 20; i++) {
    if (mealData["strIngredient" + i]) {
      ingredients.push(
        `${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`
      );
    } else {
      break;
    }
  }

  recipe.innerHTML = `
  <h1>${mealData.strMeal}</h1>
          <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
          />
          <h3>Directions: </h3>
          <p>
           ${mealData.strInstructions}
          </p>
          <h3>Ingredients: </h3>
          <ul>
            ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
          </ul>
  `;

  mealInfoContainer.appendChild(recipe);

  //show recipe popup
  recipePopup.classList.remove("hidden");
};
