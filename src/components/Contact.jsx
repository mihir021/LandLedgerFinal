import React, { useState } from 'react';
import { Send, Mail, Code, CheckCircle, MessageSquare } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import { Doodle, SectionDoodleContainer } from './Doodle';

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FFD400', '#0099FF', '#FF4D5E', '#3FCB6B']
    });
  };

  const socialLinks = [
    {
      name: 'GitHub',
      handle: 'github.com/mihir021',
      url: 'https://github.com/mihir021',
      color: 'bg-[#111111]',
      textColor: 'text-white',
      icon: <FaGithub className="w-6 h-6" />
    },
    {
      name: 'LeetCode',
      handle: 'leetcode.com/u/rathod_mihir',
      url: 'https://leetcode.com/u/rathod_mihir/',
      color: 'bg-[#FF8500]',
      textColor: 'text-white',
      icon: <Code className="w-6 h-6 stroke-[2.5]" />
    },
    {
      name: 'LinkedIn',
      handle: 'Mihir Rathod',
      url: 'https://linkedin.com/in/mihir-rathod-',
      color: 'bg-[#0099FF]',
      textColor: 'text-white',
      icon: <FaLinkedin className="w-6 h-6" />
    },
    {
      name: 'Direct Email',
      handle: 'mihir.rathod021@gmail.com',
      url: 'mailto:mihir.rathod021@gmail.com',
      color: 'bg-[#FFD400]',
      textColor: 'text-[#111111]',
      icon: <Mail className="w-6 h-6 stroke-[2.5]" />
    }
  ];

  return (
    <section id="contact" className="py-20 px-4 bg-[#FFF8E7] relative halftone-pattern border-t-4 border-black">
      <SectionDoodleContainer>
        <Doodle type="star" top="8%" right="6%" size="w-8 h-8" color="text-[#FFD400]" rotate="-rotate-12" floatDelay={0.4} hideOnMobile={false} />
        <Doodle type="lightning" bottom="10%" left="5%" size="w-8 h-12" color="text-[#FF4D5E]" rotate="rotate-12" floatDelay={0.9} hideOnMobile={true} />
      </SectionDoodleContainer>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Title Header */}
        <div className="text-center mb-16 relative">
          <div className="inline-block px-4 py-1.5 bg-[#FF4D5E] text-white font-comic text-xl rounded-xl border-3.5 border-black shadow-[4px_4px_0px_#111] transform -rotate-2 mb-3">
            LET'S TEAM UP 🤝
          </div>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-comic text-[#111111] tracking-wide">
            GET IN TOUCH!
          </h2>
          <p className="text-base font-bold text-gray-700 max-w-xl mx-auto mt-2">
            Have a project, SaaS collaboration, or full-stack opportunity? Drop a message or hit me up on socials.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact Form Speech Bubble Card */}
          <div className="lg:col-span-7 comic-card bg-white p-8 rounded-3xl relative border-3.5 border-[#111111] shadow-[6px_6px_0px_#111]">
            <h3 className="font-comic text-3xl text-[#111111] mb-6 flex items-center gap-2">
              <span>SEND A TRANSMISSION</span>
              <MessageSquare className="w-7 h-7 text-[#0099FF] fill-[#0099FF]" />
            </h3>

            {submitted ? (
              <div className="p-6 bg-[#3FCB6B] text-[#111111] border-3.5 border-black rounded-2xl shadow-[4px_4px_0px_#111] text-center font-bold space-y-2">
                <CheckCircle className="w-12 h-12 mx-auto stroke-[3] text-white" />
                <h4 className="font-comic text-3xl text-white">MESSAGE RECEIVED! POW! 💥</h4>
                <p className="text-sm text-white font-bold">Thanks for reaching out. I'll get back to you ASAP!</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-4 py-2 bg-white text-[#111111] font-comic text-lg rounded-xl border-3 border-black shadow-[3px_3px_0px_#111]"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-comic text-lg text-[#111111] mb-1">YOUR NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="Peter Parker"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FFF8E7] border-3 border-black rounded-xl font-bold focus:outline-none focus:bg-white" style={{ transition: 'background-color 80ms ease' }}
                  />
                </div>

                <div>
                  <label className="block font-comic text-lg text-[#111111] mb-1">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    required
                    placeholder="peter@dailybugle.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FFF8E7] border-3 border-black rounded-xl font-bold focus:outline-none focus:bg-white" style={{ transition: 'background-color 80ms ease' }}
                  />
                </div>

                <div>
                  <label className="block font-comic text-lg text-[#111111] mb-1">MESSAGE / IDEA</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Hey Mihir, let's talk about building our next app..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FFF8E7] border-3 border-black rounded-xl font-bold focus:outline-none focus:bg-white" style={{ transition: 'background-color 80ms ease' }}
                  />
                </div>

                <button
                  type="submit"
                  className="comic-button w-full py-4 bg-[#FFD400] text-[#111111] font-comic text-2xl rounded-xl font-black border-3.5 border-black shadow-[6px_6px_0px_#111] hover:bg-[#ffe140] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0px_#111]"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>TRANSMIT MESSAGE</span>
                    <Send className="w-6 h-6 stroke-[3]" />
                  </span>
                </button>
              </form>
            )}
          </div>

          {/* Social Badges Column matching Hero button & stat card shell */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-comic text-2xl text-[#111111] px-2">
              CONNECT ON SOCIALS ⚡
            </h3>

            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="comic-card flex items-center justify-between p-4 bg-white rounded-2xl border-3.5 border-[#111111] shadow-[6px_6px_0px_#111] group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 ${social.color} ${social.textColor} rounded-xl border-2.5 border-black shadow-[2px_2px_0px_#111]`}>
                    {social.icon}
                  </div>
                  <div>
                    <span className="font-comic text-xl text-[#111111] block group-hover:text-[#0099FF] transition-colors">{social.name}</span>
                    <span className="text-xs font-bold text-gray-500">{social.handle}</span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-[#FFD400] text-[#111111] font-comic text-xs rounded-lg border-2 border-black shadow-[2px_2px_0px_#111]">
                  CONNECT ➔
                </span>
              </a>
            ))}

            {/* Direct Mailto CTA Callout Box */}
            <div className="p-6 bg-[#0099FF] text-white border-3.5 border-black shadow-[6px_6px_0px_#111] rounded-2xl transform rotate-1">
              <h4 className="font-comic text-2xl text-white mb-1">PREFER DIRECT EMAIL?</h4>
              <p className="text-sm font-bold text-sky-100 mb-3">Reach Mihir directly in your email client.</p>
              <a
                href="mailto:mihir.rathod021@gmail.com"
                className="comic-button inline-block px-4 py-2.5 bg-[#FFD400] text-[#111111] font-comic text-lg rounded-xl border-3 border-black shadow-[4px_4px_0px_#111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#111]"
              >
                mihir.rathod021@gmail.com ✉️
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
