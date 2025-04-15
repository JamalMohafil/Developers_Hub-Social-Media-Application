import { BookOpen, Code, Github, Zap } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

type Props = {}
const FooterLink = ({
    href,
    children,
  }: {
    href: string;
    children: any;
  }) => (
    <li>
      <Link
        href={href}
        className="text-muted-foreground hover:text-primary transition-colors"
      >
        {children}
      </Link>
    </li>
  );
const Footer = (props: Props) => {
  return (
    <footer className="bg-background py-10 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Code className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold">Developers Hub</span>
            </div>
            <p className="text-muted-foreground mb-4">
              A community platform for developers to connect, collaborate, and
              grow together.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary"
                aria-label="Discord"
              >
                <Zap className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary"
                aria-label="Documentation"
              >
                <BookOpen className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* روابط التذييل - منظمة لتجنب التكرار */}
          <div>
            <h3 className="font-medium mb-4">Platform</h3>
            <ul className="space-y-2">
              <FooterLink href="#">Features</FooterLink>
              <FooterLink href="#">Groups</FooterLink>
              <FooterLink href="#">Projects</FooterLink>
              <FooterLink href="#">Q&A Forum</FooterLink>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              <FooterLink href="#">Documentation</FooterLink>
              <FooterLink href="#">Tutorials</FooterLink>
              <FooterLink href="#">Blog</FooterLink>
              <FooterLink href="#">Events</FooterLink>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4">Company</h3>
            <ul className="space-y-2">
              <FooterLink href="#">About</FooterLink>
              <FooterLink href="#">Careers</FooterLink>
              <FooterLink href="#">Privacy</FooterLink>
              <FooterLink href="#">Terms</FooterLink>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {new Date().getFullYear()} Developers Hub. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer