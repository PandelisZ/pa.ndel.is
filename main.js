
const nameNode = document.querySelector('.blade--left > h1')
const subtitleNode = document.querySelector('.blade--right > h1')
const profileHeaderText = document.querySelector('#profile > h1')
const projectsHeaderText = document.querySelector('#projects > h1')
const visitorNameNodes = document.querySelectorAll(".visitorName")
const getInTouch = document.querySelector("#social > h1")

const mastheadScroller = function(scrollPosition) {

    nameNode.style = `transform: translateX(-${scrollPosition*7}px)`
    subtitleNode.style = `transform: translateX(${scrollPosition*2}px)`

    profileHeaderText.style = `transform: translateX(-${scrollPosition*1.2}px)`
    projectsHeaderText.style = `transform: translateX(-${scrollPosition*1.2}px)`
    getInTouch.style = `transform: translateX(-${scrollPosition*2}px)`

}

let ticking = false;
window.addEventListener('scroll', function(e) {
    last_known_scroll_position = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(function() {
        mastheadScroller(last_known_scroll_position);
        ticking = false;
      });

      ticking = true;
    }
  });


const visitorName = function(event) {

  let name = event.target.innerHTML
  name = name.replace('}', '').replace('{', '')

  sessionStorage.setItem('visitorName', name)

  // visitorNameNodes.forEach(n => n.innerHTML = name)
}

visitorNameNodes.forEach(div => {
    const setVisitorName = sessionStorage.getItem('visitorName')
    if (typeof setVisitorName === 'string' && setVisitorName != 'undefined' && setVisitorName != '') {
      div.innerHTML = setVisitorName
    }
    div.addEventListener("blur", visitorName);
    div.addEventListener("keyup", visitorName);
    div.addEventListener("paste", visitorName);
    div.addEventListener("copy", visitorName);
    div.addEventListener("cut", visitorName);
    div.addEventListener("delete", visitorName);
    div.addEventListener("mouseup", visitorName);
})

