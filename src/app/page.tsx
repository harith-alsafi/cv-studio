'use client'
import { useEffect, useRef, useState } from 'react'
// import Layout from '@/components/layout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { useTheme } from 'next-themes'

// Define the geometric element types for TypeScript
type ShapeType = 0 | 1 | 2; // 0: hexagon, 1: diamond, 2: rounded rect

interface GeometricElementOptions {
  x?: number;
  y?: number;
  size?: number;
  velocityX?: number;
  velocityY?: number;
  shapeType?: ShapeType;
  depth?: number;
  blur?: number;
}

class GeometricElement {
  x: number;
  y: number;
  size: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  shapeType: ShapeType;
  colors: string[];
  colorTransition: number;
  colorTransitionSpeed: number;
  depth: number;
  blur: number;
  width?: number;
  height?: number;
  borderRadius?: number;
  sides?: number;

  constructor(options: GeometricElementOptions, canvasWidth: number, canvasHeight: number) {
    this.x = options.x || Math.random() * canvasWidth;
    this.y = options.y || Math.random() * canvasHeight;
    this.size = options.size || 50 + Math.random() * 100;
    this.velocityX = options.velocityX || (Math.random() - 0.5) * 0.15;
    this.velocityY = options.velocityY || (Math.random() - 0.5) * 0.15;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.005;
    
    // Shape type (0: hexagon, 1: diamond, 2: rounded rect)
    this.shapeType = options.shapeType !== undefined ? 
        options.shapeType : Math.floor(Math.random() * 3) as ShapeType;
    
    // Colors
    this.colors = [
        this.getRandomColor(),
        this.getRandomColor()
    ];
    
    // Color animation values
    this.colorTransition = Math.random();
    this.colorTransitionSpeed = 0.002 + Math.random() * 0.003;
    
    // Depth and blur effect
    this.depth = options.depth || 0.3 + Math.random() * 0.7;
    this.blur = options.blur || this.depth * 10;
    
    // Unique shape properties
    if (this.shapeType === 0) { // Hexagon
        this.sides = 6;
    } else if (this.shapeType === 1) { // Diamond
        this.sides = 4;
    } else { // Rounded rect
        this.width = this.size * (0.8 + Math.random() * 0.4);
        this.height = this.size * (0.5 + Math.random() * 0.3);
        this.borderRadius = this.size * 0.15;
    }
  }
  
  getRandomColor(): string {
    const colors = [
      // Modern palette
      '#4ECDC4', '#1A535C', '#3AAFA9', '#61A0AF', 
      '#7952B3', '#9C89B8', '#A28DC8', 
      '#FF6B6B', '#F67280', '#D16BA5',
      '#274472', '#5885AF', '#12263A'
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  update(canvasWidth: number, canvasHeight: number): void {
    // Move the element
    this.x += this.velocityX;
    this.y += this.velocityY;
    
    // Rotate
    this.rotation += this.rotationSpeed;
    
    // Bounce off edges with some padding
    const padding = this.size * 0.5;
    
    if (this.x - padding < 0 || this.x + padding > canvasWidth) {
      this.velocityX = -this.velocityX;
      // Add slight randomness on bounce
      this.velocityX *= 0.95 + Math.random() * 0.1;
    }
    
    if (this.y - padding < 0 || this.y + padding > canvasHeight) {
      this.velocityY = -this.velocityY;
      // Add slight randomness on bounce
      this.velocityY *= 0.95 + Math.random() * 0.1;
    }
    
    // Update color transition
    this.colorTransition += this.colorTransitionSpeed;
    if (this.colorTransition >= 1) {
      this.colorTransition = 0;
      // Get new target color
      this.colors.shift();
      this.colors.push(this.getRandomColor());
    }
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    // Apply blur based on depth
    ctx.filter = `blur(${this.blur}px)`;
    
    // Interpolate between two colors based on transition value
    const color = this.interpolateColor(this.colors[0], this.colors[1], this.colorTransition);
    
    // Set fill style with transparency based on depth
    ctx.fillStyle = color;
    ctx.globalAlpha = this.depth * 0.3; // More subtle opacity
    
    // Draw the shape based on shape type
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    if (this.shapeType === 0 && this.sides) { // Hexagon
      this.drawPolygon(ctx, 0, 0, this.size * 0.6, this.sides);
    } else if (this.shapeType === 1 && this.sides) { // Diamond
      this.drawPolygon(ctx, 0, 0, this.size * 0.7, this.sides, Math.PI / 4);
    } else if (this.width && this.height && this.borderRadius) { // Rounded rectangle
      this.drawRoundedRect(
        ctx,
        -this.width / 2, 
        -this.height / 2, 
        this.width, 
        this.height, 
        this.borderRadius
      );
    }
    
    // Add subtle gradient overlay
    const gradientSize = this.size * 1.1;
    const gradient = ctx.createLinearGradient(
      -gradientSize / 2, -gradientSize / 2,
      gradientSize / 2, gradientSize / 2
    );
    
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.5;
    
    if (this.shapeType === 0 && this.sides) { // Hexagon
      this.drawPolygon(ctx, 0, 0, this.size * 0.6, this.sides);
    } else if (this.shapeType === 1 && this.sides) { // Diamond
      this.drawPolygon(ctx, 0, 0, this.size * 0.7, this.sides, Math.PI / 4);
    } else if (this.width && this.height && this.borderRadius) { // Rounded rectangle
      this.drawRoundedRect(
        ctx,
        -this.width / 2, 
        -this.height / 2, 
        this.width, 
        this.height, 
        this.borderRadius
      );
    }
    
    ctx.restore();
  }
  
  // Helper function to draw a polygon
  drawPolygon(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, sides: number, startAngle = 0): void {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = startAngle + i * 2 * Math.PI / sides;
      const pointX = x + radius * Math.cos(angle);
      const pointY = y + radius * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }
    ctx.closePath();
    ctx.fill();
  }
  
  // Helper function to draw a rounded rectangle
  drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }
  
