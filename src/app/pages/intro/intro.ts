import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface IntroStep {
  title: string;
  description: string;
  icon: string;
  animation: string;
  duration: number;
}

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro.html',
  styleUrls: ['./intro.css']
})
export class IntroComponent implements OnInit, OnDestroy {
  currentStep = 0;
  isCompleted = false;
  progress = 0;
  private timer: any;

  introSteps: IntroStep[] = [
    {
      title: 'Welcome to FBT AI',
      description: 'Your advanced artificial intelligence companion designed to understand and adapt to your unique personality',
      icon: '👋',
      animation: 'fadeIn',
      duration: 3000
    },
    {
      title: 'Multilingual Intelligence',
      description: 'Communicate naturally in both Arabic and English with seamless language understanding and cultural context',
      icon: '🌍',
      animation: 'slideInRight',
      duration: 4000
    },
    {
      title: 'Personality Analysis',
      description: 'Our AI learns your communication style, preferences, and personality to deliver personalized responses',
      icon: '🔍',
      animation: 'slideInLeft',
      duration: 4000
    },
    {
      title: 'Advanced Capabilities',
      description: 'Experience powerful features including sentiment analysis, contextual understanding, and intelligent conversations',
      icon: '🚀',
      animation: 'zoomIn',
      duration: 3500
    },
    {
      title: 'Ready to Begin',
      description: 'Your AI journey starts now. Get ready for an exceptional conversation experience tailored just for you',
      icon: '⭐',
      animation: 'pulse',
      duration: 3000
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.startIntroSequence();
  }

  ngOnDestroy() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  private startIntroSequence() {
    this.nextStep();
  }

  private nextStep() {
    if (this.currentStep < this.introSteps.length) {
      this.progress = 0;
      const step = this.introSteps[this.currentStep];

      const progressInterval = setInterval(() => {
        this.progress += 1;
        if (this.progress >= 100) {
          clearInterval(progressInterval);
        }
      }, step.duration / 100);

      this.timer = setTimeout(() => {
        this.currentStep++;
        if (this.currentStep < this.introSteps.length) {
          this.nextStep();
        } else {
          this.completeIntro();
        }
      }, step.duration);
    }
  }

  private completeIntro() {
    this.isCompleted = true;

    // Auto navigate to chat after 3 seconds
    setTimeout(() => {
      this.router.navigate(['/chat']);
    }, 3000);
  }

  skipIntro() {
    this.router.navigate(['/chat']);
  }

  get currentStepData(): IntroStep {
    return this.introSteps[this.currentStep];
  }

  get totalSteps(): number {
    return this.introSteps.length;
  }
}
