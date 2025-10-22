const steps = [
  {
    title: "Connect",
    description: "Link your Web3 wallet",
  },
  {
    title: "Submit",
    description: "Submit encrypted benefit claims",
  },
  {
    title: "Verify",
    description: "Automated on-chain verification",
  },
  {
    title: "Receive",
    description: "Get benefits instantly",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-32 px-4 bg-muted/20">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            How It Works
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-accent/50 to-primary/50 hidden md:block" />

          <div className="space-y-16">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className={`flex items-center gap-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} text-center md:text-inherit`}>
                    <h3 className="text-3xl font-bold mb-3">{step.title}</h3>
                    <p className="text-xl text-muted-foreground">{step.description}</p>
                  </div>

                  <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg hidden md:flex">
                    {index + 1}
                  </div>

                  <div className="flex-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
