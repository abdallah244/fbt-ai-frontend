import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Message {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  sentiment?: string;
}

export interface ChatSession {
  _id: string;
  title: string;
  messages: Message[];
  summary: string;
  userPersonalityInsights: any;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  // جرب كل الخيارات علشان تتأكد من الاتصال
  private apiUrls = [
    'http://localhost:5000/api',
    'http://127.0.0.1:5000/api',
    'http://0.0.0.0:5000/api'
  ];

  private currentApiUrl = this.apiUrls[0];
  private isBackendAvailable = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.checkBackendAvailability();
  }

  // دالة للتحقق من وجود الـ backend
  private checkBackendAvailability() {
    this.http.get(`${this.currentApiUrl}/chat/health`, { timeout: 5000 })
      .pipe(
        catchError(() => of(null))
      )
      .subscribe({
        next: (response: any) => {
          if (response && response.status === 'success') {
            this.isBackendAvailable = true;
            console.log('✅ Backend is available at:', this.currentApiUrl);
          } else {
            this.tryNextApiUrl();
          }
        },
        error: () => {
          this.tryNextApiUrl();
        }
      });
  }

  private tryNextApiUrl() {
    const currentIndex = this.apiUrls.indexOf(this.currentApiUrl);
    if (currentIndex < this.apiUrls.length - 1) {
      this.currentApiUrl = this.apiUrls[currentIndex + 1];
      console.log('🔄 Trying alternative API URL:', this.currentApiUrl);
      this.checkBackendAvailability();
    } else {
      this.isBackendAvailable = false;
      console.warn('❌ Backend is not available. Using local mode.');
    }
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // دالة مساعدة للـ HTTP requests مع fallback
  private httpRequest<T>(method: string, url: string, body?: any): Observable<T> {
    if (!this.isBackendAvailable) {
      // إذا الـ backend مش شغال، رجع observable فاضي
      return of(null as T);
    }

    const options = {
      headers: this.getHeaders(),
      body: body
    };

    return this.http.request<T>(method, `${this.currentApiUrl}${url}`, options)
      .pipe(
        catchError((error) => {
          console.error(`HTTP ${method} error for ${url}:`, error);
          this.isBackendAvailable = false;
          return of(null as T);
        })
      );
  }

  getChatSessions(): Observable<{status: string, data: ChatSession[]}> {
    return this.httpRequest<{status: string, data: ChatSession[]}>('GET', '/chat/sessions')
      .pipe(
        map(response => {
          if (!response) {
            // إذا الـ backend مش شغال، رجع array فاضي
            return { status: 'success', data: [] };
          }
          return response;
        })
      );
  }

  createChatSession(title?: string): Observable<{status: string, data: ChatSession}> {
    return this.httpRequest<{status: string, data: ChatSession}>('POST', '/chat/sessions', { title })
      .pipe(
        map(response => {
          if (!response) {
            // إذا الـ backend مش شغال، اعمل session محلي
            const localSession: ChatSession = {
              _id: 'local-' + Date.now(),
              title: title || 'New Conversation',
              messages: [],
              summary: '',
              userPersonalityInsights: {},
              createdAt: new Date(),
              updatedAt: new Date()
            };
            return { status: 'success', data: localSession };
          }
          return response;
        })
      );
  }

  getChatSession(id: string): Observable<{status: string, data: ChatSession}> {
    return this.httpRequest<{status: string, data: ChatSession}>('GET', `/chat/sessions/${id}`)
      .pipe(
        map(response => {
          if (!response) {
            // إذا الـ backend مش شغال، رجع null
            return { status: 'success', data: null as any };
          }
          return response;
        })
      );
  }

  addMessage(sessionId: string, message: Message): Observable<{status: string, data: ChatSession}> {
    return this.httpRequest<{status: string, data: ChatSession}>('POST', `/chat/sessions/${sessionId}/messages`, message)
      .pipe(
        map(response => {
          if (!response) {
            // إذا الـ backend مش شغال، رجع session مع الرسالة المضاف
            const updatedSession: ChatSession = {
              _id: sessionId,
              title: 'Local Session',
              messages: [message],
              summary: '',
              userPersonalityInsights: {},
              createdAt: new Date(),
              updatedAt: new Date()
            };
            return { status: 'success', data: updatedSession };
          }
          return response;
        })
      );
  }

  deleteSession(sessionId: string): Observable<{status: string, message: string}> {
    return this.httpRequest<{status: string, message: string}>('DELETE', `/chat/sessions/${sessionId}`)
      .pipe(
        map(response => {
          if (!response) {
            return { status: 'success', message: 'Session deleted locally' };
          }
          return response;
        })
      );
  }

  clearMessages(sessionId: string): Observable<{status: string, data: ChatSession}> {
    return this.httpRequest<{status: string, data: ChatSession}>('DELETE', `/chat/sessions/${sessionId}/messages`)
      .pipe(
        map(response => {
          if (!response) {
            const clearedSession: ChatSession = {
              _id: sessionId,
              title: 'Local Session',
              messages: [],
              summary: '',
              userPersonalityInsights: {},
              createdAt: new Date(),
              updatedAt: new Date()
            };
            return { status: 'success', data: clearedSession };
          }
          return response;
        })
      );
  }

  // دالة للتحقق من حالة الـ backend
  checkHealth(): Observable<boolean> {
    return this.http.get(`${this.currentApiUrl}/chat/health`, { timeout: 3000 })
      .pipe(
        map((response: any) => response && response.status === 'success'),
        catchError(() => of(false))
      );
  }

  // جلب الـ API URL الحالي
  getCurrentApiUrl(): string {
    return this.currentApiUrl;
  }

  // معرفة إذا الـ backend شغال ولا لا
  isBackendConnected(): boolean {
    return this.isBackendAvailable;
  }
}
