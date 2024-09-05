let modal = document.getElementById("spareDeletingActionResultContainer");
let message = document.getElementById("spareDeletingActionResultMessage");
let span = document.getElementsByClassName("close")[0];

function showActionResult() {
  modal.style.display = "block";
}

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}