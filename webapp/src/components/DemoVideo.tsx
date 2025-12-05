const DemoVideo = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            See It In Action
          </h2>
          <p className="text-xl text-muted-foreground">
            Watch how CipherCare protects your benefits data with FHE
          </p>
        </div>

        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
          <video
            className="w-full"
            controls
            preload="metadata"
          >
            <source src="/demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
};

export default DemoVideo;
