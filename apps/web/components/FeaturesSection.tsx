import { Code, MessageSquare, Share2, Users } from "lucide-react";
import React from "react";

type Props = {};

const FeaturesSection = (props: Props) => {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Developer Groups",
      description:
        "Join specialized groups based on technologies, interests, or career goals.",
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: "Q&A Forums",
      description:
        "Get answers to your coding questions from experienced developers.",
    },
    {
      icon: <Share2 className="h-8 w-8 text-primary" />,
      title: "Project Showcase",
      description: "Share your projects and get feedback from the community.",
    },
    {
      icon: <Code className="h-8 w-8 text-primary" />,
      title: "Code Snippets",
      description: "Discover and share useful code snippets and solutions.",
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Everything You Need to Grow as a Developer
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform provides all the tools and resources you need to
            connect with other developers, share your work, and level up your
            skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
