export function Hero() {
  return (
    <div className="relative w-full overflow-hidden bg-black mx-auto max-w-4xl">
      <video
        className="block w-full h-auto"
        src="/hero.mp4"
        poster="/hero-poster.jpg"
        autoPlay
        muted
        playsInline
        preload="auto"
      />
    </div>
  );
}
