// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Function to animate the title
function animateTitle() {
  const title = document.querySelectorAll('.title');

  title.forEach((current) => {
    gsap.fromTo(
      current,
      { y: '100px' },
      { y: 0, duration: 1 }
    );

    gsap.fromTo(
      current,
      { opacity: 0 },
      { opacity: 1, duration: 5 }
    );
  });
}

// Function to bind the animation to ScrollTrigger
function bindAnimationToScrollTrigger() {
  ScrollTrigger.batch(".title", {
    onEnter: animateTitle, // Trigger the animation when the element enters the viewport
    start: "bottom 80%", // Adjust the start position as needed
    end: "bottom 20%", // Adjust the end position as needed
    once: true // Play the animation only once
  });
}

// Call the function to bind the animation to ScrollTrigger
bindAnimationToScrollTrigger();