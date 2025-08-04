export default function VideoBackground() {
  return (
    <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
      <iframe
        className="w-full h-full"
        src="https://www.youtube.com/embed/ruX4Le0kBng?autoplay=1&mute=1&loop=1&playlist=ruX4Le0kBng&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&vq=hd1080"
       
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="Gym Motivation Background Video"
      />
    </div>
  );
}
