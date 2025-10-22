import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class LandingComponent implements OnInit {
  loadingProgress = 0;
  showContent = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.startLoadingAnimation();
  }

  private startLoadingAnimation() {
    const interval = setInterval(() => {
      this.loadingProgress += 5;
      if (this.loadingProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          this.showContent = true;
        }, 500);
      }
    }, 100);
  }

  navigateToAuth() {
    this.router.navigate(['/register']);
  }
}
