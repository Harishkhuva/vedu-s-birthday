import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Heart, Star, Sparkles, Moon, Cake, Gift, Candy as Candle } from 'lucide-react';
import dayjs from 'dayjs';

const BirthdayApp = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isBirthday, setIsBirthday] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [candleLit, setCandleLit] = useState(false);
  const canvasRef = useRef(null);
  const fireworksRef = useRef(null);
  const audioRef = useRef(null);

  // Birthday date: August 9, 2025
  const birthdayDate = dayjs('2025-08-08T00:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = dayjs();
      const difference = birthdayDate.diff(now);
      
      if (difference <= 0) {
        setIsBirthday(true);
        if (!showCelebration) {
          setTimeout(() => setShowCelebration(true), 1000);
        }
        clearInterval(timer);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [birthdayDate, showCelebration]);

  // Fireworks animation
  useEffect(() => {
    if (isBirthday && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const fireworks = [];
      const particles = [];

      class Firework {
        constructor(sx, sy, tx, ty) {
          this.x = sx;
          this.y = sy;
          this.sx = sx;
          this.sy = sy;
          this.tx = tx;
          this.ty = ty;
          this.distanceToTarget = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));
          this.distanceTraveled = 0;
          this.coordinates = [];
          this.coordinateCount = 3;
          while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
          }
          this.angle = Math.atan2(ty - sy, tx - sx);
          this.speed = 2;
          this.acceleration = 1.05;
          this.brightness = Math.random() * 50 + 50;
          this.targetRadius = 1;
          this.hue = Math.random() * 360;
        }

        update(index) {
          this.coordinates.pop();
          this.coordinates.unshift([this.x, this.y]);
          
          if (this.targetRadius < 8) {
            this.targetRadius += 0.3;
          } else {
            this.targetRadius = 1;
          }
          
          this.speed *= this.acceleration;
          
          const vx = Math.cos(this.angle) * this.speed;
          const vy = Math.sin(this.angle) * this.speed;
          this.distanceTraveled = Math.sqrt(Math.pow(this.x + vx - this.sx, 2) + Math.pow(this.y + vy - this.sy, 2));
          
          if (this.distanceTraveled >= this.distanceToTarget) {
            this.createParticles(this.tx, this.ty);
            fireworks.splice(index, 1);
          } else {
            this.x += vx;
            this.y += vy;
          }
        }

        draw() {
          if (!ctx) return;
          ctx.beginPath();
          ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
          ctx.lineTo(this.x, this.y);
          ctx.strokeStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
          ctx.stroke();
          
          ctx.beginPath();
          ctx.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        createParticles(x, y) {
          let particleCount = 30;
          while (particleCount--) {
            particles.push(new Particle(x, y));
          }
        }
      }

      class Particle {
        constructor(x, y) {
          this.x = x;
          this.y = y;
          this.coordinates = [];
          this.coordinateCount = 5;
          while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
          }
          this.angle = Math.random() * Math.PI * 2;
          this.speed = Math.random() * 10 + 1;
          this.friction = 0.95;
          this.gravity = 1;
          this.hue = Math.random() * 360;
          this.brightness = Math.random() * 80 + 50;
          this.alpha = 1;
          this.decay = Math.random() * 0.03 + 0.01;
        }

        update(index) {
          this.coordinates.pop();
          this.coordinates.unshift([this.x, this.y]);
          this.speed *= this.friction;
          this.x += Math.cos(this.angle) * this.speed;
          this.y += Math.sin(this.angle) * this.speed + this.gravity;
          this.alpha -= this.decay;
          
          if (this.alpha <= this.decay) {
            particles.splice(index, 1);
          }
        }

        draw() {
          if (!ctx) return;
          ctx.beginPath();
          ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
          ctx.lineTo(this.x, this.y);
          ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
          ctx.stroke();
        }
      }

      function loop() {
        if (!ctx) return;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter';
        
        let i = fireworks.length;
        while (i--) {
          fireworks[i].draw();
          fireworks[i].update(i);
        }
        
        let j = particles.length;
        while (j--) {
          particles[j].draw();
          particles[j].update(j);
        }
        
        if (Math.random() < 0.05) {
          fireworks.push(new Firework(
            canvas.width / 2,
            canvas.height,
            Math.random() * canvas.width,
            Math.random() * canvas.height / 2
          ));
        }
        
        fireworksRef.current = requestAnimationFrame(loop);
      }
      
      loop();
    }

    return () => {
      if (fireworksRef.current) {
        cancelAnimationFrame(fireworksRef.current);
      }
    };
  }, [isBirthday]);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.log('Audio play failed:', error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const lightCandle = () => {
    setCandleLit(true);
    setTimeout(() => setCandleLit(false), 5000);
  };

  const createFloatingElements = (count, Component, className) => {
    return Array.from({ length: count }, (_, i) => (
      <Component
        key={className + '-' + i}
        className={'absolute ' + className + ' animate-float opacity-60'}
        size={Math.random() * 20 + 12}
        style={{
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          animationDelay: Math.random() * 4 + 's',
          animationDuration: (3 + Math.random() * 3) + 's'
        }}
      />
    ));
  };

  if (!isBirthday) {
    // Countdown Page
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden relative">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          {createFloatingElements(20, Star, 'text-yellow-300 animate-twinkle')}
          {createFloatingElements(15, Moon, 'text-blue-200 animate-pulse')}
          {createFloatingElements(10, Cake, 'text-pink-300 animate-bounce')}
          {createFloatingElements(8, Gift, 'text-purple-300 animate-float')}
        </div>

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen text-center">
          <div className="animate-fadeInDown mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-great-vibes text-white mb-6 animate-glow">
              Countdown to Vedu's Special Day!
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-purple-200 font-poppins max-w-2xl mx-auto">
              The magic begins soon ✨
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="animate-fadeInUp mb-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="glass bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl hover-lift">
                <div className="text-4xl lg:text-5xl font-bold font-dancing text-white mb-2">
                  {timeLeft.days}
                </div>
                <div className="text-sm font-poppins text-purple-200">Days</div>
              </div>
              <div className="glass bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl hover-lift">
                <div className="text-4xl lg:text-5xl font-bold font-dancing text-white mb-2">
                  {timeLeft.hours}
                </div>
                <div className="text-sm font-poppins text-purple-200">Hours</div>
              </div>
              <div className="glass bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl hover-lift">
                <div className="text-4xl lg:text-5xl font-bold font-dancing text-white mb-2">
                  {timeLeft.minutes}
                </div>
                <div className="text-sm font-poppins text-purple-200">Minutes</div>
              </div>
              <div className="glass bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl hover-lift">
                <div className="text-4xl lg:text-5xl font-bold font-dancing text-white mb-2">
                  {timeLeft.seconds}
                </div>
                <div className="text-sm font-poppins text-purple-200">Seconds</div>
              </div>
            </div>
          </div>

          <div className="animate-fadeInUp">
            <p className="text-purple-300 font-poppins text-lg">
              Stay tuned for something special! 🎉
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Birthday Celebration Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-yellow-100 overflow-hidden relative">
      {/* Fireworks Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-20"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {createFloatingElements(30, Heart, 'text-pink-400')}
        {createFloatingElements(25, Star, 'text-yellow-400 animate-twinkle')}
        {createFloatingElements(20, Sparkles, 'text-purple-400 animate-pulse')}
      </div>

      {/* Confetti */}
      <div className="confetti-container">
        {Array.from({ length: 100 }, (_, i) => (
          <div
            key={i}
            className="confetti"
            style={{
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 4 + 's',
              animationDuration: (3 + Math.random() * 2) + 's',
              backgroundColor: ['#ff69b4', '#da70d6', '#ffd700', '#ff1493', '#9370db', '#ff6b6b', '#4ecdc4'][Math.floor(Math.random() * 7)]
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-30 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12 animate-celebration">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-great-vibes text-gradient mb-6 animate-bounce">
            🎂 Happy 21st Birthday Vedu! 🎉
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-purple-700 font-poppins max-w-3xl mx-auto leading-relaxed">
            You're more than just a friend — you're a treasure 💖
          </p>
        </header>

        {/* Music Player */}
        <div className="text-center mb-12">
          <audio
            ref={audioRef}
            loop
            preload="auto"
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          >
            <source src="Happy_birthday.mp3" type="audio/mpeg" />
            <source src="./birthday-music.ogg" type="audio/ogg" />
            Your browser does not support the audio element.
          </audio>
          <button
            onClick={toggleMusic}
            className={'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 font-poppins flex items-center gap-3 mx-auto text-lg hover-lift ' + (isPlaying ? 'playing animate-pulse' : '')}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            {isPlaying ? 'Pause Birthday Music' : 'Play Birthday Music'}
          </button>
        </div>

        {/* Candle Lighting */}
        <div className="text-center mb-12">
          <button
            onClick={lightCandle}
            className={'bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white px-8 py-4 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 font-poppins flex items-center gap-3 mx-auto text-lg hover-lift ' + (candleLit ? 'animate-glow' : '')}
          >
            <Candle size={24} className={candleLit ? 'animate-flicker' : ''} />
            {candleLit ? 'Candle is Lit! 🕯️' : 'Click to Light the Candle 🕯️'}
          </button>
        </div>

        {/* Photo Carousel */}
        <section className="mb-16 animate-fadeInUp">
          <h2 className="text-3xl lg:text-4xl font-great-vibes text-center text-purple-700 mb-10 text-gradient">
            Beautiful Memories 📸
          </h2>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative group overflow-hidden rounded-2xl shadow-2xl hover-lift">
                  <div className="h-72 bg-gradient-to-br from-pink-300 via-purple-300 to-yellow-300 flex items-center justify-center relative">
                    <span className="text-white text-xl font-poppins font-semibold z-10">Memory {i}</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-transparent to-pink-900/20"></div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end">
                    <div className="text-white p-6 font-poppins transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-lg font-semibold mb-2">Sweet Memory {i}</h3>
                      <p className="text-sm opacity-90">A beautiful moment captured in time 💖</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* From Harish Section */}
        <section className="mb-16 animate-fadeInLeft">
          <div className="max-w-4xl mx-auto">
            <div className="glass bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 lg:p-12 border-4 border-pink-200 hover-lift">
              <h3 className="text-3xl lg:text-4xl font-great-vibes text-purple-700 mb-8 text-center text-gradient">
                From Harish 💝
              </h3>
              <div className="text-gray-700 font-poppins leading-relaxed space-y-6 text-base lg:text-lg">
                <p className="font-great-vibes text-2xl text-purple-600">Dear Vedu,</p>
                <p>
                  Today marks another beautiful year of your incredible journey, and I couldn't be more grateful 
                  to witness your growth, your laughter, and your amazing spirit. You've brought so much joy 
                  and light into the lives of everyone around you, especially mine. ✨
                </p>
                <p>
                  As you step into this new chapter at 21, I want you to know that you're not just a friend 
                  to me – you're family. Your kindness, your infectious smile, and your ability to make 
                  even the ordinary moments feel magical never cease to amaze me. 🌟
                </p>
                <p>
                  May this year bring you endless adventures, dreams fulfilled, love that overflows, 
                  and all the happiness your beautiful heart can hold. You deserve nothing but the very best 
                  that life has to offer, and I'll always be here cheering you on! 🎉
                </p>
                <div className="text-right">
                  <p className="font-great-vibes text-2xl text-purple-600 mb-2">
                    With all my love and warmest wishes,
                  </p>
                  <p className="font-great-vibes text-xl text-pink-600">
                    Harish ❤️
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Floating Birthday Wishes */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-great-vibes text-purple-700 mb-8 text-gradient">
              Birthday Wishes 🌟
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: "🎈", message: "May your dreams soar as high as balloons in the sky!" },
                { icon: "🌟", message: "Shine bright like the star you are, today and always!" },
                { icon: "💖", message: "Sending you love, laughter, and endless happiness!" }
              ].map((wish, index) => (
                <div key={index} className="glass bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover-lift animate-float" style={{ animationDelay: (index * 0.5) + 's' }}>
                  <div className="text-4xl mb-4">{wish.icon}</div>
                  <p className="text-gray-700 font-poppins text-sm leading-relaxed">{wish.message}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="relative z-30 text-center py-8 glass bg-white/70 backdrop-blur-sm">
        <p className="text-purple-700 font-great-vibes text-xl lg:text-2xl text-gradient">
          Made with love by Harish 💖
        </p>
        <p className="text-purple-600 font-poppins text-sm mt-2 opacity-80">
          Celebrating friendship and beautiful moments ✨
        </p>
      </footer>
    </div>
  );
};

export default BirthdayApp;