  // Helper function to interpolate between two colors
  interpolateColor(color1: string, color2: string, factor: number): string {
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
    
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elementsRef = useRef<GeometricElement[]>([]);
  const animationRef = useRef<number>(0);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Avoid hydration mismatch and ensure component is mounted
    setMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match window
    const resizeCanvas = () => {
      if (canvas) {
        // Set canvas dimensions to match the viewport exactly
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Apply a full clear with background color on resize
        ctx.fillStyle = mounted && resolvedTheme === 'light' ? '#FFFFFF' : '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        initElements();
      }
    };

    // Initialize elements
    const initElements = () => {
      if (!canvas) return;
      
      // Increase number of elements to better fill the screen
      const numElements = 18; // More elements for better coverage
      const elements: GeometricElement[] = [];
      
      // Create a mix of grid-positioned and fully random elements
      for (let i = 0; i < numElements; i++) {
        let x, y;
        
        if (i < 16) {
          // Grid-based positioning for first set of elements
          const gridX = i % 4;
          const gridY = Math.floor(i / 4);
          
          // Distribute across full width with emphasis on edges
          x = canvas.width * (0.05 + (gridX / 3) * 0.9) + (Math.random() - 0.5) * 100;
          y = canvas.height * (0.1 + (gridY / 4) * 0.8) + (Math.random() - 0.5) * 100;
        } else {
          // Completely random positioning for remaining elements
          // With bias toward right side of screen
          x = canvas.width * (0.5 + Math.random() * 0.45); // Right half bias
          y = Math.random() * canvas.height;
        }
        
        elements.push(new GeometricElement({
          x: x,
          y: y,
          size: 40 + Math.random() * 100,
          velocityX: (Math.random() - 0.5) * 0.25, // Slightly faster movement
          velocityY: (Math.random() - 0.5) * 0.25,
          shapeType: (i % 3) as ShapeType
        }, canvas.width, canvas.height));
      }
      
      elementsRef.current = elements;
    };

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;
      
      // Clear the canvas with a subtle fade effect
      // Using a more solid background color with slight transparency for trail effect
      ctx.fillStyle = mounted && resolvedTheme === 'light' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw elements
      elementsRef.current.forEach(element => {
        element.update(canvas.width, canvas.height);
        element.draw(ctx);
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Initialize and start animation
    resizeCanvas();
    animate();

    // Handle window resize
    window.addEventListener('resize', resizeCanvas);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [mounted, resolvedTheme]);

  // Don't render content until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className={`fixed inset-0 ${resolvedTheme === 'light' ? 'bg-white' : 'bg-black'} w-screen h-screen overflow-hidden`}></div>
      <canvas 
        ref={canvasRef} 
        className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-0"
      />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.20))] p-4">
        <div className={`${resolvedTheme === 'light' ? 'bg-white/60 border-gray-200 text-gray-900' : 'bg-black/60 border-white/10 text-white'} backdrop-blur-lg rounded-3xl p-8 md:p-12 max-w-3xl w-full border shadow-xl`}>
          <div className="flex justify-between items-center mb-8">
            <Image 
              src={resolvedTheme === "dark" ? "/images/logo-dark.png" : "/images/logo-light.png"} 
              alt="CV Studio Logo" 
              width={200} 
              height={80} 
              className="h-auto max-h-[80px] w-auto" 
            />
            <ThemeToggle />
          </div>
          
          <p className={`text-lg md:text-xl text-center mb-8 ${resolvedTheme === 'light' ? 'text-gray-700' : 'text-white/90'}`}>
            An AI-powered easy tool to custom tailor your resumes for any job posting. 
            Optimize your CV, highlight your strengths, and increase your chances of landing interviews 
            with our intelligent resume customization technology.
          </p>
          
          <div className="flex justify-center">
            <Link href="/templates">
              <Button 
                size="lg" 
                className={`${resolvedTheme === 'light' ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-100/50' : 'bg-white text-black hover:bg-gray-100 hover:shadow-white/20'} hover:translate-y-[-3px] transition-all px-8 py-6 text-lg rounded-full shadow-lg`}
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}