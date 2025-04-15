import React from "react";

type Props = {};

const AnalayticsSection = (props: Props) => {
  const stats = [
    { value: "2,000+", label: "Active Developers" },
    { value: "500+", label: "Projects Shared" },
    { value: "10,000+", label: "Questions Answered" },
    { value: "50+", label: "Tech Groups" },
  ];

  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnalayticsSection;
