import React from 'react';
import { useLenis } from './hooks/useLenis';
import { ComicCursor } from './components/ComicCursor';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { ProjectsGrid } from './components/ProjectsGrid';
import { Timeline } from './components/Timeline';
import { Certificates } from './components/Certificates';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export default function App() {
  // Initialize Lenis Smooth Scroll
  useLenis();

  return (
    <div className="relative min-h-screen bg-[#FFF8E7] text-[#111111] font-sans selection:bg-[#FFD400] selection:text-[#111111]">
      <ComicCursor />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <ProjectsGrid />
        <Timeline />
        <Certificates />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
