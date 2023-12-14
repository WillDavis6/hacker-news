"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

const $favoriteStory = $('.star-images');

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      <a class='star-image unfavorite-image'>
      </a>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function getDeleteBtnHTML() {
  return `
<span class="trash-can">
<i class="fav fa-trash-alt"></i>
</span>`;
}

function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fav" : "unfav";
  return `
  <span class="star">
  <i class="${starType} fa-star"></i>
  </span>`;
}
/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function deleteStory(evt) {
  console.debug("deleteStory");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, stroyId);

  await putUserStoriesOnPage();
}

$ownStories.on("click", ".trash-can", deleteStory);

async function submitNewStory(evt) {
  console.debug("submitNewStory");
  evt.preventDefault();

  // grab all info from form
  const title = $("#story-title").val();
  const url = $("#story-url").val();
  const author = $("#story-author").val();
  const username = currentUser.username
  const storyData = { title, url, author, username };

  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  // hide the form and reset it
  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}

$submitForm.on("submit", submitNewStory);

// async function newStoriesSubmission(e) {

//   e.preventDefault();
//   console.debug("newStoriesSubmission");
//   const author = $("story-author").val();
//   const title = $("story-title").val();
//   const url = $("story-url").val();
//   const username = currentUser.username;
//   const storyData = { title, url, author, username };
  
//   const story = await storyList.addStory(currentUser, storyData);
//   const $story = generateStoryMarkup(story);
//   $allStoriesList.prepend($story);

//   $submitForm.slideUp("slow");
//   $submitForm.trigger("reset");
// }

// $submitForm.on("submit", newStoriesSubmission);


function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $ownStories.empty();

  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }

  $ownStories.show();
}



function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorties added! </h5>")
  }
  else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }
  $favoritedStories.show();
}




async function favoriteStoryToggle(e) {
  e.preventDefault();
  console.debug("favoriteStory");

  const $target = $(e.target);
  const $closestLi = $target.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId)

  if ($target.hasClass('fav')) {
    await currentUser.removeFavorite(story);
    $target.closest("i").toggleClass("fav unfav");
  } else {
    await currentUser.addFavorite(story);
    $target.closest("i").toggleClass("unfav fav");
  }


    e.target.remove('.unfavorite-image').add('.favoite-image');

}



$favoriteStory.on("click", ".star-images", favoriteStoryToggle);

